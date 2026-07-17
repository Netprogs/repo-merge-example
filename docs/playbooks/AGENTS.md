### docs/playbooks/ -- recurring operational prompts and runbooks

Reusable prompts and step-by-step runbooks for tasks that are run
RECURRINGLY against the codebase but are NOT a one-time workstream.
Examples: a sync-check prompt run periodically between this repo and
a sibling repo, a release-readiness checklist, a deploy-time runbook.

This file is the SOURCE OF TRUTH for the shared playbook contract. Every
playbook in this folder opens with a "How to run" header, references the
Guardrails below, and ends with a manual follow-up step -- so "run the X
playbook" behaves the same way regardless of which one it is. The genre-
specific body sits between those shared bookends.

---

### Genres

A playbook is one of two genres. The genre sets the filename suffix and the
title suffix, and it determines the How-to-run header's `Run by` / `Output` /
`Permissions` fields.

- **Runbook** (`<topic>-playbook.md`, title `... -- Playbook`). A human or AI
  works it top to bottom with the target code open alongside. Output is a
  changed file or area. Edits are applied with the human's confirmation.
  Examples: [`example-playbook.md`](./example-playbook.md),
  [`code-review-playbook.md`](./code-review-playbook.md).
- **AI-actuated prompt** (`<topic>-prompt.md`, title `... -- Prompt`). A
  self-contained blockquoted prompt pasted into a FRESH AI session. The
  session does the analysis and either discusses the result or applies edits
  behind a single batch approval gate. Because it is pasted standalone, a
  prompt repeats the Guardrails inline (the canonical copy still lives here;
  the inline copy must match). Example:
  [`example-prompt.md`](./example-prompt.md).

A meta-guide that teaches how to author a genre is neither, and keeps a
descriptive name (for example a migration-authoring guide) rather than a
genre suffix.

---

### Tiers: unit vs branch-sweep

Playbooks also sit at one of two altitudes:

- **Unit tier.** Operates on one file, mixin/abstract pair, or symbol. Answers
  "how do I convert this one thing correctly". Most playbooks are here --
  [`example-playbook.md`](./example-playbook.md) and
  [`code-review-playbook.md`](./code-review-playbook.md) are worked unit-tier
  examples.
- **Branch-sweep tier.** Operates on a whole old-vs-new branch divergence.
  Answers "what diverged, in what order, and which unit playbook owns each".
  It enumerates and dispatches; it does not itself convert. A branch-sweep
  prompt is run first, then its dispatch list is worked with the unit
  playbooks.

Branch-level enumeration and ordering is the sweep's job, NOT a unit playbook's.
A unit playbook may carry a "find the work" grep for convenience, but it assumes
the caller already chose the file/pair to work.

---

### The playbook contract

**How-to-run header.** Every playbook opens with a header answering the same
five fields, so the run experience is predictable:

- **Genre** -- runbook | AI-actuated prompt.
- **Run by** -- human reading along | paste into a fresh AI session (state
  what must be mounted and which branch is checked out).
- **Output** -- chat discussion | edits applied behind one approval gate | a
  migrated file or area.
- **Permissions** -- read-only | edits with confirmation | edits behind one
  batch gate.
- **After the run (you, manually)** -- which of tsc / eslint / the `check:doc-chars` check
  / unit tests to run and report, per the Guardrails.

**Section order.** After the header: a genre-specific body, then a Verify /
manual-follow-up close, then Related documentation. Runbooks additionally
carry Find-the-work, the step-by-step body, and a Checklist. Old/new migration
runbooks also carry a Comparing-old-vs-new (git) section; see the Git
comparison guidance below for that genre's method.

---

### Guardrails (canonical)

These are the workspace rules as they apply to running a playbook. Reference
this section from a runbook; repeat it inline in a prompt (a pasted prompt must
carry its own guardrails) and keep the inline copy matching this text.

- **Edits.** A runbook applies edits only with the human's confirmation. A
  prompt applies edits only behind a single batch approval gate. No edits
  otherwise.
- **Builds and tests.** Never run `tsc`, `eslint`, unit tests, or any build
  command. The human runs them and reports the result.
