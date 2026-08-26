import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import {
  getClientAppLibraryCategories,
  getClientAppLibraryFiles,
} from '../../../../shared/site00-client-app/appContent.js';
import type { ClientLibraryCategory, ClientLibraryFile } from '../../../../shared/site00-client-app/types.js';
import { site00ClientAppApi } from '../../services/clientAppApi';
import {
  AppEmptyState,
  AppLoadingState,
  AppSectionLabel,
} from '../../components/clientApp/Site00ClientAppShell';
import type { AppOutletContext } from './AppProjectLayout';
import { useAppPaths, useIsAppPreview } from '../../hooks/useAppBasePath';

export default function AppLibraryPage() {
  const { manifest } = useOutletContext<AppOutletContext>();
  const isPreview = useIsAppPreview();
  const paths = useAppPaths(manifest.projectSlug);
  const [categories, setCategories] = useState<ClientLibraryCategory[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (isPreview) {
      setCategories(getClientAppLibraryCategories(manifest));
      setState('ready');
      return;
    }
    void site00ClientAppApi
      .library(manifest.projectSlug)
      .then((r) => {
        setCategories(r.categories ?? []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [manifest, isPreview]);

  if (state === 'loading') return <AppLoadingState />;
  if (state === 'error') return <AppEmptyState title="LIBRARY UNAVAILABLE" />;

  return (
    <div>
      <AppSectionLabel>YOUR APPROVED ASSETS</AppSectionLabel>
      {categories.map((c) => (
        <Link key={c.id} to={paths.library(c.id)} className="site00-app-library-cat">
          <div className="site00-app-library-cat__icon" aria-hidden="true" />
          <div>
            <div className="site00-app-inbox-item__title">{c.label}</div>
            <div className="site00-app-inbox-item__preview">{c.itemCount} items</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function AppLibraryCategoryPage() {
  const { categoryId = '' } = useParams();
  const { manifest } = useOutletContext<AppOutletContext>();
  const isPreview = useIsAppPreview();
  const paths = useAppPaths(manifest.projectSlug);
  const [files, setFiles] = useState<ClientLibraryFile[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (isPreview) {
      setFiles(getClientAppLibraryFiles(categoryId));
      setState('ready');
      return;
    }
    void site00ClientAppApi
      .library(manifest.projectSlug, categoryId)
      .then((r) => {
        setFiles(r.files ?? []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [manifest.projectSlug, categoryId, isPreview]);

  if (state === 'loading') return <AppLoadingState />;
  if (state === 'error') return <AppEmptyState title="CATEGORY UNAVAILABLE" />;

  return (
    <div>
      <AppSectionLabel>{categoryId.replace(/-/g, ' ').toUpperCase()}</AppSectionLabel>
      {files.map((f) => (
        <Link key={f.id} to={paths.library(categoryId, f.id)} className="site00-app-library-file">
          <div className="site00-app-library-file__thumb" />
          <div>
            <div className="site00-app-inbox-item__title">{f.title}</div>
            <div className="site00-app-inbox-item__preview">
              {f.versionLabel} · {f.statusLabel}
            </div>
          </div>
        </Link>
      ))}
      <Link to={paths.library()} className="site00-app-link-cta">
        ← BACK TO LIBRARY
      </Link>
    </div>
  );
}

export function AppFileViewerPage() {
  const { fileId = '' } = useParams();
  const paths = useAppPaths();
  return (
    <div>
      <AppSectionLabel>FILE VIEWER</AppSectionLabel>
      <div className="site00-app-file-viewer">PREVIEW · {fileId.toUpperCase()}</div>
      <Link to={paths.library()} className="site00-app-link-cta">
        ← CLOSE
      </Link>
    </div>
  );
}
