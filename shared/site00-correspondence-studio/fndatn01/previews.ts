/**
 * Review previews served to Correspondence Studio. Rendered from disposable fixtures in review mode
 * (root-relative assets, inbox header). Regenerate with
 * `npx tsx scripts/correspondence-studio/fndatn01/render-previews.ts`.
 */
import { FNDATN01_FIXTURE_CONTEXT, FNDATN01_FIXTURE_NOTE, FNDATN01_STRESS_LONG_CONTEXT, fixtureFor } from './fixtures.js';
import { FNDATN01_EMAILS, fndatn01PreviewPath, type Fndatn01EmailId, type Fndatn01PreviewVariant } from './pack.js';
import { renderFndatn01Email } from './render.js';

export type Fndatn01Preview = { id: Fndatn01EmailId; variant: Fndatn01PreviewVariant; publicPath: string; html: string };

const VARIANT_NOTE: Record<Fndatn01PreviewVariant, string> = {
  default: '',
  activation_pending: ' · ACTIVATION PENDING STATE',
  stress_long: ' · STRESS TEST · LONG PERSONALIZATION · FICTIONAL VALUES',
  stress_short: ' · STRESS TEST · SHORT PERSONALIZATION · OPTIONAL FIELDS ABSENT',
};

function renderPreview(id: Fndatn01EmailId, variant: Fndatn01Preview['variant']): Fndatn01Preview {
  const email = FNDATN01_EMAILS.find((e) => e.id === id)!;
  const result = renderFndatn01Email(id, fixtureFor(id, variant), {
    ...(variant === 'stress_long' ? FNDATN01_STRESS_LONG_CONTEXT : FNDATN01_FIXTURE_CONTEXT),
    mode: 'review',
    assetBase: '',
    founderAuthorized: id === '01',
    reviewNote: `${FNDATN01_FIXTURE_NOTE}${VARIANT_NOTE[variant]}`,
  });
  if (!result.ok) throw new Error(`FNDATN-01 ${id} fixture is ineligible: ${result.eligibility.reasons.join('; ')}`);
  return { id, variant, publicPath: fndatn01PreviewPath(email.slug, variant), html: result.html };
}

export const FNDATN01_STRESS_VARIANTS = ['stress_long', 'stress_short'] as const;

export function renderFndatn01Previews(): Fndatn01Preview[] {
  return [
    ...FNDATN01_EMAILS.map((e) => renderPreview(e.id, 'default')),
    renderPreview('04', 'activation_pending'),
    ...FNDATN01_STRESS_VARIANTS.flatMap((v) => FNDATN01_EMAILS.map((e) => renderPreview(e.id, v))),
  ];
}
