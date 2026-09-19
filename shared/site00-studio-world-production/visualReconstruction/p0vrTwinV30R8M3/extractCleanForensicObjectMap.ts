import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import type { ForensicUiObjectMap } from '../p0vrTwinV30R8M2R5/forensicTypes.js';
import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import { resolveTemplateKeyFromObjectId } from '../p0vrTwinV30R8M1/ndxbookImplementationCopyCatalog.js';
import type {
  CleanedForensicObjectMapReceipt,
  ForensicBlueprintObject,
  ForensicBlueprintObjectMap,
  MobileTwinForensicBlueprintArtifact,
} from './forensicIngestionTypes.js';
import { FORENSIC_OBJECT_MAP_EXTRACTION_FAILED } from './constants.js';

const JUNK_ROW_PATTERNS = [/^undefined$/i, /^null$/i, /^object\s*\d+$/i, /^\s*$/];

function inferElementKind(objectType: string, key: string): ForensicBlueprintObject['elementKind'] {
  if (objectType.includes('IMAGE') || key.includes('artifact') || key.includes('thumb')) return 'asset_frame';
  if (objectType.includes('PROGRESS') || key.includes('readiness')) return 'status_indicator';
  if (objectType.includes('BUTTON') || objectType.includes('CONTROL') || objectType.includes('NAV')) return 'control';
  if (key.includes('meta') || key.includes('history') || key.includes('amendment')) return 'metadata';
  return 'content';
}

function isJunkLabel(label: string): boolean {
  return JUNK_ROW_PATTERNS.some((p) => p.test(label.trim()));
}

export function extractCleanForensicObjectMap(input: {
  artifact: MobileTwinForensicBlueprintArtifact;
  rawObjectMap: ForensicUiObjectMap;
  composition: MobileTwinCompositionState;
}): { map: ForensicBlueprintObjectMap; receipt: CleanedForensicObjectMapReceipt } {
  const rejectedForensicRows: string[] = [];
  const unresolvedForensicObjects: string[] = [];
  const seen = new Set<string>();
  const objects: ForensicBlueprintObject[] = [];

  for (const raw of input.rawObjectMap.objects) {
    const key = resolveTemplateKeyFromObjectId(raw.semanticObjectId);
    if (isJunkLabel(key) || isJunkLabel(raw.forensicObjectId)) {
      rejectedForensicRows.push(`junk-row:${raw.forensicObjectId}`);
      continue;
    }
    const dedupeKey = `${raw.semanticObjectId}:${raw.parentSectionId}`;
    if (seen.has(dedupeKey)) {
      rejectedForensicRows.push(`duplicate:${dedupeKey}`);
      continue;
    }
    seen.add(dedupeKey);

    const obj = input.composition.objectDefinitions.find((o) => o.objectId === raw.semanticObjectId);
    if (!obj) {
      unresolvedForensicObjects.push(raw.semanticObjectId);
      continue;
    }

    const tableRowRef = `spec-table-row-${raw.calloutNumber ?? objects.length + 1}`;
    const confidence =
      raw.evidence.includes(input.artifact.id) || raw.evidence.includes('actual') ? 0.92
      : raw.evidence.includes('blueprint') ? 0.78
      : 0.65;

    objects.push({
      forensicObjectId: raw.forensicObjectId,
      semanticObjectId: raw.semanticObjectId,
      parentSectionId: raw.parentSectionId,
      siblingOrder: raw.siblingOrder,
      xRatio: raw.xRatio,
      yRatio: raw.yRatio,
      widthRatio: raw.widthRatio,
      heightRatio: raw.heightRatio,
      objectType: raw.objectType,
      textRole: raw.textRole,
      visualImportance: raw.visualPriority,
      colorRole: raw.textRole?.includes('headline') ? 'text-primary' : 'text-secondary',
      dividerRole: raw.borderNotes?.includes('divider') ? 'section-divider' : null,
      elementKind: inferElementKind(raw.objectType, key),
      sourceEvidence: {
        forensicBlueprintRegionRef: `callout-${raw.calloutNumber ?? objects.length}`,
        blueprintTableRowRef: tableRowRef,
        actualRegionRef: raw.parentSectionId,
        packageObjectRef: raw.semanticObjectId,
      },
      confidence,
      validationStatus: confidence >= 0.85 ? 'VALIDATED' : 'REVIEW_REQUIRED',
    });
  }

  if (objects.length < 10) throw new Error(FORENSIC_OBJECT_MAP_EXTRACTION_FAILED);

  const body = JSON.stringify(objects.map((o) => o.forensicObjectId));
  const map: ForensicBlueprintObjectMap = {
    id: `fbom-clean-${fnv1aHex(body).slice(0, 10)}`,
    hash: fnv1aHex(body),
    objects,
    coordinateFrame: {
      widthPx: input.rawObjectMap.canonicalViewport.widthPx,
      heightPx: input.rawObjectMap.canonicalViewport.heightPx,
      origin: 'top-left',
    },
  };

  return {
    map,
    receipt: {
      id: `cfomr-${map.id}`,
      cleanedObjectCount: objects.length,
      rejectedForensicRows,
      unresolvedForensicObjects,
      extractedAt: new Date().toISOString(),
    },
  };
}
