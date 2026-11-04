/** Collision-free entity ids for device records (time + counter + random). */

let seq = 0;

export function newEntityId(prefix: string): string {
  seq = (seq + 1) % 1_000_000;
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}${rand}`;
}
