/**
 * Expression Engine — mobile Campaign Board entry card (Image B family).
 */

import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { site00ProjectExpressionEngineCampaignPath } from '../../config/routes';
import { expressionEngineApi } from '../../services/expressionEngineApi';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';

type Props = {
  projectSlug: string;
};

export function ExpressionEngineMobileCampaignCard({ projectSlug }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('ENTRY 002');
  const [territory, setTerritory] = useState('THE NOSTALGIA EDIT SUITE');
  const [status, setStatus] = useState('IN_PRODUCTION');
  const [anchor, setAnchor] = useState('COVER');
  const href = site00ProjectExpressionEngineCampaignPath(projectSlug);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    expressionEngineApi
      .phase2()
      .then((data) => {
        if (cancelled) return;
        setTitle(data.entry002.title);
        setTerritory(data.blueprint.territoryName);
        setStatus(data.entry002.status);
        setAnchor(data.blueprint.creativeAnchorRecommendation.format);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load';
          setError(
            msg.includes('Unexpected token') || msg.includes('<!DOCTYPE')
              ? 'API unavailable — redeploy Railway from main'
              : msg,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      to={href}
      className="site00-fws-mobile-campaign__expr-card"
      {...vrRegionAttr(NDX_VR_REGION.campaignQuickActions)}
    >
      <div className="site00-fws-mobile-campaign__expr-head">
        <p className="site00-fws-mobile-campaign__expr-kicker">EXPRESSION ENGINE · B1</p>
        <span className="site00-fws-mobile-campaign__expr-arrow" aria-hidden>
          →
        </span>
      </div>
      {loading ? (
        <p className="site00-fws-mobile-campaign__expr-meta">Loading blueprint…</p>
      ) : error ? (
        <p className="site00-fws-mobile-campaign__expr-meta">{error}</p>
      ) : (
        <>
          <p className="site00-fws-mobile-campaign__expr-title">{title}</p>
          <p className="site00-fws-mobile-campaign__expr-meta">{territory}</p>
          <p className="site00-fws-mobile-campaign__expr-meta">
            {status} · anchor {anchor} · 0 assets
          </p>
        </>
      )}
      <p className="site00-fws-mobile-campaign__expr-cta">OPEN BLUEPRINT →</p>
    </Link>
  );
}
