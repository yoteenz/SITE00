const SIGIL_GLYPH: Record<string, string> = {
  ALL: '✦',
  LOVE: '♡',
  CAREER: '◈',
  INTUITIVE: '☽',
  TAROT: '✧',
  ENERGY: '⚡',
};

type AstralCategorySigilProps = {
  category: string;
  active?: boolean;
  onClick?: () => void;
};

export function AstralCategorySigil({ category, active, onClick }: AstralCategorySigilProps) {
  const glyph = SIGIL_GLYPH[category] ?? '·';
  return (
    <button
      type="button"
      className={`aw-category-sigil${active ? ' aw-category-sigil--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={category}
      title={category}
    >
      <span className="aw-category-sigil__glyph" aria-hidden>{glyph}</span>
      <span className="aw-category-sigil__name">{category === 'ALL' ? 'All' : category.charAt(0) + category.slice(1).toLowerCase()}</span>
    </button>
  );
}

export function AstralCategorySigilRow({
  categories,
  active,
  onSelect,
}: {
  categories: readonly string[];
  active: string;
  onSelect: (c: string) => void;
}) {
  return (
    <div className="aw-category-sigil-row" role="group" aria-label="Reader categories">
      {categories.map((c) => (
        <AstralCategorySigil key={c} category={c} active={active === c} onClick={() => onSelect(c)} />
      ))}
    </div>
  );
}
