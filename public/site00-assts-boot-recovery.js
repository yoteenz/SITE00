/**
 * If the SPA module fails or React never mounts, release the ultra-early boot shell
 * so the founder is not stuck on a static loader image forever.
 */
(function site00AsstsBootRecovery() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var ROOT_POLL_MS = 400;
  var ROOT_DEADLINE_MS = 20000;
  var released = false;
  var bannerId = 'site00-assts-boot-recovery-banner';

  function rootHasApp() {
    var root = document.getElementById('root');
    return !!(root && root.childElementCount > 0);
  }

  function releaseBootShell(reason) {
    if (released) return;
    released = true;
    document.documentElement.classList.remove('site00-assts-boot');
    var shell = document.getElementById('site00-assts-boot-shell');
    if (shell) {
      shell.hidden = true;
      shell.remove();
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('site00-boot-recovery', { detail: { reason: reason || 'unknown' } }),
      );
    }
  }

  function showRecoveryBanner() {
    if (document.getElementById(bannerId) || rootHasApp()) return;
    var banner = document.createElement('div');
    banner.id = bannerId;
    banner.setAttribute('role', 'alert');
    banner.style.cssText =
      'position:fixed;inset:auto 16px 24px 16px;z-index:2147483647;padding:16px 18px;' +
      'background:#1a1a18;color:#f5f5f3;font:600 14px/1.4 system-ui,sans-serif;' +
      'border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.35);text-align:center;';
    banner.innerHTML =
      'SITE 00 did not finish loading.<br/><span style="font-weight:500;opacity:.85">' +
      'Hard refresh or reinstall the latest deploy ZIP (v325+).</span><br/>' +
      '<button type="button" style="margin-top:12px;padding:10px 18px;border:0;border-radius:8px;' +
      'background:#f5f5f3;color:#1a1a18;font-weight:700;">Reload</button>';
    var btn = banner.querySelector('button');
    if (btn) {
      btn.addEventListener('click', function () {
        window.location.reload();
      });
    }
    (document.body || document.documentElement).appendChild(banner);
  }

  function maybeRecover(reason) {
    if (rootHasApp()) return;
    releaseBootShell(reason);
    showRecoveryBanner();
  }

  window.addEventListener(
    'error',
    function (ev) {
      var msg = ev && ev.message ? String(ev.message) : '';
      if (
        msg.indexOf('module specifier') !== -1 ||
        msg.indexOf('chromium-bidi') !== -1 ||
        msg.indexOf('Failed to fetch dynamically imported module') !== -1
      ) {
        maybeRecover('module-error');
      }
    },
    true,
  );

  window.addEventListener('unhandledrejection', function (ev) {
    var reason = ev && ev.reason ? String(ev.reason.message || ev.reason) : '';
    if (reason.indexOf('module') !== -1 || reason.indexOf('import') !== -1) {
      maybeRecover('import-rejection');
    }
  });

  var started = Date.now();
  var poll = window.setInterval(function () {
    if (rootHasApp()) {
      window.clearInterval(poll);
      return;
    }
    if (Date.now() - started >= ROOT_DEADLINE_MS) {
      window.clearInterval(poll);
      maybeRecover('timeout');
    }
  }, ROOT_POLL_MS);
})();
