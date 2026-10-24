import type { MusicCue, MusicRights, SoundCue, SubtitleEvent } from '../../directorial/types.js';

const RIGHTS: MusicRights = {
  requirement: 'ORIGINAL_COMPOSITION',
  dependency: "Route undecided (FD-S101-02): a commissioned composer (cost UNKNOWN), fal ElevenLabs music (commercial terms need founder review), or the founder's ElevenLabs workspace (no credential here).",
  status: 'NOT_CLEARED',
};
const BAND = ['trumpet', 'trombone', 'saxophone section', 'upright bass', 'drum kit with brushes', 'piano'];
const NO_DIALOGUE = 'No dialogue in this release; the music carries the edit with the street.';

/**
 * Music arc: the Halcyon House band warming up out of sight (source) becomes the groove that carries the vignettes (score),
 * stops dead on the Ember (declared silence), returns on the raised glass and resolves into the band's real first chord heard from the ballroom (score to source).
 */
export const MUSIC: MusicCue[] = [
  {
    cueId: 'S1-01-MX01', title: 'Warm-Up', at: 0, frames: 324, cueType: 'SOURCE', diegesis: 'DIEGETIC', functions: ['ATMOSPHERE', 'CULTURAL_CONTEXT'],
    genre: 'Jazz', subgenre: 'Big band warming up: loose phrases, not yet a tune', mood: 'Anticipation, an evening about to start',
    tempoRange: 'Free, settling toward 96 BPM by frame 234', instrumentation: ['trumpet', 'upright bass', 'drum kit with brushes'], vocal: 'INSTRUMENTAL',
    energy: 'Low, rising', dynamicArc: 'A lone trumpet phrase, then walking bass, then brushes finding time', entry: 'Fades in with the picture at frame 0, distant and slightly echoing',
    exit: 'Hands over to MX02 on the downbeat at frame 324', relationToDialogue: NO_DIALOGUE, relationToSfx: 'Sits behind the street bed; the street stays louder until the groove starts',
    relationToEditing: 'Free time lets the vignettes cut on action rather than on beats until the teenager finds the beat.',
    culturalReferences: 'The Halcyon House band (S1-03 same night); the restored 1920s Black-owned hotel tradition of live big band', rights: RIGHTS,
    hitPoints: [{ frame: 0, event: 'Lone trumpet phrase in the distance' }, { frame: 96, event: 'Walking bass enters on the tailor' }, { frame: 234, event: 'Brushes settle into time under the teenager' }],
    label: 'DIRECTORIAL_INTERPRETATION',
  },
  {
    cueId: 'S1-01-MX02', title: 'Getting Ready', at: 324, frames: 360, cueType: 'SCORE', diegesis: 'NON_DIEGETIC', functions: ['CELEBRATION', 'CHARACTER_IDENTITY'],
    genre: 'Jazz and soul', subgenre: 'Big-band groove over a soul backbeat', mood: 'Private joy, warm humour',
    tempoRange: '96 BPM: one beat is 15 frames, so frames 324, 384 and 684 fall on bar lines', instrumentation: BAND, vocal: 'INSTRUMENTAL',
    energy: 'Medium-high', dynamicArc: 'Lands full on the downbeat, a horn accent on the dress, brightens for the dance, thins to bass and brushes at 636, stops dead at 684',
    entry: 'Downbeat at frame 324 as the teenager lands the step', exit: 'Hard stop at frame 684 on the cut to the copper lens; no tail, no reverb ring',
    relationToDialogue: NO_DIALOGUE, relationToSfx: 'Foley stays audible under it; footsteps and fabric are mixed to the groove',
    relationToEditing: 'Cuts within SC04 and SC05 land on beats; the thinning at 636 marks the turn before anyone sees it.',
    culturalReferences: 'Season palette: jazz, soul and funk (PK-014)', rights: RIGHTS,
    hitPoints: [{ frame: 324, event: 'Downbeat: the teenager lands the step' }, { frame: 384, event: 'Horn accent as the dress opens' }, { frame: 528, event: 'Groove brightens for the dancing woman' }, { frame: 636, event: 'Thins to bass and brushes as the phone rises' }, { frame: 684, event: 'Hard stop on the copper lens' }],
    label: 'DIRECTORIAL_INTERPRETATION',
  },
  {
    cueId: 'S1-01-MXS1', title: 'The Ember', at: 684, frames: 114, cueType: 'SILENCE', diegesis: 'NONE', functions: ['NARRATIVE_PAYOFF'],
    genre: 'None', subgenre: 'None', mood: 'Held breath', tempoRange: 'None', instrumentation: [], vocal: 'NONE', energy: 'None',
    dynamicArc: 'Only the street', entry: 'Hard cut from MX02 at frame 684', exit: 'MX03 enters at frame 798 as the glass goes up',
    relationToDialogue: 'None', relationToSfx: 'The thinned street bed (AMB02) is the only sound; the Ember itself makes none',
    relationToEditing: 'The stop is the Ember. Silence across the lens, his lowered phone and the start of her toast makes the city\'s no audible without a designed effect.',
    culturalReferences: 'None', rights: { requirement: 'NONE', dependency: null, status: 'NOT_REQUIRED' }, hitPoints: [], label: 'DIRECTORIAL_INTERPRETATION',
  },
  {
    cueId: 'S1-01-MX03', title: 'Halcyon', at: 798, frames: 282, cueType: 'SCORE_TO_SOURCE', diegesis: 'NON_DIEGETIC_TO_DIEGETIC', functions: ['NARRATIVE_PAYOFF', 'TRANSITION'],
    genre: 'Jazz', subgenre: 'Big band: groove returns, broadens into a full ensemble chord', mood: 'Generosity, then arrival',
    tempoRange: '96 BPM on the return, broadening freely into the chord at 990', instrumentation: BAND, vocal: 'INSTRUMENTAL',
    energy: 'Medium, building to full', dynamicArc: 'Groove back on the glass, horns build through the rise, full chord on the windows, rings out on black',
    entry: 'Groove returns at frame 798 as she raises the glass', exit: 'The chord rings out through black and ends at frame 1080',
    relationToDialogue: NO_DIALOGUE, relationToSfx: 'Rooftop air under it; the far car in SH17 sits below the horns',
    relationToEditing: 'The rise and the push are timed so the windows arrive on the chord at 990; the cut to black at 1044 lets the chord ring alone.',
    culturalReferences: 'By the final chord the music is the Halcyon House band heard through the ballroom windows', rights: RIGHTS,
    hitPoints: [{ frame: 798, event: 'Groove returns on the raised glass' }, { frame: 846, event: 'Horns build as the camera rises' }, { frame: 990, event: 'First full chord as the ballroom windows arrive' }, { frame: 1044, event: 'Cut to black; the chord rings' }, { frame: 1080, event: 'Ring-out ends' }],
    label: 'DIRECTORIAL_INTERPRETATION',
  },
];

