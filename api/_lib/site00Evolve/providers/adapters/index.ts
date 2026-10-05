/** Analytics adapter — architecture slot; real fetch only when credentials configured */

import { BaseProviderAdapter } from '../providerAdapter.js';
import type { AdapterContext, ProviderCapability } from './types.js';
import type { MetricObservationInput } from './types.js';
import { credentialsConfigured } from '../registry.js';

export class GoogleAnalyticsAdapter extends BaseProviderAdapter {
  providerKey = 'google_analytics';
  supportedCapabilities: ProviderCapability[] = ['READ_ACCOUNT', 'READ_ANALYTICS', 'READ_AUDIENCE', 'READ_CONTENT_METRICS'];

  private credsOk(): boolean {
    return credentialsConfigured([
      'GOOGLE_ANALYTICS_CLIENT_ID',
      'GOOGLE_ANALYTICS_CLIENT_SECRET',
      'GOOGLE_ANALYTICS_REFRESH_TOKEN',
    ]);
  }

  override async verifyConnection(ctx: AdapterContext) {
    if (!this.credsOk()) {
      return { healthy: false, message: 'REQUIRES_SECURE_CONFIGURATION — Google Analytics credentials not set' };
    }
    if (!ctx.secretRef) {
      return { healthy: false, message: 'AUTHORIZATION_REQUIRED — no credential reference stored' };
    }
    return { healthy: true, message: 'Credentials configured — verification pending live OAuth' };
  }

  override getCapabilities(_ctx: AdapterContext, grantedScopes: string[]): ProviderCapability[] {
    if (!this.credsOk()) return [];
    const caps: ProviderCapability[] = ['READ_ACCOUNT', 'READ_ANALYTICS'];
    if (grantedScopes.includes('analytics.readonly')) caps.push('READ_AUDIENCE', 'READ_CONTENT_METRICS');
    return caps;
  }

  override async fetchMetrics(
    ctx: AdapterContext,
    opts: { propertyId?: string; periodStart: string; periodEnd: string },
  ): Promise<MetricObservationInput[]> {
    if (!this.credsOk()) return [];
    // Architecture: real GA API call would go here when authorized connection exists
    return [];
  }
}

export class GoogleSearchConsoleAdapter extends BaseProviderAdapter {
  providerKey = 'google_search_console';
  supportedCapabilities: ProviderCapability[] = ['READ_ACCOUNT', 'READ_SEARCH_ANALYTICS'];

  private credsOk(): boolean {
    return credentialsConfigured(['GOOGLE_SEARCH_CONSOLE_CLIENT_ID', 'GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET']);
  }

  override async verifyConnection(ctx: AdapterContext) {
    if (!this.credsOk()) {
      return { healthy: false, message: 'REQUIRES_SECURE_CONFIGURATION' };
    }
    if (!ctx.secretRef) return { healthy: false, message: 'AUTHORIZATION_REQUIRED' };
    return { healthy: true };
  }

  override getCapabilities(): ProviderCapability[] {
    return this.credsOk() ? ['READ_ACCOUNT', 'READ_SEARCH_ANALYTICS'] : [];
  }
}

export class MetaInstagramAdapter extends BaseProviderAdapter {
  providerKey = 'meta_instagram';
  supportedCapabilities: ProviderCapability[] = [
    'READ_ACCOUNT',
    'READ_PROFILE',
    'READ_CONTENT',
    'READ_CONTENT_METRICS',
    'PUBLISH_CONTENT',
    'SCHEDULE_CONTENT',
  ];

  override async verifyConnection(ctx: AdapterContext) {
    if (!credentialsConfigured(['META_APP_ID', 'META_APP_SECRET'])) {
      return { healthy: false, message: 'REQUIRES_SECURE_CONFIGURATION' };
    }
    if (!ctx.secretRef) return { healthy: false, message: 'AUTHORIZATION_REQUIRED' };
    return { healthy: false, message: 'NOT_CONNECTED — account not verified' };
  }
}

export class StubEmailAdapter extends BaseProviderAdapter {
  constructor(public providerKey: string) {
    super();
  }
  supportedCapabilities: ProviderCapability[] = ['SEND_EMAIL', 'READ_EMAIL_METRICS'];
}

const ADAPTERS: Record<string, BaseProviderAdapter> = {
  google_analytics: new GoogleAnalyticsAdapter(),
  google_search_console: new GoogleSearchConsoleAdapter(),
  meta_instagram: new MetaInstagramAdapter(),
  tiktok: new MetaInstagramAdapter(), // slot reuse
  resend: new StubEmailAdapter('resend'),
  sendgrid: new StubEmailAdapter('sendgrid'),
};

export function getProviderAdapter(providerKey: string): BaseProviderAdapter | undefined {
  return ADAPTERS[providerKey];
}
