/**
 * Shared candidate gallery rail — Grid + List identical data, actions, and layout.
 */

import type { Ref } from 'react';

import { DesignConceptCandidateGalleryCard } from './DesignConceptCandidateGalleryCard';
import type { TwinOpusDirectCandidate } from './twinOpusDirectContent';
import type { TwinOpusDirectWorkspace } from './twinOpusDirectWorkspace';
import { TodIconCheck } from './TwinOpusDirectIcons';

export type DesignConceptGalleryVariant = 'grid' | 'list';

function cardShellClasses(variant: DesignConceptGalleryVariant, active: boolean, history?: boolean): string {
  if (variant === 'list') {
    const base = `tod-lv-card tod-lv-card--concept${active ? ' is-active' : ''}`;
    return history ? `${base} tod-lv-card--history` : base;
  }
  const base = `tod-card tod-card--concept${active ? ' is-active' : ''}`;
  return history ? `${base} tod-card--history` : base;
}

function versionClass(variant: DesignConceptGalleryVariant, tag: TwinOpusDirectCandidate['versionTag']): string {
  const prefix = variant === 'list' ? 'tod-lv-card' : 'tod-card';
  return `${prefix}__version ${prefix}__version--${tag}`;
}

function tickClass(variant: DesignConceptGalleryVariant): string {
  return variant === 'list' ? 'tod-lv-card__tick' : 'tod-card__tick';
}

function prefBadgeClass(variant: DesignConceptGalleryVariant): string {
  return variant === 'list' ? 'tod-lv-card__prefBadge' : 'tod-card__prefBadge';
}

export function DesignConceptCandidateGalleryRail({
  workspace,
  variant,
  railRef,
}: {
  workspace: TwinOpusDirectWorkspace;
  variant: DesignConceptGalleryVariant;
  railRef?: Ref<HTMLDivElement>;
}) {
  const { data, state, actions } = workspace;
  const metaPrefix = variant === 'list' ? 'tod-lv-card' : 'tod-card';

  const renderCandidateButton = (candidate: TwinOpusDirectCandidate, history: boolean) => {
    const active = candidate.id === state.candidateId;
    return (
      <button
        key={history ? `hist-${candidate.artifactId ?? candidate.id}` : (candidate.artifactId ?? candidate.id)}
        type="button"
        className={cardShellClasses(variant, active, history)}
        aria-pressed={active}
        data-artifact-id={candidate.artifactId ?? undefined}
        data-concept-id={candidate.id}
        data-testid={history ? undefined : `gallery-candidate-${candidate.id}`}
        onClick={() => actions.selectCandidate(candidate.id)}
      >
        {candidate.versionTag === 'none' ? null : (
          <span className={versionClass(variant, candidate.versionTag)}>{candidate.version}</span>
        )}
        {!history ?
          data.viewportPreferenceBadges(candidate.id).map((badge) => (
            <span key={badge} className={prefBadgeClass(variant)}>
              {badge}
            </span>
          ))
        : null}
        {active && !history ?
          <span className={tickClass(variant)} aria-hidden="true">
            <TodIconCheck className="tod-ico" />
          </span>
        : null}
        <DesignConceptCandidateGalleryCard
          candidate={candidate}
          metaClassPrefix={metaPrefix}
        />
      </button>
    );
  };

  const filledClass = variant === 'list' ? 'tod-lv-gallery__filled' : 'tod-gallery__filled';
  const groupLabelClass = variant === 'list' ? 'tod-lv-gallery__groupLabel' : 'tod-gallery__groupLabel';
  const gridClass =
    variant === 'list' ?
      's00-design-concept-gallery-grid tod-lv-gallery__rail tod-lv-gallery__rail--current'
    : 's00-design-concept-gallery-grid tod-gallery__rail tod-gallery__rail--current';
  const historyRailClass =
    variant === 'list' ? 'tod-lv-gallery__rail tod-lv-gallery__rail--history' : 'tod-gallery__rail tod-gallery__rail--history';

  return (
    <div className={filledClass} hidden={Boolean(data.galleryEmptyMessage)}>
      {data.currentGenerationUnresolvedMessage ?
        <p className={groupLabelClass} data-testid="gallery-current-generation-unresolved">
          {data.currentGenerationUnresolvedMessage}
        </p>
      : data.candidateSections.current.length > 0 ?
        <p className={groupLabelClass} data-testid="gallery-current-generation-label">
          {data.galleryCurrentGroupLabel}
        </p>
      : null}
      {data.candidateSections.history.length > 0 ?
        <p
          className={`${groupLabelClass} ${variant === 'list' ? 'tod-lv-gallery__groupLabel--history' : 'tod-gallery__groupLabel--history'}`}
          data-testid="gallery-history-label"
        >
          {data.galleryHistoryGroupLabel}
        </p>
      : null}
      <div className={gridClass} ref={railRef} data-testid="design-concept-candidate-gallery-grid">
        {data.candidateSections.current.map((candidate) => renderCandidateButton(candidate, false))}
      </div>
      {data.candidateSections.history.length > 0 ?
        <div className={historyRailClass}>
          {data.candidateSections.history.map((candidate) => renderCandidateButton(candidate, true))}
        </div>
      : null}
    </div>
  );
}
