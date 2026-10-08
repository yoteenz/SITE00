/**
 * JURNL five-level creative grammar
 * (P0.JURNL.CREATIVE-WORLD.BESPOKE-COMPOSITION-GRAMMAR-LOCK1).
 *
 * Source of truth for future authority generation. The committed manifest is
 * JURNL/MANIFEST/JURNL_CREATIVE_GRAMMAR.json and must match this object.
 *
 * This is the method. Each family still needs its own artifact language.
 * Mediterranean rooms, paper texture, olive, busts, and torn edges are ingredients.
 * They do not count as the design.
 */
export const JURNL_CREATIVE_GRAMMAR_ID = 'JURNL.CREATIVE_GRAMMAR.v1' as const;

export const JURNL_CREATIVE_GRAMMAR_SPRINT = 'P0.JURNL.CREATIVE-WORLD.BESPOKE-COMPOSITION-GRAMMAR-LOCK1' as const;

export const JURNL_CREATIVE_GRAMMAR_FLAGS = {
  composition_driven: true,
  environment_driven: true,
  artifact_driven: true,
  material_collision_required: true,
  graphic_expression_required: true,
  centered_card_default_forbidden: true,
  mediterranean_only_not_sufficient: true,
  art_history_as_structure_not_decoration: true,
  bespoke_object_system_required: true,
  asymmetry_required: true,
  unexpected_object_relationship_required: true,
} as const;

export const JURNL_CREATIVE_LEVELS = [
  {
    level: 1,
    id: 'COMPOSITION',
    rule: 'Every parent has a compositional thesis: where things sit, how they overlap, how the eye moves. A centered card is not a thesis.',
  },
  {
    level: 2,
    id: 'ENVIRONMENT',
    rule: 'The room participates in the page meaning. It is not generic decor behind the artifact.',
  },
  {
    level: 3,
    id: 'ARTIFACT',
    rule: 'The primary interaction is a physically distinct artifact. Do not reuse the same deckled-sheet silhouette for every screen.',
  },
  {
    level: 4,
    id: 'MATERIAL_RELATIONSHIP',
    rule: 'Every parent has an intentional material collision that reinforces the meaning.',
  },
  {
    level: 5,
    id: 'GRAPHIC_EXPRESSION',
    rule: 'Torn edges, stamps, emboss, tabs, ribbons, and prints are selective. They do not compensate for a weak composition.',
  },
] as const;

/** Shared world assets. They may recur. Layouts may not. */
export const JURNL_BESPOKE_OBJECT_LIBRARY = [
  'JURNL linen folio',
  'JURNL embossed olive seal',
  'JURNL burgundy ribbon',
  'JURNL brass clip',
  'JURNL credential card',
  'JURNL archival tab',
  'JURNL correspondence envelope',
  'JURNL security index',
  'JURNL private dossier',
  'JURNL registration mark',
  'JURNL marble paperweight',
] as const;

export const JURNL_CREATIVE_GRAMMAR_FAMILIES = [
  'ENTRY',
  'SETUP',
  'TODAY',
  'ACTIVITY',
  'MONEY',
  'INCOME',
  'UPCOMING',
  'PLAN',
  'SAFE TO SPEND',
  'PURCHASES',
  'TRIPS',
  'CREDIT',
  'PAYDOWN',
  'GOALS',
  'AHEAD',
  'RECORDS',
] as const;

export const JURNL_CREATIVE_GRAMMAR_FAIL_IF = [
  'Creative direction appears only in props, paper texture, foliage, or decorative fragments.',
  'The page can be described as a paper panel centered over a Mediterranean background.',
  'Art-history objects are repeated as the same bust beside the same card.',
  'A family copies another family’s artifact language. The grammar is shared. The expression is not.',
] as const;

export const JURNL_CREATIVE_GRAMMAR_PASS_IF = [
  'Hiding the live text still leaves a bespoke editorial campaign image.',
  'Blurred type still distinguishes sibling parents by silhouette, space, environment, contrast, and material.',
  'The environment, the artifact, and the material collision are one composition.',
] as const;

/**
 * ENTRY 01–07 stay the approved authorities.
 * 08–14 are the first reconstruction under this grammar. Descendants stay blocked until founder review.
 */
