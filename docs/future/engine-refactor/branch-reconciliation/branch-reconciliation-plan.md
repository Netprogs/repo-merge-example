# Branch Reconciliation -- keeping `refactor` current with `main`

The pre-merge map for reconciling this refactor branch against the mainline. Regenerated
each run by the sweep; every run is recorded in the delta log below. The recurring how-to
is [`docs/playbooks/branch-reconciliation-prompt.md`](../../../playbooks/branch-reconciliation-prompt.md).

## What this is (plain language)

`main` is the mainline and never stops changing. This branch has moved, split, and reshaped
code. We keep it current by MERGING `main` in on a cadence -- we do not copy files; the merge
does that. The merge handles almost everything on its own. The only trouble is where `main`
changed a file this branch has since moved, split, or reshaped. This map flags exactly those
spots before the merge runs.

## Inputs

- OLD ref: `origin/main`
- NEW ref: `refactor` (HEAD)
- Scope: whole repo
- Integration: `git merge -X find-renames=30% origin/main`
- Baseline: the merge-base, recomputed each run

## Standing decisions

- We MERGE `main` in; we do not copy files.
- Three things the merge cannot do for itself, which this map flags: confirm a change landed
  at a moved path; hand-port a change into a file the branch split logic into; re-express a
  change against a reshaped data shape.
- Resolve by intent, never by greening the bar. When a test fails after the merge, decide
  whether the test or the code holds the correct intent before changing either.
- Update THIS file each run: refresh the map, then append a delta-log entry.

## Map (latest run)

Awaiting the first recorded run. Run `npm run reconcile`, then record the buckets, the
predicted conflicts, and the resolutions here.

## Delta log

One entry per reconcile. None recorded yet.
