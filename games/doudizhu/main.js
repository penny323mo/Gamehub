// Boot (no-module)
(() => {
  const { makeGame, bindUI, render } = window.DDZ;
  const game = makeGame();
  bindUI(game);
  window.__ddz = game;
  window.gameMode = 'landing';

  // 重新開始按鈕由 ui.js 統一綁定（confirm + 重繪 + CPU loop），呢度唔好重複綁
  document.getElementById('exitGameBtn')?.addEventListener('click', () => {
    if (window.gameMode === 'online') {
      // Online mode: properly leave the room before going back to landing
      if (window.exitFixedRoom) { window.exitFixedRoom(); return; }
    }
    window.setGameMode('landing');
  });

  // Expose mode switcher
  window.setGameMode = function(mode) {
    window.gameMode = mode;
    document.getElementById('landing-page')?.classList.add('hidden');
    document.getElementById('online-lobby')?.classList.add('hidden');
    document.getElementById('doudizhu-game')?.classList.add('hidden');

    if (mode === 'landing') {
      document.getElementById('landing-page')?.classList.remove('hidden');
      document.getElementById('topbarActions')?.classList.add('topbar__actions--hidden');
      document.getElementById('exitGameBtn')?.classList.add('hidden');
    } else if (mode === 'online-lobby') {
      document.getElementById('online-lobby')?.classList.remove('hidden');
      document.getElementById('topbarActions')?.classList.add('topbar__actions--hidden');
      document.getElementById('exitGameBtn')?.classList.add('hidden');
      if (window.initOnlineMode) window.initOnlineMode();
    } else if (mode === 'local') {
      document.getElementById('doudizhu-game')?.classList.remove('hidden');
      document.getElementById('topbarActions')?.classList.remove('topbar__actions--hidden');
      document.getElementById('exitGameBtn')?.classList.remove('hidden');
      render(game);
    } else if (mode === 'online') {
      document.getElementById('doudizhu-game')?.classList.remove('hidden');
      document.getElementById('topbarActions')?.classList.remove('topbar__actions--hidden');
      document.getElementById('exitGameBtn')?.classList.remove('hidden');
      render(game); // Will be driven by network state
    }
  };

  // Initially show landing
  window.setGameMode('landing');
})();
