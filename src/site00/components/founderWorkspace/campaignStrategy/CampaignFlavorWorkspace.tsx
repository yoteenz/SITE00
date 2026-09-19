/**
 * P0.CSI.1 — Campaign Flavor founder-facing surface.
 */

import { useMemo, useState } from 'react';
import {
  campaignStrategyLanguageSystem,
  generateConceptTerritorySeedsFromBrief,
  getBrandCampaignRange,
  recordFounderCampaignJudgment,
} from '../../../../../shared/site00-expression-engine/campaign-strategy-language/index.js';
import type {
  CampaignExpressionBrief,
  CampaignFlavorRecommendation,
  CampaignObjective,
  ConceptTerritorySeedHint,
} from '../../../../../shared/site00-expression-engine/campaign-strategy-language/types.js';
import { CampaignFlavorCard } from './CampaignFlavorCard';
import { CampaignStrategyDetailPanel } from './CampaignStrategyDetailPanel';
import { BrandCreativeContextPanel } from '../brandContext/BrandCreativeContextPanel';
import { useBrandCreativeContext } from '../../../hooks/useBrandCreativeContext';

const BRAND_OPTIONS = [
  { slug: 'frontal-slayer', label: 'FRONTAL SLAYER' },
  { slug: 'ndxbook', label: 'NDXBOOK' },
  { slug: 'site-00', label: 'SITE 00' },
  { slug: 'aio', label: 'ALL IN ONE' },
  { slug: 'astral-world', label: 'ASTRAL WORLD' },
];

const OBJECTIVES: { value: CampaignObjective; label: string }[] = [
  { value: 'LAUNCH', label: 'Product / brand launch' },
  { value: 'PRODUCT_SPOTLIGHT', label: 'Product spotlight' },
  { value: 'AWARENESS', label: 'Awareness' },
  { value: 'BRAND_WORLD', label: 'Brand world' },
  { value: 'EDITORIAL', label: 'Editorial' },
  { value: 'DROP', label: 'Drop / event' },
];

type Props = {
  projectSlug?: string;
  clientMode?: boolean;
};

function projectSlugToBrand(slug: string): string {
  const map: Record<string, string> = {
    ndxbook: 'ndxbook',
    'frontal-slayer': 'frontal-slayer',
    site00: 'site-00',
    aio: 'aio',
    'all-in-one-enterprises': 'aio',
    'astral-world': 'astral-world',
  };
  return map[slug.toLowerCase()] ?? slug.toLowerCase();
}

