/**
 * B5.0 — Continuity map (visual relationships, not prose dump).
 */

import { useState } from 'react';
import type { Entry002ProductionBlueprint } from '../../../../../shared/site00-expression-engine/types.js';

type Props = {
  entryId: string;
  blueprint: Entry002ProductionBlueprint;
};

const NODE_ICONS: Record<string, string> = {
  WORLD: '◈',
  ARTIFACT: '◆',
  PALETTE: '◐',
  TYPOGRAPHY: 'Aa',
  CHARACTER: '◎',
  SUBJECT: '○',
  DEVICE: '▣',
  EXPRESSION: '↯',
  FORMAT: '▤',
  default: '·',
};

function resolveNodeIcon(kind: string): string {
  const upper = kind.toUpperCase();
  for (const key of Object.keys(NODE_ICONS)) {
    if (upper.includes(key)) return NODE_ICONS[key]!;
  }
  return NODE_ICONS.default!;
}

function resolveNodeRole(kind: string): string {
  const k = kind.toUpperCase();
  if (k.includes('WORLD')) return 'WORLD';
  if (k.includes('ARTIFACT')) return 'ARTIFACT';
  if (k.includes('PALETTE') || k.includes('COLOR')) return 'PALETTE';
  if (k.includes('TYPE')) return 'TYPE';
  if (k.includes('CHARACTER') || k.includes('NDX')) return 'CHARACTER';
  if (k.includes('SUBJECT')) return 'SUBJECT';
  if (k.includes('DEVICE') || k.includes('PHONE')) return 'DEVICE';
  if (k.includes('GRAMMAR') || k.includes('EXPRESSION')) return 'EXPRESSION';
  return kind;
}

export function ContinuityMap({ entryId, blueprint }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const nodes = blueprint.continuityGraph.nodes;

  return (
    <section className="site00-ee-continuity">
      <div className="site00-ee-continuity__center">
        <span className="site00-ee-continuity__entry">{entryId}</span>
        <span className="site00-ee-continuity__entry-title">{blueprint.entryArtifact.type}</span>
      </div>

      <ol className="site00-ee-continuity__chain">
        {nodes.map((node) => {
          const role = resolveNodeRole(node.kind);
          const expanded = expandedId === node.nodeId;
          return (
            <li key={node.nodeId} className="site00-ee-continuity__node">
              <span className="site00-ee-continuity__connector-down" aria-hidden />
              <article className={`site00-ee-continuity__card${expanded ? ' site00-ee-continuity__card--expanded' : ''}`}>
                <button
                  type="button"
                  className="site00-ee-continuity__card-head"
                  onClick={() => setExpandedId(expanded ? null : node.nodeId)}
                  aria-expanded={expanded}
                >
                  <span className="site00-ee-continuity__icon">{resolveNodeIcon(node.kind)}</span>
                  <div className="site00-ee-continuity__card-meta">
                    <span className="site00-ee-continuity__role">{role}</span>
                    <span className="site00-ee-continuity__name">{node.label}</span>
                  </div>
                  <span className="site00-ee-continuity__lock">LOCKED</span>
                </button>
                {expanded ? (
                  <div className="site00-ee-continuity__detail">
                    <p>{node.description}</p>
                    {node.formatRefs.length ? (
                      <p className="site00-ee-continuity__formats">{node.formatRefs.join(' · ')}</p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
