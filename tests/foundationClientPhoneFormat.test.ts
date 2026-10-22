import { describe, expect, it } from 'vitest';
import { formatUsPhoneDisplay } from '../src/site00/foundation-client/phoneFormat';

describe('formatUsPhoneDisplay', () => {
  it('formats partial and full US numbers with dashes', () => {
    expect(formatUsPhoneDisplay('')).toBe('');
    expect(formatUsPhoneDisplay('9')).toBe('9');
    expect(formatUsPhoneDisplay('901')).toBe('901');
    expect(formatUsPhoneDisplay('9012')).toBe('901-2');
    expect(formatUsPhoneDisplay('901236')).toBe('901-236');
    expect(formatUsPhoneDisplay('9012362647')).toBe('901-236-2647');
  });

  it('strips non-digits and caps at 10 digits', () => {
    expect(formatUsPhoneDisplay('(901) 236-2647')).toBe('901-236-2647');
    expect(formatUsPhoneDisplay('901-236-2647-9999')).toBe('901-236-2647');
  });
});
