/** Vitest global env — mirrors import.meta.env.VITEST for Node-side guards. */
if (process.env.VITEST === undefined) {
  process.env.VITEST = 'true';
}
