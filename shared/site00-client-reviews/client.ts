export * from './types.js';
export * from './translators.js';
export * from './previewSeed.js';

export function clientReviewDetailPath(projectSlug: string, reviewId: string): string {
  return `/client/projects/${projectSlug}/reviews/${reviewId}`;
}

export function clientReviewQueuePath(projectSlug: string): string {
  return `/client/projects/${projectSlug}/reviews`;
}
