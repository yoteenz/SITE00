/**
 * Builder presentation registries. Client language only.
 *
 * Structural archetypes, world archetypes and visual systems are the estimator's own registries
 * (`src/studioos/estimation/registries.ts`). This file adds what a client needs to recognise them (behaviour,
 * navigation character, ideal use, composition logic) and never restates estimator weights. Preview assets stay
 * null until a real authority exists: the Builder shows a schematic, never an invented sample.
 */
import {
  STRUCTURAL_ARCHETYPES,
  VISUAL_SYSTEMS,
  WORLD_ARCHETYPES,
} from '../../studioos/estimation/registries';
import type {
  FeatureId,
  FamilyClass,
  StructuralArchetypeId,
  VisualSystemId,
  WorldArchetypeId,
} from '../../studioos/estimation/types';
import type {
  BuildKind,
  CapabilityId,
  ColorDirectionId,
  ExperienceDepth,
  ExperienceId,
  ImageWorldId,
  MotionCharacterId,
  TypeDirectionId,
} from './types';

export const BUILDER_CONTRACT_VERSION = '0.1.0' as const;
export const BUILDER_SPRINT = 'P0.SITE00.BUILDER.TEMPLATE-AND-ESTIMATE-SELECTION-EXPERIENCE1' as const;
export const BUILDER_DOCTRINE = 'TEMPLATES PROVIDE GRAMMAR, NOT IDENTITY.' as const;

/** Preview slots. Null until an approved authority exists for that grammar or system. */
export type PreviewSlots = { mobile: null; desktop: null; spatial: null };
const NO_PREVIEW: PreviewSlots = { mobile: null, desktop: null, spatial: null };

/* ─────────────────────────────── 01 BUILD ─────────────────────────────── */

export const BUILD_KINDS: readonly {
  id: BuildKind;
  label: string;
  question: string;
  promise: string;
  examples: string[];
  changesDownstream: string;
}[] = [
  { id: 'SITE', label: 'SITE', question: 'A place people visit.', promise: 'One focused digital location built around how your visitors move.', examples: ['A studio or practice', 'A shop', 'A restaurant or stay', 'A publication'], changesDownstream: 'Structure offers the eight site grammars.' },
  { id: 'WORLD', label: 'WORLD', question: 'A place people explore.', promise: 'A spatial environment with places, moments and things to do.', examples: ['A brand world', 'A showroom', 'An exhibition', 'A story told in space'], changesDownstream: 'The Builder changes shape: world form, places, life, depth and wayfinding replace page structure.' },
  { id: 'SYSTEM', label: 'SYSTEM', question: 'A place people work.', promise: 'A signed-in product with jobs to do, roles and live information.', examples: ['A client portal', 'An operations dashboard', 'A members platform'], changesDownstream: 'Structure leads with the Portal grammar; capabilities and signed-in experiences come forward.' },
  { id: 'HYBRID', label: 'HYBRID', question: 'More than one of these.', promise: 'A site with a world inside it, or a site with a working system behind it.', examples: ['A shop with a showroom world', 'A brand site with a client portal'], changesDownstream: 'Choose the parts. Each part brings its own steps.' },
];

/* ─────────────────────────────── 02 STRUCTURE ─────────────────────────────── */

export type StructurePresentation = {
  id: StructuralArchetypeId;
  label: string;
  summary: string;
  behavior: string;
  navigationCharacter: string;
  idealFor: string[];
  compositionLogic: string;
  /** Named schematic the Builder draws (structure is layout logic, so a schematic is truthful). */
  schematic: string;
  scopeHint: 'LIGHTER' | 'MIDDLE' | 'DEEPER';
  compatibleExpressions: VisualSystemId[];
  starterExperiences: ExperienceId[];
  /** Offered, off by default. */
  optionalExperiences: ExperienceId[];
  preview: PreviewSlots;
};

