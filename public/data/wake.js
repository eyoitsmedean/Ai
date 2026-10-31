/**
 * Keeps the phone's screen awake while a sitting or a hearing is open.
 * The browser may refuse. Callers must not pretend the screen stayed lit.
 *
 * The page loads this file. Tests require the same file.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RedLetterWake = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function createScreenKeeper(wakeLock) {
    const reasons = new Set();
    let sentinel = null;

    function supported() {
      return Boolean(wakeLock && typeof wakeLock.request === 'function');
    }

    async function acquire() {
      if (!reasons.size) return { held: false, supported: supported() };
      if (!supported()) return { held: false, supported: false };
      if (sentinel) return { held: true, supported: true };
      try {
        const next = await wakeLock.request('screen');
        if (!reasons.size) {
          try { await next.release(); } catch (_) {}
          return { held: false, supported: true };
        }
        sentinel = next;
        if (sentinel && typeof sentinel.addEventListener === 'function') {
          sentinel.addEventListener('release', () => {
            if (sentinel === next) sentinel = null;
          });
        }
        return { held: true, supported: true };
      } catch (_) {
        sentinel = null;
        return { held: false, supported: true, denied: true };
      }
    }

    function hold(reason) {
      reasons.add(reason || 'sit');
      return acquire();
    }

    async function release(reason) {
      if (reason) reasons.delete(reason);
      else reasons.clear();
      if (reasons.size) return { held: Boolean(sentinel), supported: supported() };
      if (sentinel) {
        const current = sentinel;
        sentinel = null;
        try { await current.release(); } catch (_) {}
      }
      return { held: false, supported: supported() };
    }

    function resume() {
      return acquire();
    }

    return { hold, release, resume, reasons };
  }

  return { createScreenKeeper };
});
