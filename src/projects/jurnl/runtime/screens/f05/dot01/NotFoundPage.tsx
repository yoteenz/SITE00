/** A DOT 01 address that names no place or entry (an archived or removed record): said plainly, with a way back. */
import { useJurnl } from '../../../state/store';
import { Dot01Frame } from './Dot01Frame';

export function NotFoundPage({ what = 'PLACE' }: { what?: 'PLACE' | 'ENTRY' }) {
  const { go, back } = useJurnl();
  return (
    <Dot01Frame
      screenId="F05.ACCOUNT"
      env="SK02_FIELD"
      title={[what === 'PLACE' ? 'PLACE' : 'ENTRY', 'NOT FOUND']}
      testId="d01-not-found"
      chips={[{ id: 'd01-back', label: 'BACK', icon: 'back', onClick: () => back() || go('money/places') }]}
      contentRect={{ x: 40, y: 610, w: 861, h: 420 }}
      content={
        <div className="d01-paper d01-paper--panel">
          <p className="d01-h">{what === 'PLACE' ? 'THIS PLACE IS NOT IN YOUR RECORDS' : 'THIS ENTRY IS NOT IN YOUR RECORDS'}</p>
          <p className="d01-note">{what === 'PLACE' ? 'IT MAY HAVE BEEN ARCHIVED. ITS HISTORY STAYS IN ACTIVITY.' : 'IT MAY HAVE BEEN REVERSED. THE AUDIT TRAIL KEEPS A COPY.'}</p>
          <div className="d01-actions" style={{ marginTop: 10 }}>
            <button type="button" className="d01-btn" data-jrn-trigger="d01-not-found-all" onClick={() => go('money/places')}>VIEW ALL ACCOUNTS</button>
          </div>
        </div>
      }
    />
  );
}