const sc = (s: Omit<SoundCue, 'label' | 'continuesUnderCut' | 'syncPoints'> & Partial<SoundCue>): SoundCue => ({ continuesUnderCut: false, syncPoints: [], label: 'DIRECTORIAL_INTERPRETATION', ...s });
const shots = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `S1-01-SH${String(from + i).padStart(2, '0')}`);

export const SOUND: SoundCue[] = [
  sc({ cueId: 'S1-01-AMB01', track: 'AMBIENCE', layer: 'AMBIENCE', at: 0, frames: 636, description: 'Street bed: a bus sighing at the stop, a door, distant laughter, light traffic', perspective: 'Exterior; distance follows each vignette', reverb: 'Short slap off brownstone facades', linkedShots: shots(1, 12), continuesUnderCut: true }),
  sc({ cueId: 'S1-01-AMB02', track: 'AMBIENCE', layer: 'AMBIENCE', at: 636, frames: 210, description: 'The same street, thinner and closer: a breeze, a far car, the hum of his reading lamp through the open window', perspective: 'From his window across the street', reverb: 'Open air, little reflection', linkedShots: shots(13, 16), continuesUnderCut: true }),
  sc({ cueId: 'S1-01-AMB03', track: 'AMBIENCE', layer: 'AMBIENCE', at: 846, frames: 210, description: 'Rooftop air: wind across water towers, the street far below', perspective: 'High and wide', reverb: 'Open air', linkedShots: shots(17, 18), continuesUnderCut: true }),
  sc({ cueId: 'S1-01-FL01', track: 'FOLEY', layer: 'FOLEY', at: 100, frames: 40, description: 'Grille rattles down on its runners and stops', perspective: 'Close, pavement', reverb: 'Street slap', linkedShots: ['S1-01-SH02'], syncPoints: [{ frame: 130, event: 'Grille stops halfway' }] }),
  sc({ cueId: 'S1-01-FL02', track: 'FOLEY', layer: 'FOLEY', at: 198, frames: 36, description: 'Grille rolls to the ground; a palm pats the window glass', perspective: 'Close, pavement', reverb: 'Street slap', linkedShots: ['S1-01-SH04'], syncPoints: [{ frame: 210, event: 'Grille meets the ground' }, { frame: 226, event: 'Pat on the glass' }] }),
  sc({ cueId: 'S1-01-FL03', track: 'FOLEY', layer: 'FOLEY', at: 234, frames: 135, description: 'Sneakers scuff and squeak on the pavement through three attempts', perspective: 'Close, kerb level', reverb: 'Shelter glass reflection', linkedShots: shots(5, 7), syncPoints: [{ frame: 324, event: 'Heel lands on the downbeat' }] }),
  sc({ cueId: 'S1-01-FL04', track: 'FOLEY', layer: 'FOLEY', at: 369, frames: 41, description: 'Fabric snaps open over the rail', perspective: 'Medium, from the street', reverb: 'Brick slap', linkedShots: ['S1-01-SH08'], syncPoints: [{ frame: 384, event: 'Dress opens' }] }),
  sc({ cueId: 'S1-01-FL05', track: 'FOLEY', layer: 'FOLEY', at: 429, frames: 36, description: 'Palms smoothing the skirt fabric', perspective: 'Close', reverb: 'Dry', linkedShots: ['S1-01-SH09'] }),
  sc({ cueId: 'S1-01-FL06', track: 'FOLEY', layer: 'FOLEY', at: 528, frames: 108, description: 'Bare feet on kitchen tiles; the spoon tapping the counter edge', perspective: 'Medium, through the balcony door', reverb: 'Small tiled kitchen', linkedShots: shots(11, 12), syncPoints: [{ frame: 600, event: 'Spoon twirl' }] }),
  sc({ cueId: 'S1-01-FL07', track: 'FOLEY', layer: 'FOLEY', at: 636, frames: 48, description: 'Sleeve rustle as he lifts the phone off the sill', perspective: 'Close, at his window', reverb: 'Small room behind him', linkedShots: ['S1-01-SH13'], syncPoints: [{ frame: 650, event: 'Phone leaves the sill' }] }),
  sc({ cueId: 'S1-01-FL08', track: 'FOLEY', layer: 'FOLEY', at: 726, frames: 48, description: 'Phone set face down on the sill', perspective: 'Close, at his window', reverb: 'Small room behind him', linkedShots: ['S1-01-SH15'], syncPoints: [{ frame: 760, event: 'Phone touches the sill' }] }),
  sc({ cueId: 'S1-01-SFX01', track: 'SFX', layer: 'SILENCE', at: 684, frames: 42, description: 'No designed sound for the Ember: the glow is silent', perspective: '', reverb: '', linkedShots: ['S1-01-SH14'] }),
  sc({ cueId: 'S1-01-SFX02', track: 'SFX', layer: 'SFX', at: 870, frames: 60, description: 'A single car passes far below', perspective: 'From rooftop height', reverb: 'Open air with a long street tail', linkedShots: ['S1-01-SH17'] }),
];

export const SUBTITLES: SubtitleEvent[] = [
  { eventId: 'S1-01-SUB01', at: 0, frames: 96, text: '[a big band warms up in the distance]', kind: 'ACCESSIBILITY' },
  { eventId: 'S1-01-SUB02', at: 684, frames: 42, text: '[music stops]', kind: 'ACCESSIBILITY' },
  { eventId: 'S1-01-SUB03', at: 798, frames: 48, text: '[music returns]', kind: 'ACCESSIBILITY' },
  { eventId: 'S1-01-SUB04', at: 990, frames: 54, text: '[the band lands a full chord]', kind: 'ACCESSIBILITY' },
];
