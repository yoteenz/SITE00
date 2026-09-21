/**
 * ProjectSkinContract — runtime design-system contract for page-concept NBP.
 * Compiled from SKINS tab model (designProjectSkinSystem) + master skin binding when present.
 */

import { buildProjectSkinSystem } from '../designProjectSkinSystem.js';
import { getProjectExperienceSkin } from '../../site00-brand-lore/projectSkin/projectSkinStore.js';
import { getMasterSkinById } from '../../site00-brand-lore/projectSkin/catalog.js';
import { resolvePageConceptProjectVisualIdentity } from './pageConceptProjectVisualIdentity.js';

export type ProjectSkinContractTypography = {
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  notes: readonly string[];
};

export type ProjectSkinContract = {
  contractId: string;
  version: string;
  projectId: string;
  skinName: string;
  source: 'SKINS_TAB' | 'SKINS_TAB_PLUS_MASTER_SKIN';
  masterSkinId: string | null;
  masterSkinVersion: string | null;
  typography: ProjectSkinContractTypography;
  palette: readonly string[];
  material: readonly string[];
  composition: readonly string[];
  imagery: readonly string[];
  componentExpression: readonly string[];
  brandSignals: readonly string[];
  forbiddenDrift: readonly string[];
  traits: readonly string[];
  tagline: string;
};

function typographyFromSkinSystem(projectId: string): ProjectSkinContractTypography {
  const skin = buildProjectSkinSystem(projectId);
  const byRole = (role: string) => skin.typography.find((t) => t.role.toLowerCase().includes(role.toLowerCase()));
  const display = byRole('display') ?? skin.typography[1] ?? skin.typography[0];
  const body = byRole('primary') ?? byRole('body') ?? skin.typography[0];
  const mono = byRole('data') ?? byRole('mono') ?? skin.typography[skin.typography.length - 1];
  const stack = (entry: { name: string; stack: string } | undefined) =>
    entry ? `${entry.name} · ${entry.stack}` : 'UNSPECIFIED';
  return {
    displayFont: stack(display),
    bodyFont: stack(body),
    monoFont: stack(mono),
    notes: skin.typography.map((t) => `${t.name} (${t.role}): ${t.stack}`),
  };
}

export function compileProjectSkinContract(projectId: string): ProjectSkinContract {
  const skinSystem = buildProjectSkinSystem(projectId);
  const binding = getProjectExperienceSkin(projectId);
  const master = binding ? getMasterSkinById(binding.masterSkinId) : null;
  const visualIdentity = resolvePageConceptProjectVisualIdentity(projectId);

  const paletteFromSwatches = skinSystem.palette.map((s) => `${s.token} ${s.value} (${s.role})`);
  const palette =
    paletteFromSwatches.length > 0 ? paletteFromSwatches
    : visualIdentity ? visualIdentity.palette
    : [];

  const forbidden = [
    ...(visualIdentity?.forbiddenDrift ?? []),
    'generic SaaS dashboard',
    'beige admin card grid',
    'bookstore / reading tracker UI',
    'corporate productivity template',
  ];

  const composition = [
    ...(master ?
      [
        `Master skin family: ${master.skinFamily}`,
        `Composition grammar: ${master.compositionGrammar.mode}`,
        `Density: ${master.tokens.density}`,
        `Surface: ${master.surfaceSystem.mode}`,
        `Image treatment: ${master.imageTreatment.mode}`,
      ]
    : []),
    ...skinSystem.panelGrammar.map((p) => `${p.name} — ${p.role}`),
    `Traits: ${skinSystem.traits.join(', ')}`,
  ];

  const contractId = `psc-${projectId}-${skinSystem.version.replace(/\./g, '')}`;
  return {
    contractId,
    version: skinSystem.version,
    projectId,
    skinName: skinSystem.skinName,
    source: master ? 'SKINS_TAB_PLUS_MASTER_SKIN' : 'SKINS_TAB',
    masterSkinId: binding?.masterSkinId ?? null,
    masterSkinVersion: binding?.activeSkinVersion ?? null,
    typography: typographyFromSkinSystem(projectId),
    palette,
    material: [
      ...skinSystem.materials.map((m) => `${m.name} — ${m.role}`),
      ...skinSystem.textures.map((t) => `Texture: ${t}`),
    ],
    composition,
    imagery: visualIdentity?.materialImageLanguage ?? ['Project image language from brand identity'],
    componentExpression: skinSystem.componentStyles.map((c) => `${c.name} (${c.tone})`),
    brandSignals: visualIdentity?.mandatoryBrandSignals ?? [skinSystem.tagline],
    forbiddenDrift: forbidden,
    traits: skinSystem.traits,
    tagline: skinSystem.tagline,
  };
}
