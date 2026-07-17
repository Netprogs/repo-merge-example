### docs/design/ -- LIVING current-state documentation

Cross-library design patterns described as they work TODAY. Each
doc is updated in place when the design shifts. NEVER archived.

**Required at the top of every design doc:**

- Title and a one-line `LIVING design doc.` marker.
- A `## Code locations covered by this doc` header listing the
  file paths the doc watches. AI-grep-friendly: one file per line,
  paths in backticks, optionally narrowed to specific symbols
  within a file.

**Authoring guidance (after the watched-paths header):**

- Problem the pattern solves (one paragraph).
- Mechanism in plain language with identifiers in backticks.
- Invariants and accepted limitations.
- Cross-references to other design docs when patterns compose.

**When to update:** a code change that extends, modifies, or
removes the pattern updates the design doc in the SAME branch as
the code change. Doc moves with design, not after.

**When to create:** a pattern earns its own design doc when it
spans multiple libraries AND is invoked from 2+ distinct places
AND a future engineer touching ANY of those places would benefit
from one canonical reference. If only one place implements a
pattern, the description lives with the code (JSDoc, code
comments), not here.

**NOT for:** workstream-bounded landing summaries (those live in
`docs/history/<archive>/`), workspace-wide rules (those live in
your repository's root coding-standards doc; design docs are the longer rationale
behind the rules), uncommitted thinking (-> `docs/ideas/`).

**ASCII only.** Prose, punctuation, and symbols must be ASCII (em-dash
-> `--`, ellipsis -> `...`, arrow -> `->`); the status-marker emoji are
the only allowed non-ASCII. Full table and the `check:doc-chars` check
are in your repository's root coding-standards doc.

Full convention: [`../AGENTS.md`](../AGENTS.md).
