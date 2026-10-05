/** Family production contracts per ingested project (host inspection: Design workspace modes + gates). */

import type { FamilyProductionContract } from '../../shared/site00-product-families/familyProductionContract.js';
import type { RuntimeCoverage } from '../../shared/site00-product-families/familyGate.js';
import { F01_CLAIMS, type F01Claim } from './jurnl/data/f01/copy';
import { JURNL_F01_CONTRACT } from './jurnl/data/f01/contract';
import { JURNL_F01_COVERAGE } from './jurnl/data/f01/coverage';
import { F01_OVERLAYS, JURNL_COMPONENT_RUNTIME } from './jurnl/data/f01/interactionBindings';
import { JURNL_F02_CONTRACT } from './jurnl/data/f02/contract';
import { JURNL_F02_COVERAGE } from './jurnl/data/f02/coverage';
import { F02_COMPONENT_RUNTIME, F02_OVERLAYS } from './jurnl/data/f02/interactionBindings';
import { JURNL_F03_CONTRACT } from './jurnl/data/f03/contract';
import { JURNL_F03_COVERAGE } from './jurnl/data/f03/coverage';
import { F03_COMPONENT_RUNTIME, F03_OVERLAYS } from './jurnl/data/f03/interactionBindings';
import { JURNL_F04_CONTRACT } from './jurnl/data/f04/contract';
import { JURNL_F04_COVERAGE } from './jurnl/data/f04/coverage';
import { F04_COMPONENT_RUNTIME, F04_OVERLAYS } from './jurnl/data/f04/interactionBindings';

export type ProjectClaim = Pick<F01Claim, 'id' | 'text' | 'source' | 'status' | 'category' | 'reason'>;

export type ProjectFamilyEntry = {
  contract: FamilyProductionContract;
  coverage: RuntimeCoverage;
  /** Manifest component ref → runtime component name. */
  componentRuntime: Record<string, { component: string; variant?: string; primitive: string }>;
  /** Overlays the runtime can open directly (`?overlay=`), by screen id. */
  overlays: Record<string, readonly string[]>;
  claims: readonly ProjectClaim[];
};

const FAMILIES: Record<string, ProjectFamilyEntry[]> = {
  jurnl: [
    {
      contract: JURNL_F01_CONTRACT,
      coverage: JURNL_F01_COVERAGE,
      componentRuntime: JURNL_COMPONENT_RUNTIME,
      overlays: F01_OVERLAYS,
      claims: F01_CLAIMS,
    },
    {
      contract: JURNL_F02_CONTRACT,
      coverage: JURNL_F02_COVERAGE,
      componentRuntime: F02_COMPONENT_RUNTIME,
      overlays: F02_OVERLAYS,
      claims: [],
    },
    {
      contract: JURNL_F03_CONTRACT,
      coverage: JURNL_F03_COVERAGE,
      componentRuntime: F03_COMPONENT_RUNTIME,
      overlays: F03_OVERLAYS,
      claims: [],
    },
    {
      contract: JURNL_F04_CONTRACT,
      coverage: JURNL_F04_COVERAGE,
      componentRuntime: F04_COMPONENT_RUNTIME,
      overlays: F04_OVERLAYS,
      claims: [],
    },
  ],
};

export function projectFamilies(slug: string): ProjectFamilyEntry[] {
  return FAMILIES[slug.toLowerCase()] ?? [];
}
