// Boot (no-module)
(() => {
  const { makeGame, bindUI, render } = window.DDZ;
  const game = makeGame();
  bindUI(game);
  window.__ddz = game;
  game.actions.restart();
  render(game);
})();
