/**
 * P0.VR.PAGE-CONCEPT-GENERATOR-OPUS-SHELL1 — layer that presents the GENERATE
 * PAGE CONCEPTS shell.
 *
 * The panel carries its own header, target line and sticky action row, so it is
 * not wrapped in the generic child-surface modal (that wrapper would duplicate
 * the title). This file is placement only: scrim, escape-to-close and the
 * full-height sheet box. No generation behaviour lives here.
 */

import { useEffect } from 'react';

import { PageConceptGeneratorPanel } from './PageConceptGeneratorPanel';

export function PageConceptGeneratorOverlay({
  projectLabel,
  pageLabel,
  onClose,
  onGenerate,
}: {
  projectLabel: string;
  pageLabel: string;
  onClose: () => void;
  onGenerate?: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="s00-pcg-layer" data-testid="page-concept-generator-layer">
      <button type="button" className="s00-pcg__scrim" aria-label="Close generate page concepts" onClick={onClose} />
      <div className="s00-pcg-layer__box">
        <PageConceptGeneratorPanel
          projectLabel={projectLabel}
          pageLabel={pageLabel}
          onClose={onClose}
          onCancel={onClose}
          onGenerate={onGenerate}
          generateDisabled={!onGenerate}
          generateDisabledReason="GENERATION NOT WIRED IN THIS SHELL SPRINT"
        />
      </div>
    </div>
  );
}
