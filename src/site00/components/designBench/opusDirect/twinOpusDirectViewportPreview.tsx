import type { HeroPreviewResolution } from '../../../../../shared/site00-design-workspace-production/designProjectBinding/pageViewportAuthority.js';
import { resolveTwinOpusDirectAsset } from './twinOpusDirectAssetManifest';
import { TodPointingHandPlate } from './TwinOpusDirectIcons';

type HeroProps = {
  preview: HeroPreviewResolution;
  className: string;
  onCreateDesktop?: () => void;
};

export function TodHeroViewportPreview({ preview, className, onCreateDesktop }: HeroProps) {
  if (preview.kind === 'manifest-hero') {
    const src = resolveTwinOpusDirectAsset('hero');
    return (
      <div className={`${className} tod-plate tod-plate--photo`}>
        {src ?
          <img className="tod-plate__photo" src={src} alt="" draggable={false} data-tod-slot="hero" />
        : null}
      </div>
    );
  }
  if (preview.kind === 'image') {
    return (
      <div
        className={`${className} tod-vp-preview tod-vp-preview--image`}
        data-viewport={preview.viewport}
        data-vp-status={preview.status}
      >
        <img className="tod-vp-preview__img" src={preview.src} alt="" draggable={false} />
        <span className="tod-vp-preview__badge">{preview.status}</span>
      </div>
    );
  }
  if (preview.kind === 'tablet-waiting') {
    return (
      <div
        className={`${className} tod-vp-preview tod-vp-preview--waiting`}
        data-viewport="TABLET"
        data-testid="hero-viewport-waiting"
      >
        <p className="tod-vp-preview__title">{preview.title}</p>
        <p className="tod-vp-preview__status">{preview.statusLine}</p>
        <p className="tod-vp-preview__message">{preview.message}</p>
      </div>
    );
  }
  return (
    <div
      className={`${className} tod-vp-preview tod-vp-preview--missing`}
      data-viewport="DESKTOP"
      data-testid="hero-viewport-missing"
    >
      <p className="tod-vp-preview__title">{preview.title}</p>
      <p className="tod-vp-preview__status">{preview.statusLine}</p>
      <p className="tod-vp-preview__status">NOT CREATED YET</p>
      <button
        type="button"
        className="tod-vp-preview__action"
        disabled={preview.actionDisabled}
        title={preview.actionReason ?? undefined}
        onClick={() => onCreateDesktop?.()}
      >
        {preview.actionLabel}
      </button>
      {preview.actionReason ?
        <p className="tod-vp-preview__reason">{preview.actionReason}</p>
      : null}
    </div>
  );
}

export function TodAuthorityThumbPreview({
  previewSrc,
  missing,
  className,
  variant,
}: {
  previewSrc: string | null;
  missing: boolean;
  slot: 'authorityMobile' | 'authorityDesktop';
  className: string;
  variant: 'mobile' | 'desktop';
}) {
  if (missing || !previewSrc) {
    return (
      <div className={`${className} tod-vp-thumb tod-vp-thumb--missing`} data-testid={`authority-thumb-${variant}-missing`}>
        <span>{variant === 'desktop' ? 'DESKTOP MASTER' : 'MOBILE MASTER'}</span>
        <span>MISSING</span>
      </div>
    );
  }
  const resolved = previewSrc.startsWith('/site00/twin') ? resolveTwinOpusDirectAsset('authorityMobile') : previewSrc;
  if (!resolved) {
    return (
      <div className={`${className} tod-vp-thumb tod-vp-thumb--missing`}>
        <TodPointingHandPlate className="tod-plate__hand" />
      </div>
    );
  }
  return <img className={`${className} tod-vp-thumb__img`} src={resolved} alt="" draggable={false} />;
}
