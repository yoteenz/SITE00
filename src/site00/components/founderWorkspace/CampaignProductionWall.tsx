import { useState, type ReactNode } from 'react';
import type { CampaignDayPresentation, CreativeAssetPresentation } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';
import { CreativeAssetCard } from './CreativeAssetCard';
import { AssetReviewWorkspace } from './AssetReviewWorkspace';

type CampaignProductionWallProps = {
  days: CampaignDayPresentation[];
  weekLabel: string;
  feedAssets?: CreativeAssetPresentation[];
  onAssetInspect?: (asset: CreativeAssetPresentation) => void;
  productionActions?: ReactNode;
};

export function CampaignProductionWall({
  days,
  weekLabel,
  feedAssets = [],
  onAssetInspect,
  productionActions,
}: CampaignProductionWallProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [reviewAsset, setReviewAsset] = useState<CreativeAssetPresentation | null>(null);

  const day = days[selectedDay];

  return (
    <div className="site00-fws-campaign">
      <header className="site00-fws-campaign__header">
        <div>
          <p className="site00-fws-campaign__kicker">CAMPAIGN BOARD</p>
          <h2 className="site00-fws-campaign__title">{weekLabel}</h2>
        </div>
        {productionActions}
      </header>

      <div className="site00-fws-campaign__days" role="tablist" aria-label="Campaign days">
        {days.map((d, i) => (
          <button
            key={d.date}
            type="button"
            role="tab"
            aria-selected={i === selectedDay}
            className={i === selectedDay ? 'site00-fws-campaign__day site00-fws-campaign__day--active' : 'site00-fws-campaign__day'}
            onClick={() => setSelectedDay(i)}
          >
            <span className="site00-fws-campaign__day-label">{d.dayLabel}</span>
            <span className="site00-fws-campaign__day-num">{d.date.slice(8, 10)}</span>
          </button>
        ))}
      </div>

      {day ? (
        <div className="site00-fws-campaign__lanes">
          {day.lanes.map((lane) => (
            <section key={lane.laneId} className="site00-fws-campaign__lane">
              <h3 className="site00-fws-campaign__lane-title">{lane.label}</h3>
              <div className={`site00-fws-campaign__lane-grid site00-fws-campaign__lane-grid--${lane.laneId.toLowerCase()}`}>
                {lane.assets.length ? (
                  lane.assets.map((asset) => (
                    <CreativeAssetCard
                      key={asset.id}
                      asset={asset}
                      size={lane.laneId === 'REEL' ? 'lg' : lane.laneId === 'STORY' ? 'sm' : 'md'}
                      onReview={() => {
                        setReviewAsset(asset);
                        onAssetInspect?.(asset);
                      }}
                    />
                  ))
                ) : (
                  <p className="site00-fws-empty site00-fws-empty--lane">
                    {lane.laneId === 'STORY' || lane.laneId === 'REEL'
                      ? 'Daily plan derivation populates this lane.'
                      : 'WAITING ON GENERATION — generate Slide 01 on Experiment 01.'}
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {feedAssets.length > 0 ? (
        <section className="site00-fws-campaign__feed-row">
          <h3 className="site00-fws-campaign__lane-title">ALL SLIDE 01 — FEED PREVIEW</h3>
          <div className="site00-fws-campaign__feed-scroll">
            {feedAssets.map((asset) => (
              <CreativeAssetCard
                key={asset.id}
                asset={asset}
                size="sm"
                onReview={() => setReviewAsset(asset)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <AssetReviewWorkspace
        open={Boolean(reviewAsset)}
        asset={reviewAsset}
        onClose={() => setReviewAsset(null)}
        inspect={reviewAsset ? (
          <pre className="site00-fws-inspector__raw">{JSON.stringify(reviewAsset, null, 2)}</pre>
        ) : null}
      />
    </div>
  );
}
