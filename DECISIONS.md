# Decisions

Durable calls about how this repo is built, operated and deployed, newest
last. Each entry: the decision, why, and what would change it.

## 2026-11-07 — Doppler is the source of truth for Vercel deployment variables

- **Decision:** Doppler project `aitp-website` (configs `dev`, `dev_personal`,
  `stg`, `prd`) owns the site's deployment variables. `deploy/doppler-sync.sh`
  pushes only the keys listed in `deploy/doppler-keys.txt` from `prd` into the
  Vercel project `zer07labs/aitp-website`, **Production only**. The list is empty
  today: the site reads no variables, and Vercel had none in any environment.
- **Preview split:** the script never reads or writes Preview or Development,
  refuses a Production entry shared with them, and Preview must never hold admin
  keys or passwords. Preview deployments sit behind Vercel authentication.
- **Writes go through the Vercel REST API, not `vercel env`:** this checkout is
  not `vercel link`ed, and the API lets a changed key be updated by its exact
  Production entry id (`PATCH`) and a new key be created without upsert, so a
  same-named Preview entry is never merged into. Values move only on pipes; the
  token reaches curl as a header file, never on argv.
- **Fails closed:** any failed read (Doppler or Vercel) stops the run before a
  write. This fixes a fail-open path in the acdp-website #75 script this one was
  ported from (a failed Vercel read looked like "no entry").
- **Revisit when:** the site needs a variable in Preview (add a separate,
  Preview-only list fed from Doppler `stg`, never from `prd`).
