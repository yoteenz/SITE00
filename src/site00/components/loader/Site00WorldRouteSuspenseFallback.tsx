/**
 * Visible suspense fallback for SITE 00 world routes (Origin, Enter, IDNTY, …).
 * Must not portal the cinematic immersive loader — gate owns that lifecycle.
 */

export function Site00WorldRouteSuspenseFallback() {
  return (
    <div
      className="site00-world-route-suspense"
      role="status"
      aria-live="polite"
      aria-label="Loading SITE 00"
      style={{
        minHeight: '100lvh',
        background: '#f5f5f3',
        color: '#1a1a18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        font: '600 14px/1.4 system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      Loading SITE 00…
    </div>
  );
}
