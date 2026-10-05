type AccessProtocolLabelProps = {
  visible?: boolean;
  className?: string;
};

/** Bracketed access protocol marker — `[ ACCESS PROTOCOL ]`. */
export function AccessProtocolLabel({ visible = true, className = '' }: AccessProtocolLabelProps) {
  return (
    <p
      className={[
        'site00-access-protocol',
        visible ? 'site00-access-protocol--visible' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      [ ACCESS PROTOCOL ]
    </p>
  );
}
