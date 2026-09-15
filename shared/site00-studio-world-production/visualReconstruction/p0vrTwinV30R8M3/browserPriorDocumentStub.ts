import type { CompiledMobileTwinImplementationDocument } from '../p0vrTwinV30R8M/types.js';

/** Lightweight prior doc for stale-tree firewall in browser (avoids full R8M2R5 compile on main thread). */
export function browserPriorR8M2R5DocumentStub(): CompiledMobileTwinImplementationDocument {
  return {
    lineage: 'P0.VR.TWINV3.0R8M2R5',
    compilerGeneration: 'R8M2R5',
    viewport: 'MOBILE',
    widthPx: 390,
    heightPx: 844,
    nodes: [],
    renderTree: {
      rootSectionId: 'fb-root',
      sections: [{ id: 'fb-hero-workspace', label: 'HERO', ownership: 'ACTIVE_PROJECT' }],
      nodes: [
        {
          objectId: 'prior-fb-stub',
          parentId: null,
          sectionId: 'fb-hero-workspace',
          componentType: 'TEXT_BLOCK',
          componentName: 'PriorStub',
          visualStyleSource: 'APPROVED_ACTUAL_REFERENCE',
          assetSource: null,
          typographySource: null,
          functionBinding: null,
          ownership: 'ACTIVE_PROJECT',
          runtimeState: 'DEFAULT',
          displayText: null,
          imageUri: null,
          primitive: 'TEXT',
          layoutOrder: 0,
          styles: {},
          interactionIntent: null,
          styleSource: 'FORENSIC_SPEC_REBUILD',
          authorityEvidence: 'prior-r8m2r5-browser-stub',
        },
      ],
    },
    sourceArtifactIds: ['prior-stub'],
    forbiddenPrimitiveScan: { violations: [], count: 0 },
    structuredSource: 'COMPOSITION_AND_PACKAGE_ARTIFACTS',
  };
}
