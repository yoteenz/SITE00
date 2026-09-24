/**
 * Canonical GPT2 viewport-family workflow rail (hero row) — not legacy Authority Pair.
 */

import type {
  Gpt2ViewportFamilyAuthorityRailAction,
  Gpt2ViewportFamilyAuthorityRailRow,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/designGpt2ViewportFamilyAuthorityRail.js';
import { TodIconLock } from './TwinOpusDirectIcons';

type RailClassPrefix = 'tod-rail' | 'tod-lv-rail';

export function DesignViewportFamilyHeroRail({
  rows,
  actions,
  onAction,
  classPrefix,
}: {
  rows: readonly Gpt2ViewportFamilyAuthorityRailRow[];
  actions: readonly Gpt2ViewportFamilyAuthorityRailAction[];
  onAction: (actionId: string) => void;
  classPrefix: RailClassPrefix;
}) {
  const p = classPrefix;
  return (
    <>
      <section className={`${p}__viewportFamily`} data-testid="viewport-family-authority-rail">
        {rows.map((row) => (
          <div key={row.id} className={`${p}__viewportFamilyRow`}>
            <span className={`${p}__viewportFamilyLabel`}>{row.label}</span>
            <span className={`${p}__viewportFamilyValue`}>{row.value}</span>
            <span className={`${p}__viewportFamilyStatus ${p}__viewportFamilyStatus--${row.status.toLowerCase()}`}>
              {row.status}
            </span>
          </div>
        ))}
      </section>
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          className={`${p}__action ${p}__action--${action.tone}${action.secondary ? ` ${p}__action--secondary` : ''}${
            action.lock ? ` ${p}__action--lock` : ''
          }`}
          data-interaction-id={`rail-${action.id}`}
          data-testid={`viewport-family-rail-${action.id}`}
          disabled={action.disabled}
          title={action.disabledReason ?? undefined}
          onClick={() => onAction(action.id)}
        >
          {action.lock ? <TodIconLock className="tod-ico tod-rail__lockIco" /> : null}
          {action.label}
        </button>
      ))}
    </>
  );
}
