import { completeIntake, updateIntake } from '../../api/_lib/digitalFoundation/service.js';

/** Valid US test contact for intake completion gates. */
export const DF_TEST_CONTACT_PHONE = '901-555-0100';

export function attachTestContactPhone(artifactId: string): void {
  updateIntake(artifactId, { phone: DF_TEST_CONTACT_PHONE }, false);
}

export function completeIntakeWithContactPhone(artifactId: string) {
  attachTestContactPhone(artifactId);
  return completeIntake(artifactId);
}
