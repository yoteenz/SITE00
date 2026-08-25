/** P0.FILM.1 — Browser-safe film production exports (no node:crypto). */

export {
  createFilmProductionState,
  registerFilm,
  approveProductionPlan,
  triggerGeneration,
  simulateGeneration,
  applyDailiesReview,
  applyRoughCutReviewAction,
  completeFounderGate,
  noGenerationOnPageLoad,
  noGenerationDuringPlanning,
  founderApprovalRequiredBeforeProductionSpend,
} from './engine.js';

export {
  buildNdxBrandFilmBible,
  buildNdxCharacterFilmAuthority,
  buildNdxWardrobeBible,
  buildNdxShotLibrary,
  buildNdxFormatTemplateLibrary,
  buildNdxFilmPlannerContext,
  buildReel01Input,
  buildReel02Input,
  buildReel01Storyboard,
  buildReel02Storyboard,
  REEL_01_FILM_ID,
  REEL_02_FILM_ID,
  REEL_01_TITLE,
  REEL_02_TITLE,
} from './adapters/ndxbookFilmAdapter.js';

export type { FilmProductionState, FilmProductionRecord, FilmProductionInput } from './types.js';

export { FILM_PRODUCTION_STATES, FOUNDER_GATES, DAILIES_ACTIONS, ROUGH_CUT_ACTIONS } from './constants.js';

export { brandFilmBibleResolvesBeforeGeneration } from './authorities/brandFilmBible.js';
export { founderRequiredToMicromanagePrompts } from './generation/promptCompiler.js';
export { surfaceViableCandidates } from './review/founderDailies.js';
export { blockedRendererReportsHonestly } from './edit/editTemplateEngine.js';
