import type { CompiledMobileTwinImplementationDocument } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
};

function findSection(document: CompiledMobileTwinImplementationDocument, id: string): string {
  const brief = document.implementationTranslationBrief;
  if (!brief) return '—';
  if (id === 'GLOBAL') return brief.globalTranslation.slice(0, 240);
  const block = brief.sectionTranslations.find((s) => s.sectionId === id);
  return block ? block.implementationGuidance.slice(0, 240) : '—';
}

export function DesignTwinImplementationTranslationInspector({ document }: Props) {
  const brief = document.implementationTranslationBrief;
  const prompt = document.visualImplementationCodingPrompt;
  if (!brief) {
    return <p data-testid="twin-translation-inspector-missing">IMPLEMENTATION TRANSLATION brief not attached.</p>;
  }

  return (
    <details className="site00-dw-v3-twin-impl-translation" data-testid="twin-implementation-translation-inspector">
      <summary>IMPLEMENTATION TRANSLATION</summary>
      <p data-testid="twin-translation-brief-meta">
        {brief.id} · {brief.briefVersion} · hash {brief.hash} · readiness {document.translationReadiness?.status ?? brief.status}
      </p>
      <dl>
        <dt>Global Translation</dt>
        <dd data-testid="twin-translation-global">{findSection(document, 'GLOBAL')}</dd>
        <dt>Hero Translation</dt>
        <dd data-testid="twin-translation-hero">{findSection(document, 'HERO_WORKSPACE')}</dd>
        <dt>Authority Panel Translation</dt>
        <dd data-testid="twin-translation-authority">{findSection(document, 'AUTHORITY_PANEL')}</dd>
        <dt>Gallery Translation</dt>
        <dd data-testid="twin-translation-gallery">{findSection(document, 'CANDIDATE_GALLERY')}</dd>
        <dt>Structured Output Translation</dt>
        <dd data-testid="twin-translation-structured">{findSection(document, 'STRUCTURED_OUTPUT')}</dd>
        <dt>Readiness Translation</dt>
        <dd data-testid="twin-translation-readiness">{findSection(document, 'READINESS')}</dd>
        <dt>Bottom Nav Translation</dt>
        <dd data-testid="twin-translation-bottom-nav">{findSection(document, 'BOTTOM_NAV')}</dd>
        <dt>Do Not Do</dt>
        <dd data-testid="twin-translation-do-not-do">{brief.doNotDo.slice(0, 280)}</dd>
      </dl>
      {prompt ?
        <p data-testid="twin-coding-prompt-meta">
          Coding prompt {prompt.id} · injected {document.codingPromptInjected ? 'yes' : 'no'} · consumed{' '}
          {document.translationBriefConsumed ? 'yes' : 'no'}
        </p>
      : null}
      {document.translationPromptTrace?.length ?
        <p data-testid="twin-translation-trace-count">Trace links: {document.translationPromptTrace.length}</p>
      : null}
    </details>
  );
}