export function CampaignFlavorWorkspace({ projectSlug, clientMode = false }: Props) {
  const [brandSlug, setBrandSlug] = useState(() =>
    projectSlug ? projectSlugToBrand(projectSlug) : 'frontal-slayer',
  );
  const [objective, setObjective] = useState<CampaignObjective>('LAUNCH');
  const [selected, setSelected] = useState<CampaignFlavorRecommendation | null>(null);
  const [brief, setBrief] = useState<CampaignExpressionBrief | null>(null);
  const [territorySeeds, setTerritorySeeds] = useState<ConceptTerritorySeedHint[]>([]);
  const [founderMode, setFounderMode] = useState(!clientMode);
  const { context: brandContext, gate, loading: contextLoading, viewOpen, setViewOpen, refresh } =
    useBrandCreativeContext(brandSlug);

  const result = useMemo(
    () =>
      campaignStrategyLanguageSystem.recommendCampaignFlavors({
        brandSlug,
        objective,
        clientMode: !founderMode,
        brandContext,
        appetite: brandContext?.creativeAppetite ?? null,
      }),
    [brandSlug, objective, founderMode, brandContext],
  );

  const brandRange = useMemo(() => getBrandCampaignRange(brandSlug), [brandSlug]);

  const handleSelect = (rec: CampaignFlavorRecommendation) => {
    setSelected(rec);
    setBrief(null);
    setTerritorySeeds([]);
  };

  const handleGenerateTerritories = () => {
    if (!selected) return;
    const nextBrief = campaignStrategyLanguageSystem.generateCampaignExpressionBrief({
      brandSlug,
      objective,
      primaryStrategy: selected.strategyType,
      expressionLanguages: selected.flavorTags,
    });
    setBrief(nextBrief);
    setTerritorySeeds(generateConceptTerritorySeedsFromBrief(nextBrief));
  };

  const handleApprove = () => {
    if (!selected) return;
    recordFounderCampaignJudgment({
      brandSlug,
      strategyType: selected.strategyType,
      expressionLanguages: selected.flavorTags,
      judgment: 'LOVE_IT',
    });
  };

  const tierCards = [result.safe, result.fresh, result.wildCard].filter(Boolean) as CampaignFlavorRecommendation[];

  return (
    <div className={`site00-campaign-flavor-workspace${founderMode ? '' : ' site00-campaign-flavor-workspace--client'}`}>
      <header className="site00-campaign-flavor-workspace__hero">
        <p className="site00-campaign-flavor-workspace__eyebrow">CREATIVE INTELLIGENCE · P0.CSI.1</p>
        <h1 className="site00-campaign-flavor-workspace__title">CAMPAIGN FLAVOR</h1>
        <p className="site00-campaign-flavor-workspace__subtitle">
          Campaign strategy has its own language — vary how a brand tells stories while staying brand-true.
        </p>
      </header>

      {founderMode ? (
        <BrandCreativeContextPanel
          context={brandContext}
          gate={gate}
          loading={contextLoading}
          viewOpen={viewOpen}
          onViewContext={() => setViewOpen(true)}
          onCloseView={() => setViewOpen(false)}
          onRefresh={refresh}
          onBuildContext={refresh}
        />
      ) : null}

      {result.generationBlocked ? (
        <div className="site00-campaign-flavor-workspace__blocked">
          <p>{result.generationBlockMessage}</p>
        </div>
      ) : null}

      <div className="site00-campaign-flavor-workspace__controls">
        <label className="site00-campaign-flavor-workspace__field">
          <span>BRAND</span>
          <select value={brandSlug} onChange={(e) => { setBrandSlug(e.target.value); setSelected(null); }}>
            {BRAND_OPTIONS.map((b) => (
              <option key={b.slug} value={b.slug}>{b.label}</option>
            ))}
          </select>
        </label>
        <label className="site00-campaign-flavor-workspace__field">
          <span>OBJECTIVE</span>
          <select value={objective} onChange={(e) => { setObjective(e.target.value as CampaignObjective); setSelected(null); }}>
            {OBJECTIVES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="site00-campaign-flavor-workspace__toggle">
          <input type="checkbox" checked={founderMode} onChange={(e) => setFounderMode(e.target.checked)} />
          <span>Founder mode</span>
        </label>
      </div>

      {founderMode && result.rotationNote ? (
        <p className="site00-campaign-flavor-workspace__rotation">{result.rotationNote}</p>
      ) : null}

      {founderMode && result.varietyWarnings.length > 0 ? (
        <ul className="site00-campaign-flavor-workspace__warnings">
          {result.varietyWarnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      {!result.generationBlocked ? (
      <section className="site00-campaign-flavor-workspace__tier-row">
        <h2 className="site00-campaign-flavor-workspace__section-title">RECOMMENDED DIRECTIONS</h2>
        <div className="site00-campaign-flavor-workspace__cards">
          {(tierCards.length ? tierCards : result.recommendations.slice(0, 3)).map((rec) => (
            <CampaignFlavorCard
              key={rec.strategyType}
              recommendation={rec}
              selected={selected?.strategyType === rec.strategyType}
              onSelect={() => handleSelect(rec)}
              clientMode={!founderMode}
            />
          ))}
        </div>
      </section>
      ) : null}

      {founderMode && !result.generationBlocked ? (
        <section className="site00-campaign-flavor-workspace__more">
          <h2 className="site00-campaign-flavor-workspace__section-title">MORE DIRECTIONS</h2>
          <div className="site00-campaign-flavor-workspace__cards site00-campaign-flavor-workspace__cards--compact">
            {result.recommendations.slice(3, 6).map((rec) => (
              <CampaignFlavorCard
                key={rec.strategyType}
                recommendation={rec}
                selected={selected?.strategyType === rec.strategyType}
                onSelect={() => handleSelect(rec)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {founderMode && !result.generationBlocked ? (
        <aside className="site00-campaign-flavor-workspace__range">
          <h3>BRAND CAMPAIGN RANGE</h3>
          <p>
            <strong>Safe:</strong> {brandRange.safeRange.slice(0, 3).map((s) => s.replace(/_/g, ' ')).join(', ')}
          </p>
          <p>
            <strong>Stretch:</strong> {brandRange.stretchRange.slice(0, 3).map((s) => s.replace(/_/g, ' ')).join(', ')}
          </p>
        </aside>
      ) : null}

      {selected ? (
        <CampaignStrategyDetailPanel
          recommendation={selected}
          brief={brief}
          territorySeeds={territorySeeds}
          onGenerateTerritories={handleGenerateTerritories}
          onApprove={handleApprove}
          clientMode={!founderMode}
        />
      ) : null}
    </div>
  );
}
