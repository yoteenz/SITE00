/**
 * P0.VR.REPLICATION.4 — Zero-invention NDXBOOK overview twin from forensic blueprint objects 01–69.
 */

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import { TwinSite00HostBottomNav } from './TwinSite00HostBottomNav.js';
import { BlueprintVsTwinOverlay } from './BlueprintVsTwinOverlay.js';
import { TwinAuthorityCompareStrip } from './TwinAuthorityCompareStrip.js';
import { HeroBlueprintDebugOverlay } from './HeroBlueprintDebugOverlay.js';
import { HeroInspectionToolbar, type HeroInspectionLayerFlags } from './HeroInspectionToolbar.js';
import { useHeroOutlierLiveConvergence } from './useHeroOutlierLiveConvergence.js';
import { NDXIcon } from '../../icons/ndx';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import '../../styles/site00-forensic-blueprint-twin.css';
import '../../styles/site00-hero-blueprint-debug.css';
import '../../styles/site00-hero-inspection-toolbar.css';

type Props = {
  projectSlug: string;
  session: ReconstructionTwinSession;
};

const ACTIVITY_ROWS = [
  { id: '57', time: '2H AGO', title: 'CREATIVE DIRECTION TERRITORIES GENERATED', sub: 'THREE EDITORIAL ROUTES READY', actor: 'YOU' },
  { id: '58', time: '6H AGO', title: 'CULTURE SIGNAL CLUSTER UPDATED', sub: 'PATTERN MATCH · ARCHIVE', actor: 'SYSTEM' },
];

function ForensicText({
  objectId,
  heroObjectId,
  className,
  children,
  style,
}: {
  objectId: string;
  heroObjectId?: string;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      className={className}
      data-forensic-object-id={objectId}
      data-hero-object={heroObjectId}
      style={style}
    >
      {children}
    </span>
  );
}