const STRUCTURE_COPY: Record<StructuralArchetypeId, Omit<StructurePresentation, 'id' | 'label' | 'summary' | 'scopeHint' | 'compatibleExpressions' | 'preview'>> = {
  EDITORIAL: { behavior: 'Reading leads. A few lead stories, a steady index, and an archive that grows.', navigationCharacter: 'Quiet index, return-to-contents, read next.', idealFor: ['Publications', 'Studios with a point of view', 'Founders who write'], compositionLogic: 'Lead story → index → story → read next.', schematic: 'COLUMN_OF_STORIES', starterExperiences: ['HOME', 'STORIES', 'STORY', 'ABOUT', 'CONTACT'], optionalExperiences: ['ARCHIVE', 'EVENTS'] },
  GALLERY: { behavior: 'Work shown as a sequence of rooms or plates. Each piece gets space.', navigationCharacter: 'Room to room, previous / next, a quiet index.', idealFor: ['Artists and photographers', 'Architects', 'Collections'], compositionLogic: 'Entrance → room → piece → next room.', schematic: 'SEQUENCE_OF_ROOMS', starterExperiences: ['HOME', 'WORK', 'PIECE', 'ABOUT', 'CONTACT'], optionalExperiences: ['JOURNAL'] },
  COMMERCE: { behavior: 'A place that sells. Catalog, product and checkout carry the structure.', navigationCharacter: 'Browse, filter, product, bag. Always one tap from the bag.', idealFor: ['Product brands', 'Small-batch makers', 'Drops and collections'], compositionLogic: 'Collection → product → bag → checkout.', schematic: 'CATALOG_TO_CHECKOUT', starterExperiences: ['HOME', 'SHOP', 'PRODUCT', 'CHECKOUT', 'ABOUT', 'CARE'], optionalExperiences: ['JOURNAL'] },
  SERVICE: { behavior: 'A practice. What you offer, proof that it works, and a clear way to begin.', navigationCharacter: 'Short and direct. Offer, proof, begin.', idealFor: ['Consultants and agencies', 'Clinics and studios', 'Trades and professionals'], compositionLogic: 'Promise → offer → proof → begin.', schematic: 'OFFER_PROOF_BEGIN', starterExperiences: ['HOME', 'SERVICES', 'PROOF', 'ABOUT', 'CONTACT'], optionalExperiences: ['JOURNAL'] },
  PORTAL: { behavior: 'People sign in to get work done. Status, records and next actions lead.', navigationCharacter: 'Persistent app navigation, a home of what needs you.', idealFor: ['Client portals', 'Operations tools', 'Member dashboards'], compositionLogic: 'Sign in → what needs me → the record → the action.', schematic: 'SIGNED_IN_WORKBENCH', starterExperiences: ['ENTRY', 'DASHBOARD', 'RECORDS', 'ACCOUNT', 'SETTINGS'], optionalExperiences: ['FILES', 'PEOPLE'] },
  HOSPITALITY: { behavior: 'A stay, a table or a visit. The place itself leads and booking is always near.', navigationCharacter: 'Atmosphere first, then the offer, with book always present.', idealFor: ['Restaurants and bars', 'Hotels and retreats', 'Venues'], compositionLogic: 'The place → the offer → book → visit.', schematic: 'PLACE_THEN_BOOK', starterExperiences: ['HOME', 'THE_PLACE', 'OFFER', 'VISIT'], optionalExperiences: ['JOURNAL', 'EVENTS'] },
  COMMUNITY: { behavior: 'People come back. Membership and shared spaces lead.', navigationCharacter: 'A feed or gathering place, your profile, what is happening next.', idealFor: ['Member clubs', 'Courses and cohorts', 'Fan communities'], compositionLogic: 'Join → gather → contribute → return.', schematic: 'GATHERING_PLACE', starterExperiences: ['HOME', 'MEMBERSHIP', 'COMMUNITY', 'ACCOUNT'], optionalExperiences: ['EVENTS', 'JOURNAL'] },
  HYBRID: { behavior: 'Two grammars in one build, each leading its own part.', navigationCharacter: 'Set by the primary grammar; the second has its own wing.', idealFor: ['A practice that also sells', 'A publication with a shop'], compositionLogic: 'Primary grammar with a second grammar as a wing.', schematic: 'TWO_WINGS', starterExperiences: ['HOME', 'ABOUT', 'CONTACT'], optionalExperiences: [] },
};

const SCOPE_HINT: Record<'LIGHT' | 'STANDARD' | 'ADVANCED' | 'SYSTEM', StructurePresentation['scopeHint']> = {
  LIGHT: 'LIGHTER',
  STANDARD: 'MIDDLE',
  ADVANCED: 'DEEPER',
  SYSTEM: 'DEEPER',
};

export const STRUCTURES: readonly StructurePresentation[] = STRUCTURAL_ARCHETYPES.map((item) => ({
  id: item.id,
  label: item.label,
  summary: item.summary,
  scopeHint: SCOPE_HINT[item.typicalClass],
  compatibleExpressions: [...item.compatibleVisualSystems],
  preview: NO_PREVIEW,
  ...STRUCTURE_COPY[item.id],
}));

export const STRUCTURE_BY_ID: Record<StructuralArchetypeId, StructurePresentation> = Object.fromEntries(
  STRUCTURES.map((item) => [item.id, item]),
) as Record<StructuralArchetypeId, StructurePresentation>;

/* ─────────────────────────────── 02W WORLD FORM ─────────────────────────────── */

