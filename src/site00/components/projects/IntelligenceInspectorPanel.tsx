type IntelligenceDomainView = {
  domain: string;
  label: string;
  captured: boolean;
  profileVersion: string | number | null;
  provenance: string | null;
  experimentExclusion: {
    excluded: boolean;
    excludedFromExperimentId: string | null;
    excludedReason: string | null;
    availableFromCanonVersion: number | null;
  } | null;
};

type IntelligenceInspectorPayload = {
  brandPersonality: IntelligenceDomainView;
  primaryExpressionContext: IntelligenceDomainView;
  founderCreativeAppetite: IntelligenceDomainView;
  ndxbookConceptExperiment: {
    frozen: boolean;
    creativeAppetiteInjected: false;
    reason: string | null;
  } | null;
};

type IntelligenceInspectorPanelProps = {
  inspector: IntelligenceInspectorPayload | null | undefined;
};

function DomainRow({ domain }: { domain: IntelligenceDomainView }) {
  return (
    <div className="site00-intelligence-inspector__domain">
      <div className="site00-intelligence-inspector__domain-header">
        <strong>{domain.label}</strong>
        <span className={domain.captured ? 'site00-badge site00-badge--ok' : 'site00-badge'}>
          {domain.captured ? 'CAPTURED' : 'NOT CAPTURED'}
        </span>
      </div>
      {domain.profileVersion != null ? (
        <p className="site00-intelligence-inspector__meta">Version: {String(domain.profileVersion)}</p>
      ) : null}
      {domain.provenance ? (
        <p className="site00-intelligence-inspector__meta">Provenance: {domain.provenance}</p>
      ) : null}
      {domain.experimentExclusion?.excluded ? (
        <div className="site00-intelligence-inspector__exclusion">
          <p>
            <strong>CURRENT CONCEPT EXPERIMENT:</strong> EXCLUDED
          </p>
          <p>
            <strong>REASON:</strong> {domain.experimentExclusion.excludedReason}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function IntelligenceInspectorPanel({ inspector }: IntelligenceInspectorPanelProps) {
  if (!inspector) return null;

  return (
    <section className="site00-intelligence-inspector">
      <h3 className="site00-intelligence-inspector__title">Intelligence Domains</h3>
      <DomainRow domain={inspector.brandPersonality} />
      <DomainRow domain={inspector.primaryExpressionContext} />
      <DomainRow domain={inspector.founderCreativeAppetite} />
      {inspector.ndxbookConceptExperiment ? (
        <div className="site00-intelligence-inspector__ndxbook">
          <p>
            <strong>NDXBOOK Concept Experiment:</strong>{' '}
            {inspector.ndxbookConceptExperiment.frozen ? 'FROZEN' : 'ACTIVE'}
          </p>
          <p>
            <strong>Creative Appetite injected:</strong>{' '}
            {inspector.ndxbookConceptExperiment.creativeAppetiteInjected ? 'YES' : 'NO'}
          </p>
          {inspector.ndxbookConceptExperiment.reason ? (
            <p className="site00-intelligence-inspector__reason">{inspector.ndxbookConceptExperiment.reason}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
