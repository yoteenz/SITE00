/**
 * P0.CJ.2V — Display helpers (truncate / summarize for visual layer only).
 */

export function summarizeLine(text: string, maxLen = 88): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trim()}…`;
}

export function formatEngineRead(decision: string, score: number): string {
  return `${decision.replace(/_/g, ' ')} · ${score}`;
}

export function judgmentStateClass(
  founderJudgment: string | null,
  status: string,
): string {
  if (founderJudgment === 'LOVE_IT' || founderJudgment === 'APPROVED_FOR_NEXT_STAGE') return 'is-love';
  if (founderJudgment === 'PROMISING' || founderJudgment === 'HOLD') return 'is-promising';
  if (founderJudgment === 'REVISE') return 'is-revise';
  if (founderJudgment === 'TOO_CLOSE' || founderJudgment === 'NOT_NDXBOOK') return 'is-kill';
  if (status === 'APPROVED_FOR_NEXT_STAGE') return 'is-approved';
  if (status === 'ON_HOLD') return 'is-hold';
  if (status === 'REVISE') return 'is-revise';
  return 'is-unreviewed';
}

export function channelRoleLabel(channelId: string): string {
  const map: Record<string, string> = {
    reel: 'REEL',
    carousel: 'CAROUSEL',
    story: 'STORY',
    email: 'EMAIL',
  };
  const key = channelId.split('-')[0]?.toLowerCase() ?? channelId;
  return map[key] ?? channelId.toUpperCase();
}

export function channelRoleFromHash(hash: string): Array<{ channel: string; role: string }> {
  return hash.split('|').map((part) => {
    const [ch, role] = part.split('-');
    return {
      channel: channelRoleLabel(ch ?? part),
      role: (role ?? 'EXPRESSION').replace(/-/g, ' ').toUpperCase(),
    };
  });
}
