/**
 * EXPERIENCE SKIN onboarding step — visual selection, founder approval required.
 */

import { useEffect, useMemo, useState } from 'react';
import type { MasterSkin, MasterSkinRecommendationResult } from '../../../../shared/site00-brand-lore/projectSkin/browserClient.js';
import { fetchMasterSkinCatalog, recommendProjectSkin, completeSkinOnboarding } from './masterSkinApi.js';
import { MasterSkinPreviewCard } from './MasterSkinPreviewCard.js';

type Props = {
  projectId: string;
  fieldTags: string[];
  brandPersonality?: string[];
  primaryColor?: string;
  audience?: string;
  onComplete?: (skinId: string) => void;
};

export function MasterSkinOnboardingStep({
  projectId,
  fieldTags,
  brandPersonality,
  primaryColor = '#2a7f8f',
  audience,
  onComplete,
}: Props) {
  const [skins, setSkins] = useState<MasterSkin[]>([]);
  const [recommendation, setRecommendation] = useState<MasterSkinRecommendationResult | null>(null);
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);
  const [showAlternates, setShowAlternates] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchMasterSkinCatalog().then((res) => {
      if (res.skins) setSkins(res.skins);
    });
    void recommendProjectSkin({ fieldTags, brandPersonality, audience, primaryColor }).then((res) => {
      if (res.recommendation) {
        setRecommendation(res.recommendation);
        setSelectedSkinId(res.recommendation.recommendedSkinId);
      }
    });
  }, [fieldTags, brandPersonality, audience, primaryColor]);

  const recommendedSkin = useMemo(
    () => skins.find((s) => s.id === recommendation?.recommendedSkinId) ?? null,
    [skins, recommendation],
  );

  const alternates = useMemo(() => {
    const ids = new Set(recommendation?.rankedSkins.map((r) => r.skinId) ?? []);
    return skins.filter((s) => ids.has(s.id) && s.id !== recommendation?.recommendedSkinId);
  }, [skins, recommendation]);

  const approve = async (founderApproved: boolean) => {
    if (!selectedSkinId) return;
    setBusy(true);
    try {
      await completeSkinOnboarding({
        projectId,
        fieldTags,
        selectedSkinId,
        primaryColor,
        founderApproved,
        brandPersonality,
      });
      onComplete?.(selectedSkinId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="site00-master-skin-onboarding" data-step="experience-skin">
      <header>
        <p className="site00-master-skin-onboarding__eyebrow">EXPERIENCE SKIN</p>
        <h2>RECOMMENDED SKIN</h2>
        {recommendation ? (
          <p className="site00-master-skin-onboarding__summary">{recommendation.reasoningSummary}</p>
        ) : null}
      </header>

      {recommendedSkin ? (
        <MasterSkinPreviewCard
          skin={recommendedSkin}
          recommendation={recommendation?.rankedSkins[0] ?? null}
          selected={selectedSkinId === recommendedSkin.id}
          onSelect={() => setSelectedSkinId(recommendedSkin.id)}
        />
      ) : null}

      <div className="site00-master-skin-onboarding__actions">
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--primary"
          disabled={busy || !selectedSkinId}
          onClick={() => void approve(true)}
        >
          USE THIS
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => setShowAlternates((v) => !v)}>
          VIEW ALTERNATES
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={() => setShowAlternates(true)}>
          CUSTOMIZE
        </button>
      </div>

      {showAlternates ? (
        <div className="site00-master-skin-onboarding__alternates">
          <h3>ALTERNATE SKINS</h3>
          <div className="site00-master-skin-onboarding__grid">
            {alternates.map((skin) => (
              <MasterSkinPreviewCard
                key={skin.id}
                skin={skin}
                recommendation={recommendation?.rankedSkins.find((r) => r.skinId === skin.id) ?? null}
                selected={selectedSkinId === skin.id}
                onSelect={() => setSelectedSkinId(skin.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
