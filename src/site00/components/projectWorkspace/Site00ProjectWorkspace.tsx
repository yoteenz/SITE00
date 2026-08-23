import type { ReactNode } from 'react';
import type { ProjectWorkspaceZone } from '../../../../shared/site00-brand-lore/projectWorkspace/constants.js';
import { buildProjectWorkspaceBible } from '../../../../shared/site00-brand-lore/projectWorkspace/projectWorkspaceBible.js';

type Site00ProjectWorkspaceProps = {
  children?: ReactNode;
  activeZone?: ProjectWorkspaceZone;
  reviewTrayVisible?: boolean;
};

const bible = buildProjectWorkspaceBible();

export function Site00ProjectWorkspace({
  children,
  activeZone = 'ON_THE_BENCH',
  reviewTrayVisible = false,
}: Site00ProjectWorkspaceProps) {
  return (
    <div className="site00-pws-shell" data-active-zone={activeZone}>
      <header className="site00-pws-shell__header">
        <p className="site00-label-red">SITE 00 PROJECT WORKSPACE</p>
        <p className="site00-pws-shell__thesis">{bible.workspaceThesis}</p>
      </header>
      <div className="site00-pws-shell__zones">
        <section className="site00-pws-zone site00-pws-zone--bench" aria-label="On the bench">
          <h2 className="site00-pws-zone__title">ON THE BENCH</h2>
          {activeZone === 'ON_THE_BENCH' || activeZone === 'ACTIVE_PIECE' ? children : null}
        </section>
        {reviewTrayVisible ? (
          <section className="site00-pws-zone site00-pws-zone--review" aria-label="Review tray">
            <h2 className="site00-pws-zone__title">REVIEW TRAY</h2>
          </section>
        ) : null}
        <section className="site00-pws-zone site00-pws-zone--history site00-pws-zone--peripheral" aria-label="Work history">
          <h2 className="site00-pws-zone__title">WORK HISTORY</h2>
        </section>
        <section className="site00-pws-zone site00-pws-zone--dossier site00-pws-zone--contextual" aria-label="Dossier">
          <h2 className="site00-pws-zone__title">DOSSIER</h2>
        </section>
      </div>
    </div>
  );
}
