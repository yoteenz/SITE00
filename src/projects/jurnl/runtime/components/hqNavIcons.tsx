/**
 * Bottom-nav marks from the HQ icon sheet.
 * 24-unit drawing, painted at 20px. The ADD square is CSS on `.jrn-nav__plus`, not part of the glyph.
 */

export function HqNavIcon({ name }: { name: 'home' | 'money' | 'add' | 'plan' | 'credit' }) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} className="jrn-hq" aria-hidden>
      {name === 'home' ? (
        <path
          fill="currentColor"
          d="M11.7 2.38Q4.22 6.53 2.2 10.69v9.51q0 1.42 1.36 1.42h4.82l.11-5.46q0-2.38 3.21-2.38 3.21 0 3.21 2.38l.12 5.46h5.41q1.36 0 1.36-1.42v-9.51q-2.62-4.16-10.1-8.31z"
        />
      ) : null}
      {name === 'money' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.8" y="4.51" width="18.4" height="14.97" rx="1.61" />
          <path d="M2.8 8.53h18.4" />
          <path d="M2.8 11.56h6.46" />
        </g>
      ) : null}
      {name === 'add' ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          d="M12 4.2v15.6M4.2 12h15.6"
        />
      ) : null}
      {name === 'plan' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.13" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.06 2.76C8.43 5.4 4.5 8 5.48 19.24 15.73 18.91 21.56 15.44 20.06 2.76" />
          <path d="M5.48 19.24 3.71 21.24" />
          <path d="M14.52 9.03 9.56 14.63" />
        </g>
      ) : null}
      {name === 'credit' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.18" strokeLinecap="round">
          <path d="M4.35 21V16.96" />
          <path d="M9.45 21V13.03" />
          <path d="M14.55 21V7.93" />
          <path d="M19.65 21V2.82" />
        </g>
      ) : null}
    </svg>
  );
}
