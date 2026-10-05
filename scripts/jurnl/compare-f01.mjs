/**
 * REFERENCE → LIVE comparison sheets for JURNL F01 (authority left, live runtime capture right).
 * Usage: node scripts/jurnl/compare-f01.mjs <capturesDir with mobile-F01.xx.png> <outDir>
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const [caps, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const AUTH = 'public/site00/projects/jurnl/f01/authorities';
const files = {
  'F01.00': 'F01.00_WELCOME_APPROVED.jpg',
  'F01.01': 'children/F01.01_CREATE_ACCOUNT.jpg',
  'F01.02': 'children/F01.02_EMAIL_VERIFICATION.jpg',
  'F01.03': 'children/F01.03_SIGN_IN.jpg',
  'F01.04': 'children/F01.04_RETURNING_USER_UNLOCK.jpg',
  'F01.05': 'children/F01.05_FORGOT_PASSWORD.jpg',
  'F01.06': 'children/F01.06_RESET_EMAIL_SENT.jpg',
  'F01.07': 'children/F01.07_CREATE_NEW_PASSWORD.jpg',
  'F01.08': 'children/F01.08_PASSWORD_RESET_SUCCESS.jpg',
  'F01.09': 'children/F01.09_BIOMETRIC_SETUP.jpg',
  'F01.10': 'children/F01.10_DEVICE_TRUST.jpg',
  'F01.11': 'children/F01.11_PRIVACY_PRIMER.jpg',
  'F01.12': 'children/F01.12_SECURITY_PRIMER.jpg',
  'F01.13': 'children/F01.13_ENTRY_COMPLETE.jpg',
};
const H = 852;
for (const [id, f] of Object.entries(files)) {
  const a = await sharp(join(AUTH, f)).resize({ height: H }).toBuffer({ resolveWithObject: true });
  const b = await sharp(join(caps, `mobile-${id}.png`)).resize({ height: H }).toBuffer({ resolveWithObject: true });
  const w = a.info.width + b.info.width + 36;
  await sharp({ create: { width: w, height: H + 24, channels: 3, background: '#1b1b1b' } })
    .composite([
      { input: a.data, left: 12, top: 12 },
      { input: b.data, left: a.info.width + 24, top: 12 },
    ])
    .jpeg({ quality: 78 })
    .toFile(join(out, `compare-${id}.jpg`));
}
console.log('ok');
