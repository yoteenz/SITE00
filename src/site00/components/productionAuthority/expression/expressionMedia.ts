/**
 * EXPRESSION media resolver (P0.STUDIOOS.PRODUCTION.FULL-AUTHORITY-FORENSIC-AUDIT.PIXEL-PERFECT-REFINEMENT.OPUS2).
 *
 * The Expression authority (STUDIOOS_EXPRESSION_AUTHORITY_LITE_v2) leads every route with creative media: role and
 * character portraits, actor headshots, looks, wardrobe items, frames. This module maps each canonical record to the
 * canonical media that already exists in the repo — nothing is generated, nothing is borrowed across records:
 *
 *   CHARACTER  Entry 002 pre-storyboard authority board crops (public/site00/production-authority-assets/entry-002,
 *              derived by scripts/production-authority/derive-entry002-media.py from the boards the production hub
 *              uses as the cast / look node art) → else the playing actor's media, labelled as such.
 *   ACTOR      Studio World resident media (casting thumbnail, founder-approved natural full body, close-ups) →
 *              else the Character Fabrication receipt slot for the catalogue number (actor.<sw>.portrait.primary).
 *   LOOK       the fashion-continuity board crop for the look's era.
 *   ASPECT     fashion-continuity detail tiles (outfit / hair / makeup / accessories), captioned with the board text.
 * A record without canonical media resolves to [] and renders an honest empty slot.
 */
import { characterAssetUrl } from '../../../../../shared/site00-character-fabrication/assets.js';
import { actorPortraitSlotId } from '../../../../../shared/site00-character-fabrication/actors.js';
import { getResidentVisualProjection } from '../../../../../shared/site00-studio-world/resident-intelligence/season1-ensemble/visualAuthority.js';
import type { CharacterCampaignLook, ProductionCharacter, StudioWorldActor } from '../../../../../shared/site00-studio-world/acting-catalogue/index.js';
import type { ExpressionData } from './expressionData';

export type MediaItem = {
  url: string;
  /** Caption (uppercase, authority grammar). */
  label: string;
  /** Where the image comes from — shown in inspectors so provenance is never hidden. */
  source: string;
};

const E2 = '/site00/production-authority-assets/entry-002';
const SUBJECT_BOARD = 'SUBJECT WOMAN · DUAL-ERA AUTHORITY';
const FASHION_BOARD = 'SUBJECT FASHION · CONTINUITY AUTHORITY';
const NDX_BOARD = 'NDX PRESENCE · PRE-STORYBOARD AUTHORITY 01';

const e2 = (id: string, label: string, source: string): MediaItem => ({ url: `${E2}/${id}.jpg`, label, source });

/** Entry 002 character → authority-board crops (most representative first). */
const CHARACTER_MEDIA: Record<string, readonly MediaItem[]> = {
  'char-entry002-subject-woman': [
    e2('subject-2026-portrait', '2026 · OLDER · WISER · STILL HER', SUBJECT_BOARD),
    e2('subject-2016-portrait', '2016 · RECOGNIZABLE · SAME FACE', SUBJECT_BOARD),
    e2('subject-2026-full', '2026 · SAME WOMAN · LATER ERA', SUBJECT_BOARD),
    e2('subject-2016-full', '2016 · SAME WOMAN · EARLIER ERA', SUBJECT_BOARD),
    e2('subject-2016-selfie', '2016 · JUST A GIRL FIGURING IT OUT', SUBJECT_BOARD),
    e2('subject-2026-audience', '2026 · DIFFERENT AUDIENCE', SUBJECT_BOARD),
    e2('subject-details', 'SAME DETAILS · CHOKER · LIPS', SUBJECT_BOARD),
    e2('subject-codes', 'SAME CODES · NEW CONTEXT', SUBJECT_BOARD),
  ],
  'char-entry002-ndx': [
    e2('ndx-partial-profile', 'PARTIAL PROFILE · A PRESENCE', NDX_BOARD),
    e2('ndx-observer', 'OBSERVER · DETACHED BY DESIGN', NDX_BOARD),
    e2('ndx-over-shoulder', 'OVER-SHOULDER · ALWAYS LOOKING', NDX_BOARD),
    e2('ndx-shadow', 'SHADOW · PRESENT BUT UNSEEN', NDX_BOARD),
    e2('ndx-reflection', 'REFLECTION · THE OBSERVER', NDX_BOARD),
    e2('ndx-phone-interaction', 'PHONE INTERACTION · SMALL DETAILS', NDX_BOARD),
  ],
};

/**
 * Hero "suspended screen" subject (EXPR2 family heroes show the project's lead subject, monochrome, on the central
 * screen of the production floor). Project-scoped: only the project whose authority boards the crop comes from.
 */
export function expressionHeroSubject(slug: string): MediaItem | null {
  return slug === 'ndxbook' ? CHARACTER_MEDIA['char-entry002-subject-woman'][0] : null;
}

