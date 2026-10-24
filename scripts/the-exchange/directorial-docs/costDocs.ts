import * as X from '../../../shared/site00-fiction-production/index.js';
import { bullets, generatedNote, table } from './md.js';

const D = X.Directorial;
type Budget = X.Directorial.ProductionBudget;
type QuotesRaw = X.Directorial.QuotesV2 & { openart: { creditUsdRateNote?: string; unavailable?: string[]; formFacts?: Record<string, string> }; fal: { openQuestion?: string } };

const n = (v: number | null | undefined) => (v === null || v === undefined ? 'UNKNOWN' : v.toLocaleString('en-US'));
const usd = (v: number | null | undefined) => (v === null || v === undefined ? 'UNKNOWN' : `$${v.toFixed(2)}`);
const cfg = (c: Record<string, unknown>) => Object.entries(c).map(([k, v]) => `${k}=${v}`).join(', ');

export function routingDoc(q: QuotesRaw): string {
  return [
    '# 17 — Provider routing and cost system',
    '',
    generatedNote(['shared/site00-fiction-production/directorial/routing.ts', D.QUOTES_V2_PATH]),
    '',
    '## Access is what this environment can do',
    '',
    table(['Access', 'Meaning'], [
      ['EXECUTABLE_AFTER_AUTHORIZATION', 'A credential or connector is present here; a job runs only after the founder gate passes.'],
      ['BLOCKED_NO_CREDENTIALS', 'The provider exists for the founder (for example through a ChatGPT connector) but no credential is available here. A connector elsewhere does not lend its credentials.'],
      ['MANUAL_OUTSIDE_PIPELINE', 'A person does it (composer, editor); cost UNKNOWN until quoted.'],
      ['NOT_AVAILABLE', 'Not offered through any route reachable here.'],
    ]),
    '',
    '## Routes',
    '',
    table(['Route', 'Job', 'Provider / model', 'Config', 'Access', 'Via', 'Why', 'Risks'],
      D.PROVIDER_ROUTES.map((r) => [r.routeId, r.kind, `${r.provider} / ${r.model}`, cfg(r.config), r.access, r.via, r.why, r.risks.join(' ')])),
    '',
    '## Not available here',
    '',
    bullets([
      ...(q.openart.unavailable ?? []),
      `ElevenLabs direct API: ${q.elevenlabs.directApi}. ${q.elevenlabs.note}`,
      ...(q.fal.openQuestion ? [`Open question: ${q.fal.openQuestion}`] : []),
      'No cross-provider transfer is assumed: an asset moves between providers only by a real upload that returns a real id.',
    ]),
    '',
    `## Recorded quotes (${q.retrievedAtUtc})`,
    '',
    `OpenArt plan ${q.openart.account.plan}, balance ${n(q.openart.account.balanceCreditsAtQuote)} credits at quote time. Credit-to-dollar rate: ${q.openart.creditUsdRate ?? 'UNKNOWN'}. ${q.openart.creditUsdRateNote ?? ''}`,
    '',
    table(['Model', 'Mode', 'Config', 'Credits'], q.openart.quotes.map((x) => [x.model, x.mode, cfg(x.config), x.totalCredits])),
    '',
    table(['fal endpoint', 'Price', 'Unit'], Object.entries(q.fal.prices).map(([k, v]) => [k, `$${v.unitPriceUsd}`, v.unit])),
    '',
    ...Object.entries(q.openart.formFacts ?? {}).map(([k, v]) => `**${k} form.** ${v}`),
    '',
    '## Cost rules',
    '',
    bullets([
      'A line is priced only from an exact recorded quote for its configuration. Anything else is UNKNOWN and blocks authorization of that job.',
      'Estimated, authorized, actual, refunded and regeneration spend are separate figures. Only the estimate is non-zero today.',
      'Expected revisions and a ceiling are shown beside the base estimate, from a stated retake policy.',
      'OpenArt is priced in credits; fal in dollars. No conversion is invented while the credit rate is unpublished.',
    ]),
  ].join('\n');
}

export function budgetDoc(b: Budget, plan: X.Directorial.ProductionPlan): string {
  const line = (id: string) => b.lines.find((l) => l.lineId === id);
  const stage1 = (line('B-01')?.credits ?? 0) + (line('B-02')?.credits ?? 0);
  return [
    `# 24 — ${plan.unitId} ${plan.title}: production budget`,
    '',
    generatedNote([X.scenePath(plan.unitId, X.SCENE_FILES.budget), D.QUOTES_V2_PATH]),
    '',
    '**Status: ESTIMATE ONLY. Nothing is authorized and nothing has been spent.**',
    '',
    table(['Figure', 'Credits (OpenArt)', 'USD (fal)'], [
      ['Base estimate', n(b.estimated.credits), usd(b.estimated.usd)],
      ['Expected revisions', n(b.revisions.expectedCredits), '—'],
      ['Expected total', n(b.expectedTotalCredits), usd(b.estimated.usd)],
      ['Ceiling', n(b.ceilingCredits), '—'],
      ['Authorized', n(b.ledger.authorizedCredits), usd(b.ledger.authorizedUsd)],
      ['Actual', n(b.ledger.actualCredits), usd(b.ledger.actualUsd)],
      ['Refunded', n(b.ledger.refundedCredits), '—'],
      ['Regeneration', n(b.ledger.regenerationCredits), '—'],
    ]),
    '',
    `Quoted ${b.quotedAtUtc}. Balance at quote ${n(b.balanceCreditsAtQuote)} credits. Credit-to-dollar rate ${b.creditUsdRate ?? 'UNKNOWN'}, so OpenArt credits are not converted. Lines still UNKNOWN: ${b.estimated.unknownLines.join(', ') || 'none'}.`,
    '',
    '## Lines',
    '',
    table(['Line', 'Category', 'What', 'Jobs', 'Route', 'Credits', 'USD', 'Status', 'Basis'], b.lines.map((l) => [l.lineId, l.category, l.description, l.jobs, l.routeId, n(l.credits), l.usd === null ? 'UNKNOWN' : usd(l.usd), l.status, l.basis])),
    '',
    '## Video per shot',
    '',
    table(['Shot', 'On screen', 'Generated', 'Credits', 'High risk'], b.perShot.map((s) => [s.shotId, `${s.screenSec} s`, `${s.generationSec} s`, n(s.credits), s.highRisk ? 'yes' : ''])),
    '',
    '## Revisions',
    '',
    `${b.revisions.policy} High-risk shots (${b.revisions.highRiskShots.length}): ${b.revisions.highRiskShots.join(', ')}.`,
    '',
    '## Recommended authorization order (FD-S101-11)',
    '',
    bullets([
      `Stage 1, references and keyframes: B-01 + B-02 = ${n(stage1)} credits before retakes. The founder approves frames before any video exists.`,
      `Stage 2, video: B-03 = ${n(line('B-03')?.credits)} credits, authorized per shot or for the whole release once frames are approved.`,
      `Sound and music on fal: ${usd(b.estimated.usd)} (B-06 + B-07) if the generated route is chosen; a commissioned score is UNKNOWN.`,
      'Assembly (B-09) uses founder tools and time: UNKNOWN.',
    ]),
  ].join('\n');
}
