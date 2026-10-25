#!/usr/bin/env bash
set -euo pipefail

# Sync Markdown docs from every AITP source repo into content/ as MDX.
#
# Usage:
#   ./scripts/sync-content.sh [SPEC_DIR]
#
# Source repos are resolved as either a CI checkout (`<name>-repo/` inside this
# repo) or a sibling directory (`../<name>`). SPEC_DIR overrides the spec repo.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SIBLINGS="$(cd "$REPO_ROOT/.." && pwd)"
CONTENT_DIR="$REPO_ROOT/content"
ESCAPER="$SCRIPT_DIR/escape-mdx.py"
LINKER="$SCRIPT_DIR/rewrite-links.py"
SCHEMAS="$SCRIPT_DIR/sync-schemas.py"
# Records "<target mdx>\t<source repo>\t<path within that repo>" for every
# generated page, so the link pass can resolve relative links from the origin.
MANIFEST="$(mktemp)"
trap 'rm -f "$MANIFEST"' EXIT

# Resolve a source repo: CI checkout (<name>-repo) first, then sibling (../<name>).
resolve_repo() {
  local name="$1"
  if [ -d "$REPO_ROOT/${name}-repo" ]; then
    echo "$REPO_ROOT/${name}-repo"
  else
    echo "$SIBLINGS/$name"
  fi
}

SPEC_DIR="${1:-$(resolve_repo agentidentitytrustprotocol)}"
RS_DIR="$(resolve_repo aitp-rs)"
CP_DIR="$(resolve_repo aitp-control-plane)"
PG_DIR="$(resolve_repo aitp-playground)"
UI_DIR="$(resolve_repo aitp-ui-console)"

if [ ! -d "$SPEC_DIR" ]; then
  echo "Error: spec directory not found at $SPEC_DIR" >&2
  exit 1
fi

echo "Spec:           $SPEC_DIR"
echo "Implementation: $RS_DIR"
echo "Control plane:  $CP_DIR"
echo "Playground:     $PG_DIR"
echo "Console:        $UI_DIR"
echo "Content out:    $CONTENT_DIR"

# titlecase a slug ("multi-hop_delegation" -> "Multi Hop Delegation")
titlecase() {
  echo "$1" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1'
}

# gen_mdx SRC TARGET [DESC] [TITLE]
# Writes TARGET as MDX: copies as-is if SRC already has frontmatter, otherwise
# derives a title (explicit > first '# ' heading > filename) and strips the
# leading heading from the body.
gen_mdx() {
  local src="$1" target="$2" desc="${3:-}" title="${4:-}"
  mkdir -p "$(dirname "$target")"
  if [ -n "${SRC_REPO:-}" ]; then
    printf '%s\t%s\t%s\n' "$target" "$SRC_REPO" "${src#"$SRC_ROOT"/}" >> "$MANIFEST"
  fi
  if head -1 "$src" | grep -q '^---'; then
    cp "$src" "$target"
    return
  fi
  if [ -z "$title" ]; then
    title=$(grep -m1 '^# ' "$src" | sed 's/^# //' || true)
  fi
  if [ -z "$title" ]; then
    title=$(titlecase "$(basename "$target" .mdx)")
  fi
  {
    printf -- '---\ntitle: "%s"\n' "$title"
    [ -n "$desc" ] && printf 'description: "%s"\n' "$desc"
    printf -- '---\n\n'
    sed '1{/^# /d;}' "$src"
  } > "$target"
}

lc() { echo "$1" | tr '[:upper:]' '[:lower:]'; }

