import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { MobileTwinCompositionState, MobileTwinPackage } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { MobileStructuredArtifactBundle } from '../p0vrTwinV30/mobileTwinPipeline/buildMobileTwinStructuredArtifacts.js';
import type { ImplementationAuthorityBundle } from '../p0vrTwinV30R8M1/resolveImplementationAuthorities.js';
import { CRITICAL_IMPLEMENTATION_REGIONS } from '../p0vrTwinV30R8M2/constants.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import { NDXBOOK_IMPLEMENTATION_SPATIAL_RHYTHM } from '../p0vrTwinV30R8M2/implementationSpatialRhythmContract.js';
import {
  materialStylesForControl,
  materialStylesForSurface,
  resolveControlVisualRole,
} from '../p0vrTwinV30R8M2/implementationMaterialStyleResolver.js';
import {
  resolveAuthorityTextRole,
  typographyStylesForAuthorityRole,
} from '../p0vrTwinV30R8M2/implementationTypographyResolverR8M2.js';
import { IMPLEMENTATION_EXPRESSION_VERSION } from './constants.js';
import type {
  ActualVisualAnalysis,
  BlueprintVisualAnalysis,
  ImplementationExpressionIR,
  ImplementationExpressionObject,
} from './implementationExpressionTypes.js';
import { mergeVisualAuthorityEvidence } from './visualAuthorityEvidenceMerge.js';
import { inventoryExpressionCompileFallbacks } from './genericFallbackInventory.js';
import { evaluateImplementationExpressionReadiness } from './implementationExpressionReadiness.js';
import { buildExpressionIrCacheKey, getCachedImplementationExpressionIR, setCachedImplementationExpressionIR } from './expressionIrCache.js';

function parsePx(styles: Record<string, string>, key: string, fallback: number): number {
  const raw = styles[key];
  if (!raw) return fallback;
  const n = parseFloat(raw.replace('px', ''));
  return Number.isFinite(n) ? n : fallback;
}

function buildGlobalExpression(): ImplementationExpressionIR['globalExpression'] {
  return {
    atmosphere: 'dark editorial workspace — archival cultural intelligence',
    dominantSurfaces: 'black / near-black stacked panels',
    contrastPattern: 'off-white and white copy on black; lime reserved for primary emphasis only',
    accentPolicy: 'lime (#c8ff00) only for PRIMARY controls and selected locks — not all authority actions',
    densityProfile: 'compact dense information layout',
    hierarchyStyle: 'sharp typographic hierarchy; restrained radii',
    radiusPolicy: '2–4px structural; pills only for true nav chips',
    borderPolicy: 'thin 1px structural borders (#222–#444)',
  };
}

function regionIdForObjectKey(key: string): string {
  if (key.startsWith('host-')) return 'HOST_HEADER';
  if (key.startsWith('context-')) return 'PROJECT_CONTEXT';
  if (key === 'context-stage-badge' || key.includes('viewport')) return 'TARGET_VIEWPORT_STAGE';
  if (key.includes('gallery')) return 'CANDIDATE_GALLERY';
  if (key.includes('readiness')) return 'READINESS';
  if (key.includes('history') || key.includes('amendment') || key.includes('concept')) return 'CONCEPT_DATA';
  if (key.startsWith('mobile-nav-')) return 'BOTTOM_NAV';
  if (['grounding-card', 'blueprint-card', 'overlay-card', 'assets-card', 'function-card'].includes(key)) {
    return 'STRUCTURED_OUTPUT';
  }
  if (key.includes('authority') || key.includes('select-') || key.includes('promote-') || key.includes('lock-pair')) {
    return 'AUTHORITY_PANEL';
  }
  if (key.includes('dominant-')) return 'HERO_WORKSPACE';
  return 'HERO_WORKSPACE';
}

