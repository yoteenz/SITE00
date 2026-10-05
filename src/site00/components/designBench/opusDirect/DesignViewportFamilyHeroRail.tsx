/**
 * Full vertical canonical GPT2 viewport-family workflow rail (hero right side).
 */

import type { Gpt2ViewportFamilyHeroRailStage } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { heroRailButtonSurfaceForAction } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyRailButtonSurface.js';
import { TodIconLock } from './TwinOpusDirectIcons';

type RailClassPrefix = 'tod-rail' | 'tod-lv-rail';

export function DesignViewportFamilyHeroRail({
  stages,
  onAction,
  classPrefix,
}: {
  stages: readonly Gpt2ViewportFamilyHeroRailStage[];
  onAction: (actionId: string) => void;
  classPrefix: RailClassPrefix;
}) {
  const p = classPrefix;
  return (
    <section
      className={`${p}__vfFullVertical`}
      data-testid="viewport-family-authority-rail"
      data-rail-layout="full-vertical"
    >
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={`${p}__vfStage${stage.emphasized ? ` ${p}__vfStage--emphasis` : ''}`}
          data-testid={`hero-rail-stage-${stage.id}`}
        >
          <header className={`${p}__vfStageHead`}>
            <span className={`${p}__vfStageLabel`}>{stage.label}</span>
            <span className={`${p}__vfStageStatus ${p}__vfStageStatus--${stage.statusTone}`}>{stage.statusLabel}</span>
          </header>
          <p className={`${p}__vfStageValue`}>{stage.valueLine}</p>
          {stage.actions.map((action) => {
            const surface = heroRailButtonSurfaceForAction(action);
            return (
            <div key={action.id} className={`${p}__actionWrap`}>
              <button
                type="button"
                className={`${p}__action ${p}__action--${action.tone} ${p}__action--surface-${surface}${action.secondary ? ` ${p}__action--secondary` : ''}${
                  action.lock ? ` ${p}__action--lock` : ''
                }${action.disabled ? ` ${p}__action--blocked` : ''}`}
                data-interaction-id={`rail-${action.id}`}
                data-testid={`viewport-family-rail-${action.id}`}
                data-action-surface={surface}
                data-action-tone={action.tone}
                data-action-disabled={action.disabled ? 'true' : 'false'}
                disabled={action.disabled}
                title={action.disabledReason ?? undefined}
                onClick={() => onAction(action.id)}
              >
                {action.lock ? <TodIconLock className="tod-ico tod-rail__lockIco" /> : null}
                {action.label}
              </button>
              {action.disabled && action.disabledReason ?
                <p className={`${p}__actionBlocker`} data-testid={`viewport-family-rail-blocker-${action.id}`}>
                  {action.disabledReason}
                </p>
              : null}
            </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
