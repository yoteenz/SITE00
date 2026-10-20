/**
 * Website builder rooms shown on `/foundation/review` under the Builder zone (hybrid spatial studio).
 * Foundation intake “build your foundation” (P03) lives under the INTAKE zone — not here.
 */
import { reviewAnchorForView } from './reviewLinks';

export const BUILDER_LAST_WORKING_REVIEW_SHA = 'a41ee31a';
export const BUILDER_DISAPPEARANCE_CAUSE =
  '2693662b replaced BLDR iframes with blocked panels; restored as sample-mode embeds on the Builder zone.';

export type BuilderManifestPage = {
  id: string;
  anchorId: string;
  pageName: string;
  componentSource: string;
  exportName: string;
  reviewState?: 'default' | 'domain_expanded' | 'email_expanded';
};

const HYBRID_ROOMS = ['PLACE', 'FEEL', 'WORK', 'PACE', 'BLUEPRINT'] as const;

/** Hybrid spatial studio — website builder (SITE 00), not foundation intake P03. */
export const DIGITAL_FOUNDATION_BUILDER_MANIFEST = {
  version: '2026-10-20-website-builder-rooms1',
  productOwner: 'SITE00_PUBLIC_BUILDER',
  parentModule: 'pages/bldr/BldrSpatialStudioPage.tsx',
  pages: HYBRID_ROOMS.map(
    (room): BuilderManifestPage => ({
      id: `BLDR-${room}`,
      anchorId: `df-r-bldr-${room}`,
      pageName: `Website builder · ${room}`,
      componentSource: 'pages/bldr/BldrSpatialStudioPage.tsx → BuilderStudio',
      exportName: 'BuilderStudio',
    }),
  ),
  intakeConfigurator: {
    rooms: [] as const,
    anchorIds: [reviewAnchorForView('P03'), 'df-r-P03-domain', 'df-r-P03-email'] as const,
    productOwner: 'IDNTY_DIGITAL_FOUNDATION',
    componentSource: 'foundation-client/parents/EntryIntake.tsx#P03Configure',
    note: 'Registry group INTAKE — not the Builder zone.',
  },
} as const;

export function builderManifestAnchorIds(): string[] {
  return DIGITAL_FOUNDATION_BUILDER_MANIFEST.pages.map((p) => p.anchorId);
}

export function intakeConfiguratorAnchorIds(): string[] {
  return [...DIGITAL_FOUNDATION_BUILDER_MANIFEST.intakeConfigurator.anchorIds];
}
