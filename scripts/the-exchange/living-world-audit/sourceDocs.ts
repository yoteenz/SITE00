import * as X from '../../../shared/site00-fiction-production/index.js';
import { releaseVerdict, VERDICTS } from './matrix.js';
import { A, bullets, countBy, generatedNote, PROPOSAL_NOTE, secs, table, type Ctx } from './md.js';

export function sourceAuditDoc(c: Ctx): string {
  const m = c.master;
  const status = countBy(c.index.releases, (r) => r.status.screenplay);
  const protectedCheck = c.checks.find((k) => k.id === 'PROTECTED_FILES')!;
  return [
    '# 01 — Source and canon audit',
    '',
    generatedNote(['shared/site00-fiction-production/audit/sources.ts', 'shared/site00-fiction-production/audit/baseline.ts', X.EXCHANGE_PATHS.master, A.SCENE_INDEX, X.EXCHANGE_PATHS.knowledge]),
    '',
    PROPOSAL_NOTE,
    '',
    `Audit read at commit \`${A.AUDIT_BASELINE_COMMIT}\` (head of PR #1692). Sprint \`${A.AUDIT_SPRINT_ID}\`.`,
    '',
    '## 1. Sources inspected',
    '',
    'Each source keeps its exact label. The bucket column is this audit\'s sorting into the sprint\'s eight groups; it does not reclassify anything.',
    '',
    table(['ID', 'Path', 'Exact classification', 'Bucket', 'Used for'], A.AUDIT_SOURCES.map((s) => [s.id, `\`${s.path}\``, s.exactClassification, s.bucket, s.role])),
    '',
    '## 2. Canon state at the baseline',
    '',
    bullets([
      `Master: \`${X.EXCHANGE_PATHS.master}\`, classification ${m.classification}, ${m.releases.length} releases, ${secs(m.structure.runtimeTotalSec)} (${m.structure.runtimeTotalSec} s), arcs ${m.structure.arcs.map((a) => `${a.number} ${a.name} (${a.first}–${a.last})`).join('; ')}.`,
      `Every release is ${[...new Set(m.releases.map((r) => r.classification))].join(', ')}.`,
      `Scene index: ${c.index.totals.scenes} scenes and ${c.index.releases.reduce((n, r) => n + r.beats.length, 0)} beats across ${c.index.totals.releases} releases. Screenplay status: ${Object.entries(status).map(([k, v]) => `${v} × ${k}`).join('; ')}.`,
      `Active production unit: ${c.index.activeReleaseId}, packet status ${c.packet.status} (${c.packet.duration}, ${c.packet.shots.length} shots, ${c.packet.keyframes} keyframes, ${c.packet.music.musicCues} music cues, ${c.packet.music.silenceCues} silence, ${c.packet.music.soundCues} sound cues).`,
      `Releases audited individually: ${A.RELEASE_JUDGMENTS.length} of ${m.releases.length}. Verdicts: ${Object.entries(VERDICTS).map(([k, label]) => `${m.releases.filter((r) => releaseVerdict(c, r.id) === k).length} ${label}`).join('; ')}.`,
    ]),
    '',
    '## 3. Audience knowledge the audit protects',
    '',
    table(
      ['Fact', 'Statement', 'Classification', 'Audience learns it in'],
      c.ledger.facts.map((f) => [f.factId, f.statement, f.classification, f.audienceFrom ?? `Not in Season 1 (${f.writersRoom})`]),
    ),
    '',
    '## 4. Open questions the audit does not answer',
    '',
    table(['ID', 'Question', 'Status', 'Applies to', 'Proposals waiting on it'], c.ledger.openQuestions.map((q) => [q.id, q.question, q.status, q.appliesTo, A.PROPOSALS.filter((p) => p.blockedBy?.includes(q.id)).map((p) => p.id).join(', ') || '—'])),
    '',
    'The S1-01 founder decisions the audit waits on are listed in deliverable 10.',
    '',
    '## 5. Where the sources disagree',
    '',
    'Quoted verbatim from both sides and checked by the validator. No source is edited; the governing source is named.',
    '',
    table(['ID', 'Issue', 'Source A', 'Source B', 'Resolution', 'Proposals'], A.SOURCE_DISCREPANCIES.map((d) => [d.id, d.issue, `"${d.a.quote}" (\`${d.a.file.split('/').pop()}\`)`, `"${d.b.quote}" (\`${d.b.file.split('/').pop()}\`)`, d.resolution, d.proposals.join(', ')])),
    '',
    '## 6. Files this audit must not change',
    '',
    `sha256 recorded at \`${A.AUDIT_BASELINE_COMMIT}\` and re-checked on every render. Result: ${protectedCheck.errors.length ? `CHANGED — ${protectedCheck.errors.join('; ')}` : `all ${protectedCheck.checked} unchanged`}.`,
    '',
    table(['File', 'sha256'], A.PROTECTED_BASELINE.map((f) => [`\`${f.path}\``, `\`${f.sha256}\``])),
    '',
    '## 7. Method',
    '',
    bullets([
      'Every release was read in the master (setting, opening hook, narrative development, character purpose, payoff, ending, continuity) and in the scene index (beats, scenes, audience knowledge). Each has one written judgment in `releases.ts`.',
      'Every proposal cites a release, a scene ID and, where it matters, a beat; quotes are verbatim and checked against the master or the named file.',
      'The S1-01 packet, decisions and shots were read, not regenerated.',
      'The writers\'-room truth document (NONCANONICAL. PROPOSED — NOT APPROVED.) was used to protect reveals, never as canon.',
      'No provider job, no media generation, no credit spend.',
    ]),
  ].join('\n');
}
