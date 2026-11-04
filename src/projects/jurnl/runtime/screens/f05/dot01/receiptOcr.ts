/**
 * F05 DOT 01 — on-device receipt reading. tesseract.js (Apache-2.0) runs in a web worker with its English model,
 * all self-hosted under /jurnl/ocr (no CDN, no provider, no upload). Loaded only when a receipt is scanned.
 * Stages are the engine's own progress events; there is no timer pretending to scan. A timeout ends in failure.
 */
export type OcrStage = 'LOADING_READER' | 'READING_TEXT' | 'DONE';
export type OcrProgress = { stage: OcrStage; progress: number };
export type OcrResult = { text: string; confidence: number };

const BASE = '/jurnl/ocr';

export async function readReceiptText(image: Blob, onProgress: (p: OcrProgress) => void, timeoutMs = 45_000): Promise<OcrResult> {
  onProgress({ stage: 'LOADING_READER', progress: 0 });
  const { createWorker } = await import('tesseract.js');
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  const timer = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('OCR_TIMEOUT')), timeoutMs));
  try {
    const run = (async () => {
      worker = await createWorker('eng', 1, {
        workerPath: `${BASE}/worker.min.js`,
        corePath: `${BASE}/core`,
        langPath: `${BASE}/lang`,
        gzip: true,
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') onProgress({ stage: 'READING_TEXT', progress: m.progress });
          else onProgress({ stage: 'LOADING_READER', progress: m.progress });
        },
      });
      const { data } = await worker.recognize(image);
      return { text: data.text ?? '', confidence: data.confidence ?? 0 };
    })();
    const r = await Promise.race([run, timer]);
    onProgress({ stage: 'DONE', progress: 1 });
    return r;
  } finally {
    const w = worker as { terminate: () => Promise<unknown> } | null;
    if (w) void w.terminate().catch(() => undefined);
  }
}
