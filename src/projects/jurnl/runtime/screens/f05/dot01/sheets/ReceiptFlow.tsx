/**
 * F05 DOT 01 — CAPTURE RECEIPT (26), SCANNING RECEIPT (27) and RECEIPT CAPTURE FAILURE (34).
 * The user's own photo or file is shown in the founder's capture frame; the scan follows the real on-device OCR
 * (receiptOcr.ts) step by step and never shows a result it did not read. Failures keep the photo and offer to try
 * again, upload instead or enter the purchase manually. Nothing is saved here: the read values go to review.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { checkReceiptFile, parseReceiptText, type ReceiptRead } from '../../../../../data/f05/dot01/receipt';
import { DOT01 } from '../dot01Assets';
import { by, Dot01Overlay, type Dot01Layout } from '../Dot01Frame';
import { Icon } from '../icons';
import { Alert, Button, Paper } from '../kit';
import { readReceiptText, type OcrProgress } from '../receiptOcr';
import { normalizeImage, sha256 } from '../receiptStore';

export type ReceiptCapture = { read: ReceiptRead; image: Blob; imageSha: string; source: 'CAMERA' | 'UPLOAD'; mime: string };
type Step = 'capture' | 'scanning' | 'failed';
type Failure = { title: string; reasons: string[] };

const CONTENT = { x: 30, y: 590, w: 881, h: 1076 };
/** SK03: the frame paper ends at board y 1040 and the strip starts at 1042 (F05_DOT01_GEOMETRY.json). */
const SK03_SEAM = 1041;

