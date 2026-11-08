# CI cost

One-time CI-cost pass, 2026-11-07. Measured with `gh api` over the 30 days to
2026-11-07 (workflow runs and job timings). The repository is **public**, so
GitHub-hosted standard runners are free: billed cost was **$0** and stays $0.
The "private-equivalent" minutes below show what the same usage would cost
if the repository were private (per-job, rounded up to the minute).

## Baseline (30 days to 2026-11-07)

| Workflow | Runs | Executed | Avg job | Private-equivalent |
|----------|-----:|---------:|--------:|-------------------:|
| CI (`ci.yml`, job `build`) | 217 | 143 (90 PR, 53 push to `main`) | 73 s | ≈ 286 min (2 min/run) |
| Sync Docs (`sync-docs.yml`) | 307 | 307 (193 `repository_dispatch`, 105 schedule, 9 manual) | 55 s | ≈ 307 min (1 min/run) |
| auto-merge | 164 | job skipped on all but Dependabot PRs | — | ≈ 0 (skipped jobs bill nothing) |

- 74 CI and 74 auto-merge runs ended `action_required`. All were on
  `automated/sync-docs`, all on or before 2026-10-25 (the GITHUB_TOKEN-authored
  era before #61). They never executed, cost nothing, and have not recurred.
- Runners: every job is already on `ubuntu-latest`, the smallest standard
  runner. No change.
- No merge queue (classic branch protection, required check `build`,
  strict), and a single-language site, so a `merge_group.base_sha` path
  filter does not apply.

## Changes

1. **`ci.yml` — cancel superseded PR runs.** Concurrency group per workflow and
   PR (or ref), `cancel-in-progress` only for `pull_request`. A run on `main` is
   never cancelled mid-run; pushes queued behind it collapse to the newest.
2. **`sync-docs.yml` — one sync at a time.** Group `sync-docs`, no
   cancel-in-progress. A dispatch burst collapses to one running and one pending
   run (GitHub replaces an older pending run), and two runs can no longer race
   to update `automated/sync-docs`.

Kept deliberately:
- **Push-to-`main` CI.** It is not a duplicate of the strict PR run: two checks
  compare against state outside the repo (source-repo READMEs, live Discussion
  dates), and the push run for #114 (`74d099c`) caught drift its PR run had
  passed.
- The required `build` check, and no path filter on it: a filtered-out
  required check would sit pending, not fail closed.

## Before / after (estimate)

The saving is small, and stated honestly:

- CI: in the window only 1 of 90 PR runs was superseded by a newer push while
  still running. Expected saving ≈ 1 run/month (≈ 2 private-equivalent min).
- Sync Docs: 19 of 307 runs overlapped another sync. Queueing collapses most of
  a burst into the one pending run, saving up to ≈ 19 runs/month (≈ 19
  private-equivalent min, ≈ 6%). The main value is correctness: no concurrent
  updates of `automated/sync-docs`.
- Billed: $0 before, $0 after.

Not changed here: Sync Docs failures in the window (50 on 2026-10-25, 2 on
10-27, 8 on 11-01) were content/sync failures, not a cost issue.
