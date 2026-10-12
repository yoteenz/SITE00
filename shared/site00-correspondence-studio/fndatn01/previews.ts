/**
 * Review previews served to Correspondence Studio. Rendered from disposable fixtures in review mode
 * (root-relative assets, inbox header). Regenerate with
 * `npx tsx scripts/correspondence-studio/fndatn01/render-previews.ts`.
 */
import { FNDATN01_FIXTURE_CONTEXT, FNDATN01_FIXTURE_NOTE, fixtureFor } from './fixtures.js';
import { FNDATN01_EMAILS, fndatn01PreviewPath, type Fndatn01EmailId } from './pack.js';
import { renderFndatn01Email } from './render.js';

export type Fndatn01Preview = { id: Fndatn01EmailId; variant: 'default' | 'activation_pending'; publicPath: string; html: string };

function renderPreview(id: Fndatn01EmailId, variant: Fndatn01Preview['variant']): Fndatn01Preview {
  const email = FNDATN01_EMAILS.find((e) => e.id === id)!;
  const result = renderFndatn01Email(id, fixtureFor(id, variant), {
    ...FNDATN01_FIXTURE_CONTEXT,
    mode: 'review',
    assetBase: '',
    founderAuthorized: id === '01',
    reviewNote: variant === 'activation_pending' ? `${FNDATN01_FIXTURE_NOTE} · ACTIVATION PENDING STATE` : FNDATN01_FIXTURE_NOTE,
  });
  if (!result.ok) throw new Error(`FNDATN-01 ${id} fixture is ineligible: ${result.eligibility.reasons.join('; ')}`);
  return { id, variant, publicPath: fndatn01PreviewPath(email.slug, variant), html: result.html };
}

export function renderFndatn01Previews(): Fndatn01Preview[] {
  return [...FNDATN01_EMAILS.map((e) => renderPreview(e.id, 'default')), renderPreview('04', 'activation_pending')];
}
