/**
 * Sticky primary / secondary action row for SKINS child surfaces.
 */

type Action = {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
};

type Props = {
  actions: Action[];
  layout?: 'split' | 'stack';
};

export function SkinPrimaryActions({ actions, layout = 'split' }: Props) {
  return (
    <div className={`site00-dw-skins-actions site00-dw-skins-actions--${layout}`}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={`site00-dw-v3-btn site00-dw-v3-btn--${action.variant ?? 'outline'}${action.variant === 'primary' ? '' : ''}${action.variant === 'ghost' ? ' site00-dw-v3-btn--compact' : ''}`}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
