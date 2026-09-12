/**
 * P0.VR.DIAG.1R4 — DOM target recovery without brittle nth-child selectors.
 */

import type { PageRegionLayoutDefinition } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { DomRegionMeasurement, RegionComponentTarget } from '../p0vrDiag1/types.js';
import type { DomTargetCandidate, DomTargetRecovery, RegionTargetConfidence } from './types.js';

function isNthChildSelector(selector: string): boolean {
  return /:nth-child\s*\(/i.test(selector);
}

function buildCandidate(
  selector: string,
  componentId: string | null,
  signals: string[],
  confidence: RegionTargetConfidence,
): DomTargetCandidate {
  return {
    selector,
    componentId,
    confidence,
    signals,
    usesNthChild: isNthChildSelector(selector),
  };
}

export function recoverDomTarget(input: {
  def: PageRegionLayoutDefinition;
  dom?: DomRegionMeasurement | null;
  componentTarget?: RegionComponentTarget | null;
  domByComponentId?: Map<string, DomRegionMeasurement>;
}): DomTargetRecovery {
  const candidates: DomTargetCandidate[] = [];
  const signals: string[] = [];

  if (input.dom && input.dom.actualHeight >= 4) {
    signals.push('DOM_REGION_ID_MATCH');
    if (input.dom.componentId) signals.push('COMPONENT_METADATA');
    candidates.push(
      buildCandidate(
        input.def.selectorHint ?? `[data-vr-region="${input.def.regionId}"]`,
        input.dom.componentId ?? input.def.componentId ?? null,
        ['regionId', 'boundingRect'],
        'HIGH',
      ),
    );
  }

  if (input.def.selectorHint && !isNthChildSelector(input.def.selectorHint)) {
    candidates.push(
      buildCandidate(input.def.selectorHint, input.def.componentId ?? null, ['selectorHint', 'layoutProfile'], 'MEDIUM'),
    );
    signals.push('SELECTOR_HINT');
  }

  if (input.def.componentId) {
    const byComponent = input.domByComponentId?.get(input.def.componentId);
    if (byComponent) {
      candidates.push(
        buildCandidate(
          input.def.selectorHint ?? `[data-component-id="${input.def.componentId}"]`,
          input.def.componentId,
          ['componentId', 'domMap'],
          'HIGH',
        ),
      );
      signals.push('COMPONENT_ID_MAP');
    } else {
      candidates.push(
        buildCandidate(
          `[data-component-id="${input.def.componentId}"]`,
          input.def.componentId,
          ['componentId', 'metadataOnly'],
          'MEDIUM',
        ),
      );
    }
  }

  if (input.componentTarget?.selector && !isNthChildSelector(input.componentTarget.selector)) {
    candidates.push(
      buildCandidate(
        input.componentTarget.selector,
        input.componentTarget.componentId,
        ['existingComponentTarget'],
        mapComponentTargetConfidence(input.componentTarget.confidence),
      ),
    );
  }

  const nonNth = candidates.filter((c) => !c.usesNthChild);
  const pool = nonNth.length ? nonNth : candidates;

  let chosen: DomTargetCandidate | null = null;
  let status: DomTargetRecovery['status'] = 'UNRESOLVED';
  let matchConfidence: RegionTargetConfidence = 'UNRESOLVED';

  if (pool.length === 1) {
    chosen = pool[0]!;
    status = 'RESOLVED';
    matchConfidence = chosen.confidence;
  } else if (pool.length > 1) {
    chosen = pool.find((c) => c.confidence === 'HIGH') ?? pool[0]!;
    status = pool.filter((c) => c.confidence === 'HIGH').length > 1 ? 'AMBIGUOUS' : 'RESOLVED';
    matchConfidence = status === 'AMBIGUOUS' ? 'LOW' : chosen.confidence;
  } else if (input.dom) {
    chosen = buildCandidate(`[data-vr-region="${input.def.regionId}"]`, null, ['fallbackRegionId'], 'LOW');
    status = 'RESOLVED';
    matchConfidence = 'LOW';
  }

  return {
    regionId: input.def.regionId,
    candidateTargets: candidates,
    chosenTarget: chosen,
    matchConfidence,
    matchSignals: signals,
    status,
  };
}

function mapComponentTargetConfidence(confidence: RegionComponentTarget['confidence']): RegionTargetConfidence {
  if (confidence === 'HIGH') return 'HIGH';
  if (confidence === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}
