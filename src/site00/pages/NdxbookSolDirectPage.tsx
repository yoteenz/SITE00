import type { ReactNode } from 'react';
import '../styles/site00-ndxbook-sol-direct.css';

const SOL = {
  hand: '/site00/twin-sol-direct/sol-hand-plate.jpg',
  form: '/site00/twin-grok-direct/tgd-form.png',
  overlay: '/site00/twin-grok-direct/tgd-overlay-001.png',
  portrait: '/site00/twin-grok-direct/tgd-portrait.png',
  blueprint: '/site00/twin-sol-direct/sol-blueprint.jpg',
  news001: '/site00/twin-sol-direct/sol-001-news.jpg',
  split001: '/site00/twin-sol-direct/sol-001-split.jpg',
} as const;

// Golden live copy per candidate card: display title lines + small lime tagline lines.
const archiveCards = [
  { version: 'V1.3', title: 'THE SIGNAL\nIS THE INDEX', copy: 'CULTURE AS EVIDENCE.\nIDEAS AS INDEX.\nNDXBOOK.', kind: 'selected', art: SOL.hand },
  { version: 'V1.2', title: 'THE SIGNAL\nIS THE INDEX', copy: 'CULTURE AS EVIDENCE.\nIDEAS AS INDEX.\nNDXBOOK.', kind: 'grid', art: SOL.blueprint },
  { version: 'V1.1', title: '', copy: 'CULTURE AS\nEVIDENCE.\nIDEAS AS INDEX.', kind: 'receipt', art: SOL.split001 },
  { version: '', title: 'THE\nSIGNAL\nIS THE\nINDEX', copy: '', kind: 'type', art: SOL.overlay },
];

const functionMap = ['F01_INDEX_SIGNAL', 'F02_ERROR_REFERENCE', 'F03_ARCHIVAL_LINK', 'F04_CONTEXT_THREAD', 'F05_SOURCE_TRACE', 'F06_VERIFICATION'];

const reviewCards = [
  { eyebrow: 'GROUNDING', title: 'INDEX SIGNAL\nMANIFEST', asset: 'receipt', art: SOL.form, foot: 'SOURCE: APP.ASSET', slot: 'F1-grounding-file' },
  { eyebrow: 'BLUEPRINT', title: 'LAYOUT + TYPE\nSYSTEM', asset: 'grid', art: SOL.blueprint, foot: 'NDXBOOK_GRID_V2', slot: 'F2-blueprint-file' },
  { eyebrow: 'OVERLAY', title: 'ANNOTATION LAYER\nON', asset: 'overlay', art: SOL.overlay, foot: 'ANNOTATION_LAYER_v1', slot: 'F3-overlay-file' },
  { eyebrow: 'ASSETS', title: 'EVIDENCE PACK\n12 ITEMS', asset: 'evidence', art: SOL.portrait, foot: 'ASSET_PACK_ENTRY001', slot: 'F4-assets-file' },
  { eyebrow: 'FUNCTION', title: 'MAPPING\n6 FUNCTIONS', asset: 'functions', art: '', foot: 'FUNCTION_MAP_v1', slot: 'F5-function-file' },
];

type MarkName =
  | 'hamburger' | 'chevron' | 'chevronUp' | 'caret' | 'dots'
  | 'check' | 'lock' | 'sliders' | 'refresh' | 'target' | 'expand'
  | 'doc' | 'file' | 'grid' | 'gridFill' | 'clock' | 'status' | 'bolt' | 'warn';