# ─── docs/ → content/docs/ ───────────────────────────────────────────────
echo ""; echo "Syncing docs..."
SRC_REPO="agentidentitytrustprotocol"; SRC_ROOT="$SPEC_DIR"
for file in "$SPEC_DIR"/docs/*.md; do
  [ -f "$file" ] || continue
  base=$(lc "$(basename "$file" .md)")
  gen_mdx "$file" "$CONTENT_DIR/docs/$base.mdx"
done

# ─── rfcs/ → content/spec/ ───────────────────────────────────────────────
echo "Syncing RFCs..."
SRC_REPO="agentidentitytrustprotocol"; SRC_ROOT="$SPEC_DIR"
for file in "$SPEC_DIR"/rfcs/RFC-AITP-*.md; do
  [ -f "$file" ] || continue
  base=$(basename "$file" .md)                        # RFC-AITP-0005-tct
  clean=$(echo "$base" | sed 's/RFC-AITP-[0-9]*-//')  # tct
  rfc_num=$(echo "$base" | grep -o 'RFC-AITP-[0-9]*')
  title=$(grep -m1 '^# ' "$file" | sed 's/^# //' || true)
  [ -z "$title" ] && title="$rfc_num: $(titlecase "$clean")"
  gen_mdx "$file" "$CONTENT_DIR/spec/$clean.mdx" "$rfc_num" "$title"
done
[ -f "$SPEC_DIR/rfcs/README.md" ] && \
  gen_mdx "$SPEC_DIR/rfcs/README.md" "$CONTENT_DIR/spec/index.mdx" "AITP RFC specifications" "Specification"

# ─── registries/ → content/registry/ ─────────────────────────────────────
echo "Syncing registries..."
SRC_REPO="agentidentitytrustprotocol"; SRC_ROOT="$SPEC_DIR"
for file in "$SPEC_DIR"/registries/*.md; do
  [ -f "$file" ] || continue
  base=$(lc "$(basename "$file" .md)")
  [ "$base" = "readme" ] && base="index"
  gen_mdx "$file" "$CONTENT_DIR/registry/$base.mdx"
done

# ─── schemas/json/ → public/schema/v0.3/ (pinned, see data/schema-pin.json) ─
echo "Syncing schemas..."
python3 "$SCHEMAS" "$SPEC_DIR"

# ─── spec release tags → data/spec-tags.json (hero version badge) ────────
# From the remote, so a shallow CI checkout with no tags still sees them all.
echo "Recording spec tags..."
git -C "$SPEC_DIR" ls-remote --tags --refs origin 'v*' \
  | sed 's|.*refs/tags/||' | LC_ALL=C sort \
  | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().split(), indent=2))' \
  > "$REPO_ROOT/data/spec-tags.json"

# ─── README code blocks → data/quickstart/ (see data/quickstart/blocks.json) ─
echo "Syncing quickstart blocks..."
python3 "$SCRIPT_DIR/sync-quickstart.py"

# ─── aitp-rs → content/implementation/ ───────────────────────────────────
if [ -d "$RS_DIR" ]; then
  echo "Syncing implementation (aitp-rs)..."
  SRC_REPO="aitp-rs"; SRC_ROOT="$RS_DIR"
  [ -f "$RS_DIR/README.md" ] && \
    gen_mdx "$RS_DIR/README.md" "$CONTENT_DIR/implementation/index.mdx" \
      "Rust reference implementation of the Agent Identity & Trust Protocol"
  for file in "$RS_DIR"/docs/*.md; do
    [ -f "$file" ] || continue
    base=$(lc "$(basename "$file" .md)")
    case "$base" in
      readme) continue ;;                 # root README is the index
      sdk-python|sdk-node) continue ;;    # SDK docs go to content/sdks/
    esac
    gen_mdx "$file" "$CONTENT_DIR/implementation/$base.mdx"
  done
  # design notes (docs/design/*.md) → implementation/design/
  for file in "$RS_DIR"/docs/design/*.md; do
    [ -f "$file" ] || continue
    base=$(lc "$(basename "$file" .md)")
    [ "$base" = "readme" ] && base="index"
    gen_mdx "$file" "$CONTENT_DIR/implementation/design/$base.mdx"
  done
else
  echo "Skipping implementation (not found at $RS_DIR)"
fi

# ─── SDK docs (from aitp-rs) → content/sdks/<lang>/ ──────────────────────
echo "Syncing SDK docs..."
SRC_REPO="aitp-rs"; SRC_ROOT="$RS_DIR"
mkdir -p "$CONTENT_DIR/sdks"
cat > "$CONTENT_DIR/sdks/index.mdx" <<'EOF'
---
title: "SDKs"
description: "Language bindings for the AITP reference implementation"
---

The Agent Identity & Trust Protocol ships first-party language bindings built
on top of the Rust [reference implementation](/implementation). Each binding
exposes the same envelope signing, manifest, and handshake primitives.

- [**Python SDK**](/sdks/python) — `aitp-py`, built with maturin.
- [**Node.js SDK**](/sdks/node) — `aitp-node`, built with napi-rs.
EOF
if [ -d "$RS_DIR" ]; then
  [ -f "$RS_DIR/docs/sdk-python.md" ] && \
    gen_mdx "$RS_DIR/docs/sdk-python.md" "$CONTENT_DIR/sdks/python/index.mdx" \
      "Python SDK for the AITP reference implementation"
  [ -f "$RS_DIR/docs/sdk-node.md" ] && \
    gen_mdx "$RS_DIR/docs/sdk-node.md" "$CONTENT_DIR/sdks/node/index.mdx" \
      "Node.js SDK for the AITP reference implementation"
fi

# ─── aitp-control-plane → content/control-plane/ ─────────────────────────
if [ -d "$CP_DIR" ]; then
  echo "Syncing control plane..."
  SRC_REPO="aitp-control-plane"; SRC_ROOT="$CP_DIR"
  [ -f "$CP_DIR/README.md" ] && \
    gen_mdx "$CP_DIR/README.md" "$CONTENT_DIR/control-plane/index.mdx" \
      "Registry, audit log, revocation, and webhook fan-out service for AITP"
  for file in "$CP_DIR"/docs/*.md; do
    [ -f "$file" ] || continue
    base=$(lc "$(basename "$file" .md)")
    [ "$base" = "readme" ] && continue
    gen_mdx "$file" "$CONTENT_DIR/control-plane/$base.mdx"
  done
else
  echo "Skipping control plane (not found at $CP_DIR)"
fi

# ─── aitp-playground → content/playground/ ───────────────────────────────
if [ -d "$PG_DIR" ]; then
  echo "Syncing playground..."
  SRC_REPO="aitp-playground"; SRC_ROOT="$PG_DIR"
  [ -f "$PG_DIR/README.md" ] && \
    gen_mdx "$PG_DIR/README.md" "$CONTENT_DIR/playground/index.mdx" \
      "Run AITP scenario demonstrations end-to-end with real LLM-powered agents"
  for file in "$PG_DIR"/docs/*.md; do
    [ -f "$file" ] || continue
    base=$(lc "$(basename "$file" .md)")
    [ "$base" = "readme" ] && continue
    gen_mdx "$file" "$CONTENT_DIR/playground/$base.mdx"
  done
else
  echo "Skipping playground (not found at $PG_DIR)"
fi

# ─── aitp-ui-console → content/console/ (noindex) ────────────────────────
if [ -d "$UI_DIR" ]; then
  echo "Syncing console..."
  SRC_REPO="aitp-ui-console"; SRC_ROOT="$UI_DIR"
  [ -f "$UI_DIR/README.md" ] && \
    gen_mdx "$UI_DIR/README.md" "$CONTENT_DIR/console/index.mdx" \
      "Monitoring and control console for the AITP ecosystem"
  for file in "$UI_DIR"/docs/*.md; do
    [ -f "$file" ] || continue
    base=$(lc "$(basename "$file" .md)")
    [ "$base" = "readme" ] && continue
    gen_mdx "$file" "$CONTENT_DIR/console/$base.mdx"
  done
else
  echo "Skipping console (not found at $UI_DIR)"
fi

# ─── Escape MDX-hostile angle brackets (code-aware) ──────────────────────
echo "Escaping bare tags for MDX..."
while IFS= read -r -d '' file; do
  python3 "$ESCAPER" < "$file" > "$file.tmp" && mv "$file.tmp" "$file"
done < <(find "$CONTENT_DIR" -name '*.mdx' -type f -print0)

# ─── Rewrite links to route paths / canonical GitHub URLs ────────────────
# Runs after every page exists, so the pass can tell a link to another synced
# page from a link to a file that only lives in the source repo.
echo "Rewriting links..."
python3 "$LINKER" "$CONTENT_DIR" "$MANIFEST"

echo ""
echo "Content sync complete."
for s in docs spec registry implementation sdks control-plane playground console; do
  n=$(find "$CONTENT_DIR/$s" -name '*.mdx' 2>/dev/null | wc -l | tr -d ' ')
  printf '  %-15s %s files\n' "$s:" "$n"
done
