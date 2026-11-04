import type { ApprovedAmendment } from '../types.js';

/**
 * Release amendments for the 19 founder-approved living-world proposals (2026-10-25), merged into the season master's
 * approvedAmendments. Each text states the approved behaviour for that release only; the full approved behaviour and its
 * source are in the promotion ledger. Every quote in a text is a line the master already has. No runtime is added.
 * Pure data: the season master and the audit's baseline check both import this file.
 */
export const LIVING_WORLD_PREFIX = 'AM-LW-';
const APPROVAL = '2026-10-25 P0.THE-EXCHANGE.OPUS.LIVING-WORLD-FOUNDER-APPROVAL-AND-CANON-PROMOTION.V1';

export type LivingWorldAmendment = ApprovedAmendment & { founderApproval: string; productionHold: string | null };

const am = (releaseId: string, recommendationId: string, priority: string, beat: string, quote: string, text: string, productionHold: string | null): LivingWorldAmendment => ({
  amendmentId: `${LIVING_WORLD_PREFIX}${releaseId}-${recommendationId.replace('-', '')}`,
  recommendationId,
  text,
  classification: 'APPROVED_DEVELOPMENT_DIRECTION',
  placementEvidence: `${beat}: "${quote}" (${recommendationId}, ${priority}).`,
  runtimeEffect: 'None: inside the existing beat and runtime.',
  founderApproval: `${APPROVAL} (${priority})`,
  productionHold,
});

const SEAL = 'PENDING_DESIGN: the copper seal prop (one prop sheet for every Exchange envelope).';
const S101_PATCH = 'CONDITIONAL_PRODUCTION_HOLD: the S1-01 packet revision (patch plan PATCH-S101) awaits founder review';

