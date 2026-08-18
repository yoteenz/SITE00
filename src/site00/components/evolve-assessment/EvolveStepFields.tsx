import { useMemo, useCallback } from 'react';
import {
  EVOLVE_ACCESS_PROVIDER_OPTIONS,
  EVOLVE_DIAGNOSE_GOAL_OPTIONS,
  EVOLVE_PROPERTY_TYPE_OPTIONS,
  type EvolveAssessmentStep,
} from '../../config/evolve-assessment';
import { getCapabilitiesByCategory } from '../../config/capability-registry';
import {
  IdntyOptionGrid,
  IdntyOptionRows,
  IdntyTextareaField,
} from '../idnty-assessment/IdntyAssessmentPanels';
import type { EvolveStepAnswers } from '../../hooks/useEvolveAssessment';
import type { EvolveScopeAssessment } from '../../config/evolve-assessment-scope';

type EvolveStepFieldsProps = {
  step: EvolveAssessmentStep;
  values: EvolveStepAnswers;
  onChange: (fieldId: string, value: string | string[]) => void;
  errors?: Record<string, string>;
  scope?: EvolveScopeAssessment | null;
};

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value) return [value];
  return [];
}

export function EvolveStepFields({ step, values, onChange, errors = {}, scope }: EvolveStepFieldsProps) {
  const capabilityGroups = useMemo(() => getCapabilitiesByCategory('evolve'), []);

  const toggleMulti = useCallback(
    (fieldId: string, id: string) => {
      const current = asArray(values[fieldId]);
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      onChange(fieldId, next);
    },
    [onChange, values],
  );

  const toggleSingle = useCallback(
    (fieldId: string, id: string) => {
      onChange(fieldId, id);
    },
    [onChange],
  );

  if (step.id === 'property') {
    return (
      <div className="site00-evolve-property-fields">
        <label className="site00-field">
          <span className="site00-label">PROPERTY URL</span>
          <input
            type="url"
            className="site00-input"
            value={String(values.propertyUrl ?? '')}
            onChange={(e) => onChange('propertyUrl', e.target.value)}
            placeholder="HTTPS://YOUR-SITE.COM"
            autoComplete="url"
          />
        </label>
        <label className="site00-field">
          <span className="site00-label">PROPERTY NAME</span>
          <input
            type="text"
            className="site00-input"
            value={String(values.propertyName ?? '')}
            onChange={(e) => onChange('propertyName', e.target.value)}
          />
        </label>
        <label className="site00-field">
          <span className="site00-label">BUSINESS / BRAND</span>
          <input
            type="text"
            className="site00-input"
            value={String(values.brand ?? '')}
            onChange={(e) => onChange('brand', e.target.value)}
          />
        </label>
        <p className="site00-label-red" style={{ marginTop: 16 }}>
          PROPERTY TYPE
        </p>
        <IdntyOptionGrid
          options={EVOLVE_PROPERTY_TYPE_OPTIONS}
          selected={asArray(values.propertyType)}
          onToggle={(id) => toggleSingle('propertyType', id)}
          mode="single"
          columns={3}
        />
        <label className="site00-field">
          <span className="site00-label">CURRENT PLATFORM / FRAMEWORK</span>
          <input
            type="text"
            className="site00-input"
            value={String(values.platform ?? '')}
            onChange={(e) => onChange('platform', e.target.value)}
            placeholder="OR I'M NOT SURE"
          />
        </label>
        <label className="site00-field">
          <span className="site00-label">HOSTING PROVIDER (IF KNOWN)</span>
          <input
            type="text"
            className="site00-input"
            value={String(values.hosting ?? '')}
            onChange={(e) => onChange('hosting', e.target.value)}
          />
        </label>
      </div>
    );
  }

  if (step.id === 'diagnose') {
    return (
      <div className="site00-evolve-diagnose-fields">
        <p className="site00-label-red">WHAT DO YOU WANT IMPROVED?</p>
        <IdntyOptionGrid
          options={EVOLVE_DIAGNOSE_GOAL_OPTIONS}
          selected={asArray(values.goals)}
          onToggle={(id) => toggleMulti('goals', id)}
          mode="multi"
          columns={3}
        />
        {errors.goals ? <p className="site00-field-error">{errors.goals}</p> : null}
        <IdntyTextareaField
          id="evolve-working-well"
          label="WHAT IS WORKING WELL?"
          value={String(values.workingWell ?? '')}
          onChange={(v) => onChange('workingWell', v)}
          maxLength={2000}
        />
        <IdntyTextareaField
          id="evolve-not-working"
          label="WHAT IS NOT WORKING?"
          value={String(values.notWorking ?? '')}
          onChange={(v) => onChange('notWorking', v)}
          maxLength={2000}
        />
        <IdntyTextareaField
          id="evolve-must-not-change"
          label="WHAT MUST NOT CHANGE?"
          value={String(values.mustNotChange ?? '')}
          onChange={(v) => onChange('mustNotChange', v)}
          maxLength={2000}
        />
        <IdntyTextareaField
          id="evolve-success"
          label="WHAT WOULD MAKE THIS PROJECT SUCCESSFUL?"
          value={String(values.successCriteria ?? '')}
          onChange={(v) => onChange('successCriteria', v)}
          maxLength={2000}
        />
      </div>
    );
  }

  if (step.id === 'systems') {
    const selected = asArray(values.selected);
    return (
      <div className="site00-evolve-systems-fields">
        {Object.entries(capabilityGroups).map(([category, entries]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <p className="site00-label-red">{category}</p>
            <IdntyOptionRows
              options={entries.map((e) => ({
                id: e.id,
                label: e.name,
                description: e.assessmentRequired ? 'REQUIRES ASSESSMENT' : e.description,
              }))}
              selected={selected}
              onToggle={(id) => toggleMulti('selected', id)}
            />
          </div>
        ))}
      </div>
    );
  }

  if (step.id === 'access') {
    return (
      <div className="site00-evolve-access-fields">
        <p className="site00-body" style={{ marginBottom: 16 }}>
          DISCOVERY ONLY — DO NOT ENTER PASSWORDS OR API SECRETS. SECURE CONNECTION HAPPENS AFTER AUTHORIZATION.
        </p>
        <IdntyOptionGrid
          options={EVOLVE_ACCESS_PROVIDER_OPTIONS}
          selected={asArray(values.providers)}
          onToggle={(id) => toggleMulti('providers', id)}
          mode="multi"
          columns={3}
        />
      </div>
    );
  }

  if (step.id === 'scope' && scope) {
    return (
      <div className="site00-evolve-scope-review">
        <p className="site00-label-red">ASSESSMENT STATUS: {scope.assessmentStatus.replace(/_/g, ' ')}</p>
        <p className="site00-body">RECOMMENDED PATH: {scope.recommendedEvolvePath.toUpperCase()}</p>
        <p className="site00-body">COMPLEXITY: {scope.estimatedComplexity.replace(/_/g, ' ')}</p>
        {scope.riskFlags.length > 0 ? (
          <ul>
            {scope.riskFlags.map((flag) => (
              <li key={flag} className="site00-body">
                {flag}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="site00-body">{scope.recommendedAssessment}</p>
      </div>
    );
  }

  if (step.id === 'enter-studio') {
    return (
      <p className="site00-body">
        AFTER AGREEMENT, DEPOSIT, AND REQUIRED ACCESS CONNECTIONS, YOUR EVOLVE PROJECT ENTERS THE SITE 00 OPERATING
        ENVIRONMENT WITH ASSESSMENT QUEUE, ACCESS CHECKLIST, AND PRODUCTION PLAN.
      </p>
    );
  }

  return null;
}
