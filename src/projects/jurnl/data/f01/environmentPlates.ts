/**
 * Canonical F01 environment plates.
 * Screen authorities are references. These files are clean plates (no live type, no controls).
 * Failed harvest crops are not listed here.
 */

export type F01EnvClass = 'SHARED_EXISTING_PLATE' | 'TRANSFORMED_EXISTING_PLATE' | 'CHILD_PLATE';

export type F01PlateFocal = {
  mobile: string;
  tablet: string;
  desktop: string;
  focalX: number;
  focalY: number;
};

export type F01EnvironmentPlate = {
  assetId: string;
  projectId: 'JURNL';
  familyId: 'F01';
  assetClass: 'FAMILY_BACKGROUND';
  filePath: string;
  format: 'png';
  nativeWidth: 2016;
  nativeHeight: 3584;
  aspectRatio: '9:16';
  transparency: false;
  cropBehavior: 'cover';
  overlayBehavior: 'none';
  configuredResolutionTier: '4k';
  galleryLabel: '3K';
  deliveredWidth: 2016;
  deliveredHeight: 3584;
  providerGenerationId: string;
  sourceAuthority: string;
  routes: readonly string[];
  qaStatus: 'PASS';
  runtimeStatus: 'MOUNTED';
  shared: F01PlateFocal;
  transformed: F01PlateFocal;
};

const ATRIUM_SHARED: F01PlateFocal = { mobile: '48% 46%', tablet: '56% 38%', desktop: '62% 34%', focalX: 0.62, focalY: 0.34 };
const ATRIUM_TRANSFORMED: F01PlateFocal = { mobile: '72% 36%', tablet: '70% 34%', desktop: '68% 30%', focalX: 0.72, focalY: 0.3 };
const CHILD_FRAME: F01PlateFocal = { mobile: '50% 50%', tablet: '50% 42%', desktop: '54% 38%', focalX: 0.5, focalY: 0.5 };

function childPlates<T extends Record<string, readonly [string, string, string]>>(rows: T): { [K in keyof T]: F01EnvironmentPlate } {
  return Object.fromEntries(
    Object.entries(rows).map(([assetId, [sourceAuthority, route, providerGenerationId]]) => [
      assetId,
      {
        assetId,
        projectId: 'JURNL',
        familyId: 'F01',
        assetClass: 'FAMILY_BACKGROUND',
        filePath: `/jurnl/f01-asset-first/assets/${assetId}.png`,
        format: 'png',
        nativeWidth: 2016,
        nativeHeight: 3584,
        aspectRatio: '9:16',
        transparency: false,
        cropBehavior: 'cover',
        overlayBehavior: 'none',
        configuredResolutionTier: '4k',
        galleryLabel: '3K',
        deliveredWidth: 2016,
        deliveredHeight: 3584,
        providerGenerationId,
        sourceAuthority,
        routes: [route],
        qaStatus: 'PASS',
        runtimeStatus: 'MOUNTED',
        shared: CHILD_FRAME,
        transformed: CHILD_FRAME,
      } satisfies F01EnvironmentPlate,
    ]),
  ) as unknown as { [K in keyof T]: F01EnvironmentPlate };
}

