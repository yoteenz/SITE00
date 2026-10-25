/**
 * Asset dependency ledger for the approved directions. A source description is not an asset: nothing below exists as a
 * file or provider asset, so nothing is EXISTS_VERIFIED or FOUNDER_APPROVED. No URL, file path or provider ID is recorded
 * for anything that does not exist. Nothing is generated or commissioned by this sprint.
 */
export const ASSET_STATUSES = ['EXISTS_VERIFIED', 'FOUNDER_APPROVED', 'PROVISIONAL', 'PENDING_IMPORT', 'PENDING_DESIGN', 'PENDING_PRODUCTION', 'NOT_REQUIRED'] as const;
export type LivingWorldAssetStatus = (typeof ASSET_STATUSES)[number];

export type ProductionHold = { holdId: string; blocks: string[]; reason: string; liftedBy: string; lifted?: { date: string; by: string } };

/** Production holds (layer B). A hold blocks generation, never the creative approval. */
export const PRODUCTION_HOLDS: ProductionHold[] = [
  { holdId: 'HOLD-FD-S101-05', blocks: ['R-02'], reason: "The jewel-green dress has no approved design. No dress reference, keyframe (KF-WD-GREEN-DRESS) or S1-77 callback shot may be generated.", liftedBy: 'Founder visual approval of the garment at S1-01 visual development (FD-S101-05).' },
  { holdId: 'HOLD-S101-PATCH', blocks: ['S-02', 'R-01', 'R-02', 'R-03', 'R-04'], reason: 'The S1-01 packet still describes the three inhabitants as scene-scoped. Their start frames must be made as recurring identity references.', liftedBy: 'Founder review of the S1-01 patch plan (PATCH-S101-01 to -07), then a packet rebuild.', lifted: { date: '2026-10-25', by: 'Founder authorized PATCH-S101-01 to -07; the packet was rebuilt with them (P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1).' } },
  { holdId: 'HOLD-FD-S101-12', blocks: ['S-02', 'R-04'], reason: "The teenager's four-count step is not choreographed (CHOREOGRAPHY_LOCK_PENDING). Its S1-01 start frame (KF-SF-SH05) and the S1-51 return wait for it.", liftedBy: 'Founder locks the four counts (FD-S101-12).' },
  { holdId: 'HOLD-SONG', blocks: ['F-01'], reason: 'The fruit-truck song is not chosen; it must be one song for S1-12 and S1-20.', liftedBy: 'Founder chooses or commissions the song.' },
  { holdId: 'HOLD-FD-18', blocks: ['F-06', 'F-07'], reason: 'S1-58 and S1-77 need face locks for Vivienne at 34 and Celestine at 33 (FD-18, still open).', liftedBy: 'Founder face locks for the memory faces.' },
];

export type AssetRequirement = { assetId: string; item: string; proposalIds: string[]; releases: string[]; status: LivingWorldAssetStatus; source: string; holds: string[]; note: string };

