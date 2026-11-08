#!/usr/bin/env bash
#
# Push the website's production configuration from Doppler into Vercel.
#
#   deploy/doppler-sync.sh            # dry run: key names and their state, nothing changes
#   deploy/doppler-sync.sh --apply    # set the changed keys in Vercel Production, then rebuild it
#
# Doppler (project aitp-website, config prd) is the source of truth for the
# keys listed in deploy/doppler-keys.txt, and only those, in the Vercel
# project zer07labs/aitp-website, Production environment. The script adds and
# updates them; it never removes a Vercel variable, never touches a key
# outside the list, and never reads or writes Preview or Development: a
# managed key's entry targets production only, and an entry shared with
# another environment is refused. Preview must never hold admin keys or
# passwords. An empty list is valid: "0 managed keys", exit 0.
#
# Values move only on pipes (Doppler -> jq -> curl stdin) and are never
# printed or written to disk; the Vercel token goes to curl as a header file,
# never on argv. Vercel holds no Doppler token. Refused outright: platform
# names (RAILWAY_*, VERCEL_*), malformed or duplicate names, and Railway
# reference values ("${{ ... }}"). Any failed read stops the run before a
# write (fail closed). A changed key is updated in place by its Production
# entry id; a new key is created Production-only and never upserted, so a
# Preview entry with the same name is never merged into. Production is
# rebuilt only when a value actually changed, and only after a re-read shows
# every key in sync.
#
# Needs bash, git, jq, curl and the doppler and vercel CLIs, logged in.
# Refuses to run on a dirty working tree, so what runs is what is committed.
set -euo pipefail

VERCEL_TEAM=zer07labs
VERCEL_TEAM_ID=team_hCHZb89wQ6E3IV3p9Lafq5Sp
VERCEL_PROJECT=aitp-website
VERCEL_PROJECT_ID=prj_m2ykYr63yjznyaufFyMSYgSCqayd
DOPPLER_PROJECT=aitp-website
DOPPLER_CONFIG=prd
VERCEL_API=https://api.vercel.com

mode=dry-run
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) mode=dry-run ;;
    --apply) mode=apply ;;
    -h|--help) sed -n '2,25p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

say() { printf '%s\n' "$*" >&2; }
die() { say "doppler-sync: $*"; exit 1; }

for c in git jq curl doppler vercel; do
  command -v "$c" >/dev/null || die "needs $c on PATH"
done
repo="$(git rev-parse --show-toplevel)"
[ -z "$(git -C "$repo" status --porcelain)" ] || die "working tree is dirty; commit or stash first"

keys_file="$repo/deploy/doppler-keys.txt"
[ -f "$keys_file" ] || die "missing $keys_file"
keys="$(sed -e 's/#.*//' -e 's/[[:space:]]//g' "$keys_file" | grep -v '^$' || true)"
say "Doppler $DOPPLER_PROJECT/$DOPPLER_CONFIG -> Vercel $VERCEL_TEAM/$VERCEL_PROJECT (production):"
if [ -z "$keys" ]; then
  say "  0 managed keys (deploy/doppler-keys.txt lists none); nothing to do"
  exit 0
fi

bad=""
while read -r k; do
  case "$k" in
    RAILWAY_*|VERCEL_*) bad="$bad $k(platform-reserved)" ;;
    *) [[ "$k" =~ ^[A-Z_][A-Z0-9_]*$ ]] || bad="$bad $k(malformed)" ;;
  esac
done <<<"$keys"
dups="$(sort <<<"$keys" | uniq -d | tr '\n' ' ')"
[ -z "$dups" ] || bad="$bad ${dups% }(duplicate)"
[ -z "$bad" ] || die "refusing deploy/doppler-keys.txt:$bad"
say "  $(wc -l <<<"$keys" | tr -d ' ') managed key(s)"

doppler me >/dev/null 2>&1 || die "doppler is not logged in (doppler login)"
vercel whoami >/dev/null 2>&1 || die "vercel is not logged in (vercel login)"

# Resolved once, in this shell, so a missing token stops the run here.
vercel_token=""
if [ -n "${VERCEL_TOKEN:-}" ]; then
  vercel_token="$VERCEL_TOKEN"
else
  for f in "$HOME/Library/Application Support/com.vercel.cli/auth.json" \
    "${XDG_DATA_HOME:-$HOME/.local/share}/com.vercel.cli/auth.json"; do
    if [ -f "$f" ]; then vercel_token="$(jq -r '.token // empty' "$f")" || vercel_token=""; break; fi
  done
fi
[ -n "$vercel_token" ] || die "no Vercel token (set VERCEL_TOKEN or run vercel login)"
# The token reaches curl as a header file (printf is a builtin, so it is on
# no process's argv). Extra curl arguments pass through, e.g. a body on stdin.
vercel_api() {
  local path="$1"; shift
  curl -fsS "$@" "$VERCEL_API$path" -H @<(printf 'Authorization: Bearer %s\n' "$vercel_token")
}