export const F01_ENVIRONMENT_PLATES = {
  'ENTRY.ENVIRONMENT.PLATE.001': {
    assetId: 'ENTRY.ENVIRONMENT.PLATE.001',
    projectId: 'JURNL',
    familyId: 'F01',
    assetClass: 'FAMILY_BACKGROUND',
    filePath: '/jurnl/f01-asset-first/assets/ENTRY.ENVIRONMENT.PLATE.001.png',
    format: 'png',
    nativeWidth: 2016,
    nativeHeight: 3584,
    aspectRatio: '9:16',
    transparency: false,
    cropBehavior: 'cover',
    overlayBehavior: 'none',
    configuredResolutionTier: '4k',
    galleryLabel: '3K',
    deliveredWidth: 2016,
    deliveredHeight: 3584,
    providerGenerationId: 'omTTAjRt3LgV0RB2lC5I',
    sourceAuthority: 'F01.00 WELCOME',
    routes: ['entry', 'setup'],
    qaStatus: 'PASS',
    runtimeStatus: 'MOUNTED',
    shared: ATRIUM_SHARED,
    transformed: ATRIUM_TRANSFORMED,
  },
  'ENTRY.ENVIRONMENT.VERIFY.001': {
    assetId: 'ENTRY.ENVIRONMENT.VERIFY.001',
    projectId: 'JURNL',
    familyId: 'F01',
    assetClass: 'FAMILY_BACKGROUND',
    filePath: '/jurnl/f01-asset-first/assets/ENTRY.ENVIRONMENT.VERIFY.001.png',
    format: 'png',
    nativeWidth: 2016,
    nativeHeight: 3584,
    aspectRatio: '9:16',
    transparency: false,
    cropBehavior: 'cover',
    overlayBehavior: 'none',
    configuredResolutionTier: '4k',
    galleryLabel: '3K',
    deliveredWidth: 2016,
    deliveredHeight: 3584,
    providerGenerationId: 'zrmnyPzh2o8hiSImFwT5',
    sourceAuthority: 'F01.02 EMAIL VERIFICATION',
    routes: ['entry/verify-email'],
    qaStatus: 'PASS',
    runtimeStatus: 'MOUNTED',
    shared: { mobile: '42% 52%', tablet: '48% 50%', desktop: '55% 58%', focalX: 0.55, focalY: 0.58 },
    transformed: { mobile: '42% 52%', tablet: '48% 50%', desktop: '55% 58%', focalX: 0.55, focalY: 0.58 },
  },
  'ENTRY.ENVIRONMENT.FORGOT.001': {
    assetId: 'ENTRY.ENVIRONMENT.FORGOT.001',
    projectId: 'JURNL',
    familyId: 'F01',
    assetClass: 'FAMILY_BACKGROUND',
    filePath: '/jurnl/f01-asset-first/assets/ENTRY.ENVIRONMENT.FORGOT.001.png',
    format: 'png',
    nativeWidth: 2016,
    nativeHeight: 3584,
    aspectRatio: '9:16',
    transparency: false,
    cropBehavior: 'cover',
    overlayBehavior: 'none',
    configuredResolutionTier: '4k',
    galleryLabel: '3K',
    deliveredWidth: 2016,
    deliveredHeight: 3584,
    providerGenerationId: 'e8tkgJ5BhWrsKGq5XJjE',
    sourceAuthority: 'F01.05 FORGOT PASSWORD',
    routes: ['entry/forgot-password'],
    qaStatus: 'PASS',
    runtimeStatus: 'MOUNTED',
    shared: { mobile: '38% 48%', tablet: '42% 46%', desktop: '40% 44%', focalX: 0.4, focalY: 0.44 },
    transformed: { mobile: '38% 48%', tablet: '42% 46%', desktop: '40% 44%', focalX: 0.4, focalY: 0.44 },
  },
  'ENTRY.ENVIRONMENT.RESET_SENT.001': {
    assetId: 'ENTRY.ENVIRONMENT.RESET_SENT.001',
    projectId: 'JURNL',
    familyId: 'F01',
    assetClass: 'FAMILY_BACKGROUND',
    filePath: '/jurnl/f01-asset-first/assets/ENTRY.ENVIRONMENT.RESET_SENT.001.png',
    format: 'png',
    nativeWidth: 2016,
    nativeHeight: 3584,
    aspectRatio: '9:16',
    transparency: false,
    cropBehavior: 'cover',
    overlayBehavior: 'none',
    configuredResolutionTier: '4k',
    galleryLabel: '3K',
    deliveredWidth: 2016,
    deliveredHeight: 3584,
    providerGenerationId: '7h17j8WkPY48zdMyjI5k',
    sourceAuthority: 'F01.06 RESET EMAIL SENT',
    routes: ['entry/reset-sent'],
    qaStatus: 'PASS',
    runtimeStatus: 'MOUNTED',
    shared: { mobile: '50% 48%', tablet: '50% 46%', desktop: '50% 46%', focalX: 0.5, focalY: 0.46 },
    transformed: { mobile: '50% 48%', tablet: '50% 46%', desktop: '50% 46%', focalX: 0.5, focalY: 0.46 },
  },
  'ENTRY.ENVIRONMENT.PRIVACY.001': {
    assetId: 'ENTRY.ENVIRONMENT.PRIVACY.001',
    projectId: 'JURNL',
    familyId: 'F01',
    assetClass: 'FAMILY_BACKGROUND',
    filePath: '/jurnl/f01-asset-first/assets/ENTRY.ENVIRONMENT.PRIVACY.001.png',
    format: 'png',
    nativeWidth: 2016,
    nativeHeight: 3584,
    aspectRatio: '9:16',
    transparency: false,
    cropBehavior: 'cover',
    overlayBehavior: 'none',
    configuredResolutionTier: '4k',
    galleryLabel: '3K',
    deliveredWidth: 2016,
    deliveredHeight: 3584,
    providerGenerationId: 'mrYewK2YnNDwIXQy1iWH',
    sourceAuthority: 'F01.11 PRIVACY PRIMER',
    routes: ['entry/privacy'],
    qaStatus: 'PASS',
    runtimeStatus: 'MOUNTED',
    shared: { mobile: '46% 52%', tablet: '48% 50%', desktop: '52% 48%', focalX: 0.52, focalY: 0.48 },
    transformed: { mobile: '46% 52%', tablet: '48% 50%', desktop: '52% 48%', focalX: 0.52, focalY: 0.48 },
  },
  ...childPlates({
    'ENTRY.ENVIRONMENT.CREATE_ACCOUNT.001': ['F01.01 CREATE ACCOUNT', 'entry/create', 'tihr4cvOBHwIlczcaMNw'],
    'ENTRY.ENVIRONMENT.SIGN_IN.001': ['F01.03 SIGN IN', 'entry/sign-in', 'KyBknhSX5vz7o5t8090o'],
    'ENTRY.ENVIRONMENT.UNLOCK.001': ['F01.04 RETURNING USER UNLOCK', 'entry/unlock', 'Wx8ZtNnuLKzbkQLk2oOm'],
    'ENTRY.ENVIRONMENT.NEW_PASSWORD.001': ['F01.07 CREATE NEW PASSWORD', 'entry/new-password', 'JxtQmvNs5YtyAjLFWYGd'],
    'ENTRY.ENVIRONMENT.RESET_SUCCESS.001': ['F01.08 PASSWORD RESET SUCCESS', 'entry/reset-success', '69YwJIuw3bL72L9rsVKw'],
    'ENTRY.ENVIRONMENT.BIOMETRIC.001': ['F01.09 BIOMETRIC SETUP', 'entry/biometric', 'fgo5YNpMlR02Q3KQmHMe'],
    'ENTRY.ENVIRONMENT.DEVICE_TRUST.001': ['F01.10 DEVICE TRUST', 'entry/device-trust', 'UXlv36VgbylJFIE7YMu7'],
    'ENTRY.ENVIRONMENT.SECURITY.001': ['F01.12 SECURITY PRIMER', 'entry/security', 'qa1Tc2bvg5Enrczzlnf2'],
    'ENTRY.ENVIRONMENT.COMPLETE.001': ['F01.13 ENTRY COMPLETE', 'entry/complete', 'eFfwcdsjY7QFWCQdeguf'],
  }),
} satisfies Record<string, F01EnvironmentPlate>;

