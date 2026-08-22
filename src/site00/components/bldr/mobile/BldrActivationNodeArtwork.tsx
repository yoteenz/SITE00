type BldrActivationNodeArtworkProps = {
  className?: string;
};

/** Circular target / activation node for READY TO BEGIN CTA. */
export function BldrActivationNodeArtwork({ className = '' }: BldrActivationNodeArtworkProps) {
  return (
    <svg
      className={`site00-bldr-mobile-cta__node-art ${className}`.trim()}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="34" stroke="rgba(0,0,0,0.08)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="40" cy="40" r="24" stroke="rgba(0,0,0,0.12)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="40" cy="40" r="14" stroke="rgba(0,0,0,0.16)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="40" y1="8" x2="40" y2="72" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <line x1="8" y1="40" x2="72" y2="40" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" vectorEffect="non-scaling-stroke" />
      <circle cx="40" cy="40" r="5" fill="var(--site-red)" />
      <circle cx="40" cy="40" r="2" fill="#fff" />
      <circle cx="16" cy="24" r="1.5" fill="rgba(0,0,0,0.3)" />
      <circle cx="64" cy="24" r="1.5" fill="rgba(0,0,0,0.3)" />
      <circle cx="64" cy="56" r="1.5" fill="rgba(0,0,0,0.3)" />
      <circle cx="16" cy="56" r="1.5" fill="rgba(0,0,0,0.3)" />
    </svg>
  );
}
