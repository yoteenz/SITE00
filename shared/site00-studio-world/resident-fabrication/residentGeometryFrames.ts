/** Canonical 16-frame geometry pack per Studio World resident (fabrication batch). */

export type ResidentGeometryFrameId =
  | '01_FRONT_PORTRAIT'
  | '02_LEFT_3Q_PORTRAIT'
  | '03_RIGHT_3Q_PORTRAIT'
  | '04_LEFT_PROFILE'
  | '05_RIGHT_PROFILE'
  | '06_REAR_HEAD'
  | '07_FULL_FRONT'
  | '08_FULL_LEFT_3Q'
  | '09_FULL_RIGHT_3Q'
  | '10_FULL_LEFT_PROFILE'
  | '11_FULL_RIGHT_PROFILE'
  | '12_FULL_BACK'
  | '13_SEATED'
  | '14_CONVERSATIONAL'
  | '15_WALK'
  | '16_DOCUMENTARY';

export type ResidentGeometryFrameSpec = {
  frameNumber: number;
  frameId: ResidentGeometryFrameId;
  fileSuffix: string;
  folder: '02_FACE_GEOMETRY' | '03_BODY_GEOMETRY' | '04_NATURAL_POSE';
  frameType: string;
  cameraAngle: string;
  bodyAngle: string;
  pose: string;
  expression: string;
  aspectRatio: '3:4' | '4:3' | '9:16' | '2:3';
};