export type F01PlateId = keyof typeof F01_ENVIRONMENT_PLATES;

export const F01_SCENE_ENVIRONMENT = {
  welcome: { env: 'SHARED_EXISTING_PLATE', plate: 'ENTRY.ENVIRONMENT.PLATE.001', focal: 'shared' },
  create: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.CREATE_ACCOUNT.001', focal: 'shared' },
  signin: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.SIGN_IN.001', focal: 'shared' },
  unlock: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.UNLOCK.001', focal: 'shared' },
  verify: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.VERIFY.001', focal: 'shared' },
  'reset-sent': { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.RESET_SENT.001', focal: 'shared' },
  forgot: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.FORGOT.001', focal: 'shared' },
  newpw: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.NEW_PASSWORD.001', focal: 'shared' },
  success: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.RESET_SUCCESS.001', focal: 'shared' },
  biometric: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.BIOMETRIC.001', focal: 'shared' },
  trust: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.DEVICE_TRUST.001', focal: 'shared' },
  privacy: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.PRIVACY.001', focal: 'shared' },
  security: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.SECURITY.001', focal: 'shared' },
  complete: { env: 'CHILD_PLATE', plate: 'ENTRY.ENVIRONMENT.COMPLETE.001', focal: 'shared' },
  boundary: { env: 'TRANSFORMED_EXISTING_PLATE', plate: 'ENTRY.ENVIRONMENT.PLATE.001', focal: 'transformed' },
} as const;

export type JurnlScene = keyof typeof F01_SCENE_ENVIRONMENT;
