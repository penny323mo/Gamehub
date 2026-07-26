#!/usr/bin/env bash

set -euo pipefail

mode="${1:---check}"
if [[ "${mode}" != "--check" && "${mode}" != "--sync" ]]; then
  echo "Usage: $0 [--check|--sync]" >&2
  exit 64
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

cd "${repo_root}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: ${repo_root} is not a Git worktree." >&2
  exit 1
fi

echo "Game Hub agent context"
echo "Repository: ${repo_root}"
echo "Branch: $(git branch --show-current || true)"
echo "HEAD: $(git rev-parse --short HEAD) $(git log -1 --format=%s)"

worktree_dirty=0
if [[ -n "$(git status --porcelain=v1)" ]]; then
  worktree_dirty=1
fi

sync_blocked=0

if git remote get-url origin >/dev/null 2>&1; then
  echo "Fetching origin (no merge or checkout)..."
  git fetch --prune origin
else
  echo "WARNING: origin remote is not configured."
fi

upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
if [[ -n "${upstream}" ]]; then
  read -r ahead behind < <(git rev-list --left-right --count "HEAD...${upstream}")
  echo "Upstream: ${upstream}"
  echo "Ahead/behind before sync: ${ahead}/${behind}"

  if [[ "${mode}" == "--sync" && "${ahead}" == "0" && "${behind}" != "0" && "${worktree_dirty}" == "0" ]]; then
    echo "Safe sync: fast-forwarding from ${upstream}..."
    git pull --ff-only
    read -r ahead behind < <(git rev-list --left-right --count "HEAD...${upstream}")
    echo "Ahead/behind after sync: ${ahead}/${behind}"
  elif [[ "${mode}" == "--sync" && "${behind}" != "0" ]]; then
    echo "ERROR: branch is behind but safe automatic sync conditions are not met." >&2
    echo "Preserve local work and inspect status/divergence before pulling." >&2
    sync_blocked=1
  elif [[ "${ahead}" != "0" || "${behind}" != "0" ]]; then
    echo "WARNING: local HEAD and ${upstream} are not identical. Inspect before editing."
  fi
else
  echo "WARNING: current branch has no upstream."
  sync_blocked=1
fi

if [[ "${worktree_dirty}" != "0" ]]; then
  echo "Worktree: DIRTY"
  git status --short
  echo "WARNING: preserve existing changes and identify their owner before editing."
  sync_blocked=1
else
  echo "Worktree: clean"
fi

if git show-ref --verify --quiet refs/remotes/origin/main; then
  read -r main_ahead main_behind < <(git rev-list --left-right --count HEAD...origin/main)
  echo "HEAD vs origin/main: ${main_ahead}/${main_behind}"
fi

echo
echo "Latest commits:"
git log -8 --format='  %h  %ad  %s' --date=short

echo
echo "Latest handoff commit:"
handoff_commit="$(git log -1 --format='%h  %ad  %s' --date=short -- docs/ai/HANDOFF.md 2>/dev/null || true)"
if [[ -n "${handoff_commit}" ]]; then
  echo "  ${handoff_commit}"
else
  echo "  not committed yet"
fi

echo
echo "Required reading:"
echo "  AGENTS.md"
echo "  docs/ai/PROJECT_CONTEXT.md"
echo "  docs/ai/HANDOFF.md"
echo "  relevant entries in docs/ai/DECISIONS.md"

if [[ "${mode}" == "--sync" && ( "${sync_blocked}" != "0" || "${ahead:-0}" != "0" || "${behind:-0}" != "0" ) ]]; then
  echo "ERROR: safe start conditions are not satisfied; do not begin a new task yet." >&2
  exit 2
fi
