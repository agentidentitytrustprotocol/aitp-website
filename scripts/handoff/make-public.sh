#!/usr/bin/env bash
set -euo pipefail

# Make agentidentitytrustprotocol/aitp-website public (WEBP.2).
#
#   make-public.sh [--dry-run]   scan only (the default); changes nothing
#   make-public.sh --apply       scan, and flip to public only if it is clean
#   make-public.sh --rollback    set the repo back to private
#
# The scan is gitleaks over a fresh mirror clone, so it covers every ref
# GitHub would expose, including pull-request heads (refs/pull/*), not only
# the branches of a local checkout. It also lists the Vercel project's
# environment variables and the repo's Actions secrets by name, never value.
#
# Visibility is a one-way door in practice: forks and caches outlive a
# rollback. Run --apply only on a clean scan.

REPO=agentidentitytrustprotocol/aitp-website
HOMEPAGE=https://agentidentitytrustprotocol.io
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mode="${1:---dry-run}"

case "$mode" in
  --rollback)
    gh repo edit "$REPO" --visibility private --accept-visibility-change-consequences
    echo "$REPO is private again. Forks and caches made while it was public persist."
    exit 0 ;;
  --dry-run|--apply) ;;
  *) echo "usage: $0 [--dry-run|--apply|--rollback]" >&2; exit 2 ;;
esac

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "== gitleaks: full history, every ref (mirror clone)"
git clone -q --mirror "https://github.com/$REPO.git" "$tmp/mirror.git"
echo "refs: $(git -C "$tmp/mirror.git" for-each-ref | wc -l | tr -d ' ')"
clean=true
gitleaks git --log-opts=--all --redact --no-banner \
  --config "$ROOT/.gitleaks.toml" "$tmp/mirror.git" || clean=false

echo "== Vercel environment variables (names only)"
vercel api "/v10/projects/aitp-website/env" --scope zer07labs 2>/dev/null \
  | jq -r '.envs[]? | "\(.key)\t\(.type)\t\(.target | join(","))"' || echo "(could not list)"

echo "== Actions secrets (names only)"
gh secret list -R "$REPO" || true

if [ "$clean" != true ]; then
  echo "gitleaks found leaks. Remediate (rotate, then rewrite history) before going public." >&2
  exit 1
fi
echo "Scan clean."

if [ "$mode" = --apply ]; then
  gh repo edit "$REPO" --visibility public --accept-visibility-change-consequences --homepage "$HOMEPAGE"
  gh repo view "$REPO" --json visibility,homepageUrl
fi
