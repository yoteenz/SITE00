import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../../../utils/api';
import type { WorldIntakeStep } from '../../../../shared/site00-world-intake/questions';
import '../../styles/site00-world-intake-guest.css';

type GuestSession = {
  rawAnswers: Record<string, { value?: unknown; verbatim?: string }>;
  completionPercentage: number;
  currentStep: string | null;
  submittedAt: string | null;
  synthesized?: Record<string, unknown>;
};

const REVIEW_SECTIONS: Array<{ title: string; questionIds: string[] }> = [
  { title: 'YOUR BUSINESS', questionIds: ['business-model', 'revenue-sources', 'operational-constraints'] },
  { title: 'YOUR CUSTOMERS', questionIds: ['audience-who', 'audience-need'] },
  { title: 'WHAT YOU OFFER', questionIds: ['offerings-primary', 'offerings-live'] },
  { title: 'HOW YOU SHOW UP', questionIds: ['expression-context'] },
  { title: 'HOW FAR WE CAN PUSH IT', questionIds: ['hard-boundaries'] },
  { title: 'HOW YOU WANT PEOPLE TO ENTER', questionIds: ['entry-experience'] },
  { title: 'HOW CUSTOMERS EXIST INSIDE IT', questionIds: ['customer-identity', 'avatar-customization'] },
  { title: 'HOW YOU EXIST INSIDE IT', questionIds: ['founder-presence', 'ai-representation'] },
  { title: 'HOW PEOPLE BUY / BOOK / PARTICIPATE', questionIds: ['commerce-feel', 'live-interaction'] },
  { title: 'WHAT SHOULD NEVER HAPPEN', questionIds: ['hard-boundaries', 'founder-world-hypothesis'] },
];

function answerText(rawAnswers: GuestSession['rawAnswers'], questionId: string): string {
  const entry = rawAnswers[questionId];
  if (!entry) return '—';
  const v = entry.verbatim ?? entry.value;
  return typeof v === 'string' && v.trim() ? v : '—';
}

type ResolvePayload = {
  ok: boolean;
  invite: { projectDisplayName: string; recipientLabel: string; status: string };
  session: GuestSession;
  steps: WorldIntakeStep[];
  readOnly: boolean;
  error?: string;
};

