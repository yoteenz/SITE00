import { resolveObjectRect } from './objectLayout';
import type { CompositionStudioController } from './useCompositionStudio';
import { isCompositionEditable } from './types';

type CompositionStudioPropertiesProps = {
  controller: CompositionStudioController;
};

export function CompositionStudioProperties({ controller }: CompositionStudioPropertiesProps) {
  const { doc, selected, viewport, dispatch } = controller;
  const editable = isCompositionEditable(doc);

  if (!selected) {
    return (
      <aside className="composition-studio__properties" aria-label="Properties">
        <h2 className="composition-studio__panel-title">Properties</h2>
        <p className="composition-studio__properties-empty">Select an object to inspect coordinates and role.</p>
        <div className="composition-studio__properties-meta">
          <span className="site00-label-red">STATUS</span>
          <p>{doc.status.replace(/_/g, ' ')}</p>
          <span className="site00-label-red">VERSION</span>
          <p>{doc.versionLabel.replace(/_/g, ' ')}</p>
        </div>
      </aside>
    );
  }

  const rect = resolveObjectRect(selected, viewport);
  const zone = doc.zones.find((z) => z.id === selected.zoneId);

  const setRectField = (field: keyof typeof rect, value: number) => {
    dispatch({
      type: 'UPDATE_OBJECT_RECT',
      id: selected.id,
      rect: { ...rect, [field]: value },
      commit: true,
    });
  };

  return (
    <aside className="composition-studio__properties" aria-label="Properties">
      <h2 className="composition-studio__panel-title">Properties</h2>
      <p className="composition-studio__properties-selected">{selected.label}</p>

      <dl className="composition-studio__prop-list">
        <dt>Type</dt>
        <dd>{selected.text ? 'Text' : selected.objectClass === 'environment' ? 'Environment' : 'Module'}</dd>
        <dt>Role</dt>
        <dd>{selected.semanticRole.replace(/-/g, ' ')}</dd>
        <dt>Source</dt>
        <dd>{selected.sourceType}</dd>
        {zone ? (
          <>
            <dt>Zone</dt>
            <dd>{zone.label}</dd>
          </>
        ) : null}
        <dt>State</dt>
        <dd>{selected.positionLocked ? 'Locked' : 'Unlocked'}</dd>
      </dl>

      {editable && selected.editableProperties.includes('position') && selected.sourceType !== 'environment-baked' ? (
        <div className="composition-studio__prop-grid">
          <label>
            X
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              value={Number(rect.x.toFixed(3))}
              onChange={(e) => setRectField('x', parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              value={Number(rect.y.toFixed(3))}
              onChange={(e) => setRectField('y', parseFloat(e.target.value) || 0)}
            />
          </label>
          <label>
            W
            <input
              type="number"
              step="0.01"
              min={0.01}
              max={1}
              value={Number(rect.width.toFixed(3))}
              onChange={(e) => setRectField('width', parseFloat(e.target.value) || 0.01)}
            />
          </label>
          <label>
            H
            <input
              type="number"
              step="0.01"
              min={0.01}
              max={1}
              value={Number(rect.height.toFixed(3))}
              onChange={(e) => setRectField('height', parseFloat(e.target.value) || 0.01)}
            />
          </label>
        </div>
      ) : null}

      {editable && selected.text && selected.editableProperties.includes('text') ? (
        <div className="composition-studio__prop-text">
          <label>
            Content
            <textarea
              rows={2}
              value={selected.text.content}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_OBJECT',
                  id: selected.id,
                  patch: { text: { ...selected.text!, content: e.target.value } },
                })
              }
            />
          </label>
          <label>
            Alignment
            <select
              value={selected.text.align}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_OBJECT',
                  id: selected.id,
                  patch: {
                    text: { ...selected.text!, align: e.target.value as 'left' | 'center' | 'right' },
                  },
                })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label>
            Scale
            <input
              type="number"
              step="0.05"
              min={0.5}
              max={1.5}
              value={selected.text.scale ?? 1}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_OBJECT',
                  id: selected.id,
                  patch: { text: { ...selected.text!, scale: parseFloat(e.target.value) || 1 } },
                })
              }
            />
          </label>
        </div>
      ) : null}

      {selected.sourceType === 'environment-baked' && selected.recompositionRequest ? (
        <div className="composition-studio__recompose-panel">
          <span className="site00-label-red">RECOMPOSITION REQUEST</span>
          <p className="composition-studio__recompose-copy">
            Target recorded — environment revision required before implementation.
          </p>
        </div>
      ) : null}

      {editable && selected.sourceType !== 'environment-baked' ? (
        <div className="composition-studio__prop-actions">
          <button type="button" onClick={() => dispatch({ type: 'DUPLICATE', id: selected.id })}>
            Duplicate
          </button>
          <button type="button" onClick={() => dispatch({ type: 'DELETE_OBJECT', id: selected.id })}>
            Delete
          </button>
        </div>
      ) : null}
    </aside>
  );
}