export function buildImplementationExpressionIR(input: {
  projectId: string;
  workspaceType: string;
  pkg: MobileTwinPackage;
  composition: MobileTwinCompositionState;
  bundle: MobileStructuredArtifactBundle;
  authorities: ImplementationAuthorityBundle;
  actualAnalysis: ActualVisualAnalysis;
  blueprintAnalysis: BlueprintVisualAnalysis;
  actualContentHash: string;
  blueprintContentHash: string;
}): ImplementationExpressionIR {
  const cacheKey = buildExpressionIrCacheKey({
    packageChecksum: input.pkg.packageChecksum,
    actualRenderHash: input.actualContentHash,
    blueprintRenderHash: input.blueprintContentHash,
  });
  const cached = getCachedImplementationExpressionIR(cacheKey);
  if (cached) return cached;

  const spatial = NDXBOOK_IMPLEMENTATION_SPATIAL_RHYTHM;
  const objectExpressions: ImplementationExpressionObject[] = [];
  const authorityConflicts = [];
  const visualImportanceByObject = new Map<string, string>();

  for (const obj of input.composition.objectDefinitions) {
    visualImportanceByObject.set(obj.objectId, obj.visualImportance);
    const key = resolveTemplateKeyFromObjectId(obj.objectId);
    const regionId = regionIdForObjectKey(key);
    const evidence = mergeVisualAuthorityEvidence({
      objectId: obj.objectId,
      actual: input.actualAnalysis,
      blueprint: input.blueprintAnalysis,
    });
    authorityConflicts.push(...evidence.conflicts);

    const typoRole = resolveAuthorityTextRole(key, obj.objectType);
    const typoStyles = typographyStylesForAuthorityRole(typoRole);
    const surfaceStyles = materialStylesForSurface(key, obj.objectType, obj.ownership);
    const controlRole = resolveControlVisualRole(key, obj.objectType);
    const controlStyles =
      obj.objectType === 'BUTTON' || obj.objectType === 'CONTROL' || obj.objectType === 'NAV_ITEM' ?
        materialStylesForControl(controlRole, obj.ownership)
      : {};

    const typographySource =
      typoRole === 'SECTION_LABEL' && !key.includes('label') ?
        ('PROJECT_CONTRACT_DERIVED' as const)
      : ('AUTHORITY_DERIVED' as const);

    objectExpressions.push({
      objectId: obj.objectId,
      parentObjectId: obj.parentObjectId,
      regionId,
      semanticRole: obj.semanticRole,
      visualRole: input.actualAnalysis.perObject[obj.objectId]?.visualRole ?? obj.semanticRole,
      ownership: obj.ownership,
      featureId: obj.featureId,
      functionId: obj.functionTarget,
      geometry: {
        xRatio: obj.normalizedX,
        yRatio: obj.normalizedY,
        widthRatio: obj.normalizedWidth,
        heightRatio: obj.normalizedHeight,
        alignment: 'LEFT_TOP',
        anchor: 'TOP_LEFT',
      },
      typography: {
        familyRole: typoRole,
        sizePx: parsePx(typoStyles, 'fontSize', 11),
        weight: parsePx(typoStyles, 'fontWeight', 600),
        lineHeight: parsePx(typoStyles, 'lineHeight', 1.2),
        tracking: typoStyles.letterSpacing ?? 'normal',
        casing: typoStyles.textTransform ?? 'none',
        alignment: 'left',
        maxLines: key.includes('headline') ? 2 : 1,
      },
      surface: {
        background: surfaceStyles.background ?? '#111',
        border: surfaceStyles.border ?? '1px solid #333',
        borderWidthPx: 1,
        borderRadiusPx: parsePx(surfaceStyles, 'borderRadius', 4),
        shadow: surfaceStyles.boxShadow ?? 'none',
        contrastRole: obj.ownership === 'SITE_00_HOST' ? 'HOST_MUTED' : 'PROJECT_ELEVATED',
      },
      spacing: {
        paddingPx: spatial.innerPaddingPx,
        gapPx: spatial.cardGapPx,
        marginBottomPx: spatial.sectionGapPx,
      },
      controlTreatment:
        Object.keys(controlStyles).length ?
          {
            role: controlRole,
            selectedTreatment: controlRole === 'SELECTED' ? 'lime inset ring' : 'default',
            activeTreatment: controlRole === 'PRIMARY' ? 'lime fill' : 'neutral fill',
            disabledTreatment: 'muted dashed',
          }
        : undefined,
      assetTreatment:
        obj.objectType === 'IMAGE' || obj.objectType === 'THUMBNAIL' ?
          {
            objectId: obj.objectId,
            assetSlotId: obj.assetRef,
            canonicalAssetId: obj.assetRef,
            aspectRatio: obj.normalizedWidth / Math.max(0.01, obj.normalizedHeight),
            objectFit: 'cover',
            cropMode: 'EDITORIAL_CENTER',
            focalPoint: { x: 0.5, y: 0.45 },
            borderTreatment: '1px #444',
            prominence: obj.visualImportance === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
            source: 'AUTHORITY_DERIVED',
          }
        : undefined,
      relationships: {
        sectionId: regionId,
        nestedWithin: obj.parentObjectId,
      },
      authorityEvidence: {
        actualRegion: evidence.actualRegion,
        blueprintRegion: evidence.blueprintRegion,
        evidenceConfidence: evidence.evidenceConfidence,
      },
      styleSources: {
        typography: typographySource,
        spatial: 'AUTHORITY_DERIVED',
        material: 'AUTHORITY_DERIVED',
      },
    });
  }

  const regionExpressions = {} as ImplementationExpressionIR['regionExpressions'];
  for (const id of CRITICAL_IMPLEMENTATION_REGIONS) {
    regionExpressions[id] = {
      mapped: objectExpressions.some((o) => o.regionId === id),
      dominance: id.includes('HERO') || id.includes('AUTHORITY') ? 'PRIMARY' : 'SECONDARY',
    };
  }

  const typographySystem = {
    roles: [
      'HOST_BRAND',
      'HOST_NAV',
      'PROJECT_CONTEXT',
      'SECTION_LABEL',
      'DISPLAY_HEADLINE',
      'SUPPORT_COPY',
      'CARD_TITLE',
      'CARD_METADATA',
      'CONTROL_LABEL',
      'STATUS',
      'TECHNICAL_METADATA',
    ].map((role) => ({
      role,
      fontFamilyRole: role.includes('TECH') || role === 'STATUS' ? 'MONO' : 'SANS',
      sizePx: role === 'DISPLAY_HEADLINE' ? 20 : role === 'HOST_NAV' ? 9 : 10,
      weight: role === 'DISPLAY_HEADLINE' ? 900 : 700,
      lineHeight: role === 'DISPLAY_HEADLINE' ? 1.05 : 1.3,
      tracking: '0.08em',
      casing: role.includes('HEADLINE') || role.includes('LABEL') || role.includes('NAV') ? 'uppercase' : 'normal',
      alignment: 'left',
      color: '#f0f0f0',
      source: 'AUTHORITY_DERIVED' as const,
    })),
  };

  const partialIr: Omit<ImplementationExpressionIR, 'readiness' | 'hash'> = {
    id: `impl-expr-${input.pkg.id}-${IMPLEMENTATION_EXPRESSION_VERSION}`,
    projectId: input.projectId,
    workspaceType: input.workspaceType,
    viewport: 'MOBILE' as const,
    packageId: input.pkg.id,
    packageChecksum: input.pkg.packageChecksum,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    actualAuthorityId: input.authorities.actualRenderId,
    blueprintAuthorityId: input.authorities.blueprintRenderId,
    projectContextVersion: input.authorities.projectContextVersion,
    expressionVersion: IMPLEMENTATION_EXPRESSION_VERSION,
    globalExpression: buildGlobalExpression(),
    regionExpressions,
    objectExpressions,
    typographySystem,
    spatialRhythmSystem: {
      outerMarginPx: 8,
      sectionGapPx: spatial.sectionGapPx,
      innerPanelPaddingPx: spatial.innerPaddingPx,
      cardGapPx: spatial.cardGapPx,
      rowGapPx: spatial.cardGapPx,
      controlGapPx: spatial.controlGapPx,
      textBlockSpacingPx: 4,
      denseRegionBehavior: 'tight metadata stacks',
      source: 'AUTHORITY_DERIVED' as const,
    },
    materialSystem: {
      surfaces: [
        {
          classId: 'HOST_SHELL',
          fill: '#0a0a0a',
          border: '1px solid #222',
          edgeTreatment: 'sharp',
          radiusPx: 2,
          hierarchy: 1,
          selectedState: 'none',
          nestedBehavior: 'flat',
          source: 'PROJECT_CONTRACT_DERIVED' as const,
        },
        {
          classId: 'PROJECT_PANEL',
          fill: '#111111',
          border: '1px solid #333',
          edgeTreatment: 'thin structural',
          radiusPx: 4,
          hierarchy: 2,
          selectedState: 'lime ring',
          nestedBehavior: 'inset cards',
          source: 'AUTHORITY_DERIVED' as const,
        },
      ],
    },
    controlHierarchy: {
      entries: objectExpressions
        .filter((o) => o.controlTreatment)
        .map((o) => ({
          objectId: o.objectId,
          role: o.controlTreatment!.role as ImplementationExpressionIR['controlHierarchy']['entries'][number]['role'],
          fill: materialStylesForControl(o.controlTreatment!.role as 'PRIMARY', o.ownership).background ?? '#161616',
          border: materialStylesForControl(o.controlTreatment!.role as 'PRIMARY', o.ownership).border ?? '1px solid #333',
          radiusPx: 4,
          labelTreatment: o.typography.casing,
          source: 'AUTHORITY_DERIVED' as const,
        })),
    },
    assetTreatments: {
      entries: objectExpressions.filter((o) => o.assetTreatment).map((o) => o.assetTreatment!),
    },
    stateTreatments: { selectedBorder: '2px solid #c8ff00', lockedBorder: '1px dashed #666' },
    relationships: objectExpressions.map((o) => `${o.objectId}@${o.regionId}`),
    evidence: {
      actualAnalysisId: input.actualAnalysis.id,
      blueprintAnalysisId: input.blueprintAnalysis.id,
      mergeId: `merge-${input.pkg.packageChecksum.slice(0, 8)}`,
    },
    unresolvedItems: authorityConflicts.filter((c) => c.resolution === 'UNRESOLVED').map((c) => c.objectId),
    authorityConflicts,
    cacheKey,
  };

  const fallbackAudit = inventoryExpressionCompileFallbacks({
    objectExpressions: objectExpressions.map((o) => ({ objectId: o.objectId, styleSources: o.styleSources })),
    visualImportanceByObject,
  });

  const readiness = evaluateImplementationExpressionReadiness({ ir: partialIr, fallbackAudit });
  const hash = fnv1aHex(JSON.stringify({ ...partialIr, readiness }));

  const ir: ImplementationExpressionIR = { ...partialIr, readiness, hash };
  setCachedImplementationExpressionIR(ir);
  return ir;
}
