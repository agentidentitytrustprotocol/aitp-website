# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (also runs fumadocs-mdx codegen)
npm run lint         # ESLint
npm run typecheck    # TypeScript check (tsc --noEmit)

npx fumadocs-mdx     # Regenerate .source/ directory (codegen for content)

./scripts/sync-content.sh            # Sync content from all sibling AITP repos
./scripts/sync-content.sh /path/spec # Override the spec repo path (arg 1)
```

## Architecture

Public documentation website for the Agent Identity & Trust Protocol (AITP),
built with **Next.js 15 (App Router)**, **Fumadocs**, and **Tailwind CSS 4**.

### Content pipeline

Content originates in 5 source repos (siblings under `../`) and flows through:

1. **`scripts/sync-content.sh`** — copies `.md` files from each source repo,
   converts to `.mdx`, injects frontmatter, and rewrites `.md` links to route
   paths. Source repos resolve as a CI checkout (`<name>-repo/`) or a sibling
   (`../<name>`). Uses a `sedi` wrapper for macOS/Linux portability.
2. **`scripts/escape-mdx.py`** — a code-aware escaper invoked by the sync
   script. It skips fenced code blocks and inline code spans, and in prose
   escapes placeholder tags (`<identifier>`), numeric comparisons (`<43`), and
   bare `{`/`}`. On table rows it escapes `|` inside code spans to `\|` (GFM
   would otherwise treat the pipe as a column delimiter and break the span).
3. **`source.config.ts`** — defines 8 `defineDocs()` collections.
4. **`npx fumadocs-mdx`** (or `next build`) — generates `.source/index.ts`.
5. **`lib/source.ts`** — creates 8 `loader()` instances. Uses the `resolveFiles()`
   workaround + `MdxPageData` cast (fumadocs-mdx returns `files` as a function
   but `loader()` expects an array; `body`/`toc` exist at runtime but not in the
   `PageData` type).

### Eight content sections

| Route | Source repo | Content dir | Notes |
|-------|------------|-------------|-------|
| `/docs/*` | `agentidentitytrustprotocol` `docs/` | `content/docs/` | |
| `/spec/*` | `agentidentitytrustprotocol` `rfcs/` | `content/spec/` | `RFC-AITP-*` → clean slugs |
| `/registry/*` | `agentidentitytrustprotocol` `registries/` | `content/registry/` | |
| `/implementation/*` | `aitp-rs` | `content/implementation/` | Rust reference impl |
| `/sdks/*` | `aitp-rs` `docs/sdk-*.md` | `content/sdks/{python,node}/` | bindings |
| `/control-plane/*` | `aitp-control-plane` | `content/control-plane/` | |
| `/playground/*` | `aitp-playground` | `content/playground/` | |
| `/console/*` | `aitp-ui-console` | `content/console/` | **noindex** — not in sitemap |

Each section has `app/<section>/layout.tsx` (`DocsShell`) and
`[[...slug]]/page.tsx`. The console layout sets `robots: { index: false }`.

### Sidebar ordering

Each `content/<section>/` has a `meta.json` (object form: `{ "title", "pages" }`,
ending with `"..."` to append unlisted pages). These are committed and survive a
sync — the sync script only writes `.mdx` files.

### Landing, community, and walkthrough

`/`, `/community`, and `/e2e-flow` are standalone custom pages — they do **not**
use Fumadocs `DocsLayout`. Shared nav in `lib/nav-links.tsx`; the landing
sections live in `components/` (`hero`, `protocol-diagram`, `feature-cards`,
`ecosystem-section`, `run-section`, `navbar`, `footer`, `logo`).

### SEO

- `app/sitemap.ts` — dynamic from 7 sources (console excluded).
- `app/robots.ts` — allows all crawlers.
- `app/page.tsx` — JSON-LD (WebSite, SoftwareSourceCode, Organization).
- The console section is `noindex`.

## Related repositories

All under `../` (siblings), GitHub org `agentidentitytrustprotocol`:
- **`agentidentitytrustprotocol`** — spec: RFCs, docs, registries, schemas
- **`aitp-rs`** — Rust reference implementation + Python/Node bindings
- **`aitp-control-plane`** — registry, audit, revocation, webhook service
- **`aitp-playground`** — Python FastAPI scenario harness
- **`aitp-ui-console`** — Next.js monitoring/control console (separate deploy)
- **`aitp-website`** — this repo
