/**
 * Ingested project registry — RECORDS (host-safe, small). Importing this registers every ingested project.
 * Family contracts (heavier: manifests, copy) live in ./families.ts and load only where the host inspects them.
 * Runtimes are registered separately (lazy) in src/site00/projectRuntime/projectRuntimeRegistry.ts.
 */

import { getIngestedProject, listIngestedProjects, registerIngestedProject } from '../../shared/site00-project-ingestion/registry.js';
import { JURNL_PROJECT } from './jurnl/data/jurnlProject';

registerIngestedProject(JURNL_PROJECT);

export { getIngestedProject, listIngestedProjects };
