/**
 * Visual reference package compilation — exact payload for reference-conditioned generation.
 */

import { createHash } from 'node:crypto';
import type {
  VisualGenerationIntent,
  VisualReferencePackage,
  VisualReferencePackageEntry,
  VisualReferenceRecord,
  ViewportClass,
} from './types.js';
import { resolveVisualGenerationMode } from './generationModeResolver.js';
import { selectVisualReferencesForIntent, type ReferenceSelectionInput } from './referenceSelection.js';

function buildEntryLabel(ref: VisualReferenceRecord): string {
  if (ref.referenceRoles.includes('HOST_SHELL')) return 'HOST VISUAL AUTHORITY';
  if (ref.referenceRoles.includes('HOST_SPATIAL_ATMOSPHERE')) return 'SITE 00 ENVIRONMENT';
  if (ref.referenceRoles.includes('CURRENT_FUNCTIONAL_SURFACE')) return 'CURRENT FUNCTIONAL SURFACE';
  if (ref.approvalStatus === 'STRUCTURAL_REFERENCE') return 'STRUCTURAL REFERENCE';
  if (ref.approvalStatus === 'NEGATIVE_REFERENCE') return 'NEGATIVE REFERENCE';
  if (ref.referenceRoles.includes('CLIENT_VISUAL_IDENTITY')) return 'CLIENT EXPRESSION';
  return ref.referenceRoles[0]?.replace(/_/g, ' ') ?? 'REFERENCE';
}

function buildPreserveList(ref: VisualReferenceRecord): string[] {
  const preserve: string[] = [];
  if (ref.authority.STYLE === 'STRICT' || ref.authority.STYLE === 'STRONG') {
    preserve.push('SITE 00 visual language', 'bright white environment', 'visual restraint', 'host shell behavior');
  }
  if (ref.authority.COLOR === 'STRICT' || ref.authority.COLOR === 'STRONG') {
    preserve.push('red host accent wayfinding behavior', 'color restraint');
  }
  if (ref.authority.TYPOGRAPHY === 'STRICT' || ref.authority.TYPOGRAPHY === 'STRONG') {
    preserve.push('host typography behavior');
  }
  if (ref.authority.SPATIAL_ATMOSPHERE === 'STRICT' || ref.authority.SPATIAL_ATMOSPHERE === 'STRONG') {
    preserve.push('spatial atmosphere', 'environmental architecture', 'environmental brightness');
  }
  if (ref.authority.HIERARCHY === 'STRONG' || ref.approvalStatus === 'STRUCTURAL_REFERENCE') {
    preserve.push('Active Piece dominance', 'elevated Review zone', 'secondary project cluster', 'Work History recession', 'asymmetric hierarchy', 'artifact participation');
  }
  if (ref.authority.FUNCTION === 'FUNCTIONAL_ONLY') {
    preserve.push('information categories that exist', 'route purpose', 'functional relationships');
  }
  return preserve;
}

function buildIgnoreList(ref: VisualReferenceRecord): string[] {
  const ignore: string[] = [];
  if (ref.authority.FUNCTION === 'FUNCTIONAL_ONLY' || ref.authority.LAYOUT === 'NONE') {
    ignore.push('current card layout', 'current composition', 'current information hierarchy presentation');
  }
  if (ref.authority.STYLE === 'NONE' || ref.authority.STYLE === 'STRUCTURAL_ONLY') {
    ignore.push('page-specific content arrangement', 'aesthetic treatment');
  }
  return ignore;
}

