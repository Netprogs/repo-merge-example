<!-- Illustrative example -- delete when starting real work. -->

# Find Duplicated Helper Functions -- Prompt

A self-contained, paste-ready prompt for a FRESH AI session. It scans the
repo for near-duplicate helper functions and reports them. Read-only analysis:
it discusses findings, it does not change code.

## How to run

- **Genre:** AI-actuated prompt.
- **Run by:** paste the block below into a fresh AI session with the repo
  mounted on the branch you want scanned.
- **Output:** a chat report listing candidate duplicate helpers. No edits.
- **Permissions:** read-only.
- **After the run (you, manually):** nothing to build -- a read-only pass
  changes no code. Choose which duplicates to consolidate as a separate step.

## The prompt

> You are scanning a mounted repository for DUPLICATED helper functions. This
> is a read-only analysis -- report findings only, do not change any code.
>
> Guardrails (this prompt carries its own copy):
> - Edits: none. This is a read-only pass. Do not apply edits.
> - Builds and tests: never run `tsc`, `eslint`, unit tests, or any build
>   command. The human runs them and reports the result.
> - Git: read-only git (`git diff`, `git log`, `git show`) is fine. Never run
>   mutating git without confirmation.
> - Host files: reads only. Do not write to mounted host files from the shell.
> - Docs: any report text is ASCII-only.
>
> Task:
> 1. Find utility/helper functions (small, stateless, reusable) across the
>    repo's helper and util modules.
> 2. Group them into candidate duplicate sets -- functions with near-identical
>    bodies or the same behaviour under different names.
> 3. For each set, report the function names, their file:line locations, and a
>    one-line note on how they differ (if at all).
> 4. Suggest, for each set, which single shared shape would replace it -- but
>    do NOT force sharing that would couple otherwise unrelated code.
> 5. Report only MATERIAL duplication. If you find none, say so plainly rather
>    than padding the list.

## Verify (you, manually)

A read-only pass changes no code and needs no build. If you later consolidate
any of the reported duplicates, that is a separate editing task with its own
review and its own build/test run.

## Related documentation

- [`AGENTS.md`](./AGENTS.md) -- the shared playbook contract and canonical
  Guardrails.
