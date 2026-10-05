/** Resolve when `promise` settles, or resolve with `fallback` after `ms` (does not abort underlying I/O). */
export function promiseWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  if (ms <= 0) return promise;
  return new Promise<T>((resolve) => {
    const timer = globalThis.setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        globalThis.clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        globalThis.clearTimeout(timer);
        resolve(fallback);
      });
  });
}
