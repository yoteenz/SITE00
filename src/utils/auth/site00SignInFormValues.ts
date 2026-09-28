/**
 * Read sign-in credentials from the DOM (password manager / autofill safe).
 * Controlled React state can lag behind browser autofill; refs + FormData are authoritative at submit.
 */

export function readSignInFieldValues(form: HTMLFormElement | null): { email: string; password: string } {
  if (!form) return { email: '', password: '' };
  const fd = new FormData(form);
  const emailFromForm = String(fd.get('email') ?? '').trim();
  const passwordFromForm = String(fd.get('password') ?? '');
  const emailEl = form.querySelector<HTMLInputElement>('input[name="email"]');
  const passwordEl = form.querySelector<HTMLInputElement>('input[name="password"]');
  return {
    email: emailFromForm || (emailEl?.value ?? '').trim(),
    password: passwordFromForm || passwordEl?.value || '',
  };
}
