import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAuthUser } from './_lib/auth.js';
import { fromProfileRow } from './_lib/profileMapping.js';
import { stripPrivilegedProfileBody } from './_lib/profilePrivilegedFields.js';

/**
 * Profile API — uses createClient inline + manual JSON (same pattern as special-offer-config / session-restore)
 * so Vercel bundling does not hit resolution/runtime edge cases that yield FUNCTION_INVOCATION_FAILED.
 */

/**
 * Postgres / Supabase can return `bigint` for some numeric columns; `JSON.stringify` throws on BigInt.
 */
function jsonSafeForResponse(value: unknown): unknown {
  if (typeof value === 'bigint') return Number(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((v) => jsonSafeForResponse(v));
  if (value !== null && typeof value === 'object') {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      o[k] = jsonSafeForResponse(v);
    }
    return o;
  }
  return value;
}

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  try {
    const safe =
      status >= 200 && status < 300 && body !== null && typeof body === 'object'
        ? jsonSafeForResponse(body)
        : body;
    const json = JSON.stringify(safe);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(json);
  } catch (e) {
    console.error('[api/profile] sendJson failed:', e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('JSON serialization failed');
  }
}

function createUserSupabase(accessToken: string): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function parseJsonBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      const p = JSON.parse(b) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

function normalizeProfileText(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const v = input.trim();
  if (!v) return null;
  if (v.toLowerCase().startsWith('data:image/')) return null;
  const u = v.toUpperCase();
  if (u === 'EMPTY' || u === 'NULL' || u === 'N/A' || u === 'NA') return null;
  return v;
}

function coerceTextColumn(input: unknown): string | null {
  if (input == null) return null;
  if (typeof input === 'number' && !Number.isNaN(input)) return String(input);
  if (typeof input === 'string') {
    const t = input.trim();
    return t ? t : null;
  }
  return null;
}

function coerceJsonbValue(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return null;
    if (t.startsWith('{') || t.startsWith('[')) {
      try {
        return JSON.parse(t) as unknown;
      } catch {
        return null;
      }
    }
    return null;
  }
  return value;
}

const JSONB_ROW_KEYS = [
  'default_address',
  'shipping_address',
  'saved_addresses',
  'unlocked_discounts',
  'voucher_list',
  'voucher_history',
  'digital_cash_history',
  'welcome_discount_tiers_credited_by_period',
  'user_submitted_reviews',
  'affiliate_submitted_content',
  'signed_order_forms',
  'review_supplemental_overlay',
] as const;

function sanitizeRowForUpsert(row: Record<string, unknown>): Record<string, unknown> {
  const out = { ...row };
  if ('birthday' in out) out.birthday = coerceTextColumn(out.birthday);
  if ('phone_number' in out) out.phone_number = coerceTextColumn(out.phone_number);
  for (const k of JSONB_ROW_KEYS) {
    if (k in out) (out as Record<string, unknown>)[k] = coerceJsonbValue(out[k]);
  }
  return out;
}

