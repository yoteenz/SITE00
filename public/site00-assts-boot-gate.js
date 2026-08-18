/**
 * ASSTS immersive boot gate — must stay in sync with
 * `src/site00/components/loader/site00LoaderSession.ts` and `site00LoaderPaths.ts`.
 */
(function site00AsstsBootGate(global) {
  var SESSION_KEY = 'site00-immersive-complete';
  var LEGACY_SESSION_KEY = 'site00-assts-immersive-complete';
  var PREFIXES = ['/origin', '/enter', '/idnty', '/bldr', '/assts', '/bluprint', '/build', '/control', '/live'];

  function isSite00ImmersivePath(path) {
    if (!path) return false;
    for (var i = 0; i < PREFIXES.length; i++) {
      var prefix = PREFIXES[i];
      if (path === prefix || path.indexOf(prefix + '/') === 0) return true;
    }
    return false;
  }

  function isImmersiveSessionComplete() {
    try {
      return (
        sessionStorage.getItem(SESSION_KEY) === '1' ||
        sessionStorage.getItem(LEGACY_SESSION_KEY) === '1'
      );
    } catch (e) {
      return false;
    }
  }

  function shouldBootSite00ImmersiveLoader() {
    var path = (typeof window !== 'undefined' && window.location) ? window.location.pathname : '';
    if (path === '/origin/desktop' || path.indexOf('/origin/desktop/') === 0) return false;
    if (path === '/idnty/state/desktop' || path.indexOf('/idnty/state/desktop/') === 0) return false;
    if (path === '/bldr/state/desktop' || path.indexOf('/bldr/state/desktop/') === 0) return false;
    if (path === '/origin/sign-in' || path.indexOf('/origin/sign-in/') === 0) return false;
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') return true;
    } catch (e) {
      /* ignore */
    }
    return !isImmersiveSessionComplete();
  }

  global.site00ShouldBootSite00ImmersiveLoader = shouldBootSite00ImmersiveLoader;
  global.site00ShouldBootAsstsImmersiveLoader = shouldBootSite00ImmersiveLoader;
  global.site00IsSite00ImmersivePath = isSite00ImmersivePath;
})(typeof window !== 'undefined' ? window : {});
