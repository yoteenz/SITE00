/**
 * Work-domain projections of ONE project's production graph:
 *
 *   ProjectDesignSurface      DESIGN      site / digital-location design — method 01–08, page families, authorities
 *   ProjectExperienceSurface  EXPERIENCE  world-building — world, scenes, spatial objects, interactions
 *   ExpressionDomainGate      EXPRESSION  the project's expression routes only when EXPRESSION is established
 *
 * A domain the project has not established renders the project-scoped NOT_ESTABLISHED state — never another
 * project's surface (GLOBAL_TAB_AVAILABLE ≠ PROJECT_DOMAIN_ESTABLISHED).
 */
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  DESIGN_METHOD,
  childrenOf,
  designMethodOf,
  domainNodes,
  experienceKinds,
  isDesignMethodId,
  resolveDesignMethodPanelMedia,
  scopedTabHref,
  topLevelNodes,
  type ArtifactRecord,
  type ProductionNode,
  type ProjectProductionGraph,
  type WorkDomain,
} from '../../../../../shared/site00-production-graph/index.js';
import { PanelMediaSlot } from './PanelMediaSlot';
import { useProjectGraphData } from '../ProductionAuthorityData';
import { ProductionAuthorityFrame } from '../ProductionAuthorityFrame';
import { IaEmpty } from '../iaKit';
import { ArtifactMedia, BlockerRow, CountLink, DecisionRow, GraphPanel, NodeRow, STAGE_WORD } from './GraphPrimitives';
import { DomainEmptyState } from './ProjectScopeStates';

const libraryArtifactHref = (g: ProjectProductionGraph, id: string) => `${scopedTabHref('LIBRARY', g.project_id)}&artifact=${encodeURIComponent(id)}`;
const inboxItemHref = (g: ProjectProductionGraph, id: string) => `${scopedTabHref('INBOX', g.project_id)}&item=${encodeURIComponent(id)}`;
const activityNodeHref = (g: ProjectProductionGraph, id: string) => `${scopedTabHref('ACTIVITY', g.project_id)}&node=${encodeURIComponent(id)}`;

/** The project's NOT_ESTABLISHED state for a work domain (null when the domain is established). */
function NotEstablished({ g, domain }: { g: ProjectProductionGraph; domain: WorkDomain }) {
  if (g.domains[domain].established) return null;
  return (
    <div className="pgx" data-testid={`project-${domain.toLowerCase()}`} data-project={g.project_id} data-established="false">
      <DomainEmptyState projectId={g.project_id} projectName={g.project_name} state={g.domains[domain]} />
    </div>
  );
}

