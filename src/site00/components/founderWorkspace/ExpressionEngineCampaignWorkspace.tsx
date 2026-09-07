/**
 * Expression Engine — full campaign production blueprint workspace.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import type { Entry002ProductionBlueprint } from '../../../../shared/site00-expression-engine/types.js';
import type {
  ExpressionEngineB1Phase1Response,
  ExpressionEngineB1Phase2Response,
} from '../../../../shared/site00-expression-engine/campaignClientTypes.js';
import { site00ProjectContentOperationsCampaignBoardPath } from '../../config/routes';
import { expressionEngineApi } from '../../services/expressionEngineApi';
import { InlineMeta, QuietAction, WorkspaceField } from './WorkspaceCompositionPrimitives';

type EntryTab = '002' | '001';
type SectionId =
  | 'overview'
  | 'world'
  | 'artifact'
  | 'continuity'
  | 'formats'
  | 'production'
  | 'audio'
  | 'platforms'
  | 'routing'
  | 'anchor'
  | 'readiness';

const SECTIONS: Array<{ id: SectionId; label: string; entry: EntryTab | 'both' }> = [
  { id: 'overview', label: 'Overview', entry: 'both' },
  { id: 'world', label: 'World', entry: '002' },
  { id: 'artifact', label: 'Artifact', entry: '002' },
  { id: 'continuity', label: 'Continuity', entry: '002' },
  { id: 'formats', label: 'Formats', entry: '002' },
  { id: 'production', label: 'Production Plan', entry: '002' },
  { id: 'audio', label: 'Audio Plan', entry: '002' },
  { id: 'platforms', label: 'Platform Translations', entry: '002' },
  { id: 'routing', label: 'Provider Routing', entry: '002' },
  { id: 'anchor', label: 'Creative Anchor', entry: '002' },
  { id: 'readiness', label: 'Readiness', entry: 'both' },
];

type Props = {
  projectSlug: string;
};

export function ExpressionEngineCampaignWorkspace({ projectSlug }: Props) {
  const [entryTab, setEntryTab] = useState<EntryTab>('002');
  const [section, setSection] = useState<SectionId>('overview');
  const [phase1, setPhase1] = useState<ExpressionEngineB1Phase1Response | null>(null);
  const [phase2, setPhase2] = useState<ExpressionEngineB1Phase2Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([expressionEngineApi.phase1(), expressionEngineApi.phase2()])
      .then(([p1, p2]) => {
        if (cancelled) return;
        setPhase1(p1);
        setPhase2(p2);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load Expression Engine';
          setError(
            msg.includes('Unexpected token') || msg.includes('<!DOCTYPE')
              ? 'Expression Engine API unavailable — redeploy Railway API from main, or use local dev with npm run dev'
              : msg,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const blueprint = phase2?.blueprint ?? null;
  const visibleSections = useMemo(
    () => SECTIONS.filter((s) => s.entry === 'both' || s.entry === entryTab),
    [entryTab],
  );

  useEffect(() => {
    if (!visibleSections.some((s) => s.id === section)) {
      setSection(visibleSections[0]?.id ?? 'overview');
    }
  }, [visibleSections, section]);

  if (loading) {
    return <p className="site00-expr-engine-panel__meta">Loading Expression Engine blueprint…</p>;
  }

  if (error) {
    return <p className="site00-expr-engine-panel__meta">{error}</p>;
  }

  return (
    <div className="site00-expr-engine-workspace">
      <nav className="site00-expr-engine-workspace__tabs">
        <button
          type="button"
          className={entryTab === '002' ? 'active' : ''}
          onClick={() => setEntryTab('002')}
        >
          ENTRY 002
        </button>
        <button
          type="button"
          className={entryTab === '001' ? 'active' : ''}
          onClick={() => setEntryTab('001')}
        >
          ENTRY 001
        </button>
      </nav>

      <nav className="site00-expr-engine-workspace__sections">
        {visibleSections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={section === s.id ? 'site00-btn site00-btn--primary' : 'site00-btn'}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <WorkspaceField>
        {entryTab === '002' && blueprint ? (
          <Entry002Section section={section} blueprint={blueprint} readiness={phase2!.readiness002} />
        ) : null}
        {entryTab === '001' && phase1 ? <Entry001Section section={section} phase1={phase1} /> : null}
      </WorkspaceField>

      <div className="site00-expr-engine-workspace__footer">
        <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-fws-ingest-link">
          ← CAMPAIGN BOARD
        </Link>
        <QuietAction
          onClick={() => {
            void navigator.clipboard.writeText(JSON.stringify(entryTab === '002' ? phase2 : phase1, null, 2));
          }}
        >
          COPY JSON →
        </QuietAction>
      </div>
    </div>
  );
}

function Entry002Section({
  section,
  blueprint,
  readiness,
}: {
  section: SectionId;
  blueprint: Entry002ProductionBlueprint;
  readiness: ExpressionEngineB1Phase2Response['readiness002'];
}) {
  switch (section) {
    case 'overview':
      return (
        <>
          <h2 className="site00-expr-engine-panel__title">ENTRY 002 — OH, NOW IT WAS FUN?</h2>
          <InlineMeta label="Thesis" value="WHEN CRINGE BECOMES NOSTALGIA." />
          <InlineMeta label="Territory" value={blueprint.territoryName} />
          <InlineMeta label="Lock" value={blueprint.territoryLockStatus} />
          <InlineMeta label="Founder judgment" value={blueprint.founderJudgment} />
          <InlineMeta label="Blueprint status" value={blueprint.status} />
          <InlineMeta label="Assets generated" value={String(blueprint.assetsGenerated)} />
          <InlineMeta label="Dispatch" value={blueprint.creativeAnchorRecommendation.productionDispatch} />
          <p className="site00-expr-engine-panel__copy">{blueprint.worldExpressionSystem.conceptAlignment}</p>
        </>
      );
    case 'world':
      return (
        <BlueprintBlock title="WORLD EXPRESSION SYSTEM">
          <MetaGrid
            rows={[
              ['ID', blueprint.worldExpressionSystem.expressionSystemId],
              ['Typography', blueprint.worldExpressionSystem.typographySystem],
              ['Palette', blueprint.worldExpressionSystem.paletteSystem],
              ['Material', blueprint.worldExpressionSystem.materialSystem],
              ['Imagery', blueprint.worldExpressionSystem.imagerySystem],
              ['Composition', blueprint.worldExpressionSystem.compositionSystem],
              ['Graphic grammar', blueprint.worldExpressionSystem.graphicGrammar],
              ['Motion', blueprint.worldExpressionSystem.motionSystem],
            ]}
          />
          <ListBlock title="Signature behaviors" items={blueprint.worldExpressionSystem.signatureBehaviors} />
          <ListBlock title="Forbidden" items={blueprint.worldExpressionSystem.forbiddenSiblingBehaviors} />
        </BlueprintBlock>
      );
    case 'artifact':
      return (
        <BlueprintBlock title="ENTRY ARTIFACT">
          <MetaGrid
            rows={[
              ['ID', blueprint.entryArtifact.artifactId],
              ['Type', blueprint.entryArtifact.type],
              ['Symbol', blueprint.entryArtifact.symbolicRole],
              ['Continuity', blueprint.entryArtifact.continuityRole],
              ['Formats', blueprint.entryArtifact.formatUsage.join(', ')],
            ]}
          />
          <p className="site00-expr-engine-panel__copy">{blueprint.entryArtifact.visualBrief}</p>
        </BlueprintBlock>
      );
    case 'continuity':
      return (
        <BlueprintBlock title="CONTINUITY GRAPH">
          <ul className="site00-expr-engine-list">
            {blueprint.continuityGraph.nodes.map((n) => (
              <li key={n.nodeId}>
                <strong>{n.label}</strong> ({n.kind}) — {n.description}
                <span className="site00-expr-engine-panel__meta"> · {n.formatRefs.join(', ')}</span>
              </li>
            ))}
          </ul>
        </BlueprintBlock>
      );
    case 'formats':
      return (
        <BlueprintBlock title="FORMAT EXPRESSIONS">
          <ul className="site00-expr-engine-list">
            {blueprint.formatExpressions.map((f) => (
              <li key={f.format}>
                <strong>{f.format}</strong> — {f.role}
                <p className="site00-expr-engine-panel__copy">{f.narrativePurpose}</p>
              </li>
            ))}
          </ul>
        </BlueprintBlock>
      );
    case 'production':
      return (
        <BlueprintBlock title="PRODUCTION PLAN">
          <ul className="site00-expr-engine-list">
            {blueprint.productionPlan.tasks.map((t) => (
              <li key={t.taskId}>
                <strong>{t.taskId}</strong> · {t.format} · {t.taskClass} · <em>{t.status}</em>
                <p className="site00-expr-engine-panel__copy">{t.description}</p>
              </li>
            ))}
          </ul>
        </BlueprintBlock>
      );
    case 'audio':
      return (
        <BlueprintBlock title="AUDIO PLAN">
          <InlineMeta label="Status" value={blueprint.audioPlan.status} />
          <InlineMeta label="Required for" value={blueprint.audioPlan.requiredForFormats.join(', ')} />
          <ul className="site00-expr-engine-list">
            {blueprint.audioPlan.layers.map((l) => (
              <li key={l.layerId}>
                <strong>{l.type}</strong> — {l.purpose}
                <span className="site00-expr-engine-panel__meta"> · {l.timingRelationship}</span>
              </li>
            ))}
          </ul>
        </BlueprintBlock>
      );
    case 'platforms':
      return (
        <BlueprintBlock title="PLATFORM TRANSLATIONS">
          <ul className="site00-expr-engine-list">
            {blueprint.platformTranslations.map((t) => (
              <li key={t.translationId}>
                <strong>{t.platform}</strong> · {t.mode} · {t.status}
                <p className="site00-expr-engine-panel__copy">{t.targetBehavior}</p>
              </li>
            ))}
          </ul>
        </BlueprintBlock>
      );
    case 'routing':
      return (
        <BlueprintBlock title="PROVIDER ROUTING">
          <ul className="site00-expr-engine-list">
            {blueprint.providerRouting.map((r) => (
              <li key={`${r.taskClass}-${r.format}`}>
                <strong>{r.taskClass}</strong> / {r.format} → {r.recommendedProvider} ({r.recommendedModel})
                <p className="site00-expr-engine-panel__copy">{r.why}</p>
              </li>
            ))}
          </ul>
        </BlueprintBlock>
      );
    case 'anchor':
      return (
        <BlueprintBlock title="CREATIVE ANCHOR">
          <MetaGrid
            rows={[
              ['Format', blueprint.creativeAnchorRecommendation.format],
              ['Task', blueprint.creativeAnchorRecommendation.taskId],
              ['Dispatch', blueprint.creativeAnchorRecommendation.productionDispatch],
              ['Founder judgment required', String(blueprint.creativeAnchorRecommendation.founderJudgmentRequired)],
            ]}
          />
          <p className="site00-expr-engine-panel__copy">{blueprint.creativeAnchorRecommendation.rationale}</p>
        </BlueprintBlock>
      );
    case 'readiness':
      return <ReadinessBlock readiness={readiness} />;
    default:
      return null;
  }
}

function Entry001Section({
  section,
  phase1,
}: {
  section: SectionId;
  phase1: ExpressionEngineB1Phase1Response;
}) {
  if (section === 'overview') {
    return (
      <>
        <h2 className="site00-expr-engine-panel__title">ENTRY 001 — {phase1.entry001.title}</h2>
        <InlineMeta label="Status" value={phase1.entry001.status} />
        <InlineMeta label="TikTok plan" value={phase1.entry001.tiktokPlan.adaptationDecision} />
        <InlineMeta label="X expression" value={phase1.entry001.xExpression.status} />
        <p className="site00-expr-engine-panel__copy">{phase1.entry001.tiktokPlan.adaptationRationale}</p>
      </>
    );
  }
  if (section === 'readiness') {
    return <ReadinessBlock readiness={phase1.readiness001} />;
  }
  return (
    <BlueprintBlock title="ENTRY 001 DETAIL">
      {section === 'platforms' ? (
        <>
          <h3>TikTok</h3>
          <p className="site00-expr-engine-panel__copy">{phase1.entry001.tiktokPlan.openingHook}</p>
          <h3>X beats</h3>
          <ul className="site00-expr-engine-list">
            {phase1.entry001.xExpression.beats.map((b) => (
              <li key={b.beat}>
                <strong>{b.beat}</strong> — {b.copy.slice(0, 120)}…
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="site00-expr-engine-panel__meta">Switch to Readiness or Overview for ENTRY 001.</p>
      )}
    </BlueprintBlock>
  );
}

function ReadinessBlock({ readiness }: { readiness: { ready: boolean; blockers: string[]; checks: Array<{ check: string; passed: boolean }> } }) {
  return (
    <BlueprintBlock title="READINESS">
      <InlineMeta label="Ready" value={readiness.ready ? 'YES' : 'NO'} />
      {readiness.blockers.length ? (
        <>
          <p className="site00-expr-engine-panel__meta">Blockers</p>
          <ul className="site00-expr-engine-list">
            {readiness.blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="site00-expr-engine-panel__copy">No blockers.</p>
      )}
    </BlueprintBlock>
  );
}

function BlueprintBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="site00-experiment-g__panel site00-expr-engine-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function MetaGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="site00-expr-engine-panel__dl">
      {rows.map(([label, value]) => (
        <div key={label} className="site00-expr-engine-panel__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <>
      <p className="site00-expr-engine-panel__meta">{title}</p>
      <ul className="site00-expr-engine-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}
