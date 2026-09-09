/**
 * Design → MORE → Experience Skin — founder skin management (not visible to clients).
 */

import { useEffect, useState } from 'react';
import { fetchBrandFamilyRegistry, fetchProjectExperienceSkin } from './brandFamilySkinApi.js';
import { DesignDwSectionIcon } from '../designWorkspace/DesignDwSectionIcon.js';
import '../../styles/site00-brand-family-skin.css';

type ScreenPackStatus = Record<string, string>;

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

type Props = {
  projectId?: string;
  viewMode?: 'FOUNDER' | 'CLIENT';
};

const SCREEN_LABELS = [
  'PROJECT OVERVIEW',
  'IDENTITY',
  'BUILDER',
  'EVOLVE',
  'PRODUCTION',
  'REVIEWS',
  'LIBRARY',
  'CONTROL ROOM',
] as const;

const SCREEN_KEYS = [
  'PROJECT_OVERVIEW',
  'IDENTITY',
  'BUILDER',
  'EVOLVE',
  'PRODUCTION',
  'REVIEWS',
  'LIBRARY',
  'CONTROL_ROOM',
] as const;

export function ExperienceSkinManagementPanel({ projectId = 'frontal-slayer', viewMode = 'FOUNDER' }: Props) {
  const [families, setFamilies] = useState<FamilyRecord[]>([]);
  const [current, setCurrent] = useState<FamilyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [registryRes, projectRes] = await Promise.all([
        fetchBrandFamilyRegistry() as Promise<{ ok: boolean; families?: unknown[]; screenPackByFamily?: Record<string, ScreenPackStatus> }>,
        fetchProjectExperienceSkin(projectId) as Promise<{ ok: boolean; management?: { registry?: FamilyRecord[]; brandFamilySkinId?: string } }>,
      ]);

      const packByFamily = registryRes.screenPackByFamily ?? {};
      const registryList =
        projectRes.management?.registry ??
        (registryRes.families as Array<{ brandKey: string; name: string; primaryColor: string | null; primaryColorFamily: string | null; skinIntent: string; version: string; status: string; visualAuthorityStatus: string }> | undefined)?.map(
          (f) => ({
            ...f,
            screenPackStatus: packByFamily[f.brandKey] ?? {},
          }),
        ) ??
        [];

      setFamilies(registryList);
      const activeId = projectRes.management?.brandFamilySkinId;
      setCurrent(registryList.find((f) => f.brandKey === activeId) ?? registryList[0] ?? null);
      setLoading(false);
    })();
  }, [projectId]);

  if (viewMode === 'CLIENT') {
    return null;
  }

  return (
    <section className="site00-bfs-management" data-panel="experience-skin">
      <div className="site00-bfs-management__head">
        <DesignDwSectionIcon iconId="eye" />
        <div>
          <h3>EXPERIENCE SKIN</h3>
          <p>BRAND FAMILY SKIN REGISTRY · SCREEN PACK STATUS · AUTHORITY MANAGEMENT</p>
        </div>
      </div>

      {loading ? <p className="site00-bfs-management__loading">LOADING…</p> : null}

      {current ? (
        <article className="site00-bfs-management__current">
          <span className="site00-bfs-management__eyebrow">CURRENT SKIN</span>
          <strong>{current.name}</strong>
          <div className="site00-bfs-management__meta">
            <span>PRIMARY: {current.primaryColor ?? current.primaryColorFamily ?? '—'}</span>
            <span>INTENT: {current.skinIntent.replace(/_/g, ' ')}</span>
            <span>VERSION: {current.version}</span>
            <span>STATUS: {current.status.replace(/_/g, ' ')}</span>
          </div>
        </article>
      ) : null}

      <div className="site00-bfs-management__registry">
        <h4>BRAND FAMILY REGISTRY</h4>
        <div className="site00-bfs-management__family-grid">
          {families.map((family) => (
            <article key={family.brandKey} className="site00-bfs-management__family-card" data-brand={family.brandKey}>
              <header>
                <strong>{family.name}</strong>
                <span className="site00-bfs-management__version">v{family.version}</span>
              </header>
              <div className="site00-bfs-management__swatch" style={{ background: family.primaryColor ?? '#333' }} />
              <dl>
                <dt>PRIMARY</dt>
                <dd>{family.primaryColor ?? family.primaryColorFamily}</dd>
                <dt>INTENT</dt>
                <dd>{family.skinIntent.replace(/_/g, ' ')}</dd>
                <dt>STATUS</dt>
                <dd>{family.status.replace(/_/g, ' ')}</dd>
              </dl>
              <ul className="site00-bfs-management__screen-pack">
                {SCREEN_KEYS.map((key, i) => (
                  <li key={key} data-status={family.screenPackStatus[key] ?? 'NOT_STARTED'}>
                    <span>{SCREEN_LABELS[i]}</span>
                    <em>{(family.screenPackStatus[key] ?? 'NOT_STARTED').replace(/_/g, ' ')}</em>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <article className="site00-bfs-management__authority-note">
        <p>ONE SCREEN · ONE AUTHORITY · ONE IMPLEMENTATION TARGET · VISUAL CONVERGENCE REQUIRED</p>
        <p className="site00-bfs-management__warn">NO FINAL SKIN UI WITHOUT APPROVED SCREEN AUTHORITY</p>
      </article>
    </section>
  );
}
