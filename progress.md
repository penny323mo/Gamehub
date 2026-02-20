Original prompt: website 開。。。。snake-game打開空白

- Initialized investigation for snake-game blank page from hub launcher.
- Checked launcher link points to games/snake-game/dist/index.html.
- Verified dist exists and uses relative asset paths.
- Next: reproduce in browser and inspect console/runtime errors.

- Rebuilt games/snake-game dist artifacts for static hosting.
- Next: validate launcher navigation from hub to snake game in browser.
- Root cause: games/snake-game/.gitignore excluded dist, causing missing build files on fresh checkout.
- Fix: allow tracking dist artifacts required by hub launcher.
- Verified via Playwright: Game Hub -> Neon Snake now loads /games/snake-game/dist/index.html with visible UI (not blank).
