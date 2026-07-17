# Getting Started with the Docs System

The human onramp to the documentation lifecycle under `docs/`. The folders
are designed to be used WITH AI -- the convention (in
[`docs/AGENTS.md`](./AGENTS.md)) tells AI sessions what to do; this guide
tells YOU what to ask for and what to expect.

If you read nothing else: most of what you want is one of "land this
workstream," "investigate and fix a ticket," "capture this idea,"
"explain how X works," "record a compliance review," or "audit this
folder for convention compliance." Examples below.

## Folder map

Eight folders under `docs/`, each with a clear purpose:

| Folder         | What lives here                                                                        |
|----------------|----------------------------------------------------------------------------------------|
| `future/`      | Committed development work-to-do. Plans you've decided to land.                        |
| `history/`     | Landed development work. Year-partitioned, date-stamped archives.                      |
| `tickets/`     | All ticket-driven work (bugs, incidents, fixes). Its own triage/future/history tree.   |
| `design/`      | LIVING design docs for cross-library patterns. Describes how the code works TODAY.     |
| `ideas/`       | Exploratory thinking. Observations you might act on later, or might not.               |
| `playbooks/`   | Reusable prompts and runbooks for recurring tasks (sync checks, deploy runbooks).      |
| `compliance/`  | Immutable compliance records/attestations (OSS reviews, position statements). Exempt from the ASCII guard. |
| `archive/`     | Pre-convention content kept just in case. NOT authoritative for anything current.      |

Each folder has its own small `AGENTS.md` that an AI session auto-loads
when it works in that folder. You don't need to read those -- AI does.

## Working with AI: common asks

**"Land the X workstream we just verified."**

AI moves the plan from `docs/future/` to a date-stamped folder in that
year's bucket under `docs/history/<YYYY>/` (ticket work lands under
`docs/tickets/history/<YYYY>/`), adds the `LANDED YYYY-MM-DD` banner,
prepends a landing summary (Problem / Final shape / Before-after), and adds
a row to that year's index. Should take 5-10 minutes of conversation for a
normal workstream.

If the work extends an existing pattern (like the example pattern), AI also
updates `docs/design/<pattern>.md` in the same branch. The JSDoc
breadcrumbs in the code remind it.

**"Write up a new plan for X."**

AI creates `docs/future/<topic>/<topic>-plan.md` (small track) or the
multi-file large-track shape if the work has genuinely independent
phases. You discuss scope; AI drafts; you iterate.

**"There's a bug/incident (ticket PROJ-1234). Investigate it."**

Ticket-driven work lives in the `docs/tickets/` tree, NOT the development
`future/`/`history/` trees, so bug churn never clutters the roadmap. It moves
through three stages that mirror the development vocabulary:

- `docs/tickets/triage/` -- while you are still investigating, before a fix is
  committed. AI writes the root-cause investigation here. If it turns out to be
  a non-issue or a duplicate, the file is simply deleted -- no ceremony.
- `docs/tickets/future/<TICKET>-<slug>/` -- once you commit to a fix. AI moves
  the whole item here: a `-plan.md` (the fix plan, entry point) plus the
  `-investigation.md` (the evidence, carried along and linked from the plan).
- `docs/tickets/history/<YYYY>/YYYY-MM-DD-<TICKET>-<slug>/` -- when it lands.

At closure AI writes a REQUIRED `-postmortem.md` (root cause / fix /
before-after). It is written at landing, not before, so it reflects the fix that
actually shipped -- and it doubles as the text you drop straight into the
ticket.

Worked example -- the example-api OOM (PROJ-1234). While a fix is in progress
the workstream sits in `future/`:

```
docs/tickets/future/PROJ-1234-example-api-oom/
  PROJ-1234-example-api-oom-plan.md            the fix plan (entry point)
  PROJ-1234-example-api-oom-investigation.md   the root-cause evidence
```

Once it lands it gains the postmortem and moves into the year bucket:

```
docs/tickets/history/2026/2026-07-03-PROJ-1234-example-api-oom/
  PROJ-1234-example-api-oom-plan.md             (+ LANDED banner)
  PROJ-1234-example-api-oom-investigation.md
  PROJ-1234-example-api-oom-postmortem.md        root cause + fix (paste into PROJ-1234)
```

**"I'm thinking about Y but not committing to it. Capture it."**

AI creates `docs/ideas/<topic>-idea.md`. No banner, no commitment. The
idea sits until you decide to land it, retire it, or leave it. Most
ideas can also live as `// TODO` comments next to the code if they're
scoped to one place -- AI should ask if a TODO would fit better.

**"Test whether Y is feasible before we commit to it."**

That's a spike -- time-boxed investigation whose output is a go/no-go
decision, not shippable code. Two cases. If it de-risks a workstream
you've ALREADY committed to (e.g. "prove the library behaves before the
migration"), it's just a pure-investigation phase inside that
workstream, not a separate document. If it's deciding whether to commit
to a larger effort AT ALL, AI creates a small-track
`docs/future/<topic>/<topic>-spike.md`; it lands like any workstream and
the go/no-go IS its landing summary. The larger effort stays an idea (or
a placeholder plan) until the spike says go. It is the development-side
analog of `tickets/triage/`.

