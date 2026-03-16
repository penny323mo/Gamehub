// Boot (no-module)
(() => {
  const { makeGame, bindUI, render } = window.DDZ;
  const game = makeGame();
  bindUI(game);
  window.__ddz = game;
  window.gameMode = 'landing';

  // Expose mode switcher
  window.setGameMode = function(mode) {
    window.gameMode = mode;
    document.getElementById('landing-page')?.classList.add('hidden');
    document.getElementById('online-lobby')?.classList.add('hidden');
    document.getElementById('doudizhu-game')?.classList.add('hidden');

    if (mode === 'landing') {
      document.getElementById('landing-page')?.classList.remove('hidden');
    } else if (mode === 'online-lobby') {
      document.getElementById('online-lobby')?.classList.remove('hidden');
      if (window.initOnlineMode) window.initOnlineMode();
    } else if (mode === 'local') {
      document.getElementById('doudizhu-game')?.classList.remove('hidden');
      render(game);
    } else if (mode === 'online') {
      document.getElementById('doudizhu-game')?.classList.remove('hidden');
      render(game); // Will be driven by network state
    }
  };

  // Initially show landing
  window.setGameMode('landing');
})();
