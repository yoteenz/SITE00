/**
 * ClientProcessReferenceAudit — twin-route reachable modules audited for R8M2R5F1.
 * Each entry: file path + classification (SERVER_ONLY | CLIENT_SAFE_REPLACEMENT_REQUIRED | DEAD_CODE | TEST_ONLY).
 */

export type ClientProcessReferenceClassification =
  | 'SERVER_ONLY'
  | 'CLIENT_SAFE_REPLACEMENT_REQUIRED'
  | 'DEAD_CODE'
  | 'TEST_ONLY';

export type ClientProcessReferenceAuditEntry = {
  file: string;
  classification: ClientProcessReferenceClassification;
  note: string;
};

export const CLIENT_PROCESS_REFERENCE_AUDIT: ClientProcessReferenceAuditEntry[] = [
  {
    file: 'p0vrTwinV30R8M2R5/resolveForensicUiBlueprintAuthoritySync.ts',
    classification: 'CLIENT_SAFE_REPLACEMENT_REQUIRED',
    note: 'Replaced process.env.VITEST with site00IsVitest()',
  },
  {
    file: 'p0vrTwinV30R8M2R5/realBrowserForensicFidelity.ts',
    classification: 'CLIENT_SAFE_REPLACEMENT_REQUIRED',
    note: 'Replaced process.env.VITEST with site00IsVitest()',
  },
  {
    file: 'p0vrTwinV30R8M2R5/dispatchForensicUiBlueprintFal.ts',
    classification: 'SERVER_ONLY',
    note: 'FAL dispatch — not imported from browser autobuild path',
  },
  {
    file: 'site00-visual-generation/falReferenceImageJob.ts',
    classification: 'SERVER_ONLY',
    note: 'FAL credentials — API boundary only',
  },
  {
    file: 'p0vrTwinV30R8M2R1/authorityContentIngestionNode.ts',
    classification: 'SERVER_ONLY',
    note: 'process.cwd — Node ingestion only',
  },
];

/** Files that must not contain unguarded `process.env` (browser-reachable twin compile path). */
export const TWIN_CLIENT_PROCESS_FORBIDDEN_FILES = [
  'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/resolveForensicUiBlueprintAuthoritySync.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M2R5/realBrowserForensicFidelity.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/ensureNdxbookTwinAutobuild.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/compileApprovedMobileTwinPackage.ts',
  'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/resolveTwinImplementationPreview.ts',
] as const;
