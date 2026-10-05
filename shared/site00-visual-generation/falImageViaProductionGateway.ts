import type { ProductionGatewayOptions, ProductionProviderGatewayRequest } from '../site00-production-guardrails/providerGateway/runProductionProviderRequest.js';
import { runProductionProviderRequest } from '../site00-production-guardrails/providerGateway/runProductionProviderRequest.js';
import { runFalReferenceImageJob, type FalReferenceImageJobResult } from './falReferenceImageJob.js';

/** FAL reference image dispatch through the production provider gateway (precheck + spend + receipt). */
export async function runFalReferenceImageViaProductionGateway(
  gatewayRequest: ProductionProviderGatewayRequest,
  gatewayOptions: ProductionGatewayOptions,
  falInput: {
    jobKey: string;
    prompt: string;
    referenceImageUrls: string[];
    aspectRatio?: '9:16' | '16:9';
    model?: string;
    falInputOverride?: Record<string, unknown>;
  },
): Promise<{ gateway: Awaited<ReturnType<typeof runProductionProviderRequest<FalReferenceImageJobResult>>> }> {
  const gateway = await runProductionProviderRequest(
    {
      ...gatewayRequest,
      referenceInputAttached: gatewayRequest.referenceInputAttached ?? falInput.referenceImageUrls.length > 0,
    },
    gatewayOptions,
    async () =>
      runFalReferenceImageJob({
        ...falInput,
        referenceImageUrls: falInput.referenceImageUrls,
      }),
  );
  return { gateway };
}