export const RESIDENT_GEOMETRY_FRAMES: readonly ResidentGeometryFrameSpec[] = [
  {
    frameNumber: 1,
    frameId: '01_FRONT_PORTRAIT',
    fileSuffix: '01_FRONT_PORTRAIT',
    folder: '02_FACE_GEOMETRY',
    frameType: 'canonical_portrait_front',
    cameraAngle: 'straight_on_eye_level',
    bodyAngle: 'front',
    pose: 'chest_up_neutral',
    expression: 'neutral',
    aspectRatio: '3:4',
  },
  {
    frameNumber: 2,
    frameId: '02_LEFT_3Q_PORTRAIT',
    fileSuffix: '02_LEFT_3Q_PORTRAIT',
    folder: '02_FACE_GEOMETRY',
    frameType: 'portrait_left_three_quarter',
    cameraAngle: 'eye_level',
    bodyAngle: '45deg_left',
    pose: 'chest_up_neutral',
    expression: 'neutral',
    aspectRatio: '3:4',
  },
  {
    frameNumber: 3,
    frameId: '03_RIGHT_3Q_PORTRAIT',
    fileSuffix: '03_RIGHT_3Q_PORTRAIT',
    folder: '02_FACE_GEOMETRY',
    frameType: 'portrait_right_three_quarter',
    cameraAngle: 'eye_level',
    bodyAngle: '45deg_right',
    pose: 'chest_up_neutral',
    expression: 'neutral',
    aspectRatio: '3:4',
  },
  {
    frameNumber: 4,
    frameId: '04_LEFT_PROFILE',
    fileSuffix: '04_LEFT_PROFILE',
    folder: '02_FACE_GEOMETRY',
    frameType: 'portrait_left_profile',
    cameraAngle: 'true_profile',
    bodyAngle: 'left_profile',
    pose: 'chest_up',
    expression: 'neutral',
    aspectRatio: '3:4',
  },
  {
    frameNumber: 5,
    frameId: '05_RIGHT_PROFILE',
    fileSuffix: '05_RIGHT_PROFILE',
    folder: '02_FACE_GEOMETRY',
    frameType: 'portrait_right_profile',
    cameraAngle: 'true_profile',
    bodyAngle: 'right_profile',
    pose: 'chest_up',
    expression: 'neutral',
    aspectRatio: '3:4',
  },
  {
    frameNumber: 6,
    frameId: '06_REAR_HEAD',
    fileSuffix: '06_REAR_HEAD',
    folder: '02_FACE_GEOMETRY',
    frameType: 'rear_head_shoulders',
    cameraAngle: 'rear_eye_level',
    bodyAngle: 'back',
    pose: 'head_shoulders_rear',
    expression: 'neutral',
    aspectRatio: '3:4',
  },
  {
    frameNumber: 7,
    frameId: '07_FULL_FRONT',
    fileSuffix: '07_FULL_FRONT',
    folder: '03_BODY_GEOMETRY',
    frameType: 'full_body_front',
    cameraAngle: 'straight_on',
    bodyAngle: 'front',
    pose: 'standing_neutral_feet_visible',
    expression: 'neutral',
    aspectRatio: '9:16',
  },
  {
    frameNumber: 8,
    frameId: '08_FULL_LEFT_3Q',
    fileSuffix: '08_FULL_LEFT_3Q',
    folder: '03_BODY_GEOMETRY',
    frameType: 'full_body_left_three_quarter',
    cameraAngle: 'eye_level',
    bodyAngle: '45deg_left',
    pose: 'standing_neutral',
    expression: 'neutral',
    aspectRatio: '9:16',
  },
  {
    frameNumber: 9,
    frameId: '09_FULL_RIGHT_3Q',
    fileSuffix: '09_FULL_RIGHT_3Q',
    folder: '03_BODY_GEOMETRY',
    frameType: 'full_body_right_three_quarter',
    cameraAngle: 'eye_level',
    bodyAngle: '45deg_right',
    pose: 'standing_neutral',
    expression: 'neutral',
    aspectRatio: '9:16',
  },
  {
    frameNumber: 10,
    frameId: '10_FULL_LEFT_PROFILE',
    fileSuffix: '10_FULL_LEFT_PROFILE',
    folder: '03_BODY_GEOMETRY',
    frameType: 'full_body_left_profile',
    cameraAngle: 'true_profile',
    bodyAngle: 'left_profile',
    pose: 'standing_feet_visible',
    expression: 'neutral',
    aspectRatio: '9:16',
  },
  {
    frameNumber: 11,
    frameId: '11_FULL_RIGHT_PROFILE',
    fileSuffix: '11_FULL_RIGHT_PROFILE',
    folder: '03_BODY_GEOMETRY',
    frameType: 'full_body_right_profile',
    cameraAngle: 'true_profile',
    bodyAngle: 'right_profile',
    pose: 'standing_feet_visible',
    expression: 'neutral',
    aspectRatio: '9:16',
  },
  {
    frameNumber: 12,
    frameId: '12_FULL_BACK',
    fileSuffix: '12_FULL_BACK',
    folder: '03_BODY_GEOMETRY',
    frameType: 'full_body_back',
    cameraAngle: 'rear',
    bodyAngle: 'back',
    pose: 'standing_feet_visible',
    expression: 'neutral',
    aspectRatio: '9:16',
  },
  {
    frameNumber: 13,
    frameId: '13_SEATED',
    fileSuffix: '13_SEATED',
    folder: '04_NATURAL_POSE',
    frameType: 'seated_front_neutral',
    cameraAngle: 'eye_level',
    bodyAngle: 'front',
    pose: 'seated_natural',
    expression: 'relaxed_neutral',
    aspectRatio: '4:3',
  },
  {
    frameNumber: 14,
    frameId: '14_CONVERSATIONAL',
    fileSuffix: '14_CONVERSATIONAL',
    folder: '04_NATURAL_POSE',
    frameType: 'standing_conversational',
    cameraAngle: 'eye_level',
    bodyAngle: 'slight_three_quarter',
    pose: 'relaxed_hands_natural',
    expression: 'calm_attentive',
    aspectRatio: '9:16',
  },
  {
    frameNumber: 15,
    frameId: '15_WALK',
    fileSuffix: '15_WALK',
    folder: '04_NATURAL_POSE',
    frameType: 'natural_walk',
    cameraAngle: 'eye_level',
    bodyAngle: 'walking_three_quarter',
    pose: 'mid_stride_full_body',
    expression: 'neutral',
    aspectRatio: '9:16',
  },
  {
    frameNumber: 16,
    frameId: '16_DOCUMENTARY',
    fileSuffix: '16_DOCUMENTARY',
    folder: '04_NATURAL_POSE',
    frameType: 'documentary_camera_aware',
    cameraAngle: 'eye_level',
    bodyAngle: 'front_slight_angle',
    pose: 'workplace_documentary',
    expression: 'subtle_camera_awareness',
    aspectRatio: '4:3',
  },
] as const;

export type StudioWorldResidentId =
  | 'SW-001'
  | 'SW-002'
  | 'SW-003'
  | 'SW-004'
  | 'SW-005'
  | 'SW-006'
  | 'SW-007'
  | 'SW-008';

export type ResidentFabricationProfile = {
  residentId: StudioWorldResidentId;
  folderName: string;
  displayName: string;
  roleTitle: string;
  portraitAssetId: string;
  portraitRepoPath: string;
  baselineWardrobe: string;
  registryNotes: string;
};

