import type { IncomingHttpHeaders } from 'node:http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Request, Response } from 'express';

export function createVercelRequest(req: Request): VercelRequest {
  const query: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(req.query)) {
    if (value === undefined) continue;
    query[key] = value;
  }

  return {
    method: req.method,
    url: req.originalUrl,
    query,
    headers: req.headers as IncomingHttpHeaders,
    body: req.body,
  } as VercelRequest;
}

export function createVercelResponse(res: Response): VercelResponse {
  const adapter = {
    get statusCode() {
      return res.statusCode;
    },
    set statusCode(code: number) {
      res.statusCode = code;
    },
    setHeader(key: string, value: string | number | readonly string[]) {
      res.setHeader(key, value);
      return adapter;
    },
    status(code: number) {
      res.statusCode = code;
      return adapter;
    },
    json(payload: unknown) {
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(payload));
      return adapter;
    },
    end(data?: unknown) {
      if (data !== undefined) {
        res.end(typeof data === 'string' || Buffer.isBuffer(data) ? data : String(data));
      } else {
        res.end();
      }
      return adapter;
    },
  };

  return adapter as VercelResponse;
}

export type ApiHandler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>;