export const JURNL_ENTRY_RECONSTRUCTION = {
  retain: ['01_WELCOME', '02_VALUE_PROPOSITION', '03_KEY_BENEFITS', '04_GET_STARTED', '05_CREATE_ACCOUNT', '06_EMAIL_VERIFICATION', '07_SIGN_IN'],
  rework: [
    {
      screen_id: '08_BIOMETRIC_SETUP',
      thesis: 'PRIVATE IDENTITY RITUAL',
      composition: 'Lower-weighted. Embossed credential lying on a dark stone vanity. Open plaster above. Not an upright card.',
      environment: 'Intimate access table. Reflective stone. Cropped relief.',
      artifact: 'Embossed identity plaque and a brass access token.',
      material_collision: 'Polished dark green marble, linen paper, brass.',
      art_history: 'Cropped sculptural profile.',
    },
    {
      screen_id: '09_DEVICE_TRUST',
      thesis: 'PRIVATE TRAVEL CHECKPOINT',
      composition: 'Open passport folio at an angle, with a stamped slip. Not the biometric vanity.',
      environment: 'Leather travel desk. Identity checkpoint.',
      artifact: 'Stamped passport-style credential and a clipped registration slip.',
      material_collision: 'Aged leather, cream paper, wax seal, metal.',
      art_history: 'Antiquarian map fragment.',
    },
    {
      screen_id: '10_FORGOT_PASSWORD',
      thesis: 'RECOVERY LETTER',
      composition: 'Correspondence still life. The email field lives on a return slip, not on one centered sheet.',
      environment: 'Quiet recovery desk.',
      artifact: 'Open envelope, partially exposed letter, separate return card.',
      material_collision: 'Soft paper, burgundy thread, brass letter opener.',
      art_history: 'Museum postcard fragment.',
    },
    {
      screen_id: '11_RESET_PASSWORD',
      thesis: 'REISSUED CREDENTIAL',
      composition: 'Open bifold folio. New record inset beside a cancelled edge. Not the create-account sheet.',
      environment: 'Formal credential atelier.',
      artifact: 'Replacement credential with a brass registration bar.',
      material_collision: 'Linen folio, brass bar, green marble.',
      art_history: 'Registration engraving.',
    },
    {
      screen_id: '12_PRIVACY_PRIMER',
      thesis: 'SEALED PRIVATE DOSSIER',
      composition: 'Partially opened folder with stacked inserts. Content across several paper edges. Soft and personal.',
      environment: 'Archive table.',
      artifact: 'Bound dossier closed by a burgundy ribbon and a privacy seal.',
      material_collision: 'Layered archival paper, burgundy ribbon, stone.',
      art_history: 'Classical archival fragment.',
    },
    {
      screen_id: '13_SECURITY_PRIMER',
      thesis: 'INDEXED SECURITY REGISTER',
      composition: 'Tabbed ledger with numbered sections. Architectural and ordered. Not the privacy folder.',
      environment: 'Indexed record surface.',
      artifact: 'Security index with tabs and a brass fastener.',
      material_collision: 'Structured card stock, black ink, dark green marble, brass.',
      art_history: 'Architectural engraving.',
    },
    {
      screen_id: '14_ENTRY_COMPLETE',
      thesis: 'THRESHOLD ARRIVAL',
      composition: 'The world opens. Invitation in the foreground. Light beyond. Sculpture behind the opening, not beside the card. Not a copy of welcome.',
      environment: 'Stone threshold into the next room.',
      artifact: 'Arrival invitation resting on travertine.',
      material_collision: 'Travertine, velvet, luminous opening, paper.',
      art_history: 'Carved opening. The sculpture is behind the light.',
    },
  ],
  descendant_generation: 'BLOCKED_PENDING_FOUNDER_APPROVAL',
} as const;

export const JURNL_CREATIVE_GRAMMAR = {
  id: JURNL_CREATIVE_GRAMMAR_ID,
  sprint: JURNL_CREATIVE_GRAMMAR_SPRINT,
  doctrine: 'PHYSICAL EDITORIAL EXPERIENCES THAT HAPPEN TO FUNCTION AS PRODUCT INTERFACES.',
  flags: JURNL_CREATIVE_GRAMMAR_FLAGS,
  levels: JURNL_CREATIVE_LEVELS,
  object_library: JURNL_BESPOKE_OBJECT_LIBRARY,
  families: JURNL_CREATIVE_GRAMMAR_FAMILIES,
  family_expression_rule: 'The five-level grammar is shared. Each family invents its own artifact language. MONEY, CREDIT, PLAN, SETUP, and RECORDS must not look like ENTRY.',
  fail_if: JURNL_CREATIVE_GRAMMAR_FAIL_IF,
  pass_if: JURNL_CREATIVE_GRAMMAR_PASS_IF,
  plate_rule: 'Page authority first. The plate keeps the set, objects, collisions, fragments, foreground, shadows, perspective, and crop, and removes live product UI. The plate must still read as a JURNL campaign image.',
  entry: JURNL_ENTRY_RECONSTRUCTION,
} as const;

export type JurnlCreativeGrammarCheck = {
  status: 'GRAMMAR_LOCKED' | 'GRAMMAR_INCOMPLETE';
  issues: string[];
};

export function checkJurnlCreativeGrammar(grammar: typeof JURNL_CREATIVE_GRAMMAR = JURNL_CREATIVE_GRAMMAR): JurnlCreativeGrammarCheck {
  const issues: string[] = [];
  for (const [key, value] of Object.entries(grammar.flags)) {
    if (value !== true) issues.push(`${key} must be true`);
  }
  if (grammar.levels.length !== 5) issues.push('five levels required');
  if (grammar.families.length !== JURNL_CREATIVE_GRAMMAR_FAMILIES.length) issues.push('family inheritance list drifted');
  if (grammar.object_library.length < 8) issues.push('bespoke object library is too thin');
  if (grammar.entry.rework.length !== 7) issues.push('ENTRY 08–14 reconstruction theses missing');
  if (grammar.entry.descendant_generation !== 'BLOCKED_PENDING_FOUNDER_APPROVAL') issues.push('descendants are not blocked');
  return { status: issues.length ? 'GRAMMAR_INCOMPLETE' : 'GRAMMAR_LOCKED', issues };
}
