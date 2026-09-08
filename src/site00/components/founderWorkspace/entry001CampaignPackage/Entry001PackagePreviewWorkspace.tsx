/**
 * B5.5 — Entry 001 package preview page (all formats).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Entry001FormatFamily, Entry001PackagePreviewComposition } from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { Entry001FormatPreviewWidget } from './Entry001FormatPreviewWidgets.js';
import { Entry001PackageNav } from './Entry001PackageNav.js';
import { site00ProjectCampaignBoardEntryPath } from '../../../config/routes.js';

type Props = {
  projectSlug: string;
  composition: Entry001PackagePreviewComposition;
};

function PackageMapNode({
  node,
  depth = 0,
}: {
  node: Entry001PackagePreviewComposition['packageMap'][0];
  depth?: number;
}) {
  return (
    <div className="site00-e001-preview-page__map-node" style={{ marginLeft: depth * 12 }}>
      <span className={`site00-e001-preview-page__map-label site00-e001-preview-page__map-label--${node.status.toLowerCase()}`}>
        {node.label}
      </span>
      {node.children.map((child) => (
        <PackageMapNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function Entry001PackagePreviewWorkspace({ projectSlug, composition }: Props) {
  const [selectedFormat, setSelectedFormat] = useState<Entry001FormatFamily>('REEL');
  const selected = composition.formats.find((f) => f.formatFamily === selectedFormat) ?? composition.formats[0];
  const packagePath = site00ProjectCampaignBoardEntryPath(projectSlug, '001');

  return (
    <div className="site00-e001-preview-page">
      <Entry001PackageNav projectSlug={projectSlug} active="preview" />

      <header className="site00-e001-preview-page__head">
        <Link to={packagePath} className="site00-e001-package__breadcrumb-link">
          ENTRY 001
        </Link>
        <h1>SOCIAL PACKAGE PREVIEW</h1>
        <p className="site00-e001-preview-page__readiness">
          PREVIEW — <strong>{composition.previewReadiness}</strong> · CAMPAIGN BOARD —{' '}
          <strong>{composition.campaignBoardEligibility ? 'ELIGIBLE' : 'LOCKED'}</strong>
        </p>
      </header>

      <section className="site00-e001-preview-page__map">
        <h2>PACKAGE MAP</h2>
        <div className="site00-e001-preview-page__map-tree">
          {composition.packageMap.map((node) => (
            <PackageMapNode key={node.id} node={node} />
          ))}
        </div>
      </section>

      <div className="site00-e001-preview-page__layout">
        <nav className="site00-e001-preview-page__nav" aria-label="Format preview">
          {composition.formats.map((f) => (
            <button
              key={f.formatFamily}
              type="button"
              className={selectedFormat === f.formatFamily ? 'is-active' : undefined}
              onClick={() => setSelectedFormat(f.formatFamily)}
            >
              {f.label}
              <span>{f.status.replace(/_/g, ' ')}</span>
            </button>
          ))}
        </nav>

        <div className="site00-e001-preview-page__stage">
          {selected && <Entry001FormatPreviewWidget preview={selected} />}
        </div>

        <aside className="site00-e001-preview-page__inspector">
          <h2>STATUS</h2>
          {selected && (
            <dl>
              <div>
                <dt>FORMAT</dt>
                <dd>{selected.label}</dd>
              </div>
              <div>
                <dt>STATUS</dt>
                <dd>{selected.status.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt>SLOTS</dt>
                <dd>{selected.slots.length}</dd>
              </div>
            </dl>
          )}
          <h3>ALL FORMATS</h3>
          <ul className="site00-e001-preview-page__stack">
            {composition.formats.map((f) => (
              <li key={f.formatFamily}>
                <span>{f.label}</span>
                <Entry001FormatPreviewWidget preview={f} compact />
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
