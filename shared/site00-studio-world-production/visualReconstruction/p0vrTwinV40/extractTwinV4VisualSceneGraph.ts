import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { TWIN_V4_FORENSIC_CANONICAL_VIEWPORT } from './constants.js';
import type { TwinV4VisualSceneGraph, TwinV4VisualSceneNode, TwinV4TextObjectMap } from './twinV4Types.js';

function node(
  partial: Omit<TwinV4VisualSceneNode, 'x' | 'y' | 'width' | 'height' | 'siblingOrder'> & {
    xRatio: number;
    yRatio: number;
    widthRatio: number;
    heightRatio: number;
  },
): Omit<TwinV4VisualSceneNode, 'siblingOrder'> {
  const { widthPx, heightPx } = TWIN_V4_FORENSIC_CANONICAL_VIEWPORT;
  return {
    ...partial,
    x: Math.round(partial.xRatio * widthPx),
    y: Math.round(partial.yRatio * heightPx),
    width: Math.round(partial.widthRatio * widthPx),
    height: Math.round(partial.heightRatio * heightPx),
    xRatio: partial.xRatio,
    yRatio: partial.yRatio,
    widthRatio: partial.widthRatio,
    heightRatio: partial.heightRatio,
  };
}

/** Hierarchical scene graph for forensic blueprint document layout (geometry-first, no V3 semantics). */
export function extractTwinV4VisualSceneGraph(input: { forensicBlueprintHash: string }): TwinV4VisualSceneGraph {
  const nodes: TwinV4VisualSceneNode[] = [];
  let order = 0;

  const add = (n: ReturnType<typeof node>) => {
    nodes.push({ ...n, siblingOrder: order++ });
  };

  add(
    node({
      sceneNodeId: 'page-root',
      parentNodeId: null,
      type: 'PAGE',
      zIndex: 0,
      xRatio: 0,
      yRatio: 0,
      widthRatio: 1,
      heightRatio: 1,
      alignment: 'left',
      background: '#0a0a0a',
      border: null,
      radius: null,
      textRole: null,
      textContent: null,
      textUncertain: false,
      assetRole: null,
      visualWeight: 1,
      sectionMembership: 'PAGE',
      confidence: 0.98,
    }),
  );

  add(
    node({
      sceneNodeId: 'title-header',
      parentNodeId: 'page-root',
      type: 'TEXT',
      zIndex: 10,
      xRatio: 0.03,
      yRatio: 0.01,
      widthRatio: 0.94,
      heightRatio: 0.035,
      alignment: 'left',
      background: null,
      border: null,
      radius: null,
      textRole: 'forensic-title',
      textContent: 'FORENSIC UI IMPLEMENTATION BLUEPRINT',
      textUncertain: false,
      assetRole: null,
      visualWeight: 0.95,
      sectionMembership: 'title-header',
      confidence: 0.99,
    }),
  );

  add(
    node({
      sceneNodeId: 'body-row',
      parentNodeId: 'page-root',
      type: 'GROUP',
      zIndex: 5,
      xRatio: 0.02,
      yRatio: 0.05,
      widthRatio: 0.96,
      heightRatio: 0.78,
      alignment: 'left',
      background: null,
      border: '1px solid #333',
      radius: '4px',
      textRole: null,
      textContent: null,
      textUncertain: false,
      assetRole: null,
      visualWeight: 0.92,
      sectionMembership: 'main-panel',
      confidence: 0.94,
    }),
  );

  add(
    node({
      sceneNodeId: 'main-reconstruction-panel',
      parentNodeId: 'body-row',
      type: 'PANEL',
      zIndex: 6,
      xRatio: 0.02,
      yRatio: 0.06,
      widthRatio: 0.58,
      heightRatio: 0.76,
      alignment: 'left',
      background: '#111',
      border: '1px solid #444',
      radius: '2px',
      textRole: 'reconstructed-page',
      textContent: null,
      textUncertain: true,
      assetRole: 'embedded-mobile-composition',
      visualWeight: 0.9,
      sectionMembership: 'main-panel',
      confidence: 0.88,
    }),
  );

  add(
    node({
      sceneNodeId: 'callout-layer',
      parentNodeId: 'body-row',
      type: 'GROUP',
      zIndex: 20,
      xRatio: 0.02,
      yRatio: 0.06,
      widthRatio: 0.58,
      heightRatio: 0.76,
      alignment: 'left',
      background: null,
      border: null,
      radius: null,
      textRole: 'callouts',
      textContent: null,
      textUncertain: false,
      assetRole: null,
      visualWeight: 0.85,
      sectionMembership: 'callout-layer',
      confidence: 0.82,
    }),
  );

  for (let i = 1; i <= 12; i += 1) {
    add(
      node({
        sceneNodeId: `callout-${i}`,
        parentNodeId: 'callout-layer',
        type: 'CALLOUT',
        zIndex: 21 + i,
        xRatio: 0.04 + (i % 4) * 0.12,
        yRatio: 0.08 + Math.floor(i / 4) * 0.18,
        widthRatio: 0.04,
        heightRatio: 0.025,
        alignment: 'center',
        background: '#c8ff00',
        border: '1px solid #000',
        radius: '999px',
        textRole: 'callout-index',
        textContent: String(i),
        textUncertain: false,
        assetRole: null,
        visualWeight: 0.7,
        sectionMembership: 'callout-layer',
        confidence: 0.75,
      }),
    );
  }

  add(
    node({
      sceneNodeId: 'spec-table',
      parentNodeId: 'body-row',
      type: 'TABLE',
      zIndex: 8,
      xRatio: 0.62,
      yRatio: 0.06,
      widthRatio: 0.36,
      heightRatio: 0.76,
      alignment: 'left',
      background: '#0d0d0d',
      border: '1px solid #555',
      radius: null,
      textRole: 'object-inventory',
      textContent: null,
      textUncertain: true,
      assetRole: null,
      visualWeight: 0.88,
      sectionMembership: 'spec-table',
      confidence: 0.86,
    }),
  );

  for (let r = 0; r < 18; r += 1) {
    add(
      node({
        sceneNodeId: `spec-row-${r}`,
        parentNodeId: 'spec-table',
        type: 'TABLE_ROW',
        zIndex: 9 + r,
        xRatio: 0.625,
        yRatio: 0.07 + r * 0.038,
        widthRatio: 0.34,
        heightRatio: 0.032,
        alignment: 'left',
        background: r % 2 ? '#121212' : '#0f0f0f',
        border: '1px solid #222',
        radius: null,
        textRole: 'spec-row',
        textContent: null,
        textUncertain: true,
        assetRole: null,
        visualWeight: 0.5,
        sectionMembership: 'spec-table',
        confidence: 0.55,
      }),
    );
  }

  add(
    node({
      sceneNodeId: 'footer-legend-row',
      parentNodeId: 'page-root',
      type: 'GROUP',
      zIndex: 4,
      xRatio: 0.02,
      yRatio: 0.84,
      widthRatio: 0.96,
      heightRatio: 0.14,
      alignment: 'left',
      background: null,
      border: null,
      radius: null,
      textRole: null,
      textContent: null,
      textUncertain: false,
      assetRole: null,
      visualWeight: 0.8,
      sectionMembership: 'lower-notes',
      confidence: 0.9,
    }),
  );

  const footerPanels: Array<{ id: string; label: string; x: number; w: number; section: string }> = [
    { id: 'lower-palette', label: 'COLOR PALETTE', x: 0.02, w: 0.22, section: 'lower-palette' },
    { id: 'typography-key', label: 'TYPOGRAPHY KEY', x: 0.26, w: 0.22, section: 'typography-key' },
    { id: 'divider-specs', label: 'DIVIDER SPECS', x: 0.5, w: 0.22, section: 'divider-specs' },
    { id: 'canonical-viewport-note', label: 'CANONICAL VIEWPORT', x: 0.74, w: 0.24, section: 'lower-notes' },
  ];

  for (const fp of footerPanels) {
    add(
      node({
        sceneNodeId: fp.id,
        parentNodeId: 'footer-legend-row',
        type: 'LEGEND',
        zIndex: 12,
        xRatio: fp.x,
        yRatio: 0.85,
        widthRatio: fp.w,
        heightRatio: 0.11,
        alignment: 'left',
        background: '#141414',
        border: '1px solid #333',
        radius: '2px',
        textRole: 'legend',
        textContent: fp.label,
        textUncertain: false,
        assetRole: null,
        visualWeight: 0.65,
        sectionMembership: fp.section,
        confidence: 0.88,
      }),
    );
  }

  add(
    node({
      sceneNodeId: 'coding-translation-note',
      parentNodeId: 'page-root',
      type: 'ANNOTATION',
      zIndex: 3,
      xRatio: 0.02,
      yRatio: 0.965,
      widthRatio: 0.6,
      heightRatio: 0.028,
      alignment: 'left',
      background: null,
      border: null,
      radius: null,
      textRole: 'coding-note',
      textContent: 'Implementation translation note (geometry authority)',
      textUncertain: true,
      assetRole: null,
      visualWeight: 0.4,
      sectionMembership: 'lower-notes',
      confidence: 0.6,
    }),
  );

  const body = JSON.stringify(nodes.map((n) => n.sceneNodeId));
  return {
    id: `tv4sg-${fnv1aHex(body).slice(0, 10)}`,
    hash: fnv1aHex(`${input.forensicBlueprintHash}:${body}`),
    rootNodeId: 'page-root',
    nodes,
    canonicalViewport: TWIN_V4_FORENSIC_CANONICAL_VIEWPORT,
  };
}

export function buildTwinV4TextObjectMap(sceneGraph: TwinV4VisualSceneGraph): TwinV4TextObjectMap {
  const entries = sceneGraph.nodes
    .filter((n) => n.textRole || n.textContent)
    .map((n) => ({
      sceneNodeId: n.sceneNodeId,
      text: n.textContent ?? `[${n.textRole ?? 'text'}]`,
      role: n.textRole ?? 'unknown',
      fontFamily: 'IBM Plex Sans',
      sizePx: n.type === 'TEXT' && n.sceneNodeId === 'title-header' ? 14 : 10,
      weight: n.sceneNodeId === 'title-header' ? 700 : 500,
      lineHeight: 1.2,
      tracking: '0.04em',
      alignment: n.alignment,
      casing: n.sceneNodeId === 'title-header' ? 'uppercase' : 'mixed',
      widthRatio: n.widthRatio,
      lineCount: n.textUncertain ? 2 : 1,
      uncertain: n.textUncertain,
    }));
  return {
    id: `tv4tom-${sceneGraph.id}`,
    entries,
  };
}
