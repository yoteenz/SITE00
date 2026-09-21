/**
 * Pipeline output views bound into the Opus shell slots (CGPT / GPT2 / NBP).
 */

import type { ReactNode } from 'react';

import type { CgptBriefRowPresentation, NbpSlotPresentation } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import type {
  PageConceptCgptSubstepId,
  PageConceptSubstepRunState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import type { PageGPT2AuthorityConcept } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { AiConsoleIcon } from '../aiConsoles/AiConsoleIcon';

export function CgptBriefResult({
  rows,
  substepStates,
  onViewFull,
}: {
  rows: readonly CgptBriefRowPresentation[];
  substepStates?: Partial<Record<PageConceptCgptSubstepId, PageConceptSubstepRunState>>;
  onViewFull?: () => void;
}) {
  if (rows.length === 0) return null;
  return (
    <>
      <ul className="s00-pcg__brief">
        {rows.map((row) => (
          <li
            className="s00-pcg__briefRow"
            key={row.id}
            data-substep-state={substepStates?.[row.id as PageConceptCgptSubstepId] ?? 'COMPLETE'}
            data-lead={row.lead ? 'true' : undefined}
          >
            <span className="s00-pcg__briefGlyph" aria-hidden="true">
              <AiConsoleIcon name="opus-context" size={10} />
            </span>
            <span className="s00-pcg__briefCopy">
              <span className="s00-pcg__briefLabel">{row.label}</span>
              <span className="s00-pcg__briefValue">{row.value}</span>
            </span>
          </li>
        ))}
      </ul>
      {onViewFull ?
        <button type="button" className="s00-pcg__secAction" data-interaction-id="page-concepts-view-cgpt-brief" onClick={onViewFull}>
          VIEW FULL CREATIVE BRIEF
        </button>
      : null}
    </>
  );
}

export function Gpt2AuthorityResult({
  concept,
  onInspect,
}: {
  concept: PageGPT2AuthorityConcept;
  onInspect?: (src: string, title: string, subtitle: string) => void;
}) {
  const src = concept.authorityArtifact;
  const title = concept.name.toUpperCase();
  const subtitle = concept.premise;
  return (
    <div className="s00-pcg__gpt2Result">
      {src ?
        <button
          type="button"
          className="s00-pcg__frame s00-pcg__frame--interactive"
          data-ratio="page"
          data-interaction-id="page-concepts-gpt2-inspect"
          onClick={() => onInspect?.(src, title, subtitle)}
        >
          <img src={src} alt={title} className="s00-pcg__previewImg" draggable={false} />
        </button>
      : <div className="s00-pcg__frame" data-ratio="page">
          <span className="s00-pcg__frameEmpty">
            <span className="s00-pcg__frameGlyph" aria-hidden="true">
              <AiConsoleIcon name="empty-concept" size={18} />
            </span>
            <span>AUTHORITY IMAGE PENDING</span>
          </span>
        </div>
      }
      <dl className="s00-pcg__gpt2Meta">
        <div>
          <dt>CONCEPT</dt>
          <dd>{title}</dd>
        </div>
        <div>
          <dt>PREMISE</dt>
          <dd>{subtitle}</dd>
        </div>
        <div>
          <dt>LINEAGE</dt>
          <dd>CGPT · {concept.injectionId.toUpperCase()}</dd>
        </div>
      </dl>
    </div>
  );
}

export function NbpSlotCell({
  slot,
  selected,
  onSelect,
  onInspect,
}: {
  slot: NbpSlotPresentation;
  selected: boolean;
  onSelect: () => void;
  onInspect?: (src: string) => void;
}) {
  let inner: ReactNode;
  if (slot.status === 'READY' && slot.imageSrc) {
    inner = (
      <button
        type="button"
        className="s00-pcg__renditionTap"
        onClick={(e) => {
          e.stopPropagation();
          onInspect?.(slot.imageSrc!);
        }}
        aria-label={`${slot.viewport} ${slot.label} — view fullscreen`}
      >
        <img src={slot.imageSrc} alt="" draggable={false} />
      </button>
    );
  } else if (slot.status === 'FAILED') {
    inner = (
      <span className="s00-pcg__frameEmpty s00-pcg__frameEmpty--failed">
        <AiConsoleIcon name="status-error" size={14} />
        <span>FAILED</span>
      </span>
    );
  } else if (slot.status === 'GENERATING') {
    inner = (
      <span className="s00-pcg__frameEmpty">
        <AiConsoleIcon name="status-generating" size={14} />
        <span>GENERATING</span>
      </span>
    );
  } else {
    inner = (
      <span className="s00-pcg__frameEmpty">
        <AiConsoleIcon name="empty-concept" size={14} />
        <span>PENDING</span>
      </span>
    );
  }

  return (
    <figure
      className="s00-pcg__rendition"
      data-nbp-slot={slot.key}
      data-nbp-status={slot.status}
      data-selected={selected ? 'true' : undefined}
    >
      <button type="button" className="s00-pcg__frame" data-ratio={slot.viewport === 'MOBILE' ? 'thumb' : 'wide'} onClick={onSelect}>
        {inner}
      </button>
      <figcaption className="s00-pcg__renditionCap">{slot.label}</figcaption>
    </figure>
  );
}

export function NbpPreviewHero({
  slot,
  onInspect,
}: {
  slot: NbpSlotPresentation | null;
  onInspect?: (src: string) => void;
}) {
  if (!slot) return null;
  return (
    <div className="s00-pcg__nbpHero" data-viewport={slot.viewport}>
      <header className="s00-pcg__nbpHeroHead">
        {slot.viewport} · RENDITION {slot.label}
      </header>
      <div className="s00-pcg__frame s00-pcg__frame--hero" data-ratio={slot.viewport === 'MOBILE' ? 'page' : 'wide'}>
        {slot.status === 'READY' && slot.imageSrc ?
          <button type="button" className="s00-pcg__renditionTap s00-pcg__renditionTap--hero" onClick={() => onInspect?.(slot.imageSrc!)}>
            <img src={slot.imageSrc} alt="" draggable={false} />
          </button>
        : slot.status === 'FAILED' ?
          <span className="s00-pcg__frameEmpty s00-pcg__frameEmpty--failed">
            <span>{slot.failureReason ?? 'RENDER FAILED'}</span>
          </span>
        : <span className="s00-pcg__frameEmpty">
            <AiConsoleIcon name="status-generating" size={18} />
            <span>{slot.status === 'GENERATING' ? 'GENERATING…' : 'PENDING'}</span>
          </span>
        }
      </div>
    </div>
  );
}
