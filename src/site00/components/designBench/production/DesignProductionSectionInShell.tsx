import type { DesignProductionSection } from '../../../../../shared/site00-design-workspace-production/designIntegrationLineage.js';
import {
  DesignProductionSectionAssets,
  DesignProductionSectionHistory,
  DesignProductionSectionMore,
  DesignProductionSectionReferences,
  DesignProductionSectionSkins,
} from './DesignProductionSections';
import { DesignProductionSectionPages } from './DesignProductionSectionPages';

const TITLES: Record<DesignProductionSection, string> = {
  references: 'REFERENCES',
  assets: 'ASSETS',
  pages: 'PAGES',
  skins: 'SKINS',
  history: 'HISTORY',
  more: 'MORE',
};

const SUBTITLES: Record<DesignProductionSection, string> = {
  references: 'Approved golden, authorities, and visual sources.',
  assets: 'Approved Grok manifest slots — read-only; authority is not mutated here.',
  pages: 'Design pages bound to this project target.',
  skins: 'Current NDXBOOK design expression — not a generic theme builder.',
  history: 'Durable design workspace events (founder-readable).',
  more: 'Secondary DESIGN utilities — not duplicated in top nav.',
};

export function designProductionSectionSubtitle(section: DesignProductionSection): string {
  return SUBTITLES[section];
}

export function DesignProductionSectionInShell({ section }: { section: DesignProductionSection }) {
  switch (section) {
    case 'references':
      return <DesignProductionSectionReferences />;
    case 'assets':
      return <DesignProductionSectionAssets />;
    case 'pages':
      return <DesignProductionSectionPages />;
    case 'skins':
      return <DesignProductionSectionSkins />;
    case 'history':
      return <DesignProductionSectionHistory />;
    case 'more':
      return <DesignProductionSectionMore />;
    default:
      return null;
  }
}

export function designProductionSectionTitle(section: DesignProductionSection): string {
  return TITLES[section];
}
