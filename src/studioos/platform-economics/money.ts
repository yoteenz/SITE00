import { BASIS_POINT_SCALE } from './rate';

/** Integer minor units of one currency. Core math never assumes USD. */
export type Money = {
  currency: string;
  minor: number;
};

export function money(currency: string, minor: number): Money {
  if (!Number.isInteger(minor)) throw new Error('MONEY_NOT_MINOR_UNITS');
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('CURRENCY_REQUIRED');
  return { currency, minor };
}

export function zeroMoney(currency: string): Money {
  return money(currency, 0);
}

/** Round half away from zero. Remainder is compared in integers, not floats. */
export function applyBasisPoints(minor: number, basisPoints: number): number {
  if (!Number.isInteger(minor) || !Number.isInteger(basisPoints)) throw new Error('MONEY_NOT_MINOR_UNITS');
  const negative = minor < 0;
  const product = BigInt(Math.abs(minor)) * BigInt(Math.abs(basisPoints));
  const scale = BigInt(BASIS_POINT_SCALE);
  const quotient = product / scale;
  const remainder = product % scale;
  const rounded = remainder * 2n >= scale ? quotient + 1n : quotient;
  const value = Number(rounded);
  if (!Number.isSafeInteger(value)) throw new Error('MONEY_OUT_OF_RANGE');
  return negative ? -value : value;
}

export function assertSameCurrency(amounts: Money[]): string {
  if (amounts.length === 0) throw new Error('EMPTY_MONEY_SET');
  const currency = amounts[0].currency;
  if (amounts.some((amount) => amount.currency !== currency)) throw new Error('MIXED_CURRENCY_AGGREGATE');
  return currency;
}

export function sumMoney(amounts: Money[]): Money {
  const currency = assertSameCurrency(amounts);
  const minor = amounts.reduce((total, amount) => {
    if (!Number.isInteger(amount.minor)) throw new Error('MONEY_NOT_MINOR_UNITS');
    return total + amount.minor;
  }, 0);
  return money(currency, minor);
}
