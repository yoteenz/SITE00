import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CreativeRevisionSpec,
  RevisionCategoryKey,
  RevisionElementKey,
  RevisionGenerationBrief,
  RevisionSeverity,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionTypes';
import { REVISION_CATEGORY_KEYS, REVISION_ELEMENT_KEYS } from '../../../../shared/site00-brand-lore/creativeLineage/revisionTypes';
import { site00ProjectsApi } from '../../services/site00ProjectsApi';

const CATEGORY_LABELS: Record<RevisionCategoryKey, string> = {
  typography: 'TYPOGRAPHY',
  color: 'COLOR',
  composition: 'COMPOSITION',
  copy: 'COPY',
  imagery: 'IMAGE / ASSET',
  material: 'MATERIAL / TEXTURE',
  annotation: 'ANNOTATION',
  hierarchy: 'INFORMATION HIERARCHY',
  spacing: 'SPACING',
  scale: 'SCALE',
  crop: 'CROP / FRAMING',
  graphicDevice: 'GRAPHIC DEVICE',
  brandRecognition: 'BRAND RECOGNITION',
  formatBehavior: 'FORMAT BEHAVIOR',
  motion: 'MOTION',
  other: 'OTHER',
};

const ELEMENT_LABELS: Record<RevisionElementKey, string> = {
  COPY: 'COPY',
  TYPOGRAPHY: 'TYPOGRAPHY',
  COLOR: 'COLOR',
  COMPOSITION: 'COMPOSITION',
  ASSETS: 'ASSETS',
  ANNOTATIONS: 'ANNOTATIONS',
  BACKGROUND: 'BACKGROUND',
  MATERIALS: 'MATERIALS',
  CROP: 'CROP',
  INFORMATION: 'INFORMATION',
  FORMAT: 'FORMAT',
  WORLD: 'WORLD',
  DIRECTION_DNA: 'DIRECTION DNA',
};

type RevisionStudioProps = {
  projectSlug: string;
  parentAssetId: string;
  previewUrl: string;
  previewLabel: string;
  onClose: () => void;
  onSaved?: () => void;
};

