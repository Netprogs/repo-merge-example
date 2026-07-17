# Branch Reconciliation Example

A runnable example of keeping a long-lived refactor branch current against a moving
mainline -- the "merging volatile branches" workflow. You clone it, run the read-only
sweep to get a map of what the merge will get wrong, then run the merge and resolve the
few real problems with an AI agent, checking each step against a ladder of oracles.

It ships three branches:

- **`main`** -- the mainline. It kept shipping while the refactor was in flight.
- **`refactor`** (default) -- the long-lived refactor branch: code moved, split, reshaped,
  and retyped. This is the branch you reconcile.
- **`refactor-merged`** -- the answer key: `refactor` with `main` merged in and every
  conflict and semantic break resolved (`tsc` and tests green). Peek only after you try.

The whole divergence is reproducible: `tools/build-example.js` builds all three branches
from one base commit (see "How this repo was built").

## What you need

- **Node 18+** and **git**.
- An AI tool that loads a rules file (this repo ships `.cursorrules` and `CLAUDE.md`), or
  paste the init prompt yourself.

## Quick start

```
git clone <this-repo> reconcile-demo
cd reconcile-demo            # you are on `refactor`, the branch to reconcile
npm install                  # dev-deps only (typescript, eslint)
```

Confirm the branch builds before you start:

```
npm run build                # tsc
```

## 1. Prime an agent, then run the sweep

Paste `docs/playbooks/session-init-prompt.md` into a fresh AI session, then the sweep
prompt in `docs/playbooks/branch-reconciliation-prompt.md`. The sweep is **read-only** --
it never runs the merge. It produces a map of the divergence. The harness does the
enumeration:

```
npm run reconcile            # OLD=origin/main, NEW=HEAD (refactor), whole repo
```

Expected buckets:

```
only-old (clean bring-forward):        4    email/welcome.ts, admin/reset.ts, store.test.ts, signup/signup.test.ts
both-touched (same path both sides):   3    server.ts, signup/signup.ts, profile.ts
move-conflicts (renamed away on NEW):  1    auth/login.ts  ->  modules/auth/login.ts
only-mine (your refactor surface):     4    modules/auth/login.ts, types.ts, store.ts, signup/welcome-dispatch.ts
reshape candidates:                    3    (raw hits -- all tooling/docs noise; see note)
```

The three shapes a merge can't handle for itself, all present here:

- **moved** -- `auth/login.ts` moved to `modules/auth/login.ts` (the move-conflict bucket).
  `main` also edited the old path; confirm its change follows the move.
- **split** -- the welcome-email dispatch was pulled out of `signup.ts` into
  `signup/welcome-dispatch.ts`. `main` fixed a bug in `signup.ts`; that fix has to be
  hand-ported into the new file.
- **reshaped** -- `Profile.preferences` was flattened from `{ value: { data } }` to a
  plain array. `main` also touched `profile.ts`, so its change must be re-expressed.

Note on **reshape candidates**: the harness flags the flatten signature still present on
the branch. Here the app is already flattened, so every raw hit is a non-app file that just
mentions the pattern (the harness's own regex, the builder, and this README) -- 0 real app
targets. Filtering raw signature hits down to real targets is the point; the reshape's
actual merge impact is the `profile.ts` conflict above.

## 2. Run the merge

The sweep predicted exactly two textual conflicts: `signup/signup.ts` and `profile.ts`.
Run the merge yourself (the agent never runs git). On a fresh clone `main` exists as the
remote-tracking ref `origin/main`, so merge that:

```
git merge -X find-renames=30% origin/main
```

It leaves exactly those two conflicts. `server.ts` auto-merges (disjoint hunks), and the
`auth/login.ts` move is auto-followed onto `modules/auth/login.ts` carrying `main`'s edit.

## 3. Resolve the conflicts (agent-guided)

Hand the merge result to the agent to resolve per the map:

- **`profile.ts` (reshape)** -- combine both sides: keep the flat shape and `main`'s
  defensive copy: `return profile ? [...profile.preferences] : [];`.
- **`signup/signup.ts` (split)** -- take the refactor's delegating shape. Then port
  `main`'s fix into `signup/welcome-dispatch.ts`: send only for a new user
  (`if (isNew) { sendWelcomeEmail(email); }`). The conflict is in `signup.ts`, but the fix
  belongs in the file the logic moved to.

## 4. Run the ladder of oracles

A clean textual merge is not a done merge. Run all of it -- each rung catches what the one
below cannot (the agent does not run these; you do):

```
npm run build     # tsc
npm test          # tsc, then node --test
```

- **The compiler (rung 3)** fails first: `admin/reset.ts` imports `SignupRequest`, a type
  the refactor retired in favor of `Credentials`. A textually clean merge, a real break.
  Fix: rename the import to `Credentials`.
- **The tests (rung 4)** then fail in two ways that demand **opposite** fixes -- and
  deciding which is the real skill:
  - `buildStore seeds users` throws: the merged builder now requires a `clock` at runtime
    (optional in the type, so it compiled). The guard is intentional, so the stale test is
    what is wrong -- **fix the test** (pass a clock).
  - `a repeat signup ... sends no second welcome` fails: if the split was resolved without
    porting `main`'s fix, `welcome-dispatch` still sends unconditionally. The test is right
    -- **fix the code**.

**Never green a test just to clear the board.** A red test after a merge is a question,
not a chore: work out whether the test or the code holds the correct intent -- read why the
mainline wrote the test and why the branch changed the code -- before you change either.

## 5. Check your work

Diff your resolved tree against the answer key:

```
git diff origin/refactor-merged
```

A clean (or explained) diff means you reconciled it correctly. `refactor-merged` builds and
tests green.

## Point it at your own branch

Copy `docs/scripts/reconcile-branch.js` and `docs/playbooks/branch-reconciliation-prompt.md`
into your repo, wire `npm run reconcile`, and change the RESHAPE signature at the top of the
harness to whatever data shape your own refactor is flattening. The buckets, the ladder, and
the fix-test-vs-fix-code discipline carry over unchanged.

## How this repo was built

`tools/build-example.js` builds the whole thing from one base commit: it commits the base
app, branches `main` and `refactor`, applies the mainline and refactor changes, then builds
`refactor-merged` by running the merge and resolving it. Run it on a fresh repo to
regenerate the history:

```
node tools/build-example.js
```

## Further reading

Part of the "Beyond Vibe Coding" series on agentic engineering:

- [Beyond Vibe Coding: Embracing Agentic Engineering for Sustainable AI Development](https://medium.com/@netprogsdev/beyond-vibe-coding-embracing-agentic-engineering-for-sustainable-ai-development-04d164bf4443)
- [Beyond Vibe Coding: Using AGENTS.md to Build a File System That Enforces Code Discipline on AI](https://medium.com/@netprogsdev/beyond-vibe-coding-using-agents-md-to-build-a-file-system-that-enforces-code-discipline-on-ai-bf55a843d340)
- [Beyond Vibe Coding: A Production-Ready AI Guardrail System You Can Clone Today](https://medium.com/@netprogsdev/beyond-vibe-coding-a-production-ready-ai-guardrail-system-you-can-clone-today-f15c68f737c2)
- [Beyond Vibe Coding: Handing an LLM a Legacy Module](https://medium.com/@netprogsdev/beyond-vibe-coding-handing-an-llm-a-legacy-module-a9fdd8f5586b)
- [Beyond Vibe Coding: Merging Volatile Branches](https://medium.com/@netprogsdev/beyond-vibe-coding-merging-volatile-branches-f3936d6c7f58)