export function ReceiptFlow({ onRead, onManual, onClose }: { onRead: (c: ReceiptCapture) => void; onManual: () => void; onClose: () => void }) {
  const [step, setStep] = useState<Step>('capture');
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [parsed, setParsed] = useState(false);
  const [checked, setChecked] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  useEffect(() => {
    // set on every mount (StrictMode mounts, unmounts and mounts again in development)
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const fail = (f: Failure) => {
    if (!alive.current) return;
    setFailure(f);
    setStep('failed');
  };

  const run = async (file: File, source: 'CAMERA' | 'UPLOAD') => {
    const bad = checkReceiptFile(file);
    if (bad) return fail({ title: 'RECEIPT NOT SUPPORTED', reasons: [bad] });
    setFailure(null);
    setParsed(false);
    setChecked(false);
    let img: Blob;
    try {
      img = await normalizeImage(file);
    } catch {
      return fail({ title: 'RECEIPT NOT CLEAR', reasons: ['THIS IMAGE COULD NOT BE OPENED ON THIS DEVICE (HEIC PHOTOS NEED SAFARI).', 'TAKE A NEW PHOTO OR UPLOAD A JPG / PNG.'] });
    }
    setPreview(URL.createObjectURL(img));
    setStep('scanning');
    try {
      const r = await readReceiptText(img, (p) => alive.current && setProgress(p));
      if (!alive.current) return;
      const read = parseReceiptText(r.text, r.confidence);
      setParsed(true);
      const imageSha = await sha256(img);
      setChecked(true);
      if (read.warnings.includes('NO_TEXT') || (read.total == null && read.merchant == null && read.date == null)) {
        return fail({ title: 'RECEIPT NOT CLEAR', reasons: ['NO TEXT COULD BE READ', 'LOW LIGHT OR BLURRY IMAGE', 'THE WHOLE RECEIPT MAY NOT BE IN THE FRAME'] });
      }
      onRead({ read, image: img, imageSha, source, mime: 'image/jpeg' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      fail({ title: msg === 'OCR_TIMEOUT' ? 'READING TOOK TOO LONG' : 'RECEIPT NOT READ', reasons: msg === 'OCR_TIMEOUT' ? ['THE READER DID NOT FINISH IN 45 SECONDS.', 'TRY AGAIN, OR ENTER IT MANUALLY.'] : ['THE RECEIPT READER COULD NOT START ON THIS DEVICE.', 'ENTER IT MANUALLY, OR TRY AGAIN.'] });
    }
  };

  const pick = (ref: RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      ref.current.value = '';
      ref.current.click();
    }
  };

  const reading = progress?.stage === 'READING_TEXT';
  const steps: { label: string; state: 'done' | 'active' | 'wait' | 'failed' }[] = [
    { label: 'LOADING THE RECEIPT READER', state: progress && progress.stage !== 'LOADING_READER' ? 'done' : step === 'scanning' ? 'active' : 'wait' },
    { label: reading ? `READING TEXT · ${Math.round((progress?.progress ?? 0) * 100)}%` : 'READING TEXT', state: parsed ? 'done' : reading ? 'active' : 'wait' },
    { label: 'FINDING MERCHANT, DATE AND TOTAL', state: parsed ? 'done' : 'wait' },
    { label: 'CHECKING FOR DUPLICATES', state: checked ? 'done' : parsed ? 'active' : 'wait' },
  ];
  const inputs = (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="d01-sr" aria-hidden tabIndex={-1} data-jrn-trigger="d01-receipt-camera-input" onChange={(e) => e.target.files?.[0] && void run(e.target.files[0], 'CAMERA')} />
      <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf" className="d01-sr" aria-hidden tabIndex={-1} data-jrn-trigger="d01-receipt-upload-input" onChange={(e) => e.target.files?.[0] && void run(e.target.files[0], 'UPLOAD')} />
    </>
  );
  const frame = (dim: boolean, children?: ReactNode) => (
    <div className="d01-receipt-frame" data-testid="d01-receipt-frame">
      <img className="d01-receipt-frame__art" src={DOT01['21_RECEIPT_CAPTURE_FRAME']} alt="" />
      <div className="d01-receipt-frame__window" style={dim ? { filter: 'blur(1.5px) brightness(0.85)' } : undefined}>
        {preview ? <img src={preview} alt="YOUR RECEIPT" /> : <Icon name="receipt" className="d01-receipt-placeholder" />}
        {children}
      </div>
    </div>
  );

  if (step === 'scanning')
    return (
      <Dot01Overlay testId="d01-receipt-scanning" env="SK03_FIELD" title={['SCANNING', 'RECEIPT']} subtitle="pulling in the details" onClose={onClose} contentRect={CONTENT} contentScroll label="SCANNING RECEIPT" content={
        <>
          {frame(false, <span className="d01-scanline" data-on="true" aria-hidden />)}
          <Paper kind="sheet">
            <ol className="d01-steps" aria-label="SCAN PROGRESS">
              {steps.map((s) => (
                <li key={s.label} data-state={s.state}>
                  <Icon name={s.state === 'done' ? 'check' : s.state === 'failed' ? 'warn' : 'search'} />
                  <span>{s.label}</span>
                </li>
              ))}
            </ol>
            <p className="d01-sr" aria-live="polite">{reading ? 'READING THE RECEIPT TEXT' : 'LOADING THE RECEIPT READER'}</p>
            <p className="d01-note" style={{ textAlign: 'center', marginTop: 6 }}>READ ON THIS DEVICE. THE PHOTO IS NOT UPLOADED.</p>
          </Paper>
          <Button trigger="d01-receipt-cancel" quiet onClick={onClose}>CANCEL</Button>
        </>
      } />
    );

  if (step === 'failed' && failure)
    return (
      <Dot01Overlay testId="d01-receipt-failure" env="SK03_FIELD" title={['RECEIPT', 'CAPTURE']} subtitle="something went wrong" onClose={onClose} contentRect={CONTENT} contentScroll label="RECEIPT CAPTURE FAILURE" content={
        <>
          {inputs}
          <div className="d01-split">
            {frame(true)}
            <Paper kind="panel">
              <p className="d01-h">{failure.title}</p>
              <ul className="d01-list">
                {failure.reasons.map((r) => (
                  <li key={r} className="d01-note">{r}</li>
                ))}
              </ul>
            </Paper>
          </div>
          <Alert role="alert" testId="d01-receipt-failed">NOTHING WAS SAVED. YOUR PHOTO IS STILL HERE.</Alert>
          <div className="d01-actions">
            <Button trigger="d01-receipt-retry" icon="camera" onClick={() => pick(cameraRef)}>TRY AGAIN</Button>
            <Button trigger="d01-receipt-upload" quiet icon="upload" onClick={() => pick(uploadRef)}>UPLOAD PHOTO</Button>
            <Button trigger="d01-receipt-manual" quiet icon="edit" onClick={onManual}>ENTER MANUALLY</Button>
          </div>
        </>
      } />
    );

  // CAPTURE RECEIPT (26) on the full SK03 (the authority's own render without lettering): the wooden frame, the
  // instruction strip and the two button shapes are baked; the lettering, the photo and the controls are live and sit
  // on them in board px. The elastic seam runs between the frame (ends y 1040) and the strip (starts y 1042).
  const at = (L: Dot01Layout, x0: number, y0: number, x1: number, y1: number): CSSProperties => ({ left: x0, top: by(L, y0), width: x1 - x0, height: y1 - y0 });
  return (
    <Dot01Overlay
      testId="d01-receipt-capture"
      env="SK03"
      elasticY={SK03_SEAM}
      title={['CAPTURE', 'RECEIPT']}
      subtitle="take a clear photo"
      onClose={onClose}
      label="CAPTURE RECEIPT"
      board={(L) => (
        <>
          {inputs}
          <div className="d01-cap__window" style={at(L, 203, 609, 744, 993)} data-testid="d01-receipt-frame">
            {preview ? <img src={preview} alt="YOUR RECEIPT" /> : <span className="d01-cap__empty">YOUR PHOTO APPEARS HERE</span>}
            <i className="d01-cap__corner" data-c="tl" aria-hidden />
            <i className="d01-cap__corner" data-c="tr" aria-hidden />
            <i className="d01-cap__corner" data-c="bl" aria-hidden />
            <i className="d01-cap__corner" data-c="br" aria-hidden />
          </div>
          <ul className="d01-cap__tips" aria-label="TIPS">
            <li style={at(L, 92, 1062, 900, 1112)}>
              <Icon name="frame" />
              <span className="d01-cap__rule" aria-hidden />
              FIT THE WHOLE RECEIPT IN FRAME
            </li>
            <li style={at(L, 92, 1132, 900, 1182)}>
              <Icon name="calendar" />
              <span className="d01-cap__rule" aria-hidden />
              MAKE SURE TOTAL AND DATE ARE VISIBLE
            </li>
          </ul>
          <button type="button" className="jrn-d01__hit d01-cap__btn d01-cap__btn--dark" data-jrn-trigger="d01-receipt-take" style={at(L, 88, 1227, 853, 1327)} onClick={() => pick(cameraRef)}>
            <Icon name="camera" />
            TAKE PHOTO
          </button>
          <button type="button" className="jrn-d01__hit d01-cap__btn" data-jrn-trigger="d01-receipt-upload" style={at(L, 88, 1348, 853, 1431)} onClick={() => pick(uploadRef)}>
            <Icon name="upload" />
            UPLOAD PHOTO
          </button>
          <button type="button" className="jrn-d01__hit d01-cap__manual" data-jrn-trigger="d01-receipt-manual" style={at(L, 100, 1442, 841, 1506)} onClick={onManual}>
            <span className="d01-cap__rule d01-cap__rule--wide" aria-hidden />
            ENTER MANUALLY
            <span className="d01-cap__rule d01-cap__rule--wide" aria-hidden />
          </button>
          <p className="jrn-d01__on d01-cap__note" style={at(L, 60, 1532, 881, 1568)}>JURNL READS THE PURCHASE DETAILS FOR YOUR REVIEW</p>
        </>
      )}
    />
  );
}
