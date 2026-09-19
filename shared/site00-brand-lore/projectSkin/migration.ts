/**
 * ProjectSkinMigration — preview, approve, rollback.
 */

import { getMasterSkinById } from './catalog.js';
import { approveProjectSkin, getProjectExperienceSkin } from './projectSkinStore.js';
import type { ProjectSkinMigration } from './types.js';

const migrations = new Map<string, ProjectSkinMigration>();

function now(): string {
  return new Date().toISOString();
}

export function createSkinMigrationPreview(input: {
  projectId: string;
  toSkinId: string;
}): ProjectSkinMigration | null {
  const current = getProjectExperienceSkin(input.projectId);
  const target = getMasterSkinById(input.toSkinId);
  if (!current || !target) return null;

  const migration: ProjectSkinMigration = {
    migrationId: `mig-${Date.now()}`,
    projectId: input.projectId,
    fromSkinId: current.masterSkinId,
    fromVersion: current.activeSkinVersion,
    toSkinId: input.toSkinId,
    toVersion: target.version,
    previewAvailable: true,
    approved: false,
    rolledBack: false,
    createdAt: now(),
  };
  migrations.set(migration.migrationId, migration);
  return migration;
}

export function approveSkinMigration(migrationId: string, selectedBy: string): ProjectSkinMigration | null {
  const migration = migrations.get(migrationId);
  if (!migration || !migration.previewAvailable) return null;
  approveProjectSkin({
    projectId: migration.projectId,
    selectedSkinId: migration.toSkinId,
    selectedBy,
  });
  migration.approved = true;
  return migration;
}

export function rollbackSkinMigration(migrationId: string): ProjectSkinMigration | null {
  const migration = migrations.get(migrationId);
  if (!migration) return null;
  approveProjectSkin({
    projectId: migration.projectId,
    selectedSkinId: migration.fromSkinId,
    selectedBy: 'rollback',
  });
  migration.rolledBack = true;
  return migration;
}

export function getSkinMigration(migrationId: string): ProjectSkinMigration | null {
  return migrations.get(migrationId) ?? null;
}

export function clearSkinMigrationsForTest(): void {
  migrations.clear();
}
