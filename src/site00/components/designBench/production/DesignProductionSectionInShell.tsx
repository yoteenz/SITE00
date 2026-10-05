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
  references: 'Project reference library — collections, authorities and sources.',
  assets: "Project asset workspace — every page's assets in one library.",
  pages: 'Project page architecture — families, readiness and coverage.',
  skins: 'Project design expression system — not a generic theme builder.',
  history: 'Project design history — every page, in sequence.',
  more: 'Project utilities — creative context, QA, diagnostics and tools.',
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
