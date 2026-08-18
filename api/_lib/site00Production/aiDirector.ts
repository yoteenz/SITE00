import type { ProductionPlanResponse } from './types.js';
import { readinessSummaryForAi, type ProjectReadinessGraph } from './readinessEvaluator.js';

type ReadinessContext = ReturnType<typeof readinessSummaryForAi> | null;

/** Development adapter — swap for OpenAI/FAL-backed provider in production. */
export const aiProductionDirector = {
  async interpretProject(projectId: string): Promise<{ summary: string; confidence: number }> {
    return {
      summary: `PROJECT ${projectId.toUpperCase()} INTERPRETED FROM IDNTY + BLDR INTAKE.`,
      confidence: 0.82,
    };
  },

  async generateProjectIntelligence(input: Record<string, unknown>) {
    return {
      ...input,
      provenance: {
        identity_state: 'SYSTEM_INFERRED',
        build_class: 'CLIENT_PROVIDED',
        primary_goals: 'AI_SUGGESTED',
      },
      confidence: 0.78,
      last_generated_at: new Date().toISOString(),
    };
  },

  async generateProductionPlan(project: {
    id: string;
    current_phase: string;
    deliverables: Array<{ deliverable_key: string; title: string; category: string; status: string }>;
  }): Promise<ProductionPlanResponse> {
    return {
      projectId: project.id,
      phase: project.current_phase,
      deliverables: project.deliverables,
      dependencies: [],
      blockers: project.deliverables.filter((d) => d.status === 'BLOCKED').map((d) => d.title),
      missingAssets: [],
      missingAccess: [],
      recommendations: ['GENERATE HOMEPAGE ART DIRECTION BRIEF', 'CONFIRM CREATIVE CONSTITUTION'],
      nextActions: [
        {
          actionType: 'GENERATE_BRIEF',
          title: 'CREATE HOMEPAGE ART DIRECTION BRIEF',
          priority: 'HIGH',
          destination: `/admin/site00/projects/${project.id}/studio`,
        },
      ],
    };
  },

  async generateBrief(input: {
    deliverableTitle: string;
    projectName: string;
    constitution: Record<string, unknown>;
  }) {
    return {
      title: `${input.deliverableTitle.toUpperCase()} — AI PRODUCTION BRIEF`,
      objective: `CREATE A LUXURY ECOMMERCE ${input.deliverableTitle.toUpperCase()} FOR ${input.projectName.toUpperCase()}.`,
      audience: 'PREMIUM SKINCARE BUYERS AGED 25–45.',
      goals: ['INCREASE CONVERSION', 'BUILD CREDIBILITY', 'COMMUNICATE CRAFTSMANSHIP'],
      mustCommunicate: ['LUXURY', 'TRUST', 'CRAFTSMANSHIP', 'TRANSFORMATION'],
      existingAssets: ['APPROVED LOGO', 'PALETTE', 'PRODUCT PHOTOGRAPHY'],
      requiredSections: ['HERO', 'VALUE PROPOSITION', 'COLLECTION', 'STORY', 'SOCIAL PROOF', 'FOOTER'],
      avoid: ['GENERIC ECOMMERCE', 'VISUAL CLICHÉS', 'CROWDED LAYOUTS'],
      generate: 3,
      constitutionRules: input.constitution,
    };
  },

  async recommendInsights(input: { name: string; readiness?: ReadinessContext; graph?: ProjectReadinessGraph }) {
    const ctx = input.readiness ?? (input.graph ? readinessSummaryForAi(input.graph) : null);
    const insights = [];

    if (ctx) {
      for (const b of ctx.blockers) {
        if (b.type === 'access') {
          insights.push({
            priority: 'HIGH',
            what: `${String(b.service ?? 'SERVICE').toUpperCase()} ACCESS BLOCKS PRODUCTION`,
            why: b.reason,
            impact: 'DOWNSTREAM BUILD WORK CANNOT PROCEED UNTIL ACCESS IS VERIFIED.',
            action: 'REQUEST ACCESS',
            destination: 'ACCESS',
          });
        }
      }

      for (const key of ctx.readyDeliverables) {
        if (key === 'homepage_visual_direction') {
          insights.push({
            priority: 'HIGH',
            what: 'HOMEPAGE ART DIRECTION READY TO GENERATE',
            why: 'STRUCTURED READINESS CONFIRMS ALL CURRENT DIMENSIONS ARE SATISFIED.',
            impact: 'UNBLOCKS COLLECTION AND PRODUCT PAGE DIRECTION.',
            action: 'GENERATE BRIEF',
            destination: 'STUDIO',
          });
        }
      }

      if (ctx.blockers.length === 0 && ctx.readyDeliverables.length === 0) {
        insights.push({
          priority: 'LOW',
          what: 'NO ACTION REQUIRED RIGHT NOW',
          why: 'CURRENT PHASE READINESS IS STABLE.',
          impact: 'CONTINUE IN-PROGRESS PRODUCTION WORK.',
          action: 'VIEW STUDIO',
          destination: 'STUDIO',
        });
      }

      return insights;
    }

    insights.push({
      priority: 'MEDIUM',
      what: 'AWAITING STRUCTURED READINESS CONTEXT',
      why: 'AI DIRECTOR REQUIRES APPLICATION READINESS STATE — NOT INFERENCE.',
      impact: 'INSIGHTS LIMITED UNTIL READINESS GRAPH LOADS.',
      action: 'REFRESH STUDIO',
      destination: 'STUDIO',
    });
    return insights;
  },
};
