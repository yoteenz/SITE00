/**
 * Gray loader subtitle copy rules:
 * - Max 3 words
 * - 4 words only when every word is ≤3 letters (e.g. "OUT TO THE NET")
 */

export function isValidLoaderSubtitle(text: string): boolean {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 3) return true;
  if (words.length === 4) return words.every((word) => word.length <= 3);
  return false;
}

export function assertLoaderSubtitle(text: string, context?: string): string {
  if (isValidLoaderSubtitle(text)) return text;
  const label = context ? ` (${context})` : '';
  throw new Error(`Loader subtitle must be ≤3 words (4 only if all words ≤3 letters)${label}: "${text}"`);
}
