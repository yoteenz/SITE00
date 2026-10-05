/**
 * F02 SETUP plate edges, traced by hand on fraction-gridded crops of the canonical plates (2016 × 3584).
 * Each profile is the visible LEFT edge of the environment element the copy must stay clear of, as [plateY, plateX]
 * fractions, top to bottom across the content band. The sheer curtain's faint fringe counts as curtain.
 *   ARRIVAL — white sheer curtain (leans right as it falls)
 *   DESK    — white sheer curtain in front of the wall corner
 *   EDIT    — olive leaves (top) then the stone pilaster
 *   QUIET   — lit stone column (the white curtain sits further right)
 * `edgeX(plate, vw, vh, y0, y1)` maps a profile into device pixels through the same object-fit: cover and
 * object-position the runtime plate uses (50% 50% mobile · 56% 38% tablet · 62% 34% desktop; ARRIVAL opens its phone
 * crop on the plaster wall at 0% 50%). Below the last profile point (the ledge, cushions and table) there is no edge.
 */
export const PLATE_W = 2016;
export const PLATE_H = 3584;

export const PLATE_EDGES = {
  'ENV.ARRIVAL': { kind: 'WHITE_CURTAIN', mobilePosition: [0, 0.5], profile: [[0, 0.43], [0.1, 0.435], [0.2, 0.455], [0.3, 0.48], [0.4, 0.51], [0.5, 0.55], [0.6, 0.58], [0.66, 0.6]] },
  'ENV.DESK': { kind: 'WHITE_CURTAIN', profile: [[0, 0.595], [0.1, 0.6], [0.2, 0.615], [0.3, 0.635], [0.4, 0.655], [0.5, 0.675], [0.6, 0.69], [0.66, 0.7]] },
  'ENV.EDIT': { kind: 'LEAVES_THEN_PILASTER', profile: [[0, 0.65], [0.1, 0.6], [0.17, 0.6], [0.22, 0.69], [0.3, 0.745], [0.66, 0.745]] },
  'ENV.QUIET': { kind: 'STONE_COLUMN', profile: [[0, 0.645], [0.66, 0.645]] },
};

const POSITION = { mobile: [0.5, 0.5], tablet: [0.56, 0.38], desktop: [0.62, 0.34] };

export function breakpoint(vw) {
  return vw >= 1100 ? 'desktop' : vw >= 600 ? 'tablet' : 'mobile';
}

/** Device x of the plate edge at device y (the most-left edge across [y0, y1]). */
export function edgeX(plate, vw, vh, y0, y1 = y0) {
  const e = PLATE_EDGES[plate];
  if (!e) return null;
  const bp = breakpoint(vw);
  const [px, py] = bp === 'mobile' && e.mobilePosition ? e.mobilePosition : POSITION[bp];
  const s = Math.max(vw / PLATE_W, vh / PLATE_H);
  const rw = PLATE_W * s;
  const rh = PLATE_H * s;
  const offX = (rw - vw) * px;
  const offY = (rh - vh) * py;
  const end = e.profile[e.profile.length - 1][0];
  if ((y0 + offY) / rh > end) return null;
  y1 = Math.min(y1, end * rh - offY);
  const at = (fy) => {
    const p = e.profile;
    if (fy <= p[0][0]) return p[0][1];
    for (let i = 1; i < p.length; i += 1) {
      if (fy <= p[i][0]) {
        const t = (fy - p[i - 1][0]) / (p[i][0] - p[i - 1][0]);
        return p[i - 1][1] + t * (p[i][1] - p[i - 1][1]);
      }
    }
    return p[p.length - 1][1];
  };
  let min = Infinity;
  for (let y = y0; y <= y1; y += Math.max(1, (y1 - y0) / 8)) min = Math.min(min, at((y + offY) / rh));
  min = Math.min(min, at((y1 + offY) / rh));
  return Math.round(min * rw - offX);
}
