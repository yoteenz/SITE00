/**
 * SITE 00 Builder — client selection contract (P0.SITE00.BUILDER.TEMPLATE-AND-ESTIMATE-SELECTION-EXPERIENCE1).
 *
 * What a client chooses in the visual Builder. Every id here is client language. The canonical estimator
 * (`src/studioos/estimation`) never sees these types directly: `toEstimateConfig` maps a selection onto the
 * estimator's own enums, and the estimator does all of the math.
 */
import type {
  BuildLevel,
  StructuralArchetypeId,
  VisualSystemId,
  WorldArchetypeId,
} from '../../studioos/estimation/types';

export type BuildKind = 'SITE' | 'WORLD' | 'SYSTEM' | 'HYBRID';
/** HYBRID combines two or three of these. */
export type BuildPart = 'SITE' | 'WORLD' | 'SYSTEM';

/** How fully an expression system is developed for this project. */
export type ExpressionEdition =
  /** The system's grammar used closely: its type, color and composition rules, standard motion. */
  | 'ESSENTIAL'
  /** The system developed for this project: page grammar, motion and assets designed here. */
  | 'FULL';

export type ExpressionFacet = 'COMPOSITION' | 'TYPE' | 'COLOR' | 'IMAGE' | 'MATERIAL' | 'MOTION';

export type TypeDirectionId =
  | 'EDITORIAL_SERIF'
  | 'MODERN_GROTESK'
  | 'HUMANIST_SANS'
  | 'CONDENSED_DISPLAY'
  | 'EXPRESSIVE_DISPLAY'
  | 'MONO_SYSTEMIC'
  | 'HYBRID_PAIRING';

export type ColorDirectionId =
  | 'NEUTRAL_ARCHITECTURAL'
  | 'WARM_MINERAL'
  | 'HIGH_CONTRAST_MONO'
  | 'DEEP_CINEMATIC'
  | 'SOFT_ORGANIC'
  | 'SATURATED_EDITORIAL'
  | 'CUSTOM_BRAND_LED';

export type ImageWorldId =
  | 'PHOTOGRAPHIC'
  | 'EDITORIAL_COLLAGE'
  | 'ILLUSTRATIVE'
  | 'GENERATIVE'
  | 'ARCHITECTURAL'
  | 'PRODUCT_LED'
  | 'SPATIAL_3D'
  | 'MIXED_MEDIA';

export type MotionCharacterId = 'QUIET' | 'EDITORIAL' | 'KINETIC' | 'CINEMATIC' | 'SPATIAL' | 'CUSTOM';

/** 'SYSTEM_DEFAULT' keeps the expression system's own choice for that dimension. */
export type Tunable<T extends string> = T | 'SYSTEM_DEFAULT';

export type CapabilityId =
  | 'SELL'
  | 'BOOK'
  | 'MEMBERSHIP'
  | 'ACCOUNTS'
  | 'DASHBOARD'
  | 'PAYMENTS'
  | 'UPLOAD_FILES'
  | 'DOCUMENTS'
  | 'NOTIFICATIONS'
  | 'EMAIL'
  | 'COMMUNITY'
  | 'MARKETPLACE'
  | 'MULTILINGUAL'
  | 'AI'
  | '3D'
  | 'WORLD'
  | 'DATA_PORTAL'
  | 'CUSTOM_INTEGRATIONS'
  | 'EDIT_CONTENT'
  | 'SEARCH'
  | 'MEASURE'
  | 'TEAM_ROLES'
  | 'LIVE_UPDATES'
  | 'BRING_EXISTING_DATA';

export type ExperienceId =
  | 'HOME'
  | 'ENTRY'
  | 'ABOUT'
  | 'CONTACT'
  | 'SERVICES'
  | 'PROOF'
  | 'STORIES'
  | 'STORY'
  | 'ARCHIVE'
  | 'WORK'
  | 'PIECE'
  | 'SHOP'
  | 'PRODUCT'
  | 'CHECKOUT'
  | 'CARE'
  | 'THE_PLACE'
  | 'OFFER'
  | 'BOOKING'
  | 'VISIT'
  | 'JOURNAL'
  | 'MEMBERSHIP'
  | 'COMMUNITY'
  | 'EVENTS'
  | 'ACCOUNT'
  | 'DASHBOARD'
  | 'RECORDS'
  | 'PEOPLE'
  | 'FILES'
  | 'SETTINGS'
  | 'MARKETPLACE';

export type ExperienceDepth = 'ESSENTIAL' | 'FULL' | 'EXTENSIVE';

