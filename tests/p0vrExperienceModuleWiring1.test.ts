/**
 * P0.EXPERIENCE.MODULE-WIRING1
 */

import { describe, expect, it } from 'vitest';
import {
  assertNoUnverifiedConnectedTools,
  buildDefaultPipelineRows,
  getFixtureExperienceBundle,
  getProjectModuleAvailability,
  isPipelineStageApplicable,
  listFixtureExperiencesForProject,
  loadExperienceWorkspaceBundle,
  resolveDefaultExperienceSlug,
  setActiveExperienceSlug,
  toolPlanRequiresApproval,
} from '../shared/site00-experience-workspace/index.js';
import {
  experienceWorkspacePath,
  shouldRenderExperienceWorkspace,
} from '../shared/site00-experience-workspace/paths.js';
import { SITE00_ROUTES, site00ProjectExperienceWorkspacePath } from '../src/site00/config/routes';

describe('P0.EXPERIENCE.MODULE-WIRING1', () => {
  it('EXPERIENCE route resolves by project', () => {
    expect(SITE00_ROUTES.projectExperience).toBe('/projects/:projectSlug/experience/*');
    expect(site00ProjectExperienceWorkspacePath('frontal-slayer', 'build-a-wig')).toBe(
      '/projects/frontal-slayer/experience/build-a-wig',
    );
    expect(experienceWorkspacePath('frontal-slayer', 'build-a-wig', 'scenes')).toBe(
      '/projects/frontal-slayer/experience/build-a-wig/scenes',
    );
  });

  it('Experience selector is scoped to active project', () => {
    const fs = listFixtureExperiencesForProject('frontal-slayer');
    const aw = listFixtureExperiencesForProject('astral-world');
    expect(fs.map((e) => e.slug)).toEqual(['build-a-wig']);
    expect(aw.map((e) => e.slug)).toEqual(['astrea']);
    expect(listFixtureExperiencesForProject('ndxbook')).toEqual([]);
  });

  it('Project module availability controls EXPERIENCE visibility', () => {
    expect(getProjectModuleAvailability('astral-world').experienceEnabled).toBe(true);
    expect(getProjectModuleAvailability('astral-world').designEnabled).toBe(false);
    expect(getProjectModuleAvailability('ndxbook').experienceEnabled).toBe(false);
    expect(getProjectModuleAvailability('frontal-slayer').experienceEnabled).toBe(true);
  });

  it('Experience type renders in fixture records', () => {
    const baw = getFixtureExperienceBundle('frontal-slayer', 'build-a-wig');
    expect(baw?.experiences[0]?.type).toBe('CONFIGURATOR');
    const astrea = getFixtureExperienceBundle('astral-world', 'astrea');
    expect(astrea?.experiences.find((e) => e.slug === 'astrea')?.type).toBe('WORLD');
  });

  it('Pipeline stages support applicable / not-required states', () => {
    expect(isPipelineStageApplicable('optimization', 'CONFIGURATOR')).toBe(false);
    expect(isPipelineStageApplicable('optimization', 'WORLD')).toBe(true);
    const rows = buildDefaultPipelineRows('APP');
    expect(rows.find((r) => r.id === 'scene_assembly')?.state).toBe('NOT_REQUIRED');
  });

  it('Build-A-Wig and Astréa share architecture', () => {
    const baw = loadExperienceWorkspaceBundle('frontal-slayer', 'build-a-wig');
    const astrea = loadExperienceWorkspaceBundle('astral-world', 'astrea');
    expect(baw?.mechanics.length).toBeGreaterThan(0);
    expect(astrea?.scenes.length).toBeGreaterThan(2);
  });

  it('Tool registry does not mark unverified tools CONNECTED', () => {
    expect(assertNoUnverifiedConnectedTools()).toBe(true);
  });

  it('ToolPlan is non-executing without explicit task approval', () => {
    expect(toolPlanRequiresApproval('DRAFT')).toBe(true);
    expect(toolPlanRequiresApproval('APPROVED')).toBe(false);
  });

  it('DESIGN and EXPERIENCE active keys are independent', () => {
    setActiveExperienceSlug('frontal-slayer', 'build-a-wig');
    setActiveExperienceSlug('astral-world', 'astrea');
    expect(resolveDefaultExperienceSlug('frontal-slayer')).toBe('build-a-wig');
    expect(resolveDefaultExperienceSlug('astral-world')).toBe('astrea');
  });

  it('Experience asset versions remain non-destructive', () => {
    const bundle = getFixtureExperienceBundle('frontal-slayer', 'build-a-wig');
    const ref = bundle?.assets.find((a) => a.assetId === 'asset-baw-ref-noir');
    expect(ref?.parentVersionId).toBeNull();
    expect(ref?.version).toBe('1.0.0');
  });

  it('Switching active project rebinds experience-scoped fixture lists', () => {
    const fs = loadExperienceWorkspaceBundle('frontal-slayer', null);
    const aw = loadExperienceWorkspaceBundle('astral-world', null);
    expect(fs?.experiences[0]?.projectId).toBe('frontal-slayer');
    expect(aw?.experiences[0]?.projectId).toBe('astral-world');
  });

  it('Workspace vs Astral client runtime gate', () => {
    expect(shouldRenderExperienceWorkspace('frontal-slayer', 'build-a-wig')).toBe(true);
    expect(shouldRenderExperienceWorkspace('frontal-slayer', 'build-a-wig/scenes')).toBe(true);
    expect(shouldRenderExperienceWorkspace('astral-world', 'play/home')).toBe(false);
    expect(shouldRenderExperienceWorkspace('astral-world', 'astrea')).toBe(true);
  });
});
