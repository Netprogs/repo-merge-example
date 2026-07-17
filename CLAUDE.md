# CLAUDE.md

See [AGENTS.md](./AGENTS.md).

Documentation conventions live in [docs/AGENTS.md](./docs/AGENTS.md); start with
[docs/getting-started.md](./docs/getting-started.md).

This repo is a runnable branch-reconciliation example: a long-lived `refactor`
branch kept current against a moving `main`. To work a reconciliation, prime a
session with [docs/playbooks/session-init-prompt.md](./docs/playbooks/session-init-prompt.md),
then run the sweep per
[docs/playbooks/branch-reconciliation-prompt.md](./docs/playbooks/branch-reconciliation-prompt.md).
