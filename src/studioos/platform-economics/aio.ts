import type { CaptureInput, PlatformBooks } from './books';

/** AIO does not calculate a platform fee. It submits a service collection to the shared books. */
export function accrueAioServicePayment(books: PlatformBooks, input: Omit<CaptureInput, 'consumer' | 'transactionType'>): ReturnType<PlatformBooks['ingestCapture']> {
  return books.ingestCapture({ ...input, consumer: 'AIO', transactionType: 'SERVICE_PAYMENT' });
}
