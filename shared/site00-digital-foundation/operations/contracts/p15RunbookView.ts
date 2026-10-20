import type { FoundationBuildCredit } from '../../types.js';
import type {
  DigitalFoundationExecutionTask,
  DigitalFoundationRunbook,
  DigitalFoundationVerificationResult,
  DigitalFoundationVerificationRule,
  ProjectForecast,
} from '../types.js';

/** Read-only runbook read model for founder boards 14, 15, 15A, 15B and 15C. */
export type FounderRunbookView = {
  artifact_id: string;
  runbook: DigitalFoundationRunbook | null;
  tasks: DigitalFoundationExecutionTask[];
  verification_rules: DigitalFoundationVerificationRule[];
  verification_results: DigitalFoundationVerificationResult[];
  forecast: ProjectForecast | null;
  credit: FoundationBuildCredit | null;
};
