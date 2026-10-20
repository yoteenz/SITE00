/**
 * Canonical IDNTY Digital Foundation builder ownership (source-verified).
 * Last review that rendered Spatial Studio iframes as “builder”: a41ee31a (mislabeled — not this product).
 */
import { reviewAnchorForView } from './reviewLinks';

export const BUILDER_LAST_WORKING_REVIEW_SHA = 'a41ee31a';
export const BUILDER_DISAPPEARANCE_CAUSE =
  '2693662b replaced BLDR iframes with DEPRECATED redirect panels; registry grouped PLACE–BLUEPRINT under builder navigation.';

export type BuilderManifestPage = {
  id: string;
  anchorId: string;
  pageName: string;
  componentSource: string;
  exportName: string;
  reviewState?: 'default' | 'domain_expanded' | 'email_expanded';
};

/** Verified IDNTY foundation builder — single parent with in-page service rows (domain / email / migration). */
export const DIGITAL_FOUNDATION_BUILDER_MANIFEST = {
  version: '2026-10-20-canonical1',
  productOwner: 'IDNTY_DIGITAL_FOUNDATION',
  parentModule: 'foundation-client/parents/EntryIntake.tsx',
  pages: [
    {
      id: 'DFB-P03',
      anchorId: reviewAnchorForView('P03'),
      pageName: 'Build your foundation',
      componentSource: 'foundation-client/parents/EntryIntake.tsx',
      exportName: 'P03Configure',
      reviewState: 'default',
    },
    {
      id: 'DFB-P03-DOMAIN',
      anchorId: 'df-r-P03-domain',
      pageName: 'Foundation builder · domain path open',
      componentSource: 'foundation-client/parents/EntryIntake.tsx',
      exportName: 'P03Configure',
      reviewState: 'domain_expanded',
    },
    {
      id: 'DFB-P03-EMAIL',
      anchorId: 'df-r-P03-email',
      pageName: 'Foundation builder · email row open',
      componentSource: 'foundation-client/parents/EntryIntake.tsx',
      exportName: 'P03Configure',
      reviewState: 'email_expanded',
    },
  ] satisfies BuilderManifestPage[],
  spatialStudioMislabel: {
    rooms: ['PLACE', 'FEEL', 'WORK', 'PACE', 'BLUEPRINT'] as const,
    productOwner: 'SITE00_PUBLIC_BUILDER',
    componentSource: 'pages/bldr/BldrSpatialStudioPage.tsx → BuilderStudio',
    note: 'Previously shown in DF review; not the IDNTY foundation configurator.',
  },
} as const;

export function builderManifestAnchorIds(): string[] {
  return DIGITAL_FOUNDATION_BUILDER_MANIFEST.pages.map((p) => p.anchorId);
}
