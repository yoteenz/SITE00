/**
 * P0.VR.3G — ExperiencePage abstraction types.
 */

import { P0_VR_3G_LINEAGE } from './constants.js';

export { P0_VR_3G_LINEAGE };

export type ExperiencePageFamily = 'INFORMATION' | 'AUTH' | 'COMPLEX' | 'NDXBOOK_WORKSPACE';

export type ExperiencePageRegion =
  | 'HEADER'
  | 'INTRO'
  | 'PRIMARY'
  | 'SECONDARY'
  | 'SIDEBAR'
  | 'FOOTER'
  | 'AUTH_FORM'
  | 'PLACEHOLDER';

export type ExperiencePageTemplate = {
  templateId: string;
  family: ExperiencePageFamily;
  inheritedRegions: ExperiencePageRegion[];
  shellComponent: string;
  responsiveModel: 'PUBLIC_PAGE' | 'AUTH_SPLIT' | 'WORKSPACE_SHELL';
};

export type ExperiencePageDefinition = {
  pageId: string;
  route: string;
  displayName: string;
  family: ExperiencePageFamily;
  templateId: string;
  regions: ExperiencePageRegion[];
  regionOverrides?: Partial<Record<ExperiencePageRegion, string>>;
};

export type FamilyDerivationReceipt = {
  receiptId: string;
  pageId: string;
  family: ExperiencePageFamily;
  templateId: string;
  regionsInherited: ExperiencePageRegion[];
  regionsOverridden: ExperiencePageRegion[];
  createdAt: string;
  lineage: typeof P0_VR_3G_LINEAGE;
};