const WORLD_COPY: Record<WorldArchetypeId, { movement: string; idealFor: string; schematic: string }> = {
  ESTATE: { movement: 'Arrive, then choose between a few distinct places on one held ground.', idealFor: 'A brand house, a maison, a flagship.', schematic: 'GROUNDS_WITH_PAVILIONS' },
  PROMENADE: { movement: 'A linear walk. Moving forward is the experience.', idealFor: 'A launch, an exhibition, a collection story.', schematic: 'LINEAR_WALK' },
  HUB: { movement: 'A center you return to, with spokes out to each destination.', idealFor: 'A multi-offer brand, a studio with many services.', schematic: 'CENTER_AND_SPOKES' },
  DISTRICT: { movement: 'Several neighbourhoods, each with its own character.', idealFor: 'A group of brands, a festival, a campus.', schematic: 'NEIGHBOURHOODS' },
  SANCTUARY: { movement: 'A quiet enclosed world. Slow, few exits.', idealFor: 'Wellness, ritual, meditation, luxury retreat.', schematic: 'ENCLOSED_GARDEN' },
  SHOWROOM: { movement: 'Objects presented in space. Walk up to a piece and look closer.', idealFor: 'Products, vehicles, furniture, fashion.', schematic: 'OBJECTS_ON_PLINTHS' },
  SOCIAL: { movement: 'Other people are part of the place.', idealFor: 'Live events, member spaces, communities.', schematic: 'SHARED_PLAZA' },
  STORY: { movement: 'The world is sequenced. Chapters unlock in order.', idealFor: 'Narrative launches, games, guided journeys.', schematic: 'CHAPTERS' },
  HYBRID_WORLD: { movement: 'More than one world form joined together.', idealFor: 'Large worlds with distinct regions.', schematic: 'JOINED_FORMS' },
};

export const WORLD_FORMS = WORLD_ARCHETYPES.map((item) => ({
  id: item.id,
  label: item.label,
  summary: item.summary,
  preview: NO_PREVIEW,
  ...WORLD_COPY[item.id],
}));

/* ─────────────────────────────── 03 EXPRESSION ─────────────────────────────── */

export type ExpressionPresentation = {
  id: VisualSystemId;
  label: string;
  summary: string;
  feels: string;
  composition: string;
  typography: string;
  imagery: string;
  materiality: string;
  spacing: string;
  iconography: string;
  objectLanguage: string;
  motionCharacter: string;
  defaults: { type: TypeDirectionId; color: ColorDirectionId; imageWorld: ImageWorldId; motion: MotionCharacterId };
  compatibleStructures: StructuralArchetypeId[];
  preview: PreviewSlots;
};

const EXPRESSION_COPY: Record<VisualSystemId, Omit<ExpressionPresentation, 'id' | 'label' | 'summary' | 'compatibleStructures' | 'preview'>> = {
  EDITORIAL_OBJECT: { feels: 'Considered, literate, collected.', composition: 'Type-led pages with one physical object as the focal point.', typography: 'Serif headlines, generous measure, small precise labels.', imagery: 'Single objects photographed with care.', materiality: 'Paper, ink, a few real surfaces.', spacing: 'Wide margins, deliberate pauses.', iconography: 'Almost none; words do the work.', objectLanguage: 'One object per page, like a plate in a book.', motionCharacter: 'Editorial: page turns and gentle reveals.', defaults: { type: 'EDITORIAL_SERIF', color: 'WARM_MINERAL', imageWorld: 'PRODUCT_LED', motion: 'EDITORIAL' } },
  ARCHITECTURAL_MINIMAL: { feels: 'Calm, exact, structural.', composition: 'Grid and light. Space is the main material.', typography: 'Clean grotesk, few sizes, strong alignment.', imagery: 'Spaces and light, architectural crops.', materiality: 'Concrete, glass, daylight.', spacing: 'Strict grid, large quiet fields.', iconography: 'Thin, geometric, sparing.', objectLanguage: 'Planes and edges instead of objects.', motionCharacter: 'Quiet: fades and measured slides.', defaults: { type: 'MODERN_GROTESK', color: 'NEUTRAL_ARCHITECTURAL', imageWorld: 'ARCHITECTURAL', motion: 'QUIET' } },
  CINEMATIC_LUXURY: { feels: 'Dramatic, controlled, expensive.', composition: 'Wide frames, sequences, one subject at a time.', typography: 'Expressive display with restrained body.', imagery: 'Cinematic stills and film.', materiality: 'Deep shadow, metal, velvet light.', spacing: 'Full-bleed frames with tight captions.', iconography: 'Minimal and refined.', objectLanguage: 'The frame is the object.', motionCharacter: 'Cinematic: slow reveals and sequenced scenes.', defaults: { type: 'EXPRESSIVE_DISPLAY', color: 'DEEP_CINEMATIC', imageWorld: 'PHOTOGRAPHIC', motion: 'CINEMATIC' } },
  SOFT_ORGANIC: { feels: 'Warm, human, unhurried.', composition: 'Soft shapes, layered planes, natural rhythm.', typography: 'Humanist sans, friendly proportions.', imagery: 'Plants, hands, textures, daylight.', materiality: 'Linen, clay, wood, paper.', spacing: 'Relaxed, rounded, breathable.', iconography: 'Soft line, rounded ends.', objectLanguage: 'Natural forms and textures.', motionCharacter: 'Quiet with soft easing.', defaults: { type: 'HUMANIST_SANS', color: 'SOFT_ORGANIC', imageWorld: 'PHOTOGRAPHIC', motion: 'QUIET' } },
  INDUSTRIAL_COMMAND: { feels: 'Capable, dense, in control.', composition: 'Panels, readouts, clear status.', typography: 'Mono and condensed sans, data-first.', imagery: 'Machines, places of work, diagrams.', materiality: 'Steel, signal colour, matte surfaces.', spacing: 'Dense but ordered.', iconography: 'Functional, systematic.', objectLanguage: 'Instruments and indicators.', motionCharacter: 'Kinetic: snappy state changes.', defaults: { type: 'MONO_SYSTEMIC', color: 'HIGH_CONTRAST_MONO', imageWorld: 'ARCHITECTURAL', motion: 'KINETIC' } },
  POP_EDITORIAL: { feels: 'Loud, playful, confident.', composition: 'Editorial structure with big graphic moves.', typography: 'Condensed display, big numbers, stickers of type.', imagery: 'Collage, cut-outs, bright product.', materiality: 'Print, colour fields, gloss.', spacing: 'Tight and energetic.', iconography: 'Bold, graphic, sometimes hand-made.', objectLanguage: 'Cut-outs and stamps.', motionCharacter: 'Kinetic: bounces, snaps, marquees.', defaults: { type: 'CONDENSED_DISPLAY', color: 'SATURATED_EDITORIAL', imageWorld: 'EDITORIAL_COLLAGE', motion: 'KINETIC' } },
};

