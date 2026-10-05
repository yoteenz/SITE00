/**
 * Publishing handoff + content calendar.
 */

import { randomUUID } from 'node:crypto';
import type {
  ContentCalendarEntry,
  PublishingHandoffPackage,
  SocialContentPackage,
} from './types.js';

export function buildPublishingHandoffPackage(params: {
  pkg: SocialContentPackage;
  connectorCapability: PublishingHandoffPackage['connectorCapability'];
}): PublishingHandoffPackage {
  const connected = params.connectorCapability === 'PRODUCTION_VERIFIED';
  return {
    handoffId: `ph-${randomUUID().slice(0, 8)}`,
    contentPackageId: params.pkg.id,
    channel: params.pkg.channel,
    account: 'ndxbook-instagram',
    scheduledTime: null,
    assets: params.pkg.assets,
    caption: params.pkg.caption?.text ?? '',
    metadata: params.pkg.metadata,
    approvalRecord: params.pkg.founderJudgment ?? 'PENDING',
    status: connected ? 'READY_FOR_CONNECTED_PUBLISH' : 'READY_FOR_MANUAL_PUBLISH',
    connectorCapability: params.connectorCapability,
  };
}

export function manualPublishWhenConnectorAbsent(handoff: PublishingHandoffPackage): boolean {
  return handoff.status === 'READY_FOR_MANUAL_PUBLISH';
}

export function buildCalendarEntry(params: {
  projectId: string;
  pkg: SocialContentPackage;
  scheduledDate?: string | null;
}): ContentCalendarEntry {
  return {
    entryId: `cal-${params.pkg.id}`,
    projectId: params.projectId,
    contentPackageId: params.pkg.id,
    scheduledDate: params.scheduledDate ?? null,
    status: params.pkg.calendarStatus,
    channel: params.pkg.channel,
    format: params.pkg.format,
    subject: params.pkg.altText ?? params.pkg.id,
  };
}

export function calendarTracksOperationalStates(statuses: string[]): boolean {
  const required = ['IDEA', 'FORMULATING', 'FOUNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'LEARNING'];
  return required.every((s) => statuses.includes(s));
}

export function publishedContentImmutable(status: SocialContentPackage['status']): boolean {
  return status === 'PUBLISHED';
}
