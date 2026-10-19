import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import { SITE00_ROUTES } from '../../../config/routes';
import { foundationAdminApi } from '../../services/foundationAdminApi';
import { FounderWorkspacePageFrame } from '../shell/FounderWorkspacePageFrame';
import { useFounderWorkspaceOverlay } from '../overlay/OverlayContext';

export function CorrespondencePage() {
  const { openOverlay } = useFounderWorkspaceOverlay();
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);
  const [artifacts, setArtifacts] = useState<Array<{ artifact_id: string; business_name?: string | null }>>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void foundationAdminApi
      .emailTimeline()
      .then((j) => setEvents((j.events as Array<Record<string, unknown>>) ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : 'Timeline load failed'));
    void foundationAdminApi
      .list()
      .then((j) => setArtifacts(j.artifacts ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedArtifact) return;
    void foundationAdminApi
      .messages(selectedArtifact)
      .then((j) => setMessages((j.messages as Array<Record<string, unknown>>) ?? []))
      .catch(() => setMessages([]));
  }, [selectedArtifact]);

  return (
    <FounderWorkspacePageFrame destination="correspondence">
      <div className="ifw-correspondence">
        {error ? (
          <p role="alert" className="ifw-inline-error">
            {error}
          </p>
        ) : null}
        <p className="ifw-lede">Stored intents and messages only — staging send remains gated.</p>
        <div className="ifw-actions-row">
          <Link className="ifw-btn ifw-btn--ghost" to={SITE00_ROUTES.digitalFoundationCommunications}>
            Legacy communications command
          </Link>
          <Link className="ifw-btn ifw-btn--ghost" to={SITE00_ADMIN_ROUTES.correspondenceStudio}>
            Correspondence studio
          </Link>
          <button type="button" className="ifw-btn ifw-btn--ghost" onClick={() => openOverlay('OL-15')}>
            Send gate
          </button>
        </div>
        <div className="ifw-correspondence__grid">
          <section className="ifw-panel">
            <h2 className="ifw-panel__title">Email timeline</h2>
            <ul className="ifw-list">
              {events.slice(0, 12).map((ev, i) => (
                <li key={String(ev.intent_id ?? i)} className="fw-data">
                  {String(ev.status ?? '—')} · {String(ev.template_id ?? '—')}
                </li>
              ))}
              {!events.length ? <li className="ifw-muted">No timeline events</li> : null}
            </ul>
          </section>
          <section className="ifw-panel">
            <h2 className="ifw-panel__title">Client thread</h2>
            <select
              className="ifw-field__input fw-data"
              value={selectedArtifact ?? ''}
              onChange={(e) => setSelectedArtifact(e.target.value || null)}
            >
              <option value="">Select client</option>
              {artifacts.map((a) => (
                <option key={a.artifact_id} value={a.artifact_id}>
                  {a.business_name ?? a.artifact_id.slice(0, 8)}
                </option>
              ))}
            </select>
            <ul className="ifw-list">
              {messages.map((m, i) => (
                <li key={i}>{String((m as { body?: string }).body ?? '—')}</li>
              ))}
            </ul>
            <button
              type="button"
              className="ifw-btn ifw-btn--primary"
              disabled={!selectedArtifact}
              onClick={() => openOverlay('OL-14', { artifact_id: selectedArtifact })}
            >
              Compose message
            </button>
          </section>
        </div>
      </div>
    </FounderWorkspacePageFrame>
  );
}
