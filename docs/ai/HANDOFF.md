# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex
Integration branch: `main`
Observed baseline before handoff setup: `b9707bf686397413b4d658a5714e57db56019e81`
Status: protocol ready; the Git commit containing this file is the shared
checkpoint for the receiving agent

## Current objective

Establish a durable Codex/Claude Code handoff system so either agent can resume
from a small, verified context packet instead of rescanning the whole Game Hub.

## Completed

- Synchronized the local checkout with GitHub `origin/main` at `b9707bf`.
- Confirmed the main Claude cloud work branch
  `claude/3d-tower-defense-game-rld6ts` pointed to the same commit as `main` at
  synchronization time.
- Added shared entry instructions for Codex and Claude Code.
- Added a stable architecture and verification map.
- Added a durable decision log and current-handoff format.
- Added a start-of-task tool that fetches GitHub and safely fast-forwards a clean,
  strictly-behind branch before the agent reads handoff files.
- Added handoff validation tooling and explicit local-Codex/cloud-Claude start
  rules.

## Changed files

- `AGENTS.md`
- `CLAUDE.md`
- `docs/ai/PROJECT_CONTEXT.md`
- `docs/ai/HANDOFF.md`
- `docs/ai/DECISIONS.md`
- `scripts/agent-context.sh`
- `scripts/check-handoff.sh`

## Verification

- `bash -n scripts/agent-context.sh scripts/check-handoff.sh`: PASS.
- `./scripts/check-handoff.sh`: PASS (`HANDOFF_LINES=66` before this result update).
- `./scripts/agent-context.sh --check`: PASS; fetched origin, reported `main` at
  `b9707bf`, ahead/behind `0/0`, and identified the uncommitted setup files.
- `./scripts/agent-context.sh --sync` dirty-worktree guard: PASS; refused to start
  a new task and returned the documented non-zero status without pulling.
- Cross-file reference check for all entrypoints, documents, and scripts: PASS.
- Credential-pattern scan: PASS.
- Entrypoint/path/trackability review: PASS.
- `shellcheck` is unavailable locally; `bash -n` is the recorded shell syntax
  substitute.
- No game runtime behavior changed, so game builds are not required for this
  documentation/tooling-only task.

## Known issues and cautions

- The root `progress.md` is a historical Snake Game note from February 2026 and is
  not the active handoff.
- Some old remote Claude/auto branches are not ancestors of `main`; do not merge
  them without a content-level review.
- GitHub Pages CI currently performs the full automated lint/test/build sequence
  only for Ashen Rail. Other games still need targeted checks and browser smoke.
- The repository historically tracks several `.DS_Store` and output artifacts even
  though `.gitignore` now ignores new ones. Cleanup is outside this handoff task.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` on the intended branch.
2. Read `CLAUDE.md`, `PROJECT_CONTEXT.md`, this handoff, and relevant decisions.
3. Run `./scripts/check-handoff.sh`, confirm GitHub/local alignment, then replace
   this handoff with the next scoped Game Hub task state.

## Do not redo

- Do not create a second parallel handoff file or revive root `progress.md`.
- Do not copy entire chat transcripts or secrets into repository context files.
- Do not scan every game unless current source contradicts this context map.
