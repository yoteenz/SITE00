import type { SendIntentStatus } from '../../../../shared/site00-digital-foundation/communications/types.js';
import * as mem from '../memoryStore.js';
import { fetchResendEmailStatus } from './resendAdapter.js';

function mapResendLastEvent(last: string | null | undefined): SendIntentStatus | null {
  switch (last) {
    case 'delivered':
      return 'DELIVERED';
    case 'bounced':
      return 'BOUNCED';
    case 'complained':
      return 'COMPLAINED';
    case 'sent':
      return 'SENT';
    case 'delivery_delayed':
      return 'SENT';
    default:
      return null;
  }
}

/** Poll Resend for delivery state — never upgrades to DELIVERED without provider signal. */
export async function refreshIntentDeliveryFromResend(intentId: string): Promise<{ updated: boolean; status?: SendIntentStatus }> {
  const state = mem.getDfMemoryState();
  const intent = [...state.sendIntents.values()].find((i) => i.intent_id === intentId);
  if (!intent?.provider_message_id) return { updated: false };

  const remote = await fetchResendEmailStatus(intent.provider_message_id);
  if (!remote.ok) return { updated: false };

  const mapped = mapResendLastEvent(remote.last_event);
  if (!mapped) return { updated: false };

  if (intent.status !== mapped) {
    intent.status = mapped;
    intent.provider_status_at = new Date().toISOString();
    if (remote.last_event) {
      intent.last_error = remote.last_event === 'bounced' ? 'Provider reported bounce' : null;
    }
    return { updated: true, status: mapped };
  }
  return { updated: false, status: intent.status };
}
