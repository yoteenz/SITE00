import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};
const I = (d: string) =>
  function Icon(p: SVGProps<SVGSVGElement>) {
    return (
      <svg {...base} {...p}>
        <path d={d} />
      </svg>
    );
  };

export const IcCheck = I('M5 12.5l4.5 4.5L19 7.5');
export const IcWarn = I('M12 4l9 16H3zM12 10v4.5M12 17.5v.01');
export const IcLock = I('M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3');
export const IcArrowR = I('M4 12h15M13 6l6 6-6 6');
export const IcArrowL = I('M20 12H5M11 6l-6 6 6 6');
export const IcArrowD = I('M12 4v15M6 13l6 6 6-6');
export const IcChevR = I('M9 5l7 7-7 7');
export const IcChevL = I('M15 5l-7 7 7 7');
export const IcChevD = I('M5 9l7 7 7-7');
export const IcClose = I('M5 5l14 14M19 5L5 19');
export const IcMenu = I('M4 7h16M4 12h16M4 17h16');
export const IcSearch = I('M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4');
export const IcFilter = I('M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4');
export const IcExpand = I('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5');
export const IcCompare = I('M4 5h7v14H4zM13 5h7v14h-7z');
export const IcInfo = I('M12 4a8 8 0 100 16 8 8 0 000-16zM12 11v5M12 8v.01');
export const IcZoomIn = I('M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4M11 8v6M8 11h6');
export const IcFit = I('M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4M9 9h6v6H9z');
export const IcCube = I('M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9');
export const IcSwap = I('M4 9h14l-4-4M20 15H6l4 4');
/** Bottom nav glyphs traced from the Production authority bar: solid house, envelope, leaf, plain triangle, hexagon, isometric cube, clock. */
export const IcHome = I('M4 11.2L12 4l8 7.2V21H4z');
export const IcMail = I('M3.5 6.5h17v12h-17zM3.5 7.2l8.5 6.2 8.5-6.2');
export const IcLeaf = I('M6.5 20C6.5 11 10 6 19 3.5 17.5 10 14.5 15 8 17.2M6.5 20c-.8-3.2-.6-5.6.8-8');
export const IcTriangle = I('M12 3.2L21.2 20.2H2.8z');
export const IcHex = I('M12 2.8l7.6 4.4v9.6L12 21.2l-7.6-4.4V7.2z');
export const IcLibrary = I('M12 3.2l7.4 4.2v.1L12 11.6 4.6 7.5zM4.6 8.2v8.6L12 21V12.2zM12 12.2l7.4-4v8.6L12 21');
export const IcClock = I('M12 3.2a8.8 8.8 0 100 17.6 8.8 8.8 0 000-17.6zM12 7.2V12l3.4 2');
export const IcUser = I('M12 4a4 4 0 100 8 4 4 0 000-8zM5 20c1-4 4-6 7-6s6 2 7 6');
export const IcShirt = I('M9 4l3 2 3-2 5 3-2 4-2-1v10H8V10l-2 1-4-4z');
export const IcInfinity = I('M7 9a3 3 0 100 6c3 0 7-6 10-6a3 3 0 010 6c-3 0-7-6-10-6z');
export const IcPulse = I('M3 12h4l2-6 4 12 2-6h6');
export const IcFrames = I('M4 6h16v12H4zM8 6v12M16 6v12');
export const IcMove = I('M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4');
export const IcCam = I('M4 8h11v9H4zM15 11l5-3v9l-5-3');
export const IcSet = I('M4 4h16v16H4zM8 12h8M12 8v8');
export const IcRefresh = I('M20 12a8 8 0 10-3 6.2M20 6v6h-6');
export const IcPlus = I('M12 5v14M5 12h14');

/** Reticle used by the ITEMS NEED YOU indicator (pure SVG). */
export function Reticle({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden>
      <circle cx="22" cy="22" r="19" fill="#0b0b0d" stroke="#111" strokeWidth="1" />
      <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth=".6" />
      <circle cx="22" cy="22" r="15" fill="none" stroke="#e5231b" strokeWidth="1" strokeDasharray="3 2.4" />
      <path d="M22 2v7M22 35v7M2 22h7M35 22h7" stroke="#e5231b" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="2.2" fill="#e5231b" />
    </svg>
  );
}

export const IcTrash = I('M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v6M14 11v6');
export const IcPlay = I('M8 5l11 7-11 7z');
export const IcPause = I('M8 5v14M16 5v14');
export const IcStop = I('M6 6h12v12H6z');
export const IcSliders = I('M4 8h9M17 8h3M4 16h3M11 16h9M15 6v4M9 14v4');
export const IcPaperclip = I('M8 12l6-6a3 3 0 014 4l-8 8a5 5 0 01-7-7l7-7');
export const IcSkipL = I('M7 5v14M19 5l-9 7 9 7z');
export const IcSkipR = I('M17 5v14M5 5l9 7-9 7z');
export const IcEye = I('M2 12c3-5 6.5-7 10-7s7 2 10 7c-3 5-6.5 7-10 7s-7-2-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z');
export const IcSave = I('M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6');
