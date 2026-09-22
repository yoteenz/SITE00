/**
 * P0.VR.DESIGN-VISUAL-COMPARE-GROK1R1 + HERO-ASSEMBLY-ACTIONS1 — CURRENT vs CONCEPT + assembly toolbar.
 * P0.VR.DESIGN-WORKSPACE-CONCEPT-GALLERY-AND-GENERATOR-ENTRY-FIX1 — generation console on compare header row.
 */

import type { HeroAssemblyActionsModel } from '../../../../../shared/site00-design-workspace-production/designHeroAssemblyActions.js';
import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';
import { TodIconCycle } from './TwinOpusDirectIcons';

type Variant = 'canonical' | 'list';

const PREFIX: Record<Variant, string> = {
  canonical: 'tod-hero-compare',
  list: 'tod-lv-hero-compare',
};

function HeroAssemblyActionButton({
  prefix,
  label,
  disabled,
  busyLabel,
  statusLine,
  disabledReason,
  onClick,
  interactionId,
}: {
  prefix: string;
  label: string;
  disabled: boolean;
  busyLabel?: string;
  statusLine: string | null;
  disabledReason: string | null;
  onClick: () => void;
  interactionId: string;
}) {
  const title = disabled && disabledReason ? disabledReason : statusLine ?? undefined;
  return (
    <button
      type="button"
      className={`${prefix}__actionBtn${disabled ? ` ${prefix}__actionBtn--disabled` : ''}`}
      data-interaction-id={interactionId}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      <span className={`${prefix}__actionLabel`}>{busyLabel ?? label}</span>
      {statusLine && !disabled ?
        <span className={`${prefix}__actionMeta`}>{statusLine}</span>
      : null}
    </button>
  );
}

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
  const assembly: HeroAssemblyActionsModel = data.heroAssembly;
  const launcher = data.generationConsoleLauncher;

  return (
    <article className={p} aria-label="Current page capture versus selected page concept">
      <header className={`${p}__compareHead`} aria-label="Current versus concept labels">
        <span className={`${p}__compareHeadLabel`}>CURRENT</span>
        <span className={`${p}__compareHeadLabel ${p}__compareHeadLabel--concept`}>CONCEPT</span>
        <button
          type="button"
          className={`${p}__generationConsole`}
          data-interaction-id="hero-generation-console"
          data-testid={launcher.testId}
          disabled={launcher.disabled}
          title={launcher.statusLine ?? launcher.label}
          onClick={() => actions.openGenerationConsole()}
        >
          <TodIconCycle className={`${p}__generationConsoleIco tod-ico`} aria-hidden />
          <span className={`${p}__generationConsoleText`}>{launcher.label}</span>
          {launcher.statusLine ?
            <span className={`${p}__generationConsoleMeta`}>{launcher.statusLine}</span>
          : null}
        </button>
      </header>

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

      <div className={`${p}__actions`} role="group" aria-label="Hero page assembly actions">
        <HeroAssemblyActionButton
          prefix={p}
          label={assembly.capture.label}
          busyLabel={compare.captureBusy ? 'CAPTURING…' : undefined}
          disabled={compare.captureBusy}
          statusLine={compare.captureError ? compare.captureError.slice(0, 48) : null}
          disabledReason={compare.captureError}
          interactionId="hero-capture-screen"
          onClick={() => void actions.captureScreen()}
        />
        <HeroAssemblyActionButton
          prefix={p}
          label={assembly.createFramework.label}
          disabled={assembly.createFramework.disabled}
          statusLine={assembly.createFramework.statusLine}
          disabledReason={assembly.createFramework.disabledReason}
          interactionId="hero-create-framework"
          onClick={() => actions.openCreatePageFramework()}
        />
        <HeroAssemblyActionButton
          prefix={p}
          label={assembly.generateAssets.label}
          disabled={assembly.generateAssets.disabled}
          statusLine={assembly.generateAssets.statusLine}
          disabledReason={assembly.generateAssets.disabledReason}
          interactionId="hero-generate-assets"
          onClick={() => actions.openGrokPageAssetProduction()}
        />
      </div>
    </article>
  );
}
