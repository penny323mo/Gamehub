# Snooker 3D Online Verification And Handoff

Date: 2026-04-22
Repo: `/Users/a123/AI/antigravity/Gamehub`
Scope: `games/snooker/3d` online multiplayer, current local checkout

## Executive Summary

3D online mode was retested end-to-end with two real Chrome clients against the current local checkout and live Supabase backend.

One real bug was reproduced and fixed:

- Start/rematch race could leave one client logically in `playing` on the backend, but still visually stuck behind the room overlay because a late `waiting` update reopened the overlay after the client had already entered the match.

The fix is now in:

- `games/snooker/online.js:971-1046`

The fixed build passed this full sequence on a clean room:

1. Join room with two clients
2. Both players ready
3. Match starts
4. One real shot is sent and observed on the peer
5. Backend shot/state rows are written
6. Game is forced to `finished`
7. Both clients press rematch
8. Room returns to `waiting`
9. Both clients ready again
10. Room returns to `playing`
11. Both clients re-enter the fresh round with overlay hidden and serials reset

## What Was Fixed

### Symptom

During start-game or post-rematch restart, the client that lost the `start_snooker_game` race could still receive a stale `waiting` room update after the backend had already moved the room to `playing`.

That produced this visible failure mode:

- backend room status already `playing`
- both players already `ready=true`
- one client canvas resumed correctly
- the other client had the online overlay reopened and could not continue

### Root Cause

`renderRoomState()` relied on `SnookerOnline.lastObservedStatus` to suppress stale `waiting` updates, but that flag was only effectively safe on the winner path.

The loser path of the start race had two problematic branches:

1. `start_snooker_game` returned `data.skipped`
2. direct-update fallback lost the `.eq(status,'waiting')` race and got an empty result

In those branches, the client did not immediately mark itself as logically `playing`, so a delayed `waiting` update could still reopen the overlay.

### Fix

Added a shared `primePlayingTransition()` helper in `games/snooker/online.js` that:

- sets `SnookerOnline.lastObservedStatus = 'playing'`
- stops `roomPoll`

Then applied it in all start-race paths:

- normal start winner path
- `data.skipped` loser path
- fallback direct-update loser path

Also changed the local `playing` notification payload to pass a `startedRoom` object with:

- `status: 'playing'`
- `current_turn: room.current_turn || 'player1'`

This keeps the 3D page from seeing a stale `waiting` room object during the transition.

## Files Changed

- `games/snooker/online.js`

No schema or API changes were made.

## Verification Evidence

Primary success artifacts:

- Report: `/Users/a123/AI/antigravity/Gamehub/games/snooker/3d/output/online-verify-20260422-postfix-final/report.json`
- Final client screenshot 1: `/Users/a123/AI/antigravity/Gamehub/games/snooker/3d/output/online-verify-20260422-postfix-final/p1-final.png`
- Final client screenshot 2: `/Users/a123/AI/antigravity/Gamehub/games/snooker/3d/output/online-verify-20260422-postfix-final/p2-final.png`

The final report records these completed steps:

- `open_pages`
- `set_names`
- `joined_room`
- `clicked_ready`
- `match_started`
- `shot_synced`
- `backend_after_shot`
- `finished`
- `waiting_after_rematch`
- `restarted`

Relevant fixed code section:

- `/Users/a123/AI/antigravity/Gamehub/games/snooker/online.js:971`
- `/Users/a123/AI/antigravity/Gamehub/games/snooker/online.js:978`
- `/Users/a123/AI/antigravity/Gamehub/games/snooker/online.js:1011`
- `/Users/a123/AI/antigravity/Gamehub/games/snooker/online.js:1034`

## Backend Status During This Run

Live RPC checks on 2026-04-22 succeeded:

- `join_snooker_room`
- `toggle_snooker_ready`
- `exit_snooker_room`

During the successful 3D verification run, backend evidence also showed:

- room status transitions: `waiting -> playing -> finished -> waiting -> playing`
- `shot` payload row inserted
- `state_sync` payload row inserted
- `round_id` incremented on rematch

So the current blocker was client transition handling, not missing RPC deployment.

## Remaining Risks And Follow-Up Work For Claude Code

These are the highest-value next tasks:

1. Add deterministic regression automation for the exact race that was fixed.
   Suggested target:
   - browser-based two-client script
   - assert that after rematch and re-ready, both clients have:
     - overlay hidden
     - `shotSerial === 0`
     - `lastAppliedSnapshotSerial === 0`
     - `turnState === 'PLACE_CUE'`
     - same `roundId`

2. Harden room-state race handling further.
   Suggested direction:
   - centralize transition guards around `room.status`, `round_id`, and a monotonic local phase
   - avoid relying only on `lastObservedStatus`
   - treat stale `waiting` after confirmed local `playing` as ignorable until round changes again

3. Review whether the 3D page should explicitly clear overlay on every authoritative `playing` update, not only on winner-path assumptions.
   Current fix works, but the state machine is still distributed between `online.js` and `3d/main.js`.

4. Add explicit assertions around rematch/reset cleanup.
   Useful checks:
   - `ready` UI visible only in real waiting state
   - rematch button hidden after reset
   - no stale foul-decision UI survives a new round
   - both clients receive the same `round_id`

5. Investigate aim-direction drift after authoritative final snapshot.
   Observation:
   - in an earlier in-progress state, one client showed a different `aimDir` during a foul-decision snapshot while the actual balls, score, cue placement mode, and final round state matched
   Impact:
   - not proven user-visible in this run
   - likely low severity
   Suggested action:
   - verify whether `aimDirection` should be normalized or reinitialized more aggressively when authoritative post-shot snapshots are applied

## Suggested Claude Code Prompt

Use this prompt as the next handoff:

```text
Read /Users/a123/AI/antigravity/Gamehub/games/snooker/3d/output/online-verify-20260422-postfix-final/CLAUDE_CODE_HANDOFF.md and /Users/a123/AI/antigravity/Gamehub/games/snooker/3d/output/online-verify-20260422-postfix-final/report.json.

Context:
- 3D online multiplayer was retested on 2026-04-22 with two real Chrome clients.
- A start/rematch race in games/snooker/online.js was fixed.
- The current fix passed join, ready, shot sync, finished, rematch, and restart on 3D-ROOM01.

Task:
- Improve the snooker online state machine further.
- First add a deterministic automated regression check for the rematch/start race that was fixed.
- Then review whether stale waiting/playing transitions can be modeled more cleanly across games/snooker/online.js and games/snooker/3d/main.js.
- Keep changes minimal and additive.
- Do not change backend schema unless strictly necessary.
- Re-run verification with two clients and record new evidence.
```

## Notes

- This handoff only covers 3D online mode.
- The successful validation used the current local checkout plus live Supabase backend on 2026-04-22.
- Earlier failed output folders from this date exist, but they reflect debugging iterations and script mistakes before the final validated pass.
