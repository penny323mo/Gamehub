# Game Hub agent entrypoint

This repository uses the shared handoff protocol in `docs/ai/`. These rules apply
to Codex and any other coding agent working in this checkout.

## Start every task

1. In a local checkout, run `./scripts/agent-context.sh --sync` from the repository
   root before reading handoff files. It fetches origin and only performs an
   automatic `pull --ff-only` when the worktree is clean and the current branch is
   strictly behind its upstream.
2. If the script reports local changes, unpushed commits, missing upstream, or
   divergence, preserve that state and resolve or report it before new edits.
3. Read `docs/ai/PROJECT_CONTEXT.md` and `docs/ai/HANDOFF.md` completely after the
   sync check, so the handoff comes from the newest available commit.
4. Read only the decision records relevant to the active scope in
   `docs/ai/DECISIONS.md`.
5. Inspect the commits and files named by the handoff before broad codebase
   exploration.
6. If the branch is behind, dirty, diverged, or not the branch named by the
   handoff, resolve or report that state before editing. Never overwrite another
   agent's uncommitted work.

Do not rescan the whole repository unless the handoff is missing, stale, or
contradicted by current code. Git history and current source are authoritative;
handoff documents are navigation aids, not substitutes for verification.

## Work and verification

- Keep each task scoped to one game or one shared subsystem where practical.
- For sequential handoff, finish, verify, commit, and push before the next agent
  starts.
- For simultaneous work, use separate `codex/<task>` and `claude/<task>` branches.
  Do not let two agents edit the same files on `main` concurrently.
- Run the checks listed for the affected area in `docs/ai/PROJECT_CONTEXT.md`.
- Browser-visible gameplay changes require a real browser smoke test. A build
  alone does not certify visuals, controls, or game feel.
- Do not expose credentials or apply Supabase migrations without explicit
  authorization.

## Finish every completed task

1. Update `docs/ai/HANDOFF.md`; replace the previous active handoff rather than
   appending an endless diary.
2. Update `PROJECT_CONTEXT.md` only when the architecture or commands changed.
3. Add to `DECISIONS.md` only for durable decisions future agents must preserve.
4. Run `./scripts/check-handoff.sh`.
5. Commit code and handoff changes together. The commit containing the handoff is
   the durable checkpoint; do not paste secrets, generated logs, or chat transcripts.
6. When Penny has authorized cloud handoff, push the commit and verify the remote
   branch contains it. Then report the branch, commit, checks, known issues, and
   exact next action. Never claim handoff is available to the other agent before
   the push is verified.

The legacy root `progress.md` files are historical only. Do not use them as the
current cross-agent handoff.
