/**
 * Business Offering Map — structured from founder free-text offerings.
 */

import type { BusinessOffering, BusinessOfferingMap } from './types.js';
import { BUSINESS_OFFERING_MAP_VERSION } from './constants.js';

function inferOfferingType(line: string): BusinessOffering['type'] {
  const lower = line.toLowerCase();
  if (/book|appointment|session|reading|consult/.test(lower)) return 'BOOKING';
  if (/live|stream|video call/.test(lower)) return 'LIVE_SERVICE';
  if (/membership|subscription/.test(lower)) return 'MEMBERSHIP';
  if (/event|workshop|class/.test(lower)) return 'EVENT';
  if (/digital|download|course|pdf/.test(lower)) return 'DIGITAL_PRODUCT';
  if (/product|shop|merch|physical/.test(lower)) return 'PRODUCT';
  if (/service|coaching|design/.test(lower)) return 'SERVICE';
  return 'OTHER';
}

export function buildBusinessOfferingMap(params: {
  offeringsText: string | null | undefined;
  liveServicesText: string | null | undefined;
}): BusinessOfferingMap {
  const lines = (params.offeringsText ?? '')
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const liveLines = (params.liveServicesText ?? '')
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const offerings: BusinessOffering[] = lines.map((name, i) => ({
    offeringId: `offering-${i + 1}`,
    name,
    type: inferOfferingType(name),
    description: name,
    customerGoal: '',
    purchaseRequired: !/free|complimentary/.test(name.toLowerCase()),
    bookingRequired: inferOfferingType(name) === 'BOOKING' || inferOfferingType(name) === 'LIVE_SERVICE',
    livePresenceRequired: inferOfferingType(name) === 'LIVE_SERVICE',
    deliveryMode: null,
    fulfillmentMode: null,
    repeatable: true,
    priority: i === 0 ? 'PRIMARY' : 'SECONDARY',
    dependencies: [],
  }));

  for (const name of liveLines) {
    if (offerings.some((o) => o.name.toLowerCase() === name.toLowerCase())) continue;
    offerings.push({
      offeringId: `offering-live-${offerings.length + 1}`,
      name,
      type: 'LIVE_SERVICE',
      description: name,
      customerGoal: '',
      purchaseRequired: true,
      bookingRequired: true,
      livePresenceRequired: true,
      deliveryMode: 'live',
      fulfillmentMode: null,
      repeatable: true,
      priority: 'SECONDARY',
      dependencies: [],
    });
  }

  return {
    version: BUSINESS_OFFERING_MAP_VERSION,
    offerings,
    extractedAt: new Date().toISOString(),
  };
}
