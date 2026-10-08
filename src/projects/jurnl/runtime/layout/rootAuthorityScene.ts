/**
 * Where each root reference's objects sit on its clean shell (P0.JURNL.ROOT-PARENTS.REFERENCE-PLUS-SHELL-OPUS-RECONSTRUCTION1).
 * Shell px are the plate's own pixels (2016 × 3584). Local px are the straightened reference copies measured by
 * scripts/jurnl/root-authorities (see rootAuthorityLayout.ts). Landmarks were read off gridded zooms of both images.
 */
import type { RootFraming, RootObject } from '../components/RootAuthorityStage';

export type RootScene = {
  /** Plate crop on a phone: keep the primary object whole. */
  framing: RootFraming;
  /** Reference y that the wall type hangs from, and the shell y it lands on (the top of the primary object).
   *  maxDrop caps how far the wall type may move below the reference's own place, as a share of the screen height,
   *  where the shell's object sits much lower than the reference's (PLAN). */
  hang: { readonly ref: number; readonly shell: number; readonly maxDrop?: number };
  objects: Record<string, RootObject>;
};

export const TODAY_SCENE: RootScene = {
  // The clipboard runs off the shell's right edge; crop the left (the coffee cup) and keep the sheet whole.
  framing: { px: 0.9, py: 0.5 },
  // Reference clip plate top (y 752) sits on the shell clip plate top (y 1597).
  hang: { ref: 752, shell: 1597 },
  objects: {
    // Straightened reference sheet (top-left corner local 145, 797; 755 wide) onto the shell sheet
    // (top-left 411, 1728; top edge 1310 long at -7.94°, left edge at -6.64°). The shell sheet is taller, so rows spread 1.25×.
    sheet: { from: [145, 797], at: [411, 1728], deg: -7.3, k: 1.735, stretch: 1.25 },
  },
};

/** The attention slip lifted from reference 01 (cleared print), placed where the reference has it. */
export const TODAY_SLIP = { box: [520, 600, 870, 790] as const, turn: { at: [650, 700] as const, deg: 5 } };

export const MONEY_SCENE: RootScene = {
  // Cabinet fronts span shell x 363–1892; this crop keeps them whole and lines the insert type up with the wall copy.
  framing: { px: 0.72, py: 0.5 },
  // Reference insert 1 top (y 708) sits on the shell insert 1 top (y 1542).
  hang: { ref: 708, shell: 1542 },
  objects: {
    // Each drawer of the reference onto the same drawer of the shell (top-left corners; widths give k).
    // Shell inserts show more card above the fronts, so their rows spread 1.15×.
    insert1: { from: [147, 708], at: [547, 1542], deg: 0.4, k: 1.81, stretch: 1.15 },
    front1: { from: [95, 827], at: [363, 1830], deg: 0.76, k: 1.86 },
    insert2: { from: [151, 953], at: [542, 2108], deg: 0.42, k: 1.87, stretch: 1.15 },
    front2: { from: [99, 1066], at: [367, 2397], deg: 1.24, k: 1.876 },
    front3: { from: [112, 1183], at: [375, 2703], deg: 1.03, k: 1.94 },
  },
};
/** The note and NEXT under the cabinet hang from the bottom of the third front (reference y 1301, shell y 2900),
 *  and rise on a short screen so the note's last line (reference y 1454) stays clear of the dock. */
export const MONEY_FOOT = { ref: 1301, shell: 2900, last: 1454 };
/** Botanical print on each insert (the approved lockup sprig), where the reference prints one. */
export const MONEY_LEAF = { insert1: [728, 734, 803, 827] as const, insert2: [738, 977, 812, 1072] as const };

export const PLAN_SCENE: RootScene = {
  // The planner's right page and its tabs run to shell x ≈ 1950: crop the left (the left page's outer margin).
  framing: { px: 1, py: 0.5 },
  // Reference gutter top of the right page (y 610) sits on the shell gutter top (y 1723).
  hang: { ref: 610, shell: 1723, maxDrop: 0.06 },
  objects: {
    // Straightened right page: top-right corner (local 870, 637) onto the shell's (1845, 1765); top edge 737 shell px
    // at +3.2° against 442 reference px → k 1.68 (the right edge gives 1.69).
    right: { from: [870, 637], at: [1845, 1765], deg: 3.2, k: 1.68 },
    // Straightened left page: gutter top (local 371, 571) onto the shell's (1082, 1723); top edge at +5.1°.
    left: { from: [371, 571], at: [1082, 1723], deg: 5.1, k: 1.68 },
  },
};
/** Paper index tabs on the right page's edge (local px of the straightened right page) and the reference's colours. */
export const PLAN_TABS = [
  { id: 'goals', label: 'GOALS', box: [846, 677, 899, 806] as const, fill: '#e9dcc7', ink: '#25211b', trigger: 'plan-open-goals', target: 'goals' },
  { id: 'purchases', label: 'PURCHASES', box: [848, 814, 916, 952] as const, fill: '#ddd3c6', ink: '#25211b', trigger: 'discovery-F08-F10', target: 'F10' },
  { id: 'trips', label: 'TRIPS', box: [855, 962, 918, 1093] as const, fill: '#bdb69c', ink: '#25211b', trigger: 'discovery-F08-F11', target: 'F11' },
  { id: 'ahead', label: 'AHEAD', box: [862, 1093, 928, 1231] as const, fill: '#6a2b28', ink: '#f3e9e2', trigger: 'discovery-F08-F15', target: 'F15' },
] as const;
/** The botanical print on the left page (local px of the straightened left page). */
export const PLAN_LEAF = [143, 739, 314, 961] as const;

export const CREDIT_SCENE: RootScene = {
  // The shell is the empty wall and ledge; centre crop.
  framing: { px: 0.5, py: 0.5 },
  hang: { ref: 0, shell: 0 },
  objects: {},
};
/**
 * The dossier lifted from reference 04 (print cleared) stands on the shell's stone ledge: its foot (reference y 1148)
 * rests at shell y 2700, between the ledge's back edge (2600) and its front edge (2830). The actions sit on the ledge
 * face above the dock, the reference's 35 px clear of it.
 */
export const CREDIT_DOSSIER = { box: [120, 620, 880, 1165] as const, foot: 1148, shellFoot: 2700, ledgeBack: 2600, minGap: 40, dockGap: 35 };
