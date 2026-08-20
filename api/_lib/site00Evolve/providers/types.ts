/** Provider-independent types for EVOLVE external connections */

export type ProviderCategory =
  | 'ANALYTICS'
  | 'SEARCH'
  | 'EMAIL'
  | 'SOCIAL'
  | 'ADVERTISING'
  | 'COMMERCE'
  | 'CRM'
  | 'OTHER';

export type ConnectionStatus =
  | 'NOT_CONNECTED'
  | 'AUTHORIZATION_REQUIRED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DEGRADED'
  | 'REAUTH_REQUIRED'
  | 'PERMISSION_LIMITED'
  | 'ERROR'
  | 'DISCONNECTED';

export type ConnectionHealth = 'HEALTHY' | 'ATTENTION_REQUIRED' | 'DEGRADED' | 'BROKEN' | 'UNKNOWN';

export type ProviderCapability =
  | 'READ_ACCOUNT'
  | 'READ_PROFILE'
  | 'READ_ANALYTICS'
  | 'READ_CONTENT'
  | 'READ_CONTENT_METRICS'
  | 'READ_AUDIENCE'
  | 'READ_CAMPAIGNS'
  | 'READ_AD_METRICS'
  | 'CREATE_CONTENT'
  | 'UPLOAD_MEDIA'
  | 'PUBLISH_CONTENT'
  | 'SCHEDULE_CONTENT'
  | 'DELETE_CONTENT'
  | 'SEND_EMAIL'
  | 'READ_EMAIL_METRICS'
  | 'READ_SEARCH_ANALYTICS';

export type CapabilityAvailability = 'AVAILABLE' | 'UNAVAILABLE_FOR_CONNECTION' | 'UNSUPPORTED_BY_PROVIDER';

export type AutomationMode = 'MANUAL' | 'ASSISTED' | 'APPROVAL_REQUIRED' | 'AUTOMATED';

export type PublishingStatus = 'DISABLED' | 'PILOT_ENABLED' | 'ENABLED';

export type DistributionJobState =
  | 'DRAFT'
  | 'AWAITING_CONTENT'
  | 'AWAITING_ASSET'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'READY_TO_SCHEDULE'
  | 'SCHEDULED'
  | 'DISPATCHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED';

export type NormalizedMetricKey =
  | 'IMPRESSIONS'
  | 'REACH'
  | 'ENGAGEMENTS'
  | 'ENGAGEMENT_RATE'
  | 'CLICKS'
  | 'CTR'
  | 'SESSIONS'
  | 'USERS'
  | 'NEW_USERS'
  | 'CONVERSIONS'
  | 'CONVERSION_RATE'
  | 'REVENUE'
  | 'SPEND'
  | 'ROAS'
  | 'EMAIL_SENT'
  | 'EMAIL_DELIVERED'
  | 'EMAIL_OPENED'
  | 'EMAIL_CLICKED'
  | 'EMAIL_BOUNCED'
  | 'EMAIL_UNSUBSCRIBED'
  | 'VIDEO_VIEWS'
  | 'WATCH_TIME'
  | 'FOLLOWERS'
  | 'FOLLOWER_GROWTH'
  | 'SEARCH_IMPRESSIONS'
  | 'SEARCH_CLICKS'
  | 'SEARCH_CTR'
  | 'SEARCH_POSITION';

export type InsightConfidence = 'INSUFFICIENT_EVIDENCE' | 'LOW' | 'MEDIUM' | 'HIGH';

export type ProviderErrorCode =
  | 'AUTH_EXPIRED'
  | 'AUTH_REVOKED'
  | 'MISSING_SCOPE'
  | 'RATE_LIMITED'
  | 'ACCOUNT_NOT_FOUND'
  | 'PROPERTY_NOT_FOUND'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'SYNC_FAILED'
  | 'PUBLISHING_DISABLED'
  | 'ORGANIZATION_PUBLISHING_DISABLED'
  | 'REQUIRES_SECURE_CONFIGURATION'
  | 'NOT_CONFIGURED';

export type ExternalConnectionRow = {
  id: string;
  organization_id: string;
  external_system_id: string;
  logical_name: string;
  connection_state: string;
  provider_key: string | null;
  provider_category: string | null;
  connection_type: string | null;
  display_name: string | null;
  external_account_id: string | null;
  external_account_name: string | null;
  external_property_id: string | null;
  external_property_name: string | null;
  status: string | null;
  health: string | null;
  granted_capabilities: string[];
  supported_capabilities: string[];
  granted_scopes: string[];
  connected_at: string | null;
  last_verified_at: string | null;
  last_sync_at: string | null;
  last_error_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  credential_state: string | null;
  secret_ref: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SafeConnectionView = {
  id: string;
  organizationId: string;
  providerKey: string;
  providerCategory: ProviderCategory;
  displayName: string;
  status: ConnectionStatus;
  health: ConnectionHealth;
  externalAccountName: string | null;
  externalPropertyName: string | null;
  grantedCapabilities: ProviderCapability[];
  supportedCapabilities: ProviderCapability[];
  capabilityMap: Record<string, CapabilityAvailability>;
  grantedScopes: string[];
  lastVerifiedAt: string | null;
  lastSyncAt: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
  credentialState: string;
  recommendedAction: string | null;
};

export type MetricObservationInput = {
  organizationId: string;
  connectionId: string;
  syncRunId?: string;
  campaignId?: string | null;
  calendarItemId?: string | null;
  providerKey: string;
  externalAccountId?: string | null;
  externalPropertyId?: string | null;
  externalObjectId?: string | null;
  metricKey: NormalizedMetricKey | string;
  metricValue: number | null;
  metricUnit?: string | null;
  dimension?: string | null;
  dimensionValue?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  attributionState?: string;
  confidence?: InsightConfidence;
  sourceMetadata: Record<string, unknown>;
};

export type DiscoveredAccount = {
  externalAccountId: string;
  externalAccountName: string;
  properties?: Array<{ externalPropertyId: string; externalPropertyName: string }>;
};
