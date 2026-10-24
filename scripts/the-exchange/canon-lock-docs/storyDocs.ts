import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, secs, table } from './md.js';

const P = X.EXCHANGE_PATHS;

type Ledger = ReturnType<typeof X.buildPromotionLedger>;

const entry = (e: X.LedgerEntry) =>
  [
    `### ${e.entryId} — ${e.subject}`,
    '',
    `**Classification:** \`${e.classification}\``,
    '',
    e.decision,
    '',
    `- **Source:** ${e.source}`,
    `- **Founder approval:** ${e.founderApproval}`,
    `- **Implementation:** ${e.implementation.join('; ')}`,
    `- **Validation:** ${e.validation.join('; ')}`,
    ...(e.notes ? [`- **Notes:** ${e.notes}`] : []),
  ].join('\n');

export function ledgerDoc(l: Ledger): string {
  return [
    '# 02 — Founder canon promotion ledger',
    '',
    generatedNote([P.ledger, P.approvalMatrix]),
    '',
    `Founder authorization: **${X.FOUNDER_APPROVAL.authority}**. Scope: ${X.FOUNDER_APPROVAL.scope.join(', ')}.`,
    '',
    l.rule,
    '',
    '## Classifications used',
    '',
    table(['Classification', 'Meaning'], X.CANON_CLASSIFICATIONS.map((c) => [`\`${c}\``, X.NEW_CLASSIFICATION_DEFINITIONS[c] ?? 'Defined in the existing approval matrix'])),
    '',
    '## Season structure decisions (S-1, S-2, S-3)',
    '',
    ...l.seasonDecisions.map(entry).flatMap((s) => [s, '']),
    '## Recommendations NR-3 and NR-5 to NR-11',
    '',
    'NR-1, NR-2 and NR-4 are the season decisions above (S-1, S-2 and S-3).',
    '',
    ...l.recommendations.map(entry).flatMap((s) => [s, '']),
    '## Character decisions',
    '',
    ...l.characterDecisions.map(entry).flatMap((s) => [s, '']),
    '## Hybrid decision board (FD-01 to FD-20) after this promotion',
    '',
    table(['FD', 'Subject', 'Classification', 'Note'], l.hybridDecisionStatus.map((d) => [d.id, d.subject, `\`${d.classification}\``, d.note])),
    '',
    '## Founder confirmations requested',
    '',
    'These are not silently resolved. Each waits for an explicit founder decision.',
    '',
    table(['ID', 'Item'], l.founderConfirmationsRequested.map((c) => [c.id, c.item])),
    '',
    '## Preserved open questions (U-1 to U-9)',
    '',
    table(['ID', 'Question', 'Status', 'Applies to'], X.OPEN_QUESTIONS.map((q) => [q.id, q.question, `\`${q.status}\``, q.appliesTo])),
    '',
    'Nothing in this sprint invents Emmett Hale\'s identity (U-3), Vivienne\'s private truth (U-1), recurring-patron faces (U-6), unapproved wardrobe (U-4) or invention mechanics (U-5).',
  ].join('\n');
}

