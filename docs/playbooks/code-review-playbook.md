# Code Review -- Playbook

A recurring runbook for reviewing code: either a GATE review over
work a branch is about to land, or a STANDING quality pass over an
already-landed surface. It is the source of truth for HOW a review is run and
what a review produces, so the workstream `.md` files (plan, phases, tracker)
only REFERENCE this playbook rather than re-deriving the method each time.

Prior reviews (PRE-PLAYBOOK), useful for the findings-catalogue SHAPE only -- not
models of this method, since they predate the spec-to-code flow and each took its
own structure: a multi-round example
`docs/history/<YYYY>/YYYY-MM-DD-example-code-review/`
(catalogue plus multi-round remediation) and a standing periodic review
`docs/future/example-code-review/`.
Do not treat them as canonical for this playbook.
Apply this playbook once per review pass.

## How to run

- **Genre:** runbook.
- **Run by:** a human or AI reviewing one code slice at a time, ideally a session
  that did NOT author the code (see "Reviewer independence"), with
  the repo mounted. The pass reads CURRENT code against its spec, so
  it is branch-free -- no baseline, no diff, no git needed for the default pass.
- **Output:** a review findings catalogue (the review doc) plus tracker rows. A
  review PASS is read-only analysis -- it records findings, it does not change
  code. REMEDIATION of those findings is a separate step that applies edits.
