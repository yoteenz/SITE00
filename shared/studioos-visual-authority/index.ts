/**
 * Visual Authority Development Gate — Studio OS production methodology (P0.SITE00.PRODUCTION-METHODOLOGY.VISUAL-AUTHORITY-DEVELOPMENT-GATE1).
 * Sits between the Workspace Experience Brain (experience contract) and implementation for material page families.
 * UPSTREAM DEFINES INTENT. DOWNSTREAM INCREASES FIDELITY.
 */
export * from './schema.js';
export * from './gate.js';
export * from './contracts.js';
export * from './registry.js';
export * from './tree.js';
export * from './creative-direction.js';
export * from './hybrid-authority.js';
export * as aio from './projects/aio/ifta.js';
export * as aioIfta from './projects/aio/ifta-authority/index.js';
export { AIO_OFFICE_CREATIVE_DIRECTION_PROFILE, AIO_OFFICE_PROFILE_SCOPE } from './projects/aio/office-creative-direction-profile.js';
export * as samples from './projects/samples/portability.js';
export * as jurnlF09 from './projects/jurnl/f09-safe-to-spend.js';
export * as jurnlF09CD from './projects/jurnl/f09-creative-direction.js';
export { JURNL_CREATIVE_DIRECTION_PROFILE } from './projects/jurnl/creative-direction-profile.js';
export * as jurnlF09BP from './projects/jurnl/f09-composition-blueprint.js';
export * as jurnlGrammar from './projects/jurnl/composition-grammar.js';
export * as jurnlCreativeGrammar from './projects/jurnl/bespoke-composition-grammar.js';
export * as jurnlF09Regen from './projects/jurnl/f09-art-direction-regen.js';
export * from './prompt-forensics.js';
export * from './asset-quality.js';
export * as jurnlF09Forensics from './projects/jurnl/f09-prompt-forensics.js';
export * from './parent-child-derivation.js';
export * as jurnlStsFamily from './projects/jurnl/safe-to-spend-family.js';
export * as jurnlF09Replica from './projects/jurnl/f09-reference-replica.js';
