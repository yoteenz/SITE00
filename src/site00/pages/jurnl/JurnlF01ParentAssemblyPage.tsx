import '../../styles/site00-jurnl-f01-parent-assembly.css';
import {
  FAMILY1_PARENT_ASSETS,
  type Family1AssetRecord,
} from './family1ParentAssetRegistry';

function AssetImg({
  asset,
  className,
}: {
  asset: Family1AssetRecord;
  className: string;
}) {
  return (
    <img
      className={className}
      src={asset.runtime_path}
      alt=""
      data-asset-id={asset.asset_id}
      data-component={asset.component}
      data-runtime-path={asset.runtime_path}
      data-pixels={asset.pixels ?? ''}
    />
  );
}

function asset(id: string): Family1AssetRecord {
  const found = FAMILY1_PARENT_ASSETS.find((row) => row.asset_id === id);
  if (!found) throw new Error(`Missing Family 1 asset ${id}`);
  return found;
}

/**
 * Family 1 parent: one environment plate, official logo, live type, live buttons.
 * Decorative objects stay inside the plate.
 */
export default function JurnlF01ParentAssemblyPage() {
  return (
    <main className="jurnl-f01-stage" data-testid="jurnl-f01-parent-assembly">
      <section className="jurnl-f01-artboard" aria-label="JURNL WELCOME">
        <AssetImg asset={asset('ENTRY.ENVIRONMENT.PLATE.001')} className="jurnl-f01-plate" />
        <AssetImg asset={asset('ENTRY.LOGO.OFFICIAL.001')} className="jurnl-f01-logo" />
        <header className="jurnl-f01-copy">
          <h1>
            A CALMER,
            <br />
            RICHER,
            <br />
            MORE
            <br />
            INTENTIONAL
            <br />
            YOU.
          </h1>
          <p>PLAN TODAY. GROW FREELY.</p>
        </header>
        <div className="jurnl-f01-actions">
          <button type="button" className="jurnl-f01-btn jurnl-f01-btn-primary">
            GET STARTED
          </button>
          <button type="button" className="jurnl-f01-btn jurnl-f01-btn-secondary">
            SIGN IN
          </button>
        </div>
      </section>
    </main>
  );
}
