# Branch Reconciliation Sweep -- Prompt

A recurring sweep that keeps a long-lived refactor branch current against a
moving mainline. Given an OLD ref (the mainline) and the NEW ref (your branch),
it enumerates every diverged file, classifies each by the migration pattern it
matches, risk-orders them, and dispatches each to the unit playbook that owns it.
This is the PLANNING layer above the per-file unit playbooks -- it answers "what
diverged and in what order", not "how to convert one thing". Run it first; then
run the real `git merge` by hand and resolve the predicted conflicts.

## How to run

- **Genre:** AI-actuated prompt.
- **Run by:** paste the "Prompt to issue" block into a fresh AI session with the
  repo mounted; know the OLD ref (mainline), the NEW ref (usually `HEAD`), and an
  optional scope path.
- **Output:** a divergence inventory + risk-ordered dispatch plan in chat
  (file -> pattern -> unit playbook -> risk), plus an "unknown" bucket. No files
  written by the AI.
- **Permissions:** read-only. The sweep proposes a plan and edits nothing;
  read-only git only.
- **After the run (you, manually):** clean the tree, run the merge, capture the
  result, and hand it back for resolution (see "Merge procedure").

Shared contract and canonical Guardrails live in [`AGENTS.md`](./AGENTS.md).
Because this prompt is pasted standalone, it repeats its guardrails inline; that
inline copy must match AGENTS.md.

---

## Prompt to issue

> # TASK: Branch reconciliation sweep (mainline -> branch)
>
> Compare an OLD ref (the mainline) against the NEW branch and produce a dispatch
> plan: every diverged file, the migration pattern it matches, the unit playbook
> that owns it, and the order to tackle them. You are PLANNING, not editing. Do
> not modify any files. Do not paste raw diff bodies into chat -- extract
> programmatically and render only the inventory.
>
> ## Inputs
>
> - **OLD ref** -- the mainline (e.g. `origin/main`).
> - **NEW ref** -- your refactor branch (usually `HEAD`).
> - **Scope** -- a path that bounds the sweep, or whole-repo. Prefer whole-repo:
>   a narrowed scope hides both-touched collisions in root config, CI, and docs
>   that a real merge conflicts on anyway.
>
> Derive the baseline from the MERGE-BASE, recomputed this run -- never diff
> against the mainline tip. The mainline flows INTO the branch on every reconcile,
> so a two-dot diff against the mainline shows changes present on both sides
> (false divergence). Anchor on the merge-base, the branch's own history, or a
> sha the human names.
>
> ## Method
>
> 1. **Enumerate.** Use the harness (`npm run reconcile`) or, equivalently,
>    `git diff --name-status -M0.3 <base>..<NEW>` for your side and
>    `git diff --name-status <NEW>..<OLD>` for the mainline's net-new. Work from
>    file names and `--stat` sizes. Never render the diff body.
> 2. **Bucket.** only-mine (your refactor surface, context only) / only-old (clean
>    bring-forward) / both-touched (same path both sides) / move-conflict (mainline
>    edited a path you renamed away -- the scariest bucket).
> 3. **Classify.** For each both-touched or move-conflict file, grep its content or
>    diff for the signature of a known migration pattern and tag it. Replace the
>    list below with YOUR project's patterns and unit playbooks, e.g.:
>    - reshaped data shape -> `<reshape-removal-playbook.md>`
>    - one construct converted to another (mixin -> delegate, etc.) ->
>      `<construct-migration-playbook.md>`
>    - cross-file contract drift -> `<contract-comparison-prompt.md>`
> 4. **Predict conflicts.** For each both-touched file, run a READ-ONLY three-way
>    simulation (`git merge-file --diff3` against the merge-base) to decide whether
>    it will actually conflict or auto-merge on disjoint hunks. Produce an exact
>    predicted conflict set.
> 5. **Order.** Shared / engine files first (changes there reduce downstream work),
>    leaf consumers last. Within a pattern, respect that unit playbook's risk order.
> 6. **Bucket unknowns.** Files matching no known pattern go in a "needs human
>    triage" list with a one-line guess each. If one unknown shape recurs across
>    many files, flag it as a candidate for a NEW unit playbook.
>
> ## Output format
>
> Discuss in chat. Use this structure:
>
> 1. Scope line: OLD ref, NEW ref, merge-base used, path, file count.
> 2. Bucket counts: only-mine / only-old / both-touched / move-conflict.
> 3. Predicted conflict set: the exact files that will conflict, risk-ordered,
>    each with a one-line resolution note (`File | Pattern | Unit playbook | Risk`).
> 4. Unknown bucket: unmatched files with a one-line guess each.
> 5. Coverage summary: files dispatched vs unknown.
>
> Do not create or modify files. Do not paste raw diff bodies. If the file list is
> large, extract paths with the harness or bash and summarize.
>
> ## Guardrails
>
> - Read-only. Propose a plan; edit nothing.
> - Read-only git only (`diff`, `log`, `show`, `merge-base`, `merge-file`); no
>   mutating git, no `merge`.
> - No `tsc`, linters, tests, or build commands -- the human runs those.
> - Extract programmatically; never dump raw diffs into chat.
> - If a sandbox returns corrupted git state, do not retry in the sandbox or touch
>   `.git/`; hand the human a plain git command to run and report back.
> - After a merge, a red test is a QUESTION, not a chore. Work out whether the TEST or
>   the CODE holds the correct intent -- read why the mainline wrote the test and why the
>   branch changed the code -- before you change either. Never green a test just to clear
>   the board; never bend code to satisfy a stale test the refactor deliberately changed.

---

## Merge procedure (run after the map -- human-run)

The sweep never runs git. Once the map is current:

1. Clean the tree -- commit or stash any in-flight work.
2. Merge the mainline into the branch, with rename detection so most moves are
   followed automatically:

   ```
   git merge -X find-renames=30% origin/main
   ```

3. Capture the merge result for the resolving session to read:

   ```
   git status > .reconcile-out/merge-status.txt
   ```

   Hand `merge-status.txt` back to the session. It reads the Unmerged paths and
   resolves each conflict per the map, editing files directly -- it does not run
   the merge or any git. After resolving, run the compiler, linters, and tests by
   hand, then record the run in the plan's delta log.

## The ladder of oracles (why a clean merge is not a done merge)

Run all four, every time -- each catches a failure the one below is blind to:

1. **The merge** (`-X find-renames=30%`) -- follows moves; the ones it can't
   follow fail loudly as conflicts.
2. **The three-way simulation** (`git merge-file --diff3`) -- predicts the exact
   conflict set before you commit.
3. **The compiler** -- semantic breaks a textually clean merge hides.
4. **The tests** -- runtime contracts between features that pass text AND types,
   and break only when the code runs.

When a test goes red after the merge, decide which side is wrong from INTENT, not from
whatever makes the bar green: patching a stale-but-correct test discards a real fix, and
bending code to satisfy a stale test reverts an intentional change.

## Related documentation

- [`AGENTS.md`](./AGENTS.md) -- the shared contract and canonical Guardrails.
- The unit playbooks this sweep dispatches to (project-specific; author a new one
  via your playbook-authoring guide when an unknown pattern recurs).
