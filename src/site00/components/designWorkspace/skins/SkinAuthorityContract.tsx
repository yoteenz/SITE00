/**
 * Locked authority mode + compact reference contract grid.
 */

type ContractPreview = {
  keepFunction: boolean;
  rebuildLook: boolean;
  protectCurrentVisuals: boolean;
  screenshotQaRequired: boolean;
  visualConvergenceRequired: boolean;
};

type Props = {
  contract: ContractPreview | null;
};

function ContractCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`site00-dw-skins-contract__cell${highlight ? ' is-highlight' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function SkinAuthorityContract({ contract }: Props) {
  return (
    <div className="site00-dw-skins-contract">
      <div className="site00-dw-skins-contract__locked-row">
        <div className="site00-dw-skins-contract__locked">
          <span className="site00-dw-skins-contract__lock" aria-hidden>
            🔒
          </span>
          <span>DESIGN AUTHORITY</span>
          <em>SYSTEM</em>
        </div>
        <div className="site00-dw-skins-contract__locked">
          <span className="site00-dw-skins-contract__lock" aria-hidden>
            🔒
          </span>
          <span>EXACT MATCH</span>
          <em>SYSTEM</em>
        </div>
      </div>

      <div
        className={`site00-dw-skins-contract__convergence${contract?.visualConvergenceRequired ? ' is-required' : ''}`}
      >
        <span>VISUAL CONVERGENCE</span>
        <strong>{contract?.visualConvergenceRequired ? '● REQUIRED' : 'OFF'}</strong>
      </div>

      <div className="site00-dw-skins-contract__grid">
        <ContractCell label="KEEP FUNCTION" value={contract?.keepFunction ? 'YES' : 'NO'} />
        <ContractCell label="REBUILD LOOK" value={contract?.rebuildLook ? 'YES' : 'NO'} />
        <ContractCell label="PROTECT VISUALS" value={contract?.protectCurrentVisuals ? 'YES' : 'NO'} />
        <ContractCell
          label="SCREENSHOT QA"
          value={contract?.screenshotQaRequired ? 'REQUIRED' : 'OFF'}
          highlight={contract?.screenshotQaRequired}
        />
        <ContractCell
          label="CONVERGENCE"
          value={contract?.visualConvergenceRequired ? 'REQUIRED' : 'OFF'}
          highlight={contract?.visualConvergenceRequired}
        />
      </div>
    </div>
  );
}
