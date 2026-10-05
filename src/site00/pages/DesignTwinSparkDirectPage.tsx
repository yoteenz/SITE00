/**
 * P0.VR.DESIGNBENCH.SPARK-DIRECT1 — Muse Spark 1.3 direct reconstruction.
 * Route: /projects/:projectSlug/design/twin-spark-direct
 * Authority: founder golden reference. Real DOM/CSS only — no raster cheat.
 */
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../site00/styles/site00-twin-spark-direct.css';

const BENCH_ID = 'P0.VR.DESIGNBENCH.SPARK-DIRECT1';

export function DesignTwinSparkDirectPage() {
  const { projectSlug = 'ndxbook' } = useParams();
  const project = projectSlug.toUpperCase();
  const [selectedCandidate, setSelectedCandidate] = useState(0);
  const [activeTab, setActiveTab] = useState('CONCEPT DATA');

  return (
    <div className="spark-direct" data-testid="twin-spark-direct" data-bench={BENCH_ID}>
      <div className="sd-shell">
        {/* SITE00 header */}
        <header className="sd-crumbs" aria-label="Breadcrumb">
          <div className="sd-crumbs__left">
            <span>SITE 00</span>
            <span className="sep">&gt;</span>
            <span>PROJECT: {project}</span>
            <span className="sep">&gt;</span>
            <span className="sd-crumbs__design">DESIGN</span>
          </div>
          <div className="sd-crumbs__right">
            <span>COMPILER: READY</span>
            <span className="sd-dot" aria-hidden="true" />
            <span className="sd-dot sd-dot--dark" aria-hidden="true" />
          </div>
        </header>

        {/* Primary nav */}
        <nav className="sd-nav" aria-label="Design workspace">
          <button className="sd-nav__burger" type="button" aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
          <div className="sd-nav__tabs" role="tablist">
            {['REFERENCES', 'ASSETS', 'PAGES', 'SKINS', 'HISTORY'].map((tab) => (
              <button key={tab} className="sd-nav__tab" type="button" role="tab" aria-selected="false">
                {tab}
              </button>
            ))}
            <button className="sd-nav__tab" type="button" role="tab" aria-selected="false">
              MORE <span className="caret">▼</span>
            </button>
          </div>
        </nav>

        {/* Context band */}
        <div className="sd-context">
          <div className="sd-context__left">
            <span className="sd-context__brand">{project}</span>
            <span className="sd-context__title sd-mono">CULTURAL_INTELLIGENCE_EDITORIAL</span>
          </div>
          <div className="sd-context__right">
            <span>PROJECT CREATIVE CONTEXT</span>
            <span className="sd-dot" aria-hidden="true" />
          </div>
        </div>

        {/* Target / viewport / stage band */}
        <section className="sd-meta" aria-label="Target viewport stage">
          <div>
            <div className="sd-meta__label">TARGET</div>
            <div className="sd-meta__target-lines">
              ENTRY 001
              <br />
              ENTRY COVER
              <br />
              HOMEPAGE HERO
            </div>
          </div>
          <div>
            <div className="sd-meta__label" style={{ textAlign: 'center' }}>
              VIEWPORT
            </div>
            <div className="sd-meta__viewports">
              <div className="sd-viewport sd-viewport--active" aria-current="true">
                <span className="sd-viewport__icon sd-viewport__icon--mobile" aria-hidden="true" />
                MOBILE
              </div>
              <div className="sd-viewport">
                <span className="sd-viewport__icon sd-viewport__icon--tablet" aria-hidden="true" />
                TABLET
              </div>
              <div className="sd-viewport">
                <span className="sd-viewport__icon sd-viewport__icon--desktop" aria-hidden="true" />
                DESKTOP
              </div>
            </div>
          </div>
          <div className="sd-meta__right">
            <div className="sd-meta__stage-row">
              <span className="sd-meta__label">STAGE</span>
              <span className="sd-meta__value">REVIEW_ACTIVE_CONCEPT</span>
            </div>
            <div className="sd-meta__stage-row">
              <span className="sd-meta__label">AUTHORITY</span>
              <span className="sd-meta__value sd-meta__value--dim">
                PAIR: UNLOCKED · V1.3 <span className="sd-lock" aria-hidden="true">🔓</span>
              </span>
            </div>
          </div>
        </section>

        {/* Hero + authority rail */}
        <div className="sd-hero-row">
          <article className="sd-hero" aria-label="Entry 001 hero concept">
            <div className="sd-hero__top sd-mono">
              <span>ENTRY 001</span>
              <span className="dim">CULTURAL RECEIPT</span>
              <span>001</span>
            </div>
            <div className="sd-hero__body">
              <div>
                <h1 className="sd-hero__headline">
                  THE SIGNAL
                  <br />
                  IS THE INDEX
                </h1>
                <p className="sd-hero__sub">
                  CULTURE AS EVIDENCE.
                  <br />
                  IDEAS AS INDEX.
                  <br />
                  NDXBOOK.
                </p>
              </div>
              <div className="sd-hero__art" aria-label="Archival evidence collage" role="img">
                <div className="sd-hero__hand" aria-hidden="true" />
                <div className="sd-scrap sd-scrap--a" aria-hidden="true">
                  <b>N° 001-B</b>
                  CHECK REF
                  <br />
                  F.157
                  <br />P.208
                  <br />
                  P.511
                </div>
                <div className="sd-scrap sd-scrap--b" aria-hidden="true">
                  <b>SIGNAL LOG</b>
                  PAGE 001
                  <br />
                  INDEXED ✓
                </div>
                <div className="sd-scrap sd-scrap--c" aria-hidden="true">
                  <b>★ $15.00</b>
                  ARCHIVE FEE
                </div>
                <div className="sd-scrap sd-scrap--d" aria-hidden="true">
                  <b>CULTURAL RECEIPT</b>
                  EVIDENCE 001 / 012
                </div>
                <div className="sd-scrap sd-scrap--e" aria-hidden="true">
                  <b>ARCHIVE</b>
                  REF F.157
                  <br />
                  P.208
                </div>
              </div>
            </div>
            <footer className="sd-hero__foot">
              <span className="lime">
                INDEX SIGNAL:
                <br />
                PAGE 001 INDEXED
              </span>
              <span className="sd-dot" aria-hidden="true" />
              <span className="dim">ARCHIVAL EVIDENCE ATTACHED</span>
              <span className="sd-hero__evidence">EVIDENCE</span>
              <span className="sd-hero__count">+12</span>
            </footer>
          </article>

          <aside className="sd-rail" aria-label="Authority controls">
            <button className="sd-btn sd-btn--lime" type="button">
              <span aria-hidden="true">✓</span>
              <span>
                SELECT FOR MOBILE<small>SELECTED</small>
              </span>
            </button>
            <button className="sd-btn" type="button">
              SELECT FOR DESKTOP
            </button>
            <button className="sd-btn sd-btn--pair" type="button">
              AUTHORITY PAIR <span aria-hidden="true">⌄</span>
            </button>
            <div className="sd-master">
              <span className="sd-master__name">MOBILE MASTER</span>
              <span className="sd-master__ver">V1.3</span>
              <span className="sd-master__thumb" aria-hidden="true" />
              <span className="sd-master__status">SELECTED</span>
            </div>
            <div className="sd-master">
              <span className="sd-master__name">DESKTOP MASTER</span>
              <span className="sd-master__ver">V1.1</span>
              <span className="sd-master__thumb" aria-hidden="true" />
              <button className="sd-master__replace" type="button">
                REPLACE
              </button>
            </div>
            <button className="sd-btn sd-btn--lime" type="button">
              PROMOTE MOBILE
            </button>
            <button className="sd-btn" type="button">
              PROMOTE DESKTOP
            </button>
            <button className="sd-btn" type="button">
              PAIR REVIEW
            </button>
            <button className="sd-btn" type="button">
              REVIEW AUTHORITY
            </button>
            <button className="sd-btn sd-btn--dark" type="button">
              <span aria-hidden="true">🔒</span> LOCK MOBILE + DESKTOP AUTHORITY PAIR TO AUTHORITY
            </button>
          </aside>
        </div>

        {/* Candidate gallery */}
        <section className="sd-section" aria-label="Concept candidate gallery">
          <div className="sd-section__head">
            <span>CONCEPT CANDIDATE GALLERY</span>
            <span className="right">
              COMPARE CONCEPTS <span aria-hidden="true">⤢</span>
            </span>
          </div>
          <div className="sd-gallery" role="listbox" aria-label="Candidates">
            {[
              { ver: 'V1.2', kind: '' },
              { ver: 'V1.2', kind: '' },
              { ver: 'V1.1', kind: 'sd-card--blueprint' },
              { ver: '001', kind: 'paper' },
            ].map((card, index) => (
              <button
                key={`${card.ver}-${index}`}
                type="button"
                role="option"
                aria-selected={selectedCandidate === index}
                className={`sd-card ${card.kind} ${selectedCandidate === index ? 'sd-card--selected' : ''}`}
                onClick={() => setSelectedCandidate(index)}
              >
                <span className="sd-card__ver">{card.ver}</span>
                {selectedCandidate === index && (
                  <span className="sd-card__check" aria-hidden="true">
                    ✓
                  </span>
                )}
                {card.kind === 'paper' ? (
                  <span className="sd-card__art sd-card__art--paper" aria-hidden="true">
                    001
                  </span>
                ) : (
                  <span className="sd-card__art" aria-hidden="true">
                    <span className="sd-card__left">
                      THE SIGNAL IS THE INDEX
                    </span>
                    <span className="sd-card__right" />
                  </span>
                )}
                {index === 2 && (
                  <span className="sd-card__foot" aria-hidden="true">
                    001·
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="sd-actions">
            <button className="sd-action" type="button">
              <span className="sd-action__icon" aria-hidden="true">
                ⚙
              </span>
              REFINE CONCEPT
            </button>
            <button className="sd-action" type="button">
              <span className="sd-action__icon" aria-hidden="true">
                ↻
              </span>
              REGENERATE CONCEPT
            </button>
            <button className="sd-action" type="button">
              <span className="sd-action__icon" aria-hidden="true">
                ⌕
              </span>
              INSPECT CANDIDATE
            </button>
            <button className="sd-action" type="button">
              <span className="sd-action__icon" aria-hidden="true">
                ⤢
              </span>
              VIEW FULLSCREEN
            </button>
          </div>
        </section>

        {/* Structured output review */}
        <section className="sd-section" aria-label="Structured output review">
          <div className="sd-section__head">
            <span>STRUCTURED OUTPUT REVIEW</span>
            <span className="right" aria-hidden="true">
              ⤢
            </span>
          </div>
          <div className="sd-output">
            <div>
              <div className="sd-outcol__label">
                GROUNDING<span>INDEX SIGNAL MANIFEST</span>
              </div>
              <div className="sd-thumb sd-thumb--paper" role="img" aria-label="Index signal manifest" />
              <div className="sd-outcol__src">
                <span>SOURCE: APP ASSET</span>
                <span className="file" aria-hidden="true">
                  ⎙
                </span>
              </div>
            </div>
            <div>
              <div className="sd-outcol__label">
                BLUEPRINT<span>LAYOUT + TYPE SYSTEM</span>
              </div>
              <div className="sd-thumb sd-thumb--grid" role="img" aria-label="Layout grid blueprint" />
              <div className="sd-outcol__src">
                <span>NDXBOOK_GRID_V2</span>
                <span className="file" aria-hidden="true">
                  ⎙
                </span>
              </div>
            </div>
            <div>
              <div className="sd-outcol__label">
                OVERLAY<span>ANNOTATION LAYER ON</span>
              </div>
              <div className="sd-thumb sd-thumb--overlay" role="img" aria-label="Annotation layer" />
              <div className="sd-outcol__src">
                <span>ANNOTATION_LAYER_V1</span>
                <span className="file" aria-hidden="true">
                  ⎙
                </span>
              </div>
            </div>
            <div>
              <div className="sd-outcol__label">
                ASSETS<span>EVIDENCE PACK 12 ITEMS</span>
              </div>
              <div className="sd-thumb sd-thumb--assets" role="img" aria-label="Evidence pack" />
              <div className="sd-outcol__src">
                <span>ASSET_PACK_ENTRY001</span>
                <span className="file" aria-hidden="true">
                  ⎙
                </span>
              </div>
            </div>
            <div>
              <div className="sd-outcol__label">
                FUNCTION<span>MAPPING 6 FUNCTIONS</span>
              </div>
              <div className="sd-thumb sd-thumb--fn" aria-label="Function mapping">
                F01_INDEX_SIGNAL
                <br />
                F02_GROUND_REFERENCE
                <br />
                F03_ARCHIVAL_LOCK
                <br />
                F04_CONTEXT_SPREAD
                <br />
                F05_DESKTOP_MAP
                <br />
                F06_VERIFICATION
              </div>
              <div className="sd-outcol__src">
                <span>FUNCTION_MAP_V1</span>
                <span className="file" aria-hidden="true">
                  ⎙
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline / readiness */}
        <section className="sd-section" aria-label="Pipeline readiness">
          <div className="sd-section__head">
            <span>PIPELINE / READINESS</span>
            <span className="right" aria-hidden="true">
              ⤢
            </span>
          </div>
          <div className="sd-ready">
            <div>
              <div className="sd-ready__label sd-ready__label--dim">READINESS</div>
              <div className="sd-donut">
                <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Readiness 82 percent">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#c9c5b6" strokeWidth="7" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="#7a8a00"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="163.4"
                    strokeDashoffset="29.4"
                    transform="rotate(-90 32 32)"
                  />
                  <text
                    x="32"
                    y="37"
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="800"
                    fill="#161511"
                  >
                    82%
                  </text>
                </svg>
                <span className="sd-donut__ready">READY</span>
              </div>
              <div className="sd-compiles">
                COMPILES: READY <span className="sd-dot" aria-hidden="true" />
              </div>
            </div>
            <div>
              <div className="sd-ready__label sd-ready__label--dim">CHECKS</div>
              <ul className="sd-checks">
                {['LAYOUT SYSTEM', 'TYPE SCALE', 'ASSET LINKS', 'POSITION MAP', 'ACCESSIBILITY'].map(
                  (check) => (
                    <li key={check}>
                      {check} <span className="sd-dot" aria-hidden="true" />
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <div className="sd-ready__label sd-ready__label--dim">STATUS</div>
              <ul className="sd-stats">
                <li>
                  <span>APPROVED ELEMENTS</span>
                  <span>18</span>
                </li>
                <li>
                  <span>PENDING DECISIONS</span>
                  <span>2</span>
                </li>
                <li>
                  <span>BLOCKERS</span>
                  <span>0</span>
                </li>
                <li>
                  <span>WARNINGS</span>
                  <span>1</span>
                </li>
              </ul>
              <div style={{ marginTop: 6 }}>
                <button className="sd-viewlink" type="button" style={{ width: '100%' }}>
                  VIEW DETAILS
                </button>
              </div>
            </div>
            <div>
              <div className="sd-ready__label sd-ready__label--dim">NEXT ACTION</div>
              <div className="sd-next">
                <div className="sd-next__title">PROMOTE MOBILE MASTER TO AUTHORITY PAIR</div>
                <button className="sd-viewlink sd-viewlink--lime" type="button">
                  PRIMARY ACTION
                </button>
                <button className="sd-viewlink" type="button">
                  MOVE TO BUILD WHEN READY
                </button>
                <button className="sd-viewlink" type="button">
                  VIEW TECHNICAL DETAILS
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Concept history */}
        <section className="sd-section" aria-label="Concept history">
          <div className="sd-tabs" role="tablist">
            {['CONCEPT DATA', 'VERSION HISTORY', 'CHANGE HISTORY', 'MASTER UPDATE', 'AMENDMENT'].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
          <div className="sd-concept">
            <div className="sd-concept__thumb" aria-hidden="true">
              THE SIGNAL IS THE INDEX
            </div>
            <dl className="sd-concept__kv">
              <dt>CONCEPT ID:</dt>
              <dd>ENTRY001_V1.3</dd>
              <dt>UPDATED:</dt>
              <dd>2024-12-18</dd>
              <dt>AUTHOR:</dt>
              <dd>NDXBOOK</dd>
              <dt>FORMAT:</dt>
              <dd>ENTRY-COVER</dd>
              <dt>SOURCE:</dt>
              <dd>CAMPAIGN-ARCHIVE</dd>
            </dl>
            <div className="sd-amend">
              <span className="sd-amend__id">MAA-RSF1-AUTHORITY-SELECTION-V1</span>
              <span className="sd-amend__action">ACTION</span>
              <dl className="sd-amend__row">
                <dt>ARBITRATION TYPE:</dt>
                <dd>AUTHORITY SELECTION</dd>
                <dt>EFFECTIVE:</dt>
                <dd>2024-12-18</dd>
                <dt>SCOPE:</dt>
                <dd>DESIGN WORKSPACE</dd>
                <dt>AUTHORITY WORKFLOW:</dt>
                <dd>ENABLED</dd>
              </dl>
              <div style={{ gridColumn: '1 / -1', marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="sd-viewlink" type="button" style={{ minWidth: 220 }}>
                  VIEW AMENDMENT
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom navigation */}
        <nav className="sd-bottom" aria-label="Workspace">
          <button type="button">
            <span className="sd-action__icon" aria-hidden="true">
              ▦
            </span>
            WORKSPACE
          </button>
          <button type="button">
            <span className="sd-action__icon" aria-hidden="true">
              ◷
            </span>
            DESIGN HISTORY
          </button>
          <button type="button">
            <span className="sd-action__icon" aria-hidden="true">
              ⚙
            </span>
            FEATURE CHANGE HISTORY
          </button>
          <button type="button">
            <span className="sd-action__icon" aria-hidden="true">
              ◉
            </span>
            MASTER AMENDMENT STATUS
          </button>
          <button type="button">
            <span className="sd-action__icon" aria-hidden="true">
              ⚡
            </span>
            CONTEXTUAL NEXT ACTION
          </button>
        </nav>

        <div className="sd-bench sd-mono">
          {BENCH_ID} · MUSE SPARK 1.3 · ISOLATED DIRECT BENCH
        </div>
      </div>
    </div>
  );
}
