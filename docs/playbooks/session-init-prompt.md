# Session Init -- Prompt

Paste this at the START of a fresh AI session, before giving it any task. It
primes the agent on this repo's conventions and working rules and asks it to
acknowledge before doing anything. After that, keep your task prompts short and
intent-level -- the agent already knows where things go and how work is shaped.

## How to run

- **Genre** -- AI-actuated prompt.
- **Run by** -- paste into a fresh AI session with this repo open (or mounted).
- **Output** -- an acknowledged, primed session. No code or files changed yet.
- **Permissions** -- read-only until you give it a task.
- **After the run (you)** -- give the task in plain intent, e.g. "add rate
  limiting to /login and write the plan" or "land ticket <TICKET>". The agent
  applies the conventions from the docs; you do not spell out folder paths.

## The prompt

> Before doing anything else, read `/AGENTS.md` and `docs/getting-started.md` in
> full and follow them for the rest of this session. If your tool needs it,
> request access to the repo folder(s) now.
>
> These rules are in force from the start; the docs carry the complete set, so
> read them there:
>
> - Do not run `git`, `tsc`, `eslint`, or tests yourself -- ask me to run them
>   and report back.
> - Do not change code without my confirmation unless the task explicitly asks
>   for it.
> - Prefer full refactoring over shims: reshape the code directly; do not
>   scaffold parallel paths, wrappers, or intermediate types that exist only to
>   be removed later.
> - No phase/step/plan markers in code comments (e.g. `// Phase 1: ...`). Leave a
>   `// TODO` for a deliberate gap and record the follow-up in the relevant doc.
> - Documentation is ASCII-only.
> - Ask questions as plain text with the context I need, not as UI components.
>
> One workstream per piece of work: before creating a plan or ticket folder,
> search `docs/future/`, `docs/history/`, and the tickets tree for an existing
> one covering this work and reuse it -- do not start a second folder for the
> same thing.
>
> When you have read the docs, acknowledge back to me: which track you would use
> for a small change, where a landed workstream ends up, and that you will not
> run builds or tests on your own. Then wait for my task.

## Related

- `/AGENTS.md` -- code-style and working rules (the authoritative set).
- `docs/getting-started.md` -- how the documentation system works.
- `docs/AGENTS.md` -- the documentation lifecycle contract.
