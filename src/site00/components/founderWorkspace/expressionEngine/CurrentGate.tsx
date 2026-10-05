/**
 * B5.0 — Current gate module — what is waiting on the founder.
 */

type Props = {
  gateLabel: string;
  nextAction: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryDisabled?: boolean;
  children?: React.ReactNode;
};

export function CurrentGate({
  gateLabel,
  nextAction,
  primaryActionLabel,
  onPrimaryAction,
  primaryDisabled,
  children,
}: Props) {
  return (
    <aside className="site00-ee-gate">
      <p className="site00-ee-gate__kicker">CURRENT GATE</p>
      <h2 className="site00-ee-gate__label">{gateLabel}</h2>
      <p className="site00-ee-gate__action-text">{nextAction}</p>
      {primaryActionLabel && onPrimaryAction ? (
        <button
          type="button"
          className="site00-btn site00-btn--primary site00-ee-gate__primary"
          disabled={primaryDisabled}
          onClick={onPrimaryAction}
        >
          {primaryActionLabel}
        </button>
      ) : null}
      {children}
    </aside>
  );
}