# The Production entries as {KEY: {id, value, type, shared}}: the list
# endpoint returns encrypted values, so each entry is read back decrypted by
# id. shared is true when the entry also targets Preview or Development.
# Every read must succeed; any failure returns non-zero (fail closed).
vercel_vars() {
  local entries
  entries="$(vercel_api "/v9/projects/$VERCEL_PROJECT_ID/env?teamId=$VERCEL_TEAM_ID" |
    jq -ce '[.envs[] | select((.target // []) | index("production")) | select(.gitBranch == null)
             | {id, key, type, shared: ((.target | length) > 1)}]')" || return 1
  {
    for id in $(printf '%s' "$entries" | jq -r '.[] | select(.type != "sensitive") | .id'); do
      vercel_api "/v1/projects/$VERCEL_PROJECT_ID/env/$id?teamId=$VERCEL_TEAM_ID" |
        jq -ce '{id, value}' || exit 1
    done
  } | jq -sce --argjson e "$entries" '
    (map({(.id): .value}) | add // {}) as $v |
    $e | map({(.key): {id, value: $v[.id], type, shared}}) | add // {}'
}
doppler_vars() {
  doppler secrets download --no-file --format json --project "$DOPPLER_PROJECT" --config "$DOPPLER_CONFIG"
}

# One line per key: "<KEY> <state> [<production entry id>]". Both sides are
# read into shell variables first, so a failed read stops the run instead of
# looking like "no entry"; values reach jq only through printf pipes, never
# argv, here-strings or disk.
plan() {
  local d v
  d="$(doppler_vars)" || die "reading Doppler $DOPPLER_PROJECT/$DOPPLER_CONFIG failed; nothing changed"
  v="$(vercel_vars)" || die "reading Vercel environment variables failed; nothing changed"
  printf '%s' "$d" | jq -e 'type == "object"' >/dev/null || die "unexpected Doppler response; nothing changed"
  printf '%s' "$v" | jq -e 'type == "object"' >/dev/null || die "unexpected Vercel response; nothing changed"
  jq -nr --slurpfile d <(printf '%s' "$d") --slurpfile v <(printf '%s' "$v") --arg keys "$keys" '
    $d[0] as $d | $v[0] as $v |
    $keys | split("\n")[] | . as $k |
    if ($d | has($k) | not) then "\($k) missing-in-doppler"
    elif ($d[$k] | tostring | contains("${{")) then "\($k) reference-value"
    elif ($v | has($k) | not) then "\($k) new"
    elif $v[$k].type == "sensitive" then "\($k) sensitive-unreadable"
    elif $v[$k].shared then "\($k) shared-with-other-environments"
    elif $v[$k].value == $d[$k] then "\($k) unchanged"
    else "\($k) changed \($v[$k].id)" end'
}

result="$(plan)"
while read -r k state; do say "  $k: $state"; done <<<"$result"
grep -q ' missing-in-doppler$' <<<"$result" && die "listed keys are missing from Doppler; nothing changed"
grep -q ' reference-value$' <<<"$result" && die "Railway reference values do not belong in Vercel; nothing changed"
grep -q ' shared-with-other-environments$' <<<"$result" && die "split those entries per environment in Vercel first; nothing changed"
grep -q ' sensitive-unreadable$' <<<"$result" && die "sensitive Vercel variables cannot be compared; verify them by behaviour; nothing changed"
todo="$(awk '$2 == "changed" || $2 == "new" {print $1, $2, $3}' <<<"$result")"

if [ -z "$todo" ]; then say "in sync; nothing to do"; exit 0; fi
if [ "$mode" = dry-run ]; then say "dry run: $(wc -l <<<"$todo" | tr -d ' ') key(s) would change; --apply to push"; exit 0; fi

while read -r k state id; do
  say "setting $k ($state)"
  if [ "$state" = new ]; then
    # Create, never upsert: if any entry already overlaps Production, Vercel
    # refuses and the run stops rather than merging into it.
    doppler_vars |
      jq -ce --arg k "$k" '{key: $k, value: .[$k], type: "encrypted", target: ["production"]}' |
      vercel_api "/v10/projects/$VERCEL_PROJECT_ID/env?teamId=$VERCEL_TEAM_ID" \
        -X POST -H 'Content-Type: application/json' --data-binary @- >/dev/null ||
      die "creating $k in Vercel failed"
  else
    # Update exactly the Production-only entry the plan compared.
    doppler_vars |
      jq -ce --arg k "$k" '{value: .[$k]}' |
      vercel_api "/v9/projects/$VERCEL_PROJECT_ID/env/$id?teamId=$VERCEL_TEAM_ID" \
        -X PATCH -H 'Content-Type: application/json' --data-binary @- >/dev/null ||
      die "updating $k in Vercel failed"
  fi
done <<<"$todo"

after="$(plan)"
if grep -qv ' unchanged$' <<<"$after"; then
  while read -r k state; do say "  $k: $state"; done <<<"$after"
  die "Vercel does not match Doppler after --apply; not redeploying"
fi
latest="$(vercel_api "/v6/deployments?projectId=$VERCEL_PROJECT_ID&teamId=$VERCEL_TEAM_ID&target=production&state=READY&limit=1" |
  jq -r '.deployments[0].uid // empty')" || die "listing production deployments failed; variables are set, rebuild production to apply them"
[ -n "$latest" ] || die "variables match Doppler, but no production deployment to rebuild; deploy to apply them"
say "variables match Doppler; rebuilding production ($latest) so build-time values take effect"
vercel redeploy "$latest" --target production --scope "$VERCEL_TEAM" >/dev/null ||
  die "vercel redeploy $latest failed; variables are set, rebuild production to apply them"
say "done: production rebuilt from $latest"
