import fs from 'node:fs';
import * as X from '../../../shared/site00-fiction-production/index.js';
import { allAmendments, BANNER, bullets, CLOSING, generatedNote, P, rid, secs, SRC, table, type Ctx } from './md.js';

const head = (n: string, title: string, sources: string[]) => [`# ${n} — ${title}`, '', generatedNote(sources), '', BANNER, ''];

export function s101PlanDoc(c: Ctx): string {
  const plan = X.directedSceneBundle('S1-01', c.root).direction.plan;
  const packet = JSON.parse(fs.readFileSync(X.repoPath(SRC.packet, c.root), 'utf8')) as { sections: { '9_FOUNDER_DECISIONS': Array<{ decisionId: string; question: string; status: string }> } };
  const g = P.S101_GUARDS;
  const answered = new Map(P.FOUNDER_ANSWERS.map((a) => [a.decisionId, a]));
  return [
    ...head('08', 'S1-01 dependency and scene patch plan', [SRC.promotion, SRC.packet]),
    P.S101_PATCH.every((x) => x.status === 'APPLIED_FOUNDER_AUTHORIZED')
      ? 'S1-01 Dusk is in founder review. The founder authorized all seven patch items on 2026-10-25 and they are applied: the packet was rebuilt from the edited source modules, and its moved files are the new founder-authorized baseline (FOUNDER_S101_PATCH_BASELINE). Shots, frames, cues and runtime are unchanged. The "before" lines below quote the packet the founder reviewed.'
      : 'S1-01 Dusk is in founder review. Its directorial packet is not rewritten: its nine files are byte-identical to the audit baseline (validator UNCHANGED_FILES). This is the update the founder\'s decisions call for, to apply only after the founder reviews it.',
    '',
    '## 1. Baseline the patch must keep',
    '',
    table(
      ['Measure', 'Baseline', 'Now', 'After the patch'],
      [
        ['Runtime', `${g.baseline.durationSec} s`, `${plan.durationFrames / plan.fps} s`, 'Unchanged'],
        ['Shots', g.baseline.shots, plan.shots.length, 'Unchanged'],
        ['Frames at 24 fps', g.baseline.frames, plan.durationFrames, 'Unchanged'],
        ['Keyframe requirements', g.baseline.keyframes, plan.keyframes.length, 'Unchanged'],
        ['Music cues', g.baseline.musicCues, plan.music.filter((m) => m.cueType !== 'SILENCE').length, 'Unchanged'],
        ['Silences', g.baseline.silences, plan.music.filter((m) => m.cueType === 'SILENCE').length, 'Unchanged'],
        ['Sound cues', g.baseline.soundCues, plan.sound.length, 'Unchanged'],
      ],
    ),
    '',
    bullets(g.notes),
    '',
    '## 2. S1-01 founder decisions',
    '',
    table(['Decision', 'Question', 'In the packet now', 'Founder answer (2026-10-25)'], packet.sections['9_FOUNDER_DECISIONS'].map((d) => [d.decisionId, d.question, d.status, answered.get(d.decisionId) ? `${answered.get(d.decisionId)!.answer}${answered.get(d.decisionId)!.stillOpen ? ` (still open: ${answered.get(d.decisionId)!.stillOpen})` : ''}` : 'Unchanged: still open'])),
    '',
    '## 3. Dependency order',
    '',
    bullets([
      'FD-S101-06 RECURRING clears the identity dependency of S-02, R-01, R-02, R-03 and R-04.',
      'FD-S101-07 ANONYMOUS clears R-03 and closes E-10.',
      'R-01 SPEAKING settles R-01; R-01-ALT is not applied.',
      'FD-S101-05 is not completed. The callback is authorized; the garment is not chosen, KF-WD-GREEN-DRESS stays blocked, and R-02 stays production-held.',
      'S-02 precedes R-04: the step is fixed in S1-01 before S1-51 reuses it.',
    ]),
    '',
    '## 4. Patch items',
    '',
    ...P.S101_PATCH.flatMap((x) => [
      `### ${x.patchId}. ${x.subject}`,
      '',
      `- **Authority:** ${x.authority.join('; ')}`,
      `- **Serves:** ${x.proposals.join(', ')}`,
      `- **Edit:** ${x.targets.map((t) => `\`${t.sourceModule}\` (${t.locator}) → \`${t.generatedFile}\``).join('; ')}`,
      `- **Affects:** ${x.affects.join(', ')}`,
      `- **Unchanged:** ${x.unchanged}`,
      `- **Status:** ${x.status}`,
      '- **Before (quoted from the packet the founder reviewed):**',
      ...(x.before.length ? x.before.map((b) => `  - "${b}"`) : ['  - Nothing: a new note.']),
      '- **After:**',
      ...x.after.map((a) => `  - ${a}`),
      ...(x.applied ? [`- **Applied:** ${x.applied.date}, ${x.applied.authority}. The validator checks ${x.applied.present.length} exact text(s) present and ${x.applied.absent.length} replaced text(s) gone.${x.applied.note ? ` ${x.applied.note}` : ''}`] : []),
      '',
    ]),
    '## 5. Applying it',
    '',
    bullets([
      'The founder authorized the seven items on 2026-10-25 (founder sprint P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1, §03 A).',
      'The named source modules were edited and `build-directorial-production.ts` re-run. The packet, keyframe manifest, shot list and timeline events changed; frames, shots, cues, budget and review state did not.',
      "The packet's moved files are hashed as the founder-authorized baseline in the same commit (`audit/baseline.ts`, FOUNDER_S101_PATCH_BASELINE); the audit's own hashes stay as the record of what it read.",
      'FD-S101-01 to -04 and -08 to -11 stay open, and so does FD-S101-12, opened by PATCH-S101-05 for the four-count step. The S1-01 budget is untouched: applying the patch generates nothing.',
    ]),
    '',
    CLOSING,
  ].join('\n');
}

export function runtimeDoc(c: Ctx): string {
  const lw = allAmendments();
  const releases = [...new Set(lw.map((a) => rid(a.amendmentId)))];
  return [
    ...head('10', 'Runtime reconciliation', [SRC.promotion, SRC.master]),
    'Target: zero added seconds, at release and season level. Every approved change fits inside an existing beat; nothing was trimmed to make room, and no dialogue or performance was cut.',
    '',
    '## 1. Season',
    '',
    table(['Measure', 'Before', 'After'], [['Releases', 86, c.master.releases.length], ['Runtime', '127:40 (7,660 s)', `${c.master.structure.runtimeTotal} (${c.master.structure.runtimeTotalSec.toLocaleString('en-US')} s)`], ['Added by approved proposals', '—', `${P.PROMOTIONS.reduce((n, p) => n + p.runtimeImpactSec, 0)} s`]]),
    '',
    '## 2. Affected releases',
    '',
    table(
      ['Release', 'Title', 'Target', 'Amendments', 'Added', 'Fits'],
      releases.map((id) => {
        const r = c.master.releases.find((x) => x.id === id)!;
        return [id, r.title, secs(r.runtimeTargetSec), lw.filter((a) => rid(a.amendmentId) === id).map((a) => a.recommendationId).join(', '), '0 s', 'Inside the existing beat'];
      }),
    ),
    '',
    '## 3. Nothing needed more time',
    '',
    'No approved enhancement needed extra duration, so there is no beat to report, no trim to propose and no founder decision to request. R-07 (+2 s) is not approved and does not apply.',
    '',
    CLOSING,
  ].join('\n');
}

export function holdsDoc(): string {
  return [
    ...head('12', 'Asset and production holds', [SRC.promotion]),
    'Layer B. Creative approval does not make an asset ready. Nothing below exists as a file or provider asset, so nothing is EXISTS_VERIFIED or FOUNDER_APPROVED, and no URL, path or ID is recorded for anything that does not exist. Nothing is generated, commissioned or cast.',
    '',
    '## 1. Holds',
    '',
    table(['Hold', 'Blocks', 'Why', 'Lifted by'], P.PRODUCTION_HOLDS.map((h) => [h.holdId, h.blocks.join(', '), h.reason, h.lifted ? `${h.liftedBy} LIFTED ${h.lifted.date}: ${h.lifted.by}` : h.liftedBy])),
    '',
    '## 2. Production state of each approved proposal',
    '',
    table(['Proposal', 'Title', 'Production state', 'Holds'], P.PROMOTIONS.map((p) => [p.proposalId, p.title, p.productionState, p.productionHolds.join(', ') || '—'])),
    '',
    '## 3. Asset ledger',
    '',
    table(['Asset', 'Item', 'Proposals', 'Releases', 'Status', 'Source', 'Holds', 'Note'], P.ASSET_REQUIREMENTS.map((a) => [a.assetId, a.item, a.proposalIds.join(', '), a.releases.join(', ') || '—', a.status, a.source, a.holds.join(', ') || '—', a.note])),
    '',
    '## 4. Statuses',
    '',
    table(
      ['Status', 'Meaning', 'Count'],
      P.ASSET_STATUSES.map((s) => [
        s,
        {
          EXISTS_VERIFIED: 'A file or provider asset exists and its hash or ID is recorded.',
          FOUNDER_APPROVED: 'An existing asset the founder approved.',
          PROVISIONAL: 'Planned in a draft (directorial interpretation), not approved.',
          PENDING_IMPORT: 'Exists outside the repository and has not been imported.',
          PENDING_DESIGN: 'Needs a design or composition before anything can be made.',
          PENDING_PRODUCTION: 'Defined; made when its release enters production.',
          NOT_REQUIRED: 'A written rule; no asset.',
        }[s],
        P.ASSET_REQUIREMENTS.filter((a) => a.status === s).length,
      ]),
    ),
    '',
    CLOSING,
  ].join('\n');
}
