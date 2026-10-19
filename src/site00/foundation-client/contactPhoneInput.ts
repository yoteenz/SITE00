import { AsYouType } from 'libphonenumber-js';
import { formatUsPhoneDisplay } from './phoneFormat';

/** Light-touch display formatting: US dashed pattern unless the user leads with +. */
export function formatContactPhoneInput(raw: string): string {
  const trimmed = raw.trimStart();
  if (trimmed.startsWith('+') || trimmed.startsWith('00')) {
    const ayt = new AsYouType();
    return ayt.input(raw.replace(/^00/, '+'));
  }
  return formatUsPhoneDisplay(raw);
}
