/** Stable checksum for IR payloads (not cryptographic — lineage + drift detection). */
export function computeStableChecksum(input: unknown): string {
  const json = JSON.stringify(input, Object.keys(input as object).sort());
  let h = 2166136261;
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `ck${(h >>> 0).toString(16)}`;
}
