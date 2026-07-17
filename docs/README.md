# How the docs system works

This folder holds the project's plans, design notes, and the historical record of work that has
landed. It runs on a small set of conventions that keep in-progress work visually separate from
finished work, so that neither a human nor an AI assistant mistakes a landed record for a to-do list.

This page is the friendly on-ramp. It explains the shape of the system in plain language. The full,
authoritative rules -- folder semantics, landing mechanics, the `LANDED` banner, ASCII character
rules, and the notes for AI assistants -- live in [`AGENTS.md`](./AGENTS.md). When this page and
`AGENTS.md` disagree, `AGENTS.md` wins.

## The folders

Each top-level folder under `docs/` means something specific:

- `future/` -- committed work that has NOT landed yet. Plans and proposals. Production code does not
  reflect these yet. Treat anything here as work to do or in progress.
- `history/` -- work that HAS landed. Historical context, not a worklist. Production code already
  reflects it. Do not re-propose or "re-land" things you find here. Year-partitioned:
  `history/<YYYY>/YYYY-MM-DD-<topic>/`.
- `design/` -- living, current-state documentation for patterns that span multiple libraries. Always
  describes how the code works TODAY, and is updated in place when the design shifts. Never archived.
- `ideas/` -- uncommitted thinking. Observations and speculative notes nobody has committed to. An
  idea either stays, gets promoted into `future/`, or gets deleted. Not a to-do list.
- `archive/` -- pre-convention or aged-out material kept just in case. Not authoritative; do not treat
  it as current design or current plans.
- `playbooks/` -- reusable runbooks for tasks run repeatedly against the codebase (sync checks,
  deploy runbooks, release-readiness checklists).
- `tickets/` -- the self-contained tree for all ticket-driven work (bugs, incidents, operational
  fixes). It mirrors the same vocabulary in its own root: `tickets/triage/` (investigation before a
  fix is committed), `tickets/future/<TICKET>-<slug>/` (committed fix), and
  `tickets/history/<YYYY>/...` (landed fix). Kept separate from `future/`/`history/` so ticket churn
  does not clutter the development roadmap or record.
- `compliance/` -- point-in-time compliance records and attestations (OSS/license reviews, position
  statements, audit artifacts), grouped `<domain>/<YYYY-MM-DD>/`. Immutable record-of-record: nothing
  lands, a later review is a new dated folder. Mixed file types (`.md`, `.pdf`, `.csv`) and content is
  exempt from the ASCII rule (legal/external text), so it is excluded from the `check:doc-chars` check.

There are two work streams. Planned development ("plan, then build") flows `ideas/` -> `future/` ->
`history/`. Ticket-driven work ("investigate, then fix") flows the same way inside its own tree:
`tickets/triage/` -> `tickets/future/` -> `tickets/history/`. Design docs, playbooks, and compliance
records live on their own and are not part of either flow.

## The three shapes a plan can take

Pick a track when you start writing. Default to the small track. Every workstream lives in its own
folder and lands as a single archive. The chart below shows each shape in `future/` and what it
looks like once it lands in `history/`.

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
    `-- <TICKET>-<slug>-postmortem.md      REQUIRED closure summary (root cause / fix / before-after)


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

Small track is the default and the common case: one plan file is the entire workstream, and landing
it is mostly mechanical. Use the large track only when phases touch genuinely distinct surface area,
when one phase is pure investigation, or when a phase is too big to hold in one reviewer's head -- not
just to sequence steps. An area folder is for the rarer case where two or more related workstreams are
meant to be read together as one mechanism; it declares that link up front, and on landing the members
gather under a single `-finalized/` umbrella with their archives contained in `linked/`.

## Vocabulary

- **workstream** -- one coherent unit of work. Lives in its own folder, lands as one archive.
- **plan** (`<topic>-plan.md`) -- the parent document: motivation and approach. Exactly one per
  workstream.
- **phase** (`<topic>-phase-NN-<slug>.md`) -- a component of a large-track workstream.
- **tracker** (`<topic>-tracking.md`) -- large-track per-phase status. Carries the `LANDED` banner.
- **review** -- a genuine review of prior work or of a specific phase. Never the parent; the parent is
  the plan.
- **area folder** (`<area>/`) -- groups workstreams that will link into one synthesis on landing.
- **synthesis** -- a `history/` umbrella (`...-finalized/`) holding linked source archives that
  production code treats as one mechanism.
- **landing summary** (`<topic>-landing-summary.md`) -- the entry point for a large-track or synthesis
  archive: Problem / Final shape / Before-after.
- **spike** (`<topic>-spike.md`) -- time-boxed investigation to confirm whether to commit to a larger
  effort. A small-track workstream whose deliverable is a go/no-go decision, not code; it lands with
  the go/no-go as its summary. (De-risking an already-committed workstream is a pure-investigation
  phase instead, not a separate document.)

## Where do I put X?

- Committed work to do -> `future/<topic>/` (small) or `future/<topic>/` with plan + tracker + phases
  (large).
- Anything driven by a ticket (bug, incident, operational fix) -> the `tickets/` tree:
  `tickets/triage/` while investigating, then `tickets/future/<TICKET>-<slug>/` once a fix is
  committed.
- Two or more related workstreams that will read as one -> `future/<area>/<topic>/`.
- Work that just landed -> move the folder to `history/<YYYY>/YYYY-MM-DD-<topic>/` (ticket work to
  `tickets/history/<YYYY>/...`) and add the landing summary plus the `LANDED` banner. See `AGENTS.md`
  for the exact steps.
- A cross-library pattern an engineer must understand before touching several places -> `design/`.
- A "we should think about this someday" note -> `ideas/<topic>-idea.md`, or better, a `// TODO`
  next to the code.
- Feasibility work to decide whether to commit to a larger effort -> a spike:
  `future/<topic>/<topic>-spike.md` (small track; deliverable is a go/no-go). If it is de-risking a
  workstream already committed to, it is a pure-investigation phase inside that workstream instead.
- A recurring runbook -> `playbooks/`.

## A few things the convention forbids

To keep archives clean, do not create per-archive `README.md` files, a root `CHANGELOG.md`, or
separate release-note files inside archives. The landing summary's Before/after table is the durable
operator-visible record. Docs are ASCII-only -- write `--`, `->`, and `...` rather than the
typographic glyphs. The full forbidden list and the `check:doc-chars` check are in `AGENTS.md`.

## Going deeper

[`AGENTS.md`](./AGENTS.md) is the reference. Its Quick reference section repeats the chart above and
gives the 30-second version of landing a workstream; the detailed sections below it carry the full
rules. Each subfolder under `docs/` also has its own short `AGENTS.md` that an AI session picks up
automatically when working inside that folder.
