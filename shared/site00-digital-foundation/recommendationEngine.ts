import type { DigitalFoundationCommercialConfig, DigitalFoundationIntake, DigitalFoundationRecommendation } from './types.js';
import type { SelectedAddonInput } from './quoteEngine.js';
import { buildQuoteLines, calculateQuoteTotals } from './quoteEngine.js';

function pushUnique(list: string[], item: string) {
  if (!list.includes(item)) list.push(item);
}

export function recommendFromIntake(
  intake: DigitalFoundationIntake,
  config: DigitalFoundationCommercialConfig,
): { selections: SelectedAddonInput[]; recommendation: DigitalFoundationRecommendation } {
  const selections: SelectedAddonInput[] = [];
  const site00_handles: string[] = [
    'Business / domain consultation',
    'Domain ownership configuration guidance',
    'Professional email setup (MX, SPF, DKIM, DMARC)',
    'One primary device setup guidance',
    'One professional email signature',
    'Digital ownership record',
    'SITE 00 build-readiness check',
  ];
  const client_must_provide: string[] = [];
  const third_party_costs: string[] = [
    'Domain registration (registrar)',
    'Google Workspace or Microsoft 365 (if applicable)',
  ];
  const dependencies: string[] = [];
  const manual_review_reasons: string[] = [];

  const needs = new Set(intake.needs ?? []);

  if (needs.has('NEED_DOMAIN') && !needs.has('OWN_DOMAIN')) {
    pushUnique(client_must_provide, 'Preferred domain names for approval');
  }
  if (needs.has('OWN_DOMAIN') || needs.has('LOST_DOMAIN')) {
    if (needs.has('LOST_DOMAIN')) {
      selections.push({ addon_id: 'DOMAIN_RECOVERY', quantity: 1 });
      manual_review_reasons.push('Domain recovery may require custom review.');
    } else {
      pushUnique(client_must_provide, 'Registrar access or authorization to connect existing domain');
    }
  }
  if (needs.has('NEED_MULTI_MAILBOX')) {
    selections.push({ addon_id: 'ADDITIONAL_MAILBOX', quantity: Math.max(2, intake.team_size ? intake.team_size - 1 : 2) });
  }
  if (needs.has('NEED_MIGRATION')) {
    selections.push({ addon_id: 'LEGACY_EMAIL_MIGRATION', quantity: 1 });
    manual_review_reasons.push('Migration scope depends on source provider and volume.');
  }
  // Standard email security + one primary device are included in base foundation scope.
  // Additional devices and advanced DNS remediation are paid add-ons only when quantity/extra work applies.
  if (needs.has('NEED_DEVICE') && (intake.team_size ?? 1) > 1) {
    selections.push({
      addon_id: 'ADDITIONAL_DEVICE_SETUP',
      quantity: Math.max(1, (intake.team_size ?? 2) - 1),
    });
  }
  if (needs.has('HAVE_WEBSITE')) {
    selections.push({ addon_id: 'EXISTING_SITE_DOMAIN_CONFLICT', quantity: 1 });
  }
  // NEED_DNS_SECURITY alone does not add Advanced DNS Cleanup (included standard security configuration).
  if ((intake.team_size ?? 0) > 3) {
    selections.push({ addon_id: 'MULTI_USER_WORKSPACE_SETUP', quantity: 1 });
  }
  if (needs.has('UNSURE')) {
    pushUnique(client_must_provide, 'Brief call or async clarification after intake');
  }

  pushUnique(client_must_provide, 'Payment after quote acceptance');
  pushUnique(client_must_provide, 'No passwords in this form — access via provider invite when needed');

  const lines = buildQuoteLines(selections, config);
  const totals = calculateQuoteTotals(lines, config);
  const manual_review = lines.some((l) => l.requires_manual_review) || manual_review_reasons.length > 0;

  const recommendation: DigitalFoundationRecommendation = {
    title: 'YOUR DIGITAL FOUNDATION',
    recommended_addons: lines,
    site00_handles,
    client_must_provide,
    third_party_costs,
    projected_investment_minor: totals.subtotal_minor,
    projected_min_days: totals.projected_min_days,
    projected_max_days: totals.projected_max_days,
    timeline_custom_review: totals.timeline_custom_review,
    dependencies,
    manual_review,
    manual_review_reasons,
  };

  return { selections, recommendation };
}

export function inferBuildRecommendation(intake: DigitalFoundationIntake): {
  level: 'SIMPLE_BUILD' | 'ADVANCED_BUILD' | 'CUSTOM_BUILD' | 'NONE';
  readiness: {
    site_needed: boolean;
    site_type: string | null;
    primary_customer_action: string | null;
    recommended_structure: string | null;
    brand_readiness: string | null;
    content_readiness: string | null;
  };
} {
  const needs = new Set(intake.needs ?? []);
  const wantsSite = needs.has('EVENTUAL_WEBSITE') || intake.future_website_interest === 'yes';
  if (!wantsSite) {
    return {
      level: 'NONE',
      readiness: {
        site_needed: false,
        site_type: null,
        primary_customer_action: null,
        recommended_structure: null,
        brand_readiness: intake.branding_status ?? null,
        content_readiness: null,
      },
    };
  }
  const advanced =
    (intake.team_size ?? 0) > 5 ||
    needs.has('HAVE_WEBSITE') ||
    intake.website_status === 'existing_complex';
  if (advanced) {
    return {
      level: 'ADVANCED_BUILD',
      readiness: {
        site_needed: true,
        site_type: 'multi-section business site',
        primary_customer_action: 'contact_or_book',
        recommended_structure: 'Blueprint after Foundation completion',
        brand_readiness: intake.branding_status ?? 'unknown',
        content_readiness: 'to_be_collected',
      },
    };
  }
  return {
    level: 'SIMPLE_BUILD',
    readiness: {
      site_needed: true,
      site_type: 'focused business presence',
      primary_customer_action: 'contact',
      recommended_structure: 'Starter SITE 00 build path',
      brand_readiness: intake.branding_status ?? 'unknown',
      content_readiness: 'light',
    },
  };
}
