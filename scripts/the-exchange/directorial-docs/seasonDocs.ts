import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, table } from './md.js';

type Continuity = {
  summary: { hardConflicts: number; warnings: number; openQuestions: number; checksRun: string[] };
  screenplayFindings: Array<{ releaseId: string; findings: Array<{ severity: string; check: string; detail: string }> }>;
  findings: Array<{ check: string; severity: string; detail: string }>;
  forwardDependencies: Array<{ from: string; to: string }>;
};

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

export function screenplayPlanDoc(index: X.SceneIndex, continuity: Continuity): string {
  const count = (f: (r: X.ReleaseBrief) => string) => index.releases.reduce<Record<string, number>>((a, r) => ({ ...a, [f(r)]: (a[f(r)] ?? 0) + 1 }), {});
  const screenplay = count((r) => r.status.screenplay);
  const production = count((r) => r.status.production);
  const briefFields = ['whatHappens', 'whyItMatters', 'beats', 'scenes', 'knowledge', 'wants', 'emotionalChange', 'futureRevelations', 'openQuestions', 'motifs', 'locations', 'continuity', 'opening', 'ending', 'connections', 'runtime', 'identity'];
  return [
    '# 07 — Screenplay development and continuity plan',
    '',
    generatedNote([`${X.EXCHANGE_PATHS.season}/SEASON1_SCENE_INDEX_V1.json`, X.EXCHANGE_PATHS.continuityReport]),
    '',
    '## Two levels',
    '',
    `- **Level A, whole season.** All ${index.totals.releases} releases (${mmss(index.totals.runtimeSec)}) are indexed with a writing brief built from the approved master. ${index.totals.drafted} are drafted as screenplays; ${index.totals.plannedFromMaster} are \`${X.PLANNED_FROM_MASTER}\`, meaning the brief exists and the screenplay does not. ${index.totals.scenes} scenes are indexed.`,
    '- **Level B, one scene at a time.** Only the active release is in founder review. Every other release is queued silently; its needs are tracked in deliverable 25 and are not shown to the founder until it becomes active.',
    '',
    `**Approval scope.** ${X.STORY_APPROVAL_SCOPE}`,
    '',
    '## Status',
    '',
    table(['Screenplay status', 'Releases'], Object.entries(screenplay).map(([k, v]) => [k, v])),
    '',
    table(['Production status', 'Releases'], Object.entries(production).map(([k, v]) => [k, v])),
    '',
    '## Writing batches',
    '',
    'Batches follow release order so each script inherits settled continuity from the one before. A batch is drafted only when the founder accepts the writing quality and conventions of the batch before it. Drafts are never marked approved by the agent.',
    '',
    table(['Batch', 'Releases', 'Runtime', 'Status'], index.batches.map((b) => [b.batch, b.releases.length > 2 ? `${b.releases[0]} to ${b.releases[b.releases.length - 1]}` : b.releases.join(', '), mmss(b.runtimeSec), b.status])),
    '',
    '## What each writing brief carries',
    '',
    `Every release in \`SEASON1_SCENE_INDEX_V1.json\` (deliverable 05) carries: ${briefFields.map((f) => `\`${f}\``).join(', ')}. Each narrative field keeps its source label; nothing missing is filled in by the agent.`,
    '',
    '## Continuity gates per batch',
    '',
    `Before a batch goes to the founder, the continuity validator runs ${continuity.summary.checksRun.length} checks: ${continuity.summary.checksRun.map((c) => `\`${c}\``).join(', ')}.`,
    `Current result over the master and the five drafts: ${continuity.summary.hardConflicts} hard conflicts, ${continuity.summary.warnings} warning, ${continuity.summary.openQuestions} open questions.`,
    '',
    table(['Draft', 'Findings'], continuity.screenplayFindings.map((s) => [s.releaseId, s.findings.map((f) => `${f.severity} ${f.check}: ${f.detail}`).join('; ') || 'none'])),
    '',
    '### Open questions carried by the validator',
    '',
    bullets(continuity.findings.filter((f) => f.severity === 'OPEN_QUESTION').map((f) => `${f.check}: ${f.detail}`)),
    '',
    '### Forward dependencies from the drafted batch',
    '',
    bullets(continuity.forwardDependencies.map((d) => `${d.from} sets up ${d.to}`)),
    '',
    '## Rules',
    '',
    bullets([
      'Never fabricate missing canon: a gap in the master becomes an open question on the brief, not an invented event.',
      'Season story approval is not approval of any script, performance, shot or music cue.',
      'A screenplay revision keeps its earlier version under SCREENPLAYS/HISTORY and bumps the version in the release status.',
      'Directed scenes are planned from the exact screenplay version on file; the build fails if the versions disagree.',
    ]),
  ].join('\n');
}
