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

const archiveCards = [
  { version: 'V1.3', title: 'THE SIGNAL\nIS THE INDEX', kind: 'selected', art: SOL.hand },
  { version: 'V1.2', title: 'THE SIGNAL\nIS THE INDEX', kind: 'grid', art: SOL.blueprint },
  { version: 'V1.1', title: 'CULTURE HAS\nA PAPER TRAIL.', kind: 'receipt', art: SOL.split001 },
  { version: '', title: 'THE\nSIGNAL\nIS IN THE\nINDEX', kind: 'type', art: SOL.overlay },
];

const reviewCards = [
  { eyebrow: 'GROUNDING', title: 'INDEX SIGNAL\nMANIFEST', asset: 'receipt', art: SOL.form, foot: 'SOURCE: APP.ASSET' },
  { eyebrow: 'BLUEPRINT', title: 'LAYOUT + TYPE\nSYSTEM', asset: 'grid', art: SOL.blueprint, foot: 'NDXBOOK_GRID_V2' },
  { eyebrow: 'OVERLAY', title: 'ANNOTATION LAYER\nON', asset: 'overlay', art: SOL.overlay, foot: 'ANNOTATION_LAYER_V1' },
  { eyebrow: 'ASSETS', title: 'EVIDENCE PACK\n12 ITEMS', asset: 'evidence', art: SOL.portrait, foot: 'ASSET_PACK_ENTRY001' },
  { eyebrow: 'FUNCTION', title: 'MAPPING\n6 FUNCTIONS', asset: 'functions', art: '', foot: 'FUNCTION_MAP_V1' },
];

type MarkName =
  | 'hamburger' | 'chevron' | 'chevronUp' | 'caret' | 'dots'
  | 'check' | 'lock' | 'sliders' | 'refresh' | 'target' | 'expand'
  | 'doc' | 'grid' | 'clock' | 'status' | 'bolt' | 'warn';

function Mark({ name, className }: { name: MarkName; className?: string }) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
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
    grid: (
      <>
        <rect x="2.5" y="2.5" width="4.4" height="4.4" rx="0.4" {...stroke} strokeWidth={1.2} />
        <rect x="9.1" y="2.5" width="4.4" height="4.4" rx="0.4" {...stroke} strokeWidth={1.2} />
        <rect x="2.5" y="9.1" width="4.4" height="4.4" rx="0.4" {...stroke} strokeWidth={1.2} />
        <rect x="9.1" y="9.1" width="4.4" height="4.4" rx="0.4" {...stroke} strokeWidth={1.2} />
      </>
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
    bolt: <path d="M9.1 2.2 4.2 8.8H7.4L6.7 13.8 11.8 7.2H8.6L9.1 2.2z" {...stroke} strokeWidth={1.2} />,
    warn: <circle cx="8" cy="8" r="5.6" fill="#d1b720" />,
  };
  return (
    <span className={className ?? 'sol-icon'} aria-hidden="true">
      <svg viewBox="0 0 16 16">{paths[name]}</svg>
    </span>
  );
}

