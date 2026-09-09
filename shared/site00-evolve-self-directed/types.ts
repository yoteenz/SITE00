/** P0.VR.6R9 — Evolve + self-directed screen QA types. */

export type EvolveSelfDirectedScreenId =
  | 'EVOLVE_SERVICE'
  | 'HOME'
  | 'PROJECTS'
  | 'REVIEWS'
  | 'INBOX'
  | 'PROFILE';

export type EvolveSelfDirectedViewport = 'MOBILE' | 'DESKTOP';

export type ScreenQAStatus =
  | 'NOT_STARTED'
  | 'CAPTURED'
  | 'MAJOR_DRIFT'
  | 'CORRECTING'
  | 'HIGH_MATCH'
  | 'VERIFIED'
  | 'BLOCKED';

export type ScreenQARegion =
  | 'ROOT'
  | 'HEADER'
  | 'NAV'
  | 'PRIMARY_CONTENT'
  | 'SECONDARY_CONTENT'
  | 'CTA'
  | 'FOOTER'
  | 'CHILD_SURFACE';

export type ScreenQACaptureKind = 'REFERENCE' | 'LIVE' | 'OVERLAY' | 'DIFF';

export type ScreenQACapture = {
  kind: ScreenQACaptureKind;
  url: string | null;
  capturedAt: string | null;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
};

export type ScreenQARegionDrift = {
  region: ScreenQARegion;
  driftLevel: 'NONE' | 'MINOR' | 'MODERATE' | 'MAJOR';
  notes: string[];
};

export type ScreenAuthorityRecord = {
  authorityId: string;
  screenId: EvolveSelfDirectedScreenId;
  viewport: EvolveSelfDirectedViewport;
  route: string;
  referenceAssetPath: string;
  registeredAt: string;
  fidelityMode: 'EXACT';
};

export type EvolveSelfDirectedScreenQARow = {
  screenId: EvolveSelfDirectedScreenId;
  mobile: {
    reference: ScreenQACapture | null;
    live: ScreenQACapture | null;
    overlay: ScreenQACapture | null;
    diff: ScreenQACapture | null;
    status: ScreenQAStatus;
    regionDrift: ScreenQARegionDrift[];
  };
  desktop: {
    reference: ScreenQACapture | null;
    live: ScreenQACapture | null;
    overlay: ScreenQACapture | null;
    diff: ScreenQACapture | null;
    status: ScreenQAStatus;
    regionDrift: ScreenQARegionDrift[];
  };
};

export type EvolveSelfDirectedScreenQAMatrix = {
  matrixId: string;
  createdAt: string;
  updatedAt: string;
  rows: EvolveSelfDirectedScreenQARow[];
  guards: {
    noOp: { pass: boolean; failureCode: string | null; deltaRatio: number };
    partialOp: { pass: boolean; failureCode: string | null; resolutionRatio: number };
    desktopStretch: { pass: boolean; failureCode: string | null; flaggedScreens: string[] };
    genericChildUi: { pass: boolean; failureCode: string | null; flaggedSurfaces: string[] };
  };
};
