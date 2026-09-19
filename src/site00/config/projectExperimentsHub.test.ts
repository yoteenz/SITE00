import { describe, expect, it } from 'vitest';
import {
  flattenProjectExperimentsHubNav,
  getProjectExperimentsHubEntries,
  resolveProjectExperimentsHubNavIndex,
} from './projectExperimentsHub';

describe('projectExperimentsHub', () => {
  it('lists NDXBOOK methodology surfaces in order', () => {
    const entries = getProjectExperimentsHubEntries('ndxbook');
    expect(entries.length).toBeGreaterThanOrEqual(11);
    expect(entries[0]?.id).toBe('lore-calibration');
    expect(entries.find((e) => e.letter === 'G')?.path).toContain('experiment-g-brand-presentation-concepts');
    expect(entries.find((e) => e.letter === 'E')?.children?.[0]?.id).toBe('visual-development');
  });

  it('returns empty for non-ndxbook projects', () => {
    expect(getProjectExperimentsHubEntries('frontal-slayer')).toEqual([]);
  });

  it('flattens child routes for prev/next navigation', () => {
    const entries = getProjectExperimentsHubEntries('ndxbook');
    const flat = flattenProjectExperimentsHubNav(entries);
    const experimentE = entries.find((e) => e.letter === 'E');
    expect(experimentE?.children?.[0]?.path).toContain('visual-development');
    const visualDevIndex = resolveProjectExperimentsHubNavIndex(
      '/projects/ndxbook/experience-expression/visual-development',
      flat,
    );
    expect(visualDevIndex).toBeGreaterThan(0);
    expect(flat[visualDevIndex]?.path).toContain('visual-development');
  });
});
