/**
 * Experiment E — contamination guards (leakage + scope separation).
 */

import { FORBIDDEN_EXPERIENCE_LEAKAGE_TERMS } from './constants.js';
import type { HostExperienceCanon } from './types.js';
import type { ClientExperienceCanon } from './types.js';

export type ContaminationTestResult = { passed: boolean; violations: string[] };

export function runExperienceLeakageTest(text: string, testName: string): ContaminationTestResult {
  const lower = text.toLowerCase();
  const violations = FORBIDDEN_EXPERIENCE_LEAKAGE_TERMS.filter((term) => lower.includes(term.toLowerCase()));
  return { passed: violations.length === 0, violations: violations.map((v) => `${testName}: ${v}`) };
}

export function fsMansionExperienceLeakageTest(text: string): ContaminationTestResult {
  return runExperienceLeakageTest(text, 'FS_MANSION_EXPERIENCE_LEAKAGE_TEST');
}

export function tarotWorldExperienceLeakageTest(text: string): ContaminationTestResult {
  return runExperienceLeakageTest(text, 'TAROT_WORLD_EXPERIENCE_LEAKAGE_TEST');
}

export function brainstormExampleExperienceLeakageTest(text: string): ContaminationTestResult {
  return runExperienceLeakageTest(text, 'BRAINSTORM_EXAMPLE_EXPERIENCE_LEAKAGE_TEST');
}

export function hostFontAsClientCanonTest(
  host: HostExperienceCanon,
  client: ClientExperienceCanon,
): ContaminationTestResult {
  const violations: string[] = [];
  const hostFont = host.hostUiTypography.toLowerCase();
  for (const trait of client.traits) {
    if (trait.provenance === 'CONCEPT_TERRITORY' || trait.provenance === 'WORLD_EXPRESSION') {
      if (trait.trait.toLowerCase().includes('martian mono')) {
        violations.push('HOST_FONT_AS_CLIENT_CANON_TEST: Martian Mono in client canon');
      }
    }
  }
  if (client.traits.some((t) => t.provenance === 'HOST')) {
    violations.push('HOST_FONT_AS_CLIENT_CANON_TEST: HOST provenance in client traits');
  }
  if (hostFont.includes('client')) {
    violations.push('HOST_FONT_AS_CLIENT_CANON_TEST: host typography references client');
  }
  return { passed: violations.length === 0, violations };
}

export function socialArtifactAsPageLayoutTest(prompt: string): ContaminationTestResult {
  const lower = prompt.toLowerCase();
  const violations: string[] = [];
  if (lower.includes('carousel slide as page') || lower.includes('paste social layout')) {
    violations.push('SOCIAL_ARTIFACT_AS_PAGE_LAYOUT_TEST');
  }
  if (lower.includes('feed post layout') && lower.includes('dashboard')) {
    violations.push('SOCIAL_ARTIFACT_AS_PAGE_LAYOUT_TEST: feed layout copied to software');
  }
  return { passed: violations.length === 0, violations };
}

export function sequenceSystemAsExperienceSystemTest(text: string): ContaminationTestResult {
  const lower = text.toLowerCase();
  const violations: string[] = [];
  if (lower.includes('sequence creative system as page architecture')) {
    violations.push('SEQUENCE_SYSTEM_AS_EXPERIENCE_SYSTEM_TEST');
  }
  if (lower.includes('carousel sequence governs navigation')) {
    violations.push('SEQUENCE_SYSTEM_AS_EXPERIENCE_SYSTEM_TEST: sequence as nav');
  }
  return { passed: violations.length === 0, violations };
}

export function runAllExperienceContaminationTests(params: {
  serializedPrompt: string;
  host: HostExperienceCanon;
  client: ClientExperienceCanon;
}): ContaminationTestResult {
  const results = [
    fsMansionExperienceLeakageTest(params.serializedPrompt),
    tarotWorldExperienceLeakageTest(params.serializedPrompt),
    brainstormExampleExperienceLeakageTest(params.serializedPrompt),
    hostFontAsClientCanonTest(params.host, params.client),
    socialArtifactAsPageLayoutTest(params.serializedPrompt),
    sequenceSystemAsExperienceSystemTest(params.serializedPrompt),
  ];
  const violations = results.flatMap((r) => r.violations);
  return { passed: violations.length === 0, violations };
}
