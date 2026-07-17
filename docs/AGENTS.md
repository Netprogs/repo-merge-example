### Documentation Lifecycle

This file governs work on plans, phases, trackers, and reviews under
`docs/`. Code style, comment style, character-set rules, and runtime
rules live in your repository's root coding-standards doc.

---

### Section index

Deep-link targets. If you are an AI assistant, read "Notes for AI assistants"
before authoring or landing docs.

- [Quick reference](#quick-reference) -- the 80% case in 30 seconds.
- [Notes for AI assistants](#notes-for-ai-assistants) -- behavioral DOs and DON'Ts. Read first.
- [Workstream Lifecycle](#workstream-lifecycle) -- full reference:
    - [Folder semantics](#folder-semantics)
    - [Two tracks: small and large](#two-tracks-small-and-large)
    - [Workstream folders and area folders](#workstream-folders-and-area-folders-docsfuture)
    - [Tracker shape and status discipline](#tracker-shape-and-status-discipline-large-track)
    - [Archive folder shape](#archive-folder-shape)
    - [`LANDED YYYY-MM-DD` banner and pointer headers](#landed-yyyy-mm-dd-banner-and-pointer-headers)
    - [Landing summary](#landing-summary-the-entry-point)
    - [Testing artefacts](#testing-artefacts-optional)
    - [Decision record](#decision-record-optional)
    - [Cross-archive synthesis](#cross-archive-synthesis-special-case)
    - [Design documentation](#design-documentation)
    - [Ideas](#ideas)
    - [Spike](#spike-pre-commitment-investigation)
    - [Ticket work](#ticket-work-docstickets)
    - [History partitioning](#history-partitioning)
    - [Master index](#master-index)
    - [Cross-reference repair](#cross-reference-repair)
    - [Authoring effort per landing](#authoring-effort-per-landing)
- [Sandbox git fallback](#sandbox-git-fallback)

---

### Quick reference

For AI sessions landing or updating documentation. Detailed sections
below carry the full rules; this is the 80% case in 30 seconds.

**Terminology.**

- **workstream** -- one coherent unit of work; lives in its own folder, lands as one archive.
- **plan** (`<topic>-plan.md`) -- the parent doc (motivation + approach). Every workstream has exactly one.
- **phase** (`<topic>-phase-NN-<slug>.md`) -- a component of a large-track workstream.
- **tracker** (`<topic>-tracking.md`) -- large-track per-phase status; carries the `LANDED` banner. Status-only, not a history log; see "Tracker shape and status discipline".
- **review** -- a genuine review of prior work or of a specific phase. NOT the parent (the parent is the plan).
- **area folder** (`<area>/`) -- groups workstreams that will link into one synthesis on landing.
- **synthesis** -- a `docs/history/` umbrella (`...-finalized/`) holding linked source archives.
- **landing summary** (`<topic>-landing-summary.md`) -- the large-track archive entry point.

**Structure at a glance.** Pick a track at authoring time; default
small. Every workstream lives in its own folder and lands as one
archive (`docs/future/` -> `docs/history/`).

```
Small track -- one coherent plan (most work). One file is the whole archive.

    docs/future/<topic>/
    `-- <topic>-plan.md             motivation + plan + status table
            |
            |  land
            v
    docs/history/<YYYY>/YYYY-MM-DD-<topic>/
    `-- <topic>-plan.md             + LANDED YYYY-MM-DD banner
                                    + landing summary (Problem / Final shape / Before-after)


Large track -- multi-phase, genuinely independent surface area.

    docs/future/<topic>/
    |-- <topic>-plan.md             parent (motivation, diagnosis, design)
    |-- <topic>-tracking.md         tracker (per-phase status)
    |-- <topic>-phase-01-<slug>.md  phase
    `-- <topic>-phase-02-<slug>.md  phase
            |
            |  land
            v
    docs/history/<YYYY>/YYYY-MM-DD-<topic>/
    |-- <topic>-landing-summary.md  entry point
    |-- <topic>-tracking.md         carries the LANDED YYYY-MM-DD banner
    |-- <topic>-plan.md             pointer header -> tracker
    `-- <topic>-phase-NN-<slug>.md  pointer header -> tracker


Ticket work -- same tracks, in the self-contained docs/tickets/ tree.

    docs/tickets/triage/<TICKET>-<slug>-investigation.md    (pre-commit investigation)
            |
            |  commit to a fix
            v
    docs/tickets/future/<TICKET>-<slug>/
    |-- <TICKET>-<slug>-plan.md            entry point
    `-- <TICKET>-<slug>-investigation.md   evidence sibling (linked, no banner)
            |
            |  land
            v
    docs/tickets/history/<YYYY>/YYYY-MM-DD-<TICKET>-<slug>/
    |-- <TICKET>-<slug>-plan.md            entry point (LANDED banner)
    |-- <TICKET>-<slug>-investigation.md   evidence sibling (no banner)
    `-- <TICKET>-<slug>-postmortem.md      REQUIRED closure summary


Area folder -> synthesis -- 2+ workstreams that link into one archive on landing.

    docs/future/<area>/             (the area folder declares the link up front)
    |-- <topic-a>/                  a normal workstream (small or large)
    `-- <topic-b>/                  a normal workstream (small or large)
            |
            |  land
            v
    docs/history/<YYYY>/YYYY-MM-DD-<area>-finalized/
    |-- <area>-landing-summary.md   synthesis entry point
    `-- linked/
        |-- YYYY-MM-DD-<topic-a>/   full source archive, contained
        `-- YYYY-MM-DD-<topic-b>/   full source archive, contained
```

**Folder routing.** Committed development -> `docs/future/`. Landed
development -> `docs/history/`. Living cross-library design ->
`docs/design/`. Uncommitted thinking -> `docs/ideas/`. ALL
ticket-driven work (investigation, committed fix, landed fix) ->
`docs/tickets/`. Compliance records and attestations ->
`docs/compliance/`. Pre-convention content (non-authoritative) ->
`docs/archive/`.

**Two work streams, two trees.** Planned development ("plan, then
build") lives in `docs/future/` -> `docs/history/`, with `docs/ideas/`
as its pre-commit inbox. Ticket-driven work ("investigate a problem,
then fix it" -- anything with a tracker key, e.g. `PROJ-1234`) lives in
a self-contained parallel tree, `docs/tickets/`, which mirrors the same
vocabulary: `docs/tickets/triage/` (pre-commit investigation),
`docs/tickets/future/<TICKET>-<slug>/` (committed fix), and
`docs/tickets/history/<YYYY>/...` (landed fix). Separate trees stop
higher-frequency ticket churn from cluttering the development roadmap
and record. Routing is by SOURCE, not size: a large refactor that came
from a ticket still lives under `docs/tickets/`.

**History is year-partitioned.** Landed archives are born into a year
bucket -- `docs/history/<YYYY>/YYYY-MM-DD-<topic>/` (development) and
`docs/tickets/history/<YYYY>/YYYY-MM-DD-<TICKET>-<slug>/` (ticket work)
-- so no index or folder listing ever holds more than one year. Each
year has its own index; each tree's top-level index is an
index-of-years. (Existing flat development archives are grandfathered
pending a one-time migration -- see "Ticket work (`docs/tickets/`)" and
"History partitioning".)

**Landing a small workstream** (the common case):

1. Ask the maintainer to run
   `npm run check:doc-chars -- --working docs/future/<topic>` (AI
   assistants request this, like `git`) -- it normalizes in place and must
   come back clean. Run it BEFORE the move: `docs/history/` (and any
   `*/history/`, so `docs/tickets/history/` too) is excluded from the guard,
   so checking after the move is a no-op.
2. Move the workstream folder `docs/future/<topic>/` to
   `docs/history/<YYYY>/YYYY-MM-DD-<topic>/` (create the `<YYYY>/` bucket if
   it is the year's first landing).
3. Add `LANDED YYYY-MM-DD` banner at the top of `<topic>-plan.md`.
4. Prepend a landing summary section: Problem (1 paragraph) /
   Final shape (1 paragraph) / Before-after table (>= 1 row).
5. Add ONE row to that year's index `docs/history/<YYYY>/README.md` (create
   it, plus a year row in `docs/history/README.md`, if it is the year's first
   landing).

A ticket workstream lands the same way with `docs/tickets/` paths: check
`docs/tickets/future/<TICKET>-<slug>`, move to
`docs/tickets/history/<YYYY>/YYYY-MM-DD-<TICKET>-<slug>/`, and index in that
year's `docs/tickets/history/<YYYY>/README.md` plus a year row in
`docs/tickets/README.md`. In place of the generic landing summary, write the
required `<TICKET>-<slug>-postmortem.md` (Root cause / Fix / Before-after).

**Landing a large workstream** (multi-phase only):

1. Ask the maintainer to run
   `npm run check:doc-chars -- --working docs/future/<topic>` (AI
   assistants request this, like `git`) -- it normalizes in place and must
   come back clean. Run it BEFORE the move: `docs/history/` (and any
   `*/history/`) is excluded from the guard, so checking after the move is a
   no-op.
2. Move the plan + tracker + phase files to
   `docs/history/<YYYY>/YYYY-MM-DD-<topic>/`.
3. Create `<topic>-landing-summary.md` (Problem / Final shape /
   Before-after; 30-100 lines).
4. `LANDED` banner on the tracker; pointer headers on the plan and
   phase files (`> Landed. See <topic>-tracking.md ...`).
5. Add ONE row to that year's index (`docs/history/<YYYY>/README.md`), plus a
   year row in the top-level index if it is the year's first landing.

**Scaffolding, not deploy units.** Plans, phases, and trackers organise work on
ONE local-development branch; all phases of a workstream land together. Do NOT
write staged-rollout, age-out-window, or deploy-ordering language. Cross-phase
dependencies are code-state on the branch, not deployment timing. Full rules in
[Notes for AI assistants](#notes-for-ai-assistants).

**Forbidden, always:**

- Per-archive `README.md` (also: no README in `docs/future/<area>/`
  subfolders -- the tracking or plan file is the entry).
- Root `CHANGELOG.md`.
- Separate release-note files inside archives.
- Multi-paragraph `LANDED` status blocks on plan or phase files.
- Multiple files carrying the `LANDED` banner per archive.
- Padding small-track work into large-track shape.
- Staged-rollout, age-out-window, or deploy-ordering language in plans,
  phases, or trackers (see "Scaffolding, not deploy units" above).

**Touching cross-library code?** Scan `docs/design/` for a doc
covering the pattern. Each design doc carries a "Code locations
covered" header listing watched file paths. If your branch touches
a watched file, update the design doc in the same branch. When
creating new canonical entry points for a pattern that already has
a design doc, add a JSDoc breadcrumb -- see your repository's
root coding-standards doc "Code-side breadcrumbs".

**Capturing exploratory thinking?** If worth keeping but
uncommitted: `docs/ideas/<topic>-idea.md`. No banner, no status,
no ceremony. If a `// TODO` comment next to the code fits, do that
instead.

**ASCII only.** Docs are ASCII -- em-dash -> `--`, ellipsis -> `...`,
arrow -> `->`, and so on. The status-marker emoji are the only allowed
non-ASCII. The full replacement table and the `check:doc-chars` check
are documented in your repository's root coding-standards / character-set
reference; run `npm run check:doc-chars -- --working` clean before landing.

Each subfolder under `docs/` also has its own short `AGENTS.md`
auto-loaded by cwd-walk; an AI session working inside a folder
sees the folder-specific rules without loading this whole file.

Detailed sections follow. Anchored; deep-link rather than re-read
top to bottom.

---

### Notes for AI assistants

When working on workstream docs in this workspace:

- A document under `docs/future/` is a worklist; treat it as work to
  do or in progress. Do NOT assume it has landed.
- A document under `docs/history/` is historical context; treat it
  as a record of past work. Do NOT extract it as a todo list, propose
  to "land" it, or build a new plan around its phases.
- A document under `docs/design/` is LIVING current-state
  documentation. If you read one and find it inaccurate against the
  current code, update it in the same branch as the change that
  drifted from it. Do NOT treat it as historical or as a todo.
- When authoring a plan under `docs/future/`, scan `docs/design/`
  first (grep `docs/design/*.md`) if the work reads persisted records
  into a response shape or otherwise touches a cross-library pattern.
  The pre-flight scan in your repository's root coding-standards doc is
  framed around code changes; planning sessions do the same lookup so an
  existing pattern (e.g. a shared cross-library helper) is considered
  before a new surface re-derives it.
- A document under `docs/ideas/` is uncommitted thinking. Do NOT
  extract it as a todo. Do NOT propose to "land" it unless the user
  explicitly asks. Use it as INPUT to plans you write, not as
  authority on the current design.
- Ticket-driven work lives in the `docs/tickets/` tree, not the
  development trees (see "Two work streams, two trees"). A
  `docs/tickets/triage/` document is an investigation not yet
  committed to a fix: treat it as provisional input, not authoritative
  design or a worklist. On commitment, promote the whole item to
  `docs/tickets/future/<TICKET>-<slug>/` (plan entry point +
  `-investigation.md` evidence sibling) by MOVING the files, not
  copying. Landed archives are year-partitioned; do NOT
  piecemeal-migrate existing flat development archives.
- Default to the small track. Promote to the large track only when
  the trigger criteria are met. Do NOT split phases just to use the
  large-track shape.
- One workstream per unit of work. Before creating a new workstream or
  ticket folder, search `docs/future/`, `docs/history/`, and the
  `docs/tickets/` tree for an existing one covering the same work and
  REUSE it -- do not start a second. Two folders for the same work
  (easy to spawn when a fresh session re-derives a slightly different
  slug) collide at landing. A stateless session has no memory of what
  it named the folder last time, so it must LOCATE the existing one,
  not guess.
- Default to NOT creating optional siblings; add a debugging guide,
  testing files, or decision record only when the work has that shape
  (see "Archive folder shape"). A single-file archive is the correct
  shape for most small workstreams.
- Default to NOT creating a synthesis. Add one only when the criteria
  in "Cross-archive synthesis" are met.
- Default to NOT creating a design doc; add one only when a
  cross-library pattern has 2+ adopters (see "Design documentation").
- Default to NOT creating an idea file; use `// TODO` comments next to
  code instead, and reach for `docs/ideas/` only when the observation
  has no single code anchor (see "Ideas").
- Do NOT auto-create release notes, CHANGELOGs, or per-archive
  READMEs (see "Forbidden, always"). If the user asks for a release
  note, ask where their existing release channel publishes (Slack,
  email, deploy tool) -- the team's existing channel is the right
  home, not the archive.
- Do NOT pad small-track work into large-track shape (see "Forbidden,
  always"). One-phase workstreams produce one file: if you find
  yourself authoring three files (plan + tracker + phase-01) for a
  single focused change, the shape is wrong -- collapse to one file
  before landing.
- Do NOT generate phase splits whose only purpose is sequencing.
  "Phase 1: write the helper. Phase 2: call the helper from site A.
  Phase 3: call the helper from site B" is one workstream, not three.
  Phase splits exist for genuinely independent surface area or
  pure-investigation phases.
- Do NOT propose to "archive" or "land" docs in `docs/design/` or
  `docs/ideas/`. Design docs are living; ideas are uncommitted.
  Neither has a landing ceremony.
- Do NOT treat material in `docs/archive/` as authoritative; it is
  pre-convention or aged-out content. If something there is the only
  answer, re-home it under the convention as part of the work that
  needed it (see "Folder semantics").
- If a user asks for a review of a scope that overlaps with material
  under `docs/history/`, READ the existing material first so you do
  not re-surface findings the team has already actioned. Cite the
  historical record when your new findings touch the same territory.
- When asked to land a plan from `docs/future/`, the archive move is
  the final commit on the branch. The branch is not ready to merge
  until the move is in place. There is no separate post-merge
  archiving ceremony.
- Sequence the landing so the archive move is a CLEAN final commit.
  Before performing the move, PROMPT the user to commit the completed
  substantive work first (git is a human-run step, like
  the `check:doc-chars` check). Then perform the archive move -- folder move,
  landing summary, `LANDED` banner, pointer headers, master-index row
  -- as its own change set and ask the user to commit that as the last
  commit on the branch. Do not fold the substantive work and the
  archive move into one commit.
- Proactively flag completion. When a workstream's tracked work appears
  complete (all phases done, acceptance criteria met, the `check:doc-chars`
  check clean), PROMPT the user to consider landing it -- do not leave a
  finished workstream sitting in `docs/future/`. Surface the suggestion
  only; do NOT archive unprompted. The user decides timing, since the
  archive move is the final pre-merge commit.
- Before offering to land a large-track workstream, one that adds a new
  consumed surface, or one that touched a `docs/design/` pattern, confirm
  a `Verified` code-review pass exists for the landing surface, or that
  the maintainer waived it (recorded in the tracker). Treat a missing
  review like a dirty `check:doc-chars` check: surface it and stop, do NOT
  self-initiate the archive move. The review method and severity scale
  live in [`playbooks/code-review-playbook.md`](./playbooks/code-review-playbook.md).
  Small-track mechanical work (rename, dead-code prune, doc-only) needs no
  review.
- When you pick up a large-track phase, the FIRST thing you do --
  before reading deeper into the code or writing anything -- is set
  that phase's tracker status to `In progress YYYY-MM-DD`. A phase you
  have started must never still read `Not started`. See "Tracker shape
  and status discipline".
- Small-track plans get the same start-stamp discipline at their scale:
  when you pick up a small-track plan, stamp its status table
  `In progress YYYY-MM-DD` before you start implementing, and flip it to
  done at landing. Keep it light -- those two transitions, not per-step
  churn -- but a plan being worked must never still read `Not started`.
- Keep the tracker status-only: one `Now:` line plus the status table,
  no "session resume" or "where we are" prose that restates it.
  Deviations, locked decisions, and investigation findings go in the
  phase doc, not the tracker (see "Tracker shape and status
  discipline").
- When reading an archive, start at the entry point: the plan file's
  landing summary (small track), `<topic>-landing-summary.md` (large
  track), or the synthesis-level landing summary (synthesis). Drop into
  the tracker, plan, phase files, or debugging guide only when the
  summary is not specific enough (see "Landing summary" and
  "Cross-archive synthesis").
- Plans, phases, and trackers are local-development scaffolding for
  organising the work, NOT deployment units. All phases of a
  workstream land together in the same branch (typically one PR,
  occasionally a few). Do NOT write plans or trackers as if phases
  ship at different times. In particular:
    - No "age-out windows", "two-deploy coordinated rollout",
      "backward-compat deploy ordering", or "ship A first, wait,
      then B" framing.
    - Cross-phase dependencies describe code state on the branch
      ("Phase B's rename is in place before Phase C's bumps land"),
      not deployment timing ("Phase B ships first").
    - If a phase split exists ONLY to enable staged rollout, collapse
      it.
    - Acceptance criteria are code-state ("grep shows zero hits",
      "tsc clean", "tests green"), not deployment-state ("once
      deployed", "after rollout").

---

### Workstream Lifecycle

Per-library `docs/` trees in this workspace use a two-folder convention
to keep in-progress work visually distinct from already-landed work.
The convention is mandatory for any library that maintains plan
documents alongside its source -- without the distinction, both
humans and AI assistants treat landed work as a todo list and re-propose
changes that already shipped.

The convention is calibrated for FAST landings. The simple case (one
small-track workstream lands as one file) requires no more than the
substantive writing of a landing summary plus a one-line master-index
row. Every other artefact is OPTIONAL and added only when the work has
that shape -- skip the optional artefacts by default.

#### Folder semantics

- `docs/future/` -- plans, phases, and proposals that have NOT yet
  landed. Anything here is committed work-to-do or in-progress.
  Production code does not yet reflect it.
- `docs/history/` -- plans, phases, and supporting artefacts that
  HAVE landed. Anything here is historical context. Production code
  already reflects the findings. NOT a worklist. Libraries do NOT keep
  their own `docs/history/` tree; all landed archives live in this
  repo-level `docs/history/`. A per-library history tree is
  pre-convention drift -- consolidate it up into a repo-level archive
  (synthesis umbrella where the work composes). Year-partitioned:
  development archives under `docs/history/<YYYY>/`; landed ticket fixes
  live in the parallel tree under `docs/tickets/history/<YYYY>/`. See
  "History partitioning".
- `docs/design/` -- LIVING current-state documentation for
  cross-library patterns. Always describes how the code works
  TODAY, not how it got there. Updated in place when the design
  shifts. Never archived.
- `docs/ideas/` -- uncommitted exploratory thinking. Observations
  and speculative notes that no one has committed to landing. NOT
  a todo list. Each idea stays, gets promoted to `docs/future/`,
  or gets deleted.
- `docs/tickets/` -- the self-contained tree for ALL ticket-driven work
  (bugs, incidents, operational fixes -- anything with a tracker key).
  Mirrors the development vocabulary within its own root:
  `docs/tickets/triage/` (pre-commit investigation, the analog of
  `docs/ideas/`), `docs/tickets/future/<TICKET>-<slug>/` (committed
  fix), `docs/tickets/history/<YYYY>/...` (landed fix). Kept separate
  from the development tree so ticket churn does not clutter it. See
  `docs/tickets/AGENTS.md`.
- `docs/archive/` -- holding area for older documents that pre-date
  the current convention or have aged out of usefulness but the team
  wants to keep around just in case. NOT a worklist. NOT canonical.
  An AI assistant or returning reader should not treat material here
  as authoritative for current design, current plans, or current
  ideas -- if a question is genuinely answered only by something in
  `docs/archive/`, that content should be re-homed into the
  appropriate folder under the convention as part of the work that
  needed it.
- `docs/playbooks/` -- reusable prompts and step-by-step runbooks
  for tasks that are run RECURRINGLY against the codebase (sync
  checks between repos, deploy-time runbooks, release-readiness
  checklists). Filename suffix `-playbook.md` or `-prompt.md`. NOT
  for one-time work, design docs, or ideas. See
  `docs/playbooks/AGENTS.md` for the authoring shape.
- `docs/compliance/` -- point-in-time compliance RECORDS and
  attestations (OSS/license reviews, copyleft position statements,
  audit artifacts), grouped `<domain>/<YYYY-MM-DD>/`. A record-of-record
  area, not a workstream tree: nothing lands, and records are immutable
  (a later review is a new dated folder). Mixed file types are expected
  (`.md`, `.pdf`, `.csv`) and content is EXEMPT from the ASCII rule
  (legal/external text uses the copyright sign, accented names, etc.),
  so it is excluded from the `check:doc-chars` check. See
  `docs/compliance/AGENTS.md`.

#### Two tracks: small and large

Workstreams come in two sizes, and the convention is calibrated to
each. Pick the track at authoring time. Default to small. Every
workstream lives in its own folder regardless of track (see "Workstream
folders and area folders" below).

**Small track** -- a focused change with one coherent plan. Most work
falls here. One file is the whole archive.

- Authoring: `docs/future/<topic>/<topic>-plan.md` containing
  motivation, plan, and a status table.
- Landing: move the workstream folder to
  `docs/history/<YYYY>/YYYY-MM-DD-<topic>/`. Add the `LANDED YYYY-MM-DD`
  banner and prepend the landing summary (Problem / Final shape /
  Before-after) at the top of `<topic>-plan.md`.

**Large track** -- a multi-phase workstream with genuinely independent
phases. Use only if at least one of these is true:

- Two or more phases touch distinct surface area and reviewing them
  separately reduces risk for a single reviewer.
- One phase is pure investigation with no code output.
- One phase is large enough that holding it in one reviewer's head is
  not realistic.

Large-track authoring (all inside `docs/future/<topic>/`):

- `<topic>-plan.md` -- the parent: motivation, diagnosis, design. The
  phases execute against it.
- `<topic>-tracking.md` -- the tracker.
- `<topic>-phase-NN-<slug>.md` -- one file per phase.

The word "plan" always names the parent overview; "phase" always names
a component. "review" is NOT a parent name -- it is reserved for
genuine review documents (a review of prior work, or of a specific
phase, e.g. `<topic>-phase-NN-<slug>-review.md`).

Optional large-track companions (add when warranted, not by default):
`<topic>-business-benefits.md` (a plain-language stakeholder "why") and
`<topic>-effort-estimate.md` (a planning baseline). Add them when the
work needs a business case or an up-front estimate; both carry into the
archive on landing (see "Archive folder shape").

If a workstream starts small and grows phases mid-flight, promote it
to the large track when the trigger criteria become true. Do NOT split
phases just to use the large-track shape.

#### Workstream folders and area folders (`docs/future/`)

Every workstream lives in its own folder, regardless of track:
`docs/future/<topic>/`. Small track holds one file
(`<topic>-plan.md`); large track holds the plan + tracker + phase
files. The top level of `docs/future/` contains workstream folders,
never loose plan files. Keep the topic prefix on filenames inside the
folder (`<topic>/<topic>-plan.md`, not `<topic>/plan.md`) for
grep-by-filename and `docs/history/` symmetry.

An **area folder** (`docs/future/<area>/<topic>/`) groups 2+ related
workstreams that are intended to LINK into one synthesis on landing. It
is the `docs/future/` side of a synthesis umbrella, not a
navigation-only convenience. Reserve area folders for groupings that
will synthesise; if workstreams are only loosely related and will NOT
be synthesised, keep them as independent top-level workstream folders.
Then "inside an area folder" reliably means "these will link". See
"Cross-archive synthesis" for how an area folder lands.

Full shape: `docs/future/[<area>/]<topic>/<files>` -- `<area>/`
optional and synthesis-declaring, `<topic>/` always present.

`docs/ideas/` is NOT subject to the workstream-folder rule: an idea is
a single uncommitted note, not a workstream. Ideas stay flat by
default, with an optional `<topic>/` subfolder for a multi-note idea.

`docs/history/`, `docs/design/`, and `docs/archive/` follow their own
structure rules.

#### Tracker shape and status discipline (large track)

The tracker (`<topic>-tracking.md`) owns per-phase status for a
large-track workstream. It is a STATUS surface, not a history log.
Keep it small: a returning reader should learn "where are we, what
is next" from the first ten lines, and a status change should be a
one-token edit in ONE place.

Status lives in exactly ONE surface. Do NOT restate it in a "session
resume" blockquote, a "where we are" paragraph, AND a per-phase
heading -- that is three or four edits per change, and the surfaces
drift out of sync (a phase reads "Verified" in one place and "Not
started" in another). The tracker has two parts and no more:

1. A `Now:` line at the very top -- the single active phase and the
   immediate next action, on one line. This is what a resuming
   session reads first; it replaces every prose "resume" block.
2. One status table -- one row per phase, columns: phase, status
   token (with date), one-line note. Nothing else.

```
Now: Phase 05 (integration test run). Next: write the test config.

| Phase | Status | Note |
|---|---|---|
| 01 | Verified 2026-06-05 | root-config normalization |
| 04 | Verified 2026-06-05 | run tools from the shared lib |
| 05 | In progress 2026-06-09 | integration tests |
| 06 | Not started | source-root anchor |
```

Status tokens (canonical -- trackers do NOT repeat a legend):

- `Not started` -- no work begun. Carries NO date.
- `In progress YYYY-MM-DD` -- work begun; date is the day it started.
- `Complete YYYY-MM-DD` -- work done, awaiting operator verification.
- `Verified YYYY-MM-DD` -- operator confirmed; locked.
- `Blocked YYYY-MM-DD` -- a dependency or open question stops
  progress; the one-line note says what.

The date is load-bearing. A dateless `Not started` is genuinely
untouched; any dated token is underway or done. This is what stops a
phase that HAS been worked from reading as "not done" on resume.

START-STAMP RULE. The FIRST tracker edit when picking up a phase is
flipping its status to `In progress YYYY-MM-DD`, BEFORE writing any
code. The start transition is the one most often skipped because
nothing else forces it; making it the first action is the fix.

Do NOT hand-align table columns by padding pipes. Ragged pipes mean
adding a word to one cell does not re-flow every row -- alignment is
a real per-edit cost on a table that changes often.

Keep narrative OUT of the tracker. Deviations from the phase doc,
locked decisions, restructure notes, and verified-investigation
findings live in the PHASE doc while in flight, and fold into the
landing summary at archive time. A tracker cell is a one-line note
or a `*.spec.ts` filename as evidence -- never a paragraph. A tracker
that grows multi-sentence cells and "recorded for history" sections
is absorbing work the phase doc and landing summary should carry,
and will only get slower to update.

If a phase has many discrete items, an optional per-phase checklist
may follow the status table -- each item carries a status token and
a short evidence phrase, same discipline, no prose paragraphs in
cells.

#### Archive folder shape

Every archive lives at `docs/history/<YYYY>/YYYY-MM-DD-<topic>/` (ticket
archives at `docs/tickets/history/<YYYY>/YYYY-MM-DD-<TICKET>-<slug>/`). The
date is the verified-landed date, not the authoring date.

Each archive has exactly ONE required entry-point file. Everything
else is optional and added only when the work has that shape.

**Required (one of):**

- Small track: `<topic>-plan.md`. Carries the `LANDED YYYY-MM-DD`
  banner at the top, then the landing summary section
  (Problem / Final shape / Before-after), then the original plan
  content, then a Status table.
- Large track: `<topic>-landing-summary.md`. Bounded entry point:
  Problem (1 paragraph), Final shape (1 paragraph), Before-after
  table (at least 1 row). Target 30-100 lines. NO `LANDED` banner
  here -- the tracker carries it.

**Optional siblings (add only when warranted):**

- `<topic>-plan.md` (large track) -- the parent (motivation /
  diagnosis / design), unmodified except for a one-line pointer header
  to the tracker. Include only if the diagnosis / design content stays
  relevant for returning readers.
- `<topic>-tracking.md` (large track) -- the tracker. Carries the
  `LANDED YYYY-MM-DD` banner. Single source of truth for per-phase
  status. Required whenever there are multiple phases; otherwise
  optional.
- `<topic>-phase-NN-<slug>.md` (large track) -- one file per phase.
  Each carries a one-line pointer header (see "LANDED banner and
  pointer headers" below). Required for large track; not used for
  small track.
- `<topic>-debugging-guide.md` -- practitioner triage. Add when
  production exposure produces recurring "how do I diagnose X" needs:
  mechanism descriptions, symptom-to-mechanism map, data sources to
  inspect, pitfall catalogue with detect/fix guidance. Skip if the
  landing-summary's Before/after table is enough.
- `<TICKET>-<slug>-investigation.md` -- forensic evidence appendix for
  a ticket workstream (the promoted triage investigation: root-cause
  analysis, log/metric evidence that will not be re-derived). Linked
  from the plan, no `LANDED` banner. Distinct from a debugging-guide:
  the investigation records what happened for THIS incident; a guide is
  a reusable how-to-diagnose reference.
- `<topic>-testing-user.md` / `<topic>-testing-developer.md` -- smoke
  matrix. Business-shaped scenarios (user) and developer companion
  with DB / HTTP / log checkpoints. Add when scenarios benefit from
  a repeatable manual record. See "Testing artefacts" below.
- `<topic>-decision-record.md` -- preserved rationale for a mid-flight
  pivot. See "Decision record" below.
- `<topic>-business-benefits.md` (large track) -- plain-language
  stakeholder summary of why the work mattered (audience: product, ops,
  compliance, leadership). Add when the work needed a business case;
  it carries in as the durable "why". Skip if the landing summary's
  Problem section already covers it.
- `<topic>-effort-estimate.md` (large track) -- effort and
  calendar-time planning baseline (per-phase dev-days, critical path).
  Add when the work needed an up-front estimate; update with actuals as
  phases land so the archived copy records estimate-vs-actual.

**Forbidden:**

- Per-archive `README.md`. The entry-point file IS the README. This
  also applies to in-flight workstreams under `docs/future/<area>/`
  -- the tracking file (large track) or plan file (small track) is the
  entry point; no README is needed.
- Multi-paragraph `LANDED YYYY-MM-DD` status blocks at the top of plan
  or phase files. Use the one-line pointer header.
- Multiple files carrying the `LANDED YYYY-MM-DD` banner. ONE place
  per archive: the small-track plan file, OR the large-track tracker.
- A separate operator-facing release-note file. The landing summary's
  Before/after table is the durable operator-visible record. If the
  team publishes release notes via Slack / email / a deploy tool, the
  text lives wherever the team already publishes -- not in the
  archive.

#### `LANDED YYYY-MM-DD` banner and pointer headers

ONE banner per archive:

- Small track: at the top of `<topic>-plan.md`.
- Large track: at the top of `<topic>-tracking.md`, and only there.

Pointer headers (one-liner, single source of truth in the tracker):

- Large-track phase files: `> Landed. See <topic>-tracking.md in this folder for status.`
- Large-track plan file (the parent, if present): the same pointer.
- Skipped phases: `> Skipped. See <topic>-tracking.md in this folder for rationale.`

Workstreams in `docs/future/` do not carry the banner or the pointer header.

#### Landing summary (the entry point)

The landing summary exists to give a returning reader one place to
look for "what is this work, and what shape did it land in?" without
walking the plan / tracker.

Required sections:

- `### Problem` -- one paragraph.
- `### Final shape` -- one paragraph.
- `### Before/after` -- a table with at least one row, even if the
  "Before" cell says "no behaviour" and the "After" cell describes
  the new contract.

Target length: 30-100 lines. If the work has no design decision to
explain (a pure refactor, a rename, a dead-code prune), the Problem
and Final-shape paragraphs can be one sentence each and the
Before/after table can have one row -- that is correct, not lazy.

The landing summary is the ENTRY POINT for THIS workstream, not the
full design record for the pattern this workstream contributed to.
When the workstream produces or extends a long-lived design pattern,
the landing summary's `### Final shape` paragraph cross-references
the design doc that owns the current state:

```markdown
### Final shape

<One paragraph: what this workstream landed.>

For the current state of <pattern> across all workstreams that have
touched it, see [`docs/design/<topic>.md`](../../../design/<topic>.md).
```

The landing summary's Before/after table stays as THIS workstream's
record. Triage detail goes to `<topic>-debugging-guide.md` (if
warranted); pivot rationale goes to `<topic>-decision-record.md` (if
warranted); per-phase content stays in phase files; the business case
stays in `<topic>-business-benefits.md` and the planning baseline in
`<topic>-effort-estimate.md` (if present); current-state design
rationale goes to `docs/design/<topic>.md` (if a design doc exists for
the pattern). The landing summary points at all of these when they
exist; it does NOT inline them.

#### Testing artefacts (optional)

Two optional testing artefacts can join any archive:

- `<topic>-testing-user.md` -- business smoke matrix. End-user-shaped
  scenarios that confirm the work behaves correctly without developer
  tooling. Aimed at someone exercising the change manually.
- `<topic>-testing-developer.md` -- developer companion. Engineer-
  shaped scenarios that need code-side observation (logs, DB state,
  network traces) to confirm internal mechanisms.

Their purpose is to give a returning reader a runnable confirmation
of the design, not just a written record of it. They are also useful
during the landing branch itself -- the matrix doubles as the
manual-test pass-off list when unit tests don't cover the full
behaviour.

Add one or both when:

- The work introduces a contract whose correctness benefits from a
  written, repeatable scenario.
- Future debugging is likely to ask "what was the original test case
  for this?".
- Operator-facing behaviour has non-obvious validation steps.

Skip them when:

- The work is small enough that exercising it on the branch is the
  natural test.
- The scenarios are already fully covered by automated unit or
  integration tests.
- The change is pure-internal with no observable behaviour shift.

These files do NOT carry the `LANDED` banner; the entry-point file
carries it (small track) or the tracker carries it (large track).

#### Decision record (optional)

When a workstream pivoted mid-flight -- an approach was authored,
picked, and partially implemented, then abandoned in favour of a
different design -- the rationale for the pivot is worth preserving
even though the abandoned approach left no production code.

Content:

- One paragraph summarising the initial approach: what it would have
  done and why it was picked first.
- One paragraph per abandoned alternative: what it would have done
  and the tradeoff it represented. Not the full plan content; one or
  two paragraphs each, the level a returning reader can scan.
- One paragraph or short list naming the pivot trigger: what testing
  or analysis surfaced the gap and when the pivot happened.
- A comparison table when more than two options were considered,
  comparing them across whichever dimensions actually decided the
  call.
- One paragraph naming the final choice and why it won.

Form:

- Short record (~1-2 paragraphs per alternative): inline section in
  the entry-point file (small track: `## Decision record` appended
  after the Status table; large track: `## Decision record` in the
  plan file).
- Long record (>~150 lines, or when many options were compared):
  sibling file `<topic>-decision-record.md`, with a one-line pointer
  in the entry-point file.

Decision records do NOT carry the `LANDED YYYY-MM-DD` banner when
they live as a sibling file -- they are an appendix to the landing
artefact, not a landing artefact themselves.

#### Cross-archive synthesis (special case)

Several related workstreams compose into one runtime mechanism that
production code treats as one thing. When that happens, gather the
related archives under a synthesis folder.

A synthesis is usually DECLARED in advance by an area folder. When
related workstreams are authored under `docs/future/<area>/`, the area
name is the umbrella topic and each member workstream is a future
`linked/` source. On landing, members go into
`docs/history/<YYYY>/YYYY-MM-DD-<area>-finalized/linked/YYYY-MM-DD-<member>/`
rather than flattening to independent top-level archives, and the
umbrella gets `<area>-landing-summary.md`. The area folder records the
linkage up front so the synthesis is structural at landing, not a step
someone has to remember. A synthesis can still be created
retroactively for archives that were never grouped under an area -- the
triggers below apply either way.

Incremental landing: if a member lands before its area siblings are
ready, it may land as a standalone `docs/history/<YYYY>/YYYY-MM-DD-<member>/`
archive; when the area resolves, create the umbrella and MOVE the
already-landed archive into `linked/`, stamping the `Superseded ... by
...` pointer (see below). A one-member area is not a synthesis -- it
lands as a standalone archive, which is the signal it should not have
been an area folder.

Use a synthesis ONLY when reading the related archives as a single
design is meaningfully clearer than reading them as a journey. Single
workstreams never need one.

Typical triggers:

- 2+ archives (often 3+) compose into one runtime mechanism that
  production code treats as one thing.
- The journey across the archives included pivots, dead-ends, or
  supersessions that would confuse a returning reader.
- A practitioner reading any one source archive in isolation would
  draw wrong conclusions because the design they're describing was
  later modified by a sibling.

Synthesis folder layout:

```
docs/history/<YYYY>/
`-- YYYY-MM-DD-<area>-finalized/
    |-- <area>-landing-summary.md               (synthesis entry point -- REQUIRED)
    |-- <area>-debugging-guide.md               (optional, see Archive folder shape)
    |-- <area>-testing-user.md                  (optional)
    |-- <area>-testing-developer.md             (optional)
    |-- <area>-decision-record.md               (optional)
    `-- linked/
        |-- YYYY-MM-DD-<topic-a>/               (full source archive, contained here)
        `-- YYYY-MM-DD-<topic-b>/               (full source archive, contained here)
```

Rules:

- The synthesis folder's name uses the most-recent source-archive's
  date plus the `-finalized` suffix (so it sorts chronologically
  after its sources).
- Source archives MOVE into `linked/` when the synthesis is created.
  They keep their own internal shape (small-track or large-track)
  and their own `LANDED` banners. Each source archive's entry-point
  file gains one extra line near its banner pointing at the
  synthesis landing summary:

  ```markdown
  > Superseded YYYY-MM-DD by ../../<area>-landing-summary.md
  ```

  (Path is relative -- two levels up from `linked/<source>/<file>.md`
  lands at the synthesis folder; the landing summary lives directly
  there.)
- The synthesis landing summary is the ONLY required new artefact at
  the synthesis level. Optional siblings follow the same per-artefact
  criteria as a normal archive -- add a debugging guide if the
  synthesis-level triage view differs from per-archive views, add
  testing files when the cross-archive smoke matrix is genuinely
  unified, add a decision record if pivots spanned multiple source
  archives. `business-benefits` / `effort-estimate` belong at the
  umbrella level only for a genuinely cross-workstream case; usually
  they stay per-member inside `linked/`.
- Cross-references inside source archives that point at OTHER source
  archives in the same synthesis use the relative form
  `../<other-source>/<file>.md`. References to the synthesis-level
  documents use `../../<file>.md` (two levels up from
  `linked/<source>/<file>.md` lands at the synthesis folder).
- The synthesis folder gets ONE row in its year index
  (`docs/history/<YYYY>/README.md`, or `docs/tickets/history/<YYYY>/README.md`
  for a ticket synthesis). Source archives in `linked/` do NOT get separate
  rows -- the
  synthesis is the visible entry, and the synthesis landing summary
  enumerates the source archives.

#### Design documentation

`docs/design/` holds living current-state documentation for patterns
that span multiple libraries. Each file describes how the codebase
works TODAY -- not the history of how it got there. When the design
shifts, the doc is updated in place. No archival ceremony; the file
lives until the pattern is removed from production.

What belongs in `docs/design/`:

- Cross-library patterns an engineer needs to understand before
  touching code in multiple places (e.g., the optimistic concurrency
  contract behind the example pattern).
- Architectural decisions that span libraries and need a longer
  "why" than a rule in your repository's root coding-standards doc can carry.
- The "current state of X" reference that an archive's landing
  summary cannot durably play, because landing summaries are tied to
  a single workstream and grow stale when later workstreams extend
  the pattern.

What does NOT belong in `docs/design/`:

- Per-library design (stays with the library, e.g.,
  `src/<lib>/docs/`).
- Historical narrative (lives in `docs/history/<archive>/`).
- Workspace-wide rules (live in your repository's root coding-standards doc; design
  docs are the longer rationale behind the rules and can be
  cross-referenced from `AGENTS.md`).
- Active proposals (`docs/future/`) or uncommitted observations
  (`docs/ideas/`).

When a pattern earns its own design doc:

A pattern earns its own design doc when ALL of the following hold:

- It spans multiple libraries, AND
- It is invoked or extended from 2+ distinct places, AND
- A future engineer touching ANY of those places would benefit from
  reading one canonical reference rather than reverse-engineering
  the pattern from the call sites.

If only one place in the codebase implements a pattern, the design
description lives WITH that implementation -- a JSDoc on the entry-
point symbol, a stacked `//` comment block above the code, or the
synthesis archive's landing summary. Promote to a design doc only
when the second adopter appears.

The check before creating a new design doc: name the 2+ adopters
explicitly. If you can name only one, the design is not yet a
cross-cutting pattern; keep the description with the code.

File shape:

```
docs/design/
|-- <topic>.md           (one file per design pattern, default)
`-- <topic>/             (optional subfolder when a design has companion artefacts)
    |-- <topic>.md       (the entry point)
    `-- <support>.md     (diagrams, alternatives considered, etc.)
```

Default to a single file. Subfolders only when the design has
companion artefacts that don't fit in the main file.

Design docs do NOT carry the `LANDED YYYY-MM-DD` banner -- they are
living, not landing artefacts. They do NOT live in date-stamped
folders. They do NOT appear in `docs/history/README.md` (that index
is archive-only).

Relationship to synthesis archives:

When a workstream lands a long-lived design pattern, the synthesis
archive's landing summary scope shrinks to "what this workstream
produced" -- the time-bounded record of one landing event. The
design doc in `docs/design/` owns the "what is the current design
today?" view. The synthesis landing summary's `### Final shape`
paragraph cross-references the design doc (see the Landing summary
section for the exact wording).

When a later workstream extends the pattern, the design doc gets
updated in the same branch as the code change. The new workstream's
archive gets its own landing summary (Problem / Final shape /
Before-after for THAT workstream alone). The design doc remains the
single living authority.

Authoring a design doc:

Every design doc starts with a `## Code locations covered by this doc`
header at the top, before the problem section. The header lists the
file paths the design doc watches in an AI-grep-friendly format -- one
file per line, with backticks around each path, optionally narrowed
to specific symbols within a file. This makes the design doc
self-aware: an AI session doing reverse lookup ("I changed file X,
are there design docs covering X?") can grep `docs/design/*.md` for
the file path and find candidates.

The header replaces the older "list of file paths somewhere in the
doc body" pattern. Designed for activation: AI sessions touching
code grep here; the pre-flight bullet in your repository's root
coding-standards doc prompts that grep before non-trivial code changes
land.

After the watched-paths header:

- Start with the problem the pattern solves (one paragraph).
- Describe the mechanism in plain language. Reference identifiers
  in backticks for grep.
- Spell out invariants and accepted limitations -- what the pattern
  guarantees and what it doesn't.
- Cross-reference other design docs when patterns compose.

The watched-paths header is the "where do I look?" map at the top;
the deeper-level code-location detail (which file does what role
in the mechanism) lives inside the relevant mechanism section.

Avoid:

- Restating archive narrative.
- Listing implementation history.
- Workspace-wide rules (those go in `AGENTS.md`).

Keeping design docs current:

- A code change that extends the pattern updates the design doc in
  the SAME branch. Doc moves with design, not after.
- A code change that removes the pattern deletes or rewrites the
  design doc in the same branch.
- During a landing, if the synthesis landing summary references a
  design doc that doesn't exist yet, the landing branch creates it.

Index (when the folder grows):

- Up to ~5 design docs: no index needed; the folder listing is
  sufficient.
- 5+ design docs: add `docs/design/README.md` with one row per
  design doc -- topic name, one-line scope, primary code location.

#### Ideas

`docs/ideas/` holds uncommitted exploratory thinking -- observations,
pattern noticings, speculative designs, and notes-for-later that no
one has committed to landing.

What belongs in `docs/ideas/`:

- An observation that the current shape of some code might be wrong,
  but no one is committing to fix it.
- A speculative design for a future workstream that hasn't been
  scoped.
- A "we should think about this when X happens" note.

What does NOT belong in `docs/ideas/`:

- Committed plans (`docs/future/`).
- Open questions inside an active plan (those live in the plan's
  "Open questions" section).
- Bug reports (the report itself goes in the bug tracker, not docs).
  Substantial root-cause analysis or fix design that is too large for a
  ticket comment goes to `docs/tickets/triage/`, then
  `docs/tickets/future/`.

File shape:

```
docs/ideas/
|-- <topic>-idea.md          (one file per idea, default)
`-- <topic>/                 (optional subfolder when an idea has multiple notes)
    `-- ...
```

Filename suffix is `-idea.md`. Makes ideas grep-distinguishable from
plans, reviews, and design docs when filenames are cited in prose.

Ideas do NOT carry the `LANDED YYYY-MM-DD` banner. They do NOT have
a status field, a tracker, or phases -- by definition they are
uncommitted.

Lifecycle:

An idea ends one of three ways:

1. **Stays an idea forever.** Many ideas are observations worth
   capturing but not worth acting on. That is fine. The file stays.
2. **Gets promoted to a plan.** When someone commits to landing the
   idea, the file moves: it becomes (or is replaced by) a
   `docs/future/<topic>/<topic>-plan.md` (small track) or a
   `docs/future/<topic>/` workstream folder with plan + tracker +
   phases (large track). The idea's content folds into the new plan's
   motivation section.
   Once the plan exists, the idea file is deleted from
   `docs/ideas/`. After landing, the archive carries the rationale;
   the idea file does not come back.
3. **Gets retired.** When the observation no longer applies (the
   code changed, the worry was misplaced), delete the file. No
   archival ceremony -- an idea was never a landing record.

Default: do NOT write an idea file. Write one only when:

- The observation is worth capturing for later, AND
- No one is committing to land it now, AND
- The observation spans multiple files or doesn't have one obvious
  code anchor to attach a `// TODO` to.

Most "ideas" while writing code belong as `// TODO` comments next to
the code, not as a doc file. Reach for `docs/ideas/` only when an
in-code comment cannot capture it.

Index (when the folder grows):

- Up to ~5 idea files: no index needed; the folder listing is
  sufficient.
- 5+ idea files: add `docs/ideas/README.md` with one row per idea --
  topic name, one-line summary, and where the file currently sits in
  its lifecycle (stays / promoted to `docs/future/<topic>` / retired).

#### Spike (pre-commitment investigation)

A spike is time-boxed exploratory work whose deliverable is KNOWLEDGE
and a go / no-go decision, not shippable code. It exists to reduce
uncertainty or prove feasibility BEFORE a larger effort is committed. It
may produce throwaway code or a scratch test, but the artefact that
survives is "what we learned, and whether / how to commit".

A spike is the development-side analog of `docs/tickets/triage/`: the
ticket tree has an explicit pre-commit investigation stage, but planned
development otherwise jumps from `docs/ideas/` (uncommitted thinking)
straight to `docs/future/` (committed build). The spike fills that gap --
work committed to INVESTIGATING something, but not yet to doing it.

Two shapes, placed differently:

- Intra-workstream spike -- de-risks an ALREADY-committed workstream
  (e.g. "prove the library behaves before the migration phases"). This
  is NOT a separate document: it is a pure-investigation PHASE inside the
  workstream (a pure-investigation phase with no code output is a
  large-track trigger -- see "Two tracks"). It gates the build phases
  that follow it.
- Pre-commitment spike -- confirms whether to commit to a larger effort
  that is NOT yet scoped. This IS its own small-track workstream folder
  under `docs/future/<topic>/`, with the entry file named
  `<topic>-spike.md` in place of `<topic>-plan.md`. Its deliverable is
  findings plus a recommendation; it lands to `docs/history/` like any
  workstream, and its landing summary IS the go / no-go (a one-line
  Problem / Final-shape is correct here -- see "Landing summary"). The
  larger effort it evaluates stays an idea (or a placeholder
  `docs/future/` plan) until the spike says go.

Naming: `<topic>-spike.md`, so spikes are grep-distinguishable from
plans, ideas, reviews, and design docs when filenames are cited.

Outcomes (a spike always ends in one):

1. Commit -- the larger effort is scoped as its own workstream; the
   landed spike is the rationale it points back to.
2. Drop -- the effort is not worth doing; the landed spike records WHY,
   so it is not re-litigated.
3. Inconclusive -- iterate the spike or convert the open question back
   into an idea; do not leave a spike open indefinitely (it is
   time-boxed).

Relationship to a decision record: a landed pre-commitment spike is
essentially a decision record with a feasibility body. If the only
durable output is the go / no-go rationale, a `<topic>-decision-record.md`
shape may fit better; reach for a spike workstream when the investigation
itself (scratch code, measured results, a reproduction) is worth
preserving.

Default: do NOT create a spike document for small uncertainties resolved
in the course of normal planning. Reach for one only when the
investigation is substantial AND its result gates a commit decision on a
larger effort.

#### Ticket work (`docs/tickets/`)

All ticket-driven work lives in a self-contained tree that mirrors the
development vocabulary, so ticket churn never clutters `docs/future/` or
`docs/history/`. Folder-level rules live in `docs/tickets/AGENTS.md`;
the shape:

```
docs/tickets/
  README.md                                index-of-years (ticket master index)
  triage/                                  pre-commit investigation
    <TICKET>-<slug>-investigation.md
  future/<TICKET>-<slug>/                  committed, not landed
    <TICKET>-<slug>-plan.md                entry point
    <TICKET>-<slug>-investigation.md       evidence sibling (linked, no banner)
  history/<YYYY>/YYYY-MM-DD-<TICKET>-<slug>/   landed, year-partitioned
```

- Routing is by SOURCE, not size: anything with a tracker key lives
  here, even a large refactor. Planned development stays in the
  top-level `docs/future/` / `docs/history/` trees.
- Ticket-keyed naming throughout: `<TICKET>-<slug>` folders,
  `<TICKET>-<slug>-<kind>.md` files.
- A ticket workstream is otherwise a normal small- or large-track
  workstream: same track choice, same `LANDED` banner and landing
  rules, scoped under `docs/tickets/`.
- The evidence sibling `<TICKET>-<slug>-investigation.md` (the promoted
  triage investigation) is linked from the plan, carries no `LANDED`
  banner, and rides into the archive as a durable evidence appendix.
- Closure requires a `<TICKET>-<slug>-postmortem.md` (Root cause / Fix /
  Before-after), written at landing. It is the ticket stream's landing summary
  -- it REPLACES the generic Problem / Final-shape / Before-after summary rather
  than adding to it -- and doubles as the ticket's closure update in the
  tracker. See `docs/tickets/AGENTS.md` "Closure (postmortem)".

**Triage.** `docs/tickets/triage/` is the pre-commit inbox -- the
ticket-driven analog of `docs/ideas/`. Work has arrived and is being
investigated, but no fix is committed. NOT a worklist, NOT
authoritative. Promote-or-delete: on commitment the whole item MOVES to
`docs/tickets/future/<TICKET>-<slug>/` (everything travels together as
separate files -- the `-plan.md` entry point plus the
`-investigation.md` evidence sibling); on resolve-without-docs the file
is deleted. See `docs/tickets/AGENTS.md`.

#### History partitioning

Landed archives are born into a year bucket so no index or folder
listing ever holds more than one year of work:

- `docs/history/<YYYY>/YYYY-MM-DD-<topic>/` (development)
- `docs/tickets/history/<YYYY>/YYYY-MM-DD-<TICKET>-<slug>/` (ticket)

Each year gets its own index (`docs/history/<YYYY>/README.md` and
`docs/tickets/history/<YYYY>/README.md`), one row per archive that year.
Because archives are born into their final bucket, there is no bulk
move and no cross-reference breakage at year rollover.

Existing pre-partition flat archives (`docs/history/YYYY-MM-DD-<topic>/`
at the top level) are grandfathered. A one-time migration into year
buckets is pending and will be applied in a single pass alongside a
larger documentation/history consolidation on a separate branch; do NOT
migrate them piecemeal.

#### Master index

`docs/history/README.md` is an INDEX-OF-YEARS for development work: one
row per year pointing at that year's index
(`docs/history/<YYYY>/README.md`). Ticket work has its own master index
at `docs/tickets/README.md`, an index-of-years pointing at
`docs/tickets/history/<YYYY>/README.md`. Each per-year index carries one
row per TOP-LEVEL archive landed that year: folder link, one-line scope,
Verified date, track (`small` or `large`). Source archives nested inside
a synthesis folder do NOT get their own rows -- they're contained, not
top-level.

For a synthesis row, the scope text annotates `(synthesis of N
archives -- start here)` so a reader knows the synthesis is the entry
point and the source archives are inside.

#### Cross-reference repair

Two cases:

1. **Plan-to-archive move.** Before deleting the originals from
   `docs/future/`, grep for any document that references the old path
   (`grep -rn "docs/future/<topic>/" docs/`) and update each reference
   to point at the new `docs/history/...` path. Active plans in
   `docs/future/` that depend on a now-archived workstream must be
   updated to the archive's new location.

2. **Source-archive-to-synthesis move.** When a synthesis is created
   and source archives MOVE into `linked/`, grep for the source-
   archive paths (`grep -rn "docs/history/<YYYY>/YYYY-MM-DD-<source>" docs/`)
   and update each reference to the new contained path
   (`docs/history/<YYYY>/YYYY-MM-DD-<area>-finalized/linked/YYYY-MM-DD-<source>/...`).
   Active plans in `docs/future/` that reference a source archive
   must also be updated.

#### Authoring effort per landing

The convention is calibrated to make landing fast:

- **Small track:** ONE file. Move the workstream folder
  `docs/future/<topic>/` to `docs/history/<YYYY>/YYYY-MM-DD-<topic>/`, add the
  `LANDED` banner, prepend the Problem/Final-shape/Before-after summary
  at the top of `<topic>-plan.md`. Add a row to the master index. Done.
- **Large track:** Create `<topic>-landing-summary.md` (the only real
  new writing). Move the plan + tracker + phase files into the dated
  folder. Banner on the tracker (`<topic>-tracking.md`); pointer
  headers on the plan + phase files. Add a row to the master index.
  Done.
- **Synthesis:** ONE extra file (the synthesis-level landing summary).
  MOVE the source archives into `linked/`. Stamp the source archives'
  entry-point files with the `Superseded ... by ...` line. Replace
  the source archives' individual master-index rows with ONE
  synthesis row. Done.

The substantive writing is the landing summary itself. Everything
else is mechanical. Optional siblings (debugging guide, testing
files, decision record) are added only when the work has that shape;
skipping them is the default.

---

### Sandbox git fallback

Git commands run from the AI assistant's shell sandbox can fail or return corrupted views of repo state even when the host
repo is healthy (for example a `fatal: unterminated line in .git/packed-refs` error, but any git error from the sandbox is
a candidate). The cause is the mount layer, not the repo. The AI must NOT attempt to repair anything under `.git/` -- those
files are host-direct and the sandbox view of them is unreliable; a "fix" applied from the sandbox can corrupt the real
file on disk.

When sandbox git fails:

1. Try once. Do not retry inside the sandbox, do not loop, do not edit anything under `.git/`.
2. Pivot to host-side capture. Ask the human to run the read-only git command on the host and share the output -- either
   pasted back, or redirected into a disposable temp file at the repo root that the AI then reads.
3. Mind the encoding: capture as UTF-8 without a BOM. A BOM (some shells add one by default) trips downstream tooling and
   sometimes the AI's own Read view.
4. Read the captured output via the Read tool and process as usual.
5. If a temp capture file was created, remind the human to delete it at the end of the task -- the cleanup is intentional,
   not automatic.

One gotcha when handing a command to the human: do NOT leave placeholders like `<baseline>` or `<sha>` in the command
text, because some shells parse `<` as a redirection operator and error out. Substitute the actual value before sending
the command.
