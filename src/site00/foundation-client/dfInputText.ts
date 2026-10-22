/** Uppercase user-entered copy in Digital Foundation forms (password fields excluded). */
export function dfInputDisplayUpper(value: string, inputType?: string | null): string {
  if (inputType === 'password') return value;
  return value.toLocaleUpperCase('en-US');
}
