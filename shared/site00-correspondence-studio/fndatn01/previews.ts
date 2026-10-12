/**
 * Review previews served to Correspondence Studio. Each email renders its demo scenario (fixtures.ts)
 * in review mode: root-relative assets, an inbox header and a DEMO DATA note. Regenerate with
 * `npx tsx scripts/correspondence-studio/fndatn01/render-previews.ts`.
 */
import { FNDATN01_DEMO_NOTE, FNDATN01_EMAIL_SCENARIO, demoScenario, type Fndatn01DemoScenarioId, type Fndatn01DemoVariant } from './fixtures.js';
import { FNDATN01_EMAILS, fndatn01PreviewPath, type Fndatn01EmailId } from './pack.js';
import { renderFndatn01Email } from './render.js';

export type Fndatn01Preview = {
  id: Fndatn01EmailId;
  variant: Fndatn01DemoVariant;
  scenario: Fndatn01DemoScenarioId;
  label: string;
  publicPath: string;
  html: string;
};

function renderPreview(id: Fndatn01EmailId, variant: Fndatn01DemoVariant): Fndatn01Preview {
  const email = FNDATN01_EMAILS.find((e) => e.id === id)!;
  const scenario = demoScenario(FNDATN01_EMAIL_SCENARIO[id], variant);
  const result = renderFndatn01Email(id, scenario.payload, {
    ...scenario.context,
    mode: 'review',
    assetBase: '',
    founderAuthorized: id === '01',
    reviewNote: `${FNDATN01_DEMO_NOTE} · ${scenario.label}`,
  });
  if (!result.ok) throw new Error(`FNDATN-01 ${id} demo scenario ${scenario.id} is ineligible: ${result.eligibility.reasons.join('; ')}`);
  return { id, variant, scenario: scenario.id, label: scenario.label, publicPath: fndatn01PreviewPath(email.slug, variant), html: result.html };
}

export function renderFndatn01Previews(): Fndatn01Preview[] {
  return [...FNDATN01_EMAILS.map((e) => renderPreview(e.id, 'default')), renderPreview('04', 'activation_pending')];
}