- **Permissions:** review pass is read-only. The optional diff lens (see "Find
  the work") uses read-only git only. Remediation applies edits with your
  confirmation. The AI never runs builds or tests.
- **After the run (you, manually):** a pure review pass needs nothing built. For
  a remediation, run `tsc`, `eslint`, and the unit tests for the touched area
  and report the result; run the `check:doc-chars` check only if documentation changed.

Follows the shared Guardrails in [`AGENTS.md`](./AGENTS.md) (no builds/tests by
the AI, read-only git, refactor over shims, host edits via Edit/Write).

## When a review is needed (the gate)

A review is a SUGGESTION the AI raises, never a hard block. The AI proposes a
review at the tier below; the maintainer always decides, and can waive. The tier
is a proxy for risk, keyed off the same signal as the `docs/design/` pre-flight
scan:

 Work shape                                                          | AI behaviour                          |
---------------------------------------------------------------------|---------------------------------------|
 Small-track pure-mechanical (rename, dead-code prune, doc-only)      | No review. AI may mention, then lands. |
 Small-track behavioural change or net-new logic                     | AI SUGGESTS a review pass.            |
 Large-track, OR net-new surface, OR touches a cross-library pattern  | AI STRONGLY SUGGESTS a review, and treats a missing one as a landing precondition (see "Landing precondition"). |

The trigger for the strong tier is the same one that fires the `docs/design/`
scan: the change is large-track, introduces a new externally- or
internally-consumed surface, or modifies a pattern documented in `docs/design/`.
When in doubt, suggest -- the cost of the suggestion is one line; the maintainer
dismisses it in one word.

## Landing precondition (suggest, do not block)

For the strong tier, a review is a landing PRECONDITION the AI treats the same
way it treats a failing `check:doc-chars` check or an uncommitted git step: before it
will SELF-INITIATE the `docs/future/` -> `docs/history/` archive move, it
confirms one of the following holds, and stops to ask if none do:

- A review pass for the landing surface is recorded and `Verified` (the
  maintainer confirmed the findings and decided remediation), OR
- The maintainer explicitly WAIVED the review for this landing.

A waiver is normal and cheap. When waived, the AI records it in the tracker
(`review waived by maintainer YYYY-MM-DD`) rather than silently skipping, so the
archive shows the decision was made, not missed. This does not change the
existing rule that the AI never archives unprompted -- it adds one item to the
landing checklist the AI walks before it offers to land.

Severity and the gate: an unresolved finding at the top severity tier (`High`,
per the Severity scale) blocks the landing unless the maintainer explicitly
waives it (recorded, as above). Medium and Low findings may land DEFERRED --
recorded with a reason and actioned later. So `Verified` means the review's High
findings are resolved or waived, not merely that a review happened. The
maintainer keeps discretion; this is the default, not a hard rule.

## Two kinds of review

The gate above applies only to the first of these:

- **Gate review** -- a quality pass on work THIS branch is about to land. It
  lives as the final phase (or a sibling doc) of the workstream it gates, and
  lands in the SAME archive. This is the review the landing precondition means.
- **Standing / periodic review** -- a recurring pass over an already-landed
  surface (the standing periodic review shape). It is its OWN workstream with no
  relationship to any single landing, and lands like any other workstream. No
  landing precondition applies to the code it reviews -- that code already
  shipped.

## Chartering a review (thin specs and legacy)

A review is never anchorless -- the request always has a reason, and capturing
that reason is what anchors the pass. How a MISSING external spec is treated
depends on the review type:

- **Gate review of new work** -- a spec was expected, so its absence is itself a
  finding (you should have had one before building).
- **Chartered review of existing / legacy code** -- the charter IS the spec; no
  retroactive design doc is demanded. Reconstruct intent from surrogate anchors
  (house conventions, tests, commit / ticket history, observable behaviour, the
  maintainer), and producing a reconstructed spec / design doc can be the
  review's OUTPUT -- which then enables sharper future passes.

Route the charter by source, like any workstream: planned / proactive ->
`docs/future/<topic>-code-review/`; problem-driven (a ticket key) ->
`docs/tickets/`. The charter lives in that workstream's plan; it is not a new
artefact.

## Reviewer independence

Run a review in a session that did NOT author the code under review. A session
reviewing its own output rationalises its own choices and inherits its own blind
spots -- the review then confirms the code instead of testing it, which is the
opposite of the point. Default to a FRESH session for the pass; reuse the
authoring session only as an explicit, noted exception (a trivial slice, or a
follow-up the maintainer accepts). This is why the pass is framed as a
self-contained request (see "Framing") -- it carries everything a cold session
needs to start.

## Framing the review request

A bare "go review this" underspecifies the pass and the reviewer
free-associates -- the result is a taste check, not a review. Before a pass
starts, the requester (a human, or the driving session) supplies four things:

- **The anchor** -- the written intent the current code must conform to. A review
  is ALWAYS chartered, so an anchor always exists, on a spectrum: at the rich end
  a full spec (the plan, a `docs/design/` doc, an OpenAPI / contract, the DTO /
  schema vocabulary); at the thin end the review's own stated "why" (even "go
  look this over for X") plus the house conventions as the always-on baseline
  (structured logging, `forbidNonWhitelisted`, the guarded front-door API, the
  repo-root `AGENTS.md` style rules). The pass verifies CURRENT code against
  the anchor ("spec-to-code", see Steps), not taste, not a diff. A review is only
  as sharp as its charter -- a thin one yields a broad, checklist-driven pass that
  often recommends writing a real spec.
- **The slice and its blast-radius boundary** -- the in-scope paths (from the
  anchor's scope or the plan's Scope section), and the cap that keeps the slice
  reviewable (see "Find the work"). A slice too big to hold in one reviewer's head
  gets phased, not skimmed.
- **The deliberate decisions / non-goals** -- what is intentional, so the pass
  does not re-flag design as debt (feeds the "Not flagged" section). Point at the
  design docs and the workstream's own decisions.
- **The severity bar for THIS surface** -- what counts as High here. An auth gap
  on the externally-routed guarded front-door API is High; the same shape on an
  internal forwarded-JWT module may be Medium.

Paste-ready request template:

> Review the CURRENT code at `<in-scope paths>` against `<anchor doc(s)>`.
> Deliberate decisions not to re-flag: `<design docs / plan decisions>`.
> This surface is `<security-sensitive | internal-only | pure-refactor>`, so
> treat `<category>` gaps as High. Record findings per the code-review playbook
> (file:line, severity, concrete suggested change); do not change code in this
> pass.

## Find the work

The slice is defined by the SPEC's scope, not by a branch diff -- the review is
branch-free by default. Both review kinds resolve the slice the same way; they
differ only in timing.

- Gate review: the in-scope paths the workstream is responsible for, from the
  plan's Scope section. Findings on pre-existing code in those paths are recorded
  and marked "pre-existing", and the maintainer decides whether they block THIS
  landing.
- Standing review: the plan's Scope section names the in-scope paths and the
  reference-only paths read for context but not reviewed.
- Blast radius: keep one pass to a slice a reviewer can hold at once -- a
  cohesive module or category, not a sprawling multi-module surface. When the
  surface is larger, split it into phases by category or module (the worked
  examples slice by review lens: correctness / code-sharing / architecture) and
  run a pass per phase. A slice too big to review carefully is re-flagged as
  "phase this", not skimmed.

Optional diff lens (secondary, opt-in). Spec-to-code catches omissions -- what
the code SHOULD do and does not. It does not catch a regression in behaviour that
no spec covers, and it cannot attribute a defect to THIS branch. When a change is
risky enough to want either, add a diff as a SECONDARY input: the maintainer runs
read-only git and exports it for the AI to read, per the "Sandbox git fallback"
in [`../AGENTS.md`](../AGENTS.md) and the Git comparison guidance in
[`AGENTS.md`](./AGENTS.md) (use three-dot `git diff main...HEAD` so main
merges do not pollute the slice; do not diff against `main` two-dot). This is
never required and never part of the default pass.

## The review artefact (findings catalogue)

Every review pass produces one findings-catalogue doc. Shape:

- **Verdict** -- one paragraph: is the surface sound, and the headline concerns.
- **Findings register** -- a compact table at the top of the catalogue, one row
  per finding: `label | severity | category | disposition | remediation ref`.
  Disposition is the ONE cell that changes over time
  (`open` / `actioned` / `deferred` / `skipped`), so finding-level churn
  concentrates here, in the review doc -- it does NOT go in the tracker, which
  stays phase-level (one row per review / remediation phase, never per finding).
  Inline by default; promote to a sibling only if it grows enough to bury the
  prose, same rule as the conformance ledger.
- **Findings** -- grouped by category, drawn from the two lens checklists below:
  the "Trust but verify" defect categories and the "Quality lenses" improvement
  categories. Each finding carries:
    - a **stable label** (`<pass>-<n>`, e.g. `P3-1`, or `F1` for a single-pass
      review) so remediation and re-review can cite it without ambiguity,
    - a **file path and line range**,
    - a **severity** (see scale below),
    - a **concrete suggested change** -- not just "this is duplicated" but what
      the shared shape would be.
- **Conformance ledger** (when an anchor exists) -- the result of the
  spec-to-code walk (Step 3): one row per anchor requirement, marked
  `found` / `violated` / `not-implemented`, with a finding reference on every
  non-`found` row. This is the proof the spec was walked item by item, and it
  makes omissions (`not-implemented`) explicit rather than buried. Keep it INLINE
  by default; promote it to a sibling `<topic>-conformance.md` (one-line pointer
  from the catalogue) only when it is large enough to bury the findings -- the
  same short-inline / long-sibling rule the decision record uses.
- **Not flagged (deliberate)** -- design the review confirmed is intentional, so
  a later pass does not re-open it. Sourced from `docs/design/` and the
  workstream's own decisions.
- **Positives** -- what the surface does well (keeps the catalogue honest and
  stops a later reader reading it as all-negative).
- **Out of scope / not reviewed** -- what this pass deliberately did not cover.

Do NOT manufacture findings. A clean pass, or a handful of findings, is a valid
and good result -- an empty register with a Positives section is a complete
review. A reviewer that pads the register with Low nits to look productive trains
the maintainer to skim it, which defeats the gate. Report what is there; if that
is little, say so plainly.

A doneness claim is not evidence. When the anchor (plan, tracker, spec) says
something is "done", "complete", "decoupled", "fixed", or "verified", that is a
prompt to LOCATE and read the implementing code before marking its conformance
row `found` -- confirm it on EVERY path, not just the reachable one (a decouple
can be done in the happy path and leave a residual elsewhere), and note any
mechanism the code relies on that the claim never mentions. A claim the code only
partly honours is a `violated` row, not `found`.

### Severity scale

- **High** -- correctness or security risk, or a duplication / complexity
  problem broad enough that leaving it materially raises the cost of the next
  change.
- **Medium** -- a real maintainability or consistency issue worth a scheduled
  fix; not urgent.
- **Low** -- a nit, a local inconsistency, or a defensive suggestion.

Comment DENSITY is not a defect on its own -- detailed WHY-comments are house
style (repo-root `AGENTS.md` "AI-Generated Comment Style"). Flag a comment
only when it is stale, wrong, or restating the signature.

## Discovery notes (optional sibling)

When a pass involves substantial raw investigation -- greps, dead ends, "what I
examined and ruled out" -- keep it OUT of the catalogue. If the trail is worth
preserving, put it in an optional `<topic>-code-review-investigation.md` sibling,
the parallel of the ticket tree's `-investigation.md` evidence doc. The catalogue
stays the clean findings record; the sibling holds the messy trail. Default is
NOT to create it -- add it only when the investigation is substantial enough to
be worth keeping, the same "optional sibling when warranted" discipline the
archive shape uses.

## Trust but verify -- what an AI-generated surface drops

AI-generated code is reviewed like an unverified third-party dependency: usually
plausible, and it drops the same categories over and over. Walk each item below
on the slice; mark N/A when the surface genuinely has none (not every slice has
an auth boundary). The point is confirmed COVERAGE, not a finding per line. Every
item is a category a real review has caught. Severities are TYPICAL,
not fixed -- the surface's severity bar (see "Framing") wins.

- **Error handling** (typ. High/Med) -- no swallowed or empty catch; failures are
  logged or surfaced, not silently returned.
- **Logging / telemetry** (typ. Med) -- new failure paths carry structured
  `msg` / `reference` logging (repo-root `AGENTS.md` "Logging"), not bare
  throws or console noise.
- **Input validation** (typ. High) -- DTO validation plus whitelist
  (`forbidNonWhitelisted`); no unvalidated external input reaching persistence;
  validation runs BEFORE any seeding / defaulting, so the whitelist is not
  bypassed.
- **Authorization** (typ. High) -- guard placement matches the documented
  boundary (the guarded front-door API is the boundary; internal APIs assume a
  forwarded JWT); `ExampleGuard` present where an owning-service
  compare-and-swap is required, and its documented no-op routes are not misread
  as a gap.
- **Edge cases** (typ. Med) -- empty / null / undefined, empty collections,
  boundary values, and ordering / concurrency between writes.
- **Atomicity** (typ. High/Med) -- multi-write sequences are atomic, or the
  non-atomicity is deliberate and documented (e.g. a non-atomic file write, an
  unscoped `deleteMany`).
- **Silent failures** (typ. High) -- no post-validation bypass or default-swallow
  that changes a documented contract (the seeding-after-`validateOrReject` class
  of bug).
- **Dead code** (typ. Low/Med) -- inert flags, env vars, branches, and methods
  left behind by a refactor.
- **Doc drift** (typ. Med) -- the code and its own JSDoc / design doc / spec
  claims agree. A divergence is a finding, but does NOT presume the code is wrong:
  the doc may be stale and the code right. Note which side looks authoritative and
  why; the maintainer decides whether to correct the code or update the doc
  (whichever is fixed lands in the same branch).

## Quality lenses -- improvements, not defects

The categories above are things the code got WRONG or dropped. These are things
it could do BETTER -- maintainability, not correctness -- so they land Medium/Low
and lean on judgement. Walk each, but with restraint: flag only MATERIAL
improvements, respect the "Not flagged (deliberate)" section, and heed the house
rule against over-engineering (repo-root `AGENTS.md`: look for sharing but
do not overengineer). A review that suggests speculative abstraction is itself
the problem it is meant to catch.

- **Code sharing / duplication** (typ. Med) -- near-identical bodies a shared
  shape would collapse; but do NOT force sharing that couples otherwise unrelated
  code.
- **Large / complex methods** (typ. Med) -- a method doing too much; suggest a
  concrete split (orchestrator + steps), not just "this is long".
- **Best practices** (typ. Low/Med) -- deviations from the repo-root
  `AGENTS.md` code style and structure rules, not generic taste.
- **Over-engineering** (typ. Low/Med) -- abstraction, indirection, or config with
  a single caller and no second on the horizon. The lens cuts both ways: flag
  needless structure, not only missing structure.
- **Other improvements** (typ. Low) -- the residual bucket; concrete suggestions
  only, no vibes.

## Review pass vs remediation

Keep analysis and code change separate, as the worked examples do:

- A **review pass** is analysis only. It is `Complete` when its findings are
  recorded, and `Verified` when the maintainer has confirmed the findings and
  decided which to remediate. `Verified` is the state the landing precondition
  checks.
- A **remediation** is the code change that actions a finding. It is a separate
  phase, sub-lettered against the review pass that produced it (`phase-01` review
  -> `phase-01b` / `01c` remediation), so a fix stays tied to its source finding.
  The next review pass keeps the next whole number (`phase-02`).
- A **refactor remediation** -- code sharing, a large-method split, any reshape
  whose contract is byte-stable output -- captures a characterization
  (golden-snapshot) test of the CURRENT output BEFORE the reshape, so the change
  can prove it altered nothing. The test is created per the workspace convention
  (the maintainer runs it) and stays as permanent regression protection, not
  scaffolding to revert. This is the refactor safety net.
- **Re-review** when remediation reshaped the surface materially. A round is a
  fresh review pass over the changed code (the `round-2` / `round-3` shape in a
  prior multi-round review). Do not re-review a one-line fix.

A round is NOT the same as reviewing the surface again LATER. A later review with
a new charter is a new pass, not a round: if the original review is still in
`docs/future/`, it is the next numbered pass in the same standing workstream; if
the original has LANDED to `docs/history/`, it is a brand-new chartered review
workstream that CITES the archived original and reads it first -- never a reopen
of the archive -- so it does not re-surface actioned findings or re-flag
deliberate decisions.

Each finding ends in one of: actioned (remediation phase landed), deferred
(recorded with a reason, left for later), or skipped (maintainer decided no
change). The findings register carries this disposition per label; the tracker
stays phase-level and never grows a per-finding row.

When actioned findings interact -- one must be settled before another can be
built (e.g. a scoping decision the shared abstraction depends on) -- the review
recommends a remediation ORDER. Frame it as code-state dependencies on the branch
(X is in place before Y), not deploy ordering, per the workstream lifecycle rules.

## How it plugs into the workstream

The workstream files reference this playbook; they do not copy it:

- The **plan** (or the review-pass phase doc) names the scope and the slice
  under review, and links here for the method and severity scale.
- The **tracker** carries per-pass status with the standard tokens
  (`Not started` / `In progress YYYY-MM-DD` / `Complete YYYY-MM-DD` /
  `Verified YYYY-MM-DD` / `Blocked YYYY-MM-DD`), one row per review or
  remediation phase, plus the waiver note if the review was waived at landing.
- The **findings catalogue** is the review doc itself (the artefact above).

For a gate review these live inside the gated workstream's folder and land in
its archive. For a standing review they are the workstream (its own
`<topic>-code-review/` folder).

## Steps

1. **Establish scope and the anchor.** List the in-scope paths and the
   reference-only paths (from the plan's Scope), and name the anchor the current
   code is reviewed against (see "Framing"). Both review kinds resolve scope from
   the spec, not a branch diff.
2. **Read the deliberate-decisions inputs first.** Grep `docs/design/*.md` for
   the in-scope paths and read the workstream's own decisions, so the pass does
   not re-flag intentional design as a defect. Capture these in the
   "Not flagged (deliberate)" section up front.
3. **Spec-to-code conformance.** Derive a conformance checklist from the anchor --
   every documented behaviour, contract, shape, and invariant -- then verify each
   against the CURRENT code: found, violated, or not-implemented. Not-implemented
   is an OMISSION (the class a diff cannot see) and is the highest-value finding
   for AI-generated code. This is the primary lens; with only a thin charter it
   leans harder on the house conventions and step 4. Record the walk as the
   conformance ledger (see the artefact shape). A `violated` row is a
   DIVERGENCE, not automatically a code bug -- the spec may be stale and the code
   right; flag it, note which side looks authoritative, and leave the fix
   direction to the maintainer.
4. **Walk the "Trust but verify" checklist** over the slice -- each item found,
   N/A, or flagged.
5. **Walk the "Quality lenses" checklist** for what the anchor and the "Trust but
   verify" checklist do not cover: code sharing, large-or-complex methods, best
   practices, over-engineering, other improvements -- each with restraint
   (material only).
6. **Assemble the catalogue** -- the Verdict, the findings register
   (`label | severity | category | disposition | remediation ref`), and the
   findings grouped by category, each with a stable label, file path, line range,
   severity, and a concrete suggested change.
7. **Cross-reference** any finding already logged by a prior pass or tracked as
   known debt, so the record shows it is known, not new.
8. **Add Positives, Not-flagged, and Out-of-scope** sections.
9. **Set the review phase to `Complete`** and hand to the maintainer for
   `Verified` plus the remediation decision.
10. **Remediate** actioned findings as sub-lettered phases (each with the
    maintainer's confirmation, per Guardrails).
11. **Re-review** only if remediation reshaped the surface materially.

## Checklist

- Review run in a session that did not author the code (or the reuse noted as an
  exception)
- Anchor identified (full spec or the review's charter) and CURRENT code verified
  against it; a missing external spec on NEW work recorded as a finding
- Conformance ledger recorded (inline or sibling) when an anchor exists
- Doneness claims ("done" / "fixed" / "verified") confirmed in code on every path,
  not accepted from the spec
- "Trust but verify" checklist walked; each item found, N/A, or flagged
- "Quality lenses" checklist walked with restraint (material improvements only)
- Deliberate-design inputs (`docs/design/`, workstream decisions) read BEFORE
  flagging, and captured in "Not flagged"
- Every finding has a stable label, file:line, a severity, and a concrete
  suggested change
- Findings register present; disposition tracked there, not in the tracker
- Positives and Out-of-scope sections present
- No manufactured findings; a clean or thin pass reported honestly
- Refactor remediations guarded by a characterization test captured before the
  reshape
- Review phase set `Complete`; maintainer sets `Verified` and the remediation call
- Remediations sub-lettered against their source review pass
- For a gate landing: a `Verified` review exists OR the maintainer's waiver is
  recorded in the tracker; no unresolved `High` finding remains unless waived

## Verify (you, manually)

Per the Guardrails, the AI does not run builds or tests. A pure review pass
changes no code and needs no build. After a REMEDIATION's edits are confirmed,
run the following and report the result:

- `tsc` and `eslint` over the touched area.
- The unit tests for the touched area (created per the workspace test
  convention; the maintainer runs them).
- The `check:doc-chars` check only if documentation changed.

## Related documentation

- [`AGENTS.md`](./AGENTS.md) -- the shared playbook contract and canonical
  Guardrails / Git comparison.
- Repo-root [`AGENTS.md`](../../AGENTS.md) -- code style, comment style, and
  the `docs/design/` pre-flight scan that shares the strong-tier trigger.
- [`../AGENTS.md`](../AGENTS.md) "Workstream Lifecycle" -- tracks, the landing
  flow this gate precedes, and the tracker status tokens.
- Prior reviews (pre-playbook, for catalogue shape only -- not canonical here):
  a multi-round example
  `docs/history/<YYYY>/YYYY-MM-DD-example-code-review/`
  and a standing periodic review
  `docs/future/example-code-review/`.
