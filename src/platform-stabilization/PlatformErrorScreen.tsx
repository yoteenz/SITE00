type Props = {
  title: string;
  message: string;
  boundary?: string;
  extra?: string;
  onRetry?: () => void;
  dataAttr?: string;
};

export function PlatformErrorScreen({
  title,
  message,
  boundary,
  extra,
  onRetry,
  dataAttr = 'platform-error',
}: Props) {
  return (
    <div
      data-platform-error={dataAttr}
      style={{
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        color: '#111',
        background: '#fff5f5',
      }}
    >
      <h1 style={{ fontSize: '16px', margin: '0 0 8px', color: '#eb1c24' }}>{title}</h1>
      <p style={{ margin: '0 0 12px', lineHeight: 1.5 }}>{message}</p>
      {boundary ? <p style={{ fontSize: '12px' }}>Boundary: {boundary}</p> : null}
      {extra ? <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px' }}>{extra}</pre> : null}
      {onRetry ? (
        <button type="button" onClick={onRetry} style={{ marginTop: '12px', padding: '6px 10px' }}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
