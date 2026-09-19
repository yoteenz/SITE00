/**
 * Authority-controlled line breaks for brand family labels.
 */

type Props = {
  brandKey: string;
  fallbackName: string;
  lineBreaks: Record<string, string[]>;
};

export function SkinFamilyName({ brandKey, fallbackName, lineBreaks }: Props) {
  const lines = lineBreaks[brandKey] ?? [fallbackName.toUpperCase()];
  return (
    <span className="site00-dw-skins__family-name">
      {lines.map((line, i) => (
        <span key={`${brandKey}-${i}`} className="site00-dw-skins__family-name-line">
          {line}
        </span>
      ))}
    </span>
  );
}
