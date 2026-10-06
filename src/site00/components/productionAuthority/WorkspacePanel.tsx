import type { ReactNode } from 'react';
import { WorkspaceMediaSlot, type WorkspaceMediaProps } from './WorkspaceMediaSlot';
import type { WorkspaceMediaSlotType } from '../../config/production-workspace-density';

/**
 * P0.SITE00.PRODUCTION-WORKSPACE.RESPONSIVE-DENSITY-MEDIA-FRAMING-REFINEMENT1 — shared media-bearing panel.
 *
 * Explicit internal zones (media · text · metadata · actions) on the HUB density tokens, with a controlled
 * layout mode instead of one universal card. Side-by-side modes stack intentionally when the panel itself
 * becomes too narrow (container query) — text is never squeezed and media never cropped to nothing.
 * CSS: site00-production-workspace-density.css (§6 WORKSPACE PANEL).
 */

export type WorkspacePanelLayout =
  | 'MEDIA_LEFT_TEXT_RIGHT'
  | 'MEDIA_TOP_TEXT_BOTTOM'
  | 'THUMBNAIL_INLINE'
  | 'FULL_BLEED_MEDIA_WITH_OVERLAY'
  | 'MEDIA_ONLY_PREVIEW'
  | 'METADATA_WITH_SMALL_THUMBNAIL';

/** Default media slot per layout (a panel may still declare its own). */
export const WORKSPACE_PANEL_DEFAULT_SLOT: Record<WorkspacePanelLayout, WorkspaceMediaSlotType> = {
  MEDIA_LEFT_TEXT_RIGHT: 'FEATURE_MEDIA',
  MEDIA_TOP_TEXT_BOTTOM: 'CARD_MEDIA',
  THUMBNAIL_INLINE: 'ROW_THUMB',
  FULL_BLEED_MEDIA_WITH_OVERLAY: 'CARD_MEDIA',
  MEDIA_ONLY_PREVIEW: 'CARD_MEDIA',
  METADATA_WITH_SMALL_THUMBNAIL: 'ROW_THUMB',
};

export function WorkspacePanel({
  layout,
  media,
  title,
  meta,
  children,
  actions,
  className = '',
  testId,
}: {
  layout: WorkspacePanelLayout;
  media?: (WorkspaceMediaProps & { src: string | null | undefined; alt?: string; label?: string }) | null;
  title?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  testId?: string;
}) {
  const slot = media?.slot ?? WORKSPACE_PANEL_DEFAULT_SLOT[layout];
  return (
    <section className={`pwk-panel ${className}`.trim()} data-panel-layout={layout} data-testid={testId}>
      <div className="pwk-panel__grid">
        {media ?
          <WorkspaceMediaSlot className="pwk-panel__media" slot={slot} fit={media.fit} focal={media.focal} src={media.src} alt={media.alt} label={media.label} />
        : null}
        {layout === 'MEDIA_ONLY_PREVIEW' ? null : (
          <div className="pwk-panel__text">
            {title ? <h3 className="pwk-panel__title">{title}</h3> : null}
            {meta ? <p className="pwk-panel__meta">{meta}</p> : null}
            {children}
          </div>
        )}
        {actions ? <div className="pwk-panel__actions">{actions}</div> : null}
      </div>
    </section>
  );
}
