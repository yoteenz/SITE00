import type {
  PersonalityConvergenceClassification,
  ReplayConvergenceReport,
} from '../../../../shared/site00-brand-lore/personalityReplayTypes';
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

function methodologyVerdict(score: number): string {
  if (score >= 4) return 'PIPELINE VALIDATED';
  if (score >= 2.5) return 'PARTIAL — REVIEW DIVERGENCE';
  return 'FAILED — METHODOLOGY DRIFT';
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
  const personalityScore = scores?.personalityConvergence ?? 0;

  return (
    <section className="site00-replay-comparison" aria-label="Blind replay comparison results">
      <h3 className="site00-replay-comparison__title">METHODOLOGY COMPARISON</h3>

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
          <p className="site00-replay-comparison__verdict">{methodologyVerdict(personalityScore)}</p>
          <ul className="site00-replay-comparison__scores">
            <li>PERSONALITY: {scores.personalityConvergence}/5</li>
            <li>CREATIVE: {scores.creativeConvergence}/5</li>
            <li>IDENTITY: {scores.identityConvergence}/5</li>
            <li>HERO: {scores.heroConvergence}/5</li>
          </ul>
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
