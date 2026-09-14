import type { CSSProperties } from 'react';
import type {
  CompiledMobileTwinImplementationDocument,
  MobileTwinImplementationRenderTreeNode,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import { isSemanticDebugLabel } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import '../../styles/site00-mobile-twin-implementation-r8m1.css';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
  onNodeActivate?: (objectId: string) => void;
};

function sectionClass(sectionId: string): string {
  if (sectionId === 'host') return 'site00-mobile-twin-compiled-impl__section site00-mobile-twin-compiled-impl__section--host';
  if (sectionId === 'hero') return 'site00-mobile-twin-compiled-impl__section site00-mobile-twin-compiled-impl__section--hero';
  return 'site00-mobile-twin-compiled-impl__section';
}

function rowClass(sectionId: string): string {
  if (sectionId === 'gallery') return 'site00-mobile-twin-compiled-impl__gallery';
  if (sectionId === 'structured-output') return 'site00-mobile-twin-compiled-impl__structured';
  if (sectionId === 'bottom-nav') return 'site00-mobile-twin-compiled-impl__bottom-nav';
  if (sectionId === 'hero') return 'site00-mobile-twin-compiled-impl__hero-grid';
  return 'site00-mobile-twin-compiled-impl__row';
}

function visibleCopy(node: { displayText?: string | null; semanticRole: string }): string | null {
  const text = node.displayText?.trim();
  if (text) {
    if (isSemanticDebugLabel(text)) return null;
    return text;
  }
  return null;
}

/** R8M1 visual implementation — real copy/assets; never semantic role labels. */
export function MobileTwinCompiledImplementationRenderer({ document, onNodeActivate }: Props) {
  const tree = document.renderTree;
  const sections = tree?.sections ?? [];
  const nodes: MobileTwinImplementationRenderTreeNode[] =
    tree?.nodes ??
    document.nodes.map((n, i) => ({
      objectId: n.objectId,
      parentId: null,
      sectionId: n.sectionId ?? 'workspace',
      componentType: n.componentType ?? 'PANEL',
      componentName: 'LegacyNode',
      visualStyleSource: 'STRUCTURED_GEOMETRY' as const,
      assetSource: n.imageUri ?? null,
      typographySource: null,
      functionBinding: n.functionTarget,
      ownership: n.ownership,
      runtimeState: 'DEFAULT',
      displayText: n.displayText ?? null,
      imageUri: n.imageUri ?? null,
      primitive: n.primitive,
      layoutOrder: i,
      styles: n.styles,
      interactionIntent: n.interactionIntent,
    }));

  const bySection = new Map<string, typeof nodes>();
  for (const node of nodes) {
    const list = bySection.get(node.sectionId) ?? [];
    list.push(node);
    bySection.set(node.sectionId, list);
  }
  for (const [, list] of bySection) {
    list.sort((a, b) => a.layoutOrder - b.layoutOrder);
  }

  const sectionOrder = sections.length ? sections.map((s) => s.id) : [...bySection.keys()];

  return (
    <div
      className="site00-mobile-twin-compiled-impl"
      data-testid="mobile-twin-compiled-implementation"
      data-compiler-generation={document.compilerGeneration ?? 'legacy'}
      style={{
        width: '100%',
        maxWidth: document.widthPx,
        margin: '0 auto',
      }}
    >
      {sectionOrder.map((sectionId) => {
        const sectionNodes = bySection.get(sectionId);
        if (!sectionNodes?.length) return null;
        const meta = sections.find((s) => s.id === sectionId);
        return (
          <section key={sectionId} className={sectionClass(sectionId)} data-section-id={sectionId}>
            {meta ?
              <p className="site00-mobile-twin-compiled-impl__section-title">{meta.label}</p>
            : null}
            <div className={rowClass(sectionId)}>
              {sectionNodes.map((node) => {
                const copy = visibleCopy({ displayText: node.displayText, semanticRole: '' });
                const interactive = Boolean(node.interactionIntent || node.functionBinding);
                const isImage = Boolean(node.imageUri);
                const isGauge = node.componentType === 'GAUGE';
                const Tag = interactive ? 'button' : 'div';
                return (
                  <Tag
                    key={node.objectId}
                    type={interactive ? 'button' : undefined}
                    className={`site00-mobile-twin-compiled-impl__node${interactive ? ' site00-mobile-twin-compiled-impl__node--interactive' : ''}`}
                    data-object-id={node.objectId}
                    data-primitive={node.primitive}
                    data-component={node.componentType}
                    data-testid={`compiled-node-${node.objectId}`}
                    onClick={interactive ? () => onNodeActivate?.(node.objectId) : undefined}
                    style={node.styles as CSSProperties}
                  >
                    {isImage ?
                      <div
                        className={`site00-mobile-twin-compiled-impl__image-wrap${node.componentType === 'CARD' ? ' site00-mobile-twin-compiled-impl__thumb' : ''}`}
                      >
                        <img src={node.imageUri!} alt="" draggable={false} />
                      </div>
                    : null}
                    {isGauge ?
                      <div className="site00-mobile-twin-compiled-impl__gauge" aria-hidden>
                        <div className="site00-mobile-twin-compiled-impl__gauge-fill" />
                      </div>
                    : null}
                    {copy ?
                      <span data-testid={`compiled-copy-${node.objectId}`}>{copy}</span>
                    : null}
                  </Tag>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
