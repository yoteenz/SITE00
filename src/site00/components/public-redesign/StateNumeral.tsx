/**
 * Heavy condensed state numerals (00 / 01 / 02 / 03) drawn as live SVG.
 *
 * The authority draws the state codes with PLAIN zeros in a squared industrial numeral; the host
 * typeface (Martian Mono) only ships a slashed zero, which changes the state mark's identity. These
 * four glyphs are drawn in code (no raster, no screenshot) on a 76×100 cell, 10-unit tracking.
 */

const W = 76;
const GAP = 10;

const GLYPHS: Record<string, string> = {
  '0': 'M0 22Q0 0 22 0H54Q76 0 76 22V78Q76 100 54 100H22Q0 100 0 78ZM21 27Q21 21 27 21H49Q55 21 55 27V73Q55 79 49 79H27Q21 79 21 73Z',
  '1': 'M10 9 36 0H56V79H74V100H6V79H35V24L10 31Z',
  '2': 'M0 34V22Q0 0 22 0H54Q76 0 76 22V40Q76 50 68 57L30 79H76V100H0V80L50 50Q55 47 55 42V27Q55 21 49 21H27Q21 21 21 27V34Z',
  '3': 'M0 22Q0 0 22 0H54Q76 0 76 22V38Q76 46 69 50Q76 54 76 62V78Q76 100 54 100H22Q0 100 0 78V68H21V73Q21 79 27 79H49Q55 79 55 73V64Q55 59 50 59H28V41H50Q55 41 55 36V27Q55 21 49 21H27Q21 21 21 27V32H0Z',
};

export function StateNumeral({ code, className }: { code: string; className?: string }) {
  const digits = code.split('');
  const width = digits.length * W + (digits.length - 1) * GAP;
  return (
    <svg className={className} viewBox={`0 0 ${width} 100`} aria-hidden="true" focusable="false" data-state-numeral={code}>
      {digits.map((d, i) => (
        <path key={i} d={GLYPHS[d] ?? GLYPHS['0']} transform={`translate(${i * (W + GAP)} 0)`} fill="currentColor" fillRule="evenodd" />
      ))}
    </svg>
  );
}
