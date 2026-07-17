<!-- Illustrative example -- delete when starting real work. -->

# Rename a Symbol Across the Repo -- Playbook

A unit-tier runbook for renaming one symbol (a function, class, constant,
or type) consistently across the codebase. It operates on a single symbol
the caller has already chosen; enumerating which symbols need renaming is
not this playbook's job.

## How to run

- **Genre:** runbook.
- **Run by:** a human or AI working top to bottom with the repo mounted and
  the target symbol already chosen. Branch-free -- no baseline or diff needed.
- **Output:** a changed set of files where the old name is fully replaced by
  the new one. Edits are applied with the human's confirmation.
- **Permissions:** edits with confirmation. Read-only search to find call
  sites. The AI never runs builds or tests.
- **After the run (you, manually):** run `tsc` and `eslint` over the touched
  area and the unit tests for the touched modules, then report the result. Run
  the `check:doc-chars` check only if documentation changed.

Follows the shared Guardrails in [`AGENTS.md`](./AGENTS.md) (no builds/tests by
the AI, read-only git, refactor over shims, host edits via Edit/Write).

## Find the work

The caller names the one symbol to rename and its new name. To locate every
occurrence, search the repo for the exact old name (a whole-word match avoids
substring hits), including declarations, imports/exports, and string
references. This grep is for convenience only; it assumes the symbol was
already chosen.

## Steps

1. **Confirm the rename.** Restate the old name, the new name, and the symbol
   kind (function / class / constant / type). Check the new name is not already
   taken elsewhere in the same scope.
2. **Enumerate occurrences.** Search for the old name across the repo. Sort the
   hits into declaration, imports/exports, call sites, and incidental string
   or comment mentions -- the last group is reviewed case by case, not renamed
   blindly.
3. **Rename the declaration and its true references** together, so no
   intermediate state leaves a dangling name. Reshape directly; do not leave a
   re-exported alias of the old name as a shim.
4. **Update imports and exports** in every file that referenced the symbol,
   keeping import ordering and grouping as the file already has them.
5. **Review incidental mentions** (comments, log strings, doc text) and update
   the ones that name the symbol; leave unrelated coincidental text alone.
6. **Re-search for the old name** to confirm zero remaining occurrences except
   the ones deliberately left (documented in the summary).

## Verify (you, manually)

Per the Guardrails, the AI does not run builds or tests. After the edits are
confirmed:

- `tsc` and `eslint` over the touched area.
- The unit tests for the touched modules.
- The `check:doc-chars` check only if documentation changed.

## Related documentation

- [`AGENTS.md`](./AGENTS.md) -- the shared playbook contract and canonical
  Guardrails.
- Repo-root [`AGENTS.md`](../../AGENTS.md) -- code style and comment style.
