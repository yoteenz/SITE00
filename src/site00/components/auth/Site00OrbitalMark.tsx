type Site00OrbitalMarkProps = {
  className?: string;
  reducedMotion?: boolean;
};

/** Static red orbital mark for auth — does not reuse the immersive loader video layer. */
export function Site00OrbitalMark({ className = '' }: Site00OrbitalMarkProps) {
  return (
    <div className={`site00-orbital-mark ${className}`.trim()} aria-hidden="true">
      <svg className="site00-orbital-mark__svg" viewBox="0 0 220 220" role="presentation">
        <rect x="72" y="28" width="76" height="164" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <line x1="110" y1="28" x2="110" y2="192" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
        <line x1="72" y1="110" x2="148" y2="110" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
        <circle cx="110" cy="110" r="3.5" fill="currentColor" />
        <circle cx="110" cy="52" r="2.5" fill="currentColor" />
        <circle cx="110" cy="168" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}
