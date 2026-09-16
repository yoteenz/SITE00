/**
 * P0.VR.OPUS-NATIVE1 — Phase 3 + 9: the registry that tells the runtime what a
 * design surface actually consists of.
 *
 * This is the thing that lets the native runtime beat a generic coding agent.
 * Cursor has to rediscover which component, stylesheet, state hook and golden
 * belong to a route by searching the repository on every run. SITE 00 already
 * knows, so the answer is declared once here and compiled into context
 * directly. Adding a surface is a registry entry, not a code change.
 */

export interface DesignSurfaceEntry {
  pageId: string;
  route: string;
  pageRole: string;
  projectSlug: string;
  projectName: string;
  projectType: string;
  /** Entry points. The dependency walker expands from these. */
  components: string[];
  styles: string[];
  stateHooks: string[];
  contentModules: string[];
  /** Phase 14 — explicit reference identity, never a prose description. */
  goldenReferencePath: string | null;
  goldenReferenceVersion: string;
  goldenApprovalState: 'APPROVED' | 'CANDIDATE' | 'SUPERSEDED' | 'UNKNOWN';
  /** Approved contract documents for this surface. */
  interactionContractPath: string | null;
  stateContractPath: string | null;
  designLanguage: string | null;
  creativeContext: string | null;
  currentDesignAuthority: string | null;
  parentDesignAuthority: string | null;
  approvedLineage: string[];
  /** Files this surface's runs may write to. Firewalled surfaces list none. */
  writable: string[];
  /** Why a surface is read-only, shown to the agent so it does not try. */
  writeFirewallReason: string | null;
}

/**
 * The canonical NDXBOOK design reconstruction is deliberately READ-ONLY to the
 * agent. Seven sprints converged it to a 2.0px drift against the golden and it
 * is under an explicit firewall; a native runtime's first act must not be to
 * put that at risk. The agent can inspect it fully, which is what makes it
 * useful as reference context for other work.
 */
export const DESIGN_SURFACES: DesignSurfaceEntry[] = [
  {
    pageId: 'twin-opus-direct',
    route: '/projects/:projectSlug/design/twin-opus-direct',
    pageRole: 'DESIGN workspace reconstruction (canonical authority)',
    projectSlug: 'ndxbook',
    projectName: 'NDXBOOK',
    projectType: 'CULTURAL_INTELLIGENCE_EDITORIAL',
    components: [
      'src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx',
      'src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx',
      'src/site00/components/designBench/opusDirect/TwinOpusDirectListView.tsx',
      'src/site00/components/designBench/opusDirect/TwinOpusDirectViewModeControl.tsx',
      'src/site00/components/designBench/opusDirect/TwinOpusDirectIcons.tsx',
    ],
    styles: [
      'src/site00/styles/site00-twin-opus-direct.css',
      'src/site00/styles/site00-twin-opus-list.css',
    ],
    stateHooks: ['src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts'],
    contentModules: ['src/site00/components/designBench/opusDirect/twinOpusDirectContent.ts'],
    goldenReferencePath:
      'public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg',
    goldenReferenceVersion: 'founder-r5f2-ndxbook',
    goldenApprovalState: 'APPROVED',
    interactionContractPath: 'docs/design-workspace/01-ELEMENT-INVENTORY.md',
    stateContractPath: 'docs/design-workspace/03-STATE-MODEL.md',
    designLanguage:
      'NDXBOOK editorial technical: black / white / lime, sharp geometry, condensed mono and editorial display type, hierarchical borders, no rounded outer frame.',
    creativeContext: 'CULTURAL_INTELLIGENCE_EDITORIAL',
    currentDesignAuthority: 'P0.VR.DESIGNBENCH.OPUS-VIEWMODE1R1',
    parentDesignAuthority: 'P0.VR.DESIGNBENCH.OPUS-DIRECT1R2',
    approvedLineage: [
      'P0.VR.DESIGNBENCH.OPUS-DIRECT1',
      'P0.VR.DESIGNBENCH.OPUS-DIRECT1R1',
      'P0.VR.DESIGNBENCH.OPUS-DIRECT1R2',
      'P0.VR.DESIGNBENCH.OPUS-VIEWMODE1',
      'P0.VR.DESIGNBENCH.OPUS-LIST-REFINE1',
      'P0.VR.DESIGNBENCH.OPUS-VIEWMODE1R1',
    ],
    writable: [],
    writeFirewallReason:
      'Canonical reconstruction under firewall: converged to 2.0px max drift against the approved golden across seven sprints. Inspect freely; propose changes as a sprint, not as an agent patch.',
  },

  {
    pageId: 'opus-native-proof',
    route: '/projects/:projectSlug/design/opus-native',
    pageRole: 'Native Opus runtime test surface',
    projectSlug: 'ndxbook',
    projectName: 'NDXBOOK',
    projectType: 'CULTURAL_INTELLIGENCE_EDITORIAL',
    components: [
      'src/site00/components/designBench/opusNative/OpusNativeProofSurface.tsx',
      'src/site00/components/designBench/opusNative/OpusNativeAgentPanel.tsx',
    ],
    styles: ['src/site00/styles/site00-opus-native.css'],
    stateHooks: [],
    contentModules: [],
    goldenReferencePath:
      'public/site00/twin-v3-design-page-authority/founder-r5f2-ndxbook/mobile-master.jpg',
    goldenReferenceVersion: 'founder-r5f2-ndxbook',
    goldenApprovalState: 'APPROVED',
    interactionContractPath: 'docs/design-workspace/01-ELEMENT-INVENTORY.md',
    stateContractPath: 'docs/design-workspace/03-STATE-MODEL.md',
    designLanguage:
      'NDXBOOK editorial technical: black / white / lime, sharp geometry, hierarchical borders.',
    creativeContext: 'CULTURAL_INTELLIGENCE_EDITORIAL',
    currentDesignAuthority: 'P0.VR.OPUS-NATIVE1',
    parentDesignAuthority: 'P0.VR.DESIGNBENCH.OPUS-VIEWMODE1R1',
    approvedLineage: ['P0.VR.OPUS-NATIVE1'],
    /**
     * The proof surface is the only writable target in the registry, and only
     * its stylesheet. Phase 23 asks for a harmless reversible visual task on a
     * test route; narrowing the write boundary to one file is what makes that
     * guarantee structural rather than a promise.
     */
    writable: ['src/site00/styles/site00-opus-native.css'],
    writeFirewallReason: null,
  },
];

export function findSurface(ref: { route?: string; pageId?: string }): DesignSurfaceEntry | null {
  if (ref.pageId) {
    const byId = DESIGN_SURFACES.find((surface) => surface.pageId === ref.pageId);
    if (byId) return byId;
  }
  if (ref.route) {
    const normalized = ref.route.replace(/\/+$/, '');
    const byRoute = DESIGN_SURFACES.find((surface) => {
      const pattern = surface.route.replace(/:[A-Za-z]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(normalized);
    });
    if (byRoute) return byRoute;
    const bySuffix = DESIGN_SURFACES.find((surface) => normalized.endsWith(`/${surface.pageId}`));
    if (bySuffix) return bySuffix;
  }
  return null;
}

export function defaultSurface(): DesignSurfaceEntry {
  return DESIGN_SURFACES.find((s) => s.pageId === 'opus-native-proof') ?? DESIGN_SURFACES[0];
}
