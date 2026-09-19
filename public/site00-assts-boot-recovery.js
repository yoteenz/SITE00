/**
 * Boot recovery + loader overlay watchdog.
 * Removes ultra-early boot shell and any orphaned full-screen immersive loaders.
 */
(function site00AsstsBootRecovery() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var ROOT_POLL_MS = 400;
  var ROOT_DEADLINE_MS = 12000;
  var ROOT_DEADLINE_PREVIEW_MS = 60000;
  var WATCHDOG_MS = 800;
  var WATCHDOG_MAX_MS = 45000;
  var bannerId = 'site00-assts-boot-recovery-banner';

  function isCloudPreviewHost() {
    if (typeof document !== 'undefined') {
      var meta = document.querySelector('meta[name="site00-cloud-preview"]');
      if (meta && meta.getAttribute('content') === '1') return true;
    }
    var host = window.location && window.location.hostname ? window.location.hostname.toLowerCase() : '';
    if (host === 'site00.fsbw-dev.com') return true;
    if (host.length > 18 && host.slice(-18) === '.trycloudflare.com') return true;
    var buildMeta = document.querySelector('meta[name="app-build-id"]');
    var buildId = buildMeta && buildMeta.getAttribute('content') ? buildMeta.getAttribute('content') : '';
    if (buildId === 'dev-local') return true;
    return false;
  }

  function rootDeadlineMs() {
    return isCloudPreviewHost() ? ROOT_DEADLINE_PREVIEW_MS : ROOT_DEADLINE_MS;
  }

  function rootHasApp() {
    var root = document.getElementById('root');
    if (!root) return false;
    if (root.getAttribute('data-site00-app-mounted') === '1') return true;
    return false;
  }

  function purgeStaticBootShellOnly() {
    document.documentElement.classList.remove('site00-assts-boot');
    var shell = document.getElementById('site00-assts-boot-shell');
    if (shell) {
      shell.hidden = true;
      shell.remove();
    }
  }

  function purgeLoaderOverlays(reason) {
    purgeStaticBootShellOnly();
    document.querySelectorAll('.site00-immersive-loader').forEach(function (el) {
      if (el && el.parentNode) el.remove();
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('site00-force-reveal-loader', { detail: { reason: reason || 'boot-recovery' } }),
      );
    }
  }

  function releaseBootShell(reason) {
    purgeLoaderOverlays(reason);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('site00-boot-recovery', { detail: { reason: reason || 'unknown' } }),
      );
    }
  }

  function showRecoveryBanner() {
    if (document.getElementById(bannerId) || rootHasApp()) return;
    var preview = isCloudPreviewHost();
    var banner = document.createElement('div');
    banner.id = bannerId;
    banner.setAttribute('role', 'alert');
    banner.style.cssText =
      'position:fixed;inset:auto 16px 24px 16px;z-index:2147483647;padding:16px 18px;' +
      'background:#1a1a18;color:#f5f5f3;font:600 14px/1.4 system-ui,sans-serif;' +
      'border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.35);text-align:center;';
    banner.innerHTML = preview
      ? 'SITE 00 dev preview did not finish loading.<br/><span style="font-weight:500;opacity:.85">' +
        'Mobile tunnel loads many Vite modules — wait and Reload. If it persists, ask Cloud Agent to restart the preview tunnel + Vite.</span><br/>'
      : 'SITE 00 did not finish loading.<br/><span style="font-weight:500;opacity:.85">' +
        'Hard refresh or reinstall the latest deploy ZIP (v325+).</span><br/>';
    banner.innerHTML +=
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
        msg.indexOf('Failed to fetch dynamically imported module') !== -1 ||
        msg.indexOf('sharp is not available') !== -1
      ) {
        maybeRecover('module-error');
      }
    },
    true,
  );

  window.addEventListener('unhandledrejection', function (ev) {
    var reason = ev && ev.reason ? String(ev.reason.message || ev.reason) : '';
    if (
      reason.indexOf('module') !== -1 ||
      reason.indexOf('import') !== -1 ||
      reason.indexOf('sharp is not available') !== -1
    ) {
      maybeRecover('import-rejection');
    }
  });

  window.addEventListener('pageshow', function (ev) {
    if (!ev || !ev.persisted || !rootHasApp()) return;
    purgeStaticBootShellOnly();
    if (isImmersiveSessionComplete()) {
      purgeLoaderOverlays('bfcache-restore');
    }
  });

  var started = Date.now();
  var poll = window.setInterval(function () {
    if (rootHasApp()) {
      purgeStaticBootShellOnly();
      var hint = document.getElementById('site00-root-boot-hint');
      if (hint) hint.remove();
      window.clearInterval(poll);
      return;
    }
    if (Date.now() - started >= rootDeadlineMs()) {
      window.clearInterval(poll);
      maybeRecover('timeout');
    }
  }, ROOT_POLL_MS);

  function isImmersiveSessionComplete() {
    try {
      return (
        sessionStorage.getItem('site00-immersive-complete') === '1' ||
        sessionStorage.getItem('site00-assts-immersive-complete') === '1'
      );
    } catch (e) {
      return false;
    }
  }

  var watchdogStarted = Date.now();
  var watchdog = window.setInterval(function () {
    if (!rootHasApp()) return;
    var elapsed = Date.now() - started;
    var allowPurge =
      isImmersiveSessionComplete() || elapsed >= 10000;
    if (!allowPurge) return;
    var hasOverlay =
      document.documentElement.classList.contains('site00-assts-boot') ||
      document.querySelector('.site00-immersive-loader');
    if (document.documentElement.classList.contains('site00-assts-boot')) {
      purgeStaticBootShellOnly();
    }
    if (isImmersiveSessionComplete() && document.querySelector('.site00-immersive-loader')) {
      purgeLoaderOverlays('watchdog-session-complete');
    }
    if (Date.now() - watchdogStarted >= WATCHDOG_MAX_MS) {
      window.clearInterval(watchdog);
    }
  }, WATCHDOG_MS);
})();
