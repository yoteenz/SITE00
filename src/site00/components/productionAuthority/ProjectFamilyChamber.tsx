/**
 * DESIGN workspace body for INGESTED projects (P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1).
 * Same host chamber geometry (pxa-* classes), project data inside. Every panel opens the PROJECT INSPECTOR.
 */

import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { ProductionDesignMode } from '../../config/production-authority-registry';
import { ASSET_CLASSES, ASSET_FIRST_PIPELINE } from '../../../../shared/site00-product-families/assetFirstPolicy.js';
import { evaluateFamilyCompleteness, FAMILY_IMPLEMENTATION_GATE_KEYS } from '../../../../shared/site00-product-families/familyGate.js';
import type { IngestedProjectRecord } from '../../../../shared/site00-project-ingestion/types.js';
import type { ProjectFamilyEntry } from '../../../projects/families';
import { AUTHORITY_ASSETS } from './authorityAssets';
import { designStage } from './designPackAssets';
import { Sec } from './primitives';
import { buildProjectChamber, familyGateFor, PROJECT_INSPECT_TABS, type ProjectChamberPanel, type ProjectInspectTab } from './projectFamilyChamber';
import '../../styles/site00-production-project-family.css';

const pub = (p: string | null | undefined) => (p ? p.replace(/^public/, '') : null);

function PanelVis({ vis }: { vis: ProjectChamberPanel['vis'] }) {
  switch (vis.kind) {
    case 'cover':
      return <span className="pxa-vis pxa-pf-vis pxa-pf-vis--cover">{vis.src ? <img src={vis.src} alt="" loading="lazy" data-media-role="DECORATIVE_ART" data-media-scale="PLATE" /> : null}</span>;
    case 'authorities':
      return (
        <span className="pxa-vis pxa-pf-vis pxa-pf-vis--auth" data-count={vis.srcs.length}>
          {vis.srcs.map((s, i) => (
            <img key={`${s}-${i}`} src={s} alt="" loading="lazy" data-media-role="DECORATIVE_ART" data-media-scale="PLATE" data-media-crop="DESIGN_CHAMBER_MINIATURE" />
          ))}
        </span>
      );
    case 'palette':
      return (
        <span className="pxa-vis pxa-pf-vis pxa-pf-vis--palette" data-testid="project-palette">
          {vis.chips.map((c) => (
            <i key={c.hex} style={{ background: c.hex }} title={`${c.label} ${c.hex}`} />
          ))}
        </span>
      );
    case 'type':
      return (
        <span className="pxa-vis pxa-vis--type pxa-pf-vis--type">
          <b>{vis.big}</b>
          <small>{vis.small}</small>
        </span>
      );
    case 'tree':
      return (
        <ul className="pxa-vis pxa-pf-vis pxa-pf-vis--tree">
          {vis.items.map((t) => (
            <li key={t.id} data-ok={t.ok ? 'true' : 'false'}>
              <em>{t.id}</em>
              <span>{t.label}</span>
            </li>
          ))}
        </ul>
      );
    case 'gate':
      return (
        <ul className="pxa-vis pxa-pf-vis pxa-pf-vis--gate">
          {vis.items.map((t) => (
            <li key={t.id} data-value={t.value}>
              <span>{t.id}</span>
              <b>{t.value}</b>
            </li>
          ))}
        </ul>
      );
    case 'count':
      return (
        <span className="pxa-vis pxa-pf-vis pxa-pf-vis--count">
          <b>{vis.value}</b>
          <small>{vis.label}</small>
        </span>
      );
    default:
      return null;
  }
}

function inspectHref(slug: string, mode: ProductionDesignMode, tab: ProjectInspectTab) {
  return `/production/${slug}/design?mode=${mode}&inspect=${tab}`;
}

