/**
 * P0.FILM.1 — Film continuity graph.
 */

import type {
  FilmContinuityGraph,
  FilmContinuityNode,
  FilmShotContract,
  NdxEnvironmentId,
} from '../types.js';

export function buildContinuityNode(shot: FilmShotContract, index: number): FilmContinuityNode {
  return {
    nodeId: `cont-${shot.shotId}`,
    shotId: shot.shotId,
    characterIdentity: shot.characterIdentity,
    hair: shot.hair,
    wardrobeContinuityId: shot.wardrobe?.continuityId ?? 'default',
    jewelry: shot.accessories.filter((a) => a.includes('jewelry')),
    limeArtifact: shot.props.find((p) => p.includes('lime')) ?? null,
    bag: shot.props.find((p) => p.includes('bag')) ?? null,
    phone: shot.props.find((p) => p.includes('phone')) ?? null,
    notebook: shot.props.find((p) => p.includes('notebook') || p.includes('book')) ?? null,
    location: shot.environment,
    time: inferTimeFromIndex(index),
    light: shot.lighting,
    propStates: Object.fromEntries(shot.props.map((p) => [p, 'present'])),
    emotionalState: shot.expression,
    dialogueState: shot.dialogue,
  };
}

function inferTimeFromIndex(index: number): string {
  const times = ['morning', 'late morning', 'afternoon', 'golden hour'];
  return times[index % times.length];
}

export function buildContinuityGraph(filmId: string, shots: FilmShotContract[]): FilmContinuityGraph {
  const nodes = shots.map((s, i) => buildContinuityNode(s, i));
  const conflicts = detectContinuityConflicts(nodes);
  return { filmId, nodes, conflicts };
}

export function detectContinuityConflicts(nodes: FilmContinuityNode[]): FilmContinuityGraph['conflicts'] {
  const conflicts: FilmContinuityGraph['conflicts'] = [];
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];

    if (prev.wardrobeContinuityId !== curr.wardrobeContinuityId && prev.location === curr.location) {
      conflicts.push({
        fromShotId: prev.shotId,
        toShotId: curr.shotId,
        reason: `Wardrobe change (${prev.wardrobeContinuityId} → ${curr.wardrobeContinuityId}) without scene transition`,
      });
    }

    if (prev.limeArtifact && curr.limeArtifact && prev.limeArtifact !== curr.limeArtifact) {
      if (prev.propStates[prev.limeArtifact] === 'behind ear' && curr.propStates[curr.limeArtifact] === 'on table') {
        conflicts.push({
          fromShotId: prev.shotId,
          toShotId: curr.shotId,
          reason: `Lime artifact placement conflict: ${prev.limeArtifact} cannot be behind ear and on table simultaneously`,
        });
      }
    }

    if (prev.location !== curr.location && prev.time === curr.time) {
      const travelOk = isAdjacentLocation(prev.location, curr.location);
      if (!travelOk) {
        conflicts.push({
          fromShotId: prev.shotId,
          toShotId: curr.shotId,
          reason: `Location jump ${prev.location} → ${curr.location} without time transition`,
        });
      }
    }
  }
  return conflicts;
}

function isAdjacentLocation(a: NdxEnvironmentId, b: NdxEnvironmentId): boolean {
  const adjacency: Record<string, string[]> = {
    CAFE: ['CITY_SIDEWALK', 'BOOKSTORE'],
    CITY_SIDEWALK: ['CAFE', 'LUXURY_CAR', 'ELEVATOR'],
    HOME_DESK: ['CREATIVE_OFFICE'],
    LUXURY_CAR: ['CITY_SIDEWALK', 'RESTAURANT'],
  };
  return adjacency[a]?.includes(b) ?? false;
}

export function graphWardrobeContinuityTracked(graph: FilmContinuityGraph): boolean {
  return graph.nodes.every((n) => n.wardrobeContinuityId.length > 0);
}

export function graphPropContinuityTracked(graph: FilmContinuityGraph): boolean {
  return graph.nodes.some((n) => Object.keys(n.propStates).length > 0);
}

export function characterContinuityTracked(graph: FilmContinuityGraph): boolean {
  return graph.nodes.every((n) => n.characterIdentity.length > 0);
}
