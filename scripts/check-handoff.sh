#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
handoff="${repo_root}/docs/ai/HANDOFF.md"

required_files=(
  "AGENTS.md"
  "CLAUDE.md"
  "docs/ai/PROJECT_CONTEXT.md"
  "docs/ai/HANDOFF.md"
  "docs/ai/DECISIONS.md"
)

required_sections=(
  "## Current objective"
  "## Completed"
  "## Changed files"
  "## Verification"
  "## Known issues and cautions"
  "## Exact next action"
  "## Do not redo"
)

failed=0

for path in "${required_files[@]}"; do
  if [[ ! -s "${repo_root}/${path}" ]]; then
    echo "ERROR: missing or empty ${path}" >&2
    failed=1
  fi
done

if [[ -s "${handoff}" ]]; then
  for heading in "${required_sections[@]}"; do
    if ! grep -Fqx "${heading}" "${handoff}"; then
      echo "ERROR: HANDOFF.md is missing heading: ${heading}" >&2
      failed=1
    fi
  done

  line_count="$(wc -l < "${handoff}" | tr -d ' ')"
  if (( line_count > 120 )); then
    echo "ERROR: HANDOFF.md has ${line_count} lines; keep it at or below 120." >&2
    failed=1
  fi
fi

if (( failed != 0 )); then
  exit 1
fi

echo "HANDOFF_CHECK=PASS"
echo "HANDOFF_LINES=$(wc -l < "${handoff}" | tr -d ' ')"
