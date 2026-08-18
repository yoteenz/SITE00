import type { ReactNode } from 'react';
import { AsstsLibraryShell } from './AsstsLibraryShell';
import { AsstsVaultNav } from './AsstsMobileNav';
import { AsstsPageShell } from './AsstsPageShell';

type AsstsVaultSubpageShellProps = {
  title: string;
  eyebrow?: string;
  tagline?: string;
  children: ReactNode;
};

/** Shared scroll shell for Asset Vault mobile sub-routes (Search, Notifications, Profile). */
export function AsstsVaultSubpageShell({ title, eyebrow = 'SITE 00 · ASSTS', tagline, children }: AsstsVaultSubpageShellProps) {
  return (
    <AsstsLibraryShell scrollLayout>
      <AsstsPageShell variant="library">
        <div className="assts-library-home assts-vault-subpage">
          <header className="assts-library-home__header">
            <div className="assts-library-home__header-copy">
              <p className="assts-library-home__eyebrow site00-label-red">{eyebrow}</p>
              <h1 className="assts-library-home__title">{title}</h1>
              {tagline ? <p className="assts-library-home__tagline">{tagline}</p> : null}
            </div>
            <div className="assts-library-home__emblem" aria-hidden="true">
              <span className="assts-library-home__emblem-mark">✦</span>
            </div>
          </header>
          {children}
        </div>
      </AsstsPageShell>
      <AsstsVaultNav />
    </AsstsLibraryShell>
  );
}
