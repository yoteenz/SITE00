import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EcosystemShell } from '../../components/ecosystem/EcosystemShell';
import { SITE00_ROUTES } from '../../config/routes';
import {
  useEvolveOperationsPortfolio,
  type EvolveOperationsTab,
} from '../../hooks/useEvolveOperationsPortfolio';
import '../../styles/site00-evolve-operations.css';

const TABS: EvolveOperationsTab[] = [
  'TODAY',
  'AT_RISK',
  'SPEND',
  'FAILURES',
  'CLIENT_WAITING',
  'SYSTEM_WAITING',
];

export default function EvolveOperationsPage() {
  const [tab, setTab] = useState<EvolveOperationsTab>('TODAY');
  const [scaleMode, setScaleMode] = useState(false);
  const { page, tabActions, scale } = useEvolveOperationsPortfolio({ tab, scale: scaleMode });

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-evolve-ops" data-visual-authority="VISUAL_AUTHORITY_REQUIRED">
        <header className="site00-evolve-ops__header">
          <div>
            <p className="site00-evolve-ops__eyebrow">FOUNDER · INTERNAL ONLY</p>
            <h1 className="site00-evolve-ops__title">EVOLVE OPERATIONS</h1>
            <p className="site00-evolve-ops__subtitle">SITE 00 OPERATIONS INTELLIGENCE — EXCEPTIONS FIRST</p>
          </div>
          <Link to={SITE00_ROUTES.control} className="site00-btn-ghost-sm">
            ← CONTROL ROOM
          </Link>
        </header>

        <div className="site00-evolve-ops__signals">
          {page.topSignals.slice(0, 8).map((signal) => (
            <article key={signal.id} className={`site00-evolve-ops-signal site00-evolve-ops-signal--${signal.state.toLowerCase()}`}>
              <span className="site00-evolve-ops-signal__label">{signal.label}</span>
              <strong className="site00-evolve-ops-signal__value">{signal.value}</strong>
            </article>
          ))}
        </div>

        <nav className="site00-evolve-ops__tabs" aria-label="Operations views">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={tab === t ? 'is-active' : undefined}
              onClick={() => setTab(t)}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </nav>

        <div className="site00-evolve-ops__grid">
          <section className="site00-evolve-ops-panel">
            <h2>{tab.replace(/_/g, ' ')} · QUEUE</h2>
            {tabActions.length === 0 ? (
              <p className="site00-body">NO EXCEPTIONS IN THIS QUEUE — SYSTEM HANDLING NORMAL.</p>
            ) : (
              <ul className="site00-evolve-ops-queue">
                {tabActions.slice(0, 20).map((action) => (
                  <li key={action.id}>
                    <div>
                      <strong>{action.title}</strong>
                      <p>{action.summary}</p>
                      <small>
                        {action.assignee} · PRIORITY {action.priority.score} · {action.queueId.replace(/_/g, ' ')}
                      </small>
                    </div>
                    <Link to={action.route} className="site00-btn-ghost-sm">
                      OPEN →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {scaleMode ? <p className="site00-evolve-ops__scale-note">PORTFOLIO FIXTURE: {scale} PROJECTS</p> : null}
          </section>

          <aside className="site00-evolve-ops-panel site00-evolve-ops-panel--brief">
            <h2>EXECUTIVE BRIEF</h2>
            <p className="site00-evolve-ops-brief__title">{page.executiveBrief.title}</p>
            {page.executiveBrief.whatChanged.length > 0 ? (
              <>
                <h3>WHAT CHANGED</h3>
                <ul>
                  {page.executiveBrief.whatChanged.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            ) : null}
            <h3>SYSTEM HANDLED</h3>
            <ul>
              {page.executiveBrief.whatSystemHandled.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {page.providerIncidents.length > 0 ? (
              <>
                <h3>PROVIDER INCIDENTS</h3>
                {page.providerIncidents.map((inc) => (
                  <article key={inc.id} className="site00-evolve-ops-incident">
                    <strong>{inc.providerName}</strong>
                    <p>
                      {inc.affectedJobCount} JOBS · RETRIES {inc.unsafeRetriesPaused ? 'PAUSED' : 'ACTIVE'}
                    </p>
                  </article>
                ))}
              </>
            ) : null}
          </aside>
        </div>

        <footer className="site00-evolve-ops__footer">
          <button type="button" className="site00-btn-ghost-sm" onClick={() => setScaleMode((v) => !v)}>
            {scaleMode ? 'DEMO FIXTURES' : '1,000-PROJECT FIXTURE'}
          </button>
          <span>PORTFOLIO HEALTH: {page.summary.portfolioHealth}</span>
        </footer>
      </div>
    </EcosystemShell>
  );
}
