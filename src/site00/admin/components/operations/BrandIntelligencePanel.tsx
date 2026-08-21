/**
 * Admin — structured Brand Lore intelligence view (not a JSON dump).
 */
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types';

type BrandIntelligencePanelProps = {
  profile: BrandLoreProfile | null;
  rawLoreAnswers?: Record<string, string | string[]>;
  onConfirmField?: (fieldKey: keyof BrandLoreProfile) => void;
};

function FieldRow({
  label,
  field,
  onConfirm,
}: {
  label: string;
  field: { value: unknown; classification: string; confidence: string; founderConfirmationState: string; sourceAnswerIds: string[] };
  onConfirm?: () => void;
}) {
  const display =
    field.value === null || field.value === undefined
      ? '—'
      : Array.isArray(field.value)
        ? field.value.join(' · ')
        : String(field.value);

  return (
    <div className="site00-admin-brand-lore__row">
      <dt>{label}</dt>
      <dd>{display}</dd>
      <dd className="site00-admin-brand-lore__meta">
        {field.classification.replace(/_/g, ' ')} · {field.confidence} ·{' '}
        {field.founderConfirmationState.replace(/_/g, ' ')}
        {field.sourceAnswerIds.length ? ` · src: ${field.sourceAnswerIds.join(', ')}` : ''}
      </dd>
      {onConfirm && field.founderConfirmationState !== 'CONFIRMED' ? (
        <button type="button" className="site00-admin-link-cta" onClick={onConfirm}>
          CONFIRM CANON
        </button>
      ) : null}
    </div>
  );
}

export function BrandIntelligencePanel({ profile, rawLoreAnswers, onConfirmField }: BrandIntelligencePanelProps) {
  if (!profile && (!rawLoreAnswers || Object.keys(rawLoreAnswers).length === 0)) {
    return <p className="site00-admin-empty">NO BRAND LORE CAPTURED YET.</p>;
  }

  if (!profile) {
    return (
      <div className="site00-admin-brand-lore">
        <p className="site00-admin-brand-lore__notice">RAW ANSWERS ONLY — SYNTHESIS PENDING.</p>
        <pre className="site00-admin-code">{JSON.stringify(rawLoreAnswers, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="site00-admin-brand-lore">
      <dl className="site00-admin-dl site00-admin-brand-lore__sections">
        <FieldRow label="WORLD" field={profile.worldMetaphor} onConfirm={() => onConfirmField?.('worldMetaphor')} />
        <FieldRow label="RELATIONSHIP" field={profile.audienceRelationship} onConfirm={() => onConfirmField?.('audienceRelationship')} />
        <FieldRow label="BELIEF" field={profile.brandBelief} onConfirm={() => onConfirmField?.('brandBelief')} />
        <FieldRow label="OPPOSITION" field={profile.culturalOpposition} onConfirm={() => onConfirmField?.('culturalOpposition')} />
        <FieldRow label="OBSESSIONS" field={profile.coreObsessions} onConfirm={() => onConfirmField?.('coreObsessions')} />
        <FieldRow label="TENSIONS" field={profile.creativeTensions} onConfirm={() => onConfirmField?.('creativeTensions')} />
        <FieldRow label="REFERENCES" field={profile.referenceLineage} onConfirm={() => onConfirmField?.('referenceLineage')} />
        <FieldRow label="LANGUAGE" field={profile.authenticLanguageSamples} onConfirm={() => onConfirmField?.('authenticLanguageSamples')} />
        <FieldRow label="RITUAL" field={profile.audienceRitual} onConfirm={() => onConfirmField?.('audienceRitual')} />
        <FieldRow label="MYTHOLOGY" field={profile.desiredMythology} onConfirm={() => onConfirmField?.('desiredMythology')} />
        <FieldRow label="ANTI-DIRECTION" field={profile.creativeAntiPatterns} onConfirm={() => onConfirmField?.('creativeAntiPatterns')} />
      </dl>
      <p className="site00-admin-brand-lore__readiness">
        READINESS: {profile.readinessState.replace(/_/g, ' ')}
        {profile.contextClassification ? ` · CONTEXT: ${profile.contextClassification.replace(/_/g, ' ')}` : ''}
      </p>
    </div>
  );
}
