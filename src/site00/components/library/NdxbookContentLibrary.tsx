import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  CreativeAssetRecord,
  CreativeLineageLibraryPayload,
} from '../../../../shared/site00-brand-lore/creativeLineage/types';
import { site00StoragePublicUrl } from '../../utils/replayStorageUrl';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';
import { SITE00_ROUTES } from '../../config/routes';

type Section =
  | 'ALL'
  | 'CANONICAL'
  | 'PRODUCTION_CANDIDATES'
  | 'CAROUSELS'
  | 'FRANCHISES'
  | 'CONCEPTS'
  | 'ADAPTABLE'
  | 'RETIRED'
  | 'EXCLUDED_FROM_BRAND'
  | 'LOVED'
  | 'REVISION_PENDING'
  | 'REVISED'
  | 'REJECTED_FOR_BRAND'
  | 'CANON_REVIEW';

type NdxbookContentLibraryProps = {
  projectSlug: string;
};

function assetPreview(asset: CreativeAssetRecord): string {
  return asset.generationLineage.storagePath ? site00StoragePublicUrl(asset.generationLineage.storagePath) : '';
}

export function NdxbookContentLibrary({ projectSlug }: NdxbookContentLibraryProps) {
  const [library, setLibrary] = useState<CreativeLineageLibraryPayload | null>(null);
  const [section, setSection] = useState<Section>('ALL');
  const [loading, setLoading] = useState(true);
  const [normalizing, setNormalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'LIBRARY' | 'SALVAGE' | 'AUDIT'>('LIBRARY');

  const reload = useCallback(async () => {
    try {
      const result = await site00ProjectsApi.creativeLineageLibrary(projectSlug, section);
      setLibrary(result.library as CreativeLineageLibraryPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [projectSlug, section]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const normalize = useCallback(async () => {
    setNormalizing(true);
    setError(null);
    try {
      await site00ProjectsApi.creativeLineageNormalize(projectSlug);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Normalization failed');
    } finally {
      setNormalizing(false);
    }
  }, [projectSlug, reload]);

  const updateAsset = useCallback(
    async (assetId: string, reuseState: CreativeAssetRecord['reuseState']) => {
      await site00ProjectsApi.creativeLineageAssetUpdate(projectSlug, assetId, { reuseState });
      await reload();
    },
    [projectSlug, reload],
  );

  if (loading) return <p className="site00-content-library__pending">LOADING CONTENT LIBRARY…</p>;

  return (
    <section className="site00-content-library" aria-label="NDXBOOK content library">
      <p className="site00-content-library__kicker">CREATIVE ASSET LINEAGE</p>
      <h3 className="site00-content-library__title">CONTENT LIBRARY</h3>
      <p className="site00-content-library__meta">
        Brand canon v{library?.brandCanonState?.brandCanonVersion ?? 0} · Content canon v
        {library?.brandCanonState?.contentCanonVersion ?? 0}
        {library?.brandCanonState?.winningDirectionName
          ? ` · GOVERNING: ${library.brandCanonState.winningDirectionName}`
          : ' · NO WINNING WORLD SELECTED'}
      </p>

      <p className="site00-content-library__meta">
        <Link to={SITE00_ROUTES.projectCanonicalCarouselExpansion.replace(':projectSlug', projectSlug)}>
          Experiment C — carousels →
        </Link>
      </p>

      <div className="site00-content-library__controls">
        <button type="button" className="site00-btn site00-btn--primary" disabled={normalizing} onClick={() => void normalize()}>
          {normalizing ? 'NORMALIZING…' : 'NORMALIZE LINEAGE FROM VALIDATION RUNS'}
        </button>
      </div>

      <div className="site00-content-library__tabs">
        {(['LIBRARY', 'SALVAGE', 'AUDIT'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={['site00-content-library__tab', view === tab ? 'site00-content-library__tab--active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setView(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {error ? (
        <p className="site00-content-library__error" role="alert">
          {error}
        </p>
      ) : null}

      {view === 'LIBRARY' ? (
        <>
          <div className="site00-content-library__filters">
            {(
              [
                'ALL',
                'CANONICAL',
                'PRODUCTION_CANDIDATES',
                'LOVED',
                'REVISION_PENDING',
                'REVISED',
                'CAROUSELS',
                'FRANCHISES',
                'CONCEPTS',
                'ADAPTABLE',
                'RETIRED',
                'REJECTED_FOR_BRAND',
                'EXCLUDED_FROM_BRAND',
                'CANON_REVIEW',
              ] as Section[]
            ).map((s) => (
              <button
                key={s}
                type="button"
                className={section === s ? 'site00-content-library__filter--active' : ''}
                onClick={() => setSection(s)}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="site00-content-library__grid">
            {(library?.assets ?? []).map((asset) => {
              const url = assetPreview(asset);
              return (
                <article key={asset.assetId} className="site00-content-library__card">
                  {url ? <img src={url} alt={asset.assetType} loading="lazy" /> : <p>NO PREVIEW</p>}
                  <h4>{asset.assetType.replace(/_/g, ' ')}</h4>
                  <p>{asset.directionLineage.directionName}</p>
                  <p>{asset.contentLineage.topicName ?? '—'}</p>
                  <p>
                    {asset.productionState} · {asset.reuseState}
                    {asset.brandDisposition ? ` · ${asset.brandDisposition.replace(/_/g, ' ')}` : ''}
                    {asset.brandLineageMembership === 'EXCLUDED' ? ' · EXCLUDED FROM NDXBOOK' : ''}
                    {asset.revisionPending ? ' · REVISION PENDING' : ''}
                    {asset.crossBrandPortable ? ' · CROSS-BRAND PORTABLE' : ''}
                  </p>
                  <p>{asset.canonStatus}</p>
                  <div className="site00-content-library__actions">
                    <button type="button" onClick={() => void updateAsset(asset.assetId, 'REUSABLE_AS_IS')}>
                      MARK REUSABLE
                    </button>
                    <button type="button" onClick={() => void updateAsset(asset.assetId, 'REUSABLE_WITH_ADAPTATION')}>
                      MARK ADAPTABLE
                    </button>
                    <button type="button" onClick={() => void updateAsset(asset.assetId, 'IDEA_ONLY')}>
                      IDEA ONLY
                    </button>
                    <button type="button" onClick={() => void updateAsset(asset.assetId, 'RETIRED')}>
                      RETIRE
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {library?.concepts?.length ? (
            <details className="site00-content-library__concepts">
              <summary>CONCEPTS ({library.concepts.length})</summary>
              {library.concepts.map((c) => (
                <div key={c.conceptId} className="site00-content-library__concept-row">
                  <strong>{c.name}</strong>
                  <p>{c.originDirectionName}</p>
                  <p>Portable core: {c.portableCore}</p>
                  <p>Original expression: {c.originalExpression}</p>
                </div>
              ))}
            </details>
          ) : null}

          {library?.franchises?.length ? (
            <details className="site00-content-library__concepts">
              <summary>FRANCHISES ({library.franchises.length})</summary>
              {library.franchises.map((f) => (
                <div key={f.franchiseId} className="site00-content-library__concept-row">
                  <strong>{f.name}</strong>
                  <p>{f.description}</p>
                  <p>Translation policy: {f.translationPolicy}</p>
                </div>
              ))}
            </details>
          ) : null}
        </>
      ) : null}

      {view === 'SALVAGE' ? (
        <div className="site00-content-library__salvage">
          <h4>WHAT SHOULD SURVIVE?</h4>
          {!library?.salvageReviews?.length ? (
            <p>No salvage reviews yet. Promote a winning world first (founder-triggered only).</p>
          ) : (
            library.salvageReviews.map((review) => (
              <section key={review.losingDirectionId} className="site00-content-library__salvage-direction">
                <h5>{review.losingDirectionName}</h5>
                {review.items.map((item) => (
                  <div key={item.itemId} className="site00-content-library__salvage-item">
                    <p>
                      <strong>{item.title}</strong> ({item.itemKind})
                    </p>
                    <div className="site00-content-library__actions">
                      {(['KEEP_AS_IS', 'TRANSLATE_INTO_WINNING_WORLD', 'KEEP_IDEA_ONLY', 'RETIRE'] as const).map((action) => (
                        <button
                          key={action}
                          type="button"
                          className={item.founderAction === action ? 'site00-content-library__filter--active' : ''}
                          onClick={() =>
                            void site00ProjectsApi
                              .creativeLineageSalvageAction(projectSlug, {
                                winningDirectionId: review.winningDirectionId,
                                losingDirectionId: review.losingDirectionId,
                                itemId: item.itemId,
                                action,
                              })
                              .then(() => reload())
                          }
                        >
                          {action.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ))
          )}
        </div>
      ) : null}

      {view === 'AUDIT' && library?.forensicAudit ? (
        <div className="site00-content-library__audit">
          <p>Assets discovered: {library.forensicAudit.assetsDiscovered}</p>
          <p>Concepts discovered: {library.forensicAudit.conceptsDiscovered}</p>
          <h5>Ephemeral risks</h5>
          <ul>
            {library.forensicAudit.ephemeralRisks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <h5>Migration plan</h5>
          <ol>
            {library.forensicAudit.migrationPlan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
