import * as X from '../../../shared/site00-fiction-production/index.js';
import { generatedNote, table } from './md.js';

const P = X.EXCHANGE_PATHS;

type ContinuityReport = {
  summary: { hardConflicts: number; warnings: number; openQuestions: number; checksRun: string[] };
  screenplayFindings: Array<{ releaseId: string; findings: X.ScreenplayFinding[]; planWarnings: string[] }>;
  findings: X.ContinuityFinding[];
  forwardDependencies: Array<{ from: string; to: string }>;
};
type Regression = ReturnType<typeof X.runStressRegression>;

export function continuityDoc(c: ContinuityReport, r: Regression): string {
  return [
    '# 10 — Continuity validation report',
    '',
    generatedNote([P.continuityReport, P.stressRegression, P.knowledge]),
    '',
    'The engine flags; it never rewrites a screenplay or the master. Hard conflicts block the pipeline at CONTINUITY VALIDATED. Open questions are listed, not answered.',
    '',
    table(['Hard conflicts', 'Warnings', 'Open questions', 'Checks run'], [[c.summary.hardConflicts, c.summary.warnings, c.summary.openQuestions, c.summary.checksRun.length]]),
    '',
    `Checks: ${c.summary.checksRun.map((k) => `\`${k}\``).join(', ')}.`,
    '',
    '## Findings',
    '',
    table(['Severity', 'Check', 'Releases', 'Detail'], c.findings.map((f) => [f.severity, f.check, f.releases.join(', '), f.detail])),
    '',
    '## Screenplay validator findings (S1-01 to S1-05)',
    '',
    table(
      ['Release', 'Hard', 'Warnings', 'Detail'],
      c.screenplayFindings.map((s) => [s.releaseId, s.findings.filter((f) => f.severity === 'HARD_CONFLICT').length, s.findings.filter((f) => f.severity === 'WARNING').length, [...s.findings.map((f) => f.detail), ...s.planWarnings].join('; ') || 'none']),
    ),
    '',
    '## Forward dependencies from the drafted releases',
    '',
    table(['From', 'Pays off in'], c.forwardDependencies.map((d) => [d.from, d.to])),
    '',
    '## Knowledge and reveal ledger',
    '',
    table(
      ['Fact', 'Statement', 'Classification', 'Audience learns', 'Known by'],
      X.KNOWLEDGE_FACTS.map((f) => [f.factId, f.statement, f.classification, f.audienceFrom ?? `never in Season 1 (writers' room ${f.writersRoom})`, f.knownBy.map((k) => `${k.character} from ${k.from}`).join('; ')]),
    ),
    '',
    '## Structural stress-test regression (32 questions)',
    '',
    `Prior (reconciliation): ${r.prior.PASS} PASS, ${r.prior.PARTIAL} PARTIAL, ${r.prior.FAIL} FAIL. Current: ${r.current.PASS} PASS, ${r.current.PARTIAL} PARTIAL, ${r.current.FAIL} FAIL. Upgrades: ${r.upgrades.length ? r.upgrades.join(', ') : 'none'}.`,
    '',
    'Computed rows are re-derived from the approved master and this report. Editorial rows carry the reconciliation verdict; no PARTIAL is upgraded without computed evidence.',
    '',
    table(['ID', 'Question', 'Prior', 'Current', 'Method', 'Evidence'], r.rows.map((x) => [x.id, x.question, x.verdict, x.current, x.method, x.evidence])),
  ].join('\n');
}

const fields = (o: Record<string, unknown>) =>
  Object.entries(o)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `- **${k}:** ${v.join('; ') || '—'}`;
      if (v && typeof v === 'object') return `- **${k}:** ${Object.entries(v).map(([a, b]) => `${a}: ${b}`).join('; ')}`;
      return `- **${k}:** ${String(v)}`;
    })
    .join('\n');

