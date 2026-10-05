import type { CreativeIntakeExperience } from '../../../../../shared/site00-marketing/creativeIntake/types';

type Props = {
  experience: CreativeIntakeExperience;
  form: Record<string, string | string[]>;
  stageIndex: number;
};

function display(v: unknown): string {
  if (v === undefined || v === null) return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  const s = String(v).trim();
  return s || 'PENDING';
}

function capturedClass(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.length ? ' is-captured' : '';
  return String(value).trim() ? ' is-captured' : '';
}

export function AttentionMapArtifact({ form }: Omit<Props, 'experience'>) {
  const frames = ['9:16', '4:5', '1:1'];

  return (
    <div className="site00-artifact site00-artifact--dark site00-artifact--attention" data-signature-artifact="ATTENTION_MAP">
      <p className="site00-artifact__label">ATTENTION MAP</p>
      <div className="site00-artifact__viewport">
        <div className="site00-artifact__frame-rail">
          {frames.map((f) => (
            <div key={f} className={`site00-artifact__frame site00-artifact__frame--${f.replace(':', 'x')}`}>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="site00-artifact__phone-wireframe" aria-hidden>
          <div className="site00-artifact__zone site00-artifact__zone--hook">HOOK · STOP THE SCROLL</div>
          <div className="site00-artifact__zone site00-artifact__zone--hold">HOLD · KEEP ATTENTION</div>
          <div className="site00-artifact__zone site00-artifact__zone--act">ACT · DRIVE ACTION</div>
        </div>
      </div>
      <dl className="site00-artifact__meta">
        <div className={capturedClass(form.platforms)}><dt>PRIMARY SURFACE</dt><dd>{display(form.platforms)}</dd></div>
        <div className={capturedClass(form.campaignObjective)}><dt>OBJECTIVE</dt><dd>{display(form.campaignObjective)}</dd></div>
        <div className={capturedClass(form.makingWhat)}><dt>HOOK</dt><dd>{display(form.makingWhat)}</dd></div>
        <div className={capturedClass(form.targetAudience)}><dt>AUDIENCE</dt><dd>{display(form.targetAudience)}</dd></div>
        <div className={capturedClass(form.copyMessaging)}><dt>MESSAGE</dt><dd>{display(form.copyMessaging)}</dd></div>
        <div className={capturedClass(form.additionalNotes)}><dt>ACTION</dt><dd>{display(form.additionalNotes)}</dd></div>
      </dl>
      <p className="site00-artifact__truth">CAPTURED INTENT ONLY — NO FABRICATED METRICS.</p>
    </div>
  );
}

export function UgcStyleGuideArtifact({ form, stageIndex }: Omit<Props, 'experience'>) {
  const pillars = [
    { label: 'HUMAN FIRST', key: 'targetAudience' },
    { label: 'NATURAL CAPTURE', key: 'makingWhat' },
    { label: 'RELATABLE CONTEXT', key: 'productService' },
    { label: 'HONEST DELIVERY', key: 'copyMessaging' },
    { label: 'BRAND ALIGNED', key: 'businessName' },
    { label: 'ACTION ORIENTED', key: 'additionalNotes' },
  ];

  return (
    <div className="site00-artifact site00-artifact--dark site00-artifact--ugc" data-signature-artifact="UGC_STYLE_GUIDE">
      <p className="site00-artifact__label">UGC STYLE GUIDE</p>
      <ul className="site00-artifact__ugc-pillars">
        {pillars.map((p, i) => (
          <li key={p.label} className={`${capturedClass(form[p.key])}${stageIndex >= i ? ' is-active' : ''}`}>
            <span className="site00-artifact__ugc-icon" aria-hidden>◈</span>
            <span>{p.label}</span>
            <span className="site00-artifact__ugc-value">{display(form[p.key])}</span>
          </li>
        ))}
      </ul>
      <p className="site00-artifact__truth site00-artifact__corner-mark">GUIDE ONLY — YOUR CREATIVE DIRECTION DEFINES THE FINAL LOOK.</p>
    </div>
  );
}

export function FilmTreatmentArtifact({ form }: Omit<Props, 'experience'>) {
  return (
    <div className="site00-artifact site00-artifact--dark site00-artifact--film" data-signature-artifact="FILM_TREATMENT">
      <p className="site00-artifact__label">FILM TREATMENT MONITOR</p>
      <div className="site00-artifact__cinematic-frame">
        <div className="site00-artifact__letterbox" />
        <div className="site00-artifact__frame-center">
          <span className="site00-artifact__timecode">TC 00:00:00:00</span>
        </div>
        <div className="site00-artifact__letterbox" />
      </div>
      <dl className="site00-artifact__meta site00-artifact__meta--slate">
        <div className={capturedClass(form.campaignObjective)}><dt>PROJECT</dt><dd>{display(form.businessName)}</dd></div>
        <div className={capturedClass(form.campaignObjective)}><dt>INTENT</dt><dd>{display(form.campaignObjective)}</dd></div>
        <div className={capturedClass(form.makingWhat)}><dt>SUBJECT</dt><dd>{display(form.makingWhat)}</dd></div>
        <div className={capturedClass(form.restrictions)}><dt>WORLD</dt><dd>{display(form.restrictions)}</dd></div>
        <div className={capturedClass(form.copyMessaging)}><dt>TREATMENT</dt><dd>{display(form.copyMessaging)}</dd></div>
        <div className={capturedClass(form.deliverableTypes)}><dt>FORMAT</dt><dd>{display(form.deliverableTypes)}</dd></div>
        <div className={capturedClass(form.platforms)}><dt>DESTINATION</dt><dd>{display(form.platforms)}</dd></div>
      </dl>
      <p className="site00-artifact__truth">PRE-PRODUCTION — NO FABRICATED FOOTAGE.</p>
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
    { key: 'authority', label: 'AUTHORITY', value: form.businessName, idx: 7 },
  ];

  return (
    <div className="site00-artifact site00-artifact--dark site00-artifact--campaign" data-signature-artifact="CAMPAIGN_CONTROL">
      <p className="site00-artifact__label">CAMPAIGN MAP</p>
      <ol className="site00-artifact__campaign-chain">
        {nodes.map((n, i) => (
          <li key={n.key} className={`${capturedClass(n.value)}${stageIndex === n.idx ? ' is-active' : ''}`}>
            <span className="site00-artifact__node-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="site00-artifact__node-label">{n.label}</span>
            <span className="site00-artifact__node-value">{display(n.value)}</span>
            {i < nodes.length - 1 ? <span className="site00-artifact__connector" aria-hidden>│</span> : null}
          </li>
        ))}
      </ol>
      <p className="site00-artifact__truth">THIS MAP BUILDS AS YOU COMPLETE EACH STEP.</p>
    </div>
  );
}

export function ProductStageArtifact({ form, stageIndex }: Omit<Props, 'experience'>) {
  const zones = [
    { label: 'PRODUCT', value: form.productService, idx: 0 },
    { label: 'DESIRE', value: form.campaignObjective, idx: 1 },
    { label: 'POSITIONING', value: form.copyMessaging, idx: 2 },
    { label: 'PROOF', value: form.additionalNotes, idx: 3 },
    { label: 'DELIVERABLES', value: form.deliverableTypes, idx: 4 },
    { label: 'SURFACES', value: form.platforms, idx: 5 },
    { label: 'CONVERSION', value: form.targetAudience, idx: 6 },
  ];

  return (
    <div className="site00-artifact site00-artifact--dark site00-artifact--product" data-signature-artifact="PRODUCT_STAGE">
      <p className="site00-artifact__label">PRODUCT STAGE</p>
      <div className="site00-artifact__product-frame">
        <div className="site00-artifact__product-placeholder">
          <span className="site00-artifact__product-coords">OBJ / STAGE</span>
          <span className="site00-artifact__product-name">{display(form.productService)}</span>
        </div>
      </div>
      <dl className="site00-artifact__meta">
        {zones.map((z) => (
          <div key={z.label} className={`${capturedClass(z.value)}${stageIndex === z.idx ? ' is-active' : ''}`}>
            <dt>{z.label}</dt>
            <dd>{display(z.value)}</dd>
          </div>
        ))}
      </dl>
      <p className="site00-artifact__truth">NO FABRICATED PRODUCT ASSETS — TECHNICAL PLACEHOLDER ONLY.</p>
    </div>
  );
}

export function LaunchBlueprintArtifact({ form, stageIndex }: Omit<Props, 'experience'>) {
  const sequence = [
    { label: 'TEASE', idx: 0 },
    { label: 'BUILD', idx: 1 },
    { label: 'REVEAL', idx: 2 },
    { label: 'AMPLIFY', idx: 3 },
    { label: 'CONVERT', idx: 4 },
    { label: 'LAUNCH', idx: 5 },
  ];
  const launchType = display(form.campaignObjective);

  return (
    <div className="site00-artifact site00-artifact--dark site00-artifact--launch" data-signature-artifact="LAUNCH_BLUEPRINT">
      <p className="site00-artifact__label">LAUNCH BLUEPRINT</p>
      <p className="site00-artifact__subtitle">BUILDING THE MOMENT</p>
      <div className={capturedClass(form.campaignObjective)}>
        <span className="site00-artifact__launch-type">{launchType}</span>
      </div>
      <ol className="site00-artifact__launch-sequence">
        {sequence.map((s, i) => (
          <li key={s.label} className={`${stageIndex >= s.idx ? ' is-captured' : ''}${stageIndex === s.idx ? ' is-active' : ''}`}>
            <span className="site00-artifact__node-num">{String(i + 1).padStart(2, '0')}</span>
            <span>{s.label}</span>
            {i < sequence.length - 1 ? <span className="site00-artifact__connector" aria-hidden>↓</span> : null}
          </li>
        ))}
      </ol>
      <dl className="site00-artifact__meta">
        <div className={capturedClass(form.makingWhat)}><dt>GOAL</dt><dd>{display(form.makingWhat)}</dd></div>
        <div className={capturedClass(form.copyMessaging)}><dt>HOOK</dt><dd>{display(form.copyMessaging)}</dd></div>
        <div className={capturedClass(form.launchDate)}><dt>WINDOW</dt><dd>{display(form.launchDate)}</dd></div>
      </dl>
      <p className="site00-artifact__truth site00-artifact__corner-mark">ONE IDEA. ONE MOMENT. MAXIMUM IMPACT.</p>
    </div>
  );
}

export function ContentSystemMapArtifact({ form }: Omit<Props, 'experience'>) {
  const pillars = display(form.copyMessaging);
  const formats = display(form.deliverableTypes);

  return (
    <div className="site00-artifact site00-artifact--dark site00-artifact--system" data-signature-artifact="CONTENT_SYSTEM_MAP">
      <p className="site00-artifact__label">CONTENT SYSTEM MAP</p>
      <p className="site00-artifact__subtitle">YOUR CONTENT ARCHITECTURE AT A GLANCE</p>
      <div className="site00-artifact__system-flow">
        <div className={`site00-artifact__system-node${capturedClass(form.campaignObjective)}`}>
          <span>CONTENT STRATEGY</span>
          <span>{display(form.campaignObjective)}</span>
        </div>
        <span className="site00-artifact__connector" aria-hidden>↓</span>
        <div className={`site00-artifact__system-node${capturedClass(form.copyMessaging)}`}>
          <span>PILLARS</span>
          <span>{pillars}</span>
        </div>
        <span className="site00-artifact__connector" aria-hidden>↓</span>
        <div className={`site00-artifact__system-node${capturedClass(form.deliverableTypes)}`}>
          <span>FORMATS</span>
          <span>{formats}</span>
        </div>
        <span className="site00-artifact__connector" aria-hidden>↓</span>
        <div className={`site00-artifact__system-node${capturedClass(form.additionalNotes)}`}>
          <span>WORKFLOW</span>
          <span>{display(form.additionalNotes) !== 'PENDING' ? display(form.additionalNotes) : 'PLAN → CREATE → REVIEW → PUBLISH → ANALYZE'}</span>
        </div>
        <span className="site00-artifact__connector" aria-hidden>↓</span>
        <div className={`site00-artifact__system-node${capturedClass(form.platforms)}`}>
          <span>DISTRIBUTION</span>
          <span>{display(form.platforms)}</span>
        </div>
      </div>
      <p className="site00-artifact__truth">A SYSTEM BUILT TO SCALE, NOT JUST CREATE.</p>
    </div>
  );
}

export function renderSignatureArtifact(props: Props) {
  switch (props.experience.signatureArtifact) {
    case 'ATTENTION_MAP':
      return <AttentionMapArtifact form={props.form} stageIndex={props.stageIndex} />;
    case 'UGC_STYLE_GUIDE':
      return <UgcStyleGuideArtifact form={props.form} stageIndex={props.stageIndex} />;
    case 'FILM_TREATMENT':
      return <FilmTreatmentArtifact form={props.form} stageIndex={props.stageIndex} />;
    case 'CAMPAIGN_CONTROL':
      return <CampaignMapArtifact form={props.form} stageIndex={props.stageIndex} />;
    case 'PRODUCT_STAGE':
      return <ProductStageArtifact form={props.form} stageIndex={props.stageIndex} />;
    case 'LAUNCH_BLUEPRINT':
      return <LaunchBlueprintArtifact form={props.form} stageIndex={props.stageIndex} />;
    case 'CONTENT_SYSTEM_MAP':
      return <ContentSystemMapArtifact form={props.form} stageIndex={props.stageIndex} />;
    default:
      return null;
  }
}
