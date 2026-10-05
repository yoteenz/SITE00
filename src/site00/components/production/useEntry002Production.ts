/**
 * Entry 002 production package facts for the Expression sub-workspaces.
 * Reads canonical compiled data (Narrative plan + cast state); nothing here writes or dispatches.
 */

import { useMemo } from 'react';
import { compileEntry002RetroactiveNarrativeMomentum } from '../../../../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import {
  buildEntry002ProductionCastState,
  evaluateCastGate,
  findActorById,
  storyboardBlockedUntilCastLocked,
} from '../../../../shared/site00-studio-world/acting-catalogue/index.js';
import type { ProductionCharacter } from '../../../../shared/site00-studio-world/acting-catalogue/index.js';

export type PackageItemStatus = 'APPROVED' | 'LOCKED' | 'IN_PROGRESS' | 'BLOCKED' | 'NOT_STARTED';

export type PackageItem = {
  id: 'narrative' | 'cast' | 'wardrobe' | 'performance' | 'sets' | 'storyboard';
  label: string;
  status: PackageItemStatus;
  detail: string;
};

export function isEntry002Project(slug: string): boolean {
  return slug.toLowerCase() === 'ndxbook';
}

export function useEntry002Production() {
  return useMemo(() => {
    const plan = compileEntry002RetroactiveNarrativeMomentum();
    const cast = buildEntry002ProductionCastState();
    const gate = evaluateCastGate(cast);
    const nonEnsemble = cast.characters.filter((c) => c.screenImportance !== 'ENSEMBLE');
    const looksLocked = nonEnsemble.every((c) => c.campaignLookId && c.status === 'LOCKED');
    const performanceDefined = nonEnsemble.every((c) => c.performanceDirection.trim().length > 0);

    const items: PackageItem[] = [
      {
        id: 'narrative',
        label: 'Narrative',
        status: plan.founderStatus === 'APPROVED' ? 'APPROVED' : 'IN_PROGRESS',
        detail: plan.founderStatus.replace(/_/g, ' '),
      },
      {
        id: 'cast',
        label: 'Cast',
        status: gate.allRequiredCharactersLocked ? 'APPROVED' : 'IN_PROGRESS',
        detail: gate.allRequiredCharactersLocked ? 'ALL REQUIRED ROLES LOCKED' : 'ROLES PENDING',
      },
      {
        id: 'wardrobe',
        label: 'Wardrobe',
        status: looksLocked ? 'LOCKED' : 'IN_PROGRESS',
        detail: `${cast.looks.length} LOOKS`,
      },
      {
        id: 'performance',
        label: 'Performance',
        status: performanceDefined ? 'LOCKED' : 'IN_PROGRESS',
        detail: performanceDefined ? 'DIRECTION SET' : 'DIRECTION MISSING',
      },
      {
        id: 'sets',
        label: 'Set / Scene',
        status: 'NOT_STARTED',
        detail: 'NO SET DEFINED YET',
      },
      {
        id: 'storyboard',
        label: 'Storyboard',
        status: storyboardBlockedUntilCastLocked(gate) ? 'BLOCKED' : 'IN_PROGRESS',
        detail: storyboardBlockedUntilCastLocked(gate) ? 'CAST GATE OPEN' : 'IN PRODUCTION',
      },
    ];
    const ready = items.filter((i) => i.status === 'APPROVED' || i.status === 'LOCKED').length;
    return { plan, cast, gate, items, ready, total: items.length };
  }, []);
}

export function actorFor(character: ProductionCharacter) {
  return character.actorId ? findActorById(character.actorId) : null;
}
