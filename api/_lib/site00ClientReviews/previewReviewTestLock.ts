/** Serialize preview-fixture Supabase mutations under Vitest (shared review ids across files). */

let mutationChain: Promise<void> = Promise.resolve();
let lockDepth = 0;

export function withPreviewReviewSupabaseTestLock<T>(enabled: boolean, work: () => Promise<T>): Promise<T> {
  if (!enabled) return work();
  if (lockDepth > 0) return work();
  const run = mutationChain.then(async () => {
    lockDepth += 1;
    try {
      return await work();
    } finally {
      lockDepth -= 1;
    }
  });
  mutationChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
