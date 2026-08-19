/** Enforce silent playback — loader environment videos must never hijack device audio. */
export function enforceSite00LoaderVideoSilent(video: HTMLVideoElement): void {
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.setAttribute('muted', '');
  video.removeAttribute('controls');
}

/** Apply silent defaults before assigning src — required for iOS audio-session safety. */
export function createSilentLoaderPreloadVideo(): HTMLVideoElement {
  const video = document.createElement('video');
  video.preload = 'auto';
  video.playsInline = true;
  video.disablePictureInPicture = true;
  video.controls = false;
  video.tabIndex = -1;
  enforceSite00LoaderVideoSilent(video);
  return video;
}

/** Re-apply mute on every playback lifecycle event. */
export function bindSite00LoaderVideoSilentGuards(video: HTMLVideoElement): () => void {
  const enforce = () => enforceSite00LoaderVideoSilent(video);
  const events = ['volumechange', 'play', 'playing', 'loadedmetadata', 'canplay'] as const;
  for (const event of events) {
    video.addEventListener(event, enforce);
  }
  enforce();
  return () => {
    for (const event of events) {
      video.removeEventListener(event, enforce);
    }
  };
}
