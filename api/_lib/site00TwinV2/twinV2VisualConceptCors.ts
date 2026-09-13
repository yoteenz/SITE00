/**
 * CORS for Twin V2 visual concept API (cross-origin from fsbw-dev / site00.com SPA).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyCaptureCorsHeaders,
  handleCaptureCorsPreflight,
} from '../site00Capture/captureCors.js';

export function handleTwinV2VisualConceptCors(req: VercelRequest, res: VercelResponse): boolean {
  applyCaptureCorsHeaders(req, res);
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  return handleCaptureCorsPreflight(req, res);
}
