import { getStudioWorldSeason1ResidentDossiers } from './residents.js';
import type { ResidentCastingEligibility } from './types.js';

export function castingEligibilityForResident(sourceResidentId: string): ResidentCastingEligibility {
  const d = getStudioWorldSeason1ResidentDossiers().find((r) => r.sourceResidentId === sourceResidentId);
  return d?.castingEligibility ?? 'UNSET';
}
