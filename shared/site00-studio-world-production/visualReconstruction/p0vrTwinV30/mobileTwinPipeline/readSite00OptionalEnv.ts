/** Read optional env in browser (Vite) or Node/tests — never assume `process` exists. */
export function readSite00OptionalEnv(name: string): string {
  try {
    const viteKey = name.startsWith('VITE_') ? name : `VITE_${name}`;
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const env = import.meta.env as Record<string, string | undefined>;
      const fromImportMeta = env[viteKey] ?? env[name];
      if (typeof fromImportMeta === 'string' && fromImportMeta.trim()) return fromImportMeta.trim();
    }
    const procEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    if (procEnv) {
      const fromProcess = procEnv[name] ?? procEnv[viteKey];
      if (typeof fromProcess === 'string' && fromProcess.trim()) return fromProcess.trim();
    }
  } catch {
    /* browser bundle must not crash Design boot */
  }
  return '';
}
