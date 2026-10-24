import type { DirectorsIntent, PerformanceDirection } from '../../directorial/types.js';
import { PERFORMANCE_GLOBAL_AVOID } from '../../directorial/intent.js';

export const INTENT: DirectorsIntent = {
  unitId: 'S1-01',
  dramaticPurpose: 'Open the season on the world before any principal: a city that gets ready for the night, and one everyday courtesy, the Ember, that lets people be seen without being captured.',
  emotionalCenter: 'The woman on the balcony raising her glass to the neighbour who just tried to film her: grace answering a small intrusion, without a closed curtain.',
  characterObjectives: {
    TAILOR: 'Leave the work looking right before he locks up.',
    TEENAGER: 'Land the step for himself, with nobody watching.',
    GRANDMOTHER: 'Have the dress ready for tonight, and approve of it.',
    'WOMAN ON THE BALCONY': 'Dance for herself, and stay unembarrassed when she is noticed.',
    NEIGHBOUR: 'Capture something lovely on reflex, then stand down when the city says no.',
  },
  subtext: 'Being seen is not being captured. Everyone here is preparing to be looked at tonight, and the Ember protects the difference between an audience and a recording.',
  powerDynamics: 'The phone holds power for one second; the copper glow takes it back without a word, and the woman decides how the moment ends by raising a glass.',
  informationControl: {
    before: 'The audience knows nothing: no names, no house, no rules of this world.',
    during: 'The audience learns one rule by watching it work: a copper glow on a lens means capture declined, and people respect it.',
    after: 'The audience knows the city dresses for the night and that everyone is heading somewhere with lit ballroom windows.',
    withheld: ['Who designed the Ember and that gold means yes (S1-58)', 'What Halcyon House looks like from outside', 'Who any of these people are'],
  },
  cinematicPointOfView: 'An affectionate secret witness: the camera sees each private moment from a respectful distance, then takes the neighbour\'s point of view once, at the moment he gives up the recording.',
  visualDramaturgy: {
    blocking: 'Each inhabitant performs one private action alone; nobody shares a frame until the toast crosses the street.',
    camera: 'Mostly locked off for the vignettes so the gestures carry; the camera only moves to open (tilt down) and to close (rise and push).',
    light: 'Dusk compressed from golden to blue across the release; copper is the sun at the start and only the Ember at blue hour.',
    costume: 'Everyday clothes on everyone except the jewel-green dress, which is the one garment dressed for the night.',
    architecture: 'Brownstones, fire escapes and a balcony across from a window; geography held so the toast reads across a real street.',
    editing: 'Vignettes of varied length, cuts on action and on beats, a held silence on the Ember, then one continuous rise to black.',
  },
  atmosphere: 'Warm, funny and unhurried: the last minute of daylight in a neighbourhood where people still dress up and still look out for each other.',
  sonicIdentity: 'A big band warming up out of sight becomes the groove of the street, stops dead on the Ember, and returns as the real band heard from the ballroom.',
  endingImpression: 'The audience should want to go where everyone is going: across the rooftops to the lit windows of Halcyon House, on a night that is about to begin.',
};

export const TREATMENT = {
  feel: 'A neighbourhood overture: five strangers getting ready for the same night, watched with affection.',
  perspective: 'Secret witness, then one point-of-view shot for the toast.',
  language: 'Locked-off vignettes, one gesture each; motion reserved for the opening tilt and the closing rise.',
  atmosphere: 'Dusk turning blue; copper light on glass gives way to amber windows.',
  rhythm: 'Four- to seven-second vignettes cut on action and beats; a slowed Ember beat in silence; one long rise into a ringing chord.',
};

const avoid = (...xs: string[]) => [...xs, ...PERFORMANCE_GLOBAL_AVOID];
const pd = (d: Omit<PerformanceDirection, 'speaking' | 'tempo' | 'listening' | 'silence'> & Partial<PerformanceDirection>): PerformanceDirection => ({
  speaking: false, tempo: 'No dialogue; physical tempo set per shot', listening: 'Not applicable: nobody speaks', silence: 'The whole release is wordless; the performance lives in gesture and the eyes.', ...d,
});

