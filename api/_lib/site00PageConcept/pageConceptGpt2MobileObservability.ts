export type PageConceptGpt2MobileLogEvent =
  | 'GPT2_MOBILE_DISPATCH_REQUESTED'
  | 'GPT2_MOBILE_PROVIDER_JOB_CREATED'
  | 'GPT2_MOBILE_PROVIDER_RUNNING'
  | 'GPT2_MOBILE_PROVIDER_COMPLETED'
  | 'GPT2_MOBILE_ARTIFACT_PERSISTED'
  | 'GPT2_MOBILE_PROVIDER_FAILED'
  | 'GPT2_MOBILE_RUN_RECOVERED';

export function logPageConceptGpt2MobileEvent(
  kind: PageConceptGpt2MobileLogEvent,
  fields: {
    runId: string;
    conceptSlot?: string;
    providerJobId?: string;
    artifactId?: string;
    message?: string;
  },
): void {
  const payload = {
    kind,
    ts: new Date().toISOString(),
    ...fields,
  };
  console.info('[page-concept-gpt2-mobile]', JSON.stringify(payload));
}
