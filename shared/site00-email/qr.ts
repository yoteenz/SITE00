import QRCode from 'qrcode';
import { EMAIL } from './design/tokens.js';

/** Generate a real scannable QR code as a data URL for email `<img src>`. */
export async function qrDataUrlFor(destination: string): Promise<string> {
  const url = destination.trim() || 'https://site00.com';
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 180,
    color: { dark: EMAIL.black, light: EMAIL.white },
  });
}