export type ViewportChoice = 'PHONE_FIRST' | 'PHONE_AND_DESKTOP' | 'PHONE_TABLET_DESKTOP' | 'ADAPTIVE';

export type BrandReadiness = 'READY' | 'IN_PROGRESS' | 'NEEDS_IDENTITY';
export type ContentReadiness = 'READY' | 'PARTIAL' | 'NOT_YET';

export type WorldPlaces = 'FEW' | 'SEVERAL' | 'MANY';
export type WorldMoments = 'FEW' | 'MANY' | 'CINEMATIC';
export type WorldThingsToDo = 'LOOK' | 'TOUCH' | 'PLAY';
export type WorldInhabitants = 'NONE' | 'GUIDES' | 'CHARACTERS' | 'CROWDS';
export type WorldChange = 'STILL' | 'TIME_OF_DAY' | 'LIVING';
export type WorldDepth = 'FLAT' | 'LAYERED' | 'DIMENSIONAL' | 'FULLY_3D';
export type WorldWayfinding = 'GUIDED_PATH' | 'FREE_ROAM' | 'BOTH';

export type WorldSelection = {
  form: WorldArchetypeId;
  places: WorldPlaces;
  moments: WorldMoments;
  thingsToDo: WorldThingsToDo;
  inhabitants: WorldInhabitants;
  change: WorldChange;
  depth: WorldDepth;
  wayfinding: WorldWayfinding;
};

/** A part the client liked in an expression they did not choose ("I LIKE PARTS OF THIS"). */
export type LikedPart = { system: VisualSystemId; facet: ExpressionFacet };

export type ExpressionSelection = {
  /** 'CUSTOM' = NONE OF THESE / BUILD SOMETHING CUSTOM → custom creative direction. */
  primary: VisualSystemId | 'CUSTOM' | null;
  /** One secondary influence at most by default. */
  secondary: VisualSystemId | null;
  likedParts: LikedPart[];
  edition: ExpressionEdition;
  customDirectionNote?: string;
};

export type ExperienceChoice = { id: ExperienceId; depth: ExperienceDepth };

export type BuilderSelection = {
  build: BuildKind | null;
  /** HYBRID only: the parts being combined (two or three). */
  hybridParts: BuildPart[];
  /** Primary structural grammar (SITE, SYSTEM and the site part of HYBRID). */
  structure: StructuralArchetypeId | null;
  /** Second grammar when structure is HYBRID. */
  structureSecondary: StructuralArchetypeId | null;
  world: WorldSelection | null;
  expression: ExpressionSelection;
  type: Tunable<TypeDirectionId>;
  color: Tunable<ColorDirectionId>;
  imageWorld: Tunable<ImageWorldId>;
  motion: Tunable<MotionCharacterId>;
  capabilities: CapabilityId[];
  /** Null = accept the recommended experiences for the structure + capabilities. */
  experiences: ExperienceChoice[] | null;
  viewports: ViewportChoice;
  brand: BrandReadiness;
  content: ContentReadiness;
  delivery: 'STANDARD' | 'PRIORITY' | 'CUSTOM_SCHEDULE';
  /** The client asked to keep the build simple. Choices that need more surface as a decision, not a silent bump. */
  keepItSimple: boolean;
};

/** Where the estimate sits in the commercial path. Only a founder moves past SELF_SERVE. */
export type EstimateStage = 'SELF_SERVE' | 'FOUNDER_REVIEWED' | 'SCOPE_LOCKED';

export type BuilderStepId =
  | 'BUILD'
  | 'STRUCTURE'
  | 'WORLD'
  | 'EXPRESSION'
  | 'TYPE'
  | 'COLOR'
  | 'IMAGE_WORLD'
  | 'MOTION'
  | 'BRAND'
  | 'FEATURES'
  | 'FAMILIES'
  | 'DELIVERY'
  | 'BLUEPRINT'
  | 'ESTIMATE';

/** Live scope words. DEEP (not ADVANCED) so it never collides with ADVANCED BUILD. */
export type ScopeSignal = 'LIGHT' | 'MODERATE' | 'DEEP' | 'EXPANSIVE';

export type BuilderNotice = {
  id: string;
  kind: 'COMES_WITH' | 'NEEDS_DECISION' | 'RAISES_LEVEL' | 'NOT_AVAILABLE' | 'ROUTES_TO' | 'UNUSUAL_PAIRING' | 'NOTED';
  message: string;
  /** Build level this choice requires, when it raises the level. */
  requires?: BuildLevel;
};
