/**
 * GameHub – Shared Online Utilities
 *
 * Provides a unified, non-blocking toast notification system to replace
 * native browser alert() calls across all multiplayer games.
 *
 * Usage:
 *   showOnlineToast('房間已滿', 'warn');
 *   showOnlineToast('網絡錯誤，請重試', 'error');
 *   showOnlineToast('已成功加入房間', 'success');
 *   showOnlineToast('等待對手加入…', 'info');
 *
 * Types: 'error' | 'warn' | 'info' | 'success'
 * Default type: 'error'
 * Default duration: 3500 ms
 */

(function () {
    if (window.showOnlineToast) return; // already loaded

    const CSS_ID = 'gh-online-toast-styles';
    const CONTAINER_ID = 'gh-toast-container';

    const STYLES = `
        #${CONTAINER_ID} {
            position: fixed;
            bottom: 28px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            display: flex;
            flex-direction: column-reverse;
            gap: 8px;
            align-items: center;
            pointer-events: none;
        }
        .gh-toast {
            padding: 10px 22px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            font-family: system-ui, -apple-system, sans-serif;
            color: #fff;
            opacity: 0;
            transform: translateY(12px);
            transition: opacity 0.25s ease, transform 0.25s ease;
            pointer-events: none;
            max-width: 380px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
            line-height: 1.4;
        }
        .gh-toast.gh-show {
            opacity: 1;
            transform: translateY(0);
        }
        .gh-toast.error   { background: #c0392b; }
        .gh-toast.warn    { background: #d35400; }
        .gh-toast.info    { background: #2471a3; }
        .gh-toast.success { background: #1e8449; }
    `;

    const MAX_TOASTS = 5;

    function ensureContainer() {
        const existing = document.getElementById(CONTAINER_ID);
        if (existing) return existing;

        if (!document.getElementById(CSS_ID)) {
            const s = document.createElement('style');
            s.id = CSS_ID;
            s.textContent = STYLES;
            document.head.appendChild(s);
        }

        const c = document.createElement('div');
        c.id = CONTAINER_ID;
        document.body.appendChild(c);
        return c;
    }

    /**
     * @param {string} msg      - Message to display
     * @param {'error'|'warn'|'info'|'success'} [type='error'] - Toast type
     * @param {number} [duration=3500] - Auto-dismiss delay in ms
     */
    window.showOnlineToast = function (msg, type, duration) {
        type = type ?? 'error';
        duration = duration ?? 3500;

        const container = ensureContainer();
        // Evict the oldest toast if we've hit the cap
        if (container.childElementCount >= MAX_TOASTS) container.firstElementChild.remove();
        const toast = document.createElement('div');
        toast.className = 'gh-toast ' + type;
        toast.textContent = msg;
        container.appendChild(toast);

        // Trigger enter animation
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.classList.add('gh-show');
            });
        });

        // Auto-dismiss
        setTimeout(function () {
            toast.classList.remove('gh-show');
            setTimeout(function () { toast.remove(); }, 300);
        }, duration);
    };
}());
