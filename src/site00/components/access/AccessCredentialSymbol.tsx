/** Geometric access registration mark for credential recognition screens. */
export function AccessCredentialSymbol({ className = '' }: { className?: string }) {
  return (
    <div className={`site00-access-symbol ${className}`.trim()} aria-hidden="true">
      <svg className="site00-access-symbol__svg" viewBox="0 0 120 120" role="presentation">
        <rect x="38" y="16" width="44" height="88" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="60" y1="16" x2="60" y2="104" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
        <line x1="38" y1="60" x2="82" y2="60" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
        <circle cx="60" cy="60" r="3" fill="currentColor" />
        <circle cx="60" cy="32" r="2" fill="currentColor" />
        <circle cx="60" cy="88" r="2" fill="currentColor" />
        <path d="M28 60 H38 M82 60 H92" stroke="currentColor" strokeWidth="0.75" opacity="0.45" />
        <path d="M60 8 V16 M60 104 V112" stroke="currentColor" strokeWidth="0.75" opacity="0.45" />
      </svg>
    </div>
  );
}
