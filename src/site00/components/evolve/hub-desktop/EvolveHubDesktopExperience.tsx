import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EVOLVE_SERVICE_AREAS,
  EVOLVE_SERVICE_DIAGNOSTIC_STAGES,
  EVOLVE_SERVICE_EVOLUTION_PATHS,
  EVOLVE_SERVICE_FAQ,
  EVOLVE_SERVICE_FINAL_CTA,
  EVOLVE_SERVICE_HERO,
  EVOLVE_SERVICE_HUB_SECTIONS,
  EVOLVE_SERVICE_PROCESS_STEPS,
  resolveEnterPathRoute,
  resolveStartEvolveRoute,
} from '../../../../../shared/site00-evolve-service/index.js';
import { useSite00 } from '../../../state/Site00Context';
import { useSignedInFromStorage } from '../../../../hooks/useSignedInFromStorage';
import { EvolveServiceIcon } from '../service/EvolveServiceIcon';
import { ArrowIconSmall } from '../../icons/ArrowAction';

export function EvolveHubDesktopExperience() {
  const navigate = useNavigate();
  const { selectEvolvePath } = useSite00();
  const [signedIn] = useSignedInFromStorage();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const handleEnterPath = (pathId: 'refine' | 'install' | 'transform') => {
    selectEvolvePath(pathId);
    const dest = resolveEnterPathRoute(pathId, true);
    navigate(dest.route);
  };

  const handleStartEvolve = () => {
    const dest = resolveStartEvolveRoute({
      isSignedIn: signedIn,
      hasEvolveProject: false,
      evolveProjectSlug: null,
      serviceMode: 'DIGITAL_EVOLUTION',
      isDesktop: true,
    });
    navigate(dest.route);
  };

  return (
    <div className="site00-evolve-hub-desktop">
      <section className="site00-evolve-hub-desktop__hero">
        <div className="site00-evolve-hub-desktop__hero-copy">
          <span className="site00-evolve-hub-desktop__bracket" aria-hidden="true">
            {'{'}
          </span>
          <h1 className="site00-evolve-hub-desktop__title">{EVOLVE_SERVICE_HERO.title}</h1>
          <p className="site00-evolve-hub-desktop__tagline">{EVOLVE_SERVICE_HERO.tagline}</p>
        </div>
        <div className="site00-evolve-hub-desktop__hero-diagram" aria-hidden="true">
          <EvolveServiceIcon id="evolution-path" size={120} />
          <p className="site00-evolve-hub-desktop__hero-diagram-label">EVOLVE EXISTING POTENTIAL</p>
        </div>
      </section>

      <section className="site00-evolve-hub-desktop__diagnostic" aria-label="Service logic">
        {EVOLVE_SERVICE_DIAGNOSTIC_STAGES.map((stage, index) => (
          <div key={stage.id} className="site00-evolve-hub-desktop__diagnostic-item">
            <EvolveServiceIcon id={stage.iconId} size={40} />
            <div>
              <p className="site00-evolve-hub-desktop__diagnostic-num">{stage.num}</p>
              <h2 className="site00-evolve-hub-desktop__diagnostic-title">{stage.title}</h2>
              <p className="site00-evolve-hub-desktop__diagnostic-body">{stage.body}</p>
            </div>
            {index < EVOLVE_SERVICE_DIAGNOSTIC_STAGES.length - 1 ? (
              <span className="site00-evolve-hub-desktop__diagnostic-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        ))}
      </section>

      <nav className="site00-evolve-hub-desktop__nav" aria-label="Evolve sections">
        {EVOLVE_SERVICE_HUB_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`site00-evolve-hub-desktop__nav-link${activeSection === section.id ? ' is-active' : ''}`}
            onClick={() => {
              setActiveSection(section.id);
              document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <section id="overview" className="site00-evolve-hub-desktop__section">
        <p className="site00-evolve-hub-desktop__overview">{EVOLVE_SERVICE_HERO.overview}</p>
      </section>

      <section id="paths" className="site00-evolve-hub-desktop__section">
        <header className="site00-evolve-hub-desktop__section-header">
          <h2>EVOLUTION PATHS —</h2>
          <span>CHOOSE YOUR DIRECTION</span>
        </header>
        <div className="site00-evolve-hub-desktop__paths-grid">
          {EVOLVE_SERVICE_EVOLUTION_PATHS.map((path) => (
            <article key={path.id} className="site00-evolve-hub-desktop__path-card">
              <span className="site00-evolve-hub-desktop__path-num">{path.num}</span>
              <EvolveServiceIcon id={path.iconId} size={56} />
              <h3>
                {path.title} / {path.modeLabel}
              </h3>
              <p>{path.descriptor}</p>
              <ul>
                {path.capabilities.map((cap) => (
                  <li key={cap}>{cap}</li>
                ))}
              </ul>
              <button type="button" className="site00-evolve-hub-desktop__path-cta" onClick={() => handleEnterPath(path.id)}>
                {path.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="site00-evolve-hub-desktop__section">
        <header className="site00-evolve-hub-desktop__section-header">
          <h2>EVOLVE PROCESS —</h2>
          <span>EXISTING PROPERTY → STUDIO PRODUCTION</span>
        </header>
        <ol className="site00-evolve-hub-desktop__process-track">
          {EVOLVE_SERVICE_PROCESS_STEPS.map((step, index) => (
            <li key={step.num}>
              <EvolveServiceIcon id={step.iconId} size={36} />
              <span className="site00-evolve-hub-desktop__process-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              {index < EVOLVE_SERVICE_PROCESS_STEPS.length - 1 ? (
                <span className="site00-evolve-hub-desktop__process-arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section id="systems" className="site00-evolve-hub-desktop__section">
        <header className="site00-evolve-hub-desktop__section-header">
          <h2>SERVICE AREAS —</h2>
          <span>CAPABILITIES FOR YOUR EVOLUTION</span>
        </header>
        <div className="site00-evolve-hub-desktop__areas-grid">
          {EVOLVE_SERVICE_AREAS.map((area) => (
            <article key={area.id} className="site00-evolve-hub-desktop__area-card">
              <EvolveServiceIcon id={area.iconId} size={40} />
              <h3>{area.title}</h3>
              <ul>
                {area.capabilities.map((cap) => (
                  <li key={cap}>
                    <span className="site00-evolve-hub-desktop__bullet" aria-hidden="true" />
                    {cap}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="cases" className="site00-evolve-hub-desktop__section site00-evolve-hub-desktop__cases">
        <h2>CASE STUDIES</h2>
        <p>PUBLISHED EVOLVE CASE STUDIES COMING SOON.</p>
        <button type="button" className="site00-evolve-hub-desktop__notify">
          NOTIFY ME →
        </button>
      </section>

      <section id="faq" className="site00-evolve-hub-desktop__section">
        <h2>FAQ</h2>
        <div className="site00-evolve-hub-desktop__faq-grid">
          {EVOLVE_SERVICE_FAQ.map((item) => (
            <article key={item.id} className="site00-evolve-hub-desktop__faq-item">
              <button
                type="button"
                className="site00-evolve-hub-desktop__faq-q"
                aria-expanded={expandedFaq === item.id}
                onClick={() => setExpandedFaq((prev) => (prev === item.id ? null : item.id))}
              >
                {item.question}
                <span aria-hidden="true">{expandedFaq === item.id ? '−' : '+'}</span>
              </button>
              {expandedFaq === item.id ? <p className="site00-evolve-hub-desktop__faq-a">{item.answer}</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section id="start" className="site00-evolve-hub-desktop__final">
        <div>
          <h2>
            {EVOLVE_SERVICE_FINAL_CTA.headlineLine1}
            <br />
            {EVOLVE_SERVICE_FINAL_CTA.headlineLine2}
          </h2>
          <p>{EVOLVE_SERVICE_FINAL_CTA.subhead}</p>
          <button type="button" className="site00-evolve-hub-desktop__start-cta" onClick={handleStartEvolve}>
            {EVOLVE_SERVICE_FINAL_CTA.cta.replace(' →', '')}
            <ArrowIconSmall />
          </button>
        </div>
        <EvolveServiceIcon id="transform" size={96} className="site00-evolve-hub-desktop__final-art" />
      </section>
    </div>
  );
}
