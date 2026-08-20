/**
 * Async email dispatch stub — wired for future transactional provider.
 * Profile welcome email is best-effort; no-op when email is not configured.
 */
export type SendEmailOptions = {
  templateType: string;
  recipientEmail: string;
  variables?: Record<string, string>;
};

export function sendEmailAsync(options: SendEmailOptions): void {
  console.info('[sendEmail] skipped (not configured)', options.templateType, options.recipientEmail);
}
