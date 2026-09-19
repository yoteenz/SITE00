/**
 * Master Skin — browser-safe exports.
 */

export * from './types.js';
export * from './constants.js';
export { listMasterSkins, getMasterSkinById, CULTURAL_EDITORIAL_SKIN, CLINICAL_EDITORIAL_SKIN, TECHNICAL_OPERATIONS_SKIN } from './catalog.js';
export { recommendMasterSkins, recommendForDoctorDemo, recommendForMedSpaDemo } from './recommendationEngine.js';
export { resolveModuleSkin, buildSkinCssVars, skinInspectorPayload } from './resolver.js';
export { PROOF_PROJECT_SKIN_MAP } from './constants.js';
