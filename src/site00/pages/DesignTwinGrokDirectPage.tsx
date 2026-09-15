import '../styles/site00-twin-grok-direct.css';

const PAPER = '/site00/creative-direction/ndxbook/eu-branch-receipts-isolated.webp';

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="2.5" width="8" height="19" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="18.6" r="0.7" fill="currentColor" />
    </svg>
  );
}

function IconTablet() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="18.4" r="0.7" fill="currentColor" />
    </svg>
  );
}

function IconDesktop() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.2 8.2 6.4 11.4 12.8 4.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3.2" y="7" width="9.6" height="6.4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.2 7V5.1a2.8 2.8 0 0 1 5.6 0V7" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13 8a5 5 0 1 1-1.4-3.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13 2.6V6H9.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconInspect() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="m9.6 9.6 3.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 7V3h4M13 9v4H9M3 3l4 4M13 13 9 9" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconSliders() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 4h10M3 8h10M3 12h10M6 2v4M10 6v4M7 10v4" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.4" y="2.4" width="4.4" height="4.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9.2" y="2.4" width="4.4" height="4.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2.4" y="9.2" width="4.4" height="4.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9.2" y="9.2" width="4.4" height="4.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5.2V8l2 1.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M9.2 2 4 9h3.2L6.8 14 12 7H8.8L9.2 2z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 8a4 4 0 1 0 1.2-2.9M4 3.4V6h2.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ArchivalHand() {
  return (
    <svg className="tgd-hand" viewBox="0 0 280 360" aria-hidden="true">
      <defs>
        <filter id="tgd-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" result="n" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="280" height="360" fill="#d8cfc4" />
      <rect width="280" height="360" fill="#cfc4b6" opacity="0.35" filter="url(#tgd-grain)" />
      <g fill="none" stroke="#1a1612" strokeLinecap="round" strokeLinejoin="round">
        <path d="M142 28c-6 38-8 72-6 108" strokeWidth="7.2" />
        <path d="M132 34c-4 34-5 70-3 104" strokeWidth="2.2" opacity="0.55" />
        <path d="M152 36c-3 32-4 68-2 100" strokeWidth="2" opacity="0.4" />
        <path
          d="M136 132c-18 8-38 28-42 52-3 18 4 34 22 44 10 6 18 18 20 34 2 18 1 38 8 54 8 18 26 28 44 24 16-4 28-18 32-34 6-22 8-48 4-70-3-16 2-28 14-36 14-10 24-26 22-44-2-16-16-28-32-26-10 1-18 8-22 16"
          strokeWidth="6.4"
        />
        <path d="M108 198c8 10 18 16 30 18" strokeWidth="2" opacity="0.55" />
        <path d="M118 230c10 8 22 12 34 12" strokeWidth="1.8" opacity="0.45" />
        <path d="M154 168c10 14 14 30 12 48" strokeWidth="1.8" opacity="0.4" />
        <path d="M96 178c-8 6-18 8-26 4" strokeWidth="3.2" />
        <path d="M88 206c-10 2-20 0-28-8" strokeWidth="3.2" />
        <path d="M92 228c-12 2-22-2-30-10" strokeWidth="3" />
        <circle cx="141" cy="26" r="5.2" fill="#1a1612" stroke="none" />
      </g>
      <g fill="#2a241c" opacity="0.18" fontFamily="Inter, sans-serif" fontSize="7" letterSpacing="0.12em">
        <text x="18" y="48">CHECK REF</text>
        <text x="18" y="62">P.1377</text>
        <text x="18" y="76">F.208</text>
        <text x="18" y="90">P.311</text>
      </g>
    </svg>
  );
}

function PaperDoc({ kind }: { kind: 'ground' | 'blue' | 'overlay' | 'assets' | 'fn' }) {
  return (
    <div className={`tgd-doc tgd-doc--${kind}`} aria-hidden="true">
      <img src={PAPER} alt="" />
      <div className="tgd-doc__marks">
        {kind === 'overlay' ? <span className="tgd-doc__big">001</span> : null}
        {kind === 'fn' ? <span className="tgd-doc__portrait" /> : null}
        {kind === 'blue' ? <span className="tgd-doc__grid" /> : null}
      </div>
    </div>
  );
}

