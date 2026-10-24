import type { CharacterState, ContinuityState, DeclaredTransition, LightingState, PropStateRecord, SpatialAuthority } from '../../directorial/types.js';
import { WD } from './shot.js';

const ids = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `S1-01-SH${String(from + i).padStart(2, '0')}`);

/** Compressed dusk: the light moves from golden to blue across 45 seconds (directorial interpretation E-11). */
export const LIGHTING: LightingState[] = [
  { id: 'LS-GOLDEN', name: 'Golden hour', description: 'Low sun on the west end of the street; the glass tower burns copper; stone and brick warm.', keyDirection: 'Low sun from the west: screen left when looking east', palette: ['copper on glass', 'warm limestone and brick', 'long blue shadows'], shots: ids(1, 7) },
  { id: 'LS-LAST-LIGHT', name: 'Last light', description: 'Sun just under the roofline; warm bounce off brick; the first interior lamps come on.', keyDirection: 'Bounce from west-facing brick; lamps inside', palette: ['amber brick', 'warm interior lamps', 'saturated jewel green'], shots: ids(8, 12) },
  { id: 'LS-BLUE-HOUR', name: 'Blue hour', description: 'Blue sky; windows and street lamps become the keys. Copper appears only in the Ember; nothing is gold.', keyDirection: 'Sky fill from above; practical windows and street lamps', palette: ['deep blue sky', 'amber windows', 'copper only from the Ember'], shots: ids(13, 19) },
];

/** Provisional geography for SET-CITY-DUSK. Directorial interpretation until the founder approves an environment reference (FD-S101-08). */
export const SPATIAL: SpatialAuthority[] = [
  {
    setId: 'SET-CITY-DUSK', name: 'Brownstone street at dusk', status: 'PROVISIONAL',
    scale: 'Two-lane residential street about 18 m between facades; brownstones of four and five storeys; a glass tower stands at the west end.',
    orientation: "The street runs east to west. North side, west to east: the tailor's shop at street level, the woman's converted brownstone with a fourth-floor balcony kitchen, the grandmother's brownstone with a third-floor fire escape. South side: the bus shelter and, directly across from the balcony, the neighbour's second-floor window. Halcyon House lies east beyond the rooftops.",
    zones: [
      { zoneId: 'Z-STREET', name: 'Street', kind: 'EXTERIOR', position: 'The roadway and both pavements', landmarks: ['glass tower (copper reflection)', 'brownstone stoops', 'street lamps'], entrances: ['Both ends of the street'], windows: [], furniture: ['street lamps', 'parked cars'], cameraSafe: ['High on the south side looking east'], lightingDirection: 'West, low' },
      { zoneId: 'Z-SHOPFRONT', name: "Tailor's shopfront", kind: 'THRESHOLD', position: 'North side, street level, west end', landmarks: ['tailor shop grille', 'mannequin in the window'], entrances: ['Shop door under the grille'], windows: ['Display window'], furniture: ['mannequin'], cameraSafe: ['Pavement west of the door', 'Facing the display window'], lightingDirection: 'West, raking along the shopfront' },
      { zoneId: 'Z-BUS-STOP', name: 'Bus stop', kind: 'EXTERIOR', position: 'South side, west of the neighbour\'s building', landmarks: ['bus shelter glass'], entrances: ['Open sides of the shelter'], windows: [], furniture: ['shelter bench'], cameraSafe: ['Behind the shelter facing its glass', 'Kerb level'], lightingDirection: 'West, through the shelter glass' },
      { zoneId: 'Z-FIRE-ESCAPE', name: "Grandmother's fire escape", kind: 'EXTERIOR', position: 'North side, third floor, east of the balcony', landmarks: ['third-floor fire-escape rail'], entrances: ['Her kitchen window'], windows: ['Kitchen window behind the rail'], furniture: [], cameraSafe: ['Street level looking up', 'Along the rail'], lightingDirection: 'Bounce off brick' },
      { zoneId: 'Z-BALCONY-KITCHEN', name: 'Balcony kitchen', kind: 'THRESHOLD', position: 'North side, fourth floor, directly across from the neighbour', landmarks: ['fourth-floor balcony ledge', 'open balcony door'], entrances: ['Balcony door'], windows: ['Balcony door'], furniture: ['kitchen counter', 'ledge'], cameraSafe: ['Balcony edge looking in', 'Across the street from the neighbour\'s window'], lightingDirection: 'Kitchen lamps from inside; sky from outside' },
      { zoneId: 'Z-NEIGHBOUR-WINDOW', name: "Neighbour's window", kind: 'THRESHOLD', position: 'South side, second floor, facing the balcony', landmarks: ["neighbour's window frame"], entrances: [], windows: ['Street window'], furniture: ['reading lamp'], cameraSafe: ['Outside the window, west of the sightline'], lightingDirection: 'Reading lamp behind him; sky in front' },
      { zoneId: 'Z-ROOFTOPS', name: 'Rooftops', kind: 'EXTERIOR', position: 'Above the north side, looking east', landmarks: ['water towers'], entrances: [], windows: [], furniture: ['water towers', 'chimneys'], cameraSafe: ['Rising from the fourth floor on the north side'], lightingDirection: 'Sky fill' },
      { zoneId: 'Z-HALCYON-DISTANT', name: 'Halcyon House, seen from the rooftops', kind: 'EXTERIOR', position: 'East, beyond the rooftops (the building belongs to SET-HALCYON-HOUSE, which has no approved exterior)', landmarks: ['Halcyon House ballroom windows'], entrances: [], windows: ['Tall ballroom windows'], furniture: [], cameraSafe: ['From the rooftops only'], lightingDirection: 'Lit from inside: amber' },
    ],
    travelPaths: [
      { from: 'Z-SHOPFRONT', to: 'Z-STREET', via: 'Shop door to the pavement' },
      { from: 'Z-BUS-STOP', to: 'Z-STREET', via: 'Kerb' },
      { from: 'Z-STREET', to: 'Z-ROOFTOPS', via: 'Camera rise only' },
    ],
    sightlines: [
      { from: 'Z-NEIGHBOUR-WINDOW', to: 'Z-BALCONY-KITCHEN', note: 'Directly across the street; the 180-degree line for SC05 and SC06. The camera stays west of it.' },
      { from: 'Z-STREET', to: 'Z-FIRE-ESCAPE', note: 'The dress on the rail reads from the pavement.' },
      { from: 'Z-ROOFTOPS', to: 'Z-HALCYON-DISTANT', note: 'East across the roofs; only the lit windows show.' },
    ],
    screenDirectionRules: [
      'Camera west of the north-south sightline: the north side is screen left and the south side screen right whenever both are in frame.',
      'The neighbour looks screen left toward her; the woman looks screen right toward him.',
      'The rise in SC07 travels east, toward screen right.',
    ],
    immutable: [
      'The street runs east to west.',
      "Her balcony is directly across from the neighbour's window.",
      'The fire escape is on the third floor, below and east of her balcony.',
      'Halcyon House is east beyond the rooftops and shows only as lit windows until its exterior is approved.',
    ],
  },
];

