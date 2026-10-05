import {
  createSilentLoaderPreloadVideo,
  enforceSite00LoaderVideoSilent,
} from './site00LoaderVideoSilent';

type PreloadState = {
  backgrounds: Map<string, Promise<void>>;
  animations: Map<string, Promise<void>>;
};

const cache: PreloadState = {
  backgrounds: new Map(),
  animations: new Map(),
};

/** Never block the cinematic gate indefinitely on slow mobile networks. */
export const SITE00_LOADER_PRELOAD_TIMEOUT_MS = 8000;

function withPreloadTimeout(promise: Promise<void>, _label: string): Promise<void> {
  if (typeof window === 'undefined') return promise;
  return Promise.race([
    promise,
    new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), SITE00_LOADER_PRELOAD_TIMEOUT_MS);
    }),
  ]).then(() => undefined);
}

function preloadImage(url: string): Promise<void> {
  return withPreloadTimeout(
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    }),
    `image:${url}`,
  );
}

function preloadVideo(url: string): Promise<void> {
  return withPreloadTimeout(
    new Promise((resolve) => {
      const video = createSilentLoaderPreloadVideo();
      const done = () => resolve();
      video.addEventListener('loadeddata', done, { once: true });
      video.addEventListener('canplaythrough', done, { once: true });
      video.addEventListener('error', done, { once: true });
      video.addEventListener('loadedmetadata', () => enforceSite00LoaderVideoSilent(video), { once: true });
      video.src = url;
      video.load();
    }),
    `video:${url}`,
  );
}

function preloadApng(url: string): Promise<void> {
  return preloadImage(url);
}

export function preloadSite00LoaderBackground(url: string): Promise<void> {
  let pending = cache.backgrounds.get(url);
  if (!pending) {
    pending = preloadImage(url);
    cache.backgrounds.set(url, pending);
  }
  return pending;
}

export function preloadSite00LoaderAnimation(url: string): Promise<void> {
  let pending = cache.animations.get(url);
  if (!pending) {
    pending = url.endsWith('.apng') ? preloadApng(url) : preloadVideo(url);
    cache.animations.set(url, pending);
  }
  return pending;
}

export function preloadSite00LoaderAssets(backgroundUrl: string, animationUrl: string): Promise<void> {
  return Promise.all([
    preloadSite00LoaderBackground(backgroundUrl),
    preloadSite00LoaderAnimation(animationUrl),
  ]).then(() => undefined);
}
