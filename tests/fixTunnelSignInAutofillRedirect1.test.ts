/**
 * Tunnel / preview sign-in — single form mount + DOM credential read (password manager autofill).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { readSignInFieldValues } from '../src/utils/auth/site00SignInFormValues';

const ROOT = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

describe('fix tunnel sign-in autofill redirect', () => {
  it('auth shell mounts one sign-in form for the active layout breakpoint', () => {
    const shell = read('src/site00/components/auth/Site00AuthShell.tsx');
    expect(shell).toContain('useSite00AuthLayout');
    expect(shell).toMatch(/authLayout === 'desktop' \? sharedForm : null/);
    expect(shell).toMatch(/authLayout === 'mobile' \? sharedForm : null/);
    const formMounts = (shell.match(/<Site00SignInForm/g) ?? []).length;
    expect(formMounts).toBe(1);
  });

  it('sign-in submit reads email/password from FormData on the form element', () => {
    const form = read('src/site00/components/auth/Site00SignInForm.tsx');
    expect(form).toContain('readSignInFieldValues');
    expect(form).toContain('readSignInFieldValues(\n        event.currentTarget');
  });

  it('readSignInFieldValues reads named email/password fields from the form', () => {
    const util = read('src/utils/auth/site00SignInFormValues.ts');
    expect(util).toContain("fd.get('email')");
    expect(util).toContain("fd.get('password')");
    expect(util).toContain("input[name=\"email\"]");
    expect(readSignInFieldValues(null)).toEqual({ email: '', password: '' });
  });
});
