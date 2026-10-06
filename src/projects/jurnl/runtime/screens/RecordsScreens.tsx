/** F16 RECORDS — Wave 4 metadata only. */

import { useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import type { RecordType } from '../../data/foundation/records';
import { archiveRecord, createRecord, listRecords, recordById, updateRecord, useRecords } from '../../data/f16/recordsStore';
import { PARENT_PLATES } from '../../data/parents/plates';
import { parentById } from '../../data/parents/catalog';
import { FamilyChrome } from '../components/FamilyChrome';
import { JurnlProductNav } from '../components/ProductNav';
import { AskJurnlSheet, QuickAddV2Sheet } from '../global/GlobalSheets';
import { JurnlButton, JurnlDrawer, JurnlInput, JurnlPanel } from '../components/primitives';
import { JurnlScreen } from './JurnlScreen';
import { useJurnl } from '../state/store';

function Shell({ screenId, children }: { screenId: string; children: ReactNode }) {
  const { go, overlay, openOverlay, closeOverlay } = useJurnl();
  return (
    <JurnlScreen screenId={screenId} familyPlate={PARENT_PLATES.F16} family>
      <div className="jrn-home jrn-parent">{children}</div>
      <JurnlProductNav current="HOME" onGo={go} onAdd={() => openOverlay('quick-add')} />
      {overlay === 'quick-add' ? <QuickAddV2Sheet familyId="F16" onClose={closeOverlay} /> : null}
      {overlay === 'ask' ? <AskJurnlSheet familyId="F16" nodeId={screenId} onClose={closeOverlay} /> : null}
    </JurnlScreen>
  );
}

export function RecordsHubScreen() {
  const { go, openOverlay } = useJurnl();
  const spec = parentById('F16')!;
  const [query, setQuery] = useState('');
  const records = useRecords();
  const items = useMemo(() => listRecords(query), [records, query]);
  const [addOpen, setAddOpen] = useState(false);
  return (
    <Shell screenId="F16.00">
      <FamilyChrome familyId="F16" nodeId="F16.00" backLabel="BACK TO MONEY" onBack={() => go('money')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{spec.name}</h1><p className="jrn-home__sub">{spec.question}</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlInput label="FIND" value={query} onValue={setQuery} trigger="records-find" />
        {items.length === 0 ?
          <JurnlPanel role="empty" className="jrn-home__panel"><b>{query.trim() ? 'NO RESULTS' : 'NOTHING IS FILED'}</b></JurnlPanel>
        : items.map((r) => (
            <button key={r.record_id} type="button" className="jrn-tx jrn-row" data-jrn-trigger={`record-${r.record_id}`} onClick={() => go(`records/${r.record_id}`)}>
              <span className="jrn-tx__copy"><span className="jrn-tx__name">{r.title}</span><small>{r.record_type}</small></span>
              <span className="jrn-tx__amt">{r.status}</span>
            </button>
          ))}
        <JurnlButton trigger="records-add" onClick={() => setAddOpen(true)}>FILE A DOCUMENT</JurnlButton>
      </div>
      {addOpen ? <AddRecordSheet onClose={() => setAddOpen(false)} /> : null}
    </Shell>
  );
}

export function RecordDetailScreen() {
  const { documentId } = useParams<{ documentId: string }>();
  const { go, openOverlay } = useJurnl();
  const record = documentId ? recordById(documentId) : null;
  const [linkOpen, setLinkOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [linkType, setLinkType] = useState('');
  const [linkId, setLinkId] = useState('');
  if (!record) {
    return (
      <Shell screenId="F16.DOCUMENT">
        <FamilyChrome familyId="F16" nodeId="F16.DOCUMENT" backLabel="BACK" onBack={() => go('records')} onAsk={() => openOverlay('ask')} />
        <JurnlPanel role="empty" className="jrn-home__panel"><b>NOT FOUND</b></JurnlPanel>
      </Shell>
    );
  }
  return (
    <Shell screenId="F16.DOCUMENT">
      <FamilyChrome familyId="F16" nodeId="F16.DOCUMENT" backLabel="BACK" onBack={() => go('records')} onAsk={() => openOverlay('ask')} />
      <div className="jrn-home__intro" data-jrn-zone="intro"><h1 className="jrn-home__h">{record.title}</h1><p className="jrn-home__sub">{record.record_type}</p></div>
      <div className="jrn-parent__rail" data-jrn-zone="content-rail">
        <JurnlPanel role="detail" className="jrn-home__panel">
          <b>STORAGE</b>
          <p>{record.file_ref ? 'FILE ON DEVICE' : 'METADATA ONLY · NO REMOTE UPLOAD IN THIS BUILD'}</p>
          <b>STATUS</b>
          <p>{record.status}</p>
          {record.linked_domain_id ?
            <p>LINKED · {record.linked_domain_type} · {record.linked_domain_id}</p>
          : null}
        </JurnlPanel>
        <JurnlButton trigger="records-link" onClick={() => setLinkOpen(true)}>LINK RECORD</JurnlButton>
        <JurnlButton variant="secondary" trigger="records-unlink" onClick={() => updateRecord({ ...record, linked_domain_type: null, linked_domain_id: null })}>UNLINK</JurnlButton>
        <JurnlButton variant="secondary" trigger="records-remove" onClick={() => setRemoveOpen(true)}>REMOVE</JurnlButton>
      </div>
      {linkOpen ?
        <JurnlDrawer expression="form" size="long" testId="records-link" title="LINK RECORD" onClose={() => setLinkOpen(false)}
          footer={<JurnlButton trigger="records-link-save" onClick={() => { updateRecord({ ...record, linked_domain_type: linkType || null, linked_domain_id: linkId || null }); setLinkOpen(false); }}>SAVE LINK</JurnlButton>}>
          <JurnlInput label="DOMAIN TYPE" value={linkType} onValue={setLinkType} trigger="records-link-type" />
          <JurnlInput label="DOMAIN ID" value={linkId} onValue={setLinkId} trigger="records-link-id" />
        </JurnlDrawer>
      : null}
      {removeOpen ?
        <JurnlDrawer expression="confirmation" size="long" testId="records-remove" title="REMOVE A DOCUMENT" onClose={() => setRemoveOpen(false)}
          footer={<JurnlButton trigger="records-remove-ok" onClick={() => { archiveRecord(record.record_id); setRemoveOpen(false); go('records'); }}>REMOVE</JurnlButton>}>
          <p>ARCHIVE {record.title}?</p>
        </JurnlDrawer>
      : null}
    </Shell>
  );
}

function AddRecordSheet({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RecordType>('RECEIPT');
  const { go } = useJurnl();
  return (
    <JurnlDrawer expression="form" size="long" testId="records-add" title="FILE A DOCUMENT" onClose={onClose}
      footer={<JurnlButton trigger="records-save" disabled={!title.trim()} onClick={() => { const r = createRecord({ title, record_type: type }); onClose(); go(`records/${r.record_id}`); }}>SAVE METADATA</JurnlButton>}>
      <JurnlInput label="TITLE" value={title} onValue={setTitle} trigger="records-title" />
      <div className="jrn-home__choices" role="radiogroup" aria-label="KIND">
        {(['RECEIPT', 'STATEMENT', 'INVOICE', 'OTHER'] as const).map((t) => (
          <button key={t} type="button" className="jrn-btn jrn-btn--secondary" aria-pressed={type === t} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>
      <p className="jrn-currency__note">FILE UPLOAD IS NOT PRODUCTION-READY · METADATA IS STORED HONESTLY.</p>
    </JurnlDrawer>
  );
}
