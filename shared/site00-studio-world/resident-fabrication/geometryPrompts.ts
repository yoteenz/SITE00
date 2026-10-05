import type { ResidentFabricationProfile } from './residentGeometryFrames.js';
import type { ResidentGeometryFrameSpec } from './residentGeometryFrames.js';
import type { ResidentOutfitSystem } from './residentGeometryCompletePack.js';

const IDENTITY_LOCK = `
REFERENCE IMAGE = STRICT IDENTITY AUTHORITY. SAME PERSON. DO NOT CHANGE: face, facial structure, age, skin tone, ethnicity, eye shape, nose, lips, jaw, hairline, hairstyle, hair color, body type, body proportions, resident identity.
Only change: camera angle, head angle, body angle, pose, framing, and expression exactly as specified.
Do not reinterpret. Do not beautify into a different person. Do not stylize identity away.
Character fabrication reference — NOT fashion campaign, NOT glamour editorial, NOT cinematic poster.
`.trim();

export function uniformLockForOutfit(outfit: ResidentOutfitSystem): string {
  const women =
    'WOMEN UNIFORM LOCK: white fitted short-sleeve top with red collar trim; white leggings with red trim; white/red trim toe shoes (NOT sneakers, NOT solid red shoes).';
  const men =
    'MEN UNIFORM LOCK: white fitted short-sleeve top with red collar trim; white compression shorts with red trim; white/red trim toe shoes (NOT leggings, NOT sneakers).';
  return outfit === 'WOMEN_LEGGINGS' ? women : men;
}

export function buildGeometryCompletePrompt(
  profile: ResidentFabricationProfile,
  frame: ResidentGeometryFrameSpec,
  outfit: ResidentOutfitSystem,
  sourceRole: 'PORTRAIT_ONLY' | 'PORTRAIT_AND_UNIFORM_BODY',
): string {
  const roleLine =
    sourceRole === 'PORTRAIT_ONLY'
      ? 'Use approved portrait authority for FACE, HAIR, and identity. Single reference controls identity.'
      : 'Use approved portrait authority for FACE, HAIR, and identity. Use approved uniform full-body authority for BODY PROPORTIONS, SILHOUETTE, UNIFORM, and FOOTWEAR.';
  return [
    IDENTITY_LOCK,
    uniformLockForOutfit(outfit),
    roleLine,
    `Subject: ${profile.displayName} (${profile.residentId}) — ${profile.roleTitle}.`,
    'Environment: neutral Studio World fabrication bay, clean inspectable background, soft controlled lighting.',
    framePromptBody(frame),
    'Photorealistic fabrication reference photography, high detail, natural skin, correct anatomy, feet visible when full-body.',
  ].join('\n\n');
}

export function buildResidentGeometryPrompt(profile: ResidentFabricationProfile, frame: ResidentGeometryFrameSpec): string {
  const angleInstruction = framePromptBody(frame);
  return [
    IDENTITY_LOCK,
    `Subject: ${profile.displayName} — ${profile.roleTitle} (Studio World resident ${profile.residentId}).`,
    `Wardrobe (single baseline, consistent across all 16 frames): ${profile.baselineWardrobe}`,
    'Environment: neutral softly architectural Studio World fabrication bay, clean inspectable background, soft controlled lighting, no distracting props, identity readability priority.',
    angleInstruction,
    'Photorealistic fabrication reference photography, high detail, natural skin, correct anatomy, feet visible when full-body.',
  ].join('\n\n');
}

function framePromptBody(frame: ResidentGeometryFrameSpec): string {
  switch (frame.frameId) {
    case '01_FRONT_PORTRAIT':
      return 'Frame 01 CANONICAL PORTRAIT FRONT: straight-on, eye-level, neutral expression, chest-up, identity inspection frame, clean readable lighting.';
    case '02_LEFT_3Q_PORTRAIT':
      return 'Frame 02 PORTRAIT LEFT THREE-QUARTER: head and chest turned approximately 45 degrees to subject\'s left, neutral expression, chest-up.';
    case '03_RIGHT_3Q_PORTRAIT':
      return 'Frame 03 PORTRAIT RIGHT THREE-QUARTER: head and chest turned approximately 45 degrees to subject\'s right, neutral expression, chest-up.';
    case '04_LEFT_PROFILE':
      return 'Frame 04 PORTRAIT LEFT PROFILE: true left profile, chest-up, neutral expression.';
    case '05_RIGHT_PROFILE':
      return 'Frame 05 PORTRAIT RIGHT PROFILE: true right profile, chest-up, neutral expression.';
    case '06_REAR_HEAD':
      return 'Frame 06 REAR HEAD AND SHOULDERS: back of head and shoulders visible, hair geometry readable, neutral posture.';
    case '07_FULL_FRONT':
      return 'Frame 07 FULL BODY FRONT: standing neutral, full body head to feet, no crop, feet fully visible.';
    case '08_FULL_LEFT_3Q':
      return 'Frame 08 FULL BODY LEFT THREE-QUARTER: standing neutral, approximately 45 degrees left, full body, feet visible.';
    case '09_FULL_RIGHT_3Q':
      return 'Frame 09 FULL BODY RIGHT THREE-QUARTER: standing neutral, approximately 45 degrees right, full body, feet visible.';
    case '10_FULL_LEFT_PROFILE':
      return 'Frame 10 FULL BODY LEFT PROFILE: true left profile, full body standing, feet visible.';
    case '11_FULL_RIGHT_PROFILE':
      return 'Frame 11 FULL BODY RIGHT PROFILE: true right profile, full body standing, feet visible.';
    case '12_FULL_BACK':
      return 'Frame 12 FULL BODY BACK: straight rear view, full body, feet visible, hair and outfit continuity from front.';
    case '13_SEATED':
      return 'Frame 13 SEATED FRONT NEUTRAL: seated naturally, three-quarter or full body visible, relaxed but identity-readable posture.';
    case '14_CONVERSATIONAL':
      return 'Frame 14 STANDING CONVERSATIONAL: natural relaxed posture, subtle natural hand placement, not theatrical, full or three-quarter body.';
    case '15_WALK':
      return 'Frame 15 NATURAL WALK: walking naturally, full body, readable body mechanics, minimal motion blur, mid-stride.';
    case '16_DOCUMENTARY':
      return 'Frame 16 DOCUMENTARY CAMERA-AWARE: subtle awareness of camera, natural workplace documentary energy, still identity-readable, not dramatic fashion editorial.';
    default:
      return `Frame ${frame.frameNumber}: ${frame.frameType}.`;
  }
}
