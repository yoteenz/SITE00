import { Suspense, type ReactNode } from 'react';

/** ASSTS lazy routes — cinematic gate owns the loader; never duplicate it in Suspense. */
function AsstsRouteFallback() {
  return null;
}

export function AsstsRouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AsstsRouteFallback />}>{children}</Suspense>;
}
