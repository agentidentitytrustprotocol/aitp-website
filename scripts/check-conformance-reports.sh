#!/usr/bin/env bash
set -euo pipefail

# Run the spec's report checker on every committed conformance report, at the
# spec commit the report names (spec docs/conformance-badge.md, badge rule 2).
# It recomputes totals and every gate from results, and checks the fixture
# digest and metadata against schemas/conformance/ at that commit.
#
# Usage: check-conformance-reports.sh SPEC_DIR   (a clone of the spec repo)

SPEC="$1"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

for report in "$REPO_ROOT"/data/conformance/*.json; do
  case "$(basename "$report")" in implementations.json|sources.json) continue ;; esac
  commit="$(jq -r .spec.commit "$report")"
  dir="$TMP/$commit"
  if [ ! -d "$dir" ]; then
    git -C "$SPEC" cat-file -e "$commit^{commit}" 2>/dev/null \
      || git -C "$SPEC" fetch -q --filter=blob:none origin "$commit"
    mkdir -p "$dir"
    git -C "$SPEC" archive "$commit" schemas/conformance scripts/check-conformance-report.py | tar -x -C "$dir"
  fi
  echo "$(basename "$report") (spec ${commit:0:7}):"
  python3 "$dir/scripts/check-conformance-report.py" "$report" --fixtures-dir "$dir/schemas/conformance"
done
