/** Display only. Stored money stays integer minor units. This does not calculate a fee. */

const TWO_DECIMAL = new Set(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);

export function formatMinorForDisplay(currency: string, minor: number): string {
  if (!Number.isInteger(minor)) return `${currency} AMOUNT UNAVAILABLE`;
  if (!TWO_DECIMAL.has(currency)) return `${minor} minor ${currency}`;
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(minor / 100);
}
