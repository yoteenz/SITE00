/**
 * B5.8 — Social package preview workspace (desktop three-zone + mobile overview/format).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Entry001PackageNav } from '../entry001CampaignPackage/Entry001PackageNav.js';
import { AssetSequenceRail } from './AssetSequenceRail.js';
import { CopyReviewInspector } from './CopyReviewInspector.js';
import { FormatPreviewNavigation } from './FormatPreviewNavigation.js';
import { FormatPreviewStage } from './FormatPreviewStage.js';
import { PackagePreviewOverview } from './PackagePreviewOverview.js';
import { PackageProgressSummary } from './PackageProgressSummary.js';
import { nextFormatFamily } from './buildSocialPreviewModel.js';
import type { SocialFormatFamily, SocialPackagePreviewModel, SocialPreviewPaths } from './types.js';

type Props = {
  projectSlug: string;
  model: SocialPackagePreviewModel;
  paths: SocialPreviewPaths;
};

function useIsMobilePreview(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 959px)').matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 959px)');
    const fn = () => setMobile(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return mobile;
}

export function SocialPackagePreviewWorkspace({ projectSlug, model, paths }: Props) {
  const navigate = useNavigate();
  const isMobile = useIsMobilePreview();
  const [mobileView, setMobileView] = useState<'overview' | 'format'>(isMobile ? 'overview' : 'format');
  const [activeFormat, setActiveFormat] = useState<SocialFormatFamily>('CAROUSEL');
  const [slideIndex, setSlideIndex] = useState(0);

  const active = useMemo(
    () => model.formats.find((f) => f.formatFamily === activeFormat) ?? model.formats[0]!,
    [model.formats, activeFormat],
  );

  const sequenceLength = useMemo(() => {
    if (active.formatFamily === 'CAROUSEL' || active.formatFamily === 'STORY') {
      return active.slots.length;
    }
    if (active.formatFamily === 'REEL') {
      return active.slots.filter((s) => s.slotId !== 'final-reel' || !s.placeholder).length;
    }
    return active.slots.length;
  }, [active]);

  useEffect(() => {
    setSlideIndex(0);
  }, [activeFormat]);

  const onPrev = useCallback(() => setSlideIndex((i) => Math.max(0, i - 1)), []);
  const onNext = useCallback(
    () => setSlideIndex((i) => Math.min(Math.max(sequenceLength - 1, 0), i + 1)),
    [sequenceLength],
  );

  const selectFormat = useCallback((family: SocialFormatFamily) => {
    setActiveFormat(family);
    if (isMobile) setMobileView('format');
  }, [isMobile]);

  const editHref = paths.formatPath(activeFormat);
  const sequenceEditHref =
    activeFormat === 'CAROUSEL'
      ? paths.carouselSequencePath
      : activeFormat === 'STORY'
        ? paths.storySequencePath
        : editHref;

  const nextFormat = nextFormatFamily(activeFormat);

  if (isMobile && mobileView === 'overview') {
    return (
      <div className="site00-spp site00-spp--mobile">
        <Entry001PackageNav projectSlug={projectSlug} active="preview" />
        <PackagePreviewOverview model={model} paths={paths} onSelectFormat={selectFormat} />
      </div>
    );
  }

  return (
    <div className={`site00-spp${isMobile ? ' site00-spp--mobile-format' : ' site00-spp--desktop'}`}>
      <Entry001PackageNav projectSlug={projectSlug} active="preview" />

      {isMobile && (
        <header className="site00-spp-mobile-head">
          <button type="button" className="site00-spp-mobile-head__back" onClick={() => setMobileView('overview')}>
            ←
          </button>
          <div>
            <p>ENTRY {model.entryNumber}</p>
            <span>SOCIAL PACKAGE PREVIEW</span>
          </div>
        </header>
      )}

      {!isMobile && (
        <header className="site00-spp-desktop-head">
          <nav className="site00-spp-desktop-head__crumb" aria-label="Breadcrumb">
            <Link to={paths.campaignBoardPath}>CAMPAIGNS</Link>
            <span aria-hidden>›</span>
            <Link to={paths.packagePath}>ENTRY {model.entryNumber}</Link>
            <span aria-hidden>›</span>
            <span>SOCIAL PACKAGE PREVIEW</span>
          </nav>
          <div className="site00-spp-desktop-head__actions">
            <span className="site00-spp-chip site00-spp-chip--progress">{model.packageStatusLabel}</span>
            <Link to={paths.packagePath} className="site00-spp-btn site00-spp-btn--primary">
              EDIT PACKAGE →
            </Link>
          </div>
          <div className="site00-spp-desktop-head__title">
            <h1>
              ENTRY {model.entryNumber} / SOCIAL PACKAGE PREVIEW
            </h1>
            <p>
              {model.entryTitle} / {model.entrySubject} / {model.entrySubtitle}
            </p>
            {model.brandTagline && (
              <p className="site00-spp-desktop-head__tagline site00-fws-hub-handwritten">{model.brandTagline}</p>
            )}
          </div>
          <PackageProgressSummary
            completeCount={model.completeCount}
            totalCount={model.totalCount}
            formats={model.formats}
          />
        </header>
      )}

      <FormatPreviewNavigation
        formats={model.formats}
        active={activeFormat}
        onSelect={selectFormat}
        variant={isMobile ? 'rail' : 'tabs'}
      />

      {!isMobile ? (
        <div className="site00-spp-stage">
          <AssetSequenceRail
            format={active}
            selectedIndex={slideIndex}
            onSelect={setSlideIndex}
            onAddAsset={() => {
              navigate(sequenceEditHref);
            }}
          />
          <main className="site00-spp-stage__center">
            <FormatPreviewStage
              format={active}
              accountHandle={model.accountHandle}
              displayName={model.accountDisplayName}
              selectedIndex={slideIndex}
              onSelectIndex={setSlideIndex}
              onPrev={onPrev}
              onNext={onNext}
              editHref={editHref}
              variant="desktop"
            />
          </main>
          <CopyReviewInspector format={active} selectedSlotIndex={slideIndex} editCopyHref={editHref} />
        </div>
      ) : (
        <div className="site00-spp-mobile-stage">
          <FormatPreviewStage
            format={active}
            accountHandle={model.accountHandle}
            displayName={model.accountDisplayName}
            selectedIndex={slideIndex}
            onSelectIndex={setSlideIndex}
            onPrev={onPrev}
            onNext={onNext}
            editHref={editHref}
            variant="mobile"
          />
          {(active.caption || active.copyText) && (
            <section className="site00-spp-mobile-copy">
              <h3>POST COPY</h3>
              <p>{active.caption ?? active.copyText}</p>
              <Link to={editHref}>View / Edit copy →</Link>
            </section>
          )}
        </div>
      )}

      <footer className="site00-spp-footer">
        <Link to={paths.packagePath} className="site00-spp-btn site00-spp-btn--ghost">
          ← BACK TO PACKAGE
        </Link>
        {nextFormat && (
          <button type="button" className="site00-spp-btn site00-spp-btn--primary" onClick={() => selectFormat(nextFormat)}>
            NEXT FORMAT: {model.formats.find((f) => f.formatFamily === nextFormat)?.label ?? nextFormat} →
          </button>
        )}
      </footer>
    </div>
  );
}