export function masterDoc(m: X.SeasonMaster): string {
  const arcRows = m.structure.arcs.map((a) => {
    const rs = m.releases.filter((r) => r.arc.number === a.number);
    return [a.number, a.name, `${a.first}–${a.last}`, rs.length, secs(rs.reduce((s, r) => s + r.runtimeTargetSec, 0)), rs.filter((r) => r.exchangeNight).length];
  });
  const gap = X.longestRunWithout(m, 'N');
  const change = (k: string) => m.releases.filter((r) => r.lineage.changeVsV1 === k).length;
  const detail = (r: X.MasterRelease) =>
    [
      `### ${r.id} — ${r.title}`,
      '',
      table(
        ['Arc', 'Runtime', 'Day', 'Layers', 'Night', 'Complexity', 'Change vs V1', 'Classification'],
        [[`${r.arc.number} ${r.arc.name}`, r.runtimeTarget, r.fictionalDay, r.layers.join(''), r.exchangeNight ? 'Yes' : 'No', r.productionComplexity.rating, r.lineage.changeVsV1, r.classification]],
      ),
      '',
      `- **Featured:** ${r.featuredCharacters}`,
      `- **Setting:** ${r.setting}`,
      `- **Opening hook:** ${r.openingHook.text} _(${r.openingHook.derivation})_`,
      `- **What happens:**\n${r.narrativeDevelopment.split('\n').filter((l) => l.trim()).map((l) => `  ${l.trim().startsWith('- ') ? l.trim() : `- ${l.trim()}`}`).join('\n')}`,
      `- **Character purpose:** ${r.characterPurpose}`,
      `- **Payoff:** ${r.payoff}`,
      `- **Ending transition:** ${r.endingTransition}`,
      `- **Emotional turning point:** ${r.emotionalTurningPoint.text ?? `not stated in the source (${r.emotionalTurningPoint.source})`}`,
      `- **Patron scenarios:** ${r.patronScenarios.join(', ') || 'none'} · **Night dependencies:** ${r.nightDependencies.join(', ') || 'none'}`,
      `- **Depends on:** ${r.dependsOn.join(', ') || 'none'} · **Pays off in:** ${r.paysOffIn.join(', ') || 'none'}`,
      `- **Continuity:** ${r.continuityDependencies || 'none'}`,
      `- **Open questions:** ${r.unresolvedQuestions.join(', ') || 'none'}`,
      ...r.approvedAmendments.map((a) => `- **Amendment ${a.amendmentId} (${a.recommendationId}, \`${a.classification}\`):** ${a.text}`),
      `- **Lineage:** ${r.lineage.changeNote || 'unchanged from BASELINE V1'} (hybrid ${r.lineage.hybridSource || '—'}, lean ${r.lineage.leanId || '—'})`,
      '',
    ].join('\n');
  return [
    '# 03 — Season 1 approved 86-release master',
    '',
    generatedNote([P.master, P.optionACsv]),
    '',
    `**Master:** \`${m.masterId}\` · **Classification:** \`${m.classification}\` · **Releases:** ${m.structure.releaseCount} · **Runtime:** ${m.structure.runtimeTotal} · **Founder approval:** ${m.founderApproval.date}`,
    '',
    'The release structure is `APPROVED_CANON` (S-2 Option A). Each row is `APPROVED_DEVELOPMENT_DIRECTION`: the beats are approved, and their exact wording may still be refined at screenplay stage. Kai\'s Note is not part of this master; it stays `PRODUCTION_TEST_ONLY`.',
    '',
    `- IDs and order are BASELINE V1's (S1-01 to S1-86). No release was added or removed. ${change('UNCHANGED')} rows are unchanged, ${change('REVISED')} revised and ${change('REVISED_S1_DEPENDENT')} revised by S-1 (S1-10, S1-74, S1-80).`,
    `- Exchange Nights: ${m.releases.filter((r) => r.exchangeNight).length} releases carry the N layer. The approved Nights are S1-20 *Nineteen Eighty-Six* and S1-40 *The Breakfast Dance*. The longest run without a Night is ${gap.length} (${gap.from} to ${gap.to}).`,
    `- Fallback: ${m.fallback.path} (${m.fallback.releaseCount} releases), ${m.fallback.status}.`,
    `- History: ${m.history.map((h) => `${h.role} → \`${h.classification}\``).join('; ')}.`,
    '',
    '## Arcs',
    '',
    table(['Arc', 'Name', 'Releases', 'Count', 'Runtime', 'Night releases'], arcRows),
    '',
    '## Index',
    '',
    table(
      ['ID', 'Title', 'Arc', 'Runtime', 'Day', 'Layers', 'Night', 'Patron scenarios', 'Change', 'Complexity'],
      m.releases.map((r) => [r.id, r.title, r.arc.number, r.runtimeTarget, r.fictionalDay, r.layers.join(''), r.exchangeNight ? 'N' : '', r.patronScenarios.join(' '), r.lineage.changeVsV1, r.productionComplexity.rating]),
    ),
    '',
    '## Releases',
    '',
    ...m.releases.map(detail),
  ].join('\n');
}

const fields = (o: Record<string, unknown>) =>
  Object.entries(o).map(([k, v]) => `- **${k}:** ${Array.isArray(v) ? v.join('; ') : typeof v === 'object' && v ? JSON.stringify(v) : String(v)}`).join('\n');

export function dialogueDoc(d: X.DialogueRegistry): string {
  const character = (c: X.DialogueCharacter) =>
    [
      `## ${c.displayName} (\`${c.cue}\`${c.age ? `, ${c.age}` : ''})`,
      '',
      `**Voice identity.** ${typeof c.voiceIdentity === 'string' ? c.voiceIdentity : JSON.stringify(c.voiceIdentity)}`,
      '',
      '**Linguistic personality**',
      '',
      fields(c.linguisticPersonality),
      '',
      '**Relationship language**',
      '',
      fields(c.relationshipLanguage),
      '',
      table(['State', 'Performance'], Object.entries(c.emotionalPerformance)),
      '',
      '**Established lines** (anchors, not a quota)',
      '',
      table(['Line', 'Release', 'Note'], c.dialogueContinuity.establishedLines.map((l) => [l.line, l.release, l.note ?? ''])),
      '',
      `**Voice asset:** ${c.voiceAsset.provider} · ${c.voiceAsset.voiceId ?? 'none'} · \`${c.voiceAsset.status}\``,
      '',
    ].join('\n');
  return [
    '# 06 — Character dialogue style registry',
    '',
    generatedNote([P.dialogue]),
    '',
    `**Registry:** \`${d.registryId}\` · **Classification:** \`${d.classification}\` · **Signature-line limit:** ${d.maxSignatureUsesPerRelease} per release`,
    '',
    '## Rules for every voice',
    '',
    bullets(d.globalRules),
    '',
    'The screenplay validator reads this registry: an unregistered speaker is a hard conflict unless the screenplay declares the character in `PRODUCTION.characters` (then a warning), and overused signature lines are flagged.',
    '',
    ...d.characters.map(character),
  ].join('\n');
}
