import { useEffect } from 'react';

/** LOCK1 manifest + Apple touch tags — only on `/foundation/*` routes. */
export function useFoundationPwaHead(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const links: HTMLLinkElement[] = [];
    const metas: HTMLMetaElement[] = [];

    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/foundation-manifest.webmanifest';
    document.head.appendChild(manifest);
    links.push(manifest);

    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon';
    apple.href = '/site00/idnty/foundation/apple-touch-icon-foundation-180.png';
    document.head.appendChild(apple);
    links.push(apple);

    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = '/site00/idnty/foundation/foundation-launch.png';
    document.head.appendChild(preload);
    links.push(preload);

    const metaSpecs: Array<[string, string]> = [
      ['theme-color', '#f3f2ef'],
      ['apple-mobile-web-app-capable', 'yes'],
      ['mobile-web-app-capable', 'yes'],
      ['apple-mobile-web-app-title', 'MY FOUNDATION'],
      ['apple-mobile-web-app-status-bar-style', 'default'],
    ];
    for (const [name, content] of metaSpecs) {
      const m = document.createElement('meta');
      m.name = name;
      m.content = content;
      document.head.appendChild(m);
      metas.push(m);
    }

    return () => {
      for (const el of links) el.remove();
      for (const el of metas) el.remove();
    };
  }, [enabled]);
}
