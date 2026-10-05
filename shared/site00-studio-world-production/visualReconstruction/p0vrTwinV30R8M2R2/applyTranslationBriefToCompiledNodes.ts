import type { CompiledMobileTwinNode, MobileTwinImplementationRenderTreeNode } from '../p0vrTwinV30R8M/types.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import type { ImplementationExpressionIR } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { ImplementationTranslationBrief, VisualImplementationCodingPrompt } from './implementationTranslationBriefTypes.js';
import { buildTranslationPromptTraceLinks } from './translationPromptTraceability.js';

export type TranslationCompileContext = {
  brief: ImplementationTranslationBrief;
  codingPrompt: VisualImplementationCodingPrompt;
  expressionIr: ImplementationExpressionIR;
};

function sectionIdForKey(key: string): string {
  if (key.startsWith('host-')) return 'HOST_SHELL';
  if (key.startsWith('context-')) return 'PROJECT_CONTEXT';
  if (key.includes('gallery')) return 'CANDIDATE_GALLERY';
  if (key.includes('readiness')) return 'READINESS';
  if (key.includes('mobile-nav')) return 'BOTTOM_NAV';
  if (key.includes('authority') || key.includes('select-') || key.includes('promote-')) return 'AUTHORITY_PANEL';
  if (key.includes('dominant-')) return 'HERO_WORKSPACE';
  if (['refine-btn', 'regen-btn', 'inspect-btn', 'primary-next-action'].includes(key)) return 'DECISION_BAR';
  if (key.includes('grounding') || key.includes('blueprint-card') || key.includes('structured')) return 'STRUCTURED_OUTPUT';
  return 'HERO_WORKSPACE';
}

/** Apply written translation directives onto compiled nodes (consumption proof). */
export function applyTranslationBriefToCompiledNodes(input: {
  nodes: CompiledMobileTwinNode[];
  renderTreeNodes: MobileTwinImplementationRenderTreeNode[];
  context: TranslationCompileContext;
}): { nodes: CompiledMobileTwinNode[]; renderTreeNodes: MobileTwinImplementationRenderTreeNode[]; traceLinks: ReturnType<typeof buildTranslationPromptTraceLinks> } {
  const { context } = input;
  if (!context.codingPrompt.fullText.includes('DO NOT REDESIGN')) {
    throw new Error('TRANSLATION_BRIEF_NOT_CONSUMED');
  }

  const nodes = input.nodes.map((n) => {
    const key = resolveTemplateKeyFromObjectId(n.objectId);
    const styles = { ...n.styles };
    const sectionId = sectionIdForKey(key);

    if (sectionId === 'AUTHORITY_PANEL' && (n.componentType === 'BUTTON' || key.includes('btn'))) {
      if (key !== 'promote-mobile-btn' && key !== 'primary-next-action' && styles.background === '#c8ff00') {
        styles.background = '#161616';
        styles.color = '#f0f0f0';
        styles.border = '1px solid #333';
      }
    }

    if (sectionId === 'HERO_WORKSPACE' && key.includes('headline')) {
      styles.fontSize = '20px';
      styles.fontWeight = '900';
      styles.lineHeight = '1.05';
    }

    if (sectionId === 'CANDIDATE_GALLERY') {
      styles.marginRight = '4px';
    }

    if (sectionId === 'BOTTOM_NAV') {
      styles.background = styles.background === '#c8ff00' ? '#1a1a1a' : styles.background;
    }

    return { ...n, styles };
  });

  const traceLinks = buildTranslationPromptTraceLinks({
    compositionObjectIds: nodes.map((n) => n.objectId),
    expressionIr: context.expressionIr,
    brief: context.brief,
  });

  const renderTreeNodes = input.renderTreeNodes.map((tn) => {
    const link = traceLinks.find((l) => l.runtimeObjectId === tn.objectId);
    const flat = nodes.find((n) => n.objectId === tn.objectId);
    return {
      ...tn,
      styles: flat?.styles ?? tn.styles,
      visualStyleSource: 'IMPLEMENTATION_EXPRESSION_IR' as const,
      authorityEvidence: link ?
        `${link.actualEvidence ?? '—'}|${link.blueprintEvidence ?? '—'}|brief:${link.translationBriefSectionId}`
      : tn.authorityEvidence,
    };
  });

  return { nodes, renderTreeNodes, traceLinks };
}