export const EXPRESSIONS: readonly ExpressionPresentation[] = VISUAL_SYSTEMS.map((item) => ({
  id: item.id,
  label: item.label,
  summary: item.summary,
  compatibleStructures: [...item.compatibleArchetypes],
  preview: NO_PREVIEW,
  ...EXPRESSION_COPY[item.id],
}));

export const EXPRESSION_BY_ID: Record<VisualSystemId, ExpressionPresentation> = Object.fromEntries(
  EXPRESSIONS.map((item) => [item.id, item]),
) as Record<VisualSystemId, ExpressionPresentation>;

/* ─────────────────────────────── 04 TYPE ─────────────────────────────── */

export const TYPE_DIRECTIONS: readonly { id: TypeDirectionId; label: string; speaks: string; inContext: string; approvedTypeSystem: null }[] = [
  { id: 'EDITORIAL_SERIF', label: 'Editorial serif', speaks: 'Literate and assured.', inContext: 'Headlines read like a magazine cover; body reads like a book.', approvedTypeSystem: null },
  { id: 'MODERN_GROTESK', label: 'Modern grotesk', speaks: 'Clear and contemporary.', inContext: 'Neutral headlines that let space and image lead.', approvedTypeSystem: null },
  { id: 'HUMANIST_SANS', label: 'Humanist sans', speaks: 'Warm and approachable.', inContext: 'Friendly headlines with an open, easy body.', approvedTypeSystem: null },
  { id: 'CONDENSED_DISPLAY', label: 'Condensed display', speaks: 'Loud and graphic.', inContext: 'Tall, tight headlines that stack like posters.', approvedTypeSystem: null },
  { id: 'EXPRESSIVE_DISPLAY', label: 'Expressive display + restrained body', speaks: 'Dramatic, then quiet.', inContext: 'One characterful headline face over a calm reading face.', approvedTypeSystem: null },
  { id: 'MONO_SYSTEMIC', label: 'Mono / systemic', speaks: 'Precise and technical.', inContext: 'Labels and data in mono; everything lines up.', approvedTypeSystem: null },
  { id: 'HYBRID_PAIRING', label: 'Hybrid pairing', speaks: 'Two voices on purpose.', inContext: 'A serif and a grotesk sharing the page with clear roles.', approvedTypeSystem: null },
];

/* ─────────────────────────────── 05 COLOR ─────────────────────────────── */

export type ColorRelationship = { background: string; surface: string; accent: string; text: string; material: string };

/** Specimen values illustrate the relationship. They are a direction, not the client's palette. */
export const COLOR_DIRECTIONS: readonly { id: ColorDirectionId; label: string; feels: string; relationship: ColorRelationship; specimen: ColorRelationship | null }[] = [
  { id: 'NEUTRAL_ARCHITECTURAL', label: 'Neutral architectural', feels: 'Daylight on concrete.', relationship: { background: 'off-white plaster', surface: 'pale stone', accent: 'one graphite line', text: 'near-black', material: 'concrete, glass' }, specimen: { background: '#f2f1ee', surface: '#e2e0db', accent: '#3b3d40', text: '#17181a', material: '#b9b6ae' } },
  { id: 'WARM_MINERAL', label: 'Warm mineral', feels: 'Sun on sandstone.', relationship: { background: 'warm sand', surface: 'clay', accent: 'oxide', text: 'deep umber', material: 'travertine, terracotta' }, specimen: { background: '#efe6da', surface: '#dccab3', accent: '#9a4a2c', text: '#2b1d16', material: '#c2a383' } },
  { id: 'HIGH_CONTRAST_MONO', label: 'High-contrast monochrome', feels: 'Ink on paper, full volume.', relationship: { background: 'white', surface: 'white', accent: 'black', text: 'black', material: 'print, steel' }, specimen: { background: '#ffffff', surface: '#f1f1f1', accent: '#000000', text: '#0a0a0a', material: '#8d8d8d' } },
  { id: 'DEEP_CINEMATIC', label: 'Deep cinematic', feels: 'A dark room with one light.', relationship: { background: 'near-black', surface: 'charcoal', accent: 'warm metal', text: 'bone', material: 'velvet, brass, shadow' }, specimen: { background: '#0e0d0c', surface: '#1d1b19', accent: '#b8915a', text: '#ece6dc', material: '#4a3f33' } },
  { id: 'SOFT_ORGANIC', label: 'Soft organic', feels: 'Linen and leaves.', relationship: { background: 'oat', surface: 'linen', accent: 'moss', text: 'bark', material: 'wood, clay, plants' }, specimen: { background: '#f3efe6', surface: '#e6dfcf', accent: '#5f7150', text: '#2f2a22', material: '#a89272' } },
  { id: 'SATURATED_EDITORIAL', label: 'Saturated editorial', feels: 'A magazine that shouts.', relationship: { background: 'paper white', surface: 'one colour field', accent: 'a second, louder colour', text: 'ink', material: 'gloss print' }, specimen: { background: '#fbfaf6', surface: '#ffd23f', accent: '#ff3d2e', text: '#141414', material: '#2b59ff' } },
  { id: 'CUSTOM_BRAND_LED', label: 'Your brand colours', feels: 'Led by the brand you already have.', relationship: { background: 'from your brand', surface: 'from your brand', accent: 'from your brand', text: 'checked for contrast', material: 'from your brand' }, specimen: null },
];

