/**
 * Gray loader subtitle copy rules:
 * - Max 3 words
 * - 4 words only when every word is ≤3 letters (e.g. "OUT TO THE NET")
 * - Never use "assembling" — reserved for the status line above the progress bar
 */

const ASSEMBLING_TERM = /\bassembl\w*/i;

export function isValidLoaderSubtitle(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 3) {
    return !ASSEMBLING_TERM.test(text);
  }
  if (words.length === 4 && words.every((word) => word.length <= 3)) {
    return !ASSEMBLING_TERM.test(text);
  }
  return false;
}

export function assertLoaderSubtitle(text: string, context?: string): string {
  const label = context ? ` (${context})` : '';
  if (ASSEMBLING_TERM.test(text)) {
    throw new Error(`Loader subtitle must not use "assembling"${label} — reserved for status line: "${text}"`);
  }
  if (!isValidLoaderSubtitle(text)) {
    throw new Error(`Loader subtitle must be ≤3 words (4 only if all words ≤3 letters)${label}: "${text}"`);
  }
  return text;
}
