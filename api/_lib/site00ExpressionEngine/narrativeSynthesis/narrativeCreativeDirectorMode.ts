/**
 * C1.0 — Creative Director Mode output (senior creative summary).
 */

import type {
  NarrativeBeat,
  NarrativeSynthesisInput,
  RoleIntelligence,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';

export function buildCreativeDirectorModeOutput(
  input: NarrativeSynthesisInput,
  ctx: {
    centralQuestion: string;
    roles: RoleIntelligence;
    beats: NarrativeBeat[];
    interjectionLine: string;
    originality: { obviousVersionSummary: string; whyNotTheObviousVersion: string };
    risk: { tooSafe: boolean; notes: string[] };
  },
): string[] {
  const turn = ctx.beats.find((b) => b.beatType === 'TURN');
  const aftershock = ctx.beats.find((b) => b.beatType === 'AFTERSHOCK');

  return [
    `1. CULTURAL READ — ${input.subject}: ${input.thesis}`,
    `2. DEEPER TENSION — ${input.lockedPremise ?? 'Cultural relabeling vs object stability'}`,
    `3. STRONGEST CREATIVE TERRITORY — ${input.selectedTerritoryId ?? input.creativeTerritories[0]?.label ?? 'TBD'}`,
    `4. WHY IT WINS — Story potential via archival contradiction reveal`,
    `5. NARRATIVE SPINE — ${ctx.beats.map((b) => b.beatType).join(' → ')}`,
    `6. HUMAN STORY LOGIC — Investigation earns interjection; subject is proof not protagonist`,
    `7. WORLD — ${input.worldCandidates[0]?.label ?? 'TBD'} (${ctx.roles.worldFunction})`,
    `8. ARTIFACT — ${input.artifactCandidates[0]?.label ?? 'TBD'} (${ctx.roles.artifactRole})`,
    `9. NDX ROLE — ${ctx.roles.ndxRole}`,
    `10. SUBJECT ROLE — ${ctx.roles.subjectRole}`,
    `11. TURNING POINT — ${turn?.whatHappens ?? 'TBD'}`,
    `12. INTERJECTION — ${ctx.interjectionLine}`,
    `13. PAYOFF — Memory edit, not object change`,
    `14. AFTERSHOCK — ${aftershock?.whatHappens ?? 'Continuation hook'}`,
    `15. VISUAL AUTHORITY REQUIREMENTS — NDX hands, subject dual-era, fashion continuity, phone/glitch`,
    `16. PRODUCTION RISKS — ${ctx.risk.tooSafe ? 'Too safe — push interjection sharpness' : 'Standard fidelity risks'}`,
    `17. WHY NOT OBVIOUS — ${ctx.originality.whyNotTheObviousVersion}`,
  ];
}
