import type {
  PersonalityConvergenceClassification,
  ReplayConvergenceReport,
} from '../../../../shared/site00-brand-lore/personalityReplayTypes';
import {
  formatConvergenceScore,
  isLegacyInvalidComparisonReport,
  methodologyVerdictFromReport,
} from '../../../../shared/site00-brand-lore/replayConvergencePresentation';
import { site00StoragePublicUrl } from '../../utils/replayStorageUrl';

type HeroAsset = {
  assetId?: string;
  storagePath?: string;
};

const BENCHMARK_HERO_STORAGE_FALLBACK =
  'site00/assts/batches/ndxbook-identity-native-v2-pilot/generated/801b6bb9-abc6-47a4-8e56-2c0b22cb26ce.webp';

type PersonalityReplayComparisonPanelProps = {
  heroAsset?: HeroAsset | null;
  nativeProofFormat?: string | null;
  comparisonReport?: ReplayConvergenceReport | null;
};

function classificationLabel(c: PersonalityConvergenceClassification): string {
  return c.replace(/_/g, ' ');
}

export function PersonalityReplayComparisonPanel({
  heroAsset,
  nativeProofFormat,
  comparisonReport,
}: PersonalityReplayComparisonPanelProps) {
  if (!comparisonReport && !heroAsset?.storagePath) return null;

  const shadowUrl = heroAsset?.storagePath ? site00StoragePublicUrl(heroAsset.storagePath) : '';
  const benchmarkPath =
    comparisonReport?.benchmarkHeroStoragePath ??
    (comparisonReport?.benchmarkLoadedAt ? BENCHMARK_HERO_STORAGE_FALLBACK : null);
  const benchmarkUrl = benchmarkPath ? site00StoragePublicUrl(benchmarkPath) : '';

  const scores = comparisonReport?.scores;
  const legacyInvalid = comparisonReport ? isLegacyInvalidComparisonReport(comparisonReport) : false;
  const verdict = methodologyVerdictFromReport(comparisonReport);

  return (
    <section className="site00-replay-comparison" aria-label="Blind replay comparison results">
      <h3 className="site00-replay-comparison__title">METHODOLOGY COMPARISON</h3>

      {legacyInvalid ? (
        <p className="site00-replay-comparison__legacy" role="status">
          LEGACY INVALID COMPARISON RESULT — preserved as forensic evidence. Stub scorers returned 0/5 for
          creative/identity/hero; not an authoritative methodology failure.
        </p>
      ) : null}

      {nativeProofFormat ? (
        <p className="site00-replay-comparison__meta">NATIVE PROOF: {nativeProofFormat.replace(/_/g, ' ')}</p>
      ) : null}

      <div className="site00-replay-comparison__heroes">
        {shadowUrl ? (
          <figure className="site00-replay-comparison__hero">
            <figcaption>BLIND REPLAY HERO</figcaption>
            <img src={shadowUrl} alt="Blind personality replay hero" loading="lazy" />
          </figure>
        ) : null}
        {benchmarkUrl ? (
          <figure className="site00-replay-comparison__hero">
            <figcaption>EXISTING FOUNDER HERO (BENCHMARK)</figcaption>
            <img src={benchmarkUrl} alt="Existing NDXBOOK benchmark hero" loading="lazy" />
          </figure>
        ) : null}
      </div>

      {scores ? (
        <>
          {verdict ? <p className="site00-replay-comparison__verdict">{verdict}</p> : null}
          <ul className="site00-replay-comparison__scores">
            <li>PERSONALITY: {formatConvergenceScore(scores.personalityConvergence)}</li>
            <li>CREATIVE: {formatConvergenceScore(scores.creativeConvergence)}</li>
            <li>IDENTITY: {formatConvergenceScore(scores.identityConvergence)}</li>
            <li>HERO: {formatConvergenceScore(scores.heroConvergence)}</li>
          </ul>
          {comparisonReport?.personalityScorerMode ? (
            <p className="site00-replay-comparison__meta">
              PERSONALITY SCORER: {comparisonReport.personalityScorerMode.replace(/_/g, ' ')}
            </p>
          ) : null}
        </>
      ) : null}

      {comparisonReport?.personalityDomains?.length ? (
        <div className="site00-replay-comparison__domains">
          <h4 className="site00-replay-comparison__domains-title">PERSONALITY DOMAINS</h4>
          <ul>
            {comparisonReport.personalityDomains.map((row) => (
              <li key={row.domain} className="site00-replay-comparison__domain">
                <span className="site00-replay-comparison__domain-name">{row.domain.replace(/_/g, ' ')}</span>
                <span className="site00-replay-comparison__domain-class">
                  {classificationLabel(row.classification)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="site00-replay-comparison__note">
        METHODOLOGY CONVERGENCE — NOT PIXEL MATCHING. FOUNDER CREATIVE APPROVAL IS SEPARATE.
      </p>
    </section>
  );
}
