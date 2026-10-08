/**
 * AIO OFFICE creative-direction profile — the internal office's visual language, established from the founder's
 * four-screen design (P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1, D-CREATIVE-PROFILE).
 *
 * Scope is the INTERNAL AIO OFFICE only. The public AIO website keeps its darker cinematic direction, CLIENT OFFICE keeps
 * its own approved rules, and the IFTA and client-migration authorities stay protected. All of them share the AIO brand.
 */
import type { CreativeDirectionProfile } from '../../creative-direction.js';

export const AIO_OFFICE_PROFILE_SCOPE = {
  applies_to: ['AIO OFFICE (internal staff / founder office): HOME · INTAKE · WORK · REPORTS · MORE'],
  does_not_apply_to: [
    'PUBLIC AIO website — may keep its darker, more cinematic presentation',
    'CLIENT OFFICE — keeps its own approved composition, sharing the AIO brand identity',
  ],
  protected: [
    'AIO.IFTA authority bundle (founder-approved, grandfathered)',
    'AIO client migration authorities (AIO_CLIENT_MIGRATION_AUTHORITY + responsive blueprint)',
  ],
  shared_across_aio: ['AIO mark and lockups', 'tagline WHERE BUSINESS MEETS THE ROAD.', 'black / gold / silver brand colours', 'AIO uppercase law'],
} as const;

