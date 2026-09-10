/**
 * P0.CJ.2V — Visual presentation utilities tests.
 */

import { describe, it, expect } from 'vitest';
import {
  summarizeLine,
  formatEngineRead,
  judgmentStateClass,
  channelRoleLabel,
} from '../shared/site00-expression-engine/creative-judgment-presentation/conceptDisplayUtils.js';
import { resolveConceptHeroArt } from '../shared/site00-expression-engine/creative-judgment-presentation/conceptHeroArt.js';

describe('P0.CJ.2V — Visual presentation utilities', () => {
  it('1. summarizeLine truncates long text', () => {
    const long = 'A'.repeat(120);
    expect(summarizeLine(long, 40).endsWith('…')).toBe(true);
  });

  it('2. formatEngineRead compact', () => {
    expect(formatEngineRead('REVISE', 81)).toBe('REVISE · 81');
  });

  it('3. judgment state classes', () => {
    expect(judgmentStateClass('LOVE_IT', 'READY_FOR_REVIEW')).toBe('is-love');
    expect(judgmentStateClass(null, 'REVISE')).toBe('is-revise');
  });

  it('4. hero art per concept id', () => {
    const art = resolveConceptHeroArt('territory-entry-003-door', 'FALLBACK');
    expect(art.artClass).toBe('is-ndx-door');
    expect(art.pendingLabel).toMatch(/PENDING/i);
  });

  it('5. savor celeste hero distinct', () => {
    const art = resolveConceptHeroArt('savor-celeste-private-room', 'X');
    expect(art.artClass).toBe('is-savor-celeste');
  });

  it('6. verdant hero distinct from ndx', () => {
    const v = resolveConceptHeroArt('verdant-spring-rescue', 'X');
    const n = resolveConceptHeroArt('territory-entry-003-door', 'X');
    expect(v.artClass).not.toBe(n.artClass);
  });

  it('7. channel role labels', () => {
    expect(channelRoleLabel('reel')).toBe('REEL');
  });
});
