/** Studio OS Production asset forensics — client-safe types (no provider prompts). */

export type ProductionTab =
  | 'hub'
  | 'inbox'
  | 'design'
  | 'experience'
  | 'expression'
  | 'library'
  | 'activity';

export type AssetSourceType =
  | 'OPENART'
  | 'REPO_EXISTING'
  | 'AUTHORITY_PACK'
  | 'USER_SUPPLIED'
  | 'STUDIO_WORLD_CANON'
  | 'PROJECT_CANON'
  | 'UNKNOWN_SOURCE';

export type AssetAuthorityStatus =
  | 'CANONICAL'
  | 'USED_BY_AUTHORITY'
  | 'CANDIDATE'
  | 'SUPERSEDED'
  | 'UNAPPROVED'
  | 'UNKNOWN_APPROVAL'
  | 'MISSING_SOURCE'
  | 'SOURCE_MATCH_UNCERTAIN';

export type ProductionAssetRecord = {
  assetId: string;
  canonicalName: string;
  sourceType: AssetSourceType;
  repoPath: string | null;
  publicPath: string | null;
  productionTab: ProductionTab | 'shared';
  assetRole: string;
  authorityStatus: AssetAuthorityStatus;
  usedByRoutes: readonly string[];
  variantOf: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  notes: string;
};

export type RouteAssetManifest = {
  manifestId: string;
  route: string;
  productionTab: ProductionTab;
  authorityRef: string;
  requiredAssetIds: readonly string[];
  optionalAssetIds: readonly string[];
  missingSlots: readonly { role: string; classification: 'MISSING_SOURCE_ASSET' | 'SOURCE_MATCH_UNCERTAIN'; note: string }[];
};
