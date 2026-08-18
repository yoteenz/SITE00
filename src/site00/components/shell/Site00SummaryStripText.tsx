type Site00SummaryStripTextProps = {
  text: string;
};

/** Bottom-panel summary copy — black sentences, red ♦ separators, relaxed spacing. */
export function Site00SummaryStripText({ text }: Site00SummaryStripTextProps) {
  const segments = text
    .split('♦')
    .map((segment) => segment.trim())
    .filter(Boolean);

  return (
    <p className="site00-summary-strip site00-mono">
      {segments.map((segment, index) => (
        <span key={`${index}-${segment}`} className="site00-summary-strip__group">
          {index > 0 ? (
            <span className="site00-summary-strip__bullet" aria-hidden="true">
              ♦
            </span>
          ) : null}
          <span className="site00-summary-strip__segment">{segment}</span>
        </span>
      ))}
    </p>
  );
}
