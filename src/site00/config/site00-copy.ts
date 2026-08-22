/** Shared SITE 00 copy fragments — always uppercase for UI + assistive text. */

export const SITE00_COPY_SIGN_IN_TO_ENTER = 'SIGN IN TO ENTER';

export function site00AuthLockedAriaLabel(title: string): string {
  return `${title} — ${SITE00_COPY_SIGN_IN_TO_ENTER}`;
}

/** Normalize route/config copy to SITE 00 uppercase law. */
export function site00UppercaseCopy(value: string): string {
  return value.toUpperCase();
}
