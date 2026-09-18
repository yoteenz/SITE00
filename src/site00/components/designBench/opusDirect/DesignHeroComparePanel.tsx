/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 — CURRENT implementation capture vs selected page concept.
 */

import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';

type Variant = 'canonical' | 'list';

const PREFIX: Record<Variant, string> = {
  canonical: 'tod-hero-compare',
  list: 'tod-lv-hero-compare',
};

export function DesignHeroComparePanel({
  workspace,
  variant,
}: {
  workspace: TwinOpusDirectWorkspace;
  variant: Variant;
}) {
  const { data, actions } = workspace;
  const p = PREFIX[variant];
  const compare = data.heroCompare;

  return (
    <article className={p} aria-label="Current page capture versus selected page concept">
      <div className={`${p}__grid`}>
        <div className={`${p}__pane`}>
          <header className={`${p}__paneHead`}>
            <span className={`${p}__paneLabel`}>CURRENT</span>
            <span className={`${p}__paneMeta`}>{compare.currentMeta}</span>
          </header>
          <button
            type="button"
            className={`${p}__artifact${compare.currentSrc ? '' : ` ${p}__artifact--empty`}`}
            data-interaction-id="hero-current-fullscreen"
            onClick={() => compare.currentSrc && actions.openHeroCompareFullscreen('current')}
            disabled={!compare.currentSrc}
          >
            {compare.currentSrc ?
              <img src={compare.currentSrc} alt="" className={`${p}__img`} draggable={false} />
            : <span className={`${p}__empty`}>{compare.currentEmptyLabel}</span>}
          </button>
          <button
            type="button"
            className={`${p}__captureBtn`}
            data-interaction-id="hero-capture-screen"
            disabled={compare.captureBusy}
            onClick={() => void actions.captureScreen()}
          >
            {compare.captureBusy ? 'CAPTURING…' : 'CAPTURE SCREEN'}
          </button>
        </div>

        <div className={`${p}__pane`}>
          <header className={`${p}__paneHead`}>
            <span className={`${p}__paneLabel`}>CONCEPT</span>
            <span className={`${p}__paneMeta`}>{compare.conceptMeta}</span>
          </header>
          <button
            type="button"
            className={`${p}__artifact${compare.conceptSrc ? '' : ` ${p}__artifact--empty`}`}
            data-interaction-id="hero-concept-fullscreen"
            onClick={() => compare.conceptSrc && actions.openHeroCompareFullscreen('concept')}
            disabled={!compare.conceptSrc}
          >
            {compare.conceptSrc ?
              <img src={compare.conceptSrc} alt="" className={`${p}__img`} draggable={false} />
            : <span className={`${p}__empty`}>{compare.conceptEmptyLabel}</span>}
          </button>
        </div>
      </div>
    </article>
  );
}
