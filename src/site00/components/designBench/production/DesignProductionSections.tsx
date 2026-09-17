import { Link } from 'react-router-dom';

import { listCanonicalReferences } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';
import { TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH } from '../opusDirect/twinOpusDirectContent';
import { TWIN_OPUS_DIRECT_ASSET_MANIFEST } from '../opusDirect/twinOpusDirectAssetManifest';
import { DesignProductionChildShell } from './DesignProductionChildShell';
import { useTwinOpusDirectProduction } from '../opusDirect/useTwinOpusDirectProduction';
import { useDesignProductionNavigation } from './useDesignProductionNavigation';
import { site00ProjectProductAssetsPath } from '../../../config/routes';

export function DesignProductionSectionReferences() {
  const { projectSlug } = useDesignProductionNavigation();
  const refs = listCanonicalReferences(projectSlug);

  return (
    <DesignProductionChildShell title="REFERENCES" subtitle="Approved golden, authorities, and visual sources.">
      <figure className="tod-child__golden" data-testid="design-references-golden">
        <img src={TWIN_OPUS_DIRECT_GOLDEN_MASTER_PATH} alt="Approved mobile golden reference" />
        <figcaption>APPROVED GOLDEN · founder-r5f2-ndxbook · MOBILE</figcaption>
      </figure>
      <ul className="tod-child__list">
        {refs.slice(0, 12).map((ref) => (
          <li key={ref.referenceId} className="tod-child__card">
            <strong>{ref.screenId.replace(/_/g, ' ')}</strong>
            <span className="tod-child__muted">{ref.viewportClass.toUpperCase()}</span>
            <span>{ref.status.replace(/_/g, ' ')}</span>
          </li>
        ))}
      </ul>
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionAssets() {
  const { projectSlug } = useDesignProductionNavigation();
  const manifest = TWIN_OPUS_DIRECT_ASSET_MANIFEST;

  return (
    <DesignProductionChildShell
      title="ASSETS"
      subtitle="Approved Grok manifest slots — read-only; authority is not mutated here."
    >
      <p className="tod-child__note">
        Full vault:{' '}
        <Link to={site00ProjectProductAssetsPath(projectSlug)} className="tod-child__link">
          PROJECT PRODUCT ASSETS
        </Link>
      </p>
      <ul className="tod-child__list" data-testid="design-assets-list">
        {manifest.map((entry) => (
          <li key={entry.slot} className="tod-child__card">
            <strong>{entry.slot}</strong>
            <span className="tod-child__mono">{entry.src}</span>
            <span className="tod-child__muted">{entry.role}</span>
          </li>
        ))}
      </ul>
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionSkins() {
  return (
    <DesignProductionChildShell title="SKINS" subtitle="Current NDXBOOK design expression — not a generic theme builder.">
      <dl className="tod-child__dl">
        <div>
          <dt>Project skin</dt>
          <dd>NDXBOOK EDITORIAL TECHNICAL</dd>
        </div>
        <div>
          <dt>Typography</dt>
          <dd>IBM Plex Mono · condensed display · hierarchical borders</dd>
        </div>
        <div>
          <dt>Palette</dt>
          <dd>#050505 / #f4f4f4 / #d8ff3e</dd>
        </div>
        <div>
          <dt>Material</dt>
          <dd>Archival plate · paper grain · ink silhouette</dd>
        </div>
        <div>
          <dt>Density</dt>
          <dd>Reference viewport 768×1376 · full-bleed shell</dd>
        </div>
        <div>
          <dt>Panel grammar</dt>
          <dd>Band / pipe / dock · Canonical + List parity</dd>
        </div>
        <div>
          <dt>Lineage</dt>
          <dd>twin-opus-direct → production DESIGN workspace</dd>
        </div>
      </dl>
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionHistory() {
  const events = [
    { at: '2026-05-18', type: 'AUTHORITY REVIEW', detail: 'Mobile master V1.3 selected for pair' },
    { at: '2026-05-17', type: 'REFINEMENT', detail: 'Concept ENTRY001_V1.3 promoted in gallery' },
    { at: '2026-05-16', type: 'REGENERATION', detail: 'Sibling candidate generated (archive surface)' },
    { at: '2026-05-15', type: 'AMENDMENT', detail: 'MAA-RSF1 authority selection enabled' },
    { at: '2026-05-14', type: 'LOCK', detail: 'Pair review scheduled — not yet locked' },
  ];

  return (
    <DesignProductionChildShell title="HISTORY" subtitle="Durable design workspace events (founder-readable).">
      <ul className="tod-child__timeline" data-testid="design-history-list">
        {events.map((event) => (
          <li key={`${event.at}-${event.type}`}>
            <time>{event.at}</time>
            <strong>{event.type}</strong>
            <span>{event.detail}</span>
          </li>
        ))}
      </ul>
    </DesignProductionChildShell>
  );
}

export function DesignProductionSectionMore() {
  const { goReferenceTwin, projectSlug, goWorkspace } = useDesignProductionNavigation();
  const production = useTwinOpusDirectProduction(projectSlug);

  return (
    <DesignProductionChildShell title="MORE" subtitle="Secondary DESIGN utilities — not duplicated in top nav.">
      <ul className="tod-child__actions">
        <li>
          <button
            type="button"
            className="tod-child__action"
            onClick={() => {
              production.actions.openCreativeContext();
              goWorkspace();
            }}
          >
            PROJECT CREATIVE CONTEXT
          </button>
        </li>
        <li>
          <button type="button" className="tod-child__action" onClick={goReferenceTwin}>
            OPEN TWIN REFERENCE (QA)
          </button>
        </li>
        <li>
          <Link to={`/projects/${projectSlug}/design/opus-native`} className="tod-child__action tod-child__link">
            OPUS NATIVE DIAGNOSTIC ROUTE
          </Link>
        </li>
        <li>
          <Link to={`/projects/${projectSlug}/inspect/icons`} className="tod-child__action tod-child__link">
            NDX ICON SHEET
          </Link>
        </li>
      </ul>
    </DesignProductionChildShell>
  );
}
