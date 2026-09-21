/**
 * Full CGPT creative direction brief inspector (founder-readable, no provider calls).
 */

import type { PageConceptCgptCreativeBrief } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type {
  PageConceptCreativeLeakageDiagnostic,
  PageConceptGpt2HandoffPresentation,
} from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';

function Section({ num, title, body, source }: { num: string; title: string; body: string; source?: string }) {
  if (!body.trim()) return null;
  return (
    <section className="s00-pcg__briefSection" data-testid={`cgpt-brief-section-${num}`}>
      <header className="s00-pcg__briefSectionHead">
        <span className="s00-pcg__briefSectionNum">{num}</span>
        <span className="s00-pcg__briefSectionTitle">{title}</span>
        {source ?
          <span className="s00-pcg__briefSectionSource">{source}</span>
        : null}
      </header>
      <pre className="s00-pcg__briefSectionBody">{body}</pre>
    </section>
  );
}

export function PageConceptCgptBriefInspector({
  brief,
  handoff,
  diagnostic,
}: {
  brief: PageConceptCgptCreativeBrief;
  handoff: PageConceptGpt2HandoffPresentation | null;
  diagnostic: PageConceptCreativeLeakageDiagnostic;
}) {
  const sourceFor = (id: string) => brief.sectionSources.find((s) => s.sectionId === id)?.sourceLabel;

  return (
    <div className="s00-pcg__briefInspector" data-testid="page-concept-cgpt-brief-inspector">
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

      <Section num="01" title="CREATIVE PREMISE" body={brief.creativePremise} />
      <Section num="02" title="PAGE PURPOSE" body={brief.pagePurpose} source={sourceFor('pageStory')} />
      <Section num="03" title="PAGE STORY" body={brief.pageStory} source={sourceFor('pageStory')} />
      <Section
        num="04"
        title="IDENTITY SIGNALS"
        body={brief.identitySignals.join('\n')}
        source={sourceFor('identitySignals')}
      />
      <Section
        num="05"
        title="SKIN / DESIGN-LANGUAGE SIGNALS"
        body={brief.skinSignals.join('\n')}
        source={sourceFor('skinSignals')}
      />
      <Section num="06" title="COMPOSITION STRATEGY" body={brief.compositionStrategy} />
      <Section num="07" title="HIERARCHY STRATEGY" body={brief.hierarchyStrategy} />
      <Section num="08" title="TYPOGRAPHY STRATEGY" body={brief.typographyStrategy} />
      <Section num="09" title="COLOR STRATEGY" body={brief.colorStrategy} />
      <Section num="10" title="MATERIAL STRATEGY" body={brief.materialStrategy} />
      <Section num="11" title="IMAGERY STRATEGY" body={brief.imageryStrategy} />
      <Section num="12" title="INTERACTION CHARACTER" body={brief.interactionCharacter} />
      <Section num="13" title="KEY MESSAGES" body={brief.keyMessages.join('\n')} />
      <Section
        num="14"
        title="REQUIRED FUNCTIONAL CONTENT"
        body={[...brief.requiredContent, ...brief.functionalRequirements].join('\n')}
        source={sourceFor('functionalRequirements')}
      />
      <Section num="15" title="CREATIVE LATITUDE" body={brief.creativeLatitude} />
      <Section num="16" title="DISTINCTIVE MOVE" body={brief.distinctiveMove} />
      <Section num="17" title="AVOID LIST" body={brief.avoidList.join('\n')} />
      <Section
        num="18"
        title="SOURCE LINEAGE"
        body={[
          `PROJECT CONTEXT · ${brief.sourceLineage.projectContextVersion ?? '—'}`,
          `PAGE CONTEXT · ${brief.sourceLineage.pageContextVersion ?? '—'}`,
          `FUNCTION CONTRACT · ${brief.sourceLineage.functionContractVersion ?? '—'}`,
          `SKIN · ${brief.sourceLineage.skinVersion ?? '—'}`,
          `CAPTURE REFS · ${brief.sourceLineage.captureRefs ?? '—'}`,
          `CURRENT IMPLEMENTATION ROLE · ${brief.currentImplementationRole}`,
          `AESTHETIC AUTHORITY FROM CAPTURE · ${brief.aestheticAuthorityFromCapture}`,
        ].join('\n')}
      />

      {handoff ?
        <details className="s00-pcg__briefHandoff" data-testid="gpt2-handoff-inspector">
          <summary>GPT2 HANDOFF</summary>
          <pre className="s00-pcg__briefSectionBody">
            {[
              `CGPT BRIEF · ${handoff.cgptBriefId} · ${handoff.cgptBriefVersion}`,
              `SKIN CONTRACT · ${handoff.skinContractId} · v${handoff.skinContractVersion}`,
              `PROJECT CONTEXT · ${handoff.projectContextVersion}`,
              `PAGE CONTEXT · ${handoff.pageContextVersion}`,
              `FUNCTION CONTRACT · ${handoff.functionContractVersion}`,
              `CURRENT CAPTURE · ${handoff.currentCaptureRole} · PRIORITY ${handoff.currentCapturePriority}`,
              '',
              'AUTHORITY INSTRUCTIONS',
              handoff.authorityInstructions,
              '',
              'CGPT CREATIVE DIRECTION FIELDS',
              ...Object.entries(handoff.cgptCreativeDirection).map(([k, v]) => `${k.toUpperCase()}: ${v}`),
            ].join('\n')}
          </pre>
        </details>
      : null}
    </div>
  );
}
