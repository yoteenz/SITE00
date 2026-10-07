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
          fillRule="evenodd"
          d="M12 3.05 20.7 10.15h-2.35V19.4c0 .75-.6 1.35-1.35 1.35H7c-.75 0-1.35-.6-1.35-1.35v-9.25H3.3L12 3.05zm-2.2 17.7v-5.05c0-1.2.98-2.15 2.2-2.15s2.2.95 2.2 2.15v5.05H9.8z"
        />
      ) : null}
      {name === 'money' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.15" y="6.55" width="17.7" height="11.15" rx="2.25" />
          <path d="M3.15 10.45h17.7" />
          <path d="M8.05 14.25h4.15" />
        </g>
      ) : null}
      {name === 'add' ? (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          d="M12 5.1v13.8M5.1 12h13.8"
        />
      ) : null}
      {name === 'plan' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21.15c-2.65-2.55-4.65-6.35-4.05-11.05C8.45 6.15 10.05 3.55 12 2.35c1.95 1.2 3.55 3.8 4.05 7.75.6 4.7-1.4 8.5-4.05 11.05z" />
          <path d="M12 19.35V4.55" />
        </g>
      ) : null}
      {name === 'credit' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M5.6 19.35V14.2" />
          <path d="M9.85 19.35V10.85" />
          <path d="M14.15 19.35V7.45" />
          <path d="M18.4 19.35V4.15" />
        </g>
      ) : null}
    </svg>
  );
}
