import { useLocation, useParams } from 'react-router-dom';
import type { ClientAppNavSection } from '../../../shared/site00-client-app/types.js';

/** Returns `/app/preview/:slug` or `/app/projects/:slug` based on current route. */
export function useAppBasePath(projectSlug?: string): string {
  const { projectSlug: paramSlug = '' } = useParams();
  const location = useLocation();
  const slug = projectSlug ?? paramSlug;
  const isPreview = location.pathname.includes('/app/preview/');
  return isPreview ? `/app/preview/${slug}` : `/app/projects/${slug}`;
}

export function useIsAppPreview(): boolean {
  const location = useLocation();
  return location.pathname.includes('/app/preview/');
}

export function appBasePathForSlug(projectSlug: string, isPreview: boolean): string {
  return isPreview ? `/app/preview/${projectSlug}` : `/app/projects/${projectSlug}`;
}

export function appNavPath(
  projectSlug: string,
  section: ClientAppNavSection,
  isPreview: boolean,
): string {
  const base = appBasePathForSlug(projectSlug, isPreview);
  if (section === 'home') return base;
  if (section === 'project') return `${base}/project/map`;
  return `${base}/${section}`;
}

export function appReviewPath(
  projectSlug: string,
  reviewId: string,
  isPreview: boolean,
  sub?: string,
): string {
  const base = `${appBasePathForSlug(projectSlug, isPreview)}/reviews/${reviewId}`;
  return sub ? `${base}/${sub}` : base;
}

export function appLibraryPath(
  projectSlug: string,
  isPreview: boolean,
  categoryId?: string,
  fileId?: string,
): string {
  const base = `${appBasePathForSlug(projectSlug, isPreview)}/library`;
  if (!categoryId) return base;
  if (!fileId) return `${base}/${categoryId}`;
  return `${base}/${categoryId}/${fileId}`;
}

export function appInboxPath(projectSlug: string, isPreview: boolean, threadId?: string): string {
  const base = `${appBasePathForSlug(projectSlug, isPreview)}/inbox`;
  return threadId ? `${base}/${threadId}` : base;
}

export function useAppPaths(projectSlug?: string) {
  const base = useAppBasePath(projectSlug);
  const isPreview = useIsAppPreview();
  const slug = projectSlug ?? useParams().projectSlug ?? '';

  return {
    base,
    isPreview,
    home: base,
    project: (section: string) => `${base}/project/${section}`,
    reviews: `${base}/reviews`,
    review: (reviewId: string, sub?: string) => appReviewPath(slug, reviewId, isPreview, sub),
    inbox: (threadId?: string) => appInboxPath(slug, isPreview, threadId),
    library: (categoryId?: string, fileId?: string) => appLibraryPath(slug, isPreview, categoryId, fileId),
  };
}
