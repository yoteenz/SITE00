import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  P0_PAF_1_LINEAGE,
  FRONTAL_SLAYER_SIX_UNIT_VISUAL_CANON,
  BUILD_A_WIG_DEFAULT_AXES,
  applySelectAll,
  approveMasterHero,
  approveVariant,
  cancelQueuedVariants,
  computeVariantMatrixPreview,
  confirmBatchCost,
  dispatchBatch,
  dispatchProductPageColorVariant,
  getActiveCanonicalMasterHero,
  getBatch,
  getBatchProgress,
  getMasterHero,
  listHairColorOptions,
  listHairStyleOptions,
  listMasterHeroes,
  listProductAssetNotifications,
  listVariantsForBatch,
  planBatch,
  persistMasterHeroToSupabase,
  registerMasterHeroUpload,
  retryFailedVariants,
  type BackgroundMode,
  type FactoryMode,
  type VariantSelection,
  type VariationAxis,
} from '../../../../shared/site00-studio-world-production/productAssetFactory/p0paf1/client';

type Props = {
  projectSlug: string;
};

const TEXTURE_OPTIONS = [
  { id: 'straight', label: 'STRAIGHT' },
  { id: 'wavy', label: 'WAVY' },
  { id: 'curly', label: 'CURLY' },
];
const PART_OPTIONS = [
  { id: 'middle', label: 'MIDDLE PART' },
  { id: 'side', label: 'SIDE PART' },
  { id: 'free-part', label: 'FREE PART' },
];
const LENGTH_OPTIONS = [
  { id: '16', label: '16"' },
  { id: '18', label: '18"' },
  { id: '20', label: '20"' },
  { id: '22', label: '22"' },
  { id: '24', label: '24"' },
];
const FINISH_OPTIONS = [
  { id: 'natural', label: 'NATURAL' },
  { id: 'silky', label: 'SILKY' },
  { id: 'matte', label: 'MATTE' },
];

