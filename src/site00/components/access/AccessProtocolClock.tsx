type AccessProtocolClockProps = {
  visible?: boolean;
  className?: string;
};

/** Recognition timestamp — static architectural clock per moodboard. */
export function AccessProtocolClock({ visible = true, className = '' }: AccessProtocolClockProps) {
  return (
    <p
      className={[
        'site00-access-clock',
        visible ? 'site00-access-clock--visible' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      [ 00:00:01 ]
    </p>
  );
}
