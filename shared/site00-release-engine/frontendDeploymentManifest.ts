/**
 * P0.DEPLOY.1 — Frontend-owned paths on cPanel (do not delete host-owned files).
 */

export const FRONTEND_OWNED_GLOBS = [
  'index.html',
  'release-manifest.json',
  'assets/**',
  'studio-world/**',
  'favicon.ico',
  'favicon.svg',
  'robots.txt',
  'sitemap.xml',
  '404.html',
  '.htaccess',
  'htaccess-deploy.txt',
  'projects/.htaccess',
  'projects/htaccess-nested.txt',
  'services/.htaccess',
  'services/htaccess-nested.txt',
  'control/.htaccess',
  'control/htaccess-nested.txt',
] as const;

/** Remote paths excluded from dangerous-clean-slate deletion (host-owned). */
export const CPANEL_HOST_PRESERVE_EXCLUDES = [
  '**/.well-known/**',
  '**/.cpanel/**',
  '**/cgi-bin/**',
  '**/webmail/**',
  '**/mail/**',
  '**/tmp/**',
  '**/releases/**',
  '**/.ftpquota',
  '**/.htpasswd',
] as const;

export type FrontendDeploymentManifest = {
  ownedPaths: readonly string[];
  preserveExcludes: readonly string[];
  outputDir: string;
};

export function buildFrontendDeploymentManifest(outputDir = 'dist'): FrontendDeploymentManifest {
  return {
    ownedPaths: FRONTEND_OWNED_GLOBS,
    preserveExcludes: CPANEL_HOST_PRESERVE_EXCLUDES,
    outputDir,
  };
}
