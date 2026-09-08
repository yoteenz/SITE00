/**
 * B5.10 — In-memory project notes + milestones (project-scoped memory).
 */

import type { ProjectMilestone, ProjectNote } from '../../../shared/site00-projects/technical/types.js';

const notesByProject = new Map<string, ProjectNote[]>();
const milestonesByProject = new Map<string, ProjectMilestone[]>();

function seedFrontalSlayerMilestones(): ProjectMilestone[] {
  return [
    {
      milestoneId: 'fs-beta-launch',
      projectId: 'frontal-slayer',
      title: 'BETA LAUNCH',
      status: 'UPCOMING',
      dueDate: null,
      completedAt: null,
      progress: null,
      dependencies: ['HOMEPAGE MOBILE FIX'],
      blockingIssues: [],
      relatedRelease: null,
      relatedDeployment: 'STAGING',
      owner: 'FOUNDER',
      clientVisible: false,
      notes: 'IN 12 DAYS — DERIVED FROM OPERATING STATE',
    },
    {
      milestoneId: 'fs-final-qa',
      projectId: 'frontal-slayer',
      title: 'FINAL QA',
      status: 'IN_PROGRESS',
      dueDate: null,
      completedAt: null,
      progress: 45,
      dependencies: ['BETA LAUNCH'],
      blockingIssues: [],
      relatedRelease: null,
      relatedDeployment: null,
      owner: 'FOUNDER',
      clientVisible: true,
      notes: null,
    },
    {
      milestoneId: 'fs-staging-deploy',
      projectId: 'frontal-slayer',
      title: 'STAGING DEPLOYMENT',
      status: 'COMPLETED',
      dueDate: null,
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      progress: 100,
      dependencies: [],
      blockingIssues: [],
      relatedRelease: null,
      relatedDeployment: 'STAGING',
      owner: 'FOUNDER',
      clientVisible: true,
      notes: null,
    },
  ];
}

function seedFrontalSlayerNotes(): ProjectNote[] {
  return [
    {
      noteId: 'fs-note-1',
      projectId: 'frontal-slayer',
      type: 'FINDING',
      title: 'HOMEPAGE MOBILE SPACING',
      body: 'HERO SECTION NEEDS TIGHTER MOBILE PADDING BEFORE BETA.',
      author: 'FOUNDER',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      pinned: true,
      relatedRoute: '/',
      relatedIssue: null,
      relatedRelease: null,
      relatedMilestone: 'fs-beta-launch',
      internalOnly: true,
      clientVisible: false,
    },
    {
      noteId: 'fs-note-2',
      projectId: 'frontal-slayer',
      title: 'CLIENT REVIEW SCHEDULED',
      type: 'DECISION',
      body: 'CLIENT APPROVAL FOR SHOP PAGE DEFERRED TO FINAL QA.',
      author: 'FOUNDER',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      pinned: false,
      relatedRoute: null,
      relatedIssue: null,
      relatedRelease: null,
      relatedMilestone: 'fs-final-qa',
      internalOnly: false,
      clientVisible: true,
    },
  ];
}

export function getProjectNotes(projectId: string): ProjectNote[] {
  if (!notesByProject.has(projectId) && projectId === 'frontal-slayer') {
    notesByProject.set(projectId, seedFrontalSlayerNotes());
  }
  return notesByProject.get(projectId) ?? [];
}

export function getProjectMilestones(projectId: string): ProjectMilestone[] {
  if (!milestonesByProject.has(projectId) && projectId === 'frontal-slayer') {
    milestonesByProject.set(projectId, seedFrontalSlayerMilestones());
  }
  return milestonesByProject.get(projectId) ?? [];
}

export function resetProjectTechnicalMemory(): void {
  notesByProject.clear();
  milestonesByProject.clear();
}
