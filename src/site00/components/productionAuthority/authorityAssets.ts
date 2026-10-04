/**
 * Visual plates for the production authority slots Opus1 left empty.
 * Generated for this sprint (GPT Image 2). They fill existing hero, chamber,
 * panel, and vault slots. They do not replace a live hub asset URL.
 */
const BASE = '/site00/production-authority-assets';

export const AUTHORITY_ASSETS = {
  designAtrium: `${BASE}/production-design-atrium-authority-v1.jpg`,
  designCore: `${BASE}/production-design-project-core-v1.png`,
  hubCrystal: `${BASE}/production-hub-crystal-core-v1.jpg`,
  experienceWorld: `${BASE}/production-experience-world-hero-v1.jpg`,
  expressionStage: `${BASE}/production-expression-stage-hero-v1.jpg`,
  libraryCanon: `${BASE}/production-library-canon-hero-v1.jpg`,
  libraryPlates: [
    `${BASE}/production-library-red-geometry-01-v1.jpg`,
    `${BASE}/production-library-red-geometry-02-v1.jpg`,
    `${BASE}/production-library-red-geometry-03-v1.jpg`,
  ],
  viewportCorridor: `${BASE}/production-viewport-corridor-v1.jpg`,
  boards: {
    brand: `${BASE}/production-design-board-brand-v1.jpg`,
    experience: `${BASE}/production-design-board-experience-v1.jpg`,
    surfaces: `${BASE}/production-design-board-surfaces-v1.jpg`,
    compiler: `${BASE}/production-design-board-compiler-v1.jpg`,
    assets: `${BASE}/production-design-board-assets-v1.jpg`,
    viewport: `${BASE}/production-design-board-viewport-v1.jpg`,
  },
} as const;
