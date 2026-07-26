# Claude Code entrypoint for Game Hub

The canonical cross-agent workflow is defined by:

- `AGENTS.md`
- `docs/ai/PROJECT_CONTEXT.md`
- `docs/ai/HANDOFF.md`
- `docs/ai/DECISIONS.md`

GitHub is the relay point between agents. At the start of a sequential cloud task,
make sure the checkout is on the intended branch, then run
`./scripts/agent-context.sh --sync`. This fetches origin and safely fast-forwards a
clean branch that is only behind. If the environment cannot run the script,
perform the equivalent fetch, status, upstream, and ahead/behind checks manually.
Only after synchronization should you read the files above in that order. Treat
`AGENTS.md` as mandatory repository instructions for Claude Code as well as Codex.

Do not rebuild context by scanning the whole repository when the handoff is
current. Start from the handoff's active scope, named commits, changed files,
verification results, and next action. Verify those claims against Git and the
relevant source before editing.

Before handing work back, update `docs/ai/HANDOFF.md`, run the relevant checks and
`./scripts/check-handoff.sh`, and keep the code plus handoff update in the same
commit. When Penny has authorized the relay, push it to GitHub and verify the
remote branch contains the handoff commit. The local Codex agent will fetch and
fast-forward from that remote state before continuing.
