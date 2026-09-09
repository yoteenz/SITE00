/**
 * BrandFamilySkinMigration — preview, migrate, rollback.
 */

import { getBrandFamilySkinByKey } from './registry.js';
import {
  approveBrandFamilyAssignment,
  createBrandFamilyProjectBinding,
  getProjectBrandFamilyBinding,
} from './projectBinding.js';
import type { BrandFamilySkinMigration } from './types.js';

const migrationStore = new Map<string, BrandFamilySkinMigration>();

export function createBrandFamilySkinMigrationPreview(input: {
  projectId: string;
  toBrandFamilySkinId: string;
}): BrandFamilySkinMigration | null {
  const current = getProjectBrandFamilyBinding(input.projectId);
  const target = getBrandFamilySkinByKey(input.toBrandFamilySkinId);
  if (!target) return null;

  const migration: BrandFamilySkinMigration = {
    migrationId: `bf-mig-${Date.now()}`,
    projectId: input.projectId,
    fromBrandFamilySkinId: current?.brandFamilySkinId ?? 'NONE',
    fromVersion: current?.skinVersion ?? '0',
    toBrandFamilySkinId: target.id,
    toVersion: target.version,
    previewAvailable: true,
    approved: false,
    rolledBack: false,
    createdAt: new Date().toISOString(),
  };
  migrationStore.set(migration.migrationId, migration);
  return migration;
}

export function approveBrandFamilySkinMigration(migrationId: string, selectedBy: string): BrandFamilySkinMigration | null {
  const migration = migrationStore.get(migrationId);
  if (!migration) return null;
  approveBrandFamilyAssignment({
    projectId: migration.projectId,
    brandFamilySkinId: migration.toBrandFamilySkinId,
    selectedBy,
  });
  migration.approved = true;
  return migration;
}

export function rollbackBrandFamilySkinMigration(migrationId: string): BrandFamilySkinMigration | null {
  const migration = migrationStore.get(migrationId);
  if (!migration || !migration.approved) return null;

  createBrandFamilyProjectBinding({
    projectId: migration.projectId,
    brandFamilySkinId: migration.fromBrandFamilySkinId,
    founderApproved: true,
    selectedBy: 'rollback',
  });
  migration.rolledBack = true;
  return migration;
}

export function getBrandFamilySkinMigration(migrationId: string): BrandFamilySkinMigration | null {
  return migrationStore.get(migrationId) ?? null;
}

export function clearBrandFamilyMigrationsForTest(): void {
  migrationStore.clear();
}