const LIST: LivingWorldAmendment[] = [
  am('S1-01', 'FD-S101-06', 'FD-S101-06 RECURRING', 'S1-01 SC02 to SC04', 'a tailor locks up, a teenager practises a dance step at a bus stop, a grandmother hangs a jewel-green dress on a fire escape to air', 'The tailor, the teenager and the grandmother keep their S1-01 faces, wardrobe and mannerisms as recurring background identities, with no names and no connection to each other. Their approved returns are S1-51 (the teenager), S1-59 (the grandmother) and S1-77 (the grandmother and, separately, the tailor). The woman on the balcony and the neighbour stay scene-scoped.', `${S101_PATCH}; identity references are the SH02, SH05 and SH09 start frames, none generated.`),
  am('S1-01', 'S-02', 'P-11', 'S1-01 SC03 (SH05 to SH07)', 'a teenager practises a dance step at a bus stop', "The teenager's step is one specific four-count step: missed, tangled, then landed on the downbeat. It is a choreography note on the existing three shots; no shot, timing, keyframe, cue or runtime changes.", `${S101_PATCH}; PENDING_DESIGN: the four counts are not yet choreographed.`),
  am('S1-07', 'V-07', 'P-01', 'S1-07 beat 9', 'He puts it back face down.', "Face down in Vivienne's desk, her envelope shows its copper wax seal, intact.", SEAL),
  am('S1-11', 'V-07', 'P-01', 'S1-11 beat 4', "a courier returns it to Sloane's office, unopened", 'Sloane\'s invitation comes back from Celestine with its copper seal unbroken.', SEAL),
  am('S1-12', 'F-01', 'P-07', 'S1-12 beat 12', 'The night Nadine was born, Mavis drove Richard and his wife to the hospital in her fruit truck.', "Under this line the market falls away for a few seconds into the sound of a truck cab at night: the engine, the indicator ticking, a slow song on the radio. The picture stays on Mavis at her stall. No voices from the cab, and Richard's wife is never seen or heard.", 'CONDITIONAL_PRODUCTION_HOLD: the slow song is chosen or commissioned once for S1-12 and S1-20 (founder choice).'),
  am('S1-17', 'V-07', 'P-01', 'S1-17 beat 1', 'sealed in copper wax', "The source of the season's prop rule: Exchange envelopes carry a copper wax seal. The makers are seen reading terms already opened; no seal is broken on camera, because S1-86 holds the season's only on-screen break.", SEAL),
  am('S1-20', 'F-01', 'P-07', 'S1-20 beat 12', 'Clarence counts off something slow.', 'The slow number Clarence counts off is the song from the truck radio in S1-12, in a big-band arrangement.', 'CONDITIONAL_PRODUCTION_HOLD: the slow song is chosen or commissioned once for S1-12 and S1-20 (founder choice).'),
  am('S1-20', 'F-19', 'P-08', 'S1-20 beat 20', 'By the bandstand, a teenage girl writes in a notebook while the trumpet plays.', "Noelle is writing down a two-bar figure from Clarence's trumpet. One notebook insert.", 'PENDING_DESIGN: the two bars are written once in the composer brief; no composition is canon.'),
  am('S1-33', 'F-05', 'P-08', 'S1-33 beat 3', "For twelve years they've insulted each other on air", "Once, Yaz laughs on air at one of Tad's insults: not her on-air cackle but a short, unguarded laugh she covers fast. The audience hears it through the bakery radio.", 'PENDING_PRODUCTION: one laugh performance, recorded once and used in S1-33 and S1-50; no voice is authorized yet.'),
  am('S1-35', 'F-19', 'P-08', 'S1-35 beat 2', 'finds the harmony without asking', "Clarence's two bars are inside Noelle's melody. He hears his own phrase, which is why he picks up his trumpet without asking.", 'PENDING_DESIGN: the two bars are written once in the composer brief; no composition is canon.'),
  am('S1-37', 'F-04', 'P-06', 'S1-37 beat 16', 'Dee has been stretching the whole time.', "As Sloane sees Dee stretching, under the dusk track and faint enough to miss: a 1985 stadium crowd and a starter's pistol. Only Dee hears it, and she keeps stretching. The sound is Dee's memory, not a device.", "PENDING_PRODUCTION: a few seconds of 1985 crowd and starter's pistol."),
  am('S1-40', 'F-04', 'P-06', 'S1-40 beat 20', 'The bleachers, in last night\'s clothes, lose their minds.', "The Echo Track is silent: it carries light, not sound. When Zuri passes, the real bleachers' roar arrives where Dee's remembered crowd was. The 1985 crowd is never heard in S1-40.", null),
  am('S1-50', 'F-05', 'P-08', 'S1-50 beat 10', 'Then she laughs, and he knows that laugh from twelve years of insults.', 'The laugh Tad recognizes is the same laugh, the same performance, as in S1-33, so the audience recognizes it when he does.', 'PENDING_PRODUCTION: one laugh performance, recorded once and used in S1-33 and S1-50; no voice is authorized yet.'),
  am('S1-51', 'R-04', 'P-11', 'S1-51 beat 6', 'a drumline rehearses', "Among the kids following the drumline, the S1-01 teenager does his step: the same four counts, landed every time now, with no shelter glass to check it in. Nobody watches him, and Sloane's four beats at the end of the release stay her own.", `${S101_PATCH}; identity reference from the S1-01 SH05 start frame and the S-02 step.`),
  am('S1-57', 'V-07', 'P-01', 'S1-57 beat 1', 'turns over the envelope the family has left face down for ten years', 'When Sloane turns the envelope over, its copper seal is intact. She does not open it.', SEAL),
  am('S1-58', 'F-06', 'P-05', 'S1-58, the whole memory', 'a garage workshop thirty-one years ago, with a record player and solder smoke', "The memory's grammar. In: a needle drops on a record before the picture changes, and the garage record player is already playing when the garage appears. Framing: from doorway height, where Richard stood; he watched the dance and was not in it. What he did not witness appears as objects, not scenes: the typed letter to the standards body on a workbench, the newspaper folded on the bench, and no shot of Celestine reading it. Out: the needle lifts, and the study's room tone returns before the picture does.", 'CONDITIONAL_PRODUCTION_HOLD: face locks for Vivienne at 34 and Celestine at 33 (FD-18); PENDING_DESIGN: the needle cues and the letter and newspaper props.'),
  am('S1-59', 'R-05', 'P-10', 'S1-59 beat 2', "Kids on bikes ask what they're for.", "One of the kids on bikes is the girl from Kai's workshop (S1-22): his pliers hang from her handlebar on a string and her bloom light is taped to the basket. She looks at the lanterns like an engineer.", "PENDING_PRODUCTION: her face from S1-22 and Kai's pliers as a prop."),
  am('S1-59', 'R-01', 'P-10', 'S1-59 beats 4 and 5', 'A grandmother on a bench: "Something good. They\'re humming."', 'The grandmother on the bench is the S1-01 grandmother, in her house cardigan with her reading glasses on a chain. She says the line the master already gives her, "Something good. They\'re humming." No second grandmother, and no dress yet: the dress is saved for the river.', `${S101_PATCH}; identity reference from the S1-01 SH09 start frame. Voice production is not authorized.`),
  am('S1-59', 'T-12', 'P-04', 'S1-59 ending', 'One lantern flickers copper on its own, then goes dark.', 'The lantern that flickers is one specific lantern in a fixed position on the promenade, with a recorded copper flicker pattern. Nobody remarks on it.', 'PENDING_DESIGN: the lantern position and flicker pattern (one continuity note for S1-59 and S1-76).'),
  am('S1-74', 'F-19', 'P-08', 'S1-74 beat 1', "The orchestra plays Noelle's song in a full big-band arrangement.", "The trumpet section carries Clarence's two bars.", 'PENDING_DESIGN: the two bars are written once in the composer brief; no composition is canon.'),
  am('S1-75', 'T-10', 'P-02', 'S1-75 ending', 'The light returns to copper.', "As the stage light returns to copper, the room is already repeating Sloane's words to each other, table to table: the light stopped the cameras, not the talk. Background murmur inside the existing applause; no line explains it.", null),
  am('S1-76', 'T-12', 'P-04', 'S1-76 beat 1', 'Fifteen minutes before midnight, the system fails.', 'A moment before the failure, the same lantern, in the same position on the promenade, flickers the same copper pattern as in S1-59. Nobody says so, and the failure itself is unchanged.', 'PENDING_DESIGN: the lantern position and flicker pattern (one continuity note for S1-59 and S1-76).'),
  am('S1-77', 'F-07', 'P-05', 'S1-77 beat 8', "A memory flash, in Celestine's recollection: two young women dancing in a garage under the first gold light.", "The flash is the participant's version of S1-58: the camera inside the dance at eye level, hands and light, never the doorway. The first gold light hums, the same hum the grandmother on the bench heard in the lanterns. Same garage set and costumes as S1-58.", 'CONDITIONAL_PRODUCTION_HOLD: face locks for Vivienne at 34 and Celestine at 33 (FD-18); reuses the S1-58 garage and costumes.'),
  am('S1-77', 'W-01', 'P-09', 'S1-77 beat 10', 'On the far bank, crowds see the gold, and their capture is bound to revocation.', 'The far bank is the city\'s own party, which nobody invited and nobody organised: a brass band that turned up, a food truck, Mavis\'s hats, kids on bikes, people who came because they heard something good was happening. They are not spectators of the Night and have no Exchange access; they are having their own. Same place and time as the master.', null),
  am('S1-77', 'R-02', 'P-09', 'S1-77 beat 10', 'On the far bank, crowds see the gold', 'In the far-bank crowd, in one shot, the camera finds the jewel-green dress first, from behind, then the S1-01 grandmother wearing it, her face lit gold from across the water. She is in the public crowd, not at the private Night. The dress is the S1-01 garment, whose design is not yet chosen.', `CONDITIONAL_PRODUCTION_HOLD: FD-S101-05 garment design is open, so no dress reference, keyframe or callback shot is generated until the founder approves the silhouette; ${S101_PATCH.replace('CONDITIONAL_PRODUCTION_HOLD: ', '')}.`),
  am('S1-77', 'R-03', 'P-09', 'S1-77 beat 10', 'On the far bank, crowds see the gold', "Separately in the far-bank crowd, the S1-01 tailor, anonymous, in a suit that is plainly his own work, straightens a stranger's lapel without asking, the way he straightened the mannequin's. No shop sign, no name, no orange, and he does not look across at Sloane. No shot or interaction with the grandmother is required or implied.", `${S101_PATCH}; identity reference from the S1-01 SH02 start frame.`),
  am('S1-78', 'V-07', 'P-01', 'S1-78 beat 6', 'Celestine holds it without opening it.', 'Celestine holds the envelope seal-up without opening it.', SEAL),
  am('S1-82', 'F-19', 'P-08', 'S1-82 beat 3', "Noelle's song becomes the Crescent Room's Saturday closer.", "The closer carries Clarence's two bars.", 'PENDING_DESIGN: the two bars are written once in the composer brief; no composition is canon.'),
  am('S1-86', 'V-07', 'P-01', 'S1-86 beat 1', 'Celestine opens the envelope.', "As Celestine opens the envelope the copper seal cracks: the only seal broken on screen all season, and the only time that sound is heard.", 'PENDING_DESIGN: the copper seal prop and the seal-crack sound (one cue, used once).'),
  am('S1-86', 'T-01', 'P-12', 'S1-86 beat 6', 'She sends one Relay, to Richard', "Celestine writes her three lines and the ink sinks into the card while her pen is still lifted, exactly as it did for Tina in S1-15. She can no longer read what she wrote. She lets it go out of frame: no courier, no delivery shown.", 'PENDING_PRODUCTION: reuses the S1-15 Relay effect, which is not yet produced.'),
];

export const LIVING_WORLD_AMENDMENTS: Record<string, LivingWorldAmendment[]> = LIST.reduce<Record<string, LivingWorldAmendment[]>>((acc, a) => {
  const releaseId = a.amendmentId.slice(LIVING_WORLD_PREFIX.length, LIVING_WORLD_PREFIX.length + 5);
  (acc[releaseId] ??= []).push(a);
  return acc;
}, {});

/** The master as it was before this promotion: every living-world amendment removed. The audit compares this view with its baseline. */
export function withoutLivingWorldAmendments<T extends { releases: Array<{ approvedAmendments: ApprovedAmendment[] }> }>(master: T): T {
  return { ...master, releases: master.releases.map((r) => ({ ...r, approvedAmendments: r.approvedAmendments.filter((a) => !a.amendmentId.startsWith(LIVING_WORLD_PREFIX)) })) };
}