/* ─────────────────────────────── 06 IMAGE WORLD ─────────────────────────────── */

export const IMAGE_WORLDS: readonly { id: ImageWorldId; label: string; people_see: string; sourcing: string; scopeHint: 'NONE' | 'SOME' | 'MORE' }[] = [
  { id: 'PHOTOGRAPHIC', label: 'Photographic', people_see: 'Real photography of people, places and work.', sourcing: 'Your photography, a shoot, or licensed images.', scopeHint: 'NONE' },
  { id: 'PRODUCT_LED', label: 'Product-led', people_see: 'The product, cleanly and often.', sourcing: 'Product photography you supply or commission.', scopeHint: 'NONE' },
  { id: 'ARCHITECTURAL', label: 'Architectural', people_see: 'Spaces, light and structure.', sourcing: 'Your spaces or commissioned architectural images.', scopeHint: 'NONE' },
  { id: 'EDITORIAL_COLLAGE', label: 'Editorial collage', people_see: 'Composed collages of image, type and texture.', sourcing: 'Designed by SITE 00 from your material.', scopeHint: 'SOME' },
  { id: 'ILLUSTRATIVE', label: 'Illustrative', people_see: 'Drawn worlds and characters.', sourcing: 'An illustration set made for the project.', scopeHint: 'SOME' },
  { id: 'MIXED_MEDIA', label: 'Mixed media', people_see: 'Photography, illustration and collage together.', sourcing: 'A combined art direction.', scopeHint: 'SOME' },
  { id: 'GENERATIVE', label: 'Generative', people_see: 'Original generated images in one consistent world.', sourcing: 'A repeatable generated-image pipeline with review on each asset.', scopeHint: 'MORE' },
  { id: 'SPATIAL_3D', label: '3D / spatial', people_see: 'Dimensional objects and scenes.', sourcing: '3D assets built for the project.', scopeHint: 'MORE' },
];

/* ─────────────────────────────── 07 MOTION ─────────────────────────────── */

export const MOTION_CHARACTERS: readonly { id: MotionCharacterId; label: string; behaves: string; demo: string; scopeHint: 'NONE' | 'SOME' | 'MORE' }[] = [
  { id: 'QUIET', label: 'Quiet', behaves: 'Things appear calmly. Motion never asks for attention.', demo: 'A soft fade as each section arrives.', scopeHint: 'NONE' },
  { id: 'EDITORIAL', label: 'Editorial', behaves: 'Motion follows reading: page turns, reveals, captions.', demo: 'A headline settles, then the image rises.', scopeHint: 'NONE' },
  { id: 'KINETIC', label: 'Kinetic', behaves: 'Snappy and graphic. Elements move with energy.', demo: 'Type slides in and snaps into place.', scopeHint: 'SOME' },
  { id: 'CINEMATIC', label: 'Cinematic', behaves: 'Sequenced like film. Scenes, holds and cuts.', demo: 'A wide frame slowly pushes in before the title.', scopeHint: 'MORE' },
  { id: 'SPATIAL', label: 'Spatial', behaves: 'You move through depth instead of down a page.', demo: 'The camera travels between rooms.', scopeHint: 'MORE' },
  { id: 'CUSTOM', label: 'Custom', behaves: 'Motion invented for this project.', demo: 'Defined with you during direction.', scopeHint: 'MORE' },
];

/* ─────────────────────────────── 08 FEATURES (capabilities) ─────────────────────────────── */

export type CapabilityPresentation = {
  id: CapabilityId;
  verb: string;
  plain: string;
  group: 'OFFER' | 'PEOPLE' | 'INFORMATION' | 'REACH' | 'ADVANCED';
  /** Canonical estimator features this capability brings. */
  features: FeatureId[];
  /** Other capabilities that come with it (shown as COMES WITH, never silently). */
  comesWith: CapabilityId[];
  addsExperiences: ExperienceId[];
};