**"Explain how X works in the codebase."**

AI looks first at `docs/design/<pattern>.md` if one exists. If not, the
relevant archive in `docs/history/` is the next stop. Code-side JSDoc
breadcrumbs on key entry points point at the design doc when there is one.

**"Help me debug Y in production."**

AI looks at the relevant archive's `<topic>-debugging-guide.md` (if it
has one). The symptom-to-mechanism map is the entry point. The design
doc covers the mechanism itself; the debugging guide covers diagnosis.

**"Record the OSS license review (or other compliance attestation) we just ran."**

Compliance records go in `docs/compliance/`, grouped by domain and dated. They
are immutable audit artifacts: a new review is always a NEW dated folder -- AI
never edits or deletes a prior one, so the trail stays intact. Files meant to be
shared with third parties carry an `-EXTERNAL` marker, and the rendered artifact
you actually hand out (usually a `.pdf`) sits beside its markdown source. This
tree is exempt from the ASCII guard, so legal text can use the copyright sign,
accented names, and similar.

Worked example -- the June 2026 OSS/copyleft review:

```
docs/compliance/
  oss-review/
    2026-06-12/
      OSS-COPYLEFT-REVIEW-2026-06-12.md              internal technical review
      OSS-POSITION-STATEMENT-EXTERNAL-2026-06-12.md  external statement (source)
      OSS-POSITION-STATEMENT-EXTERNAL-2026-06-12.pdf the artifact handed out
      unknown-license-verification-2026-06-12.csv    machine-readable evidence
```

A later review lands as a sibling dated folder (e.g. `oss-review/2027-01-15/`);
the `2026-06-12` record stays untouched as the audit trail. This is NOT a
workstream -- it never enters the `future/` -> `history/` flow and has no
`LANDED` banner.

**"Audit this folder for convention compliance."**

AI scans the folder, identifies files that don't fit, proposes cleanup.
Common finds: per-folder README files (forbidden), multi-paragraph
LANDED status blocks on plan files (use the one-liner pointer instead),
separate release-note files (operator channel handles these), padding
small workstreams into large-track shape (collapse to one file).

## What NOT to ask AI to do

Things the convention explicitly forbids. AI should refuse these itself,
but it's worth knowing so you can spot drift:

- Create a per-archive `README.md`. The entry-point file IS the README.
  Applies to both `docs/history/<archive>/` and `docs/future/<area>/`.
- Create a root `CHANGELOG.md`. Release notes live in the team's
  existing channel (Slack, email, deploy tool).
- Create a separate release-note file inside an archive. The landing
  summary's Before/after table is the durable record.
- Put multi-paragraph status blocks at the top of every plan file. ONE
  banner per archive, on the small-track plan file or the large-track
  tracker.
- Split a one-phase workstream into three "plans" for sequencing. One
  workstream produces one file (small track) unless the phases are
  genuinely independent.
- "Archive" or "land" an idea or design doc. Ideas are uncommitted;
  design docs are living. Neither has a landing ceremony.

If AI proposes any of these, push back. "We don't do per-archive READMEs
-- check `docs/AGENTS.md`" usually corrects it.

## When AI gets it wrong

The convention is layered for AI activation. If AI misses a layer and
proposes something off, the usual recovery is:

- **Wrong folder?** Tell AI which folder applies. Each has its own
  mini-`AGENTS.md` that clarifies the rules.
- **Wrong shape?** Tell AI to read the cheat sheet at the top of
  `docs/AGENTS.md`. Most landings are covered there in 30 seconds.
- **Forgot to update the design doc?** Tell AI to grep
  `docs/design/*.md` for the file paths in the change. The "Code
  locations covered" header on each design doc lists watched paths.

## Why this exists

Two failure modes triggered the convention:

1. Landing a workstream took half a day of mechanical file authoring
   (README + architecture overview + debugging guide + release note +
   impact + ...). Most content was duplicated across files. AI sessions
   drifted on the structure.
2. Returning to understand "how does X work today?" meant reading N
   historical archives in sequence and reconstructing the current
   state. The synthesis went stale every time a new workstream extended
   the pattern.

The convention fixes both. Small-track landings are one file. Current
state of a long-lived pattern lives in `docs/design/` and gets updated
in the same branch as code changes. Historical archives stay bounded to
"what this workstream produced."

If you hit friction the convention doesn't address, surface it. The
convention is meant to evolve when real edge cases appear, not from
speculation.

## Where to dig deeper

- [`docs/AGENTS.md`](./AGENTS.md) -- the full convention. Cheat sheet
  at the top covers 80% of cases.
- `docs/<folder>/AGENTS.md` -- per-folder rules. Auto-loaded by AI when
  it works in that folder.
- The finalized/linked synthesis archive shape is described in
  [`docs/AGENTS.md`](./AGENTS.md) (this example has no landed archives yet).
- [`docs/design/example-pattern.md`](./design/example-pattern.md) -- the
  canonical example of a living design doc. Shape future design docs
  after it.

Questions about the convention itself go to `docs/AGENTS.md` first.
Questions about specific workstreams go to the relevant
`docs/history/<archive>/` entry.
