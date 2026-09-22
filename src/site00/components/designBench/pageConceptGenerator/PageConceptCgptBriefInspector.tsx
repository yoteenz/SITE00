/**
 * Full CGPT creative direction brief inspector (founder-readable, no provider calls).
 */

import { useState } from 'react';

import { CGPT_BRIEF_FOUNDER_SECTIONS } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderReviewPresentation.js';
import type { PageConceptCgptCreativeBrief } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type {
  PageConceptCreativeLeakageDiagnostic,
  PageConceptGpt2HandoffPresentation,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';

function bodyForSection(
  brief: PageConceptCgptCreativeBrief,
  field: (typeof CGPT_BRIEF_FOUNDER_SECTIONS)[number]['field'],
  join?: boolean,
): string {
  const val = brief[field as keyof PageConceptCgptCreativeBrief];
  if (join && Array.isArray(val)) return val.join('\n');
  if (field === 'avoidList') return brief.avoidList.join('\n');
  if (field === 'requiredContent') {
    return [...brief.requiredContent, ...brief.functionalRequirements].join('\n');
  }
  if (typeof val === 'string') return val;
  return '';
}

function FounderSection({
  num,
  title,
  body,
  source,
  defaultOpen,
}: {
  num: string;
  title: string;
  body: string;
  source?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? (num === '01' || num === '02'));
  if (!body.trim()) return null;
  return (
    <section className="s00-pcg__briefSection" data-testid={`cgpt-brief-section-${num}`}>
      <button type="button" className="s00-pcg__briefSectionToggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="s00-pcg__briefSectionNum">{num}</span>
        <span className="s00-pcg__briefSectionTitle">{title}</span>
        {source ?
          <span className="s00-pcg__briefSectionSource">{source}</span>
        : null}
      </button>
      {open ?
        <p className="s00-pcg__briefSectionBody">{body}</p>
      : null}
    </section>
  );
}

export function PageConceptCgptBriefInspector({
  brief,
  handoff,
  diagnostic,
  projectPageLabel,
}: {
  brief: PageConceptCgptCreativeBrief;
  handoff: PageConceptGpt2HandoffPresentation | null;
  diagnostic: PageConceptCreativeLeakageDiagnostic;
  projectPageLabel?: string;
}) {
  const sourceFor = (id: string) => brief.sectionSources.find((s) => s.sectionId === id)?.sourceLabel;

  const chip = (present: boolean) => (present ? 'PRESENT' : 'MISSING');

  return (
    <div className="s00-pcg__briefInspector" data-testid="page-concept-cgpt-brief-inspector">
      <div className="s00-pcg__briefDrawerHeadMeta">
        <p className="s00-pcg__briefDrawerSubline">{projectPageLabel ?? 'NDXBOOK / OVERVIEW'}</p>
        <div className="s00-pcg__briefStatusChips" data-testid="cgpt-brief-status-chips">
          <span>IDENTITY · {chip(diagnostic.identityGrounding === 'PRESENT')}</span>
          <span>SKIN · {chip(diagnostic.skinGrounding === 'PRESENT')}</span>
          <span>PAGE FUNCTION · {chip(diagnostic.pageFunction === 'PRESENT')}</span>
          <span>CAPTURE · {diagnostic.currentCaptureRole.replace(/_/g, ' ')}</span>
          <span>GPT2 HANDOFF · {diagnostic.gpt2Handoff === 'COMPLETE' ? 'READY' : diagnostic.gpt2Handoff}</span>
        </div>
      </div>

      {CGPT_BRIEF_FOUNDER_SECTIONS.map((sec) => {
        const join = 'join' in sec && sec.join;
        const body =
          sec.field === 'imageryStrategy' && sec.num === '03' ?
            [brief.colorStrategy, brief.materialStrategy, brief.imageryStrategy].filter(Boolean).join('\n')
          : bodyForSection(brief, sec.field, join);
        return (
          <FounderSection
            key={sec.num}
            num={sec.num}
            title={sec.title}
            body={body}
            source={sourceFor(sec.field)}
            defaultOpen={sec.num === '01' || sec.num === '02' || sec.num === '11'}
          />
        );
      })}

      <details className="s00-pcg__briefTechnical" data-testid="cgpt-brief-technical-details">
        <summary>TECHNICAL DETAILS</summary>
        <div className="s00-pcg__briefMeta" data-testid="cgpt-brief-lineage">
          <span>BRIEF {brief.briefId}</span>
          <span>VERSION {brief.version}</span>
          <span>HASH {brief.contentHash}</span>
        </div>
        <div className="s00-pcg__briefDiagnostic" data-testid="cgpt-leakage-diagnostic">
          <span>IDENTITY GROUNDING · {diagnostic.identityGrounding}</span>
          <span>SKIN GROUNDING · {diagnostic.skinGrounding}</span>
          <span>PAGE FUNCTION · {diagnostic.pageFunction}</span>
          <span>CURRENT CAPTURE · {diagnostic.currentCaptureRole}</span>
          <span>GPT2 HANDOFF · {diagnostic.gpt2Handoff}</span>
        </div>
        <pre className="s00-pcg__briefSectionBody">
          {[
            'SOURCE LINEAGE',
            `PROJECT CONTEXT · ${brief.sourceLineage.projectContextVersion ?? '—'}`,
            `PAGE CONTEXT · ${brief.sourceLineage.pageContextVersion ?? '—'}`,
            `FUNCTION CONTRACT · ${brief.sourceLineage.functionContractVersion ?? '—'}`,
            `SKIN · ${brief.sourceLineage.skinVersion ?? '—'}`,
            `CAPTURE REFS · ${brief.sourceLineage.captureRefs ?? '—'}`,
          ].join('\n')}
        </pre>
        {handoff ?
          <pre className="s00-pcg__briefSectionBody" data-testid="gpt2-handoff-inspector">
            {[
              'GPT2 HANDOFF PAYLOAD',
              `CGPT BRIEF · ${handoff.cgptBriefId} · ${handoff.cgptBriefVersion}`,
              `SKIN CONTRACT · ${handoff.skinContractId} · v${handoff.skinContractVersion}`,
              handoff.gpt2TaskInstructions,
              ...Object.entries(handoff.cgptCreativeDirection).map(([k, v]) => `${k.toUpperCase()}: ${v}`),
            ].join('\n')}
          </pre>
        : null}
      </details>
    </div>
  );
}