/** Era → look board crops. */
const LOOK_MEDIA: Record<string, readonly MediaItem[]> = {
  '2016': [
    e2('look-2016-full', '2016 LOOK · FULL', FASHION_BOARD),
    e2('look-2016-portrait', '2016 LOOK · PORTRAIT', FASHION_BOARD),
    e2('look-2016-mirror', '2016 LOOK · MIRROR', FASHION_BOARD),
  ],
  '2026': [
    e2('look-2026-full', '2026 LOOK · FULL', FASHION_BOARD),
    e2('look-2026-portrait', '2026 LOOK · PORTRAIT', FASHION_BOARD),
    e2('look-2026-street', '2026 LOOK · HIGHER STANDARDS', FASHION_BOARD),
  ],
};

/** Look aspect → continuity detail tiles (the board captions are the authority's own words). */
const ASPECT_MEDIA: Record<string, readonly MediaItem[]> = {
  outfits: [
    e2('wardrobe-bodycon-dress', 'BLACK BODYCON DRESS', FASHION_BOARD),
    e2('wardrobe-bomber-jacket', 'BOMBER JACKET', FASHION_BOARD),
    e2('wardrobe-thigh-high-boots', 'THIGH HIGH BOOTS', FASHION_BOARD),
    e2('wardrobe-clear-heels', 'NUDE / CLEAR HEELS', FASHION_BOARD),
    e2('wardrobe-statement-bag', 'STATEMENT BAG', FASHION_BOARD),
  ],
  hair: [e2('hair-sleek-straight', 'SLEEK STRAIGHT HAIR', FASHION_BOARD), e2('look-2016-portrait', '2016 · HAIR', FASHION_BOARD), e2('look-2026-portrait', '2026 · HAIR', FASHION_BOARD)],
  makeup: [
    e2('beauty-overlined-lips', 'OVERLINED LIPS', FASHION_BOARD),
    e2('beauty-french-nails', 'FRENCH TIP NAILS', FASHION_BOARD),
    e2('beauty-french-toes', 'FRENCH TIP TOES', FASHION_BOARD),
    e2('subject-details', 'SAME DETAILS', SUBJECT_BOARD),
  ],
  accessories: [
    e2('wardrobe-choker', 'CHOKER', FASHION_BOARD),
    e2('wardrobe-statement-bag', 'STATEMENT BAG', FASHION_BOARD),
    e2('wardrobe-clear-heels', 'NUDE / CLEAR HEELS', FASHION_BOARD),
    e2('subject-codes', 'SAME CODES', SUBJECT_BOARD),
  ],
};

type ResidentActor = StudioWorldActor & { sourceResidentId?: string };

/** Actor (talent) media: resident visual authority, else the CF receipt for the catalogue number. */
export function actorMedia(actor: StudioWorldActor | null | undefined): readonly MediaItem[] {
  if (!actor) return [];
  const out: MediaItem[] = [];
  const seen = new Set<string>();
  const push = (url: string | null | undefined, label: string, source: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ url, label, source });
  };
  const rid = (actor as ResidentActor).sourceResidentId;
  push(actor.headshotPreviewUrl, 'CASTING PORTRAIT', rid ? 'STUDIO WORLD · CASTING THUMBNAIL V1' : 'ACTING CATALOGUE');
  if (rid) {
    const v = getResidentVisualProjection(rid);
    if (v) {
      push(v.primaryNaturalImage, 'NATURAL FULL BODY', 'STUDIO WORLD · SEASON 1 · FOUNDER APPROVED');
      v.closeupRefs.forEach((u, i) => push(u, `CLOSE-UP ${String(i + 1).padStart(2, '0')}`, 'STUDIO WORLD · SEASON 1'));
    }
  } else {
    push(characterAssetUrl(actorPortraitSlotId(actor.catalogueNumber)), 'PORTRAIT', `CHARACTER FABRICATION · ${actor.catalogueNumber}`);
  }
  return out;
}

/** Character (story identity) media: its own authority crops, else the playing actor's media (labelled). */
export function characterMedia(d: ExpressionData, c: ProductionCharacter | null | undefined): readonly MediaItem[] {
  if (!c) return [];
  const own = CHARACTER_MEDIA[c.characterId];
  if (own) return own;
  const a = d.actor(c.actorId);
  return actorMedia(a).map((m) => ({ ...m, label: `PLAYED BY ${a?.stageName.toUpperCase() ?? ''} · ${m.label}` }));
}

/** Role media = the media of the character that fills it (a role has no image of its own). */
export function roleMedia(d: ExpressionData, requirementId: string): readonly MediaItem[] {
  const c = d.charactersForRole(requirementId)[0];
  return characterMedia(d, c);
}

export function lookMedia(look: CharacterCampaignLook | null | undefined): readonly MediaItem[] {
  if (!look) return [];
  return LOOK_MEDIA[look.era] ?? LOOK_MEDIA[(look.label.match(/20\d\d/) ?? [''])[0]] ?? [];
}

export function aspectMedia(aspect: string): readonly MediaItem[] {
  return ASPECT_MEDIA[aspect] ?? [];
}

export const first = (m: readonly MediaItem[]) => m[0] ?? null;
