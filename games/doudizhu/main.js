// Boot (no-module)
(() => {
  const { makeGame, bindUI, render } = window.DDZ;
  const game = makeGame();
  bindUI(game);
  window.__ddz = game;
  // 唔自動開始，等用戶撳開始按鈕
  render(game);
})();
