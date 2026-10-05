/**
 * P0.VR.3G + P0.VR.3H — Composer draft banner (preview-only pages).
 */

type Props = {
  pageLabel: string;
  sprint?: string;
};

export function Site00ComposerDraftBanner({ pageLabel, sprint = 'P0.VR.3H-SITE00' }: Props) {
  return (
    <aside className="site00-composer-draft-banner" data-composer-draft="true" aria-label="Composer draft notice">
      <p className="site00-composer-draft-banner__label">COMPOSER DRAFT · PREVIEW ONLY</p>
      <p className="site00-composer-draft-banner__meta">
        {pageLabel} · {sprint} · NOT LIVE UNTIL FOUNDER APPROVAL
      </p>
    </aside>
  );
}
