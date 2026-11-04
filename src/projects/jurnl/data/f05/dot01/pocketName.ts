/**
 * F05 DOT 01 — the check a new Pocket name gets before the canonical rename (`ledgerOps.renameAccount`, which uppercases,
 * trims and refuses an exact duplicate among active Pockets). Only what the existing fields already imply is added:
 * at least 2 characters, at most the field length, no control characters. Inner runs of spaces collapse to one.
 */
export const POCKET_NAME_MAX = 80;

export type PocketNameCheck = { ok: true; name: string; unchanged: boolean } | { ok: false; error: string };

export function checkPocketName(raw: string, current: string): PocketNameCheck {
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(raw)) return { ok: false, error: 'REMOVE THE UNSUPPORTED CHARACTERS.' };
  const name = raw.replace(/\s+/g, ' ').trim();
  if (name.length < 2) return { ok: false, error: 'ENTER A NAME OF AT LEAST 2 CHARACTERS.' };
  if (name.length > POCKET_NAME_MAX) return { ok: false, error: `A POCKET NAME CAN BE UP TO ${POCKET_NAME_MAX} CHARACTERS.` };
  return { ok: true, name, unchanged: name.toUpperCase() === current.trim().toUpperCase() };
}
