# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (also runs fumadocs-mdx codegen)
npm run lint         # ESLint
npm run typecheck    # TypeScript check (tsc --noEmit)
npm run check-links  # Fail on any internal link with no page to land on

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
   converts to `.mdx`, and injects frontmatter. Source repos resolve as a CI
   checkout (`<name>-repo/`) or a sibling (`../<name>`). As it generates each
   page it records the page's origin (repo + path) in a manifest for step 3.
2. **`scripts/escape-mdx.py`** — a code-aware escaper invoked by the sync
   script. It skips fenced code blocks and inline code spans, and in prose
   escapes placeholder tags (`<identifier>`), numeric comparisons (`<43`), and
   bare `{`/`}`. On table rows it escapes `|` inside code spans to `\|` (GFM
   would otherwise treat the pipe as a column delimiter and break the span).
3. **`scripts/rewrite-links.py`** — resolves every relative link against the
   *origin* of the page it appears in (the repo and path it was copied from,
   recorded in a manifest the sync script builds as it generates pages).
   Targets that are themselves synced become site routes; everything else
   becomes a canonical GitHub URL. Origin-awareness is what makes both cases
   correct — textually, `docs/sdk-python.md` (a page, at `/sdks/python`) and
   `docs/design/foo.md` (not synced) are indistinguishable.
   `npm run check-links` guards the result in CI.
4. **`source.config.ts`** — defines 8 `defineDocs()` collections.
5. **`npx fumadocs-mdx`** (or `next build`) — generates `.source/index.ts`.
6. **`lib/source.ts`** — creates 8 `loader()` instances. Uses the `resolveFiles()`
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