- **Git.** Read-only git (`git diff`, `git log`, `git show`) is fine and
  expected. Never run mutating git (`commit`, `add`, `checkout`, `reset`,
  `merge`, `rebase`, `stash`, `mv`) without confirmation.
- **Refactor over shims.** Do not scaffold transitional wrappers or parallel
  code paths that exist only to be reverted. Reshape directly, or flag the
  reshape for the human.
- **Code comments.** No phase / step / plan markers in code comments.
- **Docs.** Documentation is ASCII-only (see below). Request
  the `check:doc-chars` check from the maintainer; do not run it yourself.
- **Host files.** Edit host files only via the Edit / Write tools. Bash or
  Python writes from the shell sandbox can corrupt mounted host files; reads
  are fine.

---

### Git comparison (canonical)

For playbooks that compare an "old" state against a "new" one (old/new
migrations, mixin-into-abstract resyncs, repo-to-repo sync checks):

- Read-only git only (see Guardrails). Derive a baseline rather than diffing
  against `main` directly -- in this repo main changes flow INTO feature
  branches via merge, so after a merge `git diff main -- <path>` shows
  nothing meaningful for main-side changes. Anchor on the destination's own
  most-recent commit, or a sha the human names.
- When a single landed commit realized the change, treat it as the reference:
  `git show <sha> -- <file>` is the canonical before/after for that file.
- Sandbox git can fail with `fatal: unterminated line in .git/packed-refs`
  even when the host repo is healthy. Do NOT retry in the sandbox or touch
  anything under `.git/`. Pivot to a human git handoff (below).

**Human git handoff.** When the AI cannot get git output from the sandbox (the
`packed-refs` failure), or the work needs mutating git (`mv`, `commit`), it
hands the human a PLAIN read-only git command to run and report -- the command
itself is portable; keep it simple. The system-specific capture mechanism (how
to redirect to a file with the right encoding, and the gotcha that a shell may
parse `<` in a `<sha>` placeholder as redirection -- so substitute the real
value before handing the command over) lives once in
`docs/AGENTS.md` "Sandbox git fallback". Reference it; do not duplicate
shell-specific capture commands into individual playbooks.

---

### Sandbox path translation (canonical)

The AI shell sandbox may expose the workspace folders under a sandbox mount path
(for example `<sandbox-mount>/...`) rather than their host paths. The AI should
translate paths automatically; flag it if shell calls error with "no such file".

---

### Authoring

- Start with the How-to-run header (the five fields above).
- Then the prompt or runbook body, cleanly self-contained.
- Reference the Guardrails; end with the Verify / manual-follow-up close.

**Old/new migration genre:** for a playbook documenting a recurring "old
(main) vs new (branch)" code migration extracted from a landed commit, follow
the Git comparison method above and the runbook shape in
[`code-review-playbook.md`](./code-review-playbook.md), the worked runbook
example.

---

### Not for

- One-time plans (committed work-to-do; see `docs/future/`).
- Living design docs (`docs/design/`).
- Uncommitted thinking (`docs/ideas/`).
- Scripts (which live in `docs/scripts/` -- the convention's home for
  executable doc tooling like a `check:doc-chars` check script). A playbook is
  prose-based instructions for a human or AI to run; a script is
  code that executes itself.

### Lifecycle

Playbooks live as long as the task they describe is relevant. Update in place
when the task evolves; delete when the task is no longer run.

### For AI assistants

- Playbooks are operational, not historical. Treat them as authoritative
  instructions for the recurring task they describe.
- If a playbook drifts from current code or current tooling, update it in the
  same branch as the change that caused the drift.
- If you change the Guardrails / Git / Sandbox canonical text here, update the
  inline copies in the prompt-genre playbooks in the same branch.
- Do NOT treat playbooks as plans -- they describe tasks that recur, not
  work-to-do that lands once.

### ASCII only

Prose, punctuation, and symbols must be ASCII (em-dash -> `--`, ellipsis ->
`...`, arrow -> `->`); the status-marker emoji are the only allowed non-ASCII.
Full table and the `check:doc-chars` check are in your repository's root
coding-standards doc.

Full convention: [`../AGENTS.md`](../AGENTS.md).