export const CAPABILITIES: readonly CapabilityPresentation[] = [
  { id: 'SELL', verb: 'SELL', plain: 'Sell products with a catalog, bag and checkout.', group: 'OFFER', features: ['ECOMMERCE'], comesWith: ['PAYMENTS'], addsExperiences: ['SHOP', 'PRODUCT', 'CHECKOUT'] },
  { id: 'BOOK', verb: 'BOOK', plain: 'Take reservations or appointments.', group: 'OFFER', features: ['BOOKING'], comesWith: [], addsExperiences: ['BOOKING'] },
  { id: 'PAYMENTS', verb: 'TAKE PAYMENT', plain: 'Accept payments and send receipts.', group: 'OFFER', features: ['PAYMENTS'], comesWith: [], addsExperiences: [] },
  { id: 'MEMBERSHIP', verb: 'MEMBERSHIP', plain: 'Ongoing access for members.', group: 'PEOPLE', features: ['MEMBERSHIP'], comesWith: ['ACCOUNTS'], addsExperiences: ['MEMBERSHIP'] },
  { id: 'ACCOUNTS', verb: 'ACCOUNTS', plain: 'People sign in to their own space.', group: 'PEOPLE', features: ['AUTH_ACCOUNT'], comesWith: [], addsExperiences: ['ACCOUNT'] },
  { id: 'COMMUNITY', verb: 'COMMUNITY', plain: 'People talk to and see each other.', group: 'PEOPLE', features: ['COMMUNITY'], comesWith: ['ACCOUNTS'], addsExperiences: ['COMMUNITY'] },
  { id: 'TEAM_ROLES', verb: 'TEAM ROLES', plain: 'Different people see different things.', group: 'PEOPLE', features: ['USER_ROLES'], comesWith: ['ACCOUNTS'], addsExperiences: ['PEOPLE'] },
  { id: 'MARKETPLACE', verb: 'MARKETPLACE', plain: 'Several sellers or providers trade through your place.', group: 'ADVANCED', features: ['MARKETPLACE'], comesWith: ['PAYMENTS', 'ACCOUNTS', 'TEAM_ROLES'], addsExperiences: ['MARKETPLACE'] },
  { id: 'DASHBOARD', verb: 'DASHBOARD', plain: 'Live views of your information.', group: 'INFORMATION', features: ['DASHBOARDS', 'DATABASE'], comesWith: [], addsExperiences: ['DASHBOARD'] },
  { id: 'DATA_PORTAL', verb: 'DATA / PORTAL', plain: 'A signed-in place built around records and work.', group: 'INFORMATION', features: ['DATABASE'], comesWith: ['ACCOUNTS', 'DASHBOARD', 'TEAM_ROLES'], addsExperiences: ['RECORDS'] },
  { id: 'UPLOAD_FILES', verb: 'UPLOAD FILES', plain: 'People send you files.', group: 'INFORMATION', features: ['FILE_UPLOADS'], comesWith: [], addsExperiences: [] },
  { id: 'DOCUMENTS', verb: 'DOCUMENTS', plain: 'Documents people can find, share and sign off.', group: 'INFORMATION', features: ['DOCUMENT_MANAGEMENT'], comesWith: ['UPLOAD_FILES', 'ACCOUNTS'], addsExperiences: ['FILES'] },
  { id: 'EDIT_CONTENT', verb: 'EDIT IT YOURSELF', plain: 'You update text and images without us.', group: 'INFORMATION', features: ['CMS'], comesWith: [], addsExperiences: [] },
  { id: 'SEARCH', verb: 'SEARCH', plain: 'Find anything across the place.', group: 'INFORMATION', features: ['CUSTOM_SEARCH'], comesWith: [], addsExperiences: [] },
  { id: 'LIVE_UPDATES', verb: 'LIVE UPDATES', plain: 'Changes appear for everyone at once.', group: 'INFORMATION', features: ['REAL_TIME'], comesWith: [], addsExperiences: [] },
  { id: 'BRING_EXISTING_DATA', verb: 'BRING EXISTING DATA', plain: 'Move what you already have into the new place.', group: 'INFORMATION', features: ['DATA_MIGRATION'], comesWith: [], addsExperiences: [] },
  { id: 'NOTIFICATIONS', verb: 'NOTIFICATIONS', plain: 'Alerts inside the place.', group: 'REACH', features: ['NOTIFICATIONS'], comesWith: [], addsExperiences: [] },
  { id: 'EMAIL', verb: 'EMAIL', plain: 'Confirmations, receipts and lifecycle emails.', group: 'REACH', features: ['EMAIL_ENGINE'], comesWith: [], addsExperiences: [] },
  { id: 'MULTILINGUAL', verb: 'MULTILINGUAL', plain: 'More than one language.', group: 'REACH', features: ['MULTILINGUAL'], comesWith: [], addsExperiences: [] },
  { id: 'MEASURE', verb: 'MEASURE', plain: 'See how people use it.', group: 'REACH', features: ['ANALYTICS'], comesWith: [], addsExperiences: [] },
  { id: 'CUSTOM_INTEGRATIONS', verb: 'CONNECT YOUR TOOLS', plain: 'Talk to a system you already use.', group: 'ADVANCED', features: ['THIRD_PARTY_INTEGRATION'], comesWith: [], addsExperiences: [] },
  { id: 'AI', verb: 'AI', plain: 'An AI model inside the experience.', group: 'ADVANCED', features: ['AI_ASSISTED_FEATURES'], comesWith: [], addsExperiences: [] },
  { id: '3D', verb: '3D', plain: 'Dimensional objects or scenes.', group: 'ADVANCED', features: ['3D'], comesWith: [], addsExperiences: [] },
  { id: 'WORLD', verb: 'A WORLD INSIDE', plain: 'A spatial world as part of the place.', group: 'ADVANCED', features: ['WORLD_SPATIAL'], comesWith: [], addsExperiences: [] },
];

