/**
 * P0.E.FT4 — Astral World master visual contract (prompt preamble).
 */

export const ASTRAL_MASTER_VISUAL_CONTRACT_V1 = `ASTRAL WORLD — MASTER VISUAL CONTRACT v1

A luxurious living astral universe centered on intuition, tarot, human connection, spiritual reflection, community, and personal guidance.

Visual character:
- cinematic, immersive, sophisticated, warm, inhabited, deeply dimensional, premium
- mystical without cliché, celestial without generic outer-space imagery
- ornate without visual clutter, intimate despite scale
- modern human life interpreted through timeless mysticism

Core palette:
- midnight navy, near-black blue, antique gold, warm amber, candlelight
- selective emerald, royal blue, burgundy, warm human skin tones

Material language:
- aged brass, antique gold, dark wood, velvet, glass, polished stone, aged paper, candlelight

Avoid:
- generic purple crystal shop, Halloween witch, gothic horror, cyberpunk, neon sci-fi
- generic fantasy RPG, cartoon environment, cheap fortune teller imagery
- empty sterile rooms, generic luxury hotel, corporate architecture
- fake application UI, random floating tarot cards, illegible generated text

Human presence: real, warm, social, diverse, contemporary, comfortable, intentional.
The visual world should feel inhabitable rather than staged.`;

export const ASTRAL_NEGATIVE_UI_CONSTRAINTS = [
  'NO TEXT',
  'NO LOGOS',
  'NO BUTTONS',
  'NO WEBSITE UI',
  'NO APP INTERFACE',
  'NO GENERATED SIGNAGE',
  'NO PRICING LABELS',
  'NO CARD BORDERS',
  'NO NAVIGATION CHROME',
];

export function astralNegativeBlock(extra: string[] = []): string {
  return [...ASTRAL_NEGATIVE_UI_CONSTRAINTS, ...extra].join('. ');
}