const c = (zone: string, orientation: string, posture: string, wardrobeState: string, visible = true): CharacterState => ({ zone, orientation, posture, wardrobeState, hair: 'As fixed by the vignette\'s first start frame (scene-scoped, FD-S101-06)', visible });
const p = (holder: string | null, location: string, state: string, visible = true): PropStateRecord => ({ holder, location, state, visible });
const W = 'WOMAN ON THE BALCONY';
const GRILLE = 'Shop grille';
const DRESS = 'Jewel-green dress';
const GLASS = 'Wine glass';
const SPOON = 'Wooden spoon';
const PHONE = "Neighbour's phone";
const st = (n: number, characters: ContinuityState['characters'], props: ContinuityState['props'], light: string): ContinuityState => ({ shotId: `S1-01-SH${String(n).padStart(2, '0')}`, characters, props, environment: { light } });

/** State at the start of each shot. */
export const CONTINUITY: ContinuityState[] = [
  st(1, {}, {}, 'LS-GOLDEN; a few windows lit, more lighting during the shot'),
  st(2, { TAILOR: c('Z-SHOPFRONT', 'faces screen right', 'standing, arms up to the grille', WD.TAILOR) }, { [GRILLE]: p(null, 'Z-SHOPFRONT', 'up') }, 'LS-GOLDEN'),
  st(3, { TAILOR: c('Z-SHOPFRONT', 'faces the window', 'leaning in', WD.TAILOR) }, { [GRILLE]: p(null, 'Z-SHOPFRONT', 'half down') }, 'LS-GOLDEN'),
  st(4, { TAILOR: c('Z-SHOPFRONT', 'faces screen right', 'standing', WD.TAILOR) }, { [GRILLE]: p(null, 'Z-SHOPFRONT', 'half down') }, 'LS-GOLDEN'),
  st(5, { TEENAGER: c('Z-BUS-STOP', 'faces screen left into the glass', 'set to dance', WD.TEENAGER) }, {}, 'LS-GOLDEN'),
  st(6, { TEENAGER: c('Z-BUS-STOP', 'feet only', 'mid-turn', WD.TEENAGER) }, {}, 'LS-GOLDEN'),
  st(7, { TEENAGER: c('Z-BUS-STOP', 'faces screen left into the glass', 'set to dance', WD.TEENAGER) }, {}, 'LS-GOLDEN'),
  st(8, { GRANDMOTHER: c('Z-FIRE-ESCAPE', 'faces the street', 'leaning over the rail', WD.GRANDMOTHER) }, { [DRESS]: p('GRANDMOTHER', 'Z-FIRE-ESCAPE', 'folded in her hands above the rail') }, 'LS-LAST-LIGHT'),
  st(9, { GRANDMOTHER: c('Z-FIRE-ESCAPE', 'side-on', 'hands on the skirt', WD.GRANDMOTHER) }, { [DRESS]: p(null, 'Z-FIRE-ESCAPE', 'hanging on the rail') }, 'LS-LAST-LIGHT'),
  st(10, { GRANDMOTHER: c('Z-FIRE-ESCAPE', 'faces screen left toward the dress', 'half a pace back', WD.GRANDMOTHER) }, { [DRESS]: p(null, 'Z-FIRE-ESCAPE', 'hanging on the rail') }, 'LS-LAST-LIGHT'),
  st(11, { [W]: c('Z-BALCONY-KITCHEN', 'moving screen right', 'dancing', WD.WOMAN) }, { [GLASS]: p(null, 'Z-BALCONY-KITCHEN', 'full, on the ledge'), [SPOON]: p(W, 'Z-BALCONY-KITCHEN', 'in her right hand') }, 'LS-LAST-LIGHT'),
  st(12, { [W]: c('Z-BALCONY-KITCHEN', 'turning screen right', 'twirling', WD.WOMAN) }, { [GLASS]: p(null, 'Z-BALCONY-KITCHEN', 'full, on the ledge', false), [SPOON]: p(W, 'Z-BALCONY-KITCHEN', 'in her right hand') }, 'LS-LAST-LIGHT'),
  st(13, { NEIGHBOUR: c('Z-NEIGHBOUR-WINDOW', 'looks screen left', 'standing at the window', WD.NEIGHBOUR) }, { [PHONE]: p('NEIGHBOUR', 'Z-NEIGHBOUR-WINDOW', 'lowered, in his hand') }, 'LS-BLUE-HOUR'),
  st(14, {}, { [PHONE]: p('NEIGHBOUR', 'Z-NEIGHBOUR-WINDOW', 'raised toward the balcony, lens dark') }, 'LS-BLUE-HOUR; music stopped'),
  st(15, { NEIGHBOUR: c('Z-NEIGHBOUR-WINDOW', 'looks screen left', 'phone raised', WD.NEIGHBOUR) }, { [PHONE]: p('NEIGHBOUR', 'Z-NEIGHBOUR-WINDOW', 'raised, lens copper') }, 'LS-BLUE-HOUR; music stopped'),
  st(16, { [W]: c('Z-BALCONY-KITCHEN', 'faces screen right toward him', 'at the ledge', WD.WOMAN) }, { [GLASS]: p(W, 'Z-BALCONY-KITCHEN', 'raised in her left hand'), [SPOON]: p(W, 'Z-BALCONY-KITCHEN', 'in her right hand') }, 'LS-BLUE-HOUR'),
  st(17, { [W]: c('Z-BALCONY-KITCHEN', 'small in frame', 'dancing', WD.WOMAN) }, { [DRESS]: p(null, 'Z-FIRE-ESCAPE', 'hanging on the rail') }, 'LS-BLUE-HOUR'),
  st(18, {}, {}, 'LS-BLUE-HOUR; ballroom windows lit amber'),
];

export const TRANSITIONS: DeclaredTransition[] = [
  { subject: GRILLE, fromShot: 'S1-01-SH02', toShot: 'S1-01-SH03', change: 'up → half down', method: 'ON_SCREEN_ACTION', note: 'He pulls it halfway in SH02.' },
  { subject: DRESS, fromShot: 'S1-01-SH08', toShot: 'S1-01-SH09', change: 'in her hands → hanging on the rail', method: 'ON_SCREEN_ACTION', note: 'It unfurls over the rail in SH08.' },
  { subject: PHONE, fromShot: 'S1-01-SH13', toShot: 'S1-01-SH14', change: 'lowered → raised', method: 'ON_SCREEN_ACTION', note: 'He lifts it in SH13.' },
  { subject: PHONE, fromShot: 'S1-01-SH14', toShot: 'S1-01-SH15', change: 'lens dark → lens copper', method: 'ON_SCREEN_ACTION', note: 'The Ember blooms in SH14.' },
  { subject: GLASS, fromShot: 'S1-01-SH12', toShot: 'S1-01-SH16', change: 'on the ledge → in her left hand', method: 'OFF_SCREEN_DECLARED', note: 'She picks it up while the picture is on the neighbour (SH13 to SH15).' },
];
