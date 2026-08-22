import type { IdntyAssessmentOption } from '../../../config/idnty-assessment';

type IdentityScannerRowProps = {
  option: IdntyAssessmentOption;
  selected: boolean;
  onToggle: (id: string) => void;
  statusFound?: string;
  statusMissing?: string;
};

function TargetIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="site00-idnty-state-v2__scanner-target">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
      <line x1="10" y1="2" x2="10" y2="5" stroke="currentColor" strokeWidth="0.75" />
      <line x1="10" y1="15" x2="10" y2="18" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

export function IdentityScannerRow({
  option,
  selected,
  onToggle,
  statusFound = 'FOUND',
  statusMissing = 'MISSING',
}: IdentityScannerRowProps) {
  return (
    <li>
      <button
        type="button"
        className={`site00-idnty-state-v2__scanner-row ${selected ? 'site00-idnty-state-v2__scanner-row--found' : ''}`.trim()}
        onClick={() => onToggle(option.id)}
        aria-pressed={selected}
      >
        <TargetIcon />
        <span className="site00-idnty-state-v2__scanner-label">{option.label}</span>
        <span className="site00-idnty-state-v2__scanner-status">{selected ? statusFound : statusMissing}</span>
        <span
          className={`site00-idnty-state-v2__scanner-check ${selected ? 'site00-idnty-state-v2__scanner-check--on' : ''}`.trim()}
          aria-hidden="true"
        >
          {selected ? '✓' : ''}
        </span>
      </button>
    </li>
  );
}

type IdentityInventoryScannerProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
  options: IdntyAssessmentOption[];
  selected: string[];
  onToggle: (id: string) => void;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
  showOtherField?: boolean;
  statusFound?: string;
  statusMissing?: string;
};

export function IdentityInventoryScanner({
  kicker = 'IDENTITY INVENTORY SCANNER',
  title,
  subtitle,
  options,
  selected,
  onToggle,
  otherValue = '',
  onOtherChange,
  showOtherField = false,
  statusFound,
  statusMissing,
}: IdentityInventoryScannerProps) {
  return (
    <section className="site00-idnty-state-v2__scanner" aria-labelledby="idnty-scanner-heading">
      <header className="site00-idnty-state-v2__scanner-header">
        <p className="site00-idnty-state-v2__scanner-kicker">{kicker}</p>
        <h2 id="idnty-scanner-heading" className="site00-idnty-state-v2__scanner-title">
          {title}
        </h2>
        {subtitle ? <p className="site00-idnty-state-v2__scanner-subtitle">{subtitle}</p> : null}
      </header>
      <ul className="site00-idnty-state-v2__scanner-list" role="list">
        {options.map((option) => (
          <IdentityScannerRow
            key={option.id}
            option={option}
            selected={selected.includes(option.id)}
            onToggle={onToggle}
            statusFound={statusFound}
            statusMissing={statusMissing}
          />
        ))}
      </ul>
      {showOtherField && onOtherChange ? (
        <label className="site00-idnty-state-v2__scanner-other">
          <span className="site00-idnty-state-v2__scanner-other-label">OTHER (PLEASE SPECIFY)</span>
          <textarea
            className="site00-idnty-state-v2__scanner-other-input"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value.slice(0, 300))}
            rows={3}
            placeholder="DESCRIBE WHAT YOU HAVE…"
          />
        </label>
      ) : null}
    </section>
  );
}
