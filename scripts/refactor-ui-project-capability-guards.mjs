#!/usr/bin/env node
/**
 * P0.B — Replace UI projectSlug !== 'ndxbook' guards with capability checks.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CAP_BY_FILE = [
  [/ProjectCharacterCastingPage/, 'CHARACTER_VISUAL_CASTING'],
  [/ProjectPersonalityReplay/, 'PERSONALITY_REPLAY'],
  [/ProjectExperiment[DEFG]/, 'CREATIVE_CONCEPT_TERRITORIES'],
  [/ProjectExperimentH/, 'BRAND_CHARACTER'],
  [/ProjectBrandMarketingExpression/, 'BRAND_MARKETING_EXPRESSION'],
  [/ProjectContentOperations/, 'CONTENT_OPERATIONS'],
  [/ProjectFilmProduction/, 'FILM_PRODUCTION'],
  [/ProjectRealismLab/, 'CINEMATIC_REALISM_LAB'],
  [/ProjectCulturalIntelligence/, 'CULTURAL_INTELLIGENCE'],
  [/ProjectMotionCharacter/, 'MOTION_CHARACTER'],
  [/ProjectEmbodiedCharacter/, 'EMBODIED_CHARACTER_DISCOVERY'],
  [/ProjectFounderCharacterDiscovery/, 'FOUNDER_CHARACTER_DISCOVERY'],
  [/ProjectFounderCreativeIngestion/, 'FOUNDER_CREATIVE_INGESTION'],
  [/ProjectCharacterContinuity/, 'CHARACTER_CONTINUITY'],
  [/ProjectBrandCharacter/, 'BRAND_CHARACTER'],
  [/ProjectWorkspaceVisual/, 'PROJECT_WORKSPACE'],
  [/ProjectCanonical/, 'CANONICAL_CREATIVE_RANGE'],
  [/PersonalityReplayIntakeContext/, 'PERSONALITY_REPLAY'],
  [/ndxFounderWorkspace/, 'PROJECT_WORKSPACE'],
  [/projectExperimentsHub/, 'CREATIVE_CONCEPT_TERRITORIES'],
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

function capabilityForFile(filePath) {
  for (const [re, cap] of CAP_BY_FILE) {
    if (re.test(filePath)) return cap;
  }
  return 'PROJECT_CORE';
}

const roots = ['src/site00/pages', 'src/site00/hooks', 'src/site00/components', 'src/site00/config'];
let changed = 0;

for (const root of roots) {
  const full = join(process.cwd(), root);
  for (const file of walk(full)) {
    let src = readFileSync(file, 'utf8');
    if (!/projectSlug\s*!==\s*['"]ndxbook['"]/.test(src)) continue;

    const cap = capabilityForFile(file);
    if (!src.includes('hasProjectCapability')) {
      const importLine = `import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';`;
      const altImport = `import { hasProjectCapability } from '../../../../shared/site00-projects/capabilities.js';`;
      if (file.includes('/components/')) {
        if (!src.includes('hasProjectCapability')) src = altImport + '\n' + src;
      } else if (!src.includes('hasProjectCapability')) {
        src = importLine + '\n' + src;
      }
    }

    const next = src.replace(
      /projectSlug\s*!==\s*['"]ndxbook['"]/g,
      `!hasProjectCapability(projectSlug, '${cap}')`,
    );
    if (next !== src) {
      writeFileSync(file, next);
      changed++;
    }
  }
}

console.log(`UI capability guard refactor: ${changed} files updated`);
