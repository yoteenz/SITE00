/**
 * KLING 4.0 capability matrix — distinguishes model vs Artlist UI vs our integration.
 * Sources documented 2026-10-21; re-verify before enabling API_AUTOMATED.
 */

export type CapabilitySupport =
  | 'SUPPORTED'
  | 'UNSUPPORTED'
  | 'UNVERIFIED'
  | 'UI_ONLY'
  | 'API_AVAILABLE'
  | 'REQUIRES_MANUAL_ACTION'
  | 'DISABLED';

export type CapabilityRow = {
  capability: string;
  klingModel: CapabilitySupport;
  artlistUi: CapabilitySupport;
  artlistPublicApi: CapabilitySupport;
  klingDirectApi: CapabilitySupport;
  site00Integration: CapabilitySupport;
  notes: string;
  documentationUrl?: string;
};

export const KLING4_CAPABILITY_MATRIX: CapabilityRow[] = [
  {
    capability: 'TEXT_TO_VIDEO',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'UNSUPPORTED',
    notes: 'Existing NDXBOOK video routing uses fal-kling v1/v2, not Kling 4.',
    documentationUrl: 'https://kling.ai/quickstart/kling-4-model-user-guide',
  },
  {
    capability: 'IMAGE_TO_VIDEO',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'UNSUPPORTED',
    notes: 'FAL image-to-video exists for legacy Kling; no Kling 4 binding.',
    documentationUrl: 'https://kling.ai/document-api/guides/capability-map/video.md',
  },
  {
    capability: 'START_FRAME',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'REQUIRES_MANUAL_ACTION',
    notes: 'Artlist model page advertises start/end/middle frames.',
    documentationUrl: 'https://artlist.io/ai/models/kling-4-0',
  },
  {
    capability: 'END_FRAME',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'REQUIRES_MANUAL_ACTION',
    notes: '',
  },
  {
    capability: 'MULTIPLE_MIDDLE_FRAMES',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'REQUIRES_MANUAL_ACTION',
    notes: 'Kling docs: up to 10 keyframes; Artlist advertises up to 8 middle frames on timeline.',
    documentationUrl: 'https://kling.ai/quickstart/kling-4-model-user-guide',
  },
  {
    capability: 'IMAGE_REFERENCES',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'REQUIRES_MANUAL_ACTION',
    notes: 'Up to 10 images (Kling) / 15 total refs including video (Artlist announcement).',
  },
  {
    capability: 'VIDEO_REFERENCES',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'UNSUPPORTED',
    notes: 'Up to 5 videos per Kling 4 guide.',
  },
  {
    capability: 'SHOT_DURATION_3_TO_30S',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'UNVERIFIED',
    notes: 'Artlist page: 1080p single pass up to 30s.',
  },
  {
    capability: 'ASPECT_RATIO_21_9',
    klingModel: 'SUPPORTED',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'UNSUPPORTED',
    notes: 'Entry 002 benchmark uses 9:16 reel authority.',
  },
  {
    capability: 'DIALOGUE_GENERATION',
    klingModel: 'SUPPORTED',
    artlistUi: 'UI_ONLY',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'UNSUPPORTED',
    notes: 'Nine languages advertised on Artlist; benchmark shot has no dialogue.',
  },
  {
    capability: 'JOB_STATUS_POLLING',
    klingModel: 'API_AVAILABLE',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'API_AVAILABLE',
    site00Integration: 'UNSUPPORTED',
    notes: 'Artlist MCP supports status polling; not wired in SITE 00.',
    documentationUrl: 'https://help.artlist.io/hc/en-us/articles/38948588333469',
  },
  {
    capability: 'WEBHOOK_CALLBACKS',
    klingModel: 'UNVERIFIED',
    artlistUi: 'UNSUPPORTED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'UNVERIFIED',
    site00Integration: 'UNSUPPORTED',
    notes: '',
  },
  {
    capability: 'COMMERCIAL_USE',
    klingModel: 'UNVERIFIED',
    artlistUi: 'UNVERIFIED',
    artlistPublicApi: 'UNVERIFIED',
    klingDirectApi: 'UNVERIFIED',
    site00Integration: 'UNVERIFIED',
    notes: 'Requires founder legal review of Artlist AI Toolkit + Kling terms before paid client delivery.',
  },
  {
    capability: 'PAID_GENERATION_API',
    klingModel: 'API_AVAILABLE',
    artlistUi: 'SUPPORTED',
    artlistPublicApi: 'REQUIRES_MANUAL_ACTION',
    klingDirectApi: 'REQUIRES_MANUAL_ACTION',
    site00Integration: 'DISABLED',
    notes:
      'Artlist business OAuth exists (account manager credentials) but no documented public video-gen REST in repo. MCP is assistant-mediated, not production adapter.',
    documentationUrl: 'https://developer.artlist.io/authentication.md',
  },
];

export const KLING4_PROVIDER_LIMITS = {
  maxImageReferences: 10,
  maxVideoReferences: 5,
  maxTotalReferences: 15,
  maxMiddleKeyframesKling: 10,
  maxMiddleKeyframesArtlistUi: 8,
  minDurationSec: 3,
  maxDurationSec: 30,
  supportedAspectRatios: ['21:9', '16:9', '1:1', '9:16', 'auto'] as const,
  supportedResolutionsArtlistUi: ['720p', '1080p'] as const,
  supportedResolutionsKlingApi: ['720p', '1080p', '4K'] as const,
} as const;
