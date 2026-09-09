/**
 * B5.9R10 — Client simulation context and membership types.
 */

export type ClientSimulationStatus = 'ACTIVE' | 'INACTIVE';

export type ClientProjectMembershipRole = 'CLIENT_MEMBER' | 'CLIENT_OWNER' | 'CLIENT_REVIEWER';

export type ClientProjectMembership = {
  clientId: string;
  projectId: string;
  role: ClientProjectMembershipRole;
  permissions: string[];
  status: ClientSimulationStatus;
  createdAt: string;
};

export type ClientSimulationSource = 'DEMO_FIXTURE' | 'SITE00_IDENTITIES' | 'PROJECT_OWNER';

export type ClientSimulationContext = {
  clientId: string;
  userId?: string | null;
  accountId?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  companyName?: string | null;
  projectIds: string[];
  projectCount: number;
  activeProjectCount: number;
  lastActiveAt?: string | null;
  isDemoFixture: boolean;
  source: ClientSimulationSource;
  status: ClientSimulationStatus;
};

export type ClientDirectorySearchResult = ClientSimulationContext & {
  projectLabels: string[];
  matchReason?: string | null;
};

export type ActiveClientSimulationState = {
  viewMode: 'FOUNDER' | 'CLIENT';
  activeSimulatedClientId: string | null;
  clientSelectorOpen: boolean;
};
