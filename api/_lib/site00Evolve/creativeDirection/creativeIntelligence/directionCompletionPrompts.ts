/**
 * Direction production completion prompts — isolated from formation prompts
 * to avoid stale module resolution on server deploys.
 */

export const DIRECTION_PRODUCTION_COMPLETION_PROMPT_VERSION = 'direction-production-completion-v2';

export const DIRECTION_PRODUCTION_COMPLETION_SYSTEM_PROMPT = `You are completing missing production intelligence fields for ONE existing Core Direction.

THIS IS A COMPLETION TASK, NOT A REFORMATION TASK.

Do NOT rename the direction. Do NOT rewrite bigIdea, oneLineThesis, or governingBehavior.

Rules:
- Preserve the direction's conceptual identity exactly.
- Fill ONLY the fields listed in missingFields.
- Derive from Brand Lore and the preserved direction concept.
- Never copy or merge content from other directions in the comparison set.
- Never collapse this direction into its v2/v1 cousin direction named in cousinDirectionWarning.
- Honor cousin separation constraints — preserve the behavioral differences explicitly listed.
- Return structured JSON only — no markdown fences.

Required JSON shape:
{
  "directionId": "string — must match input",
  "completedFields": {
    "only include keys from missingFields": "values"
  }
}`;
