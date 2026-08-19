(function site00ImmersiveLoaderBoot() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var path = window.location.pathname || '';
  var isSite00 =
    typeof window.site00IsSite00ImmersivePath === 'function'
      ? window.site00IsSite00ImmersivePath(path)
      : path.indexOf('/assts') === 0 || path.indexOf('/origin') === 0 || path === '/';
  if (!isSite00) return;

  var shouldBoot =
    typeof window.site00ShouldBootSite00ImmersiveLoader === 'function'
      ? window.site00ShouldBootSite00ImmersiveLoader()
      : typeof window.site00ShouldBootAsstsImmersiveLoader === 'function'
        ? window.site00ShouldBootAsstsImmersiveLoader()
        : true;
  if (!shouldBoot) return;

  var projectRef = 'hyycomvcaqxxvyrfupes';
  var storageBase =
    'https://' + projectRef + '.supabase.co/storage/v1/object/public/live-preview/site00/';
  var isWide = window.matchMedia('(min-width: 768px)').matches;
  var bg = isWide
    ? storageBase + 'BLDR/4EEB4F70-BF07-4EFE-B324-10C94AE018B5.png'
    : storageBase + 'IMG_0404.png';
  var animation = isWide
    ? storageBase + 'BLDR/openart-output_1787109389654_e04aea07.mp4'
    : storageBase + 'BLDR/openart-output_1787107938282_745c8292.mp4';
  var mediaFocal = 'center 75%';

  function applyBootEnvStyle(env) {
    if (!env) return;
    env.style.backgroundImage = "url('" + bg + "')";
    env.style.backgroundPosition = mediaFocal;
    env.style.setProperty('--site00-loader-media-focal', mediaFocal);
  }

  function preload(href, as) {
    if (!href || document.querySelector('link[rel="preload"][href="' + href + '"]')) return;
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
    preload(animation, 'fetch');

    var shell = document.getElementById('site00-assts-boot-shell');
    if (shell) {
      shell.hidden = false;
      var env = shell.querySelector('.site00-assts-boot-shell__env');
      applyBootEnvStyle(env);
      return;
    }

    var nextShell = document.createElement('div');
    nextShell.id = 'site00-assts-boot-shell';
    nextShell.className = 'site00-assts-boot-shell';
    nextShell.setAttribute('aria-hidden', 'true');
    nextShell.style.setProperty('--site00-loader-media-focal', mediaFocal);
    nextShell.innerHTML =
      '<div class="site00-assts-boot-shell__env" style="background-image:url(\'' +
      bg +
      "');background-position:" +
      mediaFocal +
      '"></div>';

    var mountTarget = document.body || document.documentElement;
    mountTarget.appendChild(nextShell);
  }

  if (document.body) {
    ensureBootShell();
    return;
  }

  document.documentElement.classList.add('site00-assts-boot');
  preload(bg, 'image');
  preload(animation, 'fetch');
  document.addEventListener('DOMContentLoaded', ensureBootShell, { once: true });
})();
