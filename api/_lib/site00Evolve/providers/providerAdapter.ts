/** Provider adapter contract — publish/schedule exist but are fenced */

import type { DiscoveredAccount, MetricObservationInput, ProviderCapability } from './types.js';
import { ProviderError } from './errors.js';
import { assertPublishingAllowed, publishingFenceState } from './publishingFence.js';
import type { PublishingStatus } from './types.js';

export type AdapterContext = {
  organizationId: string;
  connectionId: string;
  providerKey: string;
  secretRef?: string | null;
  orgPublishingStatus: PublishingStatus;
};

export type ProviderAdapter = {
  providerKey: string;
  supportedCapabilities: ProviderCapability[];
  authorize(ctx: AdapterContext): Promise<{ authorizationUrl?: string; status: string }>;
  disconnect(ctx: AdapterContext): Promise<void>;
  refreshAuthorization(ctx: AdapterContext): Promise<{ status: string }>;
  verifyConnection(ctx: AdapterContext): Promise<{ healthy: boolean; message?: string }>;
  listAccounts(ctx: AdapterContext): Promise<DiscoveredAccount[]>;
  getCapabilities(ctx: AdapterContext, grantedScopes: string[]): ProviderCapability[];
  fetchMetrics(
    ctx: AdapterContext,
    opts: { propertyId?: string; periodStart: string; periodEnd: string },
  ): Promise<MetricObservationInput[]>;
  validatePublishRequest(): Promise<{ ok: boolean; error?: string }>;
  publish(): Promise<never>;
  schedule(): Promise<never>;
};

export abstract class BaseProviderAdapter implements ProviderAdapter {
  abstract providerKey: string;
  abstract supportedCapabilities: ProviderCapability[];

  async authorize(): Promise<{ authorizationUrl?: string; status: string }> {
    return { status: 'AUTHORIZATION_REQUIRED' };
  }

  async disconnect(): Promise<void> {}

  async refreshAuthorization(): Promise<{ status: string }> {
    return { status: 'REAUTH_REQUIRED' };
  }

  async verifyConnection(ctx: AdapterContext): Promise<{ healthy: boolean; message?: string }> {
    if (!ctx.secretRef && !process.env[`${ctx.providerKey.toUpperCase()}_API_KEY`]) {
      return { healthy: false, message: 'REQUIRES_SECURE_CONFIGURATION' };
    }
    return { healthy: false, message: 'NOT_CONNECTED' };
  }

  async listAccounts(): Promise<DiscoveredAccount[]> {
    return [];
  }

  getCapabilities(_ctx: AdapterContext, _grantedScopes: string[]): ProviderCapability[] {
    return [];
  }

  async fetchMetrics(): Promise<MetricObservationInput[]> {
    return [];
  }

  async validatePublishRequest(): Promise<{ ok: boolean; error?: string }> {
    return { ok: false, error: 'PUBLISHING_DISABLED' };
  }

  async publish(ctx: AdapterContext): Promise<never> {
    assertPublishingAllowed(ctx.orgPublishingStatus);
    throw new ProviderError('PUBLISHING_DISABLED', 'Publish blocked by global fence', false, ctx.providerKey);
  }

  async schedule(ctx: AdapterContext): Promise<never> {
    assertPublishingAllowed(ctx.orgPublishingStatus);
    throw new ProviderError('PUBLISHING_DISABLED', 'Schedule blocked by global fence', false, ctx.providerKey);
  }
}

export function getAdapterPublishingStatus(orgPublishingStatus: PublishingStatus) {
  return publishingFenceState(orgPublishingStatus);
}
