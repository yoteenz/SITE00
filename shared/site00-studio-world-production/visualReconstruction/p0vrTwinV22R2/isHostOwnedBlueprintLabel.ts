/** Host-owned bands that must not be treated as client executable regions. */
export function isHostOwnedBlueprintLabel(label: string): boolean {
  const n = label.toLowerCase();
  return (
    n.includes('host bottom nav') ||
    n.includes('site 00 host') ||
    n.includes('global host') ||
    n.includes('host chrome') ||
    n.includes('host header')
  );
}
