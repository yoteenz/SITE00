/**
 * Experience Engine V0 API — route fidelity proof operations.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  getEnterProofState,
  runEnterDesktopProofLoop,
} from '../_lib/site00ExperienceEngine/experienceEngineService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const routeId = String(req.query.route ?? '/enter');

    if (req.method === 'GET') {
      if (routeId !== '/enter') {
        return res.status(404).json({ error: 'Experience Engine proof not configured for route', routeId });
      }
      const proof = await getEnterProofState();
      return res.status(200).json(proof);
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const action = body.action as string;

    if (action === 'run_enter_desktop_proof') {
      const proof = await runEnterDesktopProofLoop({
        baseUrl: body.baseUrl,
        maxIterations: body.maxIterations,
      });
      return res.status(200).json(proof);
    }

    return res.status(400).json({ error: 'Unknown action', action });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Experience Engine error';
    return res.status(500).json({ error: message });
  }
}
