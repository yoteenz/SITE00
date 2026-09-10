/**
 * Shared state for Design → SKINS tab (brand family, screen pack, authorities).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchBrandFamilyRegistry, fetchFamilyAuthorities, fetchProjectExperienceSkin } from '../brandFamilySkin/brandFamilySkinApi.js';
import { BRAND_FAMILY_PROJECT_MAP, BRAND_FAMILY_PRIMARY_COLORS } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/constants.js';
import type { StandardScreenType } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/types.js';
import { STANDARD_SCREEN_PACK } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/types.js';
import { SCREEN_SLOT_PREFILL } from '../../../../shared/site00-brand-lore/projectSkin/brandFamily/screenSlotConfig.js';

export type SkinsViewport = 'MOBILE' | 'DESKTOP';

export type SkinsFamilyRecord = {
  brandKey: string;
  name: string;
  tagline: string;
  primaryColor: string | null;
  version: string;
  status: string;
  visualAuthorityStatus: string;
  screenPackStatus: Record<string, string>;
};

export type SkinsAuthorityRecord = {
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

export const SKINS_SCREEN_SLOTS: { packScreenType: StandardScreenType; num: string; shortLabel: string }[] = [
  { packScreenType: 'PROJECT_OVERVIEW', num: '01', shortLabel: 'OVERVIEW' },
  { packScreenType: 'IDENTITY', num: '02', shortLabel: 'IDENTITY' },
  { packScreenType: 'BUILDER', num: '03', shortLabel: 'BUILDER' },
  { packScreenType: 'EVOLVE', num: '04', shortLabel: 'EVOLVE' },
  { packScreenType: 'PRODUCTION', num: '05', shortLabel: 'PRODUCTION' },
  { packScreenType: 'REVIEWS', num: '06', shortLabel: 'REVIEWS' },
  { packScreenType: 'LIBRARY', num: '07', shortLabel: 'LIBRARY' },
  { packScreenType: 'CONTROL_ROOM', num: '08', shortLabel: 'CONTROL ROOM' },
];

const FAMILY_TAGLINES: Record<string, string> = {
  NDXBOOK: 'A MORE HUMAN INTERNET',
  FRONTAL_SLAYER: 'DISCIPLINE CREATES CLARITY',
  AIO: 'ONE SYSTEM MANY WORLDS',
  ASTRAL_WORLD: 'IDEAS TRAVEL FURTHER',
  STUDIO_WORLD: 'BUILT FOR WHAT\'S NEXT',
};

export function useDesignSkinsState(projectId: string) {
  const mappedBrand = BRAND_FAMILY_PROJECT_MAP[projectId] ?? null;
  const [families, setFamilies] = useState<SkinsFamilyRecord[]>([]);
  const [activeFamilyKey, setActiveFamilyKey] = useState(mappedBrand);
  const [activeScreenType, setActiveScreenType] = useState<StandardScreenType>('PROJECT_OVERVIEW');
  const [activeViewport, setActiveViewport] = useState<SkinsViewport>('MOBILE');
  const [authorities, setAuthorities] = useState<SkinsAuthorityRecord[]>([]);
  const [viewportStatusByFamily, setViewportStatusByFamily] = useState<
    Record<string, Record<StandardScreenType, Record<SkinsViewport, string>>>
  >({});
  const [ingestionSlot, setIngestionSlot] = useState<{
    brandKey: string;
    packScreenType: StandardScreenType;
    mode?: 'add' | 'replace' | 'registered';
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadAuthorities = useCallback(async (brandKey: string) => {
    const res = await fetchFamilyAuthorities(brandKey);
    if (res.authorities) setAuthorities(res.authorities as SkinsAuthorityRecord[]);
  }, []);

  useEffect(() => {
    const nextBrand = BRAND_FAMILY_PROJECT_MAP[projectId];
    if (nextBrand) setActiveFamilyKey(nextBrand);
  }, [projectId]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [registryRes, projectRes] = await Promise.all([
        fetchBrandFamilyRegistry() as Promise<{
          ok: boolean;
          screenPackByFamily?: Record<string, Record<string, string>>;
          screenPackViewportByFamily?: Record<string, Record<StandardScreenType, Record<SkinsViewport, string>>>;
        }>,
        fetchProjectExperienceSkin(projectId) as Promise<{
          ok: boolean;
          management?: { registry?: Array<Omit<SkinsFamilyRecord, 'tagline' | 'screenPackStatus'>>; brandFamilySkinId?: string };
        }>,
      ]);

      const packByFamily = registryRes.screenPackByFamily ?? {};
      setViewportStatusByFamily(registryRes.screenPackViewportByFamily ?? {});

      const registryList = projectRes.management?.registry ?? [];
      const enriched: SkinsFamilyRecord[] = registryList.map((f) => ({
        ...f,
        tagline: FAMILY_TAGLINES[f.brandKey] ?? f.name.toUpperCase(),
        screenPackStatus: packByFamily[f.brandKey] ?? {},
      }));

      setFamilies(enriched.length ? enriched : buildFallbackFamilies(projectId));
      const activeId = projectRes.management?.brandFamilySkinId ?? mappedBrand ?? enriched[0]?.brandKey;
      if (activeId) {
        setActiveFamilyKey(activeId);
        await reloadAuthorities(activeId);
      }
      setLoading(false);
    })();
  }, [projectId, mappedBrand, reloadAuthorities]);

  const activeFamily = useMemo(
    () => families.find((f) => f.brandKey === activeFamilyKey) ?? families[0] ?? null,
    [families, activeFamilyKey],
  );

  const authorityForActive = useCallback(
    (packScreenType: StandardScreenType, viewport: SkinsViewport = activeViewport) => {
      const screenType = packScreenType === 'PROJECT_OVERVIEW' ? 'OVERVIEW' : packScreenType;
      const moduleId = SCREEN_SLOT_PREFILL[packScreenType]?.moduleId ?? packScreenType;
      return authorities.find(
        (a) =>
          a.brandFamilySkinId === activeFamilyKey &&
          a.viewport === viewport &&
          (a.screenType === screenType || a.screenType === packScreenType) &&
          (a.moduleId === moduleId || a.moduleId === packScreenType),
      );
    },
    [activeFamilyKey, activeViewport, authorities],
  );

  const activeAuthority = useMemo(
    () => authorityForActive(activeScreenType, activeViewport),
    [activeScreenType, activeViewport, authorityForActive],
  );

  const screenIndex = SKINS_SCREEN_SLOTS.findIndex((s) => s.packScreenType === activeScreenType);

  const packCounts = useMemo(() => {
    let ready = 0;
    let inProgress = 0;
    let notStarted = 0;
    for (const slot of SKINS_SCREEN_SLOTS) {
      const st =
        viewportStatusByFamily[activeFamilyKey]?.[slot.packScreenType]?.[activeViewport] ??
        activeFamily?.screenPackStatus[slot.packScreenType] ??
        'NOT_STARTED';
      if (st === 'APPROVED' || st === 'VERIFIED' || st === 'IMPLEMENTED') ready++;
      else if (st === 'IN_PROGRESS' || st === 'SCREEN_DESIGN_IN_PROGRESS') inProgress++;
      else notStarted++;
    }
    return { ready, inProgress, notStarted, total: SKINS_SCREEN_SLOTS.length };
  }, [activeFamily, activeFamilyKey, activeViewport, viewportStatusByFamily]);

  const selectFamily = useCallback(
    (brandKey: string) => {
      setActiveFamilyKey(brandKey);
      void reloadAuthorities(brandKey);
    },
    [reloadAuthorities],
  );

  return {
    families,
    activeFamily,
    activeFamilyKey,
    activeScreenType,
    setActiveScreenType,
    activeViewport,
    setActiveViewport,
    activeAuthority,
    authorityForActive,
    screenIndex,
    packCounts,
    loading,
    ingestionSlot,
    setIngestionSlot,
    reloadAuthorities,
    selectFamily,
    viewportStatusByFamily,
  };
}

function buildFallbackFamilies(projectId: string): SkinsFamilyRecord[] {
  const scopedBrand = BRAND_FAMILY_PROJECT_MAP[projectId];
  const entries = scopedBrand
    ? [[scopedBrand, BRAND_FAMILY_PRIMARY_COLORS[scopedBrand]]] as const
    : Object.entries(BRAND_FAMILY_PRIMARY_COLORS);
  return entries.map(([brandKey, colors]) => ({
    brandKey,
    name: brandKey.replace(/_/g, ' '),
    tagline: FAMILY_TAGLINES[brandKey] ?? '',
    primaryColor: colors.color ?? null,
    version: '1.0',
    status: 'NEW_SKIN_TO_DESIGN',
    visualAuthorityStatus: 'NOT_STARTED',
    screenPackStatus: Object.fromEntries(STANDARD_SCREEN_PACK.map((s) => [s, 'NOT_STARTED'])),
  }));
}
