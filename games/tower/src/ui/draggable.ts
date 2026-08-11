/**
 * Long-press-to-drag floating UI panels.
 *
 * Hold a panel for ~0.45s to pick it up, drag it anywhere, release to place.
 * Positions persist to localStorage (stored as fractions of the available
 * viewport so they survive rotation / different screen sizes) and are
 * clamped back on-screen on resize. Designed for touch-first play but works
 * with a mouse too.
 */

const LS_KEY = 'towerDefense.uiLayout.v1';
const HOLD_MS = 450;
const MOVE_TOLERANCE = 12; // px of finger drift allowed while holding

interface PanelPos { x: number; y: number } // fractions of (viewport - panel size)
type LayoutStore = Record<string, PanelPos>;

function loadLayout(): LayoutStore {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || '{}') as LayoutStore;
    } catch {
        return {};
    }
}

function saveLayout(layout: LayoutStore): void {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(layout));
    } catch {
        // storage full/blocked — dragging still works for this session
    }
}

let layout = loadLayout();
const registry: { el: HTMLElement; apply: () => void }[] = [];

const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), Math.max(lo, hi));

/** Swallow the synthetic click that follows a completed drag. */
function suppressNextClick(): void {
    window.addEventListener(
        'click',
        (e) => { e.stopPropagation(); e.preventDefault(); },
        { capture: true, once: true }
    );
}

export function makeDraggable(el: HTMLElement | null, key: string): void {
    if (!el) return;
    el.classList.add('draggable-panel');

    const applyStored = (): void => {
        const pos = layout[key];
        if (!pos || el.classList.contains('hidden')) return;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        if (!w || !h) return;
        const left = clamp(pos.x * (window.innerWidth - w), 0, window.innerWidth - w);
        const top = clamp(pos.y * (window.innerHeight - h), 0, window.innerHeight - h);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.transform = 'none';
    };
    registry.push({ el, apply: applyStored });
    applyStored();

    // Panels that start hidden (tower panel, previews) get their stored spot
    // applied the moment they become visible.
    new MutationObserver(applyStored).observe(el, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', applyStored);

    let holdTimer = 0;
    let pointerId = -1;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let offX = 0;
    let offY = 0;

    const beginDrag = (): void => {
        dragging = true;
        // Capture belongs to the drag, not to the press — see the pointerdown note.
        try { el.setPointerCapture(pointerId); } catch { /* older browsers */ }
        const rect = el.getBoundingClientRect();
        offX = startX - rect.left;
        offY = startY - rect.top;
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.top}px`;
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.transform = 'none';
        el.classList.add('ui-dragging');
        (navigator as Navigator & { vibrate?: (ms: number) => void }).vibrate?.(20);
    };

    const restorePositionAfterCancel = (): void => {
        if (layout[key]) {
            applyStored();
            return;
        }
        // No saved position means the CSS defaults are authoritative. A drag
        // may have written inline left/top before the browser interrupted it,
        // so clear every inline placement value rather than leaving a half-moved
        // panel stranded at the last pointer coordinate.
        el.style.left = '';
        el.style.top = '';
        el.style.right = '';
        el.style.bottom = '';
        el.style.transform = '';
    };

    const cancelDrag = (): void => {
        if (pointerId === -1) return;
        clearTimeout(holdTimer);
        holdTimer = 0;
        try { el.releasePointerCapture(pointerId); } catch { /* noop */ }
        pointerId = -1;
        if (!dragging) return;
        dragging = false;
        el.classList.remove('ui-dragging');
        restorePositionAfterCancel();
    };

    /*
     * Do NOT capture the pointer here — capture on press kills every button
     * inside the panel for mouse users.
     *
     * Measured on the live HUD (desktop, real mouse): the button receives
     * `pointerdown` and `mousedown` and then nothing. With the pointer captured
     * by `#hud`, the compatibility `mouseup`/`click` are retargeted to the
     * capture element, so `click` fires on `#hud` and never on the button that
     * was pressed. All four HUD buttons — skip-prep, pause, speed, sound —
     * were dead. Touch was fine, which is why this survived: touch-derived
     * mouse events are not retargeted by pointer capture, and every existing
     * test either taps or calls `el.click()` directly.
     *
     * Capture is only needed once a drag is actually running (to keep move
     * events coming when the pointer leaves the panel), so it moved into
     * `beginDrag`. Before the hold completes, plain bubbling is enough:
     * the pointer is still over the panel.
     */
    el.addEventListener('pointerdown', (e: PointerEvent) => {
        if (dragging || pointerId !== -1 || !e.isPrimary) return;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        holdTimer = window.setTimeout(beginDrag, HOLD_MS);
    });

    /*
     * Move/up live on `window`, not on `el`.
     *
     * With capture gone from the press, a pointer that leaves the panel before
     * the hold completes would stop delivering events to `el` — the hold timer
     * would survive and fire a drag from a stale origin, and the release would
     * never reset `pointerId`. Captured events still bubble from `el` to
     * `window`, so one pair of listeners covers both phases; `pointerId`
     * already scopes them to this gesture.
     */
    window.addEventListener('pointermove', (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        if (!dragging) {
            // Finger drifted before the hold completed — treat as a normal tap/scroll
            if (Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE_TOLERANCE) {
                clearTimeout(holdTimer);
                try { el.releasePointerCapture(pointerId); } catch { /* noop */ }
                pointerId = -1;
            }
            return;
        }
        e.preventDefault();
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        el.style.left = `${clamp(e.clientX - offX, 0, window.innerWidth - w)}px`;
        el.style.top = `${clamp(e.clientY - offY, 0, window.innerHeight - h)}px`;
    });

    const endDrag = (e: PointerEvent): void => {
        if (e.pointerId !== pointerId) return;
        clearTimeout(holdTimer);
        try { el.releasePointerCapture(pointerId); } catch { /* noop */ }
        pointerId = -1;
        if (!dragging) return;
        dragging = false;
        el.classList.remove('ui-dragging');
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        layout[key] = {
            x: (parseFloat(el.style.left) || 0) / Math.max(1, window.innerWidth - w),
            y: (parseFloat(el.style.top) || 0) / Math.max(1, window.innerHeight - h),
        };
        saveLayout(layout);
        suppressNextClick();
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', cancelDrag);
    // App switches, notification gestures, and tab backgrounding may never
    // deliver pointercancel/up. Treat those lifecycle events as cancellation
    // too, otherwise the hold timer or pointer capture survives into the next
    // player gesture.
    window.addEventListener('blur', cancelDrag);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelDrag();
    });
}

/** Restore every panel to its default CSS position and forget saved spots. */
export function resetUiLayout(): void {
    layout = {};
    try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
    for (const { el } of registry) {
        el.style.left = '';
        el.style.top = '';
        el.style.right = '';
        el.style.bottom = '';
        el.style.transform = '';
    }
}