export const CAPABILITY_BY_ID: Record<CapabilityId, CapabilityPresentation> = Object.fromEntries(
  CAPABILITIES.map((item) => [item.id, item]),
) as Record<CapabilityId, CapabilityPresentation>;

/* ─────────────────────────────── 09 FAMILIES (experiences) ─────────────────────────────── */

export type ExperiencePresentation = {
  id: ExperienceId;
  label: string;
  group: 'FRONT DOOR' | 'WHAT YOU OFFER' | 'DOING THINGS' | 'SIGNED IN' | 'BEHIND THE SCENES';
  plain: string;
  /** Estimator family class (internal; never shown). */
  familyClass: FamilyClass;
  needsCapability?: CapabilityId;
};

export const EXPERIENCES: readonly ExperiencePresentation[] = [
  { id: 'HOME', label: 'Home', group: 'FRONT DOOR', plain: 'The first impression and the way in.', familyClass: 'LIGHT' },
  { id: 'ENTRY', label: 'Entry / sign in', group: 'FRONT DOOR', plain: 'The door to a signed-in place.', familyClass: 'LIGHT' },
  { id: 'ABOUT', label: 'About', group: 'FRONT DOOR', plain: 'Who you are and why it matters.', familyClass: 'LIGHT' },
  { id: 'CONTACT', label: 'Contact / begin', group: 'FRONT DOOR', plain: 'How someone starts with you.', familyClass: 'LIGHT' },
  { id: 'SERVICES', label: 'Services', group: 'WHAT YOU OFFER', plain: 'What you offer, clearly.', familyClass: 'LIGHT' },
  { id: 'PROOF', label: 'Proof / work', group: 'WHAT YOU OFFER', plain: 'Results, cases, testimonials.', familyClass: 'LIGHT' },
  { id: 'STORIES', label: 'Stories index', group: 'WHAT YOU OFFER', plain: 'The contents of what you publish.', familyClass: 'LIGHT' },
  { id: 'STORY', label: 'Story', group: 'WHAT YOU OFFER', plain: 'A single piece, beautifully read.', familyClass: 'STANDARD' },
  { id: 'ARCHIVE', label: 'Archive', group: 'WHAT YOU OFFER', plain: 'Everything you have published, findable.', familyClass: 'STANDARD' },
  { id: 'WORK', label: 'Work rooms', group: 'WHAT YOU OFFER', plain: 'Your work as a sequence of rooms.', familyClass: 'STANDARD' },
  { id: 'PIECE', label: 'Piece', group: 'WHAT YOU OFFER', plain: 'One work up close.', familyClass: 'LIGHT' },
  { id: 'THE_PLACE', label: 'The place', group: 'FRONT DOOR', plain: 'The atmosphere of the venue.', familyClass: 'LIGHT' },
  { id: 'OFFER', label: 'Menu / stays / offer', group: 'WHAT YOU OFFER', plain: 'What a guest can choose.', familyClass: 'STANDARD' },
  { id: 'VISIT', label: 'Visit', group: 'FRONT DOOR', plain: 'Where, when and how to arrive.', familyClass: 'LIGHT' },
  { id: 'JOURNAL', label: 'Journal', group: 'WHAT YOU OFFER', plain: 'News and stories over time.', familyClass: 'STANDARD' },
  { id: 'EVENTS', label: 'Events', group: 'WHAT YOU OFFER', plain: 'What is happening and when.', familyClass: 'STANDARD' },
  { id: 'SHOP', label: 'Shop', group: 'DOING THINGS', plain: 'Collections people browse.', familyClass: 'STANDARD', needsCapability: 'SELL' },
  { id: 'PRODUCT', label: 'Product', group: 'DOING THINGS', plain: 'One product, every detail.', familyClass: 'ADVANCED', needsCapability: 'SELL' },
  { id: 'CHECKOUT', label: 'Bag and checkout', group: 'DOING THINGS', plain: 'From bag to paid.', familyClass: 'STANDARD', needsCapability: 'SELL' },
  { id: 'CARE', label: 'Care / support', group: 'DOING THINGS', plain: 'Delivery, returns, questions.', familyClass: 'LIGHT' },
  { id: 'BOOKING', label: 'Booking', group: 'DOING THINGS', plain: 'Choose a time and confirm.', familyClass: 'STANDARD', needsCapability: 'BOOK' },
  { id: 'MEMBERSHIP', label: 'Membership', group: 'DOING THINGS', plain: 'Join, renew, manage a membership.', familyClass: 'STANDARD', needsCapability: 'MEMBERSHIP' },
  { id: 'COMMUNITY', label: 'Community', group: 'DOING THINGS', plain: 'Where members gather.', familyClass: 'ADVANCED', needsCapability: 'COMMUNITY' },
  { id: 'MARKETPLACE', label: 'Marketplace', group: 'DOING THINGS', plain: 'Listings, sellers and trades.', familyClass: 'SYSTEM', needsCapability: 'MARKETPLACE' },
  { id: 'ACCOUNT', label: 'Account', group: 'SIGNED IN', plain: 'A person’s own space and settings.', familyClass: 'STANDARD', needsCapability: 'ACCOUNTS' },
  { id: 'DASHBOARD', label: 'Dashboard', group: 'SIGNED IN', plain: 'What needs attention, live.', familyClass: 'SYSTEM', needsCapability: 'DASHBOARD' },
  { id: 'RECORDS', label: 'Records / work', group: 'SIGNED IN', plain: 'The records people work on.', familyClass: 'SYSTEM', needsCapability: 'DATA_PORTAL' },
  { id: 'FILES', label: 'Files', group: 'SIGNED IN', plain: 'Documents, organised and shared.', familyClass: 'SYSTEM', needsCapability: 'DOCUMENTS' },
  { id: 'PEOPLE', label: 'People and roles', group: 'BEHIND THE SCENES', plain: 'Who can see and do what.', familyClass: 'SYSTEM', needsCapability: 'TEAM_ROLES' },
  { id: 'SETTINGS', label: 'Settings', group: 'BEHIND THE SCENES', plain: 'How the place is run.', familyClass: 'LIGHT' },
];

