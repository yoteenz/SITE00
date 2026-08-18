(function site00ImmersiveLoaderBoot() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var path = window.location.pathname || '';
  var isSite00 =
    typeof window.site00IsSite00ImmersivePath === 'function'
      ? window.site00IsSite00ImmersivePath(path)
      : path.indexOf('/assts') === 0 || path.indexOf('/origin') === 0;
  if (!isSite00) return;

  var shouldBoot =
    typeof window.site00ShouldBootSite00ImmersiveLoader === 'function'
      ? window.site00ShouldBootSite00ImmersiveLoader()
      : typeof window.site00ShouldBootAsstsImmersiveLoader === 'function'
        ? window.site00ShouldBootAsstsImmersiveLoader()
        : true;
  if (!shouldBoot) return;

  var base = '/site00/loader/v1/';
  var bg = base + 'assts-loader-background-v1.png';

  function preload(href, as) {
    if (document.querySelector('link[rel="preload"][href="' + href + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (as === 'image') link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }

  function ensureBootShell() {
    document.documentElement.classList.add('site00-assts-boot');

    preload(bg, 'image');

    var ua = navigator.userAgent || '';
    var isIOSSafari =
      (/iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
      /Safari/i.test(ua) &&
      !/CriOS|FxiOS|EdgiOS|Chrome/i.test(ua);
    var geometry = isIOSSafari
      ? base + 'assts-loader-geometry-v1-alpha.apng'
      : base + 'assts-loader-geometry-v1-alpha.webm';
    preload(geometry, 'fetch');

    if (document.getElementById('site00-assts-boot-shell')) {
      var existing = document.getElementById('site00-assts-boot-shell');
      if (existing) existing.hidden = false;
      return;
    }

    var shell = document.createElement('div');
    shell.id = 'site00-assts-boot-shell';
    shell.className = 'site00-assts-boot-shell';
    shell.setAttribute('aria-hidden', 'true');
    shell.innerHTML =
      '<div class="site00-assts-boot-shell__env" style="background-image:url(\'' + bg + '\')"></div>';

    var mountTarget = document.body || document.documentElement;
    mountTarget.appendChild(shell);
  }

  if (document.body) {
    ensureBootShell();
    return;
  }

  document.documentElement.classList.add('site00-assts-boot');
  preload(bg, 'image');
  var uaEarly = navigator.userAgent || '';
  var isIOSSafariEarly =
    (/iPad|iPhone|iPod/.test(uaEarly) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    /Safari/i.test(uaEarly) &&
    !/CriOS|FxiOS|EdgiOS|Chrome/i.test(uaEarly);
  preload(
    isIOSSafariEarly
      ? base + 'assts-loader-geometry-v1-alpha.apng'
      : base + 'assts-loader-geometry-v1-alpha.webm',
    'fetch',
  );

  document.addEventListener('DOMContentLoaded', ensureBootShell, { once: true });
})();