function Mark({ name, className, slot }: { name: MarkName; className?: string; slot?: string }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<MarkName, ReactNode> = {
    hamburger: <path d="M3 4.6h10M3 8h10M3 11.4h10" {...stroke} />,
    chevron: <path d="M6 3.2 11 8 6 12.8" {...stroke} />,
    chevronUp: <path d="M3.4 10 8 5.4 12.6 10" {...stroke} />,
    caret: <path d="M3.6 6.2 8 10.6 12.4 6.2" {...stroke} />,
    dots: <g fill="currentColor"><circle cx="8" cy="3.4" r="1.15" /><circle cx="8" cy="8" r="1.15" /><circle cx="8" cy="12.6" r="1.15" /></g>,
    check: <path d="M3.1 8.2 6.5 11.5 13 4.6" {...stroke} strokeWidth={1.8} />,
    lock: (
      <>
        <rect x="3.3" y="7.1" width="9.4" height="6.2" rx="1" {...stroke} />
        <path d="M5.3 7.1V5.3a2.7 2.7 0 0 1 5.4 0v1.8" {...stroke} />
      </>
    ),
    sliders: <path d="M2.6 4.2h10.8M2.6 8h10.8M2.6 11.8h10.8M6.1 2.4v3.6M10.1 6.2v3.6M7.2 10v3.6" {...stroke} />,
    refresh: (
      <>
        <path d="M12.6 8A4.7 4.7 0 1 1 11.3 4.8" {...stroke} />
        <path d="M12.6 2.7V6H9.3" {...stroke} />
      </>
    ),
    target: (
      <>
        <circle cx="8" cy="8" r="5.1" {...stroke} />
        <circle cx="8" cy="8" r="1.15" fill="currentColor" />
      </>
    ),
    expand: <path d="M6.6 3.2H3.2V6.6M9.4 3.2h3.4V6.6M3.2 9.4v3.4H6.6M12.8 9.4v3.4H9.4M3.2 3.2l3 3M12.8 3.2l-3 3M3.2 12.8l3-3M12.8 12.8l-3-3" {...stroke} />,
    doc: (
      <>
        <rect x="3.4" y="2.6" width="9.2" height="10.8" rx="0.8" {...stroke} />
        <path d="M5.5 6h5M5.5 8.2h5M5.5 10.4h3.2" {...stroke} />
      </>
    ),
    file: (
      <>
        <path d="M4 2.3h5.1L12.1 5.3v8.3H4z" {...stroke} />
        <path d="M9.1 2.3v3h3" {...stroke} />
      </>
    ),
    grid: (
      <>
        <rect x="2.5" y="2.5" width="4.4" height="4.4" rx="0.4" {...stroke} strokeWidth={1.2} />
        <rect x="9.1" y="2.5" width="4.4" height="4.4" rx="0.4" {...stroke} strokeWidth={1.2} />
        <rect x="2.5" y="9.1" width="4.4" height="4.4" rx="0.4" {...stroke} strokeWidth={1.2} />
        <rect x="9.1" y="9.1" width="4.4" height="4.4" rx="0.4" {...stroke} strokeWidth={1.2} />
      </>
    ),
    gridFill: (
      <g fill="currentColor">
        <rect x="2.1" y="2.1" width="5" height="5" rx="0.5" />
        <rect x="8.9" y="2.1" width="5" height="5" rx="0.5" />
        <rect x="2.1" y="8.9" width="5" height="5" rx="0.5" />
        <rect x="8.9" y="8.9" width="5" height="5" rx="0.5" />
      </g>
    ),
    clock: (
      <>
        <circle cx="8" cy="8" r="5.2" {...stroke} strokeWidth={1.2} />
        <path d="M8 5.3V8l2.1 1.4" {...stroke} strokeWidth={1.2} />
      </>
    ),
    status: (
      <>
        <circle cx="8" cy="8" r="5.3" {...stroke} strokeWidth={1.2} />
        <path d="M5.3 8.2 7.3 10.1 11 6.3" {...stroke} strokeWidth={1.2} />
      </>
    ),
    bolt: <path d="M9.1 2.2 4.2 8.8H7.4L6.7 13.8 11.8 7.2H8.6L9.1 2.2z" fill="currentColor" />,
    warn: <circle cx="8" cy="8" r="5.6" fill="#d1b720" />,
  };
  return (
    <span className={className ?? 'sol-icon'} aria-hidden="true" data-slot={slot}>
      <svg viewBox="0 0 16 16">{paths[name]}</svg>
    </span>
  );
}