export function screenplayBatchDoc(docs: Array<{ doc: X.ScreenplayDocument; source: string; sha256: string }>): string {
  const one = ({ doc, source, sha256 }: { doc: X.ScreenplayDocument; source: string; sha256: string }) => {
    const rt = X.estimateRuntime(doc);
    const meta = doc.meta as unknown as Record<string, Record<string, unknown>>;
    const body = source.replace(/^---\n[\s\S]*?\n---\n/, '');
    return [
      `## ${doc.meta.identity.releaseId} — ${doc.meta.identity.title}`,
      '',
      `**Status:** ${doc.meta.identity.approvalStatus} · **Version:** ${doc.meta.identity.version} · **Target:** ${doc.meta.identity.runtimeTarget} · **Estimate:** ${rt.estimatedSec} s (ratio ${rt.ratio}, ${rt.band}) · **Source:** \`${doc.sourcePath}\` (sha256 \`${sha256.slice(0, 16)}…\`)`,
      '',
      ...['story', 'performance', 'visual', 'production', 'continuity', 'editorial'].flatMap((s) => [`### ${s.toUpperCase()}`, '', fields(meta[s] ?? {}), '']),
      '### SCREENPLAY',
      '',
      '```text',
      body.trim(),
      '```',
      '',
      table(['Scene', 'Estimated seconds'], rt.scenes.map((s) => [s.sceneId, s.estimatedSec])),
      '',
    ].join('\n');
  };
  return [
    '# 12 — Screenplay batch S1-01 to S1-05',
    '',
    generatedNote([P.screenplays]),
    '',
    `Every screenplay in this batch is **${X.DRAFT_STATUS}**. Nothing has been rendered, recorded or generated. S1-06 onward is not started; the backlog is gated on founder acceptance of this batch.`,
    '',
    'Format: a JSON metadata block (IDENTITY, STORY, PERFORMANCE, VISUAL, PRODUCTION, CONTINUITY, EDITORIAL) followed by a Fountain screenplay with `[[TAG: value]]` production notes. See `05_SEASON1_SCREENPLAY_ARCHITECTURE.md`.',
    '',
    ...docs.map(one),
  ].join('\n');
}

type ShotFile = { releaseId: string; runtime: X.RuntimeEstimate; totals: { shots: number; durationSec: number; usd: number | null; credits: number | null; generatedShots: number }; warnings: string[]; shots: X.ShotRecord[] };

export function shotListDoc(files: Array<{ shots: ShotFile; manifest: X.ProductionManifest }>): string {
  const sumUsd = files.reduce((a, f) => a + (f.shots.totals.usd ?? 0), 0);
  const sumCr = files.reduce((a, f) => a + (f.shots.totals.credits ?? 0), 0);
  const one = ({ shots: s, manifest: m }: { shots: ShotFile; manifest: X.ProductionManifest }) =>
    [
      `## ${s.releaseId} — ${m.title}`,
      '',
      table(
        ['Shots', 'Generated shots', 'Seconds', 'Runtime estimate', 'fal route (USD)', 'OpenArt route (credits)'],
        [[s.totals.shots, s.totals.generatedShots, s.totals.durationSec, `${s.runtime.estimatedSec} s / ${s.runtime.targetSec} s`, s.totals.usd, s.totals.credits]],
      ),
      '',
      `**Blockers before any generation:** ${m.blockers.map((b) => `${b.kind} ${b.subject}`).join('; ') || 'none'}`,
      ...(s.warnings.length ? ['', `**Planner warnings:** ${s.warnings.join('; ')}`] : []),
      '',
      table(
        ['Shot', 'Type', 'Sec', 'On screen', 'Framing', 'Purpose', 'Dialogue', 'Start → end frame', 'Provider', 'Credits', 'USD'],
        s.shots.map((x) => [x.shotId.replace(`${x.releaseId}-`, ''), x.type, x.durationSec, x.onScreen.join(', '), x.framing, x.purpose, x.dialogueRefs.map((d) => d.replace(`${x.releaseId}-`, '')).join(' '), `${x.startFrameRef.replace(`${x.releaseId}-`, '')} → ${x.endFrameRef ? x.endFrameRef.replace(`${x.releaseId}-`, '') : '—'}`, x.generationProvider, x.estimatedCost.credits, x.estimatedCost.usd]),
      ),
      '',
    ].join('\n');
  return [
    '# 13 — Shot lists and asset manifests, S1-01 to S1-05',
    '',
    generatedNote([P.shotLists, P.manifests]),
    '',
    `Planning documents only: every shot is \`NOT_STARTED\`, every actual cost is null. ${files.reduce((a, f) => a + f.shots.totals.shots, 0)} shots in total. No shot runs longer than ${X.MAX_GENERATION_SEC} s; longer beats are split and chained end frame to start frame.`,
    '',
    `Cost estimates are two alternative routes, not a sum: about $${sumUsd.toFixed(2)} on the fal route or ${sumCr.toLocaleString('en-US')} OpenArt credits for all five releases, from quotes in \`PRODUCTION_TEST_RECORDS/PROVIDER_PRICE_QUOTES_V1.json\`. Voice recording and lip-sync on OpenArt are unquoted. Nothing is authorised to spend.`,
    '',
    ...files.map(one),
  ].join('\n');
}