export const EXPERIENCE_BY_ID: Record<ExperienceId, ExperiencePresentation> = Object.fromEntries(
  EXPERIENCES.map((item) => [item.id, item]),
) as Record<ExperienceId, ExperiencePresentation>;

/** Depth is how much of an experience gets designed. Shown in words; the count is internal. */
export const EXPERIENCE_DEPTHS: readonly { id: ExperienceDepth; label: string; plain: string; descendantCount: number }[] = [
  { id: 'ESSENTIAL', label: 'Essential', plain: 'The core views.', descendantCount: 3 },
  { id: 'FULL', label: 'Full', plain: 'Every state and sub-view people meet.', descendantCount: 8 },
  { id: 'EXTENSIVE', label: 'Extensive', plain: 'A large family of views and variations.', descendantCount: 16 },
];

/* ─────────────────────────────── 10 DELIVERY ─────────────────────────────── */

export const DELIVERY_COPY = {
  STANDARD: {
    label: 'Standard production',
    plain: 'Your project moves through production at the normal pace, with work running in parallel wherever the plan allows.',
  },
  PRIORITY: {
    label: 'Priority production',
    plain: 'SITE 00 reserves extra capacity for your project: more work in parallel, priority scheduling and a tighter review cadence.',
    whyNotHalf: 'Some work has to happen in order (blueprint, brand lock, integration, final checks, launch). Priority speeds up the parts that can run side by side, so it shortens the window without halving it.',
    notAvailable: 'Your project already runs at full concurrency, so reserving more capacity would not shorten it. Standard production is the fastest route for this scope.',
  },
  CUSTOM_SCHEDULE: {
    label: 'A date you need to hit',
    plain: 'Tell us the date. SITE 00 reviews whether the scope can meet it and proposes a schedule.',
  },
} as const;

/* ─────────────────────────────── 12 ESTIMATE language ─────────────────────────────── */

export const CONFIDENCE_LABELS = {
  EARLY: { label: 'INITIAL RANGE', plain: 'Based on your choices before anyone from SITE 00 has reviewed them. The range is wide on purpose.' },
  BLUEPRINT: { label: 'REFINED RANGE', plain: 'Based on a Blueprint SITE 00 has reviewed with you. The range is tighter.' },
  LOCKED: { label: 'CONFIRMED RANGE', plain: 'Scope is locked. The range is narrow. A production schedule is issued as its own document.' },
} as const;

export const DOCUMENT_LABELS = {
  ESTIMATE: 'BLUEPRINT ESTIMATE',
  QUOTE: 'QUOTE',
  LOCKED_SCHEDULE: 'PRODUCTION SCHEDULE',
} as const;

export const SCOPE_SIGNAL_COPY = {
  LIGHT: 'A focused build.',
  MODERATE: 'A considered build with some depth.',
  DEEP: 'A deep build with designed systems.',
  EXPANSIVE: 'A large product, world or platform.',
} as const;

/** Words the client never sees in Builder output. */
export const FORBIDDEN_CLIENT_TERMS = [
  'family unit', 'family units', ' fu ', 'raw production', 'lanes', 'serial', 'final price', 'guaranteed', 'rush',
] as const;
