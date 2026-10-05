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
import {
  JURNL_F05_CONTRACT,
  JURNL_F06_CONTRACT,
  JURNL_F07_CONTRACT,
  JURNL_F08_CONTRACT,
  JURNL_F09_CONTRACT,
  JURNL_F10_CONTRACT,
  JURNL_F11_CONTRACT,
  JURNL_F12_CONTRACT,
  JURNL_F13_CONTRACT,
  JURNL_F14_CONTRACT,
  JURNL_F15_CONTRACT,
  JURNL_F16_CONTRACT,
  JURNL_F05_COVERAGE,
  JURNL_F06_COVERAGE,
  JURNL_F07_COVERAGE,
  JURNL_F08_COVERAGE,
  JURNL_F09_COVERAGE,
  JURNL_F10_COVERAGE,
  JURNL_F11_COVERAGE,
  JURNL_F12_COVERAGE,
  JURNL_F13_COVERAGE,
  JURNL_F14_COVERAGE,
  JURNL_F15_COVERAGE,
  JURNL_F16_COVERAGE,
} from './jurnl/data/f05f16/parentContracts';

const JURNL_PARENT_SHELL = { componentRuntime: {} as Record<string, { component: string; variant?: string; primitive: string }>, overlays: {} as Record<string, readonly string[]>, claims: [] as const };

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
    { contract: JURNL_F05_CONTRACT, coverage: JURNL_F05_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F06_CONTRACT, coverage: JURNL_F06_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F07_CONTRACT, coverage: JURNL_F07_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F08_CONTRACT, coverage: JURNL_F08_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F09_CONTRACT, coverage: JURNL_F09_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F10_CONTRACT, coverage: JURNL_F10_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F11_CONTRACT, coverage: JURNL_F11_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F12_CONTRACT, coverage: JURNL_F12_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F13_CONTRACT, coverage: JURNL_F13_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F14_CONTRACT, coverage: JURNL_F14_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F15_CONTRACT, coverage: JURNL_F15_COVERAGE, ...JURNL_PARENT_SHELL },
    { contract: JURNL_F16_CONTRACT, coverage: JURNL_F16_COVERAGE, ...JURNL_PARENT_SHELL },
  ],
};

export function projectFamilies(slug: string): ProjectFamilyEntry[] {
  return FAMILIES[slug.toLowerCase()] ?? [];
}
