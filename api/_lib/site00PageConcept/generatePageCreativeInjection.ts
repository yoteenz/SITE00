import {
  ANTHROPIC_API_URL,
  ANTHROPIC_CREATIVE_MODEL,
  isAnthropicConfigured,
} from '../site00Evolve/creativeDirection/creativeIntelligence/config.js';
import type {
  PageCreativeContext,
  PageCreativeInjection,
  PageFunctionContract,
  ProjectCreativeContext,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PAGE_CGPT_PROMPT_VERSION } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';

export type PageCgptInput = {
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
};

function vitestInjection(input: PageCgptInput): PageCreativeInjection {
  const now = new Date().toISOString();
  return {
    injectionId: `pinj-vitest-${input.pageContext.pageId}`,
    projectId: input.pageContext.projectId,
    pageId: input.pageContext.pageId,
    projectContextVersion: input.projectContext.contextVersion,
    pageContextVersion: input.pageContext.contextVersion,
    functionContractVersion: input.functionContract.version,
    creativeThesis: `${input.projectContext.brandTruth} expressed on ${input.pageContext.pageName}`,
    pagePurposeInterpretation: input.pageContext.purpose,
    visualOpportunity: input.pageContext.creativeLatitude,
    hierarchyDirection: 'Project identity before utility chrome',
    spatialDirection: 'Editorial panels with breathable gutters',
    informationPriority: input.pageContext.requiredContent.join(' · '),
    imageDataBalance: 'Hero evidence over dense tables',
    responsiveDirection: 'Mobile stack · Desktop split authority rail',
    mobileDirection: input.pageContext.responsiveRequirements.includes('MOBILE') ? 'Stack' : '—',
    desktopDirection: input.pageContext.responsiveRequirements.includes('DESKTOP') ? 'Split' : '—',
    creativeLatitude: input.pageContext.creativeLatitude,
    immutableRequirements: [...input.functionContract.immutableBehaviors],
    referenceStrategy: 'Upstream authority references + current capture',
    assetStrategy: 'Project assets within host firewall',
    createdAt: now,
    cgptProvider: 'vitest',
    cgptModel: 'mock-page-cgpt',
  };
}

export async function generatePageCreativeInjection(input: PageCgptInput): Promise<PageCreativeInjection> {
  if (process.env.VITEST === 'true') {
    return vitestInjection(input);
  }
  if (!isAnthropicConfigured()) {
    throw new Error('CGPT_INJECTION_FAILED: ANTHROPIC_API_KEY not configured');
  }

  const system = `You are CGPT for SITE 00 PAGE design. Return exactly ONE JSON object PageCreativeInjection.
Combine project brand intelligence and page role. Do NOT return arrays of concepts.`;

  const user = JSON.stringify({
    promptVersion: PAGE_CGPT_PROMPT_VERSION,
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
  });

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_CREATIVE_MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) throw new Error(`CGPT_INJECTION_FAILED: ${res.status}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('CGPT_INJECTION_FAILED: invalid JSON');
  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  if (Array.isArray(parsed.concepts)) throw new Error('CGPT_INJECTION_FAILED: multi-concept rejected');

  const now = new Date().toISOString();
  return {
    injectionId: `pinj-${Date.now()}`,
    projectId: input.pageContext.projectId,
    pageId: input.pageContext.pageId,
    projectContextVersion: input.projectContext.contextVersion,
    pageContextVersion: input.pageContext.contextVersion,
    functionContractVersion: input.functionContract.version,
    creativeThesis: String(parsed.creativeThesis ?? ''),
    pagePurposeInterpretation: String(parsed.pagePurposeInterpretation ?? ''),
    visualOpportunity: String(parsed.visualOpportunity ?? ''),
    hierarchyDirection: String(parsed.hierarchyDirection ?? ''),
    spatialDirection: String(parsed.spatialDirection ?? ''),
    informationPriority: String(parsed.informationPriority ?? ''),
    imageDataBalance: String(parsed.imageDataBalance ?? ''),
    responsiveDirection: String(parsed.responsiveDirection ?? ''),
    mobileDirection: String(parsed.mobileDirection ?? ''),
    desktopDirection: String(parsed.desktopDirection ?? ''),
    creativeLatitude: String(parsed.creativeLatitude ?? ''),
    immutableRequirements: Array.isArray(parsed.immutableRequirements) ?
      parsed.immutableRequirements.map(String)
    : [],
    referenceStrategy: String(parsed.referenceStrategy ?? ''),
    assetStrategy: String(parsed.assetStrategy ?? ''),
    createdAt: now,
    cgptProvider: 'anthropic',
    cgptModel: ANTHROPIC_CREATIVE_MODEL,
  };
}
