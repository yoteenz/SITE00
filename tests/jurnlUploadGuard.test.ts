import { describe, expect, it } from 'vitest';
import { sanitizeUploadFilename, validateRecordUpload } from '../src/projects/jurnl/data/f16/uploadGuard';

describe('F16 upload guard', () => {
  it('blocks path traversal filenames', () => {
    const r = validateRecordUpload({ name: '../../etc/passwd', type: 'application/pdf', size: 100 });
    expect(r.ok).toBe(false);
  });

  it('allows pdf within size limit', () => {
    expect(validateRecordUpload({ name: 'statement.pdf', type: 'application/pdf', size: 1024 }).ok).toBe(true);
  });

  it('sanitizes unsafe characters', () => {
    expect(sanitizeUploadFilename('foo/bar<script>.pdf')).not.toContain('/');
  });
});
