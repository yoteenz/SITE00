/**
 * B5.5 — Entry 001 package navigation tabs.
 */

import { Link, useLocation } from 'react-router-dom';
import {
  site00ProjectCampaignBoardEntryDeliverablePath,
  site00ProjectCampaignBoardEntryFormatPath,
  site00ProjectCampaignBoardEntryPath,
  site00ProjectCampaignBoardEntryPreviewPath,
} from '../../../config/routes.js';

type TabId = 'archive' | 'content' | 'preview' | 'remaining';

type Props = {
  projectSlug: string;
  entryNumber?: string;
  active?: TabId;
};

const TABS: { id: TabId; label: string; hash?: string }[] = [
  { id: 'archive', label: 'APPROVED ARCHIVE', hash: '#archive' },
  { id: 'content', label: 'PACKAGE CONTENT', hash: '#content' },
  { id: 'preview', label: 'PREVIEW' },
  { id: 'remaining', label: "WHAT'S LEFT", hash: '#remaining' },
];

export function Entry001PackageNav({ projectSlug, entryNumber = '001', active }: Props) {
  const location = useLocation();
  const base = site00ProjectCampaignBoardEntryPath(projectSlug, entryNumber);
  const previewPath = site00ProjectCampaignBoardEntryPreviewPath(projectSlug, entryNumber);

  const resolvedActive: TabId =
    active ??
    (location.pathname.includes('/preview')
      ? 'preview'
      : location.pathname.includes('/format/')
        ? 'content'
        : location.pathname.includes('/deliverable/')
          ? 'content'
          : location.hash === '#content'
            ? 'content'
            : location.hash === '#remaining'
              ? 'remaining'
              : 'archive');

  return (
    <nav className="site00-e001-package__nav" aria-label="Entry package sections">
      {TABS.map((tab) => {
        const href = tab.id === 'preview' ? previewPath : `${base}${tab.hash ?? ''}`;
        const isActive = resolvedActive === tab.id;
        return (
          <Link
            key={tab.id}
            to={href}
            className={isActive ? 'is-active' : undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function entry001FormatPath(projectSlug: string, formatFamily: string, entryNumber = '001') {
  return site00ProjectCampaignBoardEntryFormatPath(projectSlug, entryNumber, formatFamily);
}

export function entry001DeliverablePath(projectSlug: string, deliverableId: string, entryNumber = '001') {
  return site00ProjectCampaignBoardEntryDeliverablePath(projectSlug, entryNumber, deliverableId);
}

export function entry001PreviewPath(projectSlug: string, entryNumber = '001') {
  return site00ProjectCampaignBoardEntryPreviewPath(projectSlug, entryNumber);
}
