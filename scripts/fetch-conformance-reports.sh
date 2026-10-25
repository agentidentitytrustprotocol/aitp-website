#!/usr/bin/env bash
set -euo pipefail

# Pull each implementation's conformance report into data/conformance/.
#
# For every row of data/conformance/implementations.json, take the newest
# successful `ci.yml` run on main that uploaded the named artifact, and copy
# the report file out of it unchanged. The run's URL goes into sources.json,
# since a report's own provenance.ci_run_url is optional. A row with no such
# run keeps the report it already has, so a quiet repo never loses its row.
#
# Needs `gh` and `jq`, with GH_TOKEN set in CI.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA="$REPO_ROOT/data/conformance"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

sources='{}'
[ -f "$DATA/sources.json" ] && sources="$(cat "$DATA/sources.json")"

while IFS=$'\t' read -r id repo artifact file; do
  found=""
  for run in $(gh run list -R "$repo" --workflow ci.yml --branch main --event push \
                 --status success --limit 20 --json databaseId -q '.[].databaseId'); do
    if gh run download "$run" -R "$repo" -n "$artifact" -D "$TMP/$id" >/dev/null 2>&1 \
       && [ -f "$TMP/$id/$file" ]; then
      found="$run"
      break
    fi
    rm -rf "${TMP:?}/$id"
  done
  if [ -z "$found" ]; then
    echo "$id: no successful main run with artifact '$artifact'; keeping the current report"
    continue
  fi
  cp "$TMP/$id/$file" "$DATA/$id.json"
  url="https://github.com/$repo/actions/runs/$found"
  sources="$(jq --arg id "$id" --arg url "$url" '.[$id] = {ci_run_url: $url}' <<<"$sources")"
  echo "$id: $url"
done < <(jq -r '.[] | [.id, .repository, .artifact, .file] | @tsv' "$DATA/implementations.json")

jq -S . <<<"$sources" > "$DATA/sources.json"
