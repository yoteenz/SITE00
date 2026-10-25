import * as X from '../../../shared/site00-fiction-production/index.js';
import { A, bullets, generatedNote, table, type Ctx } from './md.js';

/** Section 28, each requirement mapped to the validator checks that test it. */
const REQUIREMENTS: Array<[string, string[]]> = [
  ['All 86 releases audited', ['RELEASE_COVERAGE']],
  ['Required sources inspected, exact classifications kept', ['SOURCES']],
  ['Every proposal traceable to a file, release and scene or beat', ['PROPOSAL_IDS', 'CITATIONS']],
  ['No invented canon', ['PROTECTED_FILES', 'CALLBACK_REFS', 'CATEGORY_RULES']],
  ['No violation of technology rules', ['FORBIDDEN_CAPABILITY', 'TECHNOLOGY', 'INVENTIONS']],
  ['Release count and runtime unchanged', ['MASTER_LOCK', 'RUNTIME_AND_COST']],
  ['No screenplay or Fountain rewrite', ['PROTECTED_FILES']],
  ['No change to approved reveal timing', ['REVEAL_TIMING']],
  ['No forced relationship, duplicate identity or unapproved casting', ['CALLBACK_REFS', 'VENUE_ACCESS', 'OPEN_DECISIONS']],
  ['No silent S1-01 change', ['S1-01_PROTECTION', 'PROTECTED_FILES']],
  ['Flashbacks agree with character knowledge and chronology', ['MEMORY_POV', 'REVEAL_TIMING']],
  ['Inventions do not solve story problems after the fact', ['FORBIDDEN_CAPABILITY', 'INVENTIONS']],
  ['Background appearances respect access rules', ['VENUE_ACCESS']],
  ['Changes respect runtime and scene dependencies', ['RUNTIME_AND_COST', 'DEPENDENCIES', 'CATEGORY_RULES']],
  ['Callbacks stay sparse', ['CALLBACK_DENSITY']],
  ['NO CHANGE RECOMMENDED is a judgment, not a gap', ['RELEASE_COVERAGE']],
  ['Priorities are justified in writing', ['PRIORITIES']],
  ['Inventory and world tables quote the master', ['INVENTORY_QUOTES']],
];

export function validationDoc(c: Ctx): string {
  const failed = c.checks.filter((k) => k.errors.length);
  const status = (ids: string[]) => (ids.every((id) => !c.checks.find((k) => k.id === id)!.errors.length) ? 'PASS' : 'FAIL');
  return [
    '# 18 — Validation report',
    '',
    generatedNote(['shared/site00-fiction-production/audit/validate.ts', 'shared/site00-fiction-production/audit/baseline.ts']),
    '',
    `Result: **${failed.length ? `FAIL (${failed.length} of ${c.checks.length} checks)` : `PASS (${c.checks.length} of ${c.checks.length} checks)`}**. The validator reads the audit records and the canon they cite. It writes nothing. Build and test results for this branch are in deliverable 19.`,
    '',
    '## 1. Checks',
    '',
    table(['Check', 'What it tests', 'Items checked', 'Result'], c.checks.map((k) => [k.id, k.title, k.checked, k.errors.length ? `FAIL: ${k.errors.join('; ')}` : 'PASS'])),
    '',
    '## 2. Section 28 requirements',
    '',
    table(['Requirement', 'Checks', 'Result'], [...REQUIREMENTS.map(([req, ids]) => [req, ids.join(', '), status(ids)]), ['No media generated, no credit spent', 'None: the audit module has no provider code path', 'PASS']]),
    '',
    '## 3. Protected files',
    '',
    `Each file is hashed on every render and compared with the baseline taken at ${A.AUDIT_BASELINE_COMMIT} (head of PR #1692).`,
    '',
    table(
      ['File', 'Baseline sha256', 'Now'],
      A.PROTECTED_BASELINE.map((f) => [`\`${f.path}\``, `\`${f.sha256.slice(0, 16)}…\``, A.sha256(X.repoPath(f.path, c.root)) === f.sha256 ? 'UNCHANGED' : 'CHANGED']),
    ),
    '',
    '## 4. Negative tests',
    '',
    bullets([
      '`tests/theExchangeLivingWorldAudit.test.ts` passes altered copies of the audit records to the validator and expects each targeted check to fail: a forbidden capability on a surviving proposal, a misquoted citation, an unwitnessed memory, an early reveal, an invited venue with no route in, a fifth callback in one release, an S1-01 idea without its section 25 block or naming a shot that does not exist, an invention with a price, a thirteenth priority, a missing written score reason, a recommended item adding seconds, a rejected item without a reason, release judgments out of order, and a recommended proposal leaning on a rejected one.',
      'The same file checks that the committed deliverables equal their renders, so the documents cannot drift from the records.',
    ]),
  ].join('\n');
}
