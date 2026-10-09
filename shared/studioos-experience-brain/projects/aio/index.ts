/**
 * ALL IN ONE ENTERPRISES INC — first full proof of the Workspace Experience Brain.
 * 30 material features across F01–F18 + the AIO OFFICE projection + client migration / activation; IFTA / Fuel Tax is the canonical deepest proof.
 */
import type { CrossFeatureRelationship, ExperienceContract } from '../../schema.js';
import { AIO_ACCOUNT, AIO_ENTRY, AIO_GET_STARTED, AIO_INBOX, AIO_MY_OFFICE, AIO_OFFICE_OPERATIONS, AIO_SERVICES, AIO_VAULT } from './platform.js';
import { AIO_AUTHORITIES, AIO_BOC3, AIO_BUSINESS_FORMATION, AIO_COMPLIANCE_SAFETY, AIO_IFTA_REGISTRATION, AIO_PERMITTING, AIO_RENEWALS, AIO_ROAD_READY, AIO_ROAD_TAX, AIO_TAGS_REGISTRATION } from './compliance.js';
import { AIO_BROKERAGE, AIO_DISPATCH_OPERATIONS, AIO_DRIVERLINK, AIO_FLEETCARE, AIO_LOAD_BOARD } from './operations.js';
import { AIO_BOOKKEEPING, AIO_FACTORING, AIO_FINANCES, AIO_INSURANCE } from './money.js';
import { AIO_IFTA_CONTRACT } from './ifta.js';
import { AIO_CLIENT_ACTIVATION, AIO_CLIENT_MIGRATION } from './migration.js';

export { AIO_DNA, AIO_SOURCE_REPO } from './dna.js';
export { AIO_IFTA_CONTRACT, AIO_IFTA_MILEAGE_SOURCES, AIO_IFTA_RECEIPT_CLASSES } from './ifta.js';
export * from './office.js';
export { AIO_CLIENT_ACTIVATION, AIO_CLIENT_MIGRATION } from './migration.js';
export * from './client-migration.js';
export * from './office-ia.js';
export * from './office-contracts.js';
export * from './office-design-reconciliation.js';
export * from './office-visual-authority.js';
export * from './office-unified-experience.js';
export * from './office-workspace-proofs.js';
export * from './office-workspace-style.js';

/** Canonical AIO feature inventory, in family order (F01 → F18, then the AIO OFFICE projection, then client migration + activation). */
export const AIO_EXPERIENCE_CONTRACTS: ExperienceContract[] = [
  AIO_ENTRY,
  AIO_GET_STARTED,
  AIO_BUSINESS_FORMATION,
  AIO_ROAD_READY,
  AIO_MY_OFFICE,
  AIO_SERVICES,
  AIO_AUTHORITIES,
  AIO_BOC3,
  AIO_IFTA_REGISTRATION,
  AIO_IFTA_CONTRACT,
  AIO_PERMITTING,
  AIO_TAGS_REGISTRATION,
  AIO_ROAD_TAX,
  AIO_COMPLIANCE_SAFETY,
  AIO_RENEWALS,
  AIO_DISPATCH_OPERATIONS,
  AIO_LOAD_BOARD,
  AIO_BROKERAGE,
  AIO_FINANCES,
  AIO_FACTORING,
  AIO_INSURANCE,
  AIO_BOOKKEEPING,
  AIO_FLEETCARE,
  AIO_DRIVERLINK,
  AIO_VAULT,
  AIO_INBOX,
  AIO_ACCOUNT,
  AIO_OFFICE_OPERATIONS,
  AIO_CLIENT_MIGRATION,
  AIO_CLIENT_ACTIVATION,
];

/** Sprint §23 service inventory → feature ids (proves the minimum list is covered without inventing services). */
export const AIO_SERVICE_INVENTORY: Record<string, string> = {
  PERMITTING: 'AIO.PERMITTING',
  'TAGS / REGISTRATION': 'AIO.TAGS_REGISTRATION',
  'IFTA / FUEL TAX': 'AIO.IFTA',
  'ROAD TAX / HIGHWAY TAX': 'AIO.ROAD_TAX',
  AUTHORITIES: 'AIO.AUTHORITIES',
  'BOC-3': 'AIO.BOC3',
  'LLC / INC': 'AIO.BUSINESS_FORMATION',
  'ROAD READY': 'AIO.ROAD_READY',
  BROKERAGE: 'AIO.BROKERAGE',
  'DISPATCH / OPERATIONS': 'AIO.DISPATCH_OPERATIONS',
  'LOAD BOARD': 'AIO.LOAD_BOARD',
  INSURANCE: 'AIO.INSURANCE',
  FACTORING: 'AIO.FACTORING',
  BOOKKEEPING: 'AIO.BOOKKEEPING',
  FLEETCARE: 'AIO.FLEETCARE',
  DRIVERLINK: 'AIO.DRIVERLINK',
  VAULT: 'AIO.VAULT',
  INBOX: 'AIO.INBOX',
  'CLIENT ACCOUNT': 'AIO.ACCOUNT',
  'AIO OFFICE OPERATIONS': 'AIO.OFFICE_OPERATIONS',
};

/** Canonical families → feature ids. */
export const AIO_FAMILY_MAP: Record<string, string[]> = {
  'F01 ENTRY': ['AIO.ENTRY'],
  'F02 GET STARTED': ['AIO.GET_STARTED'],
  'F03 START YOUR BUSINESS': ['AIO.BUSINESS_FORMATION'],
  'F04 ROAD READY': ['AIO.ROAD_READY', 'AIO.RENEWALS'],
  'F05 MY OFFICE': ['AIO.MY_OFFICE'],
  'F06 SERVICES': ['AIO.SERVICES', 'AIO.AUTHORITIES', 'AIO.BOC3', 'AIO.IFTA_REGISTRATION', 'AIO.IFTA', 'AIO.PERMITTING', 'AIO.TAGS_REGISTRATION', 'AIO.ROAD_TAX', 'AIO.COMPLIANCE_SAFETY'],
  'F07 OPERATIONS': ['AIO.DISPATCH_OPERATIONS'],
  'F08 LOAD BOARD': ['AIO.LOAD_BOARD'],
  'F09 BROKERAGE': ['AIO.BROKERAGE'],
  'F10 FINANCES': ['AIO.FINANCES'],
  'F11 FACTORING': ['AIO.FACTORING'],
  'F12 INSURANCE': ['AIO.INSURANCE'],
  'F13 BOOKKEEPING': ['AIO.BOOKKEEPING'],
  'F14 FLEETCARE': ['AIO.FLEETCARE'],
  'F15 DRIVERLINK': ['AIO.DRIVERLINK'],
  'F16 VAULT': ['AIO.VAULT'],
  'F17 INBOX': ['AIO.INBOX'],
  'F18 ACCOUNT': ['AIO.ACCOUNT', 'AIO.CLIENT_ACTIVATION'],
  'ROLE: SHIPPER': ['AIO.BROKERAGE'],
  'ROLE: DRIVER': ['AIO.DRIVERLINK', 'AIO.DISPATCH_OPERATIONS'],
  'ROLE: FLEETCARE PROVIDER': ['AIO.FLEETCARE'],
  'ROLE: AIO OFFICE': ['AIO.OFFICE_OPERATIONS', 'AIO.CLIENT_MIGRATION'],
};

/** Every cross-feature experience relationship across AIO (the experience graph, not only dependencies). */
export function aioCrossFeatureRelationships(): CrossFeatureRelationship[] {
  return AIO_EXPERIENCE_CONTRACTS.flatMap((c) => c.cross_feature_relationships);
}
