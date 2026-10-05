/**
 * Structured GPT2 mobile concept inspect drawer.
 */

import { useEffect } from 'react';

import type { NbpSlotPresentation } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';

export function PageConceptConceptInspectDrawer({
  slot,
  onClose,
}: {
  slot: NbpSlotPresentation;
  onClose: () => void;
}) {
  const meta = slot.gpt2Mobile;
  const validity =
    meta?.pageValidityPass === true ? 'PASS'
    : meta?.pageValidityPass === false ? 'FAIL'
    : 'WARNING';
  const overreach = meta?.screenshotOverreachWarning ? 'WARNING' : 'NONE';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="s00-pcg__inspectLayer" role="dialog" aria-label={`Concept ${slot.label} details`} data-testid="page-concept-concept-inspect-drawer">
      <button type="button" className="s00-pcg__inspectScrim" aria-label="Close inspect" onClick={onClose} />
      <div className="s00-pcg__inspectSheet">
        <header className="s00-pcg__inspectHead">
          <h3>CONCEPT {slot.label}</h3>
          <button type="button" className="s00-pcg__inspectClose" onClick={onClose}>
            CLOSE
          </button>
        </header>
        <div className="s00-pcg__inspectBody">
          <dl className="s00-pcg__inspectGrid">
            <div>
              <dt>WEB EXPRESSION TERRITORY</dt>
              <dd>{meta?.territoryLabel ?? '—'}</dd>
            </div>
            <div>
              <dt>ART DIRECTION</dt>
              <dd>{meta?.webExpressionArtDirectionPremise ?? meta?.webExpressionCreativePremise ?? meta?.rationale ?? '—'}</dd>
            </div>
            <div>
              <dt>SIGNATURE GRAPHIC DEVICE</dt>
              <dd>{meta?.webExpressionSignatureGraphicDevice ?? meta?.webExpressionGraphicDevice ?? '—'}</dd>
            </div>
            <div>
              <dt>TYPOGRAPHIC CONCEPT</dt>
              <dd>{meta?.webExpressionTypographicConcept ?? '—'}</dd>
            </div>
            <div>
              <dt>IMAGE ART DIRECTION</dt>
              <dd>{meta?.webExpressionImageArtDirection ?? meta?.webExpressionImageRole ?? '—'}</dd>
            </div>
            <div>
              <dt>COMPOSITION RULE</dt>
              <dd>{meta?.webExpressionEditorialCompositionRule ?? meta?.webExpressionCompositionSystem ?? '—'}</dd>
            </div>
            <div>
              <dt>COLOR EXPRESSION</dt>
              <dd>{meta?.webExpressionColorExpression ?? '—'}</dd>
            </div>
            <div>
              <dt>CONTROLLED DISRUPTION</dt>
              <dd>{meta?.webExpressionControlledDisruption ?? '—'}</dd>
            </div>
            <div>
              <dt>BESPOKE MOMENT</dt>
              <dd>{meta?.webExpressionBespokeMoment ?? '—'}</dd>
            </div>
            <div>
              <dt>WEBSITE METAPHOR</dt>
              <dd>{meta?.webExpressionWebsiteMetaphor ?? '—'}</dd>
            </div>
            <div>
              <dt>DISTINCTIVE MOVE</dt>
              <dd>{meta?.webExpressionDistinctiveMove ?? '—'}</dd>
            </div>
            <div>
              <dt>CREATIVE TENSION</dt>
              <dd>{meta?.webExpressionCreativeTension ?? '—'}</dd>
            </div>
            <div>
              <dt>PAGE VALIDITY</dt>
              <dd data-testid="concept-inspect-page-validity">{validity}</dd>
            </div>
            <div>
              <dt>CAPTURE INFLUENCE</dt>
              <dd data-testid="concept-inspect-capture-influence">
                {meta?.captureInfluenceMode === 'FUNCTIONAL_REFERENCE_ONLY' ?
                  'FUNCTIONAL REFERENCE ONLY'
                : meta?.captureInfluenceMode?.includes('BOTTOM') ?
                  'BOTTOM CONTINUITY ONLY'
                : meta?.captureInfluenceMode ?? '—'}
              </dd>
            </div>
            <div>
              <dt>FUNCTIONAL SOURCE</dt>
              <dd data-testid="concept-inspect-functional-source">
                {meta?.screenshotFunctionMapPresent ? 'PAGE FUNCTION MAP PRESENT' : '—'}
              </dd>
            </div>
            <div>
              <dt>REGIONS PRESERVED</dt>
              <dd>{meta?.regionsPreservedLabel ?? '—'}</dd>
            </div>
            <div>
              <dt>INTERACTIONS PRESERVED</dt>
              <dd>{meta?.interactionsPreservedLabel ?? '—'}</dd>
            </div>
            <div>
              <dt>BOTTOM NAV</dt>
              <dd>{meta?.bottomNavLockedToSource ? 'LOCKED TO SOURCE' : '—'}</dd>
            </div>
            <div>
              <dt>DESIGN AUTHORITY</dt>
              <dd>{meta?.designAuthorityLabel ?? 'CGPT + SKINS'}</dd>
            </div>
            <div>
              <dt>SCREENSHOT DESIGN AUTHORITY</dt>
              <dd>{meta?.screenshotDesignAuthority ?? 'NO'}</dd>
            </div>
            <div>
              <dt>SCREENSHOT OVERREACH</dt>
              <dd>{overreach}</dd>
            </div>
            <div>
              <dt>PROVIDER</dt>
              <dd>{meta?.provider ?? 'GPT2'}</dd>
            </div>
          </dl>
          <details className="s00-pcg__inspectTechnical" data-testid="concept-inspect-technical">
            <summary>TECHNICAL DETAILS</summary>
            <pre>
              {[
                `SLOT ${slot.key}`,
                `STATUS ${slot.status}`,
                meta?.promptVersion ? `PROMPT ${meta.promptVersion}` : null,
                slot.failureReason ? `FAILURE ${slot.failureReason}` : null,
              ]
                .filter(Boolean)
                .join('\n')}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
