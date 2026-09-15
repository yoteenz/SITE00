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

function Icon({ children }: { children: string }) {
  return <span className="sol-icon" aria-hidden="true">{children}</span>;
}

function DeviceMark({ kind }: { kind: 'mobile' | 'tablet' | 'desktop' }) {
  if (kind === 'desktop') {
    return (
      <svg className="sol-device sol-device-desktop" viewBox="0 0 24 16" aria-hidden="true">
        <rect x="1.2" y="1" width="21.6" height="11.4" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 14.6h6M12 12.4v2.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg className={`sol-device sol-device-${kind}`} viewBox="0 0 14 22" aria-hidden="true">
      <rect x="1.4" y="1" width="11.2" height={kind === 'tablet' ? 20 : 20} rx={kind === 'tablet' ? 1.4 : 1.8} fill="none" stroke="currentColor" strokeWidth="1.3" />
      {kind === 'mobile' ? <rect x="5.4" y="18.4" width="3.2" height="1.1" rx="0.55" fill="currentColor" /> : null}
    </svg>
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
        <span>INDEX SIGNAL:<br />PAGE 001 INDEXED</span><i>›</i>
        <span>ARCHIVAL EVIDENCE<br />ATTACHED</span>
        <b>EVIDENCE</b><span>+12</span>
      </div>
    </article>
  );
}

function AuthorityRail() {
  return (
    <aside className="sol-authority">
      <button className="sol-select-mobile"><Icon>✓</Icon><span>SELECT FOR MOBILE<small>SELECTED</small></span></button>
      <button>SELECT FOR DESKTOP</button>
      <section>
        <header>AUTHORITY PAIR <span>⌃</span></header>
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
      <button className="sol-black sol-lock"><Icon>▣</Icon> LOCK MOBILE + DESKTOP<br />AUTHORITY PAIR</button>
    </aside>
  );
}

function CandidateGallery() {
  return (
    <section className="sol-panel sol-gallery">
      <header><span>CONCEPT CANDIDATE GALLERY</span><span>COMPARE CONCEPTS　⚙</span></header>
      <div className="sol-candidate-row">
        {archiveCards.map((card, index) => (
          <article className={`sol-candidate ${card.kind}`} key={`${card.kind}-${index}`}>
            <Plate className="sol-candidate-art" src={card.art} />
            <small>{card.version}</small>
            <strong>{card.title.split('\n').map((line) => <span key={line}>{line}</span>)}</strong>
            {card.kind === 'selected' ? <b>✓</b> : null}
          </article>
        ))}
        <button className="sol-gallery-next">›</button>
      </div>
      <div className="sol-gallery-actions">
        <button><Icon>☷</Icon> REFINE CONCEPT</button>
        <button><Icon>⟳</Icon> REGENERATE CONCEPT</button>
        <button><Icon>◎</Icon> INSPECT CANDIDATE</button>
        <button><Icon>↗</Icon> VIEW FULLSCREEN</button>
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
              {card.asset === 'functions' ? <>F01_INDEX_SIGNAL<br />F02_ERROR_REFERENCE<br />F03_ARCHIVAL_LINK<br />F04_CONTEXT_BRIDGE<br />F05_SOURCE_TOGGLE</> : null}
            </div>
            <footer><span>{card.foot}</span><Icon>▱</Icon></footer>
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
        <div className="sol-checks"><small>CHECKS</small>{['LAYOUT SYSTEM','TYPE SCALE','ASSET LINKS','FUNCTION MAP','ACCESSIBILITY'].map((x, i)=><p key={x}>{x}<b className={i === 4 ? 'warn' : ''}>{i === 4 ? '!' : '●'}</b></p>)}<button>VIEW DETAILS</button></div>
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
      <header className="sol-hostbar"><b>SITE 00</b><Icon>›</Icon><b>PROJECT: NDXBOOK</b><Icon>›</Icon><b className="red">DESIGN</b><span>COMPILER: <b>READY</b><i /></span><Icon>⋮</Icon></header>
      <nav className="sol-primary-nav"><button>☰</button>{['REFERENCES','ASSETS','PAGES','SKINS','HISTORY','MORE　⌄'].map((x)=><button key={x}>{x}</button>)}</nav>
      <div className="sol-context"><b>NDXBOOK</b><span>CULTURAL_INTELLIGENCE_EDITORIAL</span><em>PROJECT CREATIVE CONTEXT <i /></em></div>
      <section className="sol-target-band">
        <div><small>TARGET</small><strong>ENTRY 001<br />ENTRY COVER<br />HOMEPAGE HERO</strong></div>
        <div className="sol-viewport"><small>VIEWPORT</small><button className="active"><DeviceMark kind="mobile" />MOBILE</button><button><DeviceMark kind="tablet" />TABLET</button><button><DeviceMark kind="desktop" />DESKTOP</button></div>
        <div><small>STAGE</small><strong>REVIEW_ACTIVE_CONCEPT</strong><small>AUTHORITY</small><strong>PAIR: UNLOCKED · V1.3　♙</strong></div>
      </section>
      <section className="sol-main-stage"><HeroArtifact /><AuthorityRail /></section>
      <CandidateGallery />
      <StructuredReview />
      <Readiness />
      <DetailDock />
      <nav className="sol-bottom-nav">
        <button className="active"><Icon>▦</Icon>WORKSPACE</button><button><Icon>◷</Icon>DESIGN HISTORY</button><button><Icon>▣</Icon>FEATURE CHANGE<br />HISTORY</button><button><Icon>▽</Icon>MASTER AMENDMENT<br />STATUS</button><button><Icon>ϟ</Icon>CONTEXTUAL NEXT<br />ACTION</button>
      </nav>
    </main>
  );
}

export default NdxbookSolDirectPage;
