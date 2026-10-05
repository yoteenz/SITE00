import type { CreativeThread } from '../../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';

type Props = {
  open: boolean;
  thread: CreativeThread | null;
  message: string;
  onMessage: (v: string) => void;
  onSend: () => void;
  onRun: () => void;
  busy: boolean;
};

export function CreativeConversationDock({ open, thread, message, onMessage, onSend, onRun, busy }: Props) {
  if (!open) return null;
  return (
    <section className="ec-cw-conversation" aria-label="Creative conversation">
      <h3>Conversation</h3>
      <div className="ec-cw-conversation__thread">
        {(thread?.messages ?? []).slice(-6).map((m) => (
          <div key={m.message_id} className={`ec-cw-conversation__msg ec-cw-conversation__msg--${m.role}`}>
            <span>{m.role}</span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <label className="ec-cw-field">
        Founder input
        <textarea value={message} onChange={(e) => onMessage(e.target.value)} rows={3} placeholder="Territory B feels too operational…" />
      </label>
      <div className="ec-cw-conversation__actions">
        <button type="button" className="ec-cw-btn ec-cw-btn--ghost" disabled={busy} onClick={onSend}>
          Send
        </button>
        <button type="button" className="ec-cw-btn" disabled={busy} onClick={onRun}>
          Run → update canvas
        </button>
      </div>
    </section>
  );
}
