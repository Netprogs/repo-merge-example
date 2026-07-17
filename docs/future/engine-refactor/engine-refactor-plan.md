# Engine Refactor -- Plan

Long-lived refactor branch (`refactor`) that reshapes the example service. It is kept
current against the moving mainline (`main`) by a recurring reconciliation -- see the
tracker in [`branch-reconciliation/branch-reconciliation-plan.md`](./branch-reconciliation/branch-reconciliation-plan.md).

## Motivation

The service grew a few shapes worth tidying: auth handling sat at the top level, the signup
handler did too much, a preferences field carried a needless wrapper, two request types had
drifted into duplicates, and the store could be built without a reference it needs. This
branch reshapes all of that in one sustained effort -- which is exactly why it cannot land in
small pieces, so it runs as a long-lived branch and reconciles against `main` on a cadence.

## Changes

| Change | Status |
| --- | --- |
| Move `auth/login` into `modules/auth/` | In progress 2026-07-16 |
| Split the welcome-email dispatch out of `signup` into its own module | In progress 2026-07-16 |
| Flatten the `Profile.preferences` wrapper to a plain array | In progress 2026-07-16 |
| Retire `SignupRequest` in favour of `Credentials` | In progress 2026-07-16 |
| Require a reference (a clock) when building the store | In progress 2026-07-16 |

## Keeping current

`main` keeps shipping while this branch is in flight. Rather than let the branch rot, we merge
`main` in on a cadence and reconcile the collisions. The recurring how-to is
[`docs/playbooks/branch-reconciliation-prompt.md`](../../playbooks/branch-reconciliation-prompt.md);
the running map and per-run history live in the reconciliation tracker beside this plan.