export function ForensicBlueprintNdxOverviewTwin({ session }: Props) {
  const { liveCapture, outlierCssPatch } = useHeroOutlierLiveConvergence(session);
  const cssPatch = { ...(session.twinForensicCssPatch ?? {}), ...outlierCssPatch } as CSSProperties;
  const heroAsset =
    session.blueprintAssetBindings?.find((a) => a.objectId === '22')?.sourceAsset ??
    session.designAuthorityAssetRef ??
    null;
  const heroH06Url = session.heroSafeRegionCropUrls?.H06 ?? null;
  const heroH12Url = session.heroSafeRegionCropUrls?.H12 ?? null;
  const [inspLayers, setInspLayers] = useState<HeroInspectionLayerFlags>({
    authorityBoxes: true,
    renderedBoxes: true,
    deltas: true,
    collisions: true,
    labels: true,
    cropSources: false,
    outliersOnly: false,
  });

  useEffect(() => {
    if (window.location.hash !== '#hero-inspection') return;
    const el = document.getElementById('hero-inspection');
    el?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, []);

  return (
    <div
      className="site00-fb"
      data-forensic-blueprint-twin="ndx-overview-mobile"
      data-twin-mount-root="forensic-blueprint-overview"
      data-4-build={session.forensicBlueprintReport?.buildRef ?? null}
      data-4r1-build={session.authorityTighteningReport?.buildRef ?? null}
      data-4r2-build={session.heroSurgicalLockReport?.buildRef ?? null}
      data-4r3-build={session.heroGeometryConvergenceReport?.buildRef ?? null}
      data-4r3r1-build={session.heroDomRecoveryReport?.buildRef ?? null}
      data-4r4-build={session.heroOutlierConvergenceReport?.buildRef ?? null}
      style={cssPatch}
    >
      <HeroInspectionToolbar
        layers={inspLayers}
        onLayersChange={setInspLayers}
        measuredCount={liveCapture?.geometryReceiptV2?.measuredCount ?? 14}
        passCount={liveCapture?.geometryReceiptV2?.withinToleranceCount}
        outlierCount={liveCapture?.geometryReceiptV2?.outlierCount}
      />
      <TwinAuthorityCompareStrip session={session} />
      <BlueprintVsTwinOverlay session={session} />

      <header className="site00-fb__host" data-forensic-section="host-header">
        <ForensicText objectId="01" className="site00-fb__wordmark">
          SITE 00
        </ForensicText>
        <span className="site00-fb__diamond" data-forensic-object-id="02" aria-hidden="true" />
        <button type="button" className="site00-fb__menu" data-forensic-object-id="03" aria-label="Menu">
          <NDXIcon name="ellipsis" size={NDX_ICON_CONTEXT_SIZE.header} decorative />
        </button>
        <span className="site00-fb__avatar" data-forensic-object-id="04" aria-hidden="true">
          KA
        </span>
      </header>

      <div className="site00-fb__content-root" data-twin-content-root="forensic-ndx-overview">
        <section className="site00-fb__masthead" data-forensic-section="masthead">
          <ForensicText objectId="05" className="site00-fb__crumb">
            PROJECTS › NDXBOOK
          </ForensicText>
          <ForensicText objectId="06" className="site00-fb__title">
            NDXBOOK
          </ForensicText>
          <ForensicText objectId="07" className="site00-fb__subtitle">
            INDEX BOOK · FOUNDER PILOT
          </ForensicText>
          <ForensicText objectId="08" className="site00-fb__badge">
            FOUNDER OWNED
          </ForensicText>
          <div className="site00-fb__masthead-right">
            <ForensicText objectId="09" className="site00-fb__colophon">
              CULTURE
              <br />
              INTELLIGENCE
              <br />
              ARCHIVE
              <br />
              <u>IN PROGRESS</u>
            </ForensicText>
            <ForensicText objectId="10" className="site00-fb__colophon site00-fb__colophon--muted">
              IDEAS
              <br />
              PEOPLE
              <br />
              PATTERNS
              <br />
              POWER
            </ForensicText>
          </div>
        </section>

        <nav className="site00-fb__section-nav" data-forensic-section="section-nav" aria-label="Module navigation">
          {['OVERVIEW', 'IDENTITY', 'EVOLVE', 'PRODUCTION', 'REVIEWS', 'LIBRARY'].map((label, i) => (
            <span
              key={label}
              className={`site00-fb__tab${i === 0 ? ' site00-fb__tab--active' : ''}`}
              data-forensic-object-id={String(11 + i).padStart(2, '0')}
            >
              {label}
            </span>
          ))}
        </nav>

        <section
          id="hero-inspection"
          className="site00-fb__hero site00-fb__hero--surgical"
          data-forensic-section="hero"
          data-hero-object="H14"
        >
          <HeroBlueprintDebugOverlay session={session} layers={inspLayers} liveCapture={liveCapture} />

          <div className="site00-fb__hero-left-scrim" aria-hidden="true" />

          <div
            className="site00-fb__hero-h06"
            data-hero-object="H06"
            data-forensic-object-id="22"
            aria-hidden="true"
          >
            {heroH06Url ? (
              <img className="site00-fb__hero-h06-img" src={heroH06Url} alt="" decoding="async" />
            ) : heroAsset ? (
              <div className="site00-fb__hero-h06-crop" style={{ backgroundImage: `url(${heroAsset})` }} />
            ) : null}
          </div>

          <div className="site00-fb__hero-h07-mask" data-hero-object="H07" aria-hidden="true" title="Center stack baked in H06 crop only" />

          <div className="site00-fb__hero-h12" data-hero-object="H12" data-hero-asset-role="HERO_RIGHT_LOWER_MEDIA" aria-hidden="true">
            {heroH12Url ? (
              <img className="site00-fb__hero-h12-img" src={heroH12Url} alt="" decoding="async" />
            ) : heroAsset ? (
              <div
                className="site00-fb__hero-h12-crop"
                data-hero-crop-zone="hero-lower-right"
                style={{ backgroundImage: `url(${heroAsset})` }}
              />
            ) : null}
          </div>

          <div className="site00-fb__hero-h13" data-hero-object="H13" aria-hidden="true" />

          <div className="site00-fb__hero-h09" data-hero-object="H09">
            <span className="site00-fb__hero-h10" data-hero-object="H10" data-forensic-object-id="23" aria-hidden="true" />
            <ForensicText objectId="24" heroObjectId="H11" className="site00-fb__hero-h11">
              00
            </ForensicText>
          </div>

          <div className="site00-fb__hero-left" data-hero-subregion="left-editorial">
            <ForensicText objectId="17" heroObjectId="H01" className="site00-fb__hero-h01">
              ENTRY 003
            </ForensicText>
            <ForensicText objectId="18" heroObjectId="H02" className="site00-fb__hero-h02">
              CULTURE
              <br />
              THROUGH A
              <br />
              SHARPER
              <br />
              LENS.
            </ForensicText>
            <span className="site00-fb__hero-h03" data-hero-object="H03" data-forensic-object-id="20" aria-hidden="true" />
            <ForensicText objectId="19" heroObjectId="H04" className="site00-fb__hero-h04">
              IDEAS BECOME.
              <br />
              ENVIRONMENTS.
              <br />
              ENVIRONMENTS
              <br />
              CREATE OPPORTUNITY.
            </ForensicText>
            <button type="button" className="site00-fb__hero-h05" data-hero-object="H05" data-forensic-object-id="21">
              VIEW PROJECT →
            </button>
          </div>

          <div className="site00-fb__hero-h08" data-hero-object="H08" data-forensic-object-id="25" aria-hidden="true">
            NDX
          </div>
        </section>

        <section className="site00-fb__progress" data-forensic-section="progress">
          <ForensicText objectId="26" className="site00-fb__progress-label">
            PROJECT PROGRESS
          </ForensicText>
          <ForensicText objectId="27" className="site00-fb__progress-pct">
            57%
          </ForensicText>
          <div className="site00-fb__progress-track" data-forensic-object-id="29">
            <div className="site00-fb__progress-fill" data-forensic-object-id="28" />
          </div>
          <ForensicText objectId="30" className="site00-fb__phase-label">
            CURRENT PHASE
          </ForensicText>
          <ForensicText objectId="31" className="site00-fb__phase-value">
            FOUNDER REVIEW · ENTRY 003
          </ForensicText>
        </section>

        <section className="site00-fb__metrics" data-forensic-section="metrics">
          <div className="site00-fb__metric">
            <span data-forensic-object-id="32" className="site00-fb__metric-icon" aria-hidden="true" />
            <ForensicText objectId="33" className="site00-fb__metric-num">
              03
            </ForensicText>
            <ForensicText objectId="34" className="site00-fb__metric-title">
              CREATIVE PRODUCTION
            </ForensicText>
            <ForensicText objectId="35" className="site00-fb__metric-status site00-fb__metric-status--green">
              IN PRODUCTION
            </ForensicText>
          </div>
          <div className="site00-fb__metric">
            <span data-forensic-object-id="36" className="site00-fb__metric-icon" aria-hidden="true" />
            <ForensicText objectId="37" className="site00-fb__metric-num">
              01
            </ForensicText>
            <ForensicText objectId="38" className="site00-fb__metric-title">
              FOUNDER REVIEW
            </ForensicText>
            <ForensicText objectId="39" className="site00-fb__metric-status site00-fb__metric-status--red">
              ACTION NEEDED
            </ForensicText>
          </div>
          <div className="site00-fb__metric">
            <span data-forensic-object-id="40" className="site00-fb__metric-icon" aria-hidden="true" />
            <ForensicText objectId="41" className="site00-fb__metric-num">
              E001
            </ForensicText>
            <ForensicText objectId="42" className="site00-fb__metric-title">
              PACKAGE READINESS
            </ForensicText>
            <ForensicText objectId="43" className="site00-fb__metric-status site00-fb__metric-status--blue">
              ASSEMBLY
            </ForensicText>
          </div>
          <div className="site00-fb__metric">
            <span data-forensic-object-id="44" className="site00-fb__metric-icon" aria-hidden="true" />
            <ForensicText objectId="45" className="site00-fb__metric-num site00-fb__metric-num--compact">
              CONNECTED
            </ForensicText>
            <span className="site00-fb__metric-title site00-fb__metric-title--metric4">TECHNICAL HEALTH</span>
            <ForensicText objectId="46" className="site00-fb__metric-status site00-fb__metric-status--green">
              PASSING
            </ForensicText>
          </div>
        </section>

        <section className="site00-fb__focus" data-forensic-section="focus-milestone">
          <div className="site00-fb__focus-image" data-forensic-object-id="47" aria-hidden="true" />
          <ForensicText objectId="48" className="site00-fb__focus-label">
            CURRENT FOCUS
          </ForensicText>
          <ForensicText objectId="49" className="site00-fb__focus-title">
            REVIEW ENTRY 003
          </ForensicText>
          <ForensicText objectId="50" className="site00-fb__focus-body">
            FINALIZE EDITORIAL PLANS AND ALIGN CULTURE SIGNALS BEFORE CANON LOCK.
          </ForensicText>
          <span data-forensic-object-id="51" className="site00-fb__focus-arrow" aria-hidden="true">
            →
          </span>
          <ForensicText objectId="52" className="site00-fb__milestone-label">
            NEXT MILESTONE
          </ForensicText>
          <span data-forensic-object-id="53" className="site00-fb__milestone-cal" aria-hidden="true" />
          <ForensicText objectId="54" className="site00-fb__milestone-title">
            ENTRY 003 CANON APPROVAL · IN 12 DAYS · OCT 20, 2026
          </ForensicText>
        </section>

        <section className="site00-fb__activity" data-forensic-section="activity">
          <ForensicText objectId="55" className="site00-fb__activity-head">
            RECENT ACTIVITY
          </ForensicText>
          <ForensicText objectId="56" className="site00-fb__activity-all">
            VIEW ALL →
          </ForensicText>
          <ul className="site00-fb__activity-list">
            {ACTIVITY_ROWS.map((row) => (
              <li key={row.id} data-forensic-object-id={row.id}>
                <span className="site00-fb__activity-dot site00-fb__activity-dot--live" aria-hidden="true" />
                <span className="site00-fb__activity-time">{row.time}</span>
                <div className="site00-fb__activity-copy">
                  <strong>{row.title}</strong>
                  <span>{row.sub}</span>
                </div>
                <span className="site00-fb__activity-actor">{row.actor}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="site00-fb__host-nav-wrap" data-forensic-section="bottom-host-nav">
        <TwinSite00HostBottomNav />
      </div>
    </div>
  );
}
