import type { CSSProperties } from 'react';
import type {
  CompiledMobileTwinImplementationDocument,
  MobileTwinImplementationRenderTreeNode,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import { isSemanticDebugLabel } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M1/semanticDebugLabelFirewall.js';
import { assertRuntimeImageSourceAllowed } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2/runtimeAuthorityRasterFirewall.js';
import '../../styles/site00-mobile-twin-implementation-r8m1.css';
import '../../styles/site00-mobile-twin-implementation-r8m2.css';
import '../../styles/site00-mobile-twin-implementation-r8m2r3.css';
import '../../styles/site00-mobile-twin-implementation-r8m2r4.css';
import '../../styles/site00-mobile-twin-implementation-r8m2r5.css';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
  onNodeActivate?: (objectId: string) => void;
};

function sectionClass(sectionId: string): string {
  if (sectionId === 'host') return 'site00-mobile-twin-compiled-impl__section site00-mobile-twin-compiled-impl__section--host';
  if (sectionId === 'hero') return 'site00-mobile-twin-compiled-impl__section site00-mobile-twin-compiled-impl__section--hero';
  return 'site00-mobile-twin-compiled-impl__section';
}

function rowClass(sectionId: string, layoutMode: 'legacy' | 'td' | 'af' | 'fb'): string {
  if (layoutMode === 'fb') {
    if (sectionId === 'fb-hero-workspace') return 'site00-twin-fb__hero-grid';
    if (sectionId === 'fb-candidate-gallery') return 'site00-twin-fb__gallery-sheet';
    if (sectionId === 'fb-structured-output') return 'site00-twin-fb__structured-band';
    if (sectionId === 'fb-bottom-nav') return 'site00-twin-fb__bottom-nav';
    if (sectionId === 'fb-readiness') return 'site00-twin-fb__readiness-row';
    if (sectionId === 'fb-concept-data-history') return 'site00-twin-fb__metadata-strip';
    if (sectionId === 'fb-authority-panel') return 'site00-twin-fb__authority-rail';
    if (sectionId === 'fb-decision-bar') return 'site00-twin-fb__decision-row';
    return 'site00-twin-fb__row';
  }
  if (layoutMode === 'af') {
    if (sectionId === 'af-hero') return 'site00-twin-af__hero-grid';
    if (sectionId === 'af-gallery') return 'site00-twin-af__gallery-sheet';
    if (sectionId === 'af-structured') return 'site00-twin-af__structured-band';
    if (sectionId === 'af-bottom-nav') return 'site00-twin-af__bottom-nav';
    if (sectionId === 'af-readiness') return 'site00-twin-af__readiness-row';
    if (sectionId === 'af-metadata') return 'site00-twin-af__metadata-strip';
    if (sectionId === 'af-authority') return 'site00-twin-af__authority-rail';
    if (sectionId === 'af-decision') return 'site00-twin-af__decision-row';
    return 'site00-twin-af__decision-row';
  }
  if (layoutMode === 'td') {
    if (sectionId === 'td-hero') return 'site00-twin-td__hero-grid';
    if (sectionId === 'td-gallery') return 'site00-twin-td__gallery-sheet';
    if (sectionId === 'td-structured') return 'site00-twin-td__structured-band';
    if (sectionId === 'td-bottom-nav') return 'site00-twin-td__bottom-nav';
    if (sectionId === 'td-readiness') return 'site00-twin-td__readiness-row';
    if (sectionId === 'td-metadata') return 'site00-twin-td__metadata-strip';
    if (sectionId === 'td-authority') return 'site00-twin-td__authority-rail';
    if (sectionId === 'td-decision') return 'site00-twin-td__decision-row';
    return 'site00-twin-td__decision-row';
  }
  if (sectionId === 'gallery') return 'site00-mobile-twin-compiled-impl__gallery';
  if (sectionId === 'structured-output') return 'site00-mobile-twin-compiled-impl__structured';
  if (sectionId === 'bottom-nav') return 'site00-mobile-twin-compiled-impl__bottom-nav';
  if (sectionId === 'hero') return 'site00-mobile-twin-compiled-impl__hero-grid';
  return 'site00-mobile-twin-compiled-impl__row';
}

function cssVarsFromDocument(document: CompiledMobileTwinImplementationDocument): CSSProperties | undefined {
  const vars = document.forensicStyleContract?.cssVariables ?? document.actualFirstStyleContract?.cssVariables;
  if (!vars) return undefined;
  return vars as CSSProperties;
}

function visibleCopy(node: { displayText?: string | null; semanticRole: string }): string | null {
  const text = node.displayText?.trim();
  if (text) {
    if (isSemanticDebugLabel(text)) return null;
    return text;
  }
  return null;
}

