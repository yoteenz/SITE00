/** Vitest global env — mirrors import.meta.env.VITEST for Node-side guards. */
if (process.env.VITEST === undefined) {
  process.env.VITEST = 'true';
}

/** Production JURNL runtime tests expect the Wave 5 server plane when CI deploy secrets are present. */
if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
  if (!process.env.VITE_JURNL_SERVER_PERSISTENCE) {
    process.env.VITE_JURNL_SERVER_PERSISTENCE = '1';
  }
}
