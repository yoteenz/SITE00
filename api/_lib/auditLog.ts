/**
 * Optional audit trail for profile/admin mutations.
 * Best-effort: logs to Supabase when `audit_logs` exists; otherwise console only.
 */
import { getSupabaseAdmin } from './supabase.js';

export type AuditLogEntry = {
  actorId: string;
  actorEmail?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
};

export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('audit_logs').insert({
      actor_id: entry.actorId,
      actor_email: entry.actorEmail ?? null,
      action: entry.action,
      resource_type: entry.resourceType ?? null,
      resource_id: entry.resourceId ?? null,
      details: entry.details ?? {},
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.info('[auditLog]', entry.action, entry.actorId, error.message);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.info('[auditLog]', entry.action, entry.actorId, message);
  }
}