export function RevisionStudio({
  projectSlug,
  parentAssetId,
  previewUrl,
  previewLabel,
  onClose,
  onSaved,
}: RevisionStudioProps) {
  const [spec, setSpec] = useState<CreativeRevisionSpec | null>(null);
  const [brief, setBrief] = useState<RevisionGenerationBrief | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<RevisionCategoryKey[]>([]);
  const [categoryNotes, setCategoryNotes] = useState<Partial<Record<RevisionCategoryKey, string>>>({});
  const [founderNote, setFounderNote] = useState('');
  const [lockedElements, setLockedElements] = useState<RevisionElementKey[]>([]);
  const [mutableElements, setMutableElements] = useState<RevisionElementKey[]>([]);
  const [severity, setSeverity] = useState<RevisionSeverity>('TARGETED');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateReason, setGateReason] = useState<string | null>(null);

  const loadDraft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await site00ProjectsApi.founderRevisionHistory(projectSlug, parentAssetId);
      const pending = history.history.revisions.find((r) => r.status === 'DRAFT' || r.status === 'READY_FOR_REVIEW');
      let draft = pending ?? null;
      if (!draft) {
        const created = await site00ProjectsApi.founderRevisionSpecCreate(projectSlug, { parentAssetId });
        draft = created.spec;
      }
      setSpec(draft);
      setFounderNote(draft.founderOriginalNote ?? '');
      setCategoryNotes(draft.categoryNotes ?? {});
      setSelectedCategories(Object.keys(draft.categoryNotes ?? {}) as RevisionCategoryKey[]);
      setLockedElements(draft.lockedElements ?? []);
      setMutableElements(draft.mutableElements ?? []);
      setSeverity(draft.severity ?? 'TARGETED');
      setGateReason(draft.generationGate?.gateReason ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revision studio');
    } finally {
      setLoading(false);
    }
  }, [parentAssetId, projectSlug]);

  useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

  const toggleCategory = (key: RevisionCategoryKey) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const toggleLock = (key: RevisionElementKey) => {
    setLockedElements((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      setMutableElements((m) => m.filter((k) => k !== key));
      return [...prev, key];
    });
  };

  const toggleMutable = (key: RevisionElementKey) => {
    setMutableElements((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      setLockedElements((l) => l.filter((k) => k !== key));
      return [...prev, key];
    });
  };

  const filteredCategoryNotes = useMemo(() => {
    const notes: Partial<Record<RevisionCategoryKey, string>> = {};
    for (const key of selectedCategories) {
      const note = categoryNotes[key]?.trim();
      if (note) notes[key] = note;
    }
    return notes;
  }, [categoryNotes, selectedCategories]);

  const save = useCallback(async () => {
    if (!spec) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await site00ProjectsApi.founderRevisionSpecUpdate(projectSlug, {
        revisionId: spec.revisionId,
        founderOriginalNote: founderNote,
        categoryNotes: filteredCategoryNotes,
        lockedElements,
        mutableElements,
        severity,
        status: 'DRAFT',
      });
      setSpec(updated.spec);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [
    filteredCategoryNotes,
    founderNote,
    lockedElements,
    mutableElements,
    onSaved,
    projectSlug,
    severity,
    spec,
  ]);

  const compile = useCallback(async () => {
    if (!spec) return;
    await save();
    setCompiling(true);
    setError(null);
    try {
      const result = await site00ProjectsApi.founderRevisionSpecCompile(projectSlug, spec.revisionId);
      setSpec(result.spec);
      setBrief(result.brief);
      setGateReason(result.generationGate.gateReason);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compile failed');
    } finally {
      setCompiling(false);
    }
  }, [projectSlug, save, spec]);

  if (loading) {
    return (
      <div className="site00-revision-studio" role="dialog" aria-label="Revision Studio">
        <p className="site00-revision-studio__pending">LOADING REVISION STUDIO…</p>
      </div>
    );
  }

  return (
    <div className="site00-revision-studio" role="dialog" aria-label="Revision Studio">
      <header className="site00-revision-studio__header">
        <h2>REVISION STUDIO</h2>
        <button type="button" className="site00-revision-studio__close" onClick={onClose}>
          CLOSE
        </button>
      </header>

      <section className="site00-revision-studio__asset">
        <p className="site00-revision-studio__label">CURRENT ASSET</p>
        <p className="site00-revision-studio__meta">{previewLabel}</p>
        {previewUrl ? (
          <img src={previewUrl} alt={previewLabel} className="site00-revision-studio__preview" />
        ) : (
          <p>NO PREVIEW</p>
        )}
      </section>

      <section className="site00-revision-studio__section">
        <h3>WHAT NEEDS TO CHANGE?</h3>
        <div className="site00-revision-studio__categories">
          {REVISION_CATEGORY_KEYS.map((key) => (
            <label key={key} className="site00-revision-studio__category">
              <input
                type="checkbox"
                checked={selectedCategories.includes(key)}
                onChange={() => toggleCategory(key)}
              />
              {CATEGORY_LABELS[key]}
            </label>
          ))}
        </div>
        {selectedCategories.map((key) => (
          <div key={key} className="site00-revision-studio__note-block">
            <label htmlFor={`note-${key}`}>{CATEGORY_LABELS[key]}</label>
            <textarea
              id={`note-${key}`}
              rows={3}
              value={categoryNotes[key] ?? ''}
              placeholder={`Notes for ${CATEGORY_LABELS[key]}…`}
              onChange={(e) => setCategoryNotes((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          </div>
        ))}
      </section>

      <section className="site00-revision-studio__section">
        <h3>OVERALL REVISION NOTE</h3>
        <textarea
          rows={4}
          value={founderNote}
          placeholder="Verbatim founder language — preserved exactly"
          onChange={(e) => setFounderNote(e.target.value)}
        />
      </section>

      <section className="site00-revision-studio__section">
        <h3>LOCK / CHANGE</h3>
        <p className="site00-revision-studio__meta">
          Unspecified dimensions default to preserved (surgical revision).
        </p>
        <div className="site00-revision-studio__lock-grid">
          {REVISION_ELEMENT_KEYS.map((key) => (
            <div key={key} className="site00-revision-studio__lock-row">
              <span>{ELEMENT_LABELS[key]}</span>
              <button
                type="button"
                className={lockedElements.includes(key) ? 'site00-revision-studio__lock--active' : ''}
                onClick={() => toggleLock(key)}
              >
                LOCK
              </button>
              <button
                type="button"
                className={mutableElements.includes(key) ? 'site00-revision-studio__change--active' : ''}
                onClick={() => toggleMutable(key)}
              >
                CHANGE
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="site00-revision-studio__section">
        <h3>REVISION SEVERITY</h3>
        <select value={severity} onChange={(e) => setSeverity(e.target.value as RevisionSeverity)}>
          <option value="MICRO">MICRO</option>
          <option value="TARGETED">TARGETED</option>
          <option value="SUBSTANTIAL">SUBSTANTIAL</option>
          <option value="REINTERPRET">REINTERPRET</option>
        </select>
      </section>

      {error ? (
        <p className="site00-revision-studio__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="site00-revision-studio__actions">
        <button type="button" disabled={saving} onClick={() => void save()}>
          {saving ? 'SAVING…' : 'SAVE SPEC'}
        </button>
        <button type="button" disabled={compiling || !spec} onClick={() => void compile()}>
          {compiling ? 'COMPILING…' : 'COMPILE DELTA BRIEF'}
        </button>
        <button type="button" disabled title={gateReason ?? 'Generation gated this sprint'}>
          REVISION READY — GENERATION NOT YET ENABLED
        </button>
      </div>

      {brief ? (
        <details className="site00-revision-studio__brief">
          <summary>COMPILED DELTA BRIEF</summary>
          <pre>{brief.deltaPrompt}</pre>
        </details>
      ) : null}
    </div>
  );
}
