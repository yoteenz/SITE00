/**
 * Admin — structured Brand Lore intelligence view (not a JSON dump).
 */
import type { BrandLoreProfile } from '../../../../../shared/site00-brand-lore/types';
import { buildReadinessInspector } from '../../../../../shared/site00-brand-lore/readiness';

/** XXXIV — truthful per-domain READY/MISSING/NEEDS CONFIRMATION, never a fake percentage. */
export function ReadinessInspector({ profile }: { profile: BrandLoreProfile | null }) {
  const rows = buildReadinessInspector(profile);
  return (
    <div className="site00-admin-readiness-inspector" aria-label="Creative Direction readiness inspector">
      <h3 className="site00-admin-readiness-inspector__title">READINESS INSPECTOR</h3>
      <dl className="site00-admin-readiness-inspector__list">
        {rows.map((row) => (
          <div key={row.domain} className={`site00-admin-readiness-inspector__row site00-admin-readiness-inspector__row--${row.status.toLowerCase()}`}>
            <dt>{row.domain.replace(/_/g, ' ')}</dt>
            <dd>{row.status.replace(/_/g, ' ')}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

type BrandIntelligencePanelProps = {
  profile: BrandLoreProfile | null;
  rawLoreAnswers?: Record<string, string | string[]>;
  onConfirmField?: (fieldKey: keyof BrandLoreProfile) => void;
  /** fieldKey currently in-flight (server mutation pending) — never optimistic (XI). */
  confirmingField?: string | null;
};

function FieldRow({
  label,
  field,
  onConfirm,
  confirming,
}: {
  label: string;
  field: { value: unknown; classification: string; confidence: string; founderConfirmationState: string; sourceAnswerIds: string[] };
  onConfirm?: () => void;
  confirming?: boolean;
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
        <button type="button" className="site00-admin-link-cta" onClick={onConfirm} disabled={confirming}>
          {confirming ? 'CONFIRMING…' : 'CONFIRM CANON'}
        </button>
      ) : null}
    </div>
  );
}

/** Evidence, not canon (XXII) — never renders a CONFIRM CANON action; references cannot become
 * FOUNDER_CONFIRMED lore. Progressive disclosure: collapsed by default to avoid clutter (XXXIII). */
function ReferenceEvidenceSection({ profile }: { profile: BrandLoreProfile }) {
  if (!profile.referenceEvidence?.length) return null;
  return (
    <details className="site00-admin-brand-lore__references">
      <summary>REFERENCES ({profile.referenceEvidence.length})</summary>
      <ul className="site00-admin-brand-lore__reference-list">
        {profile.referenceEvidence.map((ref) => (
          <li key={ref.referenceId} className="site00-admin-brand-lore__reference-item">
            <span className="site00-admin-brand-lore__reference-role">{ref.referenceRole.replace(/_/g, ' ')}</span>
            <span className="site00-admin-brand-lore__reference-note">{ref.founderNote}</span>
            <span className="site00-admin-brand-lore__meta">
              {ref.source} · REFERENCE — not canon
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function BrandIntelligencePanel({ profile, rawLoreAnswers, onConfirmField, confirmingField }: BrandIntelligencePanelProps) {
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
        <FieldRow label="WORLD" field={profile.worldMetaphor} onConfirm={() => onConfirmField?.('worldMetaphor')} confirming={confirmingField === 'worldMetaphor'} />
        <FieldRow label="RELATIONSHIP" field={profile.audienceRelationship} onConfirm={() => onConfirmField?.('audienceRelationship')} confirming={confirmingField === 'audienceRelationship'} />
        <FieldRow label="BELIEF" field={profile.brandBelief} onConfirm={() => onConfirmField?.('brandBelief')} confirming={confirmingField === 'brandBelief'} />
        <FieldRow label="OPPOSITION" field={profile.culturalOpposition} onConfirm={() => onConfirmField?.('culturalOpposition')} confirming={confirmingField === 'culturalOpposition'} />
        <FieldRow label="OBSESSIONS" field={profile.coreObsessions} onConfirm={() => onConfirmField?.('coreObsessions')} confirming={confirmingField === 'coreObsessions'} />
        <FieldRow label="TENSIONS" field={profile.creativeTensions} onConfirm={() => onConfirmField?.('creativeTensions')} confirming={confirmingField === 'creativeTensions'} />
        <FieldRow label="REFERENCES" field={profile.referenceLineage} onConfirm={() => onConfirmField?.('referenceLineage')} confirming={confirmingField === 'referenceLineage'} />
        <FieldRow label="LANGUAGE" field={profile.authenticLanguageSamples} onConfirm={() => onConfirmField?.('authenticLanguageSamples')} confirming={confirmingField === 'authenticLanguageSamples'} />
        <FieldRow label="RITUAL" field={profile.audienceRitual} onConfirm={() => onConfirmField?.('audienceRitual')} confirming={confirmingField === 'audienceRitual'} />
        <FieldRow label="MYTHOLOGY" field={profile.desiredMythology} onConfirm={() => onConfirmField?.('desiredMythology')} confirming={confirmingField === 'desiredMythology'} />
        <FieldRow label="ANTI-DIRECTION" field={profile.creativeAntiPatterns} onConfirm={() => onConfirmField?.('creativeAntiPatterns')} confirming={confirmingField === 'creativeAntiPatterns'} />
      </dl>
      <ReferenceEvidenceSection profile={profile} />
      <p className="site00-admin-brand-lore__readiness">
        READINESS: {profile.readinessState.replace(/_/g, ' ')}
        {profile.contextClassification ? ` · CONTEXT: ${profile.contextClassification.replace(/_/g, ' ')}` : ''}
      </p>
      <ReadinessInspector profile={profile} />
    </div>
  );
}
