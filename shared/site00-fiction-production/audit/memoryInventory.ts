import type { BackgroundGroup, MemoryMoment } from './types.js';

/** Section 08: how the season remembers now. Two pictures (S1-58, S1-77); the rest is speech, paper and archive. */
export const MEMORY_INVENTORY: MemoryMoment[] = [
  { releaseId: 'S1-07', kind: 'DOCUMENT', memoryType: 'AUTHENTICATED_ARCHIVE', who: 'The family', quote: 'the sealed envelope sits face down in plain sight', note: 'An object that holds a memory nobody discusses.' },
  { releaseId: 'S1-08', kind: 'DOCUMENT', memoryType: 'AUTHENTICATED_ARCHIVE', who: 'Sloane', quote: "her mother's final entry", note: 'The ledger is the season\'s first memory, and it is a record.' },
  { releaseId: 'S1-12', kind: 'VERBAL_ACCOUNT', memoryType: 'HUMAN_MEMORY', who: 'Mavis', quote: 'The night Nadine was born, Mavis drove Richard and his wife to the hospital in her fruit truck.', note: 'Told, not shown. F-01 adds sound only.' },
  { releaseId: 'S1-16', kind: 'VERBAL_ACCOUNT', memoryType: 'HUMAN_MEMORY', who: 'Clementine', quote: 'Clementine recites, from memory, the menu her father cooked', note: 'Memory as recital.' },
  { releaseId: 'S1-20', kind: 'INFERENCE', memoryType: 'HUMAN_MEMORY', who: 'Nadine', quote: 'Nadine reads the year on her dance card and works it out', note: 'A memory reached by arithmetic from a printed year.' },
  { releaseId: 'S1-25', kind: 'DOCUMENT', memoryType: 'AUTHENTICATED_ARCHIVE', who: 'Inez', quote: 'Inez unfolds a 1981 sketch', note: 'A drawing holds forty years.' },
  { releaseId: 'S1-26', kind: 'VERBAL_ACCOUNT', memoryType: 'HUMAN_MEMORY', who: 'Celestine', quote: 'Somebody once designed a second state.', note: 'Her own history, told as somebody else\'s.' },
  { releaseId: 'S1-36', kind: 'VERBAL_ACCOUNT', memoryType: 'HUMAN_MEMORY', who: 'Honora', quote: 'Her account, quiet and exact', note: 'The harm is told by the harmed.' },
  { releaseId: 'S1-40', kind: 'ARCHIVAL_DISPLAY', memoryType: 'SPECULATIVE_ARCHIVAL_TECHNOLOGY', who: 'The Echo Track', quote: "drawn from the city's archive footage of her own race", note: 'Displays recorded footage only.' },
  { releaseId: 'S1-43', kind: 'INFERENCE', memoryType: 'HUMAN_MEMORY', who: 'Royce', quote: 'walks her through his inference', note: 'Public records assembled into a story; one word is missing.' },
  { releaseId: 'S1-47', kind: 'ARCHIVAL_DISPLAY', memoryType: 'SPECULATIVE_ARCHIVAL_TECHNOLOGY', who: 'Abena (recorded)', quote: 'a hanging silk panel holding a message set to bloom', note: 'Stored, consented content that cannot respond.' },
  { releaseId: 'S1-54', kind: 'VERBAL_ACCOUNT', memoryType: 'HUMAN_MEMORY', who: 'Bunny', quote: 'It went from my table, Rich.', note: 'The leak, traced by confession.' },
  { releaseId: 'S1-56', kind: 'DOCUMENT', memoryType: 'AUTHENTICATED_ARCHIVE', who: 'Kai', quote: 'the terms of an anonymous commission he received ten years ago', note: 'A framed page; Sloane recognises her mother\'s phrasing.' },
  { releaseId: 'S1-56', kind: 'VERBAL_ACCOUNT', memoryType: 'HUMAN_MEMORY', who: 'Kai', quote: 'I went to her studio on my own and asked to apprentice.', note: 'Told in three lines.' },
  { releaseId: 'S1-58', kind: 'VISUAL_FLASHBACK', memoryType: 'POTENTIALLY_UNRELIABLE_RECOLLECTION', who: 'Richard', quote: "explicitly Richard's recollection, warm and imperfect", note: 'The season\'s only extended flashback.' },
  { releaseId: 'S1-73', kind: 'DOCUMENT', memoryType: 'AUTHENTICATED_ARCHIVE', who: 'Clementine', quote: 'Menu by Ezekiel Hollis, Dining Car Chef.', note: 'A name in print for the first time.' },
  { releaseId: 'S1-76', kind: 'ARCHIVAL_DISPLAY', memoryType: 'AUTHENTICATED_ARCHIVE', who: 'The old rig', quote: "The old rig's memory still holds the first pavilion's consent keys", note: 'A machine memory, erased by choice.' },
  { releaseId: 'S1-77', kind: 'VISUAL_FLASHBACK', memoryType: 'HUMAN_MEMORY', who: 'Celestine', quote: "A memory flash, in Celestine's recollection", note: 'The season\'s second and last picture of the past.' },
  { releaseId: 'S1-78', kind: 'VERBAL_ACCOUNT', memoryType: 'HUMAN_MEMORY', who: 'Celestine', quote: 'She came to see me.', note: 'A memory partly withheld, by right.' },
  { releaseId: 'S1-80', kind: 'VERBAL_ACCOUNT', memoryType: 'HUMAN_MEMORY', who: 'Richard', quote: 'Richard tells a ridiculous story about Vivienne.', note: 'Memory as comedy.' },
  { releaseId: 'S1-83', kind: 'DOCUMENT', memoryType: 'AUTHENTICATED_ARCHIVE', who: 'Ada', quote: "Ada closes the year's ledger of requests aloud, one line each.", note: 'The year as a record.' },
  { releaseId: 'S1-86', kind: 'DOCUMENT', memoryType: 'AUTHENTICATED_ARCHIVE', who: 'Celestine', quote: "The audience reads two lines in Vivienne's hand", note: 'The dead speak only in their own handwriting.' },
];