function DeviceMark({ kind }: { kind: 'mobile' | 'tablet' | 'desktop' }) {
  if (kind === 'desktop') {
    return (
      <svg className="sol-device sol-device-desktop" viewBox="0 0 24 18" aria-hidden="true">
        <rect x="1.6" y="1" width="20.8" height="11.6" rx="1.5" fill="currentColor" />
        <path d="M11.1 12.6v2.1H7.2v1.3h9.6v-1.3h-3.9v-2.1" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'tablet') {
    return (
      <svg className="sol-device sol-device-tablet" viewBox="0 0 16 22" aria-hidden="true">
        <rect x="1" y="1" width="14" height="20" rx="2.1" fill="currentColor" />
        <rect x="6.3" y="18.3" width="3.4" height="1.15" rx="0.55" fill="#f4f4f1" />
      </svg>
    );
  }
  return (
    <svg className="sol-device sol-device-mobile" viewBox="0 0 12 22" aria-hidden="true">
      <rect x="1" y="1" width="10" height="20" rx="2.2" fill="currentColor" />
      <rect x="4.3" y="18.4" width="3.4" height="1.1" rx="0.55" fill="#f4f4f1" />
    </svg>
  );
}

function CheckDot({ warn }: { warn?: boolean }) {
  if (warn) return <Mark name="warn" className="sol-status-mark" />;
  return (
    <span className="sol-status-mark" aria-hidden="true">
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
      <div className="sol-hero-meta"><span>ENTRY 001</span><span>CULTURAL RECEIPT</span><span>001</span></div>
      <div className="sol-hero-copy">
        <h1>THE SIGNAL<br />IS THE INDEX</h1>
        <p>CULTURE AS EVIDENCE.<br />IDEAS AS INDEX.<br />NDXBOOK.</p>
      </div>
      <div className="sol-hero-image" aria-label="Archival hand and evidence collage">
        <Plate src={SOL.hand} />
      </div>
      <div className="sol-hero-foot">
        <span>INDEX SIGNAL:<br />PAGE 001 INDEXED</span><i><Mark name="chevron" /></i>
        <span>ARCHIVAL EVIDENCE<br />ATTACHED</span>
        <b>EVIDENCE</b><span>+12</span>
      </div>
    </article>
  );
}

function AuthorityRail() {
  return (
    <aside className="sol-authority">
      <button className="sol-select-mobile"><Mark name="check" /><span>SELECT FOR MOBILE<small>SELECTED</small></span></button>
      <button>SELECT FOR DESKTOP</button>
      <section>
        <header>AUTHORITY PAIR <Mark name="chevronUp" /></header>
        <div className="sol-master-row">
          <div><small>MOBILE MASTER</small><strong>V1.3</strong></div>
          <div className="sol-mini selected-mini"><span>THE SIGNAL<br />IS THE INDEX</span><Plate src={SOL.hand} /><i /></div>
          <em>SELECTED</em>
        </div>
        <div className="sol-master-row">
          <div><small>DESKTOP MASTER</small><strong>V1.1</strong></div>
          <div className="sol-mini desktop-mini"><span>THE SIGNAL /<br />IS THE INDEX</span><Plate src={SOL.hand} /></div>
          <button>REPLACE</button>
        </div>
      </section>
      <button className="sol-lime">PROMOTE MOBILE</button>
      <button>PROMOTE DESKTOP</button>
      <button className="sol-black">PAIR REVIEW</button>
      <button>REVIEW AUTHORITY</button>
      <button className="sol-black sol-lock"><Mark name="lock" /> LOCK MOBILE + DESKTOP<br />AUTHORITY PAIR</button>
    </aside>
  );
}

function CandidateGallery() {
  return (
    <section className="sol-panel sol-gallery">
      <header><span>CONCEPT CANDIDATE GALLERY</span><span>COMPARE CONCEPTS <Mark name="sliders" /></span></header>
      <div className="sol-candidate-row">
        {archiveCards.map((card, index) => (
          <article className={`sol-candidate ${card.kind}`} key={`${card.kind}-${index}`}>
            <Plate className="sol-candidate-art" src={card.art} />
            <small>{card.version}</small>
            <strong>{card.title.split('\n').map((line) => <span key={line}>{line}</span>)}</strong>
            {card.kind === 'selected' ? <b><Mark name="check" /></b> : null}
          </article>
        ))}
        <button className="sol-gallery-next"><Mark name="chevron" /></button>
      </div>
      <div className="sol-gallery-actions">
        <button><Mark name="sliders" /> REFINE CONCEPT</button>
        <button><Mark name="refresh" /> REGENERATE CONCEPT</button>
        <button><Mark name="target" /> INSPECT CANDIDATE</button>
        <button><Mark name="expand" /> VIEW FULLSCREEN</button>
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
              {card.asset === 'functions' ? <>F01_INDEX_SIGNAL<br />F02_ERROR_REFERENCE<br />F03_ARCHIVAL_LINK<br />F04_CONTEXT_BRIDGE<br />F05_SOURCE_TOGGLE<br />F06_VERIFICATION</> : null}
            </div>
            <footer><span>{card.foot}</span><Mark name="doc" /></footer>
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
        <div className="sol-score"><small>READINESS</small><div><b>82%</b></div><span>READY</span><footer>COMPILES: READY <i /></footer></div>
        <div className="sol-checks"><small>CHECKS</small>{['LAYOUT SYSTEM','TYPE SCALE','ASSET LINKS','POSITION MAP','ACCESSIBILITY'].map((x, i)=><p key={x}>{x}<CheckDot warn={i === 4} /></p>)}<button>VIEW DETAILS</button></div>
        <div className="sol-status"><small>STATUS</small><p>APPROVED ELEMENTS <b>18</b></p><p>PENDING DECISIONS <b>2</b></p><p>BLOCKERS <b>0</b></p><p>WARNINGS <b>1</b></p></div>
        <div className="sol-next"><small>NEXT ACTION</small><strong>PROMOTE MOBILE MASTER<br />TO AUTHORITY PAIR</strong><button className="sol-lime">PRIMARY ACTION</button><button>MOVE TO BUILD WHEN READY</button><button>VIEW TECHNICAL DETAILS</button></div>
      </div>
    </section>
  );
}

function DetailDock() {
  return (
    <>
      <nav className="sol-detail-tabs"><span className="active">CONCEPT DATA</span><span>VERSION HISTORY</span><span>CHANGE HISTORY</span><span>MASTER UPDATE</span><span>AMENDMENT</span></nav>
      <section className="sol-detail">
        <div className="sol-detail-thumb"><span>THE SIGNAL<br />IS THE INDEX</span><Plate src={SOL.hand} /></div>
        <dl><dt>CONCEPT ID:</dt><dd>ENTRY001_V1.3</dd><dt>CREATED:</dt><dd>2024-05-18</dd><dt>UPDATED:</dt><dd>2024-05-18</dd><dt>AUTHOR:</dt><dd>DESIGN SYSTEM</dd><dt>ARTIFACT TYPE:</dt><dd>ENTRY COVER</dd><dt>SOURCE:</dt><dd>ENTRY001-CAMPAIGN-ARCHIVE</dd></dl>
        <div className="sol-amend"><strong>NAA-R5F1-AUTHORITY-SELECTION-V1 <mark>ACTIVE</mark></strong><p>AMENDMENT TYPE:　AUTHORITY SELECTION</p><p>EFFECTIVE:　　　2024-05-15</p><p>SCOPE:　　　　 DESIGN WORKSPACE</p><p>AUTHORITY WORKFLOW: ENABLED</p></div>
        <button>VIEW AMENDMENT</button>
      </section>
    </>
  );
}

export function NdxbookSolDirectPage() {
  return (
    <main className="sol-direct" data-testid="ndxbook-sol-direct">
      <header className="sol-hostbar"><b>SITE 00</b><Mark name="chevron" /><b>PROJECT: NDXBOOK</b><Mark name="chevron" /><b className="red">DESIGN</b><span>COMPILER: <b>READY</b><i /></span><Mark name="dots" /></header>
      <nav className="sol-primary-nav"><button><Mark name="hamburger" /></button>{['REFERENCES','ASSETS','PAGES','SKINS','HISTORY'].map((x)=><button key={x}>{x}</button>)}<button>MORE <Mark name="caret" /></button></nav>
      <div className="sol-context"><b>NDXBOOK</b><span>CULTURAL_INTELLIGENCE_EDITORIAL</span><em>PROJECT CREATIVE CONTEXT <i /></em></div>
      <section className="sol-target-band">
        <div><small>TARGET</small><strong>ENTRY 001<br />ENTRY COVER<br />HOMEPAGE HERO</strong></div>
        <div className="sol-viewport"><small>VIEWPORT</small><button className="active"><DeviceMark kind="mobile" />MOBILE</button><button><DeviceMark kind="tablet" />TABLET</button><button><DeviceMark kind="desktop" />DESKTOP</button></div>
        <div><small>STAGE</small><strong>REVIEW_ACTIVE_CONCEPT</strong><small>AUTHORITY</small><strong>PAIR: UNLOCKED · V1.3 <Mark name="lock" /></strong></div>
      </section>
      <section className="sol-main-stage"><HeroArtifact /><AuthorityRail /></section>
      <CandidateGallery />
      <StructuredReview />
      <Readiness />
      <DetailDock />
      <nav className="sol-bottom-nav">
        <button className="active"><Mark name="grid" />WORKSPACE</button><button><Mark name="clock" />DESIGN HISTORY</button><button><Mark name="doc" />FEATURE CHANGE<br />HISTORY</button><button><Mark name="status" />MASTER AMENDMENT<br />STATUS</button><button><Mark name="bolt" />CONTEXTUAL NEXT<br />ACTION</button>
      </nav>
    </main>
  );
}

export default NdxbookSolDirectPage;