function MiniSignalCard({ dark }: { dark?: boolean }) {
  return (
    <div className={`tgd-mini${dark ? ' tgd-mini--dark' : ''}`} aria-hidden="true">
      <div className="tgd-mini__copy">
        <strong>
          THE SIGNAL
          <br />
          IS THE
          <br />
          INDEX
        </strong>
      </div>
      <div className="tgd-mini__hand">
        <ArchivalHand />
      </div>
    </div>
  );
}

export function DesignTwinGrokDirectPage() {
  return (
    <div className="tgd" data-testid="twin-grok-direct-page">
      <div className="tgd-board" data-testid="twin-grok-direct-artboard">
        <header className="tgd-top">
          <p className="tgd-crumb">
            <span>SITE 00</span>
            <i>&gt;</i>
            <span>PROJECT:NDXBOOK</span>
            <i>&gt;</i>
            <strong>DESIGN</strong>
          </p>
          <p className="tgd-compiler">
            COMPILER:<em>READY</em>
          </p>
        </header>

        <nav className="tgd-tabs" aria-label="Design workspace">
          <span>REFERENCES</span>
          <span>ASSETS</span>
          <span>PAGES</span>
          <span>SKINS</span>
          <span>HISTORY</span>
          <span>
            MORE <i>∨</i>
          </span>
        </nav>

        <section className="tgd-context">
          <p>NDXBOOK CULTURAL INTELLIGENCE EDITORIAL</p>
          <p>PROJECT CREATIVE CONTEXT</p>
        </section>

        <section className="tgd-target">
          <div className="tgd-target__col">
            <h3>TARGET</h3>
            <p>ENTRY 001</p>
            <p>ENTRY COVER</p>
            <p>HOMEPAGE HERO</p>
          </div>
          <div className="tgd-target__view">
            <div className="tgd-devices">
              <figure className="is-active">
                <IconPhone />
                <figcaption>MOBILE</figcaption>
              </figure>
              <figure>
                <IconTablet />
                <figcaption>TABLET</figcaption>
              </figure>
              <figure>
                <IconDesktop />
                <figcaption>DESKTOP</figcaption>
              </figure>
            </div>
          </div>
          <div className="tgd-target__col tgd-target__col--right">
            <h3>STAGE</h3>
            <p>REVIEW ACTIVE CONCEPT</p>
            <p>AUTHORITY</p>
            <p>
              PAIR:UNLOCKED · V1.3.3 <IconLock />
            </p>
          </div>
        </section>

        <section className="tgd-main">
          <article className="tgd-hero">
            <header className="tgd-hero__head">
              <span>ENTRY 001</span>
              <span>CULTURAL RECEIPT / 001</span>
            </header>
            <div className="tgd-hero__stage">
              <div className="tgd-hero__copy">
                <h1>
                  THE SIGNAL
                  <br />
                  IS THE
                  <br />
                  INDEX
                </h1>
                <p>
                  CULTURE AS EVIDENCE.
                  <br />
                  IDEAS AS INDEX.
                  <br />
                  NDXBOOK.
                </p>
              </div>
              <div className="tgd-hero__image">
                <ArchivalHand />
              </div>
            </div>
            <footer className="tgd-hero__foot">
              <div>
                <small>INDEX SIGNAL ·</small>
                <span>PAGE 001 INDEXED</span>
              </div>
              <div>
                <small>ARCHIVAL EVIDENCE</small>
                <span>ATTACHED</span>
              </div>
              <button type="button" className="tgd-chip">
                EVIDENCE <em>+12</em>
              </button>
            </footer>
          </article>

          <aside className="tgd-rail">
            <button type="button" className="tgd-btn tgd-btn--lime">
              <IconCheck />
              <span>
                SELECT FOR MOBILE
                <small>SELECTED</small>
              </span>
            </button>
            <button type="button" className="tgd-btn tgd-btn--ghost">
              SELECT FOR DESKTOP
            </button>

            <div className="tgd-pair">
              <header>
                <span>AUTHORITY PAIR</span>
                <i>∧</i>
              </header>
              <div className="tgd-master">
                <div className="tgd-master__thumb">
                  <MiniSignalCard />
                </div>
                <div className="tgd-master__meta">
                  <strong>MOBILE MASTER</strong>
                  <em>V1.3.3</em>
                  <small>THE SIGNAL IS THE INDEX</small>
                </div>
                <b>SELECTED</b>
              </div>
              <div className="tgd-master">
                <div className="tgd-master__thumb">
                  <MiniSignalCard />
                </div>
                <div className="tgd-master__meta">
                  <strong>DESKTOP MASTER</strong>
                  <em>V1.1.1</em>
                  <small>THE SIGNAL IS THE INDEX</small>
                </div>
                <button type="button">REPLACE</button>
              </div>
            </div>

            <button type="button" className="tgd-btn tgd-btn--lime tgd-btn--solid">
              PROMOTE MOBILE
            </button>
            <button type="button" className="tgd-btn tgd-btn--ghost">
              PROMOTE DESKTOP
            </button>
            <button type="button" className="tgd-btn tgd-btn--ink">
              PAIR REVIEW
            </button>
            <button type="button" className="tgd-btn tgd-btn--ghost">
              REVIEW AUTHORITY
            </button>
            <button type="button" className="tgd-btn tgd-btn--ink tgd-btn--lock">
              <IconLock />
              LOCK MOBILE + DESKTOP
              <small>AUTHORITY PAIR</small>
            </button>
          </aside>
        </section>

        <section className="tgd-gallery">
          <header>
            <h2>CONCEPT CANDIDATE GALLERY</h2>
            <button type="button">COMPARE CONCEPTS</button>
          </header>
          <div className="tgd-gallery__row">
            <article className="tgd-card is-selected">
              <span className="tgd-card__check">
                <IconCheck />
              </span>
              <em>V1.5</em>
              <MiniSignalCard />
            </article>
            <article className="tgd-card">
              <em>V1.2.7</em>
              <MiniSignalCard />
            </article>
            <article className="tgd-card tgd-card--dark">
              <span className="tgd-card__device">
                <IconDesktop />
              </span>
              <em>V1.1</em>
              <MiniSignalCard dark />
            </article>
            <article className="tgd-card tgd-card--clip">
              <div className="tgd-card__stamp">
                <span>001</span>
                <small>
                  THE
                  <br />
                  SIGNAL
                  <br />
                  IS THE
                  <br />
                  INDEX
                </small>
              </div>
            </article>
            <button type="button" className="tgd-gallery__next" aria-label="Next candidates">
              ›
            </button>
          </div>
          <div className="tgd-gallery__actions">
            <button type="button">
              <IconSliders /> REFINE CONCEPT
            </button>
            <button type="button">
              <IconRefresh /> REGENERATE CONCEPT
            </button>
            <button type="button">
              <IconInspect /> INSPECT CANDIDATE
            </button>
            <button type="button">
              <IconExpand /> VIEW FULLSCREEN
            </button>
          </div>
        </section>

        <section className="tgd-struct">
          <h2>STRUCTURED OUTPUT REVIEW</h2>
          <div className="tgd-struct__grid">
            <article>
              <h3>GROUNDING</h3>
              <p>INDEX SIGNAL MANIFEST</p>
              <PaperDoc kind="ground" />
              <small>SOURCE: APP ASSET</small>
            </article>
            <article>
              <h3>BLUEPRINT</h3>
              <p>LAYOUT + TYPE SYSTEM</p>
              <PaperDoc kind="blue" />
              <small>NDXBOOK_GRID_V2</small>
            </article>
            <article>
              <h3>OVERLAY</h3>
              <p>ANNOTATION LAYER ON</p>
              <PaperDoc kind="overlay" />
              <small>ANNOTATION_LAYER_V1</small>
            </article>
            <article>
              <h3>ASSETS</h3>
              <p>EVIDENCE PACK 12 ITEMS</p>
              <PaperDoc kind="assets" />
              <small>ASSET_PACK_ENTRY001</small>
            </article>
            <article>
              <h3>FUNCTION</h3>
              <p>MAPPING 6 FUNCTIONS</p>
              <PaperDoc kind="fn" />
              <small>FUNCTION_MAP_P1</small>
            </article>
          </div>
        </section>

        <section className="tgd-pipe">
          <h2>PIPELINE / READINESS</h2>
          <div className="tgd-pipe__grid">
            <div className="tgd-ready">
              <h3>READINESS</h3>
              <div className="tgd-donut" aria-label="82 percent ready">
                <svg viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" />
                  <circle cx="36" cy="36" r="28" className="is-fill" />
                </svg>
                <strong>82%</strong>
              </div>
              <em>READY</em>
              <small>COMPILER: READY</small>
              <button type="button">VIEW DETAILS</button>
            </div>
            <div>
              <h3>CHECKS</h3>
              <ul>
                <li>LAYOUT SYSTEM</li>
                <li>TYPE SCALE</li>
                <li>POSITION MAP</li>
                <li>ACCESSIBILITY</li>
              </ul>
            </div>
            <div>
              <h3>STATUS</h3>
              <ul className="tgd-status">
                <li>
                  <i /> APPROVED ELEMENTS <b>18</b>
                </li>
                <li>
                  <i /> PENDING DECISIONS <b>2</b>
                </li>
                <li>
                  <i /> BLOCKERS <b>0</b>
                </li>
                <li>
                  <i className="warn" /> WARNINGS <b>1</b>
                </li>
              </ul>
            </div>
            <div className="tgd-next">
              <h3>NEXT ACTION</h3>
              <p>PROMOTE MOBILE MASTER TO AUTHORITY PAIR</p>
              <button type="button" className="tgd-btn tgd-btn--lime tgd-btn--solid">
                PRIMARY ACTION
              </button>
              <button type="button" className="tgd-btn tgd-btn--ghost">
                MOVE TO BUILDER WHEN READY
              </button>
              <button type="button" className="tgd-link">
                VIEW TECHNICAL DETAILS
              </button>
            </div>
          </div>
        </section>

        <section className="tgd-data">
          <nav>
            <strong>CONCEPT DATA</strong>
            <span>VERSION HISTORY</span>
            <span>CHANGE HISTORY</span>
            <span>MASTER UPDATE</span>
            <span>AMENDMENT</span>
          </nav>
          <div className="tgd-data__body">
            <div className="tgd-data__thumb">
              <MiniSignalCard />
            </div>
            <dl>
              <div>
                <dt>CONCEPT ID:</dt>
                <dd>ENTRY001_V1.3.3</dd>
              </div>
              <div>
                <dt>UPDATED:</dt>
                <dd>2024-05-18</dd>
              </div>
              <div>
                <dt>ARTIFACT TYPE:</dt>
                <dd>ENTRY COVER</dd>
              </div>
              <div>
                <dt>SOURCE:</dt>
                <dd>DESIGN SYSTEM</dd>
              </div>
            </dl>
            <dl>
              <div>
                <dt>NMA-RSF1-AUTHORITY-SELECTION-V1</dt>
                <dd>ACTIONING</dd>
              </div>
              <div>
                <dt>ARRANGEMENT TYPE:</dt>
                <dd>AUTHORITY SELECTION</dd>
              </div>
              <div>
                <dt>EFFECTIVE:</dt>
                <dd>2024-05-15</dd>
              </div>
              <div>
                <dt>AUTHORITY WORKFLOW:</dt>
                <dd>ENABLED</dd>
              </div>
            </dl>
            <button type="button">VIEW AMENDMENT</button>
          </div>
        </section>

        <footer className="tgd-bottom">
          <span>
            <IconGrid /> WORKSPACE
          </span>
          <span>
            <IconHistory /> DESIGN HISTORY
          </span>
          <span>
            <IconClock /> FEATURE CHANGE
          </span>
          <span>
            <IconHistory /> MASTER AMENDMENT
          </span>
          <span>
            <IconBolt /> CONTEXTUAL NEXT ACTION
          </span>
        </footer>
      </div>
    </div>
  );
}
