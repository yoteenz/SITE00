import type { CompiledMobileTwinImplementationDocument } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
};

export function DesignTwinForensicBlueprintPanel({ document }: Props) {
  const bp = document.forensicUiBlueprintAuthority;
  const receipt = document.forensicBlueprintGenerationReceipt;
  if (!bp) {
    return <p data-testid="forensic-blueprint-missing">Forensic UI blueprint not generated.</p>;
  }
  return (
    <section data-testid="twin-forensic-blueprint-panel">
      <h3>FORENSIC UI BLUEPRINT</h3>
      <p>
        {bp.id} · {bp.falEndpoint} · {bp.status} · founder {bp.founderReviewStatus}
      </p>
      <p className="site00-dw-v3-authority__hint">QA reference only — not runtime raster.</p>
      {bp.blueprintImageUri.startsWith('http') || bp.blueprintImageUri.startsWith('vitest') ?
        <img src={bp.blueprintImageUri} alt="Forensic UI blueprint" style={{ width: '100%', maxWidth: 390 }} />
      : <p>Blueprint URI: {bp.blueprintImageUri}</p>}
      {receipt ?
        <p data-testid="forensic-blueprint-receipt">
          request {receipt.requestId} · hash {receipt.resultHash.slice(0, 16)} · prompt {receipt.promptVersion}
        </p>
      : null}
    </section>
  );
}
