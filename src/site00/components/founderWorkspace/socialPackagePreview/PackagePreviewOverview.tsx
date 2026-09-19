/**
 * B5.8 — Mobile package overview launchpad.
 */

import { Link } from 'react-router-dom';
import type { SocialPackagePreviewModel, SocialPreviewPaths } from './types.js';
import { FormatPreviewNavigation } from './FormatPreviewNavigation.js';
import { PackageFlowStrip } from './PackageFlowStrip.js';
import { PackageProgressSummary } from './PackageProgressSummary.js';
import { RecentPackageActivity } from './RecentPackageActivity.js';
import type { SocialFormatFamily } from './types.js';

type Props = {
  model: SocialPackagePreviewModel;
  paths: SocialPreviewPaths;
  onSelectFormat: (family: SocialFormatFamily) => void;
};

export function PackagePreviewOverview({ model, paths, onSelectFormat }: Props) {
  return (
    <div className="site00-spp-overview">
      <header className="site00-spp-overview__head">
        <p className="site00-spp-overview__kicker">SOCIAL PACKAGE PREVIEW</p>
        <h1>
          ENTRY {model.entryNumber} / {model.entryTitle}
        </h1>
        <p className="site00-spp-overview__subject">
          {model.entrySubject} / {model.entrySubtitle}
        </p>
        {model.brandTagline && (
          <p className="site00-spp-overview__tagline site00-fws-hub-handwritten">{model.brandTagline}</p>
        )}
        <span className={`site00-spp-chip site00-spp-chip--progress`}>{model.packageStatusLabel}</span>
      </header>

      <PackageProgressSummary
        completeCount={model.completeCount}
        totalCount={model.totalCount}
        formats={model.formats}
        compact
      />

      <section className="site00-spp-overview__formats">
        <h2>FORMATS</h2>
        <FormatPreviewNavigation
          formats={model.formats}
          active={model.formats[0]?.formatFamily ?? 'REEL'}
          onSelect={onSelectFormat}
          variant="tiles"
        />
      </section>

      <section className="site00-spp-overview__flow">
        <h2>PACKAGE FLOW</h2>
        <PackageFlowStrip steps={model.flowSteps} compact />
      </section>

      <RecentPackageActivity events={model.recentActivity} />

      <div className="site00-spp-overview__actions">
        <Link to={paths.packagePath} className="site00-spp-btn site00-spp-btn--ghost">
          ← BACK TO PACKAGE
        </Link>
        <button
          type="button"
          className="site00-spp-btn site00-spp-btn--primary"
          onClick={() => onSelectFormat('REEL')}
        >
          START REVIEW →
        </button>
      </div>
    </div>
  );
}