export const AIO_OFFICE_CREATIVE_DIRECTION_PROFILE: CreativeDirectionProfile = {
  profile_id: 'AIO.OFFICE.CREATIVE_DIRECTION.v1',
  project_id: 'AIO',
  brand_lines: ['WHERE BUSINESS MEETS THE ROAD.', 'THE BUSINESS OFFICE BEHIND THE TRUCK.', 'FROM STARTUP TO EVERY MILE AFTER.'],
  product_philosophy: [
    'The internal office is where AIO staff run every client’s business: HOME orients, INTAKE brings clients in, WORK produces, REPORTS oversees, MORE administers.',
    'Truth over decoration: every figure is backed by source truth or shown as an honest state — never a placeholder number.',
    'The next action is one tap away: attention first, then the work, then the history.',
    'One frame for everyone; what fills it depends on the person’s role and grants, never their name.',
  ],
  logo_system: {
    marks: ['AIO triangular interlocking mark — gold and black on light grounds (staff header); gold and silver metal in the full lockup'],
    lockups: [
      'Staff header lockup: mark + ALL IN ONE / ENTERPRISES INC. (horizontal)',
      'Full lockup: mark + ALL IN ONE + ENTERPRISES INC. + WHERE BUSINESS MEETS THE ROAD.',
      'Mark only',
    ],
    placement_rules: [
      'Header lockup top-left on every AIO OFFICE root, from phone to ultra-wide.',
      'Compact header and collapsed menu: mark only.',
      'Full lockup with the tagline only at the foot of the desktop menu or on sign-in.',
      'Never placed inside photography; never regenerated. A damaged mark is repaired by compositing the official asset.',
    ],
    forbidden: ['a gold dot above the I (the older aio-logo-lockup.png)', 'invented AIO wordmarks in photography (notebooks, signage, trailers)', 'invented client or partner emblems', 'redrawn or recoloured mark'],
    asset_paths: [
      'all-in-one-enterprises/public/migration/brand-lockup.png',
      'all-in-one-enterprises/public/brand/ifta/aio-mark-on-light.png',
      'all-in-one-enterprises/public/brand/ifta/aio-lockup-on-light.png',
      'all-in-one-enterprises/public/brand/ifta/aio-lockup-on-dark.png',
    ],
  },
  tagline_system: [
    'WHERE BUSINESS MEETS THE ROAD. — the brand line; carried by the full lockup.',
    'THE BUSINESS OFFICE BEHIND THE TRUCK. — the positioning; may sit in HOME’s welcome line.',
    'FROM STARTUP TO EVERY MILE AFTER. — the promise; public and onboarding surfaces, not daily office chrome.',
  ],
  color_world: [
    'OBSIDIAN / BLACK — the dock, the active tile, headline type',
    'GOLD — actions, the active state and single highlights; never decoration',
    'IVORY / CHAMPAGNE — the working surfaces under the photography',
    'WHITE / STONE — cards, rows and panels',
    'CHARCOAL / SILVER — secondary type, rules, the metal of the full lockup',
    'Semantic colours stay separate from brand gold: green on track, amber needs attention, oxblood blocked or overdue — always with a word',
  ],
  material_world: ['paper, folders and binders of a working office', 'truck chrome and brushed metal', 'asphalt, concrete and steel of freight yards', 'warm wood desks', 'glass and steel of modern terminals'],
  environment_world: ['cinematic transportation at golden hour and blue hour', 'modern freight terminals and fleet yards', 'working office desks in warm daylight', 'open highways under mountains', 'real workshops with real equipment'],
  object_language: [
    'Photography carries the service’s world; the working surface carries the business truth.',
    'One photograph per WORK lane, its subject specific to that service; no two lanes share a scene.',
    'Paperwork appears as real objects with no legible generated text.',
    'People are professionals at work with their faces visible; never masked.',
  ],
  typography_direction: [
    'DISPLAY: Roboto Condensed, bold, tight leading — headlines, card titles, section titles, labels (the migration family face).',
    'TEXT: Roboto — rows, descriptions, running text.',
    'ALL visible text UPPERCASE (AIO uppercase law; password fields are the only exception).',
    'Phone minimums: 12 px for secondary text, 11 px for tracked labels; tabular figures for counts and dates.',
  ],
  graphic_design_rules: [
    'Cinematic photography above, practical ivory working surfaces below.',
    'Black-and-gold five-item dock on phone and tablet; black-and-gold left menu on desktop: HOME · INTAKE · WORK · REPORTS · MORE.',
    'Square-rounded controls (8–10 px radius); only the identity avatar is round.',
    'Status by word and form (NEEDS ATTENTION, BLOCKED, NOT CONNECTED YET), never colour alone.',
    'One photograph per page: HOME’s welcome at about 60% of the reference height; WORK, REPORTS and MORE use slim bands.',
    'Sample figures in authority proofs carry a SAMPLE label; unsupported figures are drawn as honest states.',
    'Desktop and tablet are their own compositions inside the approved staff frame — never an enlarged phone.',
  ],
  wit_definition: 'The road and the office meet on every page: the photograph shows the service out in the world, the surface below shows the business behind it. Never jokes, cute copy or novelty UI.',
  must_not_become: [
    'a generic SaaS dashboard',
    'a dark trading terminal',
    'a plain white list app',
    'a stock-photo marketing site',
    'the PUBLIC AIO website (its own darker direction)',
    'the CLIENT OFFICE (its own approved rules)',
  ],
  anti_generic_rules: [
    'No KPI tiles with sparklines that imply history the system does not keep.',
    'No glassmorphism, no gradient heroes, no random gold accents.',
    'No identical photographs for different services.',
    'No emoji or decorative icon noise.',
    'No full-width stretched phone cards on wide screens.',
  ],
  anti_ai_rules: [
    'No legible generated text on paperwork, screens, clipboards or signage.',
    'No invented logos, marks or emblems; the AIO mark is composited from the official asset.',
    'No masked or anatomically wrong people.',
    'No near-duplicate scenes across lanes.',
    'Image generation supplies photography plates only; product UI, copy, figures, logo and navigation are assembled deterministically (HYBRID_HARD_RULE).',
  ],
  renderer: {
    model: 'gpt-image-2.5-sunburst',
    quality: 'up to 2048 px per plate (Figma image generation)',
    aspect_ratio: 'per plate: 16:9 heroes and bands, 3:2 lane cards',
    auto_enhance: false,
    viewport_mapping: 'Plates are photography layers cropped by the layout (object-fit: cover) at phone 390, tablet 834, desktop 1440 and ultra-wide 2560 px; the subject sits in the central 60% so every crop keeps it.',
    generation_mode: 'TEXT_TO_IMAGE',
    forbidden_providers: ['OpenArt'],
    local_render_allowed_as_final: true,
  },
  provenance: [
    'founder four-screen design: docs/aio/office-design-reconciliation/reference/AIO_OFFICE_FOUR_SCREEN_REFERENCE.png (sha256 47343139…)',
    'founder sprint FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1 §03 D-CREATIVE-PROFILE: internal office only; public, client, IFTA and migration keep their directions',
    'motherboard: AIO uppercase law; IFTA lockups and plates; migration responsive blueprint (staff frame)',
    'hybrid-authority.ts HYBRID_HARD_RULE: generated art layers + deterministic UI assembly = composite authority',
  ],
};