async function worldIntakeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed ${res.status}`);
  return data;
}

export default function WorldIntakeGuestPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<ResolvePayload | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const reload = useCallback(async () => {
    if (!token) return;
    try {
      const data = await worldIntakeFetch<ResolvePayload>(
        `/api/site00/world-intake?action=resolve&token=${encodeURIComponent(token)}`,
      );
      setPayload(data);
      if (data.session.submittedAt || data.readOnly) setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid or expired link');
    }
  }, [token]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const steps = payload?.steps ?? [];
  const onReview = stepIndex >= steps.length && steps.length > 0;
  const current = onReview ? null : steps[stepIndex];

  useEffect(() => {
    if (!current || !payload) return;
    const existing = payload.session.rawAnswers[current.id];
    if (current.responseMode === 'SINGLE_SELECT') {
      setSelected(typeof existing?.value === 'string' ? existing.value : null);
      setValue('');
    } else {
      setValue(typeof existing?.value === 'string' ? existing.value : '');
      setSelected(null);
    }
  }, [current, payload, stepIndex]);

  const progress = useMemo(() => {
    if (!steps.length) return 0;
    return Math.round(((stepIndex + 1) / steps.length) * 100);
  }, [stepIndex, steps.length]);

  const saveAnswer = useCallback(async () => {
    if (!current || !token || payload?.readOnly) return;
    setSaving(true);
    setError(null);
    try {
      const answerValue = current.responseMode === 'SINGLE_SELECT' ? selected : value;
      await worldIntakeFetch('/api/site00/world-intake?action=autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          answers: [
            {
              questionId: current.id,
              section: current.section,
              value: answerValue,
              verbatim: typeof answerValue === 'string' ? answerValue : undefined,
            },
          ],
          currentSection: current.section,
          currentStep: current.id,
        }),
      });
      setSavedAt(new Date().toLocaleTimeString());
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [current, token, payload?.readOnly, selected, value, reload]);

  const goNext = async () => {
    await saveAnswer();
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else if (stepIndex === steps.length - 1) {
      setStepIndex(steps.length);
    }
  };

  const goBack = () => {
    if (onReview) {
      setStepIndex(steps.length - 1);
      return;
    }
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    await saveAnswer();
    try {
      await worldIntakeFetch('/api/site00/world-intake?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      setSubmitted(true);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
    }
  };

  if (error && !payload) {
    return (
      <div className="site00-world-intake-guest">
        <p className="site00-world-intake-guest__error">{error}</p>
      </div>
    );
  }

  if (!payload || (!current && !onReview)) {
    return <div className="site00-world-intake-guest"><p>Loading…</p></div>;
  }

  if (submitted) {
    return (
      <div className="site00-world-intake-guest">
        <header className="site00-world-intake-guest__header">
          <p className="site00-world-intake-guest__kicker">THANK YOU</p>
          <h1>{payload.invite.projectDisplayName}</h1>
          <p>Your discovery intake is complete. You can return to this link to review what you shared.</p>
        </header>
      </div>
    );
  }

  if (onReview) {
    return (
      <div className="site00-world-intake-guest">
        <header className="site00-world-intake-guest__header">
          <p className="site00-world-intake-guest__kicker">WHAT WE HEARD</p>
          <h1>{payload.invite.projectDisplayName}</h1>
          <p>Review your answers before submitting. You can edit any section.</p>
        </header>
        {REVIEW_SECTIONS.map((section) => (
          <section key={section.title} className="site00-world-intake-guest__review-block">
            <h3>{section.title}</h3>
            {section.questionIds.map((qid) => (
              <p key={qid}>{answerText(payload.session.rawAnswers, qid)}</p>
            ))}
          </section>
        ))}
        {error ? <p className="site00-world-intake-guest__error">{error}</p> : null}
        <div className="site00-world-intake-guest__nav">
          <button type="button" onClick={goBack}>Edit</button>
          <button type="button" onClick={() => void handleSubmit()} disabled={saving}>Submit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="site00-world-intake-guest">
      <header className="site00-world-intake-guest__header">
        <p className="site00-world-intake-guest__kicker">{payload.invite.projectDisplayName}</p>
        <div className="site00-world-intake-guest__progress" aria-label={`Progress ${progress}%`}>
          <div className="site00-world-intake-guest__progress-bar" style={{ width: `${progress}%` }} />
        </div>
        {savedAt ? <p className="site00-world-intake-guest__saved">Saved {savedAt}</p> : null}
      </header>

      <section className="site00-world-intake-guest__step">
        <p className="site00-world-intake-guest__section">{current!.section.replace(/_/g, ' ')}</p>
        <h2>{current!.title}</h2>
        {current!.helper ? <p className="site00-world-intake-guest__helper">{current!.helper}</p> : null}

        {current!.responseMode === 'SINGLE_SELECT' && current!.options ? (
          <div className="site00-world-intake-guest__options">
            {current!.options.map((opt: { id: string; label: string }) => (
              <button
                key={opt.id}
                type="button"
                className={selected === opt.id ? 'site00-world-intake-guest__option--active' : ''}
                onClick={() => setSelected(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            className="site00-world-intake-guest__textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={current!.placeholder ?? 'Your answer…'}
            rows={6}
          />
        )}

        {error ? <p className="site00-world-intake-guest__error">{error}</p> : null}

        <div className="site00-world-intake-guest__nav">
          <button type="button" onClick={goBack} disabled={stepIndex === 0}>
            Back
          </button>
          <button type="button" onClick={() => void goNext()} disabled={saving}>
            {stepIndex < steps.length - 1 ? 'Continue' : 'Review'}
          </button>
        </div>
      </section>
    </div>
  );
}
