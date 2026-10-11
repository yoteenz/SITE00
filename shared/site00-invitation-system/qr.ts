import QRCode from 'qrcode';

export type QrAssetOptions = {
  /** Absolute first-party URL, no secrets. */
  destinationUrl: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
};

export async function renderInvitationQrSvg(options: QrAssetOptions): Promise<string> {
  return QRCode.toString(options.destinationUrl, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'H',
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

export async function renderInvitationQrPngDataUrl(options: QrAssetOptions): Promise<string> {
  return QRCode.toDataURL(options.destinationUrl, {
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'H',
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
    width: 512,
  });
}

export function invitationPublicPath(code: string): string {
  return `/invite/${encodeURIComponent(code)}`;
}

export function invitationPublicUrl(origin: string, code: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}${invitationPublicPath(code)}`;
}
