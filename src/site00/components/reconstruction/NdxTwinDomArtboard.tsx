/**
 * P0.VR.TWINV2.3R1 — DOM-first NDXBOOK twin surface (no authority UI crops).
 */

import type { CSSProperties, ReactNode } from 'react';
import type { PageFunctionGraph, PageIntentModel } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV21/types.js';
import type { ConceptBlueprint, ExecutableConceptPackage } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22/types.js';
import type { ExecutableConceptObject } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23R1/types.js';
import { normalizeSectionKey } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23R1/sectionTemplates.js';
import { stripDebugCopy } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV23R1/renderPrimitivePolicy.js';
import { isHostOwnedBlueprintLabel } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/isHostOwnedBlueprintLabel.js';

type Props = {
  pkg: ExecutableConceptPackage;
  pageIntent: PageIntentModel;
  functionGraph: PageFunctionGraph;
  expandedObjects: ExecutableConceptObject[];
  projectSlug: string;
};

function boundsStyle(b: { x: number; y: number; w: number; h: number }): CSSProperties {
  return {
    left: `${b.x * 100}%`,
    top: `${b.y * 100}%`,
    width: `${b.w * 100}%`,
    minHeight: `${b.h * 100}%`,
  };
}

function parseProgressPercent(lines: string[]): number {
  for (const line of lines) {
    const m = line.match(/(\d{1,3})\s*%/);
    if (m) return Math.min(100, Number(m[1]));
  }
  return 42;
}

function splitMetric(line: string): { value: string; label: string } {
  const parts = line.split('—').map((s) => s.trim());
  if (parts.length >= 2) return { value: parts[0], label: parts.slice(1).join(' — ') };
  const m = line.match(/^([\d.]+%?)\s+(.+)$/);
  if (m) return { value: m[1], label: m[2] };
  return { value: line, label: '' };
}

function activityParts(line: string): { actor: string; action: string; when: string } {
  const when = line.match(/\b(\d+[hdwm]|ago|yesterday)\b/i)?.[0] ?? '';
  return { actor: line.slice(0, 24), action: line, when };
}

function typeStyle(blueprint: ConceptBlueprint, role: string): CSSProperties {
  const tr = blueprint.typography.roles.find((r) => r.role === role) ?? blueprint.typography.roles[0];
  if (!tr) return {};
  return {
    fontSize: `clamp(0.6rem, ${tr.sizeNorm * 90}vw, 1rem)`,
    fontWeight: tr.weight === '700' ? 700 : tr.weight === '600' ? 600 : 400,
    textTransform: tr.case === 'uppercase' ? 'uppercase' : 'none',
    letterSpacing: tr.case === 'uppercase' ? '0.07em' : 'normal',
  };
}

function SectionShell({
  sectionId,
  label,
  bounds,
  children,
  surface,
}: {
  sectionId: string;
  label: string;
  bounds: { x: number; y: number; w: number; h: number };
  children: ReactNode;
  surface?: string;
}) {
  const human = stripDebugCopy(label);
  return (
    <section
      className="site00-twin-v2-dom__section"
      data-section-id={sectionId}
      data-section-key={normalizeSectionKey(label)}
      aria-label={human}
      style={{ ...boundsStyle(bounds), background: surface === 'black_hero' ? '#0a0a0a' : undefined }}
    >
      {children}
    </section>
  );
}

