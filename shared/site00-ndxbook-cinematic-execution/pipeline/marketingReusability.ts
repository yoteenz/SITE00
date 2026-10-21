import type { ShotExecutionContract } from '../types/schemas.js';

export type MarketingReusabilityAssessment = {
  engineHardCodesEntry002: false;
  separatedConcerns: string[];
  futureUseCases: string[];
  blockersBeforeClientDelivery: string[];
};

export function assessMarketingReusability(_sample: ShotExecutionContract): MarketingReusabilityAssessment {
  return {
    engineHardCodesEntry002: false,
    separatedConcerns: [
      'Creative authority (ShotExecutionContract)',
      'Reference binding (ReferenceBindingManifest)',
      'Provider capabilities (KLING4_CAPABILITY_MATRIX)',
      'Provider execution (CinematicVideoProviderAdapter)',
      'Approval + spend (paidGenerationGate + job lifecycle)',
      'Output QA + rough cut handoff',
    ],
    futureUseCases: [
      'Product campaigns',
      'Fashion / beauty campaigns',
      'Brand films',
      'Social ad cutdowns',
      'Editorial films',
      'Campaign derivatives (vertical / square / ultrawide)',
    ],
    blockersBeforeClientDelivery: [
      'Commercial terms verification for Artlist/Kling outputs',
      'Automated or audited manual reference upload',
      'Real motion benchmark passed founder QA',
      'Generation ledger persistence (see production audit MA-019)',
    ],
  };
}
