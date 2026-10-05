import type { FounderJudgment, FounderJudgmentAction } from '../creativeDirectorTypes.js';

export type StructuredRevisionContext = {
  founder_note: string;
  preserve: string[];
  reject: string[];
  combine_with: string | null;
  requested_change: string;
  source_message: string;
};

const REJECT_PATTERNS = [/too operational/i, /wrong direction/i, /do not repeat/i, /not for me/i, /too close/i];
const PRESERVE_PATTERNS = [/keep/i, /preserve/i, /maintain/i, /retain/i];
const PERSONAL_PATTERNS = [/more personal/i, /owned by the client/i, /client-owned/i];

/** Translate natural founder language into structured revision context for the next model run. */
export function translateFounderMessageToRevision(message: string): StructuredRevisionContext {
  const text = message.trim();
  const preserve: string[] = [];
  const reject: string[] = [];
  let requested_change = text;

  for (const p of PRESERVE_PATTERNS) {
    if (p.test(text)) preserve.push('Founder asked to preserve existing strengths while revising.');
  }
  for (const p of REJECT_PATTERNS) {
    if (p.test(text)) reject.push(text);
  }
  for (const p of PERSONAL_PATTERNS) {
    if (p.test(text)) requested_change = `${text} — emphasize client ownership and private threshold experience.`;
  }

  const territoryMatch = text.match(/territory\s*(\d|[A-C])/i);
  if (territoryMatch) {
    preserve.push(`Focus revision on territory ${territoryMatch[1].toUpperCase()} selection context.`);
  }

  return {
    founder_note: text,
    preserve,
    reject,
    combine_with: null,
    requested_change,
    source_message: text,
  };
}

export function judgmentToRevision(j: FounderJudgment): StructuredRevisionContext {
  return {
    founder_note: j.founder_note,
    preserve: j.preserve,
    reject: j.reject,
    combine_with: j.combine_with,
    requested_change: j.requested_change,
    source_message: j.founder_note,
  };
}

export function actionImpliesRegeneration(action: FounderJudgmentAction): boolean {
  return action === 'REGENERATE' || action === 'WRONG_DIRECTION' || action === 'NEEDS_ANOTHER_STATE';
}