/** Inhabitants are directed as people with a life, without permanent character packages (sprint V2 §28). */
export const PERFORMANCE: PerformanceDirection[] = [
  pd({ character: 'TAILOR', shots: ['S1-01-SH02', 'S1-01-SH03', 'S1-01-SH04'], objective: 'Leave the window right before he goes home.', emotionalState: 'Tired, content, particular.',
    subtext: 'The work is his pride; locking up is a small ceremony.', relationshipDynamic: 'With his work, as with an old friend.', emphasis: 'The stop halfway down and the two lapel corrections.', restraint: 'HIGH',
    physicalBehavior: 'Economical, practised hands; no wasted motion.', eyes: 'On the grille, then on the lapel, then a last look at the mannequin.', microExpressions: 'A slight tightening at the crooked lapel, eased when it is right.',
    reactionTiming: 'He notices the lapel only as the grille passes it, so the stop is a thought, not a startle.', avoid: avoid('mugging satisfaction to camera', 'a big smile') }),
  pd({ character: 'TEENAGER', shots: ['S1-01-SH05', 'S1-01-SH06', 'S1-01-SH07'], objective: 'Land the step before the bus comes.', emotionalState: 'Determined, self-conscious, then quietly proud.',
    subtext: 'He is rehearsing for somebody tonight but would die if anyone saw.', relationshipDynamic: 'With his reflection: coach and critic.', emphasis: 'The landing on the downbeat and the grin in the glass.', restraint: 'MEDIUM',
    physicalBehavior: 'Loose, a little gangly on the misses; clean and sharp on the landing.', eyes: 'Locked on his reflection; one quick glance round after the landing.', microExpressions: 'A small wince at each miss; the grin starts in the eyes before the mouth.',
    reactionTiming: 'The grin comes a beat after the landing, when he realises it worked.', avoid: avoid('a full dance routine', 'looking into the lens', 'celebrating with fists') }),
  pd({ character: 'GRANDMOTHER', shots: ['S1-01-SH08', 'S1-01-SH09', 'S1-01-SH10'], objective: 'Have the dress ready and approve of it.', emotionalState: 'Fond, amused, quietly excited for the night.',
    subtext: 'The dress has a history; tonight it gets another evening out.', relationshipDynamic: 'With the dress, as if it has a date and she approves of him.', emphasis: 'The long look and the tiny nod.', restraint: 'HIGH',
    physicalBehavior: 'Sure hands on fabric; she has done this many times.', eyes: 'A long, appraising look from hem to neckline.', microExpressions: 'The corner of the mouth lifts; one eyebrow agrees.',
    reactionTiming: 'The nod comes at the end of the look, not the start.', avoid: avoid('frailty', 'tearful nostalgia', 'talking to the dress') }),
  pd({ character: 'WOMAN ON THE BALCONY', shots: ['S1-01-SH11', 'S1-01-SH12', 'S1-01-SH16', 'S1-01-SH17'], objective: 'Dance for herself; when noticed, answer with grace and keep dancing.', emotionalState: 'Free, unembarrassed, then amused and generous.',
    subtext: 'She knows the city has her back; she can afford to be kind about it.', relationshipDynamic: 'With the neighbour: strangers across a street; she forgives him before he has finished being embarrassed.', emphasis: 'The raised glass, then turning straight back to her dance.', restraint: 'MEDIUM',
    physicalBehavior: 'Loose, rhythmic, a little silly with the spoon; the toast is a small lift, not a flourish.', eyes: 'Half closed while dancing; straight across the street at him for the toast.', microExpressions: 'A knowing half-smile as she lifts the glass.',
    reactionTiming: 'She has already seen everything when SH16 starts; the glass rises without hesitation.', avoid: avoid('flirting', 'hurt or anger', 'performing for the camera', 'closing the curtain') }),
  pd({ character: 'NEIGHBOUR', shots: ['S1-01-SH13', 'S1-01-SH15'], objective: 'Capture something lovely on reflex, then stand down.', emotionalState: 'Idle amusement turning to embarrassment.',
    subtext: 'He is not a villain; he forgot himself for a second and the city reminded him.', relationshipDynamic: 'With the woman: a stranger who catches himself being rude.', emphasis: 'The lowered phone and the look away.', restraint: 'HIGH',
    physicalBehavior: 'Casual lift of the phone; a smaller, quicker lowering.', eyes: 'Screen left at her balcony; down and away after the glow.', microExpressions: 'A small embarrassed exhale; lips press together.',
    reactionTiming: 'He lowers the phone a beat after the glow, as the meaning lands.', avoid: avoid('menace', 'an apology mime', 'shock') }),
];