export function ProductAssetFactoryWorkspace({ projectSlug }: Props) {
  const [searchParams] = useSearchParams();
  const batchFromUrl = searchParams.get('batch');

  const [mode, setMode] = useState<FactoryMode>('BUILD_A_WIG');
  const [productId, setProductId] = useState('noir');
  const [masterHeroId, setMasterHeroId] = useState<string | null>(null);
  const [selection, setSelection] = useState<VariantSelection>({});
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>('TRANSPARENT_CUTOUT');
  const [activeBatchId, setActiveBatchId] = useState<string | null>(batchFromUrl);
  const [costConfirmed, setCostConfirmed] = useState(false);
  const [pdpColorId, setPdpColorId] = useState('burgundy');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const masterHero = masterHeroId ? getMasterHero(masterHeroId) : getActiveCanonicalMasterHero(productId);
  const colorOptions = listHairColorOptions();
  const styleOptions = listHairStyleOptions();

  const matrixPreview = useMemo(() => {
    if (!masterHero || mode !== 'BUILD_A_WIG') return null;
    return computeVariantMatrixPreview({
      masterHeroId: masterHero.masterHeroId,
      mode: 'BUILD_A_WIG',
      selection,
      axes: BUILD_A_WIG_DEFAULT_AXES as VariationAxis[],
      backgroundRemoval: backgroundMode === 'TRANSPARENT_CUTOUT' || backgroundMode === 'REMOVE_BACKGROUND',
    });
  }, [masterHero, mode, selection, backgroundMode]);

  const batch = activeBatchId ? getBatch(activeBatchId) : null;
  const progress = activeBatchId ? getBatchProgress(activeBatchId) : null;
  const variants = activeBatchId ? listVariantsForBatch(activeBatchId) : [];
  const notifications = listProductAssetNotifications(projectSlug);

  const toggleAxisValue = useCallback((axis: VariationAxis, value: string) => {
    setSelection((prev) => {
      const current = prev[axis] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [axis]: next };
    });
  }, []);

  const handleSelectAll = useCallback((axis: VariationAxis) => {
    setSelection((prev) => applySelectAll(prev, axis));
  }, []);

  const handleMasterUpload = useCallback(async (file: File) => {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const hero = registerMasterHeroUpload({
      productId,
      productFamilyId: 'frontal-slayer-signature',
      heroType: mode === 'BUILD_A_WIG' ? 'BUILD_A_WIG_BASE' : 'PRODUCT',
      fileName: file.name,
      buffer,
      backgroundMode,
    });
    await persistMasterHeroToSupabase(hero.masterHeroId);
    setMasterHeroId(hero.masterHeroId);
    setUploadPreview(hero.publicUrl);
  }, [productId, mode, backgroundMode]);

  const handleApproveMaster = useCallback(() => {
    if (!masterHero) return;
    const approved = approveMasterHero(masterHero.masterHeroId);
    if (approved) setMasterHeroId(approved.masterHeroId);
  }, [masterHero]);

  const handlePlanAndDispatch = useCallback(
    (generateAll: boolean) => {
      if (!masterHero || masterHero.status !== 'ACTIVE_CANONICAL') return;
      let sel = selection;
      if (generateAll) {
        sel = BUILD_A_WIG_DEFAULT_AXES.reduce(
          (acc, axis) => applySelectAll(acc, axis as VariationAxis),
          {} as VariantSelection,
        );
      }
      const { batch: planned } = planBatch({
        productId,
        masterHeroId: masterHero.masterHeroId,
        mode: 'BUILD_A_WIG',
        selection: sel,
        axes: BUILD_A_WIG_DEFAULT_AXES as VariationAxis[],
        backgroundMode,
      });
      confirmBatchCost(planned.batchId);
      const dispatched = dispatchBatch(planned.batchId);
      if (dispatched) setActiveBatchId(dispatched.batchId);
    },
    [masterHero, selection, productId, backgroundMode],
  );

  const handlePdpGenerate = useCallback(() => {
    if (!masterHero || masterHero.status !== 'ACTIVE_CANONICAL') return;
    const dispatched = dispatchProductPageColorVariant({
      productId,
      masterHeroId: masterHero.masterHeroId,
      colorId: pdpColorId,
      backgroundMode,
      founderConfirmed: costConfirmed,
    });
    if (dispatched) setActiveBatchId(dispatched.batchId);
  }, [masterHero, productId, pdpColorId, backgroundMode, costConfirmed]);

  return (
    <div className="p0paf1-factory" data-lineage={P0_PAF_1_LINEAGE}>
      <header className="p0paf1-factory__header">
        <p className="p0paf1-factory__eyebrow">STUDIO WORLD · FRONTAL SLAYER</p>
        <h1 className="p0paf1-factory__title">PRODUCT ASSET FACTORY</h1>
        <div className="p0paf1-factory__mode-tabs">
          <button
            type="button"
            className={mode === 'BUILD_A_WIG' ? 'is-active' : ''}
            onClick={() => setMode('BUILD_A_WIG')}
          >
            BUILD-A-WIG
          </button>
          <button
            type="button"
            className={mode === 'PRODUCT_PAGE' ? 'is-active' : ''}
            onClick={() => setMode('PRODUCT_PAGE')}
          >
            PRODUCT PAGE
          </button>
        </div>
      </header>

      <section className="p0paf1-factory__panel">
        <h2>PRODUCT</h2>
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
          {FRONTAL_SLAYER_SIX_UNIT_VISUAL_CANON.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.displayName}
            </option>
          ))}
        </select>
      </section>

      <section className="p0paf1-factory__panel">
        <h2>MASTER HERO</h2>
        <div className="p0paf1-factory__hero-preview">
          {(uploadPreview || masterHero?.publicUrl) && (
            <img src={uploadPreview ?? masterHero?.publicUrl} alt="Master hero preview" />
          )}
          {!masterHero && <p className="p0paf1-factory__muted">No master hero uploaded.</p>}
        </div>
        <label className="p0paf1-factory__upload">
          UPLOAD MASTER HERO
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleMasterUpload(file);
            }}
          />
        </label>
        {masterHero?.status === 'DRAFT' && (
          <button type="button" onClick={handleApproveMaster}>
            USE AS MASTER (APPROVE)
          </button>
        )}
        {masterHero && (
          <p className="p0paf1-factory__status">
            Status: {masterHero.status} · Authority: IMAGE REFERENCE
          </p>
        )}
      </section>

      {mode === 'BUILD_A_WIG' && (
        <>
          <section className="p0paf1-factory__panel">
            <h2>CONFIGURE VARIATIONS</h2>
            <AxisGroup
              title="COLOR"
              options={colorOptions}
              selected={selection.COLOR ?? []}
              onToggle={(v) => toggleAxisValue('COLOR', v)}
              onSelectAll={() => handleSelectAll('COLOR')}
            />
            <AxisGroup
              title="STYLE"
              options={styleOptions}
              selected={selection.STYLE ?? []}
              onToggle={(v) => toggleAxisValue('STYLE', v)}
              onSelectAll={() => handleSelectAll('STYLE')}
            />
            <AxisGroup
              title="TEXTURE"
              options={TEXTURE_OPTIONS}
              selected={selection.TEXTURE ?? []}
              onToggle={(v) => toggleAxisValue('TEXTURE', v)}
              onSelectAll={() => handleSelectAll('TEXTURE')}
            />
            <AxisGroup
              title="PART"
              options={PART_OPTIONS}
              selected={selection.PART ?? []}
              onToggle={(v) => toggleAxisValue('PART', v)}
              onSelectAll={() => handleSelectAll('PART')}
            />
            <AxisGroup
              title="LENGTH"
              options={LENGTH_OPTIONS}
              selected={selection.LENGTH ?? []}
              onToggle={(v) => toggleAxisValue('LENGTH', v)}
              onSelectAll={() => handleSelectAll('LENGTH')}
            />
            <AxisGroup
              title="FINISH"
              options={FINISH_OPTIONS}
              selected={selection.FINISH ?? []}
              onToggle={(v) => toggleAxisValue('FINISH', v)}
              onSelectAll={() => handleSelectAll('FINISH')}
            />
            <label>
              BACKGROUND
              <select
                value={backgroundMode}
                onChange={(e) => setBackgroundMode(e.target.value as BackgroundMode)}
              >
                <option value="KEEP_ORIGINAL">KEEP ORIGINAL</option>
                <option value="TRANSPARENT_CUTOUT">TRANSPARENT CUTOUT</option>
                <option value="WHITE_STUDIO">WHITE STUDIO</option>
                <option value="REMOVE_BACKGROUND">REMOVE BACKGROUND</option>
              </select>
            </label>
          </section>

          {matrixPreview && (
            <section className="p0paf1-factory__panel p0paf1-factory__batch-summary">
              <h2>BATCH SUMMARY</h2>
              <p>{matrixPreview.assetCount} VARIANTS</p>
              <p>EST. COST: ${matrixPreview.estimatedCostUsd.toFixed(2)}</p>
              <p>EST. FAL REQUESTS: {matrixPreview.estimatedFalRequests}</p>
              <p>DUPLICATES: {matrixPreview.duplicateCount}</p>
              <label>
                <input
                  type="checkbox"
                  checked={costConfirmed}
                  onChange={(e) => setCostConfirmed(e.target.checked)}
                />
                Confirm batch cost before generation
              </label>
              <div className="p0paf1-factory__actions">
                <button
                  type="button"
                  disabled={!costConfirmed || masterHero?.status !== 'ACTIVE_CANONICAL'}
                  onClick={() => handlePlanAndDispatch(false)}
                >
                  GENERATE SELECTED
                </button>
                <button
                  type="button"
                  disabled={!costConfirmed || masterHero?.status !== 'ACTIVE_CANONICAL'}
                  onClick={() => handlePlanAndDispatch(true)}
                >
                  GENERATE ALL VALID OPTIONS
                </button>
              </div>
            </section>
          )}
        </>
      )}

      {mode === 'PRODUCT_PAGE' && (
        <section className="p0paf1-factory__panel">
          <h2>PRODUCT PAGE VARIANT</h2>
          <label>
            CHANGE
            <select defaultValue="COLOR">
              <option value="COLOR">COLOR</option>
            </select>
          </label>
          <label>
            TARGET COLOR
            <select value={pdpColorId} onChange={(e) => setPdpColorId(e.target.value)}>
              {colorOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            BACKGROUND
            <select
              value={backgroundMode}
              onChange={(e) => setBackgroundMode(e.target.value as BackgroundMode)}
            >
              <option value="KEEP_ORIGINAL">KEEP</option>
              <option value="TRANSPARENT_CUTOUT">TRANSPARENT</option>
              <option value="WHITE_STUDIO">WHITE</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={costConfirmed}
              onChange={(e) => setCostConfirmed(e.target.checked)}
            />
            Confirm generation cost
          </label>
          <button
            type="button"
            disabled={!costConfirmed || masterHero?.status !== 'ACTIVE_CANONICAL'}
            onClick={handlePdpGenerate}
          >
            GENERATE PRODUCT VARIANT
          </button>
        </section>
      )}

      {batch && progress && (
        <section className="p0paf1-factory__panel">
          <h2>BUILD-A-WIG VARIANT BATCH</h2>
          <p>{progress.total} OPTIONS</p>
          <ul className="p0paf1-factory__progress">
            <li>READY {progress.ready}</li>
            <li>GENERATING {progress.generating}</li>
            <li>QUEUED {progress.queued}</li>
            <li>FAILED {progress.failed}</li>
          </ul>
          <div className="p0paf1-factory__actions">
            <button type="button" onClick={() => retryFailedVariants(batch.batchId)}>
              RETRY FAILED
            </button>
            <button type="button" onClick={() => cancelQueuedVariants(batch.batchId)}>
              CANCEL REMAINING
            </button>
          </div>
          <div className="p0paf1-factory__grid">
            {variants.map((v) => (
              <article key={v.variantId} className="p0paf1-factory__variant-card">
                <p>{v.variantKey.key}</p>
                <p>Status: {v.status}</p>
                <p>QA: {v.qaStatus}</p>
                {v.status === 'READY' && (
                  <button type="button" onClick={() => approveVariant(v.variantId)}>
                    APPROVE
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {notifications.length > 0 && (
        <section className="p0paf1-factory__panel">
          <h2>NOTIFICATIONS</h2>
          {notifications.slice(-3).map((n) => (
            <p key={n.id}>
              {n.title}: {n.message}
            </p>
          ))}
        </section>
      )}

      <footer className="p0paf1-factory__footer">
        <p>Master heroes: {listMasterHeroes(productId).length}</p>
        <p>Commerce catalog unchanged · Six signature units preserved</p>
      </footer>
    </div>
  );
}

function AxisGroup(props: {
  title: string;
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}) {
  return (
    <fieldset className="p0paf1-factory__axis">
      <legend>{props.title}</legend>
      {props.options.map((opt) => (
        <label key={opt.id}>
          <input
            type="checkbox"
            checked={props.selected.includes(opt.id)}
            onChange={() => props.onToggle(opt.id)}
          />
          {opt.label}
        </label>
      ))}
      <button type="button" onClick={props.onSelectAll}>
        SELECT ALL
      </button>
    </fieldset>
  );
}
