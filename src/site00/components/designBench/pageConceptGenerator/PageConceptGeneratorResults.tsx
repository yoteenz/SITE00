/**
 * Pipeline output views bound into the Opus shell slots (CGPT / GPT2 / NBP).
 */

import type { ReactNode } from 'react';

import type { CgptBriefDigestField } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderReviewPresentation.js';
import type { CgptBriefRowPresentation, NbpSlotPresentation } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import type {
  PageConceptCgptSubstepId,
  PageConceptSubstepRunState,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import type { PageGPT2AuthorityConcept } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { AiConsoleIcon } from '../aiConsoles/AiConsoleIcon';
import { PageConceptContainedPreviewFrame } from './PageConceptContainedPreviewFrame';

/** Digest card — four excerpts, not the full brief wall. */
export function CgptBriefDigestCard({
  digest,
  onViewFull,
  onContinueGpt2,
}: {
  digest: readonly CgptBriefDigestField[];
  onViewFull?: () => void;
  onContinueGpt2?: () => void;
}) {
  if (digest.length === 0) return null;
  return (
    <div className="s00-pcg__cgptDigest" data-testid="page-concept-cgpt-digest-card">
      {digest.map((field) => (
        <div className="s00-pcg__cgptDigestRow" key={field.id}>
          <span className="s00-pcg__cgptDigestLabel">{field.label}</span>
          <p className="s00-pcg__cgptDigestExcerpt">{field.excerpt}</p>
        </div>
      ))}
      <div className="s00-pcg__cgptDigestActions">
        {onViewFull ?
          <button type="button" className="s00-pcg__secAction" data-interaction-id="page-concepts-view-cgpt-brief" onClick={onViewFull}>
            VIEW FULL BRIEF
          </button>
        : null}
        {onContinueGpt2 ?
          <button type="button" className="s00-pcg__secAction s00-pcg__secAction--primary" data-testid="page-concept-digest-continue-gpt2" onClick={onContinueGpt2}>
            CONTINUE TO GPT2
          </button>
        : null}
      </div>
    </div>
  );
}

/** @deprecated Prefer CgptBriefDigestCard for founder review. */
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
          VIEW FULL BRIEF
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
      <div className="s00-pcg__gpt2Meta" data-testid="page-concept-gpt2-rationale">
        <p className="s00-pcg__gpt2MetaLine">
          <strong>PREMISE</strong> {concept.premise}
        </p>
        {concept.conceptRationale ?
          <p className="s00-pcg__gpt2MetaLine">
            <strong>RATIONALE</strong> {concept.conceptRationale}
          </p>
        : null}
        {concept.brandSignals ?
          <p className="s00-pcg__gpt2MetaLine">
            <strong>BRAND SIGNALS</strong> {concept.brandSignals}
          </p>
        : null}
        {concept.visualLanguage ?
          <p className="s00-pcg__gpt2MetaLine">
            <strong>VISUAL LANGUAGE</strong> {concept.visualLanguage}
          </p>
        : null}
      </div>
      {src ?
        <>
          <PageConceptContainedPreviewFrame size="mobile" status="READY" imageSrc={src} viewportLabel={title} />
          <button
            type="button"
            className="s00-pcg__secAction"
            data-interaction-id="page-concepts-gpt2-inspect"
            onClick={() => onInspect?.(src, title, subtitle)}
          >
            FULLSCREEN
          </button>
        </>
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
}: {
  slot: NbpSlotPresentation;
  selected: boolean;
  onSelect: () => void;
  onInspect?: (src: string) => void;
}) {
  let inner: ReactNode;
  if (slot.status === 'READY' && slot.imageSrc) {
    inner = (
      <PageConceptContainedPreviewFrame
        size="thumb"
        status="READY"
        imageSrc={slot.imageSrc}
        testId={`page-concept-thumb-${slot.key}`}
      />
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
  const label =
    slot.viewport === 'MOBILE' && slot.key.startsWith('gpt2.') ?
      `GPT2 MOBILE PAGE CONCEPT ${slot.label}`
    : `${slot.viewport} · INTERPRETATION ${slot.label}`;
  const frameStatus =
    slot.status === 'READY' ? 'READY'
    : slot.status === 'FAILED' ? 'FAILED'
    : slot.status === 'GENERATING' ? 'GENERATING'
    : 'PENDING';
  const containSize = slot.viewport === 'MOBILE' ? 'mobile' : 'desktop';
  return (
    <div className="s00-pcg__nbpHero" data-viewport={slot.viewport}>
      <header className="s00-pcg__nbpHeroHead">{label}</header>
      <PageConceptContainedPreviewFrame
        size={containSize}
        viewportLabel={label}
        status={frameStatus}
        imageSrc={slot.imageSrc}
        failureReason={slot.failureReason}
        testId="page-concept-nbp-hero-preview"
      />
      {slot.imageSrc && onInspect ?
        <button type="button" className="s00-pcg__secAction" onClick={() => onInspect(slot.imageSrc!)}>
          FULLSCREEN
        </button>
      : null}
    </div>
  );
}
