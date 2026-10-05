/**
 * P0.5D.2 — Client intelligence configuration builder.
 */

import type { ClientIntelligenceConfiguration } from './types.js';

export function buildDefaultClientIntelligenceConfiguration(projectId: string): ClientIntelligenceConfiguration {
  return {
    configId: `cic-${projectId}`,
    projectId,
    signalDomains: [
      'NEWS',
      'ENTERTAINMENT',
      'BUSINESS',
      'TECHNOLOGY',
      'CONSUMER_BEHAVIOR',
      'INTERNET_CULTURE',
      'DATA_RELEASES',
      'MANUAL_FOUNDER',
    ],
    geographicRelevance: ['US', 'GLOBAL'],
    culturalContext: ['internet-native', 'consumer', 'workplace', 'money'],
    riskTolerance: 'MEDIUM',
    responseSpeed: 'STANDARD',
    forecastHorizonDays: 14,
    excludedDomains: [],
    approvalRequired: true,
    enabledSourceFamilies: ['WEB_NEWS', 'KNOWN_UPCOMING', 'MANUAL_EDITORIAL', 'MANUAL_RESEARCH'],
    disabledSourceFamilies: ['SEARCH_BEHAVIOR', 'SOCIAL_PLATFORM'],
    priorityDomains: [
      'culture',
      'entertainment',
      'consumer behavior',
      'money',
      'workplace',
      'technology',
      'internet culture',
      'business',
      'research',
      'design',
    ],
    geographies: ['US'],
    languages: ['en'],
    knownEventCategories: ['AWARD_SHOWS', 'DATA_RELEASES', 'PRODUCT_LAUNCH'],
    riskSensitivity: 'MEDIUM',
    rapidResponseEnabled: true,
  };
}
