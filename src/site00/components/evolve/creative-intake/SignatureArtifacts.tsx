import type { CreativeIntakeExperience } from '../../../../../shared/site00-marketing/creativeIntake/types';

type Props = {
  experience: CreativeIntakeExperience;
  form: Record<string, string | string[]>;
  stageIndex: number;
};

function display(v: unknown): string {
  if (v === undefined || v === null) return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return String(v).trim() || '—';
}

export function AttentionMapArtifact({ form, stageIndex }: Omit<Props, 'experience'>) {
  const frames = ['9:16', '4:5', '1:1'];
  const platform = display(form.platforms);

  return (
    <div className="site00-artifact site00-artifact--attention" data-signature-artifact="ATTENTION_MAP">
      <p className="site00-artifact__label">ATTENTION MAP</p>
      <div className="site00-artifact__viewport">
        <div className="site00-artifact__frame-rail">
          {frames.map((f) => (
            <div key={f} className={`site00-artifact__frame site00-artifact__frame--${f.replace(':', 'x')}`}>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="site00-artifact__zones">
          <span className="site00-artifact__zone site00-artifact__zone--hook">HOOK</span>
          <span className="site00-artifact__zone site00-artifact__zone--hold">HOLD</span>
          <span className="site00-artifact__zone site00-artifact__zone--act">ACT</span>
        </div>
      </div>
      <dl className="site00-artifact__meta">
        <div className={stageIndex >= 0 ? ' is-captured' : ''}><dt>PRIMARY SURFACE</dt><dd>{platform}</dd></div>
        <div className={form.campaignObjective ? ' is-captured' : ''}><dt>OBJECTIVE</dt><dd>{display(form.campaignObjective)}</dd></div>
        <div className={form.makingWhat ? ' is-captured' : ''}><dt>HOOK</dt><dd>{display(form.makingWhat)}</dd></div>
        <div className={form.targetAudience ? ' is-captured' : ''}><dt>AUDIENCE</dt><dd>{display(form.targetAudience)}</dd></div>
        <div className={form.copyMessaging ? ' is-captured' : ''}><dt>MESSAGE</dt><dd>{display(form.copyMessaging)}</dd></div>
        <div className={form.additionalNotes ? ' is-captured' : ''}><dt>ACTION</dt><dd>{display(form.additionalNotes)}</dd></div>
      </dl>
      <p className="site00-artifact__truth">Captured intent only — no fabricated metrics.</p>
    </div>
  );
}

export function FilmTreatmentArtifact({ form, stageIndex }: Omit<Props, 'experience'>) {
  return (
    <div className="site00-artifact site00-artifact--film" data-signature-artifact="FILM_TREATMENT">
      <p className="site00-artifact__label">FILM TREATMENT</p>
      <div className="site00-artifact__cinematic-frame">
        <div className="site00-artifact__letterbox" />
        <div className="site00-artifact__frame-center">
          <span className="site00-artifact__timecode">00:00:00:00</span>
        </div>
        <div className="site00-artifact__letterbox" />
      </div>
      <dl className="site00-artifact__meta site00-artifact__meta--slate">
        <div className={stageIndex >= 0 ? ' is-captured' : ''}><dt>INTENT</dt><dd>{display(form.campaignObjective)}</dd></div>
        <div className={form.makingWhat ? ' is-captured' : ''}><dt>SUBJECT</dt><dd>{display(form.makingWhat)}</dd></div>
        <div className={form.restrictions ? ' is-captured' : ''}><dt>WORLD</dt><dd>{display(form.restrictions)}</dd></div>
        <div className={form.copyMessaging ? ' is-captured' : ''}><dt>STORY</dt><dd>{display(form.copyMessaging)}</dd></div>
        <div className={form.deliverableTypes ? ' is-captured' : ''}><dt>FORMAT</dt><dd>{display(form.deliverableTypes)}</dd></div>
        <div className={form.additionalNotes ? ' is-captured' : ''}><dt>SOUND</dt><dd>{display(form.additionalNotes)}</dd></div>
        <div className={form.platforms ? ' is-captured' : ''}><dt>DESTINATION</dt><dd>{display(form.platforms)}</dd></div>
      </dl>
    </div>
  );
}

export function CampaignMapArtifact({ form, stageIndex }: Omit<Props, 'experience'>) {
  const nodes = [
    { key: 'objective', label: 'OBJECTIVE', value: form.campaignObjective, idx: 0 },
    { key: 'audience', label: 'AUDIENCE', value: form.targetAudience, idx: 1 },
    { key: 'message', label: 'MESSAGE', value: form.copyMessaging, idx: 2 },
    { key: 'channels', label: 'CHANNELS', value: form.platforms, idx: 3 },
    { key: 'deliverables', label: 'DELIVERABLES', value: form.deliverableTypes ?? form.additionalNotes, idx: 4 },
    { key: 'timing', label: 'TIMING', value: form.launchDate ?? form.deadline, idx: 5 },
    { key: 'measurement', label: 'MEASUREMENT', value: form.restrictions, idx: 6 },
  ];

  return (
    <div className="site00-artifact site00-artifact--campaign" data-signature-artifact="CAMPAIGN_CONTROL">
      <p className="site00-artifact__label">CAMPAIGN MAP</p>
      <ol className="site00-artifact__campaign-chain">
        {nodes.map((n, i) => (
          <li key={n.key} className={`${n.value ? 'is-captured' : ''}${stageIndex === n.idx ? ' is-active' : ''}`}>
            <span className="site00-artifact__node-label">{n.label}</span>
            <span className="site00-artifact__node-value">{display(n.value)}</span>
            {i < nodes.length - 1 ? <span className="site00-artifact__connector" aria-hidden>↓</span> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function StoryFileArtifact({ form, stageIndex }: Omit<Props, 'experience'>) {
  return (
    <div className="site00-artifact site00-artifact--editorial" data-signature-artifact="STORY_FILE">
      <p className="site00-artifact__label">STORY FILE</p>
      <div className="site00-artifact__story-tabs">
        {['ANGLE', 'SUBJECT', 'READER', 'THESIS', 'FORMAT', 'DISTRIBUTION'].map((tab, i) => (
          <span key={tab} className={`site00-artifact__story-tab${stageIndex >= i ? ' is-filed' : ''}`}>{tab}</span>
        ))}
      </div>
      <dl className="site00-artifact__meta">
        <div className={form.campaignObjective ? ' is-captured' : ''}><dt>ANGLE</dt><dd>{display(form.campaignObjective)}</dd></div>
        <div className={form.makingWhat ? ' is-captured' : ''}><dt>SUBJECT</dt><dd>{display(form.makingWhat)}</dd></div>
        <div className={form.targetAudience ? ' is-captured' : ''}><dt>READER</dt><dd>{display(form.targetAudience)}</dd></div>
        <div className={form.copyMessaging ? ' is-captured' : ''}><dt>THESIS</dt><dd>{display(form.copyMessaging)}</dd></div>
      </dl>
    </div>
  );
}

export function renderSignatureArtifact(props: Props) {
  switch (props.experience.signatureArtifact) {
    case 'ATTENTION_MAP':
      return <AttentionMapArtifact {...props} />;
    case 'FILM_TREATMENT':
      return <FilmTreatmentArtifact form={props.form} stageIndex={props.stageIndex} />;
    case 'CAMPAIGN_CONTROL':
      return <CampaignMapArtifact form={props.form} stageIndex={props.stageIndex} />;
    case 'STORY_FILE':
      return <StoryFileArtifact form={props.form} stageIndex={props.stageIndex} />;
    default:
      return null;
  }
}
