import type { TwinV4IsolationContract } from './twinV4Types.js';

export const TWIN_V4_ISOLATION_CONTRACT: TwinV4IsolationContract = {
  inheritsV3RenderTree: false,
  inheritsV3Css: false,
  inheritsV3LayoutContracts: false,
  inheritsV3ExpressionIR: false,
  inheritsV3TranslationBrief: false,
  inheritsV3ForensicGenerationPath: false,
  inheritsV3AutobuildCache: false,
};

/** Forbidden V3 visual module path fragments for static audit tests. */
export const TWIN_V4_FORBIDDEN_V3_IMPORT_FRAGMENTS = [
  'p0vrTwinV30R8M3/compileVisualMobileTwinImplementationR8M3',
  'p0vrTwinV30R8M2R5/compileVisualMobileTwinImplementationR8M2R5',
  'MobileTwinCompiledImplementationRenderer',
  'site00-mobile-twin-implementation-r8m',
  'site00-twin-fb',
  'site00-twin-fm3',
  'site00-twin-af',
  'compileApprovedMobileTwinPackage',
  'resolveTwinImplementationPreview',
] as const;
