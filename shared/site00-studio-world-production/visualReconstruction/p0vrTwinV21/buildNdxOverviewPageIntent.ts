import type { PageIntentModel } from './types.js';

export function buildNdxOverviewPageIntent(): PageIntentModel {
  return {
    pageType: 'PROJECT OVERVIEW / FOUNDER OPERATING SNAPSHOT',
    primaryPurposes: [
      'orient founder inside NDXBOOK',
      'communicate project identity',
      'surface current phase',
      'show active editorial / production focus',
      'expose progress',
      'show status / readiness',
      'surface next milestone',
      'show recent activity',
      'navigate to deeper modules',
    ],
    primaryUser: 'FOUNDER',
    primaryDecision: 'WHAT NEEDS MY ATTENTION / WHERE IS NDXBOOK NOW?',
    summary: 'NDXBOOK mobile overview — founder operating snapshot inside SITE 00 host shell.',
  };
}