export function NdxTwinDomArtboard({ pkg, pageIntent, functionGraph, expandedObjects, projectSlug }: Props) {
  const fg = functionGraph;
  const lime = pkg.blueprint.colors.lime[0] ?? '#c8ff00';
  const sections = pkg.blueprint.sections.filter((s) => !isHostOwnedBlueprintLabel(s.label));
  const progressPct = parseProgressPercent(fg.progress);

  const objectsFor = (sectionId: string) => expandedObjects.filter((o) => o.sectionId === sectionId);

  return (
    <div
      className="site00-twin-v2-dom__artboard"
      data-dom-first="1"
      style={{ ['--twin-v2-lime' as string]: lime }}
    >
      {sections.map((sec) => {
        const key = normalizeSectionKey(sec.label);
        const objs = objectsFor(sec.id);

        if (key === 'masthead') {
          return (
            <SectionShell key={sec.id} sectionId={sec.id} label={sec.label} bounds={sec.bounds} surface="white_band">
              <p className="site00-twin-v2-dom__kicker" style={typeStyle(pkg.blueprint, 'metric')}>
                {projectSlug.toUpperCase()} · OVERVIEW
              </p>
              <h1 className="site00-twin-v2-dom__masthead-title" style={typeStyle(pkg.blueprint, 'headline')}>
                {pageIntent.pageType}
              </h1>
              <p className="site00-twin-v2-dom__masthead-decision" style={typeStyle(pkg.blueprint, 'body')}>
                {pageIntent.primaryDecision}
              </p>
              <p className="site00-twin-v2-dom__masthead-meta" style={typeStyle(pkg.blueprint, 'body')}>
                {pageIntent.primaryUser} · {fg.currentPhase[0] ?? 'ACTIVE PHASE'}
              </p>
              {objs.map((o) => (
                <span key={o.objectId} data-exec-object-id={o.objectId} className="site00-twin-v2-dom__trace" hidden />
              ))}
            </SectionShell>
          );
        }

        if (key === 'nav') {
          return (
            <SectionShell key={sec.id} sectionId={sec.id} label={sec.label} bounds={sec.bounds}>
              <nav className="site00-twin-v2-dom__nav" aria-label="Module navigation">
                {fg.sectionNavigation.map((item) => (
                  <button key={item} type="button" className="site00-twin-v2-dom__nav-btn" data-exec-object-id={`${sec.id}-nav-${item}`}>
                    {item}
                  </button>
                ))}
              </nav>
            </SectionShell>
          );
        }

        if (key === 'hero') {
          return (
            <SectionShell key={sec.id} sectionId={sec.id} label={sec.label} bounds={sec.bounds} surface="black_hero">
              <div className="site00-twin-v2-dom__hero-grid">
                <div className="site00-twin-v2-dom__hero-copy">
                  <p className="site00-twin-v2-dom__eyebrow" style={typeStyle(pkg.blueprint, 'metric')}>
                    {pageIntent.primaryPurposes?.[0] ?? 'EDITORIAL'}
                  </p>
                  <h2 className="site00-twin-v2-dom__hero-headline" style={typeStyle(pkg.blueprint, 'headline')}>
                    {pageIntent.primaryDecision}
                  </h2>
                  <p className="site00-twin-v2-dom__hero-body" style={typeStyle(pkg.blueprint, 'body')}>
                    {pageIntent.summary}
                  </p>
                  <div className="site00-twin-v2-dom__hero-actions">
                    {(fg.linksAndCtas.length ? fg.linksAndCtas : ['VIEW MODULE']).slice(0, 3).map((cta) => (
                      <button key={cta} type="button" className="site00-twin-v2-dom__cta">
                        {cta}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="site00-twin-v2-dom__hero-media" aria-label="Editorial media region">
                  <div className="site00-twin-v2-dom__hero-media-fill" />
                  <span className="site00-twin-v2-dom__ndx-mark" aria-hidden>
                    NDX
                  </span>
                </div>
                <ul className="site00-twin-v2-dom__hero-utility" style={typeStyle(pkg.blueprint, 'body')}>
                  {fg.metrics.slice(0, 3).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </SectionShell>
          );
        }

        if (key === 'progress') {
          return (
            <SectionShell key={sec.id} sectionId={sec.id} label={sec.label} bounds={sec.bounds}>
              <div className="site00-twin-v2-dom__progress" data-exec-object-id={`${sec.id}-progress-dom`}>
                <div className="site00-twin-v2-dom__progress-head">
                  <span style={typeStyle(pkg.blueprint, 'metric')}>{fg.progress[0] ?? 'PROJECT PROGRESS'}</span>
                  <strong>{progressPct}%</strong>
                </div>
                <div className="site00-twin-v2-dom__progress-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="site00-twin-v2-dom__progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="site00-twin-v2-dom__phase" style={typeStyle(pkg.blueprint, 'body')}>
                  {fg.currentPhase.join(' · ') || fg.progress[1] || 'Phase active'}
                </p>
                <ul className="site00-twin-v2-dom__steps">
                  {fg.progress.slice(0, 5).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </SectionShell>
          );
        }

        if (key === 'metrics') {
          return (
            <SectionShell key={sec.id} sectionId={sec.id} label={sec.label} bounds={sec.bounds}>
              <div className="site00-twin-v2-dom__metrics">
                {(fg.metrics.length ? fg.metrics : ['—']).slice(0, 6).map((m, i) => {
                  const { value, label } = splitMetric(m);
                  return (
                    <div key={`${m}-${i}`} className="site00-twin-v2-dom__metric-cell" data-exec-object-id={`${sec.id}-metric-${i}`}>
                      <span className="site00-twin-v2-dom__metric-value" style={typeStyle(pkg.blueprint, 'headline')}>
                        {value}
                      </span>
                      <span className="site00-twin-v2-dom__metric-label" style={typeStyle(pkg.blueprint, 'metric')}>
                        {label || m}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionShell>
          );
        }

        if (key === 'focus') {
          return (
            <SectionShell key={sec.id} sectionId={sec.id} label={sec.label} bounds={sec.bounds}>
              <div className="site00-twin-v2-dom__focus">
                <p className="site00-twin-v2-dom__focus-eyebrow" style={typeStyle(pkg.blueprint, 'metric')}>
                  CURRENT FOCUS
                </p>
                <h3 style={typeStyle(pkg.blueprint, 'headline')}>{fg.currentFocus[0] ?? 'Active workstream'}</h3>
                <ul>
                  {fg.currentFocus.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button type="button" className="site00-twin-v2-dom__cta site00-twin-v2-dom__cta--lime">
                  OPEN FOCUS
                </button>
              </div>
            </SectionShell>
          );
        }

        if (key === 'milestone') {
          return (
            <SectionShell key={sec.id} sectionId={sec.id} label={sec.label} bounds={sec.bounds}>
              <div className="site00-twin-v2-dom__milestone">
                <p style={typeStyle(pkg.blueprint, 'metric')}>NEXT MILESTONE</p>
                <h3 style={typeStyle(pkg.blueprint, 'headline')}>{fg.milestone[0] ?? 'Upcoming gate'}</h3>
                <ul>
                  {fg.milestone.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </SectionShell>
          );
        }

        if (key === 'activity') {
          return (
            <SectionShell key={sec.id} sectionId={sec.id} label={sec.label} bounds={sec.bounds}>
              <div className="site00-twin-v2-dom__activity">
                <header className="site00-twin-v2-dom__activity-head">
                  <h3 style={typeStyle(pkg.blueprint, 'headline')}>RECENT ACTIVITY</h3>
                  <button type="button" className="site00-twin-v2-dom__link-btn">
                    VIEW ALL
                  </button>
                </header>
                <ul className="site00-twin-v2-dom__activity-rows">
                  {fg.recentActivity.map((row) => {
                    const parts = activityParts(row);
                    return (
                      <li key={row} data-exec-object-id={`${sec.id}-act-${row.slice(0, 8)}`}>
                        <span className="site00-twin-v2-dom__activity-actor">{parts.actor}</span>
                        <span className="site00-twin-v2-dom__activity-action">{parts.action}</span>
                        {parts.when ? <time>{parts.when}</time> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </SectionShell>
          );
        }

        return null;
      })}
    </div>
  );
}
