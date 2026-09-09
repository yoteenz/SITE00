/**
 * Design → MORE → Experience Skin — screen pack + Add Authority ingestion entry point.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchBrandFamilyRegistry, fetchFamilyAuthorities, fetchProjectExperienceSkin } from './brandFamilySkinApi.js';
import { SkinScreenAuthorityIngestion } from './SkinScreenAuthorityIngestion.js';
import { SkinScreenAuthorityCard } from './SkinScreenAuthorityCard.js';
import { DesignDwSectionIcon } from '../designWorkspace/DesignDwSectionIcon.js';
import type { StandardScreenType } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/types.js';
import '../../styles/site00-brand-family-skin.css';

type ScreenPackStatus = Record<string, string>;
type ViewportStatuses = Record<'MOBILE' | 'TABLET' | 'DESKTOP', string>;

type FamilyRecord = {
  brandKey: string;
  name: string;
  primaryColor: string | null;
  primaryColorFamily: string | null;
  skinIntent: string;
  version: string;
  status: string;
  visualAuthorityStatus: string;
  screenPackStatus: ScreenPackStatus;
};

type AuthorityRecord = {
  id: string;
  brandFamilySkinId: string;
  moduleId: string;
  screenType: string;
  viewport: string;
  status: string;
  implementationStatus: string;
  visualMatchStatus: string;
  authorityMode: string;
  fidelityMode: string;
  version: string;
  referenceAssetId: string | null;
};

type Props = {
  projectId?: string;
  viewMode?: 'FOUNDER' | 'CLIENT';
};

const SCREEN_SLOTS: { packScreenType: StandardScreenType; label: string }[] = [
  { packScreenType: 'PROJECT_OVERVIEW', label: '01 PROJECT OVERVIEW' },
  { packScreenType: 'IDENTITY', label: '02 IDENTITY' },
  { packScreenType: 'BUILDER', label: '03 BUILDER' },
  { packScreenType: 'EVOLVE', label: '04 EVOLVE' },
  { packScreenType: 'PRODUCTION', label: '05 PRODUCTION' },
  { packScreenType: 'REVIEWS', label: '06 REVIEWS' },
  { packScreenType: 'LIBRARY', label: '07 LIBRARY' },
  { packScreenType: 'CONTROL_ROOM', label: '08 CONTROL ROOM' },
];

export function ExperienceSkinManagementPanel({ projectId = 'ndxbook', viewMode = 'FOUNDER' }: Props) {
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [expandedFamily, setExpandedFamily] = useState<string | null>('NDXBOOK');
  const [authorities, setAuthorities] = useState<AuthorityRecord[]>([]);
  const [viewportStatusByFamily, setViewportStatusByFamily] = useState<
    Record<string, Record<StandardScreenType, ViewportStatuses>>
  >({});
  const [ingestionSlot, setIngestionSlot] = useState<{ brandKey: string; packScreenType: StandardScreenType } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const reloadAuthorities = useCallback(async (brandKey: string) => {
    const res = await fetchFamilyAuthorities(brandKey);
    if (res.authorities) setAuthorities(res.authorities as AuthorityRecord[]);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [registryRes, projectRes] = await Promise.all([
        fetchBrandFamilyRegistry() as Promise<{
          ok: boolean;
          screenPackByFamily?: Record<string, ScreenPackStatus>;
          screenPackViewportByFamily?: Record<string, Record<StandardScreenType, ViewportStatuses>>;
        }>,
        fetchProjectExperienceSkin(projectId) as Promise<{ ok: boolean; management?: { registry?: FamilyRecord[]; brandFamilySkinId?: string } }>,
      ]);

      const packByFamily = registryRes.screenPackByFamily ?? {};
      const viewportByFamily = registryRes.screenPackViewportByFamily ?? {};
      setViewportStatusByFamily(viewportByFamily);

      const registryList =
        projectRes.management?.registry ??
        [];
      const enriched = registryList.map((f) => ({
        ...f,
        screenPackStatus: packByFamily[f.brandKey] ?? {},
      }));

      setFamilies(enriched);
      const activeId = projectRes.management?.brandFamilySkinId ?? 'NDXBOOK';
      setExpandedFamily(activeId);
      await reloadAuthorities(activeId);
      setLoading(false);
    })();
  }, [projectId, reloadAuthorities]);

  if (viewMode === 'CLIENT') {
    return null;
  }

  function authorityForSlot(brandKey: string, packScreenType: StandardScreenType, viewport = 'MOBILE') {
    const screenType = packScreenType === 'PROJECT_OVERVIEW' ? 'OVERVIEW' : packScreenType;
    const moduleId = packScreenType === 'PROJECT_OVERVIEW' ? 'PROJECTS' : packScreenType;
    return authorities.find(
      (a) =>
        a.brandFamilySkinId === brandKey &&
        a.viewport === viewport &&
        (a.screenType === screenType || a.screenType === packScreenType) &&
        (a.moduleId === moduleId || a.moduleId === packScreenType),
    );
  }

  return (
    <section className="site00-bfs-management" data-panel="experience-skin">
      <div className="site00-bfs-management__head">
        <DesignDwSectionIcon iconId="eye" />
        <div>
          <h3>EXPERIENCE SKIN</h3>
          <p>BRAND FAMILY · SCREEN AUTHORITY · IMPLEMENT · CONVERGE</p>
        </div>
      </div>

      {loading ? <p className="site00-bfs-management__loading">LOADING…</p> : null}

      {ingestionSlot ? (
        <SkinScreenAuthorityIngestion
          brandFamilySkinId={ingestionSlot.brandKey}
          packScreenType={ingestionSlot.packScreenType}
          projectId={projectId}
          onRegistered={() => {
            setIngestionSlot(null);
            void reloadAuthorities(ingestionSlot.brandKey);
          }}
          onCancel={() => setIngestionSlot(null)}
        />
      ) : null}

      <div className="site00-bfs-management__registry">
        <h4>BRAND FAMILY SCREEN PACK</h4>
        {families.map((family) => {
          const isExpanded = expandedFamily === family.brandKey;
          return (
            <article key={family.brandKey} className="site00-bfs-management__family-card site00-bfs-management__family-card--expanded" data-brand={family.brandKey}>
              <header>
                <button
                  type="button"
                  className="site00-bfs-management__family-toggle"
                  onClick={() => {
                    setExpandedFamily(isExpanded ? null : family.brandKey);
                    if (!isExpanded) void reloadAuthorities(family.brandKey);
                  }}
                >
                  <strong>{family.name}</strong>
                  <span className="site00-bfs-management__version">v{family.version}</span>
                </button>
              </header>

              {isExpanded ? (
                <>
                  <div className="site00-bfs-management__swatch" style={{ background: family.primaryColor ?? '#333' }} />
                  <ul className="site00-bfs-management__screen-pack site00-bfs-management__screen-pack--interactive">
                    {SCREEN_SLOTS.map(({ packScreenType, label }) => {
                      const mobileAuthority = authorityForSlot(family.brandKey, packScreenType, 'MOBILE');
                      const desktopAuthority = authorityForSlot(family.brandKey, packScreenType, 'DESKTOP');
                      const viewportStatuses = viewportStatusByFamily[family.brandKey]?.[packScreenType];
                      const packStatus = family.screenPackStatus[packScreenType] ?? 'NOT_STARTED';

                      return (
                        <li key={packScreenType} data-status={packStatus}>
                          <div className="site00-bfs-management__screen-row">
                            <span>{label}</span>
                            <div className="site00-bfs-management__viewport-chips">
                              <span data-vp="MOBILE" data-status={viewportStatuses?.MOBILE ?? mobileAuthority?.status ?? 'NOT_STARTED'}>
                                MOBILE {(viewportStatuses?.MOBILE ?? mobileAuthority?.status ?? 'NOT STARTED').replace(/_/g, ' ')}
                              </span>
                              <span data-vp="DESKTOP" data-status={viewportStatuses?.DESKTOP ?? desktopAuthority?.status ?? 'NOT_STARTED'}>
                                DESKTOP {(viewportStatuses?.DESKTOP ?? desktopAuthority?.status ?? 'NOT STARTED').replace(/_/g, ' ')}
                              </span>
                            </div>
                            {!mobileAuthority ? (
                              <button
                                type="button"
                                className="site00-bfs-management__add-authority"
                                onClick={() => setIngestionSlot({ brandKey: family.brandKey, packScreenType })}
                              >
                                ADD AUTHORITY
                              </button>
                            ) : null}
                          </div>
                          {mobileAuthority ? (
                            <SkinScreenAuthorityCard
                              brandFamilySkinId={family.brandKey}
                              projectId={projectId}
                              card={mobileAuthority}
                              onImplement={() => void reloadAuthorities(family.brandKey)}
                              onReplace={() => setIngestionSlot({ brandKey: family.brandKey, packScreenType })}
                            />
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
            </article>
          );
        })}
      </div>

      <article className="site00-bfs-management__authority-note">
        <p>SCREEN AUTHORITY → IMPLEMENT → VISUAL QA → CONVERGE · NOT ASSETS → INSTRUCT</p>
      </article>
    </section>
  );
}