export const STUDIO_WORLD_RESIDENT_FABRICATION_PROFILES: readonly ResidentFabricationProfile[] = [
  {
    residentId: 'SW-001',
    folderName: 'SW-001_ETTA_VALE',
    displayName: 'ETTA VALE',
    roleTitle: 'Creative Director / Founding Presence',
    portraitAssetId: 'resident.sw001.etta.portrait',
    portraitRepoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-etta-vale-portrait.jpg',
    baselineWardrobe:
      'Founding creative director baseline: refined black or charcoal tailored blazer over minimal dark top, subtle jewelry, professional studio leadership look consistent with mounted portrait.',
    registryNotes: 'Identity anchor; lite portrait authority until SW Team(1).zip recovered.',
  },
  {
    residentId: 'SW-002',
    folderName: 'SW-002_ZURI_XU',
    displayName: 'ZURI XU',
    roleTitle: 'Strategy Director / Client Intelligence / Office Guide',
    portraitAssetId: 'resident.sw002.zuri.portrait',
    portraitRepoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-zuri-xu-portrait.jpg',
    baselineWardrobe:
      'Beige or warm neutral architectural suit / structured blazer and trousers as in canonical portrait; minimal accessories; strategy-office guide presence.',
    registryNotes: 'IDENTITY_CONFIRMED founder pack; LITE_ONLY source.',
  },
  {
    residentId: 'SW-003',
    folderName: 'SW-003_JULES_MERCER',
    displayName: 'JULES MERCER',
    roleTitle: 'Front Office / Concierge / Tenant Relations',
    portraitAssetId: 'resident.sw003.jules.portrait',
    portraitRepoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-jules-mercer-portrait.jpg',
    baselineWardrobe:
      'Front-office concierge baseline matching mounted Jules portrait (not locs candidate cluster): hospitality-professional attire, warm approachable tailoring.',
    registryNotes: 'Mounted portrait is authority; locs cluster remains CANDIDATE_ALTERNATE_LOOK only.',
  },
  {
    residentId: 'SW-004',
    folderName: 'SW-004_NOA_KLINE',
    displayName: 'NOA KLINE',
    roleTitle: 'Systems Architect / Studio OS Liaison',
    portraitAssetId: 'resident.sw004.noa.portrait',
    portraitRepoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-noa-kline-portrait.jpg',
    baselineWardrobe:
      'Systems architect baseline: clean modern tech-studio layers, dark or neutral structured jacket, practical minimal styling from canonical portrait.',
    registryNotes: 'IDENTITY_CONFIRMED; LITE_ONLY.',
  },
  {
    residentId: 'SW-005',
    folderName: 'SW-005_CASPIAN_REED',
    displayName: 'CASPIAN REED',
    roleTitle: 'World Director / Environmental Storyteller',
    portraitAssetId: 'resident.sw005.caspian.portrait',
    portraitRepoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-caspian-reed-portrait.jpg',
    baselineWardrobe:
      'World director baseline: creative director outerwear / layered storytelling wardrobe from mounted portrait, earthy or cinematic neutrals.',
    registryNotes: 'USED_BY_AUTHORITY portrait.',
  },
  {
    residentId: 'SW-006',
    folderName: 'SW-006_IONA_WELLS',
    displayName: 'IONA WELLS',
    roleTitle: 'Fabrication Lead / Character Lab / Image Construction',
    portraitAssetId: 'resident.sw006.iona.portrait',
    portraitRepoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-iona-wells-portrait.jpg',
    baselineWardrobe:
      'Fabrication lead lab baseline from canonical portrait (not glam alternate): practical studio workwear, lab-coat or technical creative layers as in authority portrait.',
    registryNotes: 'Glam variant is alternate mode only — not default identity.',
  },
  {
    residentId: 'SW-007',
    folderName: 'SW-007_MARLOWE_SAINT',
    displayName: 'MARLOWE SAINT',
    roleTitle: 'Casting Director / Performance Design / Persona Mapping',
    portraitAssetId: 'resident.sw007.marlowe.portrait',
    portraitRepoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-marlowe-saint-portrait.jpg',
    baselineWardrobe:
      'Casting director baseline: creative studio tailoring, subtle statement accessories (e.g. earrings if in source), salt-and-pepper hair and beard as canonical.',
    registryNotes: 'IDENTITY_CONFIRMED; LITE_ONLY.',
  },
  {
    residentId: 'SW-008',
    folderName: 'SW-008_ELIO_VAHN',
    displayName: 'ELIO "EV" VAHN',
    roleTitle: 'Tenancy / Expansion / Business Development',
    portraitAssetId: 'resident.sw008.elio.portrait',
    portraitRepoPath: 'public/site00/production-authority-assets/shared/residents/studio-world-elio-vahn-portrait.jpg',
    baselineWardrobe:
      'Business development baseline: burgundy or deep velvet blazer / structured jacket as in canonical portrait, professional expansion-lead styling.',
    registryNotes: 'IDENTITY_CONFIRMED; LITE_ONLY.',
  },
];