function toProfileRow(profile: Record<string, unknown>) {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role ?? null,
    first_name: normalizeProfileText(profile.firstName),
    last_name: normalizeProfileText(profile.lastName),
    phone_number: coerceTextColumn(profile.phoneNumber),
    birthday: coerceTextColumn(profile.birthday),
    facebook: profile.facebook ?? null,
    instagram: profile.instagram ?? null,
    youtube: profile.youtube ?? null,
    tiktok: profile.tiktok ?? null,
    twitter: profile.twitter ?? null,
    profile_image: normalizeProfileText(profile.profileImage),
    membership_type: profile.membershipType ?? null,
    subscription_tier: profile.subscriptionTier ?? null,
    auto_renew_membership:
      typeof profile.autoRenewMembership === 'boolean' ? profile.autoRenewMembership : undefined,
    current_tier_name: profile.currentTierName ?? profile.tier ?? null,
    default_address: coerceJsonbValue(profile.defaultAddress),
    shipping_address: coerceJsonbValue(profile.shippingAddress),
    saved_addresses: coerceJsonbValue(profile.savedAddresses),
    referral_code: profile.referralCode ?? null,
    gift_card_balance: Number(profile.giftCardBalance) || 0,
    has_made_first_purchase: Boolean(profile.hasMadeFirstPurchase),
    loyalty_points: Number(profile.loyaltyPoints) || 0,
    unlocked_discounts: coerceJsonbValue(profile.unlockedDiscounts),
    voucher_list: coerceJsonbValue(profile.voucherList),
    voucher_history: coerceJsonbValue(profile.voucherHistory),
    digital_cash_history: coerceJsonbValue(profile.digitalCashHistory),
    welcome_discount_tiers_credited_by_period: coerceJsonbValue(profile.welcomeDiscountTiersCreditedByPeriod),
    notification_newsletter:
      typeof profile.notificationNewsletter === 'boolean' ? profile.notificationNewsletter : true,
    notification_sales: typeof profile.notificationSales === 'boolean' ? profile.notificationSales : true,
    notification_order_tracking:
      typeof profile.notificationOrderTracking === 'boolean' ? profile.notificationOrderTracking : true,
    user_submitted_reviews: coerceJsonbValue(profile.userSubmittedReviews),
    affiliate_submitted_content: coerceJsonbValue(profile.affiliateSubmittedContent),
    signed_order_forms: coerceJsonbValue(profile.signedOrderForms),
    review_supplemental_overlay: coerceJsonbValue(profile.reviewSupplementalOverlay),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const supabase = createUserSupabase(user.accessToken);
    if (!supabase) {
      console.error('[api/profile] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
      sendJson(res, 503, { error: 'Server not configured (missing SUPABASE_URL or SUPABASE_ANON_KEY)' });
      return;
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('[api/profile] GET select failed', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId: user.id,
        });
        sendJson(res, 500, {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return;
      }
      if (!data) {
        sendJson(res, 200, null);
        return;
      }
      let mapped: Record<string, unknown>;
      try {
        mapped = fromProfileRow(data as Record<string, unknown>);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Profile mapping failed';
        console.error('[api/profile] GET fromProfileRow:', msg);
        sendJson(res, 500, { error: msg });
        return;
      }
      sendJson(res, 200, mapped);
      return;
    }

    if (req.method === 'PATCH') {
      const body = stripPrivilegedProfileBody(parseJsonBody(req));
      // Never let clients set Stripe-managed billing ids (webhook / create-checkout only).
      const strip = [
        'stripeCustomerId',
        'stripeDefaultPaymentMethodId',
        'stripeSubscriptionId',
        'stripeSubscriptionStatus',
        'lastPaymentFailureAt',
        'stripe_customer_id',
        'stripe_default_payment_method_id',
        'stripe_subscription_id',
        'stripe_subscription_status',
        'subscription_period_end',
        'subscription_purchased_at',
        'last_payment_failure_at',
      ] as const;
      for (const k of strip) {
        delete body[k];
      }
      const { data: existing, error: selectErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (selectErr) {
        console.error('[api/profile] PATCH select existing:', selectErr.message, selectErr);
      }

      let existingApp: Record<string, unknown> = {};
      if (existing) {
        try {
          existingApp = fromProfileRow(existing as Record<string, unknown>);
        } catch (e) {
          console.error('[api/profile] PATCH fromProfileRow(existing):', e);
          existingApp = {};
        }
      }

      const merged = { ...existingApp, ...body, id: user.id, email: user.email };
      const row = sanitizeRowForUpsert(toProfileRow(merged) as Record<string, unknown>);
      row.id = user.id;
      row.email = user.email;
      row.updated_at = new Date().toISOString();
      // Preserve Stripe + period fields from DB so PATCH never wipes them.
      const existingRow = existing as Record<string, unknown> | null;
      const preserveKeys = [
        'stripe_customer_id',
        'stripe_default_payment_method_id',
        'stripe_subscription_id',
        'stripe_subscription_status',
        'subscription_period_end',
        'subscription_purchased_at',
        'last_payment_failure_at',
      ] as const;
      for (const k of preserveKeys) {
        if (existingRow && existingRow[k] != null && existingRow[k] !== '') {
          (row as Record<string, unknown>)[k] = existingRow[k];
        }
      }
      const mergedRec = merged as Record<string, unknown>;
      if (mergedRec.autoRenewMembership === undefined && existingRow?.auto_renew_membership != null) {
        (row as Record<string, unknown>).auto_renew_membership = existingRow.auto_renew_membership;
      }
      if (!existing) {
        row.created_at = new Date().toISOString();
      }

      const { data, error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' }).select().single();
      if (error) {
        console.error('[api/profile] PATCH upsert failed', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId: user.id,
        });
        sendJson(res, 500, {
          error: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details,
        });
        return;
      }

      try {
        const { writeAuditLog } = await import('./_lib/auditLog.js');
        await writeAuditLog({
          actorId: user.id,
          actorEmail: user.email,
          action: 'profile.update',
          resourceType: 'profiles',
          resourceId: user.id,
          details: { updated: true },
        });
      } catch (auditErr) {
        console.error('[api/profile] audit log skipped:', auditErr);
      }

      if (!existing) {
        try {
          const { sendEmailAsync } = await import('./_lib/email/sendEmail.js');
          const mergedRec = merged as Record<string, unknown>;
          const first = String(mergedRec.firstName || mergedRec.first_name || '').trim();
          const last = String(mergedRec.lastName || mergedRec.last_name || '').trim();
          sendEmailAsync({
            templateType: 'welcome',
            recipientEmail: user.email,
            variables: {
              customerName: [first, last].filter(Boolean).join(' ') || 'SLAYER',
            },
          });
        } catch (welcomeErr) {
          console.error('[api/profile] welcome email skipped:', welcomeErr);
        }
      }

      let out: Record<string, unknown>;
      try {
        out = fromProfileRow(data as Record<string, unknown>);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Profile mapping failed';
        console.error('[api/profile] PATCH response fromProfileRow:', msg);
        sendJson(res, 500, { error: msg });
        return;
      }
      sendJson(res, 200, out);
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    console.error('[api/profile] Uncaught:', e);
    sendJson(res, 500, { error: msg });
  }
}