export const ASSET_REQUIREMENTS: AssetRequirement[] = [
  { assetId: 'LW-FACE-TAILOR', item: "The tailor's facial reference", proposalIds: ['R-03'], releases: ['S1-01', 'S1-77'], status: 'PENDING_PRODUCTION', source: 'S1-01 start frame KF-SF-SH02 (planned, not generated)', holds: [], note: 'Made once in S1-01 and reused.' },
  { assetId: 'LW-FACE-GRANDMOTHER', item: "The grandmother's facial reference and performance", proposalIds: ['R-01', 'R-02'], releases: ['S1-01', 'S1-59', 'S1-77'], status: 'PENDING_PRODUCTION', source: 'S1-01 start frame KF-SF-SH10, her first face-readable frame (planned, not generated)', holds: [], note: 'One face and performance in all three releases.' },
  { assetId: 'LW-FACE-TEENAGER', item: "The teenager's facial reference", proposalIds: ['R-04'], releases: ['S1-01', 'S1-51'], status: 'PENDING_PRODUCTION', source: 'S1-01 start frame KF-SF-SH05 (planned, not generated)', holds: ['HOLD-FD-S101-12'], note: 'Made once in S1-01 and reused.' },
  { assetId: 'LW-FACE-PLIERS-GIRL', item: "The girl from Kai's workshop", proposalIds: ['R-05'], releases: ['S1-22', 'S1-59'], status: 'PENDING_PRODUCTION', source: 'S1-22 (not in production)', holds: [], note: 'Made when S1-22 is produced; S1-59 reuses it.' },
  { assetId: 'LW-DANCE-FOUR-COUNT', item: "The teenager's four-count step", proposalIds: ['S-02', 'R-04'], releases: ['S1-01', 'S1-51'], status: 'PENDING_DESIGN', source: 'Choreography note (S-02, E-14); the step itself is not choreographed', holds: ['HOLD-FD-S101-12'], note: 'The same four counts in both releases.' },
  { assetId: 'LW-WD-TAILOR', item: "The tailor's recognizable appearance", proposalIds: ['R-03'], releases: ['S1-01', 'S1-77'], status: 'PROVISIONAL', source: 'S1-01 packet wardrobe (directorial interpretation); S1-77: a suit of his own making, not orange', holds: [], note: 'Approved with the S1-01 start frames.' },
  { assetId: 'LW-WD-GRANDMOTHER', item: "The grandmother's everyday look", proposalIds: ['R-01'], releases: ['S1-01', 'S1-59'], status: 'PROVISIONAL', source: 'S1-01 packet wardrobe: house cardigan, reading glasses on a chain', holds: [], note: 'Approved with the S1-01 start frames.' },
  { assetId: 'LW-WD-GREEN-DRESS', item: 'The jewel-green dress', proposalIds: ['R-02'], releases: ['S1-01', 'S1-77'], status: 'PENDING_DESIGN', source: 'S1-01 keyframe requirement KF-WD-GREEN-DRESS (blocked by FD-S101-05)', holds: ['HOLD-FD-S101-05'], note: 'One garment; story continuity approved, design open. Not production-ready.' },
  { assetId: 'LW-PROP-COPPER-SEAL', item: 'The copper wax seal on Exchange envelopes', proposalIds: ['V-07'], releases: ['S1-07', 'S1-11', 'S1-17', 'S1-57', 'S1-78', 'S1-86'], status: 'PENDING_DESIGN', source: 'Master S1-17 ("sealed in copper wax")', holds: [], note: 'One prop sheet for every Exchange envelope.' },
  { assetId: 'LW-SFX-SEAL-CRACK', item: 'The seal-crack sound', proposalIds: ['V-07'], releases: ['S1-86'], status: 'PENDING_DESIGN', source: 'V-07', holds: [], note: 'Heard once.' },
  { assetId: 'LW-VFX-RELAY', item: 'The Relay ink-sink effect', proposalIds: ['T-01', 'T-02'], releases: ['S1-15', 'S1-34', 'S1-86'], status: 'PENDING_DESIGN', source: 'Master S1-15 ("The card goes blank in Tina\'s hand.")', holds: [], note: 'Designed once for S1-15 and reused in S1-86. Its invention dossier is still open (U-5).' },
  { assetId: 'LW-VFX-LANTERN-FLICKER', item: 'The flickering lantern: position and copper pattern', proposalIds: ['T-12'], releases: ['S1-59', 'S1-76'], status: 'PENDING_DESIGN', source: 'Master S1-59 ending', holds: [], note: 'One continuity note for both releases.' },
  { assetId: 'LW-MUS-TRUCK-SONG', item: 'The fruit-truck song', proposalIds: ['F-01'], releases: ['S1-12', 'S1-20'], status: 'PENDING_DESIGN', source: 'MO-01', holds: ['HOLD-SONG'], note: 'Chosen or commissioned once.' },
  { assetId: 'LW-SFX-TRUCK-CAB', item: 'The truck cab at night: engine and indicator', proposalIds: ['F-01'], releases: ['S1-12'], status: 'PENDING_PRODUCTION', source: 'F-01', holds: [], note: 'A few seconds under one line; no new scene.' },
  { assetId: 'LW-SFX-1985-CROWD', item: "Dee's remembered 1985 crowd and starter's pistol", proposalIds: ['F-04'], releases: ['S1-37'], status: 'PENDING_PRODUCTION', source: 'MO-06', holds: [], note: 'Never heard in S1-40.' },
  { assetId: 'LW-PERF-YAZ-LAUGH', item: "Yaz's unguarded laugh", proposalIds: ['F-05'], releases: ['S1-33', 'S1-50'], status: 'PENDING_PRODUCTION', source: 'MO-02', holds: [], note: 'One performance for both releases. No voice is cast or authorized.' },
  { assetId: 'LW-MUS-TWO-BARS', item: "Clarence's two bars", proposalIds: ['F-19'], releases: ['S1-20', 'S1-35', 'S1-74', 'S1-82'], status: 'PENDING_DESIGN', source: 'MO-03', holds: [], note: 'Written once by the composer; no composition is canon.' },
  { assetId: 'LW-SFX-GOLD-HUM', item: 'The hum of the first gold light', proposalIds: ['F-07'], releases: ['S1-59', 'S1-77'], status: 'PENDING_DESIGN', source: 'MO-04', holds: [], note: 'The same hum in both releases.' },
  { assetId: 'LW-FLASHBACK-S1-58', item: 'S1-58 doorway grammar: needle cues, workbench letter, folded newspaper', proposalIds: ['F-06'], releases: ['S1-58'], status: 'PENDING_DESIGN', source: 'F-06', holds: ['HOLD-FD-18'], note: 'Camera height and two props inside the existing 2:15.' },
  { assetId: 'LW-FLASHBACK-S1-77', item: 'S1-77 participant grammar: inside the dance', proposalIds: ['F-07'], releases: ['S1-77'], status: 'PENDING_PRODUCTION', source: 'F-07; reuses the S1-58 garage and costumes', holds: ['HOLD-FD-18'], note: 'Shares sets and faces with S1-58, not camera positions.' },
  { assetId: 'LW-ENV-FAR-BANK', item: 'The public riverbank celebration', proposalIds: ['W-01', 'R-02', 'R-03'], releases: ['S1-77'], status: 'PENDING_DESIGN', source: 'SET-RIVER-HALL (registered set, no approved reference) and master S1-77 beat 10', holds: [], note: 'Crowd direction inside existing coverage: a brass band, a food truck, hats, kids on bikes.' },
  { assetId: 'LW-PROP-KAI-PLIERS', item: "Kai's pliers on a string, and her bloom light", proposalIds: ['R-05'], releases: ['S1-22', 'S1-59'], status: 'PENDING_DESIGN', source: 'Master S1-22', holds: [], note: 'One prop across two releases.' },
  { assetId: 'LW-CROWD-S1-75', item: 'The room repeating Sloane\'s words', proposalIds: ['T-10'], releases: ['S1-75'], status: 'PENDING_PRODUCTION', source: 'T-10', holds: [], note: 'Background murmur inside the existing applause; no scripted line.' },
  { assetId: 'LW-VOICE-GRANDMOTHER', item: "The grandmother's voice for her one S1-59 line", proposalIds: ['R-01'], releases: ['S1-59'], status: 'PENDING_PRODUCTION', source: 'Master S1-59', holds: [], note: 'Voice production is not authorized by this sprint.' },
  { assetId: 'LW-RULES', item: 'Relay rules and the gold ladder', proposalIds: ['T-02', 'T-11'], releases: [], status: 'NOT_REQUIRED', source: 'WR-02, WR-04', holds: [], note: 'Written rules; no asset.' },
];