function Panel({ panel, side, slug, mode }: { panel: ProjectChamberPanel; side: 'left' | 'right'; slug: string; mode: ProductionDesignMode }) {
  return (
    <article className={`pxa-panel pxa-panel--${side} pxa-pf-panel`} data-panel={panel.n} data-testid={`design-panel-${panel.n}`} data-project-panel={panel.inspect}>
      <header>
        <em>{panel.n}</em>
        <b>{panel.title}</b>
        <small>{panel.sub}</small>
        <i className="pxa-panel__more" aria-hidden>
          ···
        </i>
      </header>
      <div className={`pxa-panel__body${panel.rows.length ? ' has-rows' : ''}`}>
        <span className="pxa-panel__viswrap">
          <PanelVis vis={panel.vis} />
        </span>
        {panel.rows.length ?
          <ul className="pxa-panel__rows">
            {panel.rows.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        : null}
      </div>
      <Link className="pxa-pf-panel__link" to={panel.to ?? inspectHref(slug, mode, panel.inspect)} aria-label={`${panel.title} — inspect`} />
    </article>
  );
}

export function ProjectFamilyChamber({ mode, project, families }: { mode: ProductionDesignMode; project: IngestedProjectRecord; families: ProjectFamilyEntry[] }) {
  const { projectSlug = project.slug } = useParams<{ projectSlug: string }>();
  const [params] = useSearchParams();
  const cfg = buildProjectChamber(mode, project, families);
  const left = cfg.panels.slice(0, 2);
  const right = cfg.panels.slice(2);
  const inspect = params.get('inspect') as ProjectInspectTab | null;
  return (
    <div className="pxa-design pxa-pf" data-testid="design-chamber-screen" data-mode={mode} data-project={project.slug} data-project-type={project.projectType}>
      <div className="pxa-chamber" data-testid="design-chamber" data-mode={mode}>
        <span className="pxa-chamber__atrium" aria-hidden>
          <img className="pxa-chamber__atrium-art" alt="" src={AUTHORITY_ASSETS.designAtrium} data-media-role="DECORATIVE_ART" data-media-scale="PLATE" data-media-crop="DESIGN_CHAMBER_ART" />
          <i className="pxa-chamber__ring pxa-chamber__ring--1" />
          <i className="pxa-chamber__ring pxa-chamber__ring--2" />
          <i className="pxa-chamber__ring pxa-chamber__ring--3" />
          <i className="pxa-chamber__floor" />
        </span>
        <span className="pxa-chamber__wash" aria-hidden />
        <div className="pxa-chamber__stage">
          <div className="pxa-chamber__col pxa-chamber__col--left">
            {left.map((p) => (
              <Panel key={p.n} panel={p} side="left" slug={projectSlug} mode={mode} />
            ))}
          </div>
          <section className="pxa-overview-panel pxa-pf-overview" data-testid="design-overview">
            <header>
              <b>
                <em>{cfg.label}</em> / {cfg.overviewTitle.split('/ ')[1] ?? project.displayName}
              </b>
              <span aria-hidden>···</span>
            </header>
            <div className="pxa-overview-panel__body">
              <span className="pxa-overview-panel__art pxa-pf-overview__art">
                {cfg.art ? <img src={cfg.art} alt={`${project.displayName} PARENT AUTHORITY (REFERENCE)`} loading="lazy" data-media-role="DECORATIVE_ART" data-media-scale="PLATE" data-media-crop="OVERVIEW_BACKDROP" /> : null}
                <p>{cfg.lede}</p>
              </span>
              <div className="pxa-overview-panel__side">
                <span className="pxa-overview-panel__intro">
                  {cfg.intro.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </span>
                {cfg.caption ? <small className="pxa-overview-panel__caption">{cfg.caption}</small> : null}
              </div>
              <Link className="pxa-overview-panel__go" to={inspectHref(projectSlug, mode, mode === 'brand' ? 'brand' : mode === 'assets' ? 'assets' : mode === 'compiler' ? 'gate' : 'screens')} aria-label="OPEN PROJECT INSPECTOR">
                »
              </Link>
            </div>
          </section>
          <div className="pxa-chamber__col pxa-chamber__col--right">
            {right.map((p) => (
              <Panel key={p.n} panel={p} side="right" slug={projectSlug} mode={mode} />
            ))}
          </div>
        </div>
        <footer className="pxa-chamber__edge">
          <span>{cfg.edgeLeft}</span>
          <span>{project.displayName} / PROJECT CONTEXT</span>
          <span>{cfg.edgeRight}</span>
        </footer>
      </div>
      <Sec title="DESIGN PIPELINE" to={inspectHref(projectSlug, mode, 'gate')} className="pxa-pipeline" testId="design-pipeline">
        <ol className="pxa-pipeline__steps" data-count={cfg.pipeline.length}>
          {cfg.pipeline.map((s, i) => (
            <li key={s.title} className={s.state === 'ACTIVE' ? 'is-active' : undefined} data-state={s.state}>
              <img className="pxa-stage" src={designStage(i).src} alt="" data-stage={designStage(i).id} loading="lazy" data-media-role="OTHER_DECORATIVE" data-media-scale="PLATE" />
              <em>{String(i + 1).padStart(2, '0')}</em>
              <b>{s.title}</b>
              <small>{s.sub}</small>
            </li>
          ))}
        </ol>
      </Sec>
      <Sec title="ON YOUR TABLE" hint={`${project.displayName} — ITEMS THAT NEED YOUR ATTENTION`} to={inspectHref(projectSlug, mode, 'screens')} className="pxa-table-sec" testId="design-table">
        <div className="pxa-tablecards" data-count={cfg.table.length}>
          {cfg.table.map((t) => (
            <Link key={t.title} to={t.to ?? inspectHref(projectSlug, mode, t.inspect)} className="pxa-tcard" data-testid="design-table-card" data-live={t.to ? 'viewport' : undefined}>
              <span className="pxa-tcard__img pxa-pf-tcard__img" data-media-fit="UI_CAPTURE_CONTAIN" data-media-role="UI_SCREENSHOT" data-media-scale="TILE" style={t.plate ? { backgroundImage: `url(${t.plate})` } : undefined} aria-hidden />
              <span className="pxa-tcard__copy">
                <b>{t.title}</b>
                <small>{t.sub}</small>
              </span>
              <i className="pxa-tcard__flag" aria-hidden />
              <span className="pxa-tcard__cta">{t.cta} ›</span>
            </Link>
          ))}
        </div>
      </Sec>
      {inspect && (PROJECT_INSPECT_TABS as readonly string[]).includes(inspect) ?
        <ProjectInspector project={project} families={families} tab={inspect} mode={mode} slug={projectSlug} />
      : null}
    </div>
  );
}

/* ─────────────────── PROJECT INSPECTOR (host overlay) ─────────────────── */

function viewportHref(slug: string, screen: string, extra?: string) {
  return `/production/${slug}/design?mode=viewport&screen=${encodeURIComponent(screen)}${extra ? `&${extra}` : ''}`;
}

export function ProjectInspector({ project, families, tab, mode, slug }: { project: IngestedProjectRecord; families: ProjectFamilyEntry[]; tab: ProjectInspectTab; mode: ProductionDesignMode; slug: string }) {
  const fam = families[0] ?? null;
  const c = fam?.contract ?? null;
  const gate = fam ? familyGateFor(fam) : null;
  const close = `/production/${slug}/design?mode=${mode}`;
  const boundIds = new Set(fam?.coverage.interactions ?? []);
  return (
    <div className="pxa-pf-inspect" role="dialog" aria-modal="true" aria-label={`${project.displayName} inspector`} data-testid="project-inspector" data-tab={tab}>
      <Link className="pxa-pf-inspect__scrim" to={close} aria-label="Close inspector" />
      <section className="pxa-pf-inspect__panel">
        <header className="pxa-pf-inspect__head">
          <i aria-hidden />
          <span>
            <small>
              PROJECT INSPECTOR · {project.projectType} / {project.ownership} · {c ? `${c.familyId} ${c.familyName}` : 'NO FAMILY'}
            </small>
            <b>{project.displayName}</b>
          </span>
          <Link to={close} className="pxa-pf-inspect__close" aria-label="Close inspector" data-testid="project-inspector-close">
            ×
          </Link>
        </header>
        <nav className="pxa-pf-inspect__tabs" aria-label="Inspector tabs">
          {PROJECT_INSPECT_TABS.map((t) => (
            <Link key={t} to={`/production/${slug}/design?mode=${mode}&inspect=${t}`} className={t === tab ? 'is-active' : undefined} aria-current={t === tab ? 'page' : undefined} data-testid={`project-inspector-tab-${t}`} replace>
              {t.toUpperCase()}
            </Link>
          ))}
        </nav>
        <div className="pxa-pf-inspect__body" data-testid={`project-inspector-${tab}`}>
          {tab === 'brand' ?
            <>
              <div className="pxa-pf-kv">
                <span>PRODUCT CLASS</span>
                <b>{project.productClass}</b>
                <span>TAGLINE</span>
                <b>{project.brand.tagline}</b>
                <span>VOICE</span>
                <b>{project.brand.voice}</b>
                <span>PRIMARY PLATFORM</span>
                <b>{project.primaryPlatform.replace(/_/g, ' ')}</b>
                <span>STATUS</span>
                <b>{project.status.replace(/_/g, ' ')}</b>
                <span>STAGE</span>
                <b>
                  {project.currentFamily.replace(/_/g, ' ')} · {project.currentProductionStage.replace(/_/g, ' ')}
                </b>
              </div>
              <h3>PALETTE</h3>
              <table>
                <tbody>
                  {project.brand.palette.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <i className="pxa-pf-chip" style={{ background: p.hex }} />
                      </td>
                      <td>{p.label}</td>
                      <td>{p.hex}</td>
                      <td>{p.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3>TYPOGRAPHY (PROJECT-SCOPED FONTS)</h3>
              <table>
                <tbody>
                  {project.brand.typography.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.family}</td>
                      <td>{t.description}</td>
                      <td>{t.license}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3>RULES</h3>
              <ul className="pxa-pf-list">
                {project.brand.rules.map((r) => (
                  <li key={r.id}>
                    <b>{r.hard ? 'HARD' : 'SOFT'}</b> {r.rule}
                  </li>
                ))}
              </ul>
              <h3>LOGO</h3>
              <p className="pxa-pf-note">
                {project.brand.coverFile ? <img src={project.brand.coverFile} alt="" className="pxa-pf-logo" data-media-role="LOGO_MARK" data-media-scale="TILE" /> : null}
                {project.brand.logo.rule}
              </p>
            </>
          : null}
          {tab === 'screens' && c ?
            <table data-testid="project-inspector-screen-table">
              <thead>
                <tr>
                  <th>REF</th>
                  <th>SCREEN</th>
                  <th>ROLE</th>
                  <th>ROUTE</th>
                  <th>APPROVAL</th>
                  <th>BUILD</th>
                  <th>STATES</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {c.screens.map((s) => (
                  <tr key={s.id} data-screen={s.id}>
                    <td>{s.authorityFile ? <img src={pub(s.authorityFile)!} alt="" className="pxa-pf-thumb" loading="lazy" data-media-role="UI_SCREENSHOT" data-media-scale="CHIP" /> : null}</td>
                    <td>
                      <b>{s.id}</b> {s.name}
                    </td>
                    <td>{s.role}</td>
                    <td>/{s.runtimeRoute}</td>
                    <td>{s.approvalStatus.replace(/_/g, ' ')}</td>
                    <td>{s.implementationStatus.replace(/_/g, ' ')}</td>
                    <td>{s.stateIds.length}</td>
                    <td>
                      <Link to={viewportHref(slug, s.id)} data-testid="project-inspector-open-screen">
                        OPEN ›
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          : null}
          {tab === 'states' && c ?
            <table>
              <thead>
                <tr>
                  <th>STATE</th>
                  <th>SCREEN</th>
                  <th>AUTHORITY SHEET</th>
                  <th>RUNTIME</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {c.states.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <b>{s.label}</b>
                    </td>
                    <td>{s.screenId}</td>
                    <td>{(s.authorityFile ?? '').split('/').pop()}</td>
                    <td>{s.implemented ? 'IMPLEMENTED' : 'MISSING'}</td>
                    <td>
                      <Link to={viewportHref(slug, s.screenId, `state=${encodeURIComponent(s.id.slice(s.screenId.length + 1).toLowerCase())}`)}>OPEN ›</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          : null}
          {tab === 'interactions' && c ?
            <table>
              <thead>
                <tr>
                  <th>INTERACTION</th>
                  <th>TRIGGER</th>
                  <th>TYPE</th>
                  <th>COMPONENT</th>
                  <th>RESULT</th>
                  <th>BOUND</th>
                </tr>
              </thead>
              <tbody>
                {c.interactions.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <b>{i.id}</b>
                    </td>
                    <td>{i.trigger}</td>
                    <td>{i.type.replace(/_/g, ' ').toUpperCase()}</td>
                    <td>{i.componentRef}</td>
                    <td>{i.navigationResult.toUpperCase()}</td>
                    <td>{boundIds.has(i.id) ? 'YES' : 'NO'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          : null}
          {tab === 'components' && c && fam ?
            <table>
              <thead>
                <tr>
                  <th>MANIFEST COMPONENT</th>
                  <th>SCOPE</th>
                  <th>STRUCTURAL PRIMITIVE</th>
                  <th>RUNTIME COMPONENT</th>
                </tr>
              </thead>
              <tbody>
                {[...c.globalComponents, ...c.familyComponents].map((k) => (
                  <tr key={`${k.scope}-${k.id}`}>
                    <td>
                      <b>{k.id}</b>
                    </td>
                    <td>{k.scope}</td>
                    <td>{fam.componentRuntime[k.id]?.primitive ?? k.primitive}</td>
                    <td>{fam.componentRuntime[k.id] ? `${fam.componentRuntime[k.id]!.component}${fam.componentRuntime[k.id]!.variant ? ` (${fam.componentRuntime[k.id]!.variant!.toUpperCase()})` : ''}` : 'UNMAPPED'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          : null}
          {tab === 'assets' && c ?
            <>
              <div className="pxa-pf-kv">
                <span>POLICY</span>
                <b>{c.assetPolicy.resolution.replace(/_/g, ' ')}</b>
                <span>ASSET-FIRST REQUIRED (LATER FAMILIES)</span>
                <b>YES</b>
                <span>REASON</span>
                <b>{c.assetPolicy.reason ?? '—'}</b>
              </div>
              <h3>ASSET REQUIREMENTS</h3>
              <table>
                <tbody>
                  {[...c.globalAssets, ...c.familyAssets].map((a) => (
                    <tr key={a.id} data-asset-status={a.status}>
                      <td>
                        <b>{a.id}</b>
                      </td>
                      <td>{a.assetClass.replace(/_/g, ' ')}</td>
                      <td>{a.status.replace(/_/g, ' ')}</td>
                      <td>{a.source}</td>
                      <td>{a.notes ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3>EXCLUDED FROM RUNTIME</h3>
              <ul className="pxa-pf-list">
                {c.assetPolicy.excludedSources.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <h3>ASSET-FIRST CLASSES</h3>
              <ul className="pxa-pf-list pxa-pf-list--inline">
                {ASSET_CLASSES.map((x) => (
                  <li key={x}>{x.replace(/_/g, ' ')}</li>
                ))}
              </ul>
              <h3>ASSET-FIRST PIPELINE</h3>
              <ol className="pxa-pf-list pxa-pf-list--inline">
                {ASSET_FIRST_PIPELINE.map((x, i) => (
                  <li key={x}>
                    {String(i + 1).padStart(2, '0')} {x.replace(/_/g, ' ')}
                  </li>
                ))}
              </ol>
            </>
          : null}
          {tab === 'gate' && c && gate ?
            <>
              <h3>IMPLEMENTATION GATE — SCREEN COMPLETE ≠ FAMILY COMPLETE</h3>
              <table data-testid="project-inspector-gate">
                <tbody>
                  {FAMILY_IMPLEMENTATION_GATE_KEYS.map((k) => (
                    <tr key={k} data-gate={gate.gate[k]}>
                      <td>
                        <b>{k.replace(/_/g, ' ')}</b>
                      </td>
                      <td>{gate.gate[k].replace(/_/g, ' ')}</td>
                      <td>{(gate.missing[k] ?? []).join(', ')}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <b>IMPLEMENTATION READY</b>
                    </td>
                    <td>{gate.implementationReady ? 'YES' : 'NO'}</td>
                    <td />
                  </tr>
                  <tr>
                    <td>
                      <b>FAMILY COMPLETE</b>
                    </td>
                    <td>{gate.familyComplete ? 'YES' : 'NO'}</td>
                    <td>{c.founderApproval.note}</td>
                  </tr>
                </tbody>
              </table>
              <h3>COMPLETENESS CONTRACT</h3>
              <ul className="pxa-pf-list pxa-pf-list--inline">
                {Object.entries(evaluateFamilyCompleteness(c, gate)).map(([k, v]) => (
                  <li key={k} data-ok={v ? 'true' : 'false'}>
                    {v ? '✓' : '○'} {k.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </>
          : null}
          {tab === 'budget' && c ?
            <>
              <div className="pxa-pf-kv">
                <span>GENERATION</span>
                <b>{c.generationSettings ? `${c.generationSettings.model} · ${c.generationSettings.resolution} · ${c.generationSettings.aspect} · AUTO-ENHANCE ${c.generationSettings.autoEnhance ? 'ON' : 'OFF'}` : '—'}</b>
                <span>CREDITS / GENERATION</span>
                <b>{c.generationSettings?.creditsPerGeneration ?? '—'}</b>
              </div>
              {c.generationBudget ?
                <table data-testid="project-inspector-budget">
                  <tbody>
                    {(
                      [
                        ['FAMILY', c.generationBudget.familyId],
                        ['TRACKING', c.generationBudget.tracking.replace(/_/g, ' ')],
                        ['CREDITS BEFORE', c.generationBudget.creditsBefore ?? 'NOT CAPTURED'],
                        ['CREDITS AFTER', c.generationBudget.creditsAfter ?? 'NOT CAPTURED'],
                        ['FAMILY CREDITS', c.generationBudget.familyCredits],
                        ['ASSET GENERATIONS', c.generationBudget.assetGenerations],
                        ['SCREEN GENERATIONS', c.generationBudget.screenGenerations],
                        ['INTERACTION GENERATIONS', c.generationBudget.interactionGenerations],
                        ['RECOVERY GENERATIONS', c.generationBudget.recoveryGenerations],
                        ['CUMULATIVE CREDITS', c.generationBudget.cumulativeCredits],
                        ['SAFE CEILING REMAINING', c.generationBudget.safeCeilingRemaining],
                      ] as [string, string | number][]
                    ).map(([k, v]) => (
                      <tr key={k}>
                        <td>
                          <b>{k}</b>
                        </td>
                        <td>{typeof v === 'number' ? v.toLocaleString('en-US') : v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              : null}
              <p className="pxa-pf-note">{c.generationBudget?.notes}</p>
            </>
          : null}
          {tab === 'claims' && fam ?
            <table data-testid="project-inspector-claims">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CLAIM</th>
                  <th>STATUS</th>
                  <th>CATEGORY</th>
                  <th>WHY</th>
                </tr>
              </thead>
              <tbody>
                {fam.claims.map((cl) => (
                  <tr key={cl.id} data-claim-status={cl.status}>
                    <td>
                      <b>{cl.id}</b>
                    </td>
                    <td>{cl.text}</td>
                    <td>{cl.status.replace(/_/g, ' ')}</td>
                    <td>{cl.category.replace(/_/g, ' ')}</td>
                    <td>{cl.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          : null}
        </div>
      </section>
    </div>
  );
}
