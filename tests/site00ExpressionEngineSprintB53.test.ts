/**
 * B5.3 — Entry 002 Expression Engine reference-fidelity rebuild tests.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compileEntry002ProductionBlueprint } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import {
  buildSocialPackageReadiness,
  buildDerivedContentCardsFromBlueprint,
} from '../src/site00/components/founderWorkspace/expressionEngine/socialPackageReadiness.js';
import { buildProductionJourney } from '../src/site00/components/founderWorkspace/expressionEngine/productionJourney.js';
import { SITE00_ROUTES } from '../src/site00/config/routes.js';

const ROOT = join(import.meta.dirname, '..');
const blueprint = compileEntry002ProductionBlueprint();

describe('B5.3 Entry 002 Expression Engine reference-fidelity', () => {
  it('1. Entry 002 Expression Engine route exists', () => {
    expect(SITE00_ROUTES.projectExpressionEngineCampaign).toContain('expression-engine');
    const routes = readFileSync(join(ROOT, 'src/routes/Site00Routes.tsx'), 'utf8');
    expect(routes).toContain('ProjectExpressionEngineCampaignPage');
    const mobile = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileFounderWorkspaceScreens.tsx'),
      'utf8',
    );
    expect(mobile).toContain('MobileExpressionEngineScreen');
  });

  it('2. reference mobile workspace renders canonical Entry 002 title', () => {
    const src = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    expect(src).toContain('ENTRY 002');
    expect(src).toContain('2016 IG BADDIE FASHION');
    expect(src).toContain('phase2.entry002.title');
  });

  it('3. main card uses ref-root without overflow clipping hack', () => {
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-workspace.css'), 'utf8');
    expect(css).toContain('.site00-ee-ref-root');
    expect(css).toMatch(/\.site00-ee-ref-root[\s\S]*overflow-x:\s*hidden/);
    expect(css).toMatch(/\.site00-fws-mobile-expr--ref[\s\S]*padding:\s*0\s+16px/);
  });

  it('4. accordion sections exist with status summaries', () => {
    const support = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ReferenceSupportingIntelligence.tsx'),
      'utf8',
    );
    expect(support).toContain('status');
    expect(support).toContain('details');

    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    for (const label of [
      'VISUAL AUTHORITIES',
      'WORLD',
      'CONTINUITY',
      'PRODUCTION INTELLIGENCE',
      'HISTORY',
      'SYSTEM INSPECTOR',
    ]) {
      expect(workspace).toContain(label);
    }
  });

  it('5. Visual Authorities uses five authority assets from canonical pack', () => {
    const auth = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ReferenceVisualAuthorities.tsx'),
      'utf8',
    );
    expect(auth).toContain('NDX PRESENCE');
    expect(auth).toContain('PHONE / GLITCH');
    expect(auth).toContain('approvedCount');
    expect(auth).toContain('requiredCount');
  });

  it('6. authority count derives from canonical records', () => {
    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    expect(workspace).toContain('approvedAuthorityCount');
    expect(workspace).toContain('requiredAuthorityCount');
  });

  it('7. World section uses canonical Entry 002 blueprint data', () => {
    const world = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ReferenceExpandedWorld.tsx'),
      'utf8',
    );
    expect(world).toContain('territoryName');
    expect(world).toContain('worldExpressionSystem');
    expect(blueprint.territoryName).toContain('NOSTALGIA');
  });

  it('8. Continuity uses authority relationship chain not raw graph dump', () => {
    const continuity = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ReferenceExpandedContinuity.tsx'),
      'utf8',
    );
    expect(continuity).not.toContain('continuityGraph.nodes');
    expect(continuity).toContain('NDX PRESENCE');
    expect(continuity).toContain('INTERJECTION');
  });

  it('9. Production Intelligence binds live gate and provider data', () => {
    const intel = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ReferenceExpandedProductionIntelligence.tsx'),
      'utf8',
    );
    expect(intel).toContain('ACTIVE GATE');
    expect(intel).toContain('DISPATCH MODE');

    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    expect(workspace).toContain('storyboardCostGuard');
    expect(workspace).toContain('providerRouting');
  });

  it('10. auto-retry UI reflects cost guard OFF', () => {
    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    expect(workspace).toContain('storyboardAutoRetryCount');
    expect(workspace).toContain('autoRetryOff');
    expect(workspace).toContain('AUTOMATIC (OFF)');
  });

  it('11. History uses structured timeline component', () => {
    const history = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ReferenceExpandedHistory.tsx'),
      'utf8',
    );
    expect(history).toContain('site00-ee-ref-history__row');
    expect(history).not.toContain('JSON.stringify');
  });

  it('12. System Inspector contains scrollable JSON preview only in inspector', () => {
    const inspector = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ReferenceExpandedSystemInspector.tsx'),
      'utf8',
    );
    expect(inspector).toContain('JSON.stringify');
    expect(inspector).toContain('COPY');

    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    expect(workspace).not.toContain('<ContinuityMap');
    expect(workspace).not.toContain('<ProductionIntelligence');
    expect(workspace).not.toContain('<HistoryPanel');
    expect(workspace).not.toContain('<FinalStoryboardWorkspace');
  });

  it('13. derived content locked at storyboard stage', () => {
    const cards = buildDerivedContentCardsFromBlueprint(blueprint, false);
    expect(cards.length).toBeGreaterThanOrEqual(4);
    expect(cards.every((c) => c.status === 'LOCKED')).toBe(true);
  });

  it('14. no fake approval — final reel not approved keeps package locked', () => {
    const readiness = buildSocialPackageReadiness(blueprint, false);
    expect(readiness.packageStatus).toBe('LOCKED');
    expect(readiness.campaignBoardEligible).toBe(false);
  });

  it('15. generation requires explicit founder action POST', () => {
    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    expect(workspace).toContain('postGenerateFinalStoryboard');
    expect(workspace).not.toMatch(/useEffect[\s\S]*postGenerateFinalStoryboard/);
  });

  it('16. import storyboard flow remains functional', () => {
    const workspace = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineReferenceMobileWorkspace.tsx'),
      'utf8',
    );
    expect(workspace).toContain('postImportFounderStoryboard');
    expect(workspace).toContain('ReferenceChooseHowToContinue');
  });

  it('17. page subtitle matches reference', () => {
    const screen = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/MobileExpressionEngineScreen.tsx'),
      'utf8',
    );
    expect(screen).toContain('IDEAS TO ASSETS. ASSETS TO IMPACT.');
  });

  it('18. production journey includes canonical downstream stages', () => {
    const journey = buildProductionJourney({
      coverAuthority: 'APPROVED',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: true,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'READY_FOR_GENERATION',
      finalStoryboardValid: false,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
      finalReelApproved: false,
      derivedSocialStatus: 'LOCKED',
      socialPackageStatus: 'LOCKED',
      campaignBoardEligible: false,
    });
    const ids = journey.map((s) => s.id);
    expect(ids).toContain('STORYBOARD');
    expect(ids).toContain('KEYFRAMES');
    expect(ids).toContain('FINAL_REEL');
    expect(ids).toContain('SOCIAL_PACKAGE');
    expect(ids).toContain('CAMPAIGN_BOARD');
    const storyboardIdx = ids.indexOf('STORYBOARD');
    const campaignIdx = ids.indexOf('CAMPAIGN_BOARD');
    expect(campaignIdx).toBeGreaterThan(storyboardIdx);
  });

  it('19. Choose How To Continue shows provider attempts auto-retry', () => {
    const panel = readFileSync(
      join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine/ReferenceChooseHowToContinue.tsx'),
      'utf8',
    );
    expect(panel).toContain('GENERATE WITH STUDIO WORLD');
    expect(panel).toContain('IMPORT MY STORYBOARD');
    expect(panel).toContain('AUTO-RETRY');
  });

  it('20. build passes — TypeScript sources present for all B5.3 components', () => {
    const files = [
      'ReferenceChooseHowToContinue.tsx',
      'ReferenceExpandedWorld.tsx',
      'ReferenceExpandedContinuity.tsx',
      'ReferenceExpandedProductionIntelligence.tsx',
      'ReferenceExpandedHistory.tsx',
      'ReferenceExpandedSystemInspector.tsx',
    ];
    for (const f of files) {
      expect(() =>
        readFileSync(join(ROOT, 'src/site00/components/founderWorkspace/expressionEngine', f), 'utf8'),
      ).not.toThrow();
    }
  });
});