function ArtifactTiles({ g, artifacts, testId }: { g: ProjectProductionGraph; artifacts: readonly ArtifactRecord[]; testId: string }) {
  return (
    <ul className="pgx-tiles" data-testid={testId}>
      {artifacts.map((a) => (
        <li key={a.artifact_id}>
          <Link to={libraryArtifactHref(g, a.artifact_id)} className="pgx-tile" data-project={a.project_id} data-status={a.status}>
            <ArtifactMedia artifact={a} />
            <b>{a.label}</b>
            <small>
              {a.artifact_type.replace(/_/g, ' ')} · {a.status.replace('_', ' ')}
            </small>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NodeFacts({ g, node }: { g: ProjectProductionGraph; node: ProductionNode }) {
  return (
    <dl className="pgx-facts">
      <dt>PROJECT</dt>
      <dd>{g.project_name}</dd>
      <dt>TYPE</dt>
      <dd>{node.node_type.replace(/_/g, ' ')}</dd>
      <dt>STAGE</dt>
      <dd>{STAGE_WORD(node.current_stage)}</dd>
      <dt>STATUS</dt>
      <dd>{node.status_detail}</dd>
      <dt>AUTHORITY</dt>
      <dd>{node.authority_status.replace(/_/g, ' ')}</dd>
      <dt>APPROVAL</dt>
      <dd>{node.approval_status.replace(/_/g, ' ')}</dd>
      <dt>IMPLEMENTATION</dt>
      <dd>{node.implementation_status.replace(/_/g, ' ')}</dd>
      <dt>QA</dt>
      <dd>{node.qa_status.replace(/_/g, ' ')}</dd>
      {node.viewport_scope.length ?
        <>
          <dt>VIEWPORTS</dt>
          <dd>{node.viewport_scope.join(' · ')}</dd>
        </>
      : null}
      {node.actor_scope.length ?
        <>
          <dt>ACTOR MODES</dt>
          <dd>{node.actor_scope.join(' · ')}</dd>
        </>
      : null}
      <dt>NEXT</dt>
      <dd>{node.next_required_action ?? '—'}</dd>
      <dt>SOURCE</dt>
      <dd>{node.source_truth_ids.map((id) => g.sources.find((s) => s.source_id === id)?.label ?? id).join(' · ')}</dd>
    </dl>
  );
}

/** Decisions, blockers, children and artifacts of one node — shared by the DESIGN family and EXPERIENCE scene views. */
function NodeDetail({ g, node, open, testId }: { g: ProjectProductionGraph; node: ProductionNode; open?: ReactNode; testId: string }) {
  const kids = childrenOf(g, node.node_id);
  const scope = new Set([node.node_id, ...kids.map((k) => k.node_id)]);
  const decisions = g.decisions.filter((d) => scope.has(d.node_id));
  const blockers = [node, ...kids].flatMap((n) => n.blockers);
  const arts = g.artifacts.filter((a) => !!a.source_node_id && scope.has(a.source_node_id));
  return (
    <>
      <GraphPanel title={node.label} testId={testId} className="pgx-span">
        <NodeFacts g={g} node={node} />
        <div className="pgx-actions">
          {open}
          <Link to={activityNodeHref(g, node.node_id)} className="iax-btn iax-btn--ghost" data-testid={`${testId}-activity`}>
            NODE HISTORY
          </Link>
        </div>
      </GraphPanel>
      <div className="pgx-grid">
        <GraphPanel title="DECISIONS" count={decisions.length} testId={`${testId}-decisions`}>
          {decisions.length ?
            <ul className="pgx-rows">
              {decisions.map((d) => (
                <DecisionRow key={d.item_id} item={d} graph={g} to={inboxItemHref(g, d.item_id)} actions={d.state === 'NEEDS_YOU'} />
              ))}
            </ul>
          : <IaEmpty title="NO DECISION RECORDED ON THIS NODE" testId={`${testId}-decisions-empty`} />}
        </GraphPanel>
        <GraphPanel title="BLOCKERS" count={blockers.length} testId={`${testId}-blockers`}>
          {blockers.length ?
            <ul className="pgx-rows">
              {blockers.map((b) => (
                <BlockerRow key={b.blocker_id} blocker={b} graph={g} />
              ))}
            </ul>
          : <IaEmpty title="NOT BLOCKED" testId={`${testId}-blockers-empty`} />}
        </GraphPanel>
        {kids.length ?
          <GraphPanel title="CHILD NODES" count={kids.length} testId={`${testId}-children`} className="pgx-span">
            <ul className="pgx-rows">
              {kids.map((k) => (
                <NodeRow key={k.node_id} node={k} graph={g} to={activityNodeHref(g, k.node_id)} />
              ))}
            </ul>
          </GraphPanel>
        : null}
        <GraphPanel title="AUTHORITIES & ARTIFACTS" count={arts.length} action={{ to: scopedTabHref('LIBRARY', g.project_id), label: 'LIBRARY' }} testId={`${testId}-artifacts`} className="pgx-span">
          {arts.length ?
            <ArtifactTiles g={g} artifacts={arts} testId={`${testId}-tiles`} />
          : <IaEmpty title="NO ARTIFACT RECORDED FOR THIS NODE" body="No authority, reference or asset is recorded yet — nothing from another project is shown in its place." testId={`${testId}-artifacts-empty`} />}
        </GraphPanel>
      </div>
    </>
  );
}

/* ───────────────────────────────────────────── DESIGN ────────────────────────────────────────────── */

export function ProjectDesignSurface({ modes = [] }: { modes?: readonly string[] }) {
  const g = useProjectGraphData();
  const [params] = useSearchParams();
  if (!g) return null;
  const empty = <NotEstablished g={g} domain="DESIGN" />;
  if (!g.domains.DESIGN.established) return empty;
  const pid = g.project_id;
  const base = scopedTabHref('DESIGN', pid);
  const nodes = domainNodes(g, 'DESIGN');
  const families = topLevelNodes(g, 'DESIGN');
  const familyParam = params.get('family');
  const family = familyParam ? (families.find((n) => n.family_id === familyParam || n.node_id === familyParam) ?? null) : null;

  if (familyParam) {
    return (
      <div className="pgx" data-testid="project-design" data-project={pid} data-family={family?.family_id ?? familyParam}>
        <Link to={base} className="iax-viewall" data-testid="project-design-back">
          ← {g.project_name} DESIGN
        </Link>
        {family ?
          <NodeDetail
            g={g}
            node={family}
            testId="project-design-family"
            open={
              <>
                {modes.includes('brand') ?
                  <Link to={`${base}?mode=surfaces`} className="iax-btn iax-btn--line" data-testid="project-design-open-chamber">
                    OPEN DESIGN CHAMBER
                  </Link>
                : null}
                {modes.includes('viewport') && family.implementation_status === 'IMPLEMENTED' && family.family_id ?
                  <Link to={`${base}?mode=viewport&family=${encodeURIComponent(family.family_id)}`} className="iax-btn iax-btn--line" data-testid="project-design-open-viewport">
                    OPEN IN VIEWPORT
                  </Link>
                : null}
              </>
            }
          />
        : <IaEmpty title="PAGE FAMILY NOT FOUND" body={`No page family with this id is recorded for ${g.project_name}.`} testId="project-design-family-missing" />}
      </div>
    );
  }

  const methodParam = params.get('method');
  const method = isDesignMethodId(methodParam) ? methodParam : null;
  const atMethod = (id: string) => families.filter((n) => designMethodOf(n) === id);
  const listed = method ? atMethod(method) : families;
  const needs = g.decisions.filter((d) => d.domain === 'DESIGN' && d.state === 'NEEDS_YOU');
  const blocked = families.filter((n) => n.status === 'BLOCKED');
  const review = families.filter((n) => n.status === 'REVIEW_REQUIRED');
  const complete = families.filter((n) => n.status === 'COMPLETE');
  const authorities = g.artifacts.filter((a) => a.artifact_type === 'VISUAL_AUTHORITY' || a.artifact_type === 'REFERENCE_AUTHORITY');
  return (
    <div className="pgx" data-testid="project-design" data-project={pid} data-established="true" data-method={method ?? undefined}>
      <header className="pgx-head">
        <small>DESIGN · {g.project_name} · SITE / DIGITAL-LOCATION AUTHORITY</small>
        <h1>{families.length === 1 ? families[0]!.label : `${families.length} PAGE FAMILIES`}</h1>
        <p>{g.domains.DESIGN.reason}</p>
      </header>
      <div className="pgx-counts" data-testid="project-design-counts">
        <CountLink value={needs.length} label="NEED YOU" sub="design decisions" to={`${scopedTabHref('INBOX', pid)}`} tone="red" testId="project-design-count-needs-you" />
        <CountLink value={blocked.length} label="BLOCKED" sub="families without authority" to={`${scopedTabHref('ACTIVITY', pid, 'blockers')}`} testId="project-design-count-blocked" />
        <CountLink value={review.length} label="IN REVIEW" sub="awaiting a verdict" to={`${scopedTabHref('INBOX', pid)}`} testId="project-design-count-review" />
        <CountLink value={complete.length} label={`OF ${families.length} COMPLETE`} sub="founder approved" to={`${base}?method=08`} testId="project-design-count-complete" />
      </div>
      <GraphPanel title="DESIGN METHOD" count={families.length} testId="project-design-method" className="pgx-span">
        <ol className="pgx-method" data-testid="project-design-method-steps">
          {DESIGN_METHOD.map((m) => {
            const count = m.rule ? null : atMethod(m.id).length;
            const preview = m.rule ? null : resolveDesignMethodPanelMedia(g, m.id);
            const body = (
              <>
                {preview && !m.rule ?
                  <PanelMediaSlot contract={preview} geometry="TILE" className="pgx-method__thumb" testId={`project-design-step-${m.id}-media`} />
                : null}
                <em>{m.id}</em>
                <b>{m.label}</b>
                <strong>{count == null ? 'RULE' : count}</strong>
              </>
            );
            return (
              <li key={m.id} data-step={m.id} data-count={count ?? undefined} className={method === m.id ? 'is-active' : undefined} data-testid={`project-design-step-${m.id}`}>
                {count == null ? body : <Link to={method === m.id ? base : `${base}?method=${m.id}`} replace>{body}</Link>}
              </li>
            );
          })}
        </ol>
      </GraphPanel>
      <div className="pgx-grid">
        <GraphPanel
          title={method ? `${method} ${DESIGN_METHOD.find((m) => m.id === method)!.label}` : 'PAGE FAMILIES'}
          count={listed.length}
          action={method ? { to: base, label: 'ALL FAMILIES' } : undefined}
          testId="project-design-families"
          className="pgx-span"
        >
          {listed.length ?
            <ul className="pgx-rows">
              {listed.map((n) => (
                <NodeRow key={n.node_id} node={n} graph={g} to={`${base}?family=${encodeURIComponent(n.family_id ?? n.node_id)}`} testId="project-design-family-row" />
              ))}
            </ul>
          : <IaEmpty title="NO FAMILY AT THIS STEP" body={`No ${g.project_name} page family sits at this method step.`} testId="project-design-families-empty" />}
        </GraphPanel>
        <GraphPanel title="DESIGN NODES" count={nodes.length} testId="project-design-nodes">
          <div className="pgx-stages">
            {Object.entries(nodes.reduce<Record<string, number>>((acc, n) => ({ ...acc, [n.node_type]: (acc[n.node_type] ?? 0) + 1 }), {})).map(([t, c]) => (
              <span key={t} className="pgx-stage" data-type={t}>
                <b>{c}</b> {t.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </GraphPanel>
        <GraphPanel title="VISUAL AUTHORITIES" count={authorities.length} action={{ to: scopedTabHref('LIBRARY', pid), label: 'LIBRARY' }} testId="project-design-authorities">
          {authorities.length ?
            <ArtifactTiles g={g} artifacts={authorities.slice(0, 8)} testId="project-design-authority-tiles" />
          : <IaEmpty title="NO VISUAL AUTHORITY RECORDED YET" testId="project-design-authorities-empty" />}
        </GraphPanel>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── EXPERIENCE ──────────────────────────────────────────── */

export function ProjectExperienceSurface() {
  const g = useProjectGraphData();
  const [params] = useSearchParams();
  if (!g) return null;
  if (!g.domains.EXPERIENCE.established) return <NotEstablished g={g} domain="EXPERIENCE" />;
  const pid = g.project_id;
  const base = scopedTabHref('EXPERIENCE', pid);
  const nodes = domainNodes(g, 'EXPERIENCE');
  const worlds = topLevelNodes(g, 'EXPERIENCE');
  const scenes = nodes.filter((n) => n.node_type === 'SCENE');
  const kinds = experienceKinds(nodes);
  const sceneParam = params.get('scene');
  const kindParam = params.get('kind');

  if (sceneParam) {
    const scene = nodes.find((n) => n.node_id === sceneParam) ?? null;
    return (
      <div className="pgx" data-testid="project-experience" data-project={pid} data-scene={sceneParam}>
        <Link to={base} className="iax-viewall" data-testid="project-experience-back">
          ← {g.project_name} EXPERIENCE
        </Link>
        {scene ?
          <NodeDetail
            g={g}
            node={scene}
            testId="project-experience-scene"
            open={
              scene.route && scene.route !== base ?
                <Link to={scene.route} className="iax-btn iax-btn--line" data-testid="project-experience-open-live">
                  OPEN LIVE {scene.node_type === 'WORLD' ? 'WORLD' : 'SCENE'}
                </Link>
              : null
            }
          />
        : <IaEmpty title="SPATIAL NODE NOT FOUND" body={`No world, scene or spatial node with this id is recorded for ${g.project_name}.`} testId="project-experience-scene-missing" />}
      </div>
    );
  }

  const kind = kindParam && kinds.some((k) => k.kind === kindParam) ? kindParam : null;
  const listed = kind ? nodes.filter((n) => n.node_type === kind) : scenes.length ? scenes : nodes;
  const worldArts = g.artifacts.filter((a) => worlds.some((w) => w.node_id === a.source_node_id));
  return (
    <div className="pgx" data-testid="project-experience" data-project={pid} data-established="true" data-kind={kind ?? undefined}>
      <header className="pgx-head">
        <small>EXPERIENCE · {g.project_name} · WORLD-BUILDING / SPATIAL</small>
        <h1>{worlds.map((w) => w.label).join(' · ') || g.project_name}</h1>
        <p>{g.domains.EXPERIENCE.reason}</p>
      </header>
      <nav className="pgx-lenses" aria-label="Spatial kinds" data-testid="project-experience-kinds">
        {kinds.map((k) => (
          <Link key={k.kind} to={kind === k.kind ? base : `${base}?kind=${k.kind}`} replace className={kind === k.kind ? 'is-active' : undefined} data-testid={`project-experience-kind-${k.kind.toLowerCase()}`} data-count={k.count}>
            {k.kind.replace(/_/g, ' ')} <em>{k.count}</em>
          </Link>
        ))}
      </nav>
      <div className="pgx-grid">
        {worlds.map((w) => (
          <GraphPanel key={w.node_id} title={w.label} testId="project-experience-world">
            <ul className="pgx-rows">
              <NodeRow node={w} graph={g} to={`${base}?scene=${encodeURIComponent(w.node_id)}`} testId="project-experience-world-row" />
            </ul>
          </GraphPanel>
        ))}
        <GraphPanel title={kind ? kind.replace(/_/g, ' ') : scenes.length ? 'SCENES' : 'SPATIAL NODES'} count={listed.length} action={kind ? { to: base, label: 'ALL SCENES' } : undefined} testId="project-experience-nodes" className="pgx-span">
          <ul className="pgx-rows">
            {listed.map((n) => (
              <NodeRow key={n.node_id} node={n} graph={g} to={`${base}?scene=${encodeURIComponent(n.node_id)}`} testId="project-experience-node-row" />
            ))}
          </ul>
        </GraphPanel>
        {worldArts.length ?
          <GraphPanel title="WORLD AUTHORITIES" count={worldArts.length} action={{ to: scopedTabHref('LIBRARY', pid), label: 'LIBRARY' }} testId="project-experience-authorities" className="pgx-span">
            <ArtifactTiles g={g} artifacts={worldArts.slice(0, 8)} testId="project-experience-authority-tiles" />
          </GraphPanel>
        : null}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── EXPRESSION ──────────────────────────────────────────── */

/**
 * EXPRESSION routes render only for a project whose EXPRESSION domain is established; any other project gets its
 * NOT_ESTABLISHED state inside the same frame (never NDXBOOK casting / storyboard / entry data).
 */
export function ExpressionDomainGate({ children, frame }: { children: ReactNode; frame?: string }) {
  const g = useProjectGraphData();
  if (!g) return null;
  if (!g.domains.EXPRESSION.established) {
    const empty = <NotEstablished g={g} domain="EXPRESSION" />;
    // Routes that bring their own frame get the NOT_ESTABLISHED state inside the shared authority frame.
    return frame ? <ProductionAuthorityFrame screen={frame}>{empty}</ProductionAuthorityFrame> : empty;
  }
  return <>{children}</>;
}

