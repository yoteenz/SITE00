import { useMemo, useState } from 'react';
import { Site00AdminShell } from '../components/shell/Site00AdminShell';
import { ControlPageHeader } from '../components/control/ControlPageHeader';
import '../styles/site00-scope-estimator.css';
import {
  estimateProject,
  FEATURE_MODIFIERS,
  FIXTURES,
  RESPONSIVE_MODES,
  RISK_FLAGS,
  scopeEstimatorEnabled,
  STRUCTURAL_ARCHETYPES,
  toClientBlueprintEstimate,
  VISUAL_COMPLEXITY_LEVELS,
  VISUAL_SYSTEMS,
  WORLD_ARCHETYPES,
  type FamilyInput,
  type FeatureId,
  type ProjectEstimateConfig,
  type RiskFlagId,
} from '../../../studioos/estimation';

const FAMILY_CLASSES = ['LIGHT', 'STANDARD', 'ADVANCED', 'SYSTEM', 'WORLD'] as const;

function cloneConfig(config: ProjectEstimateConfig): ProjectEstimateConfig {
  return structuredClone(config);
}

export default function ScopeEstimatorPage() {
  const [config, setConfig] = useState<ProjectEstimateConfig>(() => cloneConfig(FIXTURES.SIMPLE_SERVICE));
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideWeeks, setOverrideWeeks] = useState('');

  const outcome = useMemo(() => estimateProject(config), [config]);
  const client = outcome.ok ? toClientBlueprintEstimate(config, outcome.result) : null;

  if (!scopeEstimatorEnabled()) {
    return (
      <Site00AdminShell>
        <ControlPageHeader kicker="00 / STUDIO" title="ESTIMATOR" subtitle="THE ESTIMATOR FLAG IS OFF." />
      </Site00AdminShell>
    );
  }

  function patch(partial: Partial<ProjectEstimateConfig>) {
    setConfig((current) => ({ ...current, ...partial }));
  }

  function updateFamily(index: number, partial: Partial<FamilyInput>) {
    setConfig((current) => {
      const families = current.families.map((family, i) => (i === index ? { ...family, ...partial } : family));
      return { ...current, families };
    });
  }

  function toggleFeature(id: FeatureId) {
    setConfig((current) => {
      const featureIds = current.featureIds.includes(id)
        ? current.featureIds.filter((item) => item !== id)
        : [...current.featureIds, id];
      return { ...current, featureIds };
    });
  }

  function toggleRisk(id: RiskFlagId) {
    setConfig((current) => {
      const riskFlags = current.riskFlags.includes(id)
        ? current.riskFlags.filter((item) => item !== id)
        : [...current.riskFlags, id];
      return { ...current, riskFlags };
    });
  }

  function applyTimelineOverride() {
    const weeks = Number(overrideWeeks);
    if (!overrideReason.trim() || !Number.isFinite(weeks)) return;
    setConfig((current) => ({
      ...current,
      manualModifiers: [
        ...current.manualModifiers,
        {
          id: `ov-${current.manualModifiers.length + 1}`,
          field: 'timelineWeeks',
          value: weeks,
          reason: overrideReason.trim(),
          author: 'founder',
          timestamp: new Date().toISOString(),
        },
      ],
    }));
    setOverrideReason('');
    setOverrideWeeks('');
  }

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / STUDIO"
        title="SCOPE ESTIMATOR"
        subtitle="PROJECTED ESTIMATE. NOT A QUOTE."
      />
      <div className="site00-estimator">
        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">FIXTURES</h2>
          <div className="site00-estimator__row">
            {Object.entries(FIXTURES).map(([name, fixture]) => (
              <button key={name} type="button" onClick={() => setConfig(cloneConfig(fixture))}>
                {name.split('_').join(' ')}
              </button>
            ))}
          </div>
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">CONFIG</h2>
          <div className="site00-estimator__grid">
            <label>
              BUILD TYPE
              <select value={config.projectType} onChange={(e) => patch({ projectType: e.target.value as ProjectEstimateConfig['projectType'] })}>
                {['SITE', 'WORLD', 'SYSTEM', 'HYBRID'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              BUILD LEVEL
              <select value={config.buildLevel} onChange={(e) => patch({ buildLevel: e.target.value as ProjectEstimateConfig['buildLevel'] })}>
                {['SIMPLE', 'ADVANCED', 'CUSTOM'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              STRUCTURE
              <select
                value={config.structuralArchetype ?? ''}
                onChange={(e) => patch({ structuralArchetype: (e.target.value || null) as ProjectEstimateConfig['structuralArchetype'] })}
              >
                <option value="">NONE</option>
                {STRUCTURAL_ARCHETYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>
              VISUAL SYSTEM
              <select
                value={config.visualSystemId ?? ''}
                onChange={(e) => patch({ visualSystemId: (e.target.value || null) as ProjectEstimateConfig['visualSystemId'] })}
              >
                <option value="">NONE</option>
                {VISUAL_SYSTEMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>
              VISUAL COMPLEXITY
              <select value={config.visualComplexity} onChange={(e) => patch({ visualComplexity: e.target.value as ProjectEstimateConfig['visualComplexity'] })}>
                {VISUAL_COMPLEXITY_LEVELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>
              RESPONSIVE
              <select value={config.responsiveMode} onChange={(e) => patch({ responsiveMode: e.target.value as ProjectEstimateConfig['responsiveMode'] })}>
                {RESPONSIVE_MODES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>
              DELIVERY
              <select value={config.deliveryMode} onChange={(e) => patch({ deliveryMode: e.target.value as ProjectEstimateConfig['deliveryMode'] })}>
                <option value="STANDARD">STANDARD</option>
                <option value="PRIORITY">PRIORITY</option>
                <option value="CUSTOM_SCHEDULE">CUSTOM SCHEDULE</option>
              </select>
            </label>
            <label>
              REVIEW ROUNDS
              <input type="number" min={0} value={config.reviewRounds} onChange={(e) => patch({ reviewRounds: Number(e.target.value) })} />
            </label>
            <label>
              CONFIDENCE
              <select value={config.confidenceLevel} onChange={(e) => patch({ confidenceLevel: e.target.value as ProjectEstimateConfig['confidenceLevel'] })}>
                <option>EARLY</option>
                <option>BLUEPRINT</option>
                <option>LOCKED</option>
              </select>
            </label>
          </div>
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">FAMILIES</h2>
          {config.families.map((family, index) => (
            <div key={family.id} className="site00-estimator__family">
              <input value={family.label} onChange={(e) => updateFamily(index, { label: e.target.value })} />
              <select value={family.familyClass} onChange={(e) => updateFamily(index, { familyClass: e.target.value as FamilyInput['familyClass'] })}>
                {FAMILY_CLASSES.map((item) => <option key={item}>{item}</option>)}
              </select>
              <label>
                DESCENDANTS
                <input type="number" min={0} value={family.descendantCount} onChange={(e) => updateFamily(index, { descendantCount: Number(e.target.value) })} />
              </label>
              <button type="button" onClick={() => patch({ families: config.families.filter((_, i) => i !== index) })}>REMOVE</button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => patch({
              families: [...config.families, { id: `family-${config.families.length + 1}`, label: 'New family', familyClass: 'STANDARD', descendantCount: 0 }],
            })}
          >
            ADD FAMILY
          </button>
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">FEATURES</h2>
          <div className="site00-estimator__checks">
            {FEATURE_MODIFIERS.map((feature) => (
              <label key={feature.modifierId}>
                <input type="checkbox" checked={config.featureIds.includes(feature.modifierId)} onChange={() => toggleFeature(feature.modifierId)} />
                {feature.label}
              </label>
            ))}
          </div>
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">WORLD</h2>
          <p>{config.worldScopes.length ? `${config.worldScopes.length} world scope on this config.` : 'No world scope.'}</p>
          {config.worldScopes.length === 0 ? (
            <button
              type="button"
              onClick={() => patch({
                worldScopes: [{
                  archetypeId: WORLD_ARCHETYPES[0].id,
                  zoneCount: 4,
                  sceneCount: 6,
                  interactionCount: 8,
                  inhabitantComplexity: 'LIGHT',
                  stateCount: 2,
                  threeDAssetLoad: 'NONE',
                  navigationComplexity: 'STANDARD',
                }],
              })}
            >
              ADD WORLD SCOPE
            </button>
          ) : (
            <button type="button" onClick={() => patch({ worldScopes: [] })}>CLEAR WORLD</button>
          )}
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">RISK</h2>
          <div className="site00-estimator__checks">
            {RISK_FLAGS.map((risk) => (
              <label key={risk.id}>
                <input type="checkbox" checked={config.riskFlags.includes(risk.id)} onChange={() => toggleRisk(risk.id)} />
                {risk.label}
              </label>
            ))}
          </div>
        </section>

        <section className="site00-admin-panel">
          <h2 className="site00-admin-panel__title">FOUNDER OVERRIDE</h2>
          <div className="site00-estimator__row">
            <input placeholder="WEEKS" value={overrideWeeks} onChange={(e) => setOverrideWeeks(e.target.value)} />
            <input placeholder="REASON" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
            <button type="button" onClick={applyTimelineOverride}>APPLY TIMELINE</button>
            <button type="button" onClick={() => patch({ manualModifiers: [] })}>CLEAR OVERRIDES</button>
          </div>
        </section>

        {!outcome.ok ? <p className="site00-admin-panel">{outcome.errors.join(' ')}</p> : null}

        {outcome.ok && client ? (
          <>
            <section className="site00-admin-panel">
              <h2 className="site00-admin-panel__title">CLIENT VIEW</h2>
              <p>{client.document}</p>
              <p>{client.projectType} · {client.buildLevel} · {client.selectedStructure}</p>
              <p>{client.selectedVisualSystem}</p>
              <p>RAW {outcome.result.lowWeeks}–{outcome.result.highWeeks} WEEKS</p>
              <p>WINDOW {client.productionWindow}</p>
              <p>INVESTMENT {client.investmentRange}</p>
              <p>POLICY {client.presentationPolicyVersion}</p>
              {client.presentationNote ? <p>REVIEW {client.presentationNote}</p> : null}
              <p>{client.deliveryMode} · {client.complexity} · {client.confidence}</p>
              <p>{client.whatHappensNext}</p>
            </section>
            <section className="site00-admin-panel">
              <h2 className="site00-admin-panel__title">STUDIO VIEW</h2>
              <p>FU {outcome.result.familyUnits} · RAW {outcome.result.rawProductionWeeks} WEEKS</p>
              <p>SERIAL {outcome.result.serialWeeks} · PARALLEL {outcome.result.parallelWeeks} · LANES {outcome.result.effectiveLanes}</p>
              <p>EXPECTED {outcome.result.expectedWeeks} WEEKS ({outcome.result.lowWeeks}–{outcome.result.highWeeks})</p>
              <p>REVIEW BUFFER {outcome.result.reviewBufferWeeks} WEEKS</p>
              <p>INVESTMENT {outcome.result.investmentLow} / {outcome.result.investmentExpected} / {outcome.result.investmentHigh}</p>
              <p>{outcome.result.riskBufferNote}</p>
              <p>REFERENCE {outcome.result.referenceBand.label}: {outcome.result.referenceBand.window}. {outcome.result.referenceBand.note}</p>
              <ul>
                {outcome.result.breakdown.map((line) => (
                  <li key={line.id}>
                    {line.label} {line.familyClass} base {line.baseFu} desc {line.descendantModifierFu} responsive {line.responsiveFu} visual {line.visualFu} total {line.totalFu}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </Site00AdminShell>
  );
}
