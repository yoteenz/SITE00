import type { CreativeExperienceGraph, ExperienceArchitectureGate, ExperienceGraphAction } from './map2Types';

export function createGateA(): ExperienceArchitectureGate {
  return { gate_id: 'GATE_A_EXPERIENCE_ARCHITECTURE', status: 'PENDING', history: [] };
}

export function applyGateAAction(gate: ExperienceArchitectureGate, action: ExperienceGraphAction, detail: string): ExperienceArchitectureGate {
  gate.history.push({ action, at: new Date().toISOString(), detail });
  if (action === 'APPROVE') gate.status = 'APPROVED';
  else if (action === 'DEFER') gate.status = 'DEFERRED';
  else gate.status = 'AMENDED';
  return gate;
}

export function assertFamilyCompilationAllowed(gateA: ExperienceArchitectureGate, graph: CreativeExperienceGraph | null): void {
  if (!graph?.approved) throw new Error('GRAPH_NOT_APPROVED: families blocked until experience graph approved');
  if (gateA.status !== 'APPROVED') throw new Error('GATE_A_NOT_APPROVED: family compilation blocked');
}

export function amendGraphAddRoute(graph: CreativeExperienceGraph, route: CreativeExperienceGraph['nodes'][0]): CreativeExperienceGraph {
  return { ...graph, nodes: [...graph.nodes, route], approved: false };
}
