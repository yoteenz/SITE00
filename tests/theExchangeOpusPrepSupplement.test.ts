import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const MANIFEST = path.join(process.cwd(), 'THE_EXCHANGE/MANIFEST');
const REQUIRED_SUPPLEMENT = [
  'EXCHANGE_INVITATION_CULTURE_ADDENDUM_V1.md',
  'EXCHANGE_NIGHTS_SOCIAL_EXPERIENCE_ADDENDUM_V1.md',
  'SLOANE_NARRATION_AND_FREEZE_FRAME_GRAMMAR_V1.md',
  'GIDEON_CHARACTER_AND_RELATIONSHIP_NUANCE_V1.md',
  'GIDEON_PILOT_APPEARANCE_INTEGRATION_V1.md',
  'SHAW_SPINOFF_IDENTITY_ADDENDUM_V1.md',
  'RECURRING_GUEST_UNIVERSE_PRINCIPLES_V1.md',
  'NARRATION_RESTRAINT_AND_TONE_GUIDELINES_V1.md',
  'CANON_APPROVAL_MATRIX_V1.json',
];

describe('THE EXCHANGE Opus prep supplement manifests', () => {
  it('includes all supplement deliverable files', () => {
    for (const file of REQUIRED_SUPPLEMENT) {
      expect(fs.existsSync(path.join(MANIFEST, file)), file).toBe(true);
    }
  });

  it('documents Gideon age 42-45 as approved in approval matrix', () => {
    const matrix = JSON.parse(
      fs.readFileSync(path.join(MANIFEST, 'CANON_APPROVAL_MATRIX_V1.json'), 'utf8'),
    ) as { topics: Array<{ topic: string; classification: string }> };
    const age = matrix.topics.find((t) => t.topic.includes('42–45') || t.topic.includes('42-45'));
    expect(age?.classification).toBe('APPROVED_CANON');
  });

  it('includes founder Executive Gideon portrait on disk', () => {
    const p = path.join(
      process.cwd(),
      'public/site00/projects/the-exchange/visual_refs/characters/gideon_executive_portrait_founder_approved.jpg',
    );
    expect(fs.existsSync(p)).toBe(true);
  });
});
