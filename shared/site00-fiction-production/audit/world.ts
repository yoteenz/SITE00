/**
 * Section 16: where the season already lives, quoted from the master, and what this audit adds.
 * `additions` are recommended or held proposals; `rejected` are ideas for the same kind of place that were turned down.
 */
export type WorldLayer = {
  id: string;
  layer: string;
  appearances: Array<{ releaseId: string; quote: string }>;
  additions: string[];
  rejected: string[];
  note: string;
};

export const WORLD_DENSITY: WorldLayer[] = [
  {
    id: 'WD-NEIGHBOURHOODS',
    layer: 'Neighbourhoods',
    appearances: [
      { releaseId: 'S1-01', quote: 'A street of brownstones and glass towers at dusk' },
      { releaseId: 'S1-15', quote: 'a church sewing circle off Ferry Street' },
      { releaseId: 'S1-22', quote: "Kai's East Side workshop after school" },
      { releaseId: 'S1-51', quote: "Introduces Ferry Street, the Grand Exchange's neighbourhood." },
    ],
    additions: ['W-03', 'V-01', 'V-02', 'R-04', 'R-10'],
    rejected: [],
    note: 'Ferry Street is the one neighbourhood the season names more than once. The S1-01 street is never named, which is right; V-01 and V-02 let it be seen again without naming it.',
  },
  {
    id: 'WD-VENUES',
    layer: 'Night venues',
    appearances: [
      { releaseId: 'S1-03', quote: 'Halcyon House, a restored 1920s Black-owned hotel ballroom' },
      { releaseId: 'S1-20', quote: 'The Crescent Room' },
      { releaseId: 'S1-28', quote: "The Salon, Royce's open-capture club" },
      { releaseId: 'S1-40', quote: "The Riverside Pavilion, the river track's 1920s clubhouse" },
      { releaseId: 'S1-50', quote: 'A rooftop around an old water tower after midnight' },
      { releaseId: 'S1-72', quote: 'The River Hall' },
    ],
    additions: ['W-01', 'W-08', 'T-21'],
    rejected: ['W-09'],
    note: 'Six distinct rooms, two of them not the Exchange\'s. Enough. The far bank (W-01) is the only place a public crowd shares a Night, and it is outdoors and free.',
  },
  {
    id: 'WD-BUSINESSES',
    layer: 'Shops and trades',
    appearances: [
      { releaseId: 'S1-12', quote: 'a covered market' },
      { releaseId: 'S1-15', quote: 'A cramped vintage shop on Ferry Street' },
      { releaseId: 'S1-45', quote: 'the barber' },
      { releaseId: 'S1-81', quote: 'In a laundromat the radio is on.' },
    ],
    additions: ['R-09', 'R-10'],
    rejected: [],
    note: 'The market and the barber already recur without saying so. R-09 and R-10 give each one face; neither implies an invitation.',
  },
  {
    id: 'WD-FOOD',
    layer: 'Kitchens, restaurants and suppers',
    appearances: [
      { releaseId: 'S1-17', quote: 'A chef reads his in a restaurant alley' },
      { releaseId: 'S1-21', quote: 'A small restaurant with candles and a window onto rain' },
      { releaseId: 'S1-33', quote: 'a cab, a bakery, a hospital break room' },
      { releaseId: 'S1-82', quote: "Femi's free Sunday supper for elders" },
    ],
    additions: ['R-18', 'F-02'],
    rejected: [],
    note: 'Food is how the season shows care. R-18 lets the kitchen that cooks Ezekiel\'s supper also cook for elders, with the same crew.',
  },
  {
    id: 'WD-SCHOOLS',
    layer: 'Schools',
    appearances: [
      { releaseId: 'S1-22', quote: 'after school' },
      { releaseId: 'S1-26', quote: 'the art school where Celestine teaches' },
      { releaseId: 'S1-51', quote: 'a school notebook' },
    ],
    additions: [],
    rejected: ['W-06'],
    note: 'NO CHANGE RECOMMENDED. Schools are glimpsed through the people who leave them. A school corridor scene (W-06) would cost four seconds the season does not have.',
  },
  {
    id: 'WD-TRANSIT',
    layer: 'Transit and the street',
    appearances: [
      { releaseId: 'S1-01', quote: 'a bus stop' },
      { releaseId: 'S1-15', quote: 'morning Number 9 bus' },
      { releaseId: 'S1-17', quote: 'Exchange couriers on bicycles' },
      { releaseId: 'S1-23', quote: 'On the bus home he crosses off nothing' },
      { releaseId: 'S1-81', quote: 'A bus passes the promenade.' },
    ],
    additions: ['V-02', 'R-08'],
    rejected: ['V-12'],
    note: 'The bus is the season\'s quiet public room. V-02 puts the Gold State notice in the S1-01 shelter; making the S1-01 bus the Number 9 (V-12) would connect strangers who should stay strangers.',
  },
  {
    id: 'WD-CHURCH',
    layer: 'Churches and community halls',
    appearances: [
      { releaseId: 'S1-15', quote: 'a church sewing circle off Ferry Street' },
      { releaseId: 'S1-20', quote: 'her church choir' },
      { releaseId: 'S1-24', quote: 'A church fellowship hall on a Tuesday night' },
      { releaseId: 'S1-34', quote: 'A church-basement sewing circle' },
    ],
    additions: [],
    rejected: ['R-15'],
    note: 'NO CHANGE RECOMMENDED. Several congregations, on purpose. Merging them into one church (R-15) makes the city smaller.',
  },
  {
    id: 'WD-ART',
    layer: 'Studios and galleries',
    appearances: [
      { releaseId: 'S1-11', quote: "Celestine's studio door" },
      { releaseId: 'S1-19', quote: "a gallery owner's referral" },
      { releaseId: 'S1-26', quote: 'A light-design studio at the art school where Celestine teaches' },
      { releaseId: 'S1-86', quote: "Celestine's studio at night, with the gold lantern in the window" },
    ],
    additions: ['T-01', 'F-07'],
    rejected: [],
    note: 'Celestine\'s studio carries the season\'s ending. T-01 finishes the last scene there with the paper the season taught.',
  },
  {
    id: 'WD-FASHION',
    layer: 'Fashion and making',
    appearances: [
      { releaseId: 'S1-06', quote: 'the Ferry Street tailor who made the orange jacket' },
      { releaseId: 'S1-34', quote: 'A church-basement sewing circle' },
      { releaseId: 'S1-51', quote: 'fourteen hundred of her church hats' },
      { releaseId: 'S1-70', quote: "Inez's sewing room" },
    ],
    additions: ['R-02', 'R-03', 'F-03', 'V-03'],
    rejected: ['S-01'],
    note: 'The season\'s richest layer after family. The returns are garments first (the green dress, a tailored suit, a purple hat) and people second.',
  },
  {
    id: 'WD-MUSIC',
    layer: 'Music and radio',
    appearances: [
      { releaseId: 'S1-20', quote: 'Clarence Moody and the Crescent Room Orchestra' },
      { releaseId: 'S1-33', quote: 'a cab driver laughs, a baker turns it up' },
      { releaseId: 'S1-51', quote: 'a drumline rehearses' },
      { releaseId: 'S1-72', quote: 'a string quartet playing soul' },
    ],
    additions: ['F-01', 'F-05', 'F-19', 'F-08'],
    rejected: [],
    note: 'Sound is the season\'s memory register. Most sensory proposals are music the season already plays, heard earlier or heard again.',
  },
  {
    id: 'WD-CELEBRATIONS',
    layer: 'Celebrations outside the Exchange',
    appearances: [
      { releaseId: 'S1-64', quote: "The Okafor family's Sunday backyard cookout" },
      { releaseId: 'S1-51', quote: 'public culture is loud and joyful' },
      { releaseId: 'S1-81', quote: 'People tell each other about the gold lights on the river' },
    ],
    additions: ['W-01', 'T-07'],
    rejected: ['T-14'],
    note: 'The city celebrates without an invitation. W-01 makes the far bank its own party on the Grand Exchange night.',
  },
  {
    id: 'WD-FAMILY',
    layer: 'Family life',
    appearances: [
      { releaseId: 'S1-07', quote: 'Sunday breakfast' },
      { releaseId: 'S1-69', quote: 'A teenager watches his grandfather iron a shirt.' },
      { releaseId: 'S1-72', quote: 'Gideon walks his mother in on his arm' },
    ],
    additions: ['R-14'],
    rejected: [],
    note: 'NO CHANGE RECOMMENDED for the principals\' families. R-14 (held) asks only whether a background teenager is the same boy.',
  },
  {
    id: 'WD-WORK',
    layer: 'Work and institutions',
    appearances: [
      { releaseId: 'S1-17', quote: 'Exchange couriers on bicycles' },
      { releaseId: 'S1-18', quote: 'night-shift nurses' },
      { releaseId: 'S1-30', quote: 'the hospital installed them four years ago' },
    ],
    additions: ['R-06', 'R-08', 'T-05'],
    rejected: [],
    note: 'People at work are the season\'s best background. R-06 and R-08 make three nurses and one courier recognisable without naming them.',
  },
  {
    id: 'WD-HOME',
    layer: 'Homes',
    appearances: [
      { releaseId: 'S1-01', quote: 'a woman dances alone in her kitchen' },
      { releaseId: 'S1-68', quote: "Sloane's kitchen" },
      { releaseId: 'S1-71', quote: "Richard's living room" },
    ],
    additions: ['T-06'],
    rejected: ['R-11', 'R-13'],
    note: 'Homes stay private. T-06 shows the Halo as an ordinary home appliance; the S1-01 kitchen stays anyone\'s.',
  },
];
