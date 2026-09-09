/**
 * Side-by-side Evolve proof previews for master skin distinctiveness demo.
 */

import { PROOF_PROJECT_SKIN_MAP } from '../../../../shared/site00-brand-lore/projectSkin/browserClient.js';

const PROOF_ROWS = [
  { projectId: 'ndxbook', label: 'NDXBOOK', skin: 'Cultural Editorial' },
  { projectId: 'demo-doctor-health', label: 'DOCTOR DEMO', skin: 'Clinical Editorial' },
  { projectId: 'all-in-one-enterprises', label: 'AIO', skin: 'Technical Operations' },
] as const;

export function MasterSkinEvolveProofPanel() {
  return (
    <section className="site00-master-skin-proof" data-panel="evolve-proof">
      <header>
        <h2>MASTER SKIN / EXPERIENCE PREVIEW</h2>
        <p>Same module (EVOLVE) · distinct experience grammars · shared SITE 00 host shell</p>
      </header>
      <div className="site00-master-skin-proof__grid">
        {PROOF_ROWS.map((row) => {
          const skinId = PROOF_PROJECT_SKIN_MAP[row.projectId];
          return (
            <article
              key={row.projectId}
              className={`site00-master-skin-proof__card site00-master-skin--${skinId}`}
              data-project-id={row.projectId}
              data-master-skin={skinId}
            >
              <header>
                <strong>{row.label}</strong>
                <span>{row.skin.toUpperCase()}</span>
              </header>
              <div className="site00-master-skin-proof__evolve-mock">
                <p className="site00-master-skin-proof__eyebrow">EVOLVE</p>
                <h3 className="site00-master-skin-proof__title">Module expression layer</h3>
                <ul className="site00-master-skin-proof__signals">
                  {skinId === 'cultural-editorial' ? (
                    <>
                      <li>Evidence timeline</li>
                      <li>Annotated media cards</li>
                      <li>Editorial rule system</li>
                    </>
                  ) : null}
                  {skinId === 'clinical-editorial' ? (
                    <>
                      <li>Diagnostic sections</li>
                      <li>Calm structured grid</li>
                      <li>Trust-forward hierarchy</li>
                    </>
                  ) : null}
                  {skinId === 'technical-operations' ? (
                    <>
                      <li>Status-led panels</li>
                      <li>Operational metric tiles</li>
                      <li>Technical grid surfaces</li>
                    </>
                  ) : null}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