function buildDoNotInheritList(ref: VisualReferenceRecord): string[] {
  if (ref.approvalStatus === 'NEGATIVE_REFERENCE' || ref.authority.STYLE === 'NEGATIVE_ONLY') {
    return [
      'dark background',
      'sci-fi visual language',
      'metallic command-center aesthetic',
      'blue/gray palette',
      'gaming UI',
      'futuristic machinery',
      'black command center',
      'aircraft/device centerpiece',
      'generic cyberpunk admin system',
    ];
  }
  if (ref.authority.STYLE === 'STRUCTURAL_ONLY' || ref.approvalStatus === 'STRUCTURAL_REFERENCE') {
    return ['dark background', 'sci-fi visual language', 'metallic command-center aesthetic', 'color palette from structural proof'];
  }
  return ['page-specific legacy content', 'client-specific branding when host reference'];
}

function recordToPackageEntry(ref: VisualReferenceRecord): VisualReferencePackageEntry {
  return {
    referenceId: ref.id,
    storagePath: ref.storagePath,
    publicUrl: ref.publicUrl,
    role: ref.referenceRoles[0] ?? 'HOST_SHELL',
    roles: ref.referenceRoles,
    authority: ref.authority,
    authorityScopes: ref.authorityScopes,
    approvalStatus: ref.approvalStatus,
    sourceType: ref.sourceType,
    whyIncluded: ref.notes ?? `Authoritative for ${ref.referenceRoles.join(', ')}`,
    preserve: buildPreserveList(ref),
    ignore: buildIgnoreList(ref),
    doNotInherit: buildDoNotInheritList(ref),
    label: buildEntryLabel(ref),
  };
}

export function compileVisualReferencePackage(params: {
  generationIntent: VisualGenerationIntent;
  targetDevice?: ViewportClass;
  selectionInput: ReferenceSelectionInput;
  strictHostVisualConditioning?: boolean;
}): VisualReferencePackage {
  const targetDevice = params.targetDevice ?? 'DESKTOP';
  const selected = selectVisualReferencesForIntent(params.selectionInput);
  const entries = selected.map(recordToPackageEntry);

  const antiDirection = [
    'command center',
    'sci-fi',
    'gaming UI',
    'dark interface',
    'metallic control deck',
    'generic futuristic admin system',
    'enterprise SaaS dashboard',
    'cyberpunk',
  ];

  const package_: VisualReferencePackage = {
    generationIntent: params.generationIntent,
    targetSurface: params.selectionInput.targetSurface,
    targetDevice,
    references: entries,
    authorityInstructions: [
      'STRICT host visual references outrank structural reference style',
      'Functional canon outranks visual reference presentation',
      'Visual memory is evidence — not Brand Canon',
    ],
    preserveInstructions: params.strictHostVisualConditioning
      ? ['Preserve SITE 00 visual identity unless Surface Art Direction explicitly permits deviation']
      : [],
    transformInstructions: [
      'Evolve /projects into Workbench hierarchy while preserving SITE 00 host visual language',
    ],
    ignoreInstructions: ['Do not copy legacy card grid presentation from functional reference'],
    antiDirectionInstructions: antiDirection,
    clientHostBoundary: 'HOST references define SITE 00 shell; CLIENT references must not redefine host typography or shell',
    functionalConstraints: [
      'Preserve Active Workbench, Dossier sophistication, Review/Judgment zone, Work History, asymmetric hierarchy',
    ],
    strictHostVisualConditioning: params.strictHostVisualConditioning ?? true,
    generationMode: 'TEXT_TO_IMAGE',
    fingerprint: '',
    compiledAt: new Date().toISOString(),
  };

  package_.generationMode = resolveVisualGenerationMode({ referencePackage: package_ });
  package_.fingerprint = computeReferencePackageFingerprint(package_);
  return package_;
}

export function computeReferencePackageFingerprint(package_: VisualReferencePackage): string {
  const payload = {
    intent: package_.generationIntent,
    device: package_.targetDevice,
    refs: package_.references.map((r) => `${r.referenceId}:${r.role}`).sort(),
    strict: package_.strictHostVisualConditioning,
  };
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function referencePackageFingerprintIsDeterministic(
  a: VisualReferencePackage,
  b: VisualReferencePackage,
): boolean {
  return a.fingerprint === b.fingerprint;
}