/** R8M2 visual implementation — canonical assets + fidelity; never authority raster at runtime. */
export function MobileTwinCompiledImplementationRenderer({ document, onNodeActivate }: Props) {
  const forensicDriven = document.compilerGeneration === 'R8M2R5';
  const actualFirst = document.compilerGeneration === 'R8M2R4';
  const translationDriven = document.compilerGeneration === 'R8M2R3';
  const layoutMode =
    forensicDriven ? 'fb'
    : actualFirst ? 'af'
    : translationDriven ? 'td'
    : 'legacy';
  const rootClass =
    forensicDriven ? 'site00-twin-fb'
    : actualFirst ? 'site00-twin-af'
    : translationDriven ? 'site00-twin-td'
    : 'site00-mobile-twin-compiled-impl';
  const assetTraceByObjectId = new Map(
    (document.assetTraceability ?? []).map((t) => [t.objectId, t]),
  );
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
      className={rootClass}
      data-testid="mobile-twin-compiled-implementation"
      data-compiler-generation={document.compilerGeneration ?? 'legacy'}
      data-implementation-generation-mode={document.implementationGenerationMode ?? undefined}
      style={{
        width: '100%',
        maxWidth: document.widthPx,
        margin: '0 auto',
        ...cssVarsFromDocument(document),
      }}
    >
      {sectionOrder.map((sectionId) => {
        const sectionNodes = bySection.get(sectionId);
        if (!sectionNodes?.length) return null;
        const meta = sections.find((s) => s.id === sectionId);
        return (
          <section
            key={sectionId}
            className={
              layoutMode === 'fb' ? 'site00-twin-fb__section'
              : layoutMode === 'af' ? 'site00-twin-af__section'
              : layoutMode === 'td' ? 'site00-twin-td__section'
              : sectionClass(sectionId)
            }
            data-section-id={sectionId}
          >
            {meta ?
              <p
                className={
                  layoutMode === 'fb' ? 'site00-twin-fb__section-title'
                  : layoutMode === 'af' ? 'site00-twin-af__section-title'
                  : layoutMode === 'td' ? 'site00-twin-td__section-title'
                  : 'site00-mobile-twin-compiled-impl__section-title'
                }
              >
                {meta.label}
              </p>
            : null}
            <div
              className={
                layoutMode === 'legacy' && sectionId === 'readiness' ?
                  `${rowClass(sectionId, 'legacy')} site00-mobile-twin-compiled-impl__readiness-row`
                : rowClass(sectionId, layoutMode)
              }
            >
              {sectionNodes.map((node) => {
                const copy = visibleCopy({ displayText: node.displayText, semanticRole: '' });
                const interactive = Boolean(node.interactionIntent || node.functionBinding);
                let safeImageUri: string | null = node.imageUri ?? null;
                if (safeImageUri) {
                  try {
                    assertRuntimeImageSourceAllowed(safeImageUri);
                  } catch {
                    safeImageUri = null;
                  }
                }
                const isImage = Boolean(safeImageUri);
                const isGauge = node.componentType === 'GAUGE';
                const Tag = interactive ? 'button' : 'div';
                const trace = assetTraceByObjectId.get(node.objectId);
                const controlRole = node.styles?.['--twin-control-role'] as string | undefined;
                return (
                  <Tag
                    key={node.objectId}
                    type={interactive ? 'button' : undefined}
                    className={
                      layoutMode === 'fb' ?
                        `site00-twin-fb__node${interactive ? ' site00-twin-fb__node--interactive' : ''}`
                      : layoutMode === 'af' ?
                        `site00-twin-af__node${interactive ? ' site00-twin-af__node--interactive' : ''}`
                      : layoutMode === 'td' ?
                        `site00-twin-td__node${interactive ? ' site00-twin-td__node--interactive' : ''}`
                      : `site00-mobile-twin-compiled-impl__node${interactive ? ' site00-mobile-twin-compiled-impl__node--interactive' : ''}`
                    }
                    data-object-id={node.objectId}
                    data-primitive={node.primitive}
                    data-component={node.componentType}
                    data-control-role={controlRole}
                    data-asset-slot={trace?.assetSlotId ?? undefined}
                    data-canonical-asset={trace?.canonicalAssetId ?? undefined}
                    data-asset-source={trace?.sourceCategory ?? undefined}
                    data-testid={`compiled-node-${node.objectId}`}
                    onClick={interactive ? () => onNodeActivate?.(node.objectId) : undefined}
                    style={node.styles as CSSProperties}
                  >
                    {isImage ?
                      <div
                        className={
                          layoutMode === 'fb' ? 'site00-twin-fb__image-wrap'
                          : layoutMode === 'af' ? 'site00-twin-af__image-wrap'
                          : layoutMode === 'td' ? 'site00-twin-td__image-wrap'
                          : `site00-mobile-twin-compiled-impl__image-wrap${node.componentType === 'CARD' ? ' site00-mobile-twin-compiled-impl__thumb' : ''}`
                        }
                      >
                        <img src={safeImageUri!} alt="" draggable={false} />
                      </div>
                    : null}
                    {isGauge ?
                      <div
                        className={
                          layoutMode === 'fb' ? 'site00-twin-fb__gauge'
                          : layoutMode === 'af' ? 'site00-twin-af__gauge'
                          : layoutMode === 'td' ? 'site00-twin-td__gauge'
                          : 'site00-mobile-twin-compiled-impl__gauge'
                        }
                        aria-hidden
                      >
                        <div
                          className={
                            layoutMode === 'fb' ? 'site00-twin-fb__gauge-fill'
                            : layoutMode === 'af' ? 'site00-twin-af__gauge-fill'
                            : layoutMode === 'td' ? 'site00-twin-td__gauge-fill'
                            : 'site00-mobile-twin-compiled-impl__gauge-fill'
                          }
                        />
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