/** Section 13: the people the season already reuses without saying so. */
export const BACKGROUND_GROUPS: BackgroundGroup[] = [
  {
    id: 'BG-S1-01',
    name: 'The five S1-01 inhabitants',
    appearances: [
      { releaseId: 'S1-01', quote: 'a tailor locks up' },
      { releaseId: 'S1-01', quote: 'a teenager practises a dance step at a bus stop' },
      { releaseId: 'S1-01', quote: 'a grandmother hangs a jewel-green dress on a fire escape to air' },
      { releaseId: 'S1-01', quote: 'a woman dances alone in her kitchen' },
      { releaseId: 'S1-01', quote: 'a neighbour lifts a phone toward her' },
    ],
    note: 'Scene-scoped in the packet (FD-S101-06). R-01 to R-04 return three of them; the woman stays anyone (R-11, R-13 rejected).',
  },
  {
    id: 'BG-NURSES',
    name: 'Night-shift nurses',
    appearances: [
      { releaseId: 'S1-18', quote: 'night-shift nurses' },
      { releaseId: 'S1-33', quote: 'night nurses take sides' },
      { releaseId: 'S1-40', quote: 'Night nurses arrive off shift in scrubs and earrings.' },
      { releaseId: 'S1-66', quote: 'nurses' },
    ],
    note: 'S1-18 is Aldridge. S1-66 is a recovery room after Richard\'s knee surgery, and Aldridge is a children\'s hospital, so those nurses are not the same group.',
  },
  {
    id: 'BG-COURIERS',
    name: 'Exchange couriers',
    appearances: [
      { releaseId: 'S1-11', quote: "a courier returns it to Sloane's office, unopened" },
      { releaseId: 'S1-17', quote: 'Exchange couriers on bicycles' },
      { releaseId: 'S1-69', quote: 'Couriers hand-deliver brass keys.' },
    ],
    note: 'R-08 makes one of them recur.',
  },
  {
    id: 'BG-BARBER',
    name: 'Barbers',
    appearances: [
      { releaseId: 'S1-45', quote: 'the barber' },
      { releaseId: 'S1-51', quote: 'a pillbox on a barber' },
      { releaseId: 'S1-69', quote: 'A barber flips his sign to CLOSED EARLY.' },
    ],
    note: 'R-10 makes them one man, with no invitation implied.',
  },
  {
    id: 'BG-MARKET',
    name: 'Market people',
    appearances: [
      { releaseId: 'S1-12', quote: 'a covered market' },
      { releaseId: 'S1-20', quote: 'forty years of market stallholders' },
      { releaseId: 'S1-51', quote: 'an old man sells honey' },
    ],
    note: 'Mavis\'s world. R-09 carries one face through it.',
  },
  {
    id: 'BG-CHURCH',
    name: 'Church communities',
    appearances: [
      { releaseId: 'S1-15', quote: 'a church sewing circle off Ferry Street' },
      { releaseId: 'S1-18', quote: "through her pastor's referral" },
      { releaseId: 'S1-20', quote: 'her church choir' },
      { releaseId: 'S1-34', quote: 'A church-basement sewing circle' },
      { releaseId: 'S1-51', quote: 'fourteen hundred of her church hats' },
    ],
    note: 'Plural on purpose. Merging them (R-15) is rejected.',
  },
  {
    id: 'BG-KIDS',
    name: 'Neighbourhood kids',
    appearances: [
      { releaseId: 'S1-22', quote: 'four neighbourhood kids' },
      { releaseId: 'S1-51', quote: 'kids weave between stalls' },
      { releaseId: 'S1-59', quote: "Kids on bikes ask what they're for." },
      { releaseId: 'S1-64', quote: 'kids and cousins' },
    ],
    note: 'R-05 carries the pliers girl to S1-59; T-07 gives the S1-51 kids a game.',
  },
  {
    id: 'BG-LISTENERS',
    name: 'The city\'s radio listeners',
    appearances: [
      { releaseId: 'S1-33', quote: 'a cab driver laughs, a baker turns it up' },
      { releaseId: 'S1-81', quote: 'In a laundromat the radio is on.' },
    ],
    note: 'The radio is the season\'s shared culture that exposes nobody.',
  },
  {
    id: 'BG-KITCHEN',
    name: 'Femi\'s kitchen',
    appearances: [
      { releaseId: 'S1-17', quote: 'A chef reads his in a restaurant alley' },
      { releaseId: 'S1-73', quote: 'Femi, in the kitchen doorway' },
      { releaseId: 'S1-82', quote: "Femi's free Sunday supper for elders" },
    ],
    note: 'R-18 gives him a crew.',
  },
  {
    id: 'BG-FAR-BANK',
    name: 'The far bank and the morning after',
    appearances: [
      { releaseId: 'S1-77', quote: 'On the far bank, crowds see the gold' },
      { releaseId: 'S1-81', quote: 'People tell each other about the gold lights on the river' },
    ],
    note: 'W-01 directs it as the city\'s own party.',
  },
];
