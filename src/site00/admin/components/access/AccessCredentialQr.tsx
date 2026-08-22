import { useEffect, useRef, useState } from 'react';

type AccessCredentialQrProps = {
  url: string;
  size?: number;
  className?: string;
  label?: string;
};

/** High-contrast QR for physical Founder Access Cards — quiet zone preserved via padding. */
export function AccessCredentialQr({ url, size = 200, className = '', label = 'ACCESS QR' }: AccessCredentialQrProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const QRCode = await import('qrcode');
        if (cancelled || !canvasRef.current) return;
        await QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'QR generation failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url, size]);

  if (error) {
    return <p className="site00-admin-panel site00-admin-panel--error">{error.toUpperCase()}</p>;
  }

  return (
    <figure className={`site00-access-qr site00-access-qr--print ${className}`.trim()}>
      <canvas ref={canvasRef} aria-label={label} role="img" />
      <figcaption className="site00-admin-meta">{label}</figcaption>
    </figure>
  );
}
