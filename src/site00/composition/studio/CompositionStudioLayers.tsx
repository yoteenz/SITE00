import type { CompositionStudioController } from './useCompositionStudio';
import { isCompositionEditable } from './types';

type CompositionStudioLayersProps = {
  controller: CompositionStudioController;
};

export function CompositionStudioLayers({ controller }: CompositionStudioLayersProps) {
  const { doc, selectedId, dispatch } = controller;
  const editable = isCompositionEditable(doc);

  const environmentObjects = doc.objects
    .filter((o) => o.objectClass === 'environment')
    .sort((a, b) => b.zIndex - a.zIndex);
  const interfaceObjects = doc.objects
    .filter((o) => o.objectClass === 'interface')
    .sort((a, b) => b.zIndex - a.zIndex);

  const renderRow = (id: string, label: string, locked: boolean, visible: boolean, baked: boolean) => (
    <div
      key={id}
      className={`composition-studio__layer-row ${selectedId === id ? 'composition-studio__layer-row--selected' : ''}`}
    >
      <button
        type="button"
        className="composition-studio__layer-select"
        onClick={() => dispatch({ type: 'SELECT', id })}
      >
        {label}
      </button>
      <div className="composition-studio__layer-actions">
        {editable ? (
          <>
            <button
              type="button"
              title={visible ? 'Hide' : 'Show'}
              aria-label={visible ? 'Hide layer' : 'Show layer'}
              onClick={() => dispatch({ type: 'TOGGLE_VISIBILITY', id })}
            >
              {visible ? '◉' : '○'}
            </button>
            {!baked ? (
              <button
                type="button"
                title={locked ? 'Unlock position' : 'Lock position'}
                aria-label={locked ? 'Unlock position' : 'Lock position'}
                onClick={() => dispatch({ type: 'TOGGLE_LOCK', id })}
              >
                {locked ? '🔒' : '🔓'}
              </button>
            ) : null}
            {!baked ? (
              <>
                <button type="button" title="Raise" onClick={() => dispatch({ type: 'REORDER', id, direction: 'up' })}>
                  ↑
                </button>
                <button type="button" title="Lower" onClick={() => dispatch({ type: 'REORDER', id, direction: 'down' })}>
                  ↓
                </button>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <aside className="composition-studio__layers" aria-label="Layers">
      <h2 className="composition-studio__panel-title">Layers</h2>
      <div className="composition-studio__layer-group">
        <h3 className="composition-studio__layer-group-title">Environment</h3>
        {environmentObjects.map((o) => renderRow(o.id, o.label, o.positionLocked, o.visible, o.sourceType === 'environment-baked'))}
      </div>
      <div className="composition-studio__layer-group">
        <h3 className="composition-studio__layer-group-title">Interface</h3>
        {interfaceObjects.map((o) => renderRow(o.id, o.label, o.positionLocked, o.visible, false))}
      </div>
    </aside>
  );
}