function DeviceMark({ kind, slot }: { kind: 'mobile' | 'tablet' | 'desktop'; slot: string }) {
  if (kind === 'desktop') {
    return (
      <svg className="sol-device sol-device-desktop" viewBox="0 0 24 18" aria-hidden="true" data-slot={slot}>
        <rect x="1.6" y="1" width="20.8" height="11.6" rx="1.5" fill="currentColor" />
        <path d="M11.1 12.6v2.1H7.2v1.3h9.6v-1.3h-3.9v-2.1" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'tablet') {
    return (
      <svg className="sol-device sol-device-tablet" viewBox="0 0 16 22" aria-hidden="true" data-slot={slot}>
        <rect x="1" y="1" width="14" height="20" rx="2.1" fill="currentColor" />
        <rect x="6.3" y="18.3" width="3.4" height="1.15" rx="0.55" fill="#f4f4f1" />
      </svg>
    );
  }
  return (
    <svg className="sol-device sol-device-mobile" viewBox="0 0 12 22" aria-hidden="true" data-slot={slot}>
      <rect x="1" y="1" width="10" height="20" rx="2.2" fill="currentColor" />
      <rect x="4.3" y="18.4" width="3.4" height="1.1" rx="0.55" fill="#f4f4f1" />
    </svg>
  );
}

function CheckDot({ warn, slot }: { warn?: boolean; slot: string }) {
  if (warn) return <Mark name="warn" className="sol-status-mark" slot={slot} />;
  return (
    <span className="sol-status-mark" aria-hidden="true" data-slot={slot}>
      <svg viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6.2" fill="#62a13b" />
        <path d="M4.6 8.2 7 10.5 11.5 5.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Plate({ src, className }: { src: string; className?: string }) {
  return <img className={className} src={src} alt="" draggable={false} />;
}

function HeroArtifact() {
  return (
    <article className="sol-hero-artifact">
      <div className="sol-hero-meta"><span>ENTRY 001</span><span className="sol-hero-meta-right"><span>CULTURAL RECEIPT</span><b>001</b></span></div>
      <div className="sol-hero-copy">
        <h1>THE SIGNAL<br />IS THE INDEX</h1>
        <p>CULTURE AS EVIDENCE.<br />IDEAS AS INDEX.<br />NDXBOOK.</p>
      </div>
      <div className="sol-hero-image" aria-label="Archival hand and evidence collage">
        <Plate src={SOL.hand} />
      </div>
      <div className="sol-hero-foot">
        <span>INDEX SIGNAL:<br />PAGE 001 INDEXED</span><i><Mark name="chevron" slot="C4-hero-evidence" /></i>
        <span>ARCHIVAL EVIDENCE<br />ATTACHED</span>
        <b>EVIDENCE</b><span>+12</span>
      </div>
    </article>
  );
}

function AuthorityRail() {
  return (
    <aside className="sol-authority">
      <button className="sol-select-mobile"><Mark name="check" slot="C1-select-check" /><span>SELECT FOR MOBILE<small>SELECTED</small></span></button>
      <button>SELECT FOR DESKTOP</button>
      <section>
        <header>AUTHORITY PAIR <Mark name="chevronUp" slot="C2-pair-caret" /></header>
        <div className="sol-master-row sol-master-row-mobile">
          <small>MOBILE MASTER</small>
          <div className="sol-mini selected-mini"><span>THE SIGNAL<br />IS THE INDEX</span><Plate src={SOL.hand} /><i /></div>
          <strong>V1.3</strong>
          <em>SELECTED</em>
        </div>
        <div className="sol-master-row sol-master-row-desktop">
          <small>DESKTOP MASTER</small>
          <div className="sol-mini desktop-mini"><span>THE SIGNAL /<br />IS THE INDEX</span><Plate src={SOL.hand} /></div>
          <strong>V1.1</strong>
          <button>REPLACE</button>
        </div>
      </section>
      <button className="sol-lime">PROMOTE MOBILE</button>
      <button>PROMOTE DESKTOP</button>
      <button className="sol-black">PAIR REVIEW</button>
      <button>REVIEW AUTHORITY</button>
      <button className="sol-black sol-lock"><Mark name="lock" slot="C3-lock-pair" /> LOCK MOBILE + DESKTOP<br />AUTHORITY PAIR</button>
    </aside>
  );
}

function CandidateGallery() {
  return (
    <section className="sol-panel sol-gallery">
      <header><span>CONCEPT CANDIDATE GALLERY</span><span>COMPARE CONCEPTS <Mark name="sliders" slot="D1-compare-sliders" /></span></header>
      <div className="sol-candidate-row">
        {archiveCards.map((card, index) => (
          <article className={`sol-candidate ${card.kind}`} key={`${card.kind}-${index}`}>
            <Plate className="sol-candidate-art" src={card.art} />
            {card.version ? <small>{card.version}</small> : null}
            {card.title ? <strong>{card.title.split('\n').map((line) => <span key={line}>{line}</span>)}</strong> : null}
            {card.copy ? <p className="sol-candidate-copy">{card.copy.split('\n').map((line) => <span key={line}>{line}</span>)}</p> : null}
            {card.kind === 'selected' ? <b><Mark name="check" slot="C5-card-check" /></b> : null}
          </article>
        ))}
        <button className="sol-gallery-next"><Mark name="chevron" slot="D2-gallery-next" /></button>
      </div>
      <div className="sol-gallery-actions">
        <button><Mark name="sliders" slot="E1-refine" /> REFINE CONCEPT</button>
        <button><Mark name="refresh" slot="E2-regenerate" /> REGENERATE CONCEPT</button>
        <button><Mark name="target" slot="E3-inspect" /> INSPECT CANDIDATE</button>
        <button><Mark name="expand" slot="E4-fullscreen" /> VIEW FULLSCREEN</button>
      </div>
    </section>
  );
}

function StructuredReview() {
  return (
    <section className="sol-panel sol-structured">
      <header>STRUCTURED OUTPUT REVIEW</header>
      <div className="sol-review-grid">
        {reviewCards.map((card) => (
          <article key={card.eyebrow}>
            <small>{card.eyebrow}</small>
            <strong>{card.title.split('\n').map((line) => <span key={line}>{line}</span>)}</strong>
            <div className={`sol-review-art ${card.asset}`}>
              {card.art ? <Plate src={card.art} /> : null}
              {card.asset === 'functions' ? functionMap.map((fn) => <span key={fn}>{fn}</span>) : null}
            </div>
            <footer><span>{card.foot}</span><Mark name="file" slot={card.slot} /></footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function Readiness() {
  return (
    <section className="sol-panel sol-readiness">
      <header>PIPELINE / READINESS</header>
      <div className="sol-ready-grid">
        <div className="sol-score"><small>READINESS</small><div data-slot="G1-ready-ring"><b>82%</b></div><span>READY</span><footer>COMPILES: READY <i data-slot="G2-compiles-dot" /></footer></div>
        <div className="sol-checks"><small>CHECKS</small>{[
          ['LAYOUT SYSTEM', 'G3-check-layout', false],
          ['TYPE SCALE', 'G4-check-type', false],
          ['ASSET LINKS', 'G5-check-assets', false],
          ['FUNCTION MAP', 'G6-check-function', true],
          ['ACCESSIBILITY', 'G7-check-a11y', false],
        ].map(([x, slot, warn]) => <p key={String(x)}>{x}<CheckDot slot={String(slot)} warn={warn === true} /></p>)}<button>VIEW DETAILS</button></div>
        <div className="sol-status"><small>STATUS</small>
          <p><span>APPROVED ELEMENTS</span><span className="sol-status-val"><CheckDot slot="G8-status-approved" /><b>18</b></span></p>
          <p><span>PENDING DECISIONS</span><span className="sol-status-val"><CheckDot slot="G9-status-pending" /><b>2</b></span></p>
          <p><span>BLOCKERS</span><span className="sol-status-val"><CheckDot slot="G10-status-blockers" /><b>0</b></span></p>
          <p><span>WARNINGS</span><span className="sol-status-val"><CheckDot slot="G11-status-warnings" warn /><b>1</b></span></p>
        </div>
        <div className="sol-next"><small>NEXT ACTION</small><strong>PROMOTE MOBILE MASTER<br />TO AUTHORITY PAIR</strong><button className="sol-lime">PRIMARY ACTION</button><button>MOVE TO BUILD WHEN READY</button><button>VIEW TECHNICAL DETAILS</button></div>
      </div>
    </section>
  );
}

function DetailDock() {
  return (
    <>
      <nav className="sol-detail-tabs" data-slot="H1-tab-grabber"><span className="active">CONCEPT DATA</span><span>VERSION HISTORY</span><span>CHANGE HISTORY</span><span>MASTER UPDATE</span><span>AMENDMENT</span></nav>
      <section className="sol-detail">
        <div className="sol-detail-thumb"><span>THE SIGNAL<br />IS THE INDEX</span><Plate src={SOL.hand} /></div>
        <dl><dt>CONCEPT ID:</dt><dd>ENTRY001_V1.3</dd><dt>CREATED:</dt><dd>2024-05-18</dd><dt>UPDATED:</dt><dd>2024-05-18</dd><dt>AUTHOR:</dt><dd>DESIGN SYSTEM</dd><dt>ARTIFACT TYPE:</dt><dd>ENTRY COVER</dd><dt>SOURCE:</dt><dd>ENTRY001-CAMPAIGN-ARCHIVE</dd></dl>
        <div className="sol-amend">
          <strong>NAA-RSF1-AUTHORITY-SELECTION-V1 <mark>ACTIVE</mark></strong>
          <dl><dt>AMENDMENT TYPE:</dt><dd>AUTHORITY SELECTION</dd><dt>EFFECTIVE:</dt><dd>2024-05-15</dd><dt>SCOPE:</dt><dd>DESIGN WORKSPACE</dd><dt>AUTHORITY WORKFLOW:</dt><dd>ENABLED</dd></dl>
        </div>
        <button>VIEW AMENDMENT</button>
      </section>
    </>
  );
}

export function NdxbookSolDirectPage() {
  return (
    <main className="sol-direct" data-testid="ndxbook-sol-direct">
      <header className="sol-hostbar"><b>SITE 00</b><Mark name="chevron" slot="A2-crumb-1" /><b>PROJECT: NDXBOOK</b><Mark name="chevron" slot="A3-crumb-2" /><b className="red">DESIGN</b><span>COMPILER: <b>READY</b><i data-slot="A4-compiler-dot" /></span><Mark name="dots" slot="A5-overflow-dots" /></header>
      <nav className="sol-primary-nav"><button><Mark name="hamburger" slot="A1-hamburger" /></button>{['REFERENCES','ASSETS','PAGES','SKINS','HISTORY'].map((x)=><button key={x}>{x}</button>)}<button>MORE <Mark name="caret" slot="A6-more-caret" /></button></nav>
      <div className="sol-context"><b>NDXBOOK</b><span>CULTURAL_INTELLIGENCE_EDITORIAL</span><em>PROJECT CREATIVE CONTEXT <i data-slot="A7-context-dot" /></em></div>
      <section className="sol-target-band">
        <div><small>TARGET</small><strong>ENTRY 001<br />ENTRY COVER<br />HOMEPAGE HERO</strong></div>
        <div className="sol-viewport"><small>VIEWPORT</small><button className="active" data-slot="B4-mobile-underline"><DeviceMark kind="mobile" slot="B1-mobile" />MOBILE</button><button><DeviceMark kind="tablet" slot="B2-tablet" />TABLET</button><button><DeviceMark kind="desktop" slot="B3-desktop" />DESKTOP</button></div>
        <div><small>STAGE</small><strong>REVIEW_ACTIVE_CONCEPT</strong><small>AUTHORITY</small><strong>PAIR: UNLOCKED · V1.3 <Mark name="lock" slot="B5-authority-lock" /></strong></div>
      </section>
      <section className="sol-main-stage"><HeroArtifact /><AuthorityRail /></section>
      <CandidateGallery />
      <StructuredReview />
      <Readiness />
      <DetailDock />
      <nav className="sol-bottom-nav">
        <button className="active"><Mark name="gridFill" slot="I1-workspace" />WORKSPACE</button><button><Mark name="clock" slot="I2-design-history" />DESIGN HISTORY</button><button><Mark name="file" slot="I3-feature-change" />FEATURE CHANGE<br />HISTORY</button><button><Mark name="status" slot="I4-master-amendment" />MASTER AMENDMENT<br />STATUS</button><button><Mark name="bolt" slot="I5-contextual-next" />CONTEXTUAL NEXT<br />ACTION</button>
      </nav>
    </main>
  );
}

export default NdxbookSolDirectPage;
