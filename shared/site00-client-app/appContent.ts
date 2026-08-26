import { clientAppPath } from './routes.js';
import type {
  ClientAppManifest,
  ClientInboxThread,
  ClientLibraryCategory,
  ClientLibraryFile,
} from './types.js';

export function getClientAppInboxThreads(manifest: ClientAppManifest): ClientInboxThread[] {
  const slug = manifest.projectSlug;
  const base = clientAppPath(slug);
  return [
    {
      id: 'inbox-site00-1',
      category: 'SITE00',
      title: 'SITE 00',
      preview: 'Your homepage review window opens next week.',
      timestamp: '10:42 AM',
      unread: manifest.messageSummary.unreadCount > 0,
      route: `${base}/inbox/site00-1`,
    },
    {
      id: 'inbox-review-1',
      category: 'DESIGN_REVIEW',
      title: 'Homepage Directions',
      preview: 'Revision notes received — updated V03 ready.',
      timestamp: 'Yesterday',
      unread: false,
      route: `${base}/reviews`,
    },
    {
      id: 'inbox-files-1',
      category: 'FILES',
      title: 'Identity Assets Delivered',
      preview: 'Approved identity files added to your library.',
      timestamp: 'Aug 18',
      unread: false,
      route: `${base}/library`,
    },
  ];
}

export function getClientAppLibraryCategories(manifest: ClientAppManifest): ClientLibraryCategory[] {
  const slug = manifest.projectSlug;
  const labelMap: Record<string, string> = {
    'approved-identity': 'IDENTITY',
    'brand-assets': 'IDENTITY',
    blueprints: 'WEBSITE',
    'page-designs': 'WEBSITE',
    'marketing-assets': 'MARKETING',
    'final-deliverables': 'FINAL DELIVERY',
  };

  return manifest.librarySections.map((section) => ({
    id: section.id,
    label: labelMap[section.id] ?? section.label,
    itemCount: section.itemCount,
    route: `${clientAppPath(slug, 'library')}/${section.id}`,
  }));
}

export function getClientAppLibraryFiles(_categoryId: string): ClientLibraryFile[] {
  return [
    {
      id: 'file-1',
      title: 'Homepage — V03',
      versionLabel: 'V03',
      statusLabel: 'APPROVED',
      previewUrl: null,
      downloadUrl: null,
      mimeType: 'image/png',
    },
    {
      id: 'file-2',
      title: 'Brand Mark — Primary',
      versionLabel: 'CURRENT',
      statusLabel: 'APPROVED',
      previewUrl: null,
      downloadUrl: null,
      mimeType: 'image/svg+xml',
    },
  ];
}
