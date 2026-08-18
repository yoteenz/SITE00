/** Canonical SITE 00 loader geometry generation brief (Kling 3 Omni via OpenArt). */
export const SITE00_LOADER_GEOMETRY_REFERENCE_FRAME_PATH = 'site00/75C5B087-7561-40A4-86A9-939A5EE01AD2.png';

export const SITE00_LOADER_GEOMETRY_GENERATION = {
  provider: 'openart',
  model: 'kling-3-omni',
  mode: 'image2video',
  durationSeconds: 10,
  resolution: 'pro',
  openArtHistoryId: 'aUsaRicK38pEp4ieayl8',
  referenceFrameLabel: '75C5B087-7561-40A4-86A9-939A5EE01AD2.png',
  masterRemoteFile: 'openart-output_kling-v2_aUsaRicK38pEp4ieayl8.mp4',
} as const;

export const SITE00_LOADER_GEOMETRY_CANONICAL_PROMPT = `Create a seamless looping construction animation from the provided reference image.
The provided image is BOTH the exact START FRAME and exact END FRAME.
Preserve the exact red holographic geometry, perspective, line thickness, glow, nodes, base grid, proportions, placement, and visual style.
CAMERA:
Completely locked.
No zoom.
No pan.
No tilt.
No orbit.
No reframing.
No camera movement.
ANIMATION:
Begin exactly from the provided frame.
The existing red foundation remains anchored and stable.
From the center foundation, construct a futuristic architectural wireframe vertically upward in stages.
Red geometric lines extend upward from existing nodes.
New structural nodes illuminate as each level is created.
Horizontal platforms form.
Vertical framework rises.
Additional geometric levels assemble progressively from bottom to top.
The construction should feel precise, architectural, procedural, and engineered — like a digital structure being generated from a blueprint.
At the midpoint, reach the fully constructed tall red wireframe tower.
Briefly hold the completed structure.
Then reverse the construction naturally.
The highest geometry retracts first.
Upper levels collapse cleanly back into their originating nodes.
Platforms retract.
Vertical lines descend.
The structure progressively deconstructs from top to bottom.
Return EXACTLY to the original provided frame.
The final frame must be visually identical to the first frame so the video can repeat with no visible jump.
MOTION:
Smooth.
Controlled.
Elegant.
Technical.
Sequential.
No explosions.
No chaotic particles.
No morphing.
No random geometry.
No rotation of the structure.
RED HOLOGRAM:
Preserve the same luminous red.
Subtle energy may travel through lines as construction occurs.
Nodes may briefly brighten when activated.
Keep glow controlled and sophisticated.
BACKGROUND:
Transparent background only.
No environment.
No floor.
No pedestal.
No text.
No logos.
No additional objects.
LOOP:
START FRAME → BUILD UP → FULL STRUCTURE → BUILD DOWN → EXACT START FRAME.
The first and final frames must match perfectly.`;
