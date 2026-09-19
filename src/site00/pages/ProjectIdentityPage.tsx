import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { EmptyState } from '../components/pages/Site00PagePrimitives';
import { useProjectIdentity, fieldLabel } from '../hooks/useProjectIdentity';
import { SITE00_ROUTES, site00ProjectOriginPath, site00ProjectPath } from '../config/routes';
import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { TERRITORY_PAYLOAD_TO_FIELD } from '../../../shared/site00-identity/identityFields.js';
import type { IdentityCanonFieldKey } from '../../../shared/site00-identity/identityFields.js';
import '../styles/site00-projects.css';

function payloadFields(payload: Record<string, unknown>) {
  return Object.entries(TERRITORY_PAYLOAD_TO_FIELD)
    .filter(([payloadKey]) => payload[payloadKey] !== undefined)
    .map(([payloadKey, fieldKey]) => ({
      fieldKey: fieldKey as IdentityCanonFieldKey,
      label: fieldLabel(fieldKey as IdentityCanonFieldKey),
      value: payload[payloadKey],
    }));
}

export default function ProjectIdentityPage() {
  const { projectSlug = '' } = useParams();
  const {
    state,
    error,
    brief,
    territories,
    hierarchy,
    bible,
    reviewState,
    promotionPreview,
    activeTerritoryId,
    setActiveTerritoryId,
    entering,
    acting,
    enterIdentity,
    submitJudgment,
    submitFieldJudgment,
    confirmWorldStructure,
    promoteApprovedFields,
  } = useProjectIdentity(projectSlug);

  if (!hasProjectCapability(projectSlug, 'BRAND_INTELLIGENCE')) {
    return (
      <EcosystemShell hidePageHeader>
        <EmptyState title="IDENTITY UNAVAILABLE" body="This project does not have Identity phase capability." />
      </EcosystemShell>
    );
  }

  const masterBrand = brief && typeof brief.masterBrand === 'string' ? brief.masterBrand : 'Astral World';
  const flagshipDistrict = brief && typeof brief.flagshipDistrict === 'string' ? brief.flagshipDistrict : 'Astréa';
  const judgmentState = reviewState?.founderJudgmentState ?? 'AWAITING_FOUNDER_JUDGMENT';
  const activeTerritory = territories.find((t) => t.id === activeTerritoryId) ?? territories[0] ?? null;

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-page site00-page--project-identity">
        <nav className="site00-project-command__back">
          <Link to={site00ProjectPath(projectSlug)}>← {projectSlug.toUpperCase()}</Link>
          <Link to={site00ProjectOriginPath(projectSlug)}> · ORIGIN</Link>
          <Link to={SITE00_ROUTES.projects}> · PROJECTS</Link>
        </nav>

        <header className="site00-project-command__header">
          <p className="site00-label-red">IDENTITY · FOUNDER REVIEW</p>
          <h1 className="site00-project-command__title">{masterBrand} Identity Review</h1>
          <p className="site00-body">
            Review 3 strategic territories. Judge at territory and field level. Nothing becomes canon without your explicit approval.
          </p>
          <p className="site00-project-command__note">
            Judgment state: <strong>{judgmentState}</strong>
            {reviewState ? ` · ${reviewState.fieldJudgmentCount} field judgments · ${reviewState.canonFieldCount} canon fields` : null}
          </p>
        </header>

        {state === 'loading' ? (
          <p className="site00-body">LOADING IDENTITY…</p>
        ) : state === 'error' ? (
          <EmptyState title="IDENTITY ERROR" body={error ?? 'Could not load identity data.'} />
        ) : (
          <>
            <section className="site00-project-command__section">
              <h2 className="site00-project-command__section-title">WORLD STRUCTURE (FOUNDER CONFIRMATION)</h2>
              <p className="site00-body">
                Structural canon only — not visual world formation. Confirm hierarchy before promotion.
              </p>
              <ul className="site00-project-command__activity">
                <li><strong>{masterBrand}</strong> = master product / universe</li>
                <li><strong>{flagshipDistrict}</strong> = flagship district</li>
                <li>Destinations: Tarot Suite · Astral Mall · Coffee Shop</li>
                <li>Future districts supported beneath {masterBrand}</li>
              </ul>
              {hierarchy.some((n) => n.is_canonical) ? (
                <p className="site00-body">✓ Structural world hierarchy promoted to canon</p>
              ) : (
                <button type="button" className="site00-btn site00-btn--primary" disabled={acting} onClick={() => void confirmWorldStructure()}>
                  CONFIRM &amp; PROMOTE WORLD STRUCTURE →
                </button>
              )}
            </section>

            <section className="site00-project-command__section">
              <h2 className="site00-project-command__section-title">IDENTITY TERRITORIES ({territories.length})</h2>
              {territories.length ? (
                <>
                  <ul className="site00-project-command__command-list">
                    {territories.map((t) => (
                      <li key={t.id}>
                        <button type="button" className="site00-btn" onClick={() => setActiveTerritoryId(t.id)}>
                          {activeTerritory?.id === t.id ? '▸ ' : '  '}{t.working_label}
                        </button>
                        <span className="site00-project-command__command-cat">{t.status}</span>
                      </li>
                    ))}
                  </ul>

                  {activeTerritory ? (
                    <div className="site00-project-command__section" style={{ marginTop: '1rem' }}>
                      <h3>{activeTerritory.working_label}</h3>
                      <p className="site00-body"><em>Strategic premise:</em> {activeTerritory.strategic_premise}</p>
                      <p className="site00-project-command__note">Territory judgment (SELECT = love · REVISE = promising · REJECT):</p>
                      <div>
                        <button type="button" className="site00-btn" disabled={acting} onClick={() => void submitJudgment(activeTerritory.id, 'SELECT')}>SELECT</button>{' '}
                        <button type="button" className="site00-btn" disabled={acting} onClick={() => void submitJudgment(activeTerritory.id, 'REVISE')}>REVISE</button>{' '}
                        <button type="button" className="site00-btn" disabled={acting} onClick={() => void submitJudgment(activeTerritory.id, 'REJECT')}>REJECT</button>{' '}
                        <button type="button" className="site00-btn" disabled={acting} onClick={() => void submitJudgment(activeTerritory.id, 'HYBRIDIZE')}>HYBRIDIZE</button>
                      </div>

                      <h4 className="site00-project-command__section-title">Field judgments</h4>
                      <ul className="site00-project-command__command-list">
                        {payloadFields(activeTerritory.payload).map((f) => (
                          <li key={f.fieldKey}>
                            <strong>{f.label}</strong>
                            <p className="site00-body">{String(f.value)}</p>
                            <div>
                              <button type="button" className="site00-btn" disabled={acting} onClick={() => void submitFieldJudgment(activeTerritory.id, f.fieldKey, 'APPROVE')}>APPROVE</button>{' '}
                              <button type="button" className="site00-btn" disabled={acting} onClick={() => void submitFieldJudgment(activeTerritory.id, f.fieldKey, 'REVISE', 'MASTER', 'Needs revision')}>REVISE</button>{' '}
                              <button type="button" className="site00-btn" disabled={acting} onClick={() => void submitFieldJudgment(activeTerritory.id, f.fieldKey, 'REJECT')}>REJECT</button>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {(activeTerritory.creative_hypotheses ?? []).length > 0 ? (
                        <>
                          <h4>Creative hypotheses (non-canonical)</h4>
                          <ul className="site00-project-command__activity">
                            {(activeTerritory.creative_hypotheses as string[]).map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : (
                <button type="button" className="site00-btn site00-btn--primary" disabled={entering} onClick={() => void enterIdentity()}>
                  {entering ? 'ENTERING…' : 'ENTER IDENTITY PHASE →'}
                </button>
              )}
            </section>

            {promotionPreview ? (
              <section className="site00-project-command__section">
                <h2 className="site00-project-command__section-title">CANON PROMOTION PREVIEW</h2>
                <p className="site00-body">
                  {promotionPreview.eligible.length} field(s) eligible · {promotionPreview.blocked.length} blocked
                </p>
                {promotionPreview.eligible.length > 0 ? (
                  <>
                    <ul className="site00-project-command__activity">
                      {promotionPreview.eligible.map((e) => (
                        <li key={e.fieldKey}>{e.fieldKey}: {String(e.value).slice(0, 80)}…</li>
                      ))}
                    </ul>
                    <button type="button" className="site00-btn site00-btn--primary" disabled={acting} onClick={() => void promoteApprovedFields()}>
                      PROMOTE APPROVED FIELDS →
                    </button>
                  </>
                ) : (
                  <p className="site00-project-command__note">Approve fields above to enable promotion. No auto-canonization.</p>
                )}
              </section>
            ) : null}

            {bible ? (
              <section className="site00-project-command__section">
                <h2 className="site00-project-command__section-title">PROJECT BIBLE (COMPILED)</h2>
                <p className="site00-project-command__note">
                  World formation: {(bible as { worldFormationState?: string }).worldFormationState ?? 'NOT_FORMED'}
                  {(bible as { founderJudgmentState?: string }).founderJudgmentState
                    ? ` · Judgment: ${(bible as { founderJudgmentState?: string }).founderJudgmentState}`
                    : null}
                </p>
              </section>
            ) : null}

            {error ? <p className="site00-label-red">{error}</p> : null}
          </>
        )}
      </div>
    </EcosystemShell>
  );
}
