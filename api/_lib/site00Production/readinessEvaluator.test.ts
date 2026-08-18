import { describe, expect, it } from 'vitest';
import {
  evaluateDeliverableReadiness,
  evaluateEnvironmentReadiness,
  evaluateProjectReadinessGraph,
} from './readinessEvaluator.js';
import type { ServiceInput } from './readinessEvaluator.js';

const projectDesign = {
  id: 'p1',
  slug: 'northquarter-rebuild',
  name: 'NORTHQUARTER REBUILD',
  current_phase: 'DESIGN_DIRECTION',
  payment_state: 'CONFIRMED',
};

const projectBuild = { ...projectDesign, current_phase: 'BUILD' };

function svc(partial: Partial<ServiceInput> & Pick<ServiceInput, 'provider_key' | 'display_name'>): ServiceInput {
  return {
    service_id: partial.provider_key,
    required_phase: partial.required_phase ?? 'BUILD',
    requirement_state: partial.requirement_state ?? 'CLIENT_ACTION_REQUIRED',
    connection_state: partial.connection_state ?? null,
    owner_type: 'CLIENT',
    ...partial,
  };
}

describe('readinessEvaluator — access phase awareness', () => {
  it('CASE A: Design phase + Supabase disconnected → Homepage READY, no access blocker on design work', () => {
    const services = [
      svc({ provider_key: 'supabase', display_name: 'SUPABASE', required_phase: 'BUILD', requirement_state: 'CLIENT_ACTION_REQUIRED' }),
      svc({ provider_key: 'godaddy', display_name: 'GODADDY', required_phase: 'LAUNCH', requirement_state: 'REQUIRED_LATER' }),
    ];

    const homepage = evaluateDeliverableReadiness({
      project: projectDesign,
      deliverable: {
        id: 'd1',
        deliverable_key: 'homepage_visual_direction',
        title: 'HOMEPAGE ART DIRECTION',
        status: 'READY',
      },
      recipe: { deliverable_key: 'homepage_visual_direction', depends_on: ['sitemap'], required_services: [], required_assets: [], required_approvals: [] },
      deliverablesByKey: new Map([
        ['homepage_visual_direction', { id: 'd1', deliverable_key: 'homepage_visual_direction', title: 'HOMEPAGE', status: 'READY' }],
        ['sitemap', { id: 'd0', deliverable_key: 'sitemap', title: 'SITEMAP', status: 'APPROVED' }],
      ]),
      services,
    });

    expect(homepage.dimensions.access).toBe('not_required');
    expect(homepage.overall).toBe('ready');
    expect(homepage.blockers.filter((b) => b.type === 'access')).toHaveLength(0);

    const backend = evaluateDeliverableReadiness({
      project: projectDesign,
      deliverable: {
        id: 'd2',
        deliverable_key: 'backend_build',
        title: 'BACKEND BUILD',
        status: 'NOT_READY',
      },
      recipe: {
        deliverable_key: 'backend_build',
        depends_on: [],
        required_services: [{ service: 'supabase', phase: 'BUILD', requirement: 'required' }],
        required_assets: [],
        required_approvals: [],
      },
      deliverablesByKey: new Map(),
      services,
    });

    expect(backend.dimensions.access).toBe('not_required');
    expect(backend.overall).not.toBe('blocked');
  });

  it('CASE B: Build phase + Supabase disconnected → Backend BLOCKED', () => {
    const services = [
      svc({ provider_key: 'supabase', display_name: 'SUPABASE', required_phase: 'BUILD', requirement_state: 'CLIENT_ACTION_REQUIRED' }),
    ];

    const backend = evaluateDeliverableReadiness({
      project: projectBuild,
      deliverable: {
        id: 'd2',
        deliverable_key: 'backend_build',
        title: 'BACKEND BUILD',
        status: 'NOT_READY',
      },
      recipe: {
        deliverable_key: 'backend_build',
        depends_on: [],
        required_services: [{ service: 'supabase', phase: 'BUILD', requirement: 'required' }],
        required_assets: [],
        required_approvals: [],
      },
      deliverablesByKey: new Map(),
      services,
    });

    expect(backend.dimensions.access).toBe('blocked');
    expect(backend.overall).toBe('blocked');
    expect(backend.blockers.some((b) => b.type === 'access' && b.service_key === 'supabase')).toBe(true);
  });

  it('CASE C: Supabase connected → Backend READY', () => {
    const services = [
      svc({
        provider_key: 'supabase',
        display_name: 'SUPABASE',
        required_phase: 'BUILD',
        requirement_state: 'CLIENT_ACTION_REQUIRED',
        connection_state: 'CONNECTED',
      }),
    ];

    const backend = evaluateDeliverableReadiness({
      project: projectBuild,
      deliverable: {
        id: 'd2',
        deliverable_key: 'backend_build',
        title: 'BACKEND BUILD',
        status: 'NOT_READY',
      },
      recipe: {
        deliverable_key: 'backend_build',
        depends_on: [],
        required_services: [{ service: 'supabase', phase: 'BUILD', requirement: 'required' }],
        required_assets: [],
        required_approvals: [],
      },
      deliverablesByKey: new Map(),
      services,
    });

    expect(backend.dimensions.access).toBe('ready');
    expect(backend.overall).toBe('ready');
  });

  it('CASE D: GoDaddy missing during Design → no blocker', () => {
    const env = evaluateEnvironmentReadiness({
      project: projectDesign,
      services: [
        svc({ provider_key: 'godaddy', display_name: 'GODADDY', required_phase: 'LAUNCH', requirement_state: 'REQUIRED_LATER' }),
      ],
    });
    expect(env.current_phase_required_count).toBe(0);
    expect(env.current_phase_readiness_pct).toBe(100);
  });

  it('CASE E: Launch phase + GoDaddy missing → Production Domain BLOCKED', () => {
    const projectLaunch = { ...projectDesign, current_phase: 'LAUNCH' };
    const services = [
      svc({ provider_key: 'godaddy', display_name: 'GODADDY', required_phase: 'LAUNCH', requirement_state: 'REQUIRED_LATER' }),
    ];

    const domain = evaluateDeliverableReadiness({
      project: projectLaunch,
      deliverable: {
        id: 'd3',
        deliverable_key: 'production_domain',
        title: 'PRODUCTION DOMAIN',
        status: 'NOT_READY',
      },
      recipe: {
        deliverable_key: 'production_domain',
        depends_on: [],
        required_services: [{ service: 'godaddy', phase: 'LAUNCH', requirement: 'required' }],
        required_assets: [],
        required_approvals: [],
      },
      deliverablesByKey: new Map(),
      services,
    });

    expect(domain.overall).toBe('blocked');
  });

  it('CASE G: Only READY deliverables returned in graph ready list', () => {
    const graph = evaluateProjectReadinessGraph({
      project: projectDesign,
      deliverables: [
        { id: 'd1', deliverable_key: 'homepage_visual_direction', title: 'HOMEPAGE', status: 'READY' },
        { id: 'd2', deliverable_key: 'backend_build', title: 'BACKEND BUILD', status: 'NOT_READY' },
      ],
      recipeByKey: new Map([
        ['homepage_visual_direction', { deliverable_key: 'homepage_visual_direction', depends_on: [], required_services: [], required_assets: [], required_approvals: [] }],
        [
          'backend_build',
          {
            deliverable_key: 'backend_build',
            depends_on: [],
            required_services: [{ service: 'supabase', phase: 'BUILD', requirement: 'required' }],
            required_assets: [],
            required_approvals: [],
          },
        ],
      ]),
      services: [
        svc({ provider_key: 'supabase', display_name: 'SUPABASE', required_phase: 'BUILD', requirement_state: 'CLIENT_ACTION_REQUIRED' }),
      ],
    });

    const readyKeys = graph.deliverables.filter((d) => d.overall === 'ready').map((d) => d.deliverable_key);
    expect(readyKeys).toContain('homepage_visual_direction');
    expect(readyKeys).not.toContain('backend_build');
  });
});
