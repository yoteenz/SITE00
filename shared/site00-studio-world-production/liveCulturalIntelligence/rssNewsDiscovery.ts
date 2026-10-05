/**
 * P0.5D.2 — Public RSS web/news discovery (no API key required).
 */

import type { RawWebNewsCandidate } from './types.js';
import { createHash, randomUUID } from 'node:crypto';

export type RssFeedConfig = {
  feedUrl: string;
  publisher: string;
  category: string;
};

export const DEFAULT_RSS_FEEDS: RssFeedConfig[] = [
  { feedUrl: 'https://feeds.bbci.co.uk/news/business/rss.xml', publisher: 'BBC Business', category: 'business' },
  { feedUrl: 'https://feeds.bbci.co.uk/news/technology/rss.xml', publisher: 'BBC Technology', category: 'technology' },
  { feedUrl: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', publisher: 'BBC Entertainment', category: 'entertainment' },
];

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseRssItems(xml: string, feed: RssFeedConfig): RawWebNewsCandidate[] {
  const items: RawWebNewsCandidate[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  const retrievedAt = new Date().toISOString();

  for (const block of itemBlocks.slice(0, 8)) {
    const title = decodeEntities(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
    const link = decodeEntities(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? '');
    const pubDate = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ?? null;
    const description = decodeEntities(
      block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ??
        block.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i)?.[1] ??
        '',
    ).slice(0, 400);

    if (!title) continue;

    items.push({
      candidateId: `rwn-${randomUUID().slice(0, 8)}`,
      headline: title,
      publisher: feed.publisher,
      publicationTime: pubDate,
      retrievedAt,
      url: link,
      summary: description || title,
      entities: [],
      sourceClassification: 'PRIMARY',
      confidence: 0.65,
      possibleEventDate: pubDate,
      provider: 'PUBLIC_RSS',
      query: feed.category,
    });
  }

  return items;
}

export async function fetchRssFeed(params: {
  feed: RssFeedConfig;
  fetchImpl?: FetchFn;
  timeoutMs?: number;
}): Promise<{ ok: boolean; items: RawWebNewsCandidate[]; error: string | null }> {
  const fetchImpl = params.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs ?? 12000);

  try {
    const res = await fetchImpl(params.feed.feedUrl, { signal: controller.signal });
    if (!res.ok) return { ok: false, items: [], error: `HTTP ${res.status}` };
    const xml = await res.text();
    const items = parseRssItems(xml, params.feed);
    return { ok: true, items, error: null };
  } catch (err) {
    return { ok: false, items: [], error: err instanceof Error ? err.message : 'fetch failed' };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRssNewsDiscovery(params: {
  feeds?: RssFeedConfig[];
  fetchImpl?: FetchFn;
  maxItems?: number;
}): Promise<{
  items: RawWebNewsCandidate[];
  receipts: Array<{ feedUrl: string; publisher: string; resultCount: number; ok: boolean; error: string | null }>;
}> {
  const feeds = params.feeds ?? DEFAULT_RSS_FEEDS;
  const all: RawWebNewsCandidate[] = [];
  const receipts: Array<{ feedUrl: string; publisher: string; resultCount: number; ok: boolean; error: string | null }> = [];

  for (const feed of feeds) {
    const result = await fetchRssFeed({ feed, fetchImpl: params.fetchImpl });
    receipts.push({
      feedUrl: feed.feedUrl,
      publisher: feed.publisher,
      resultCount: result.items.length,
      ok: result.ok,
      error: result.error,
    });
    if (result.ok) all.push(...result.items);
  }

  const max = params.maxItems ?? 24;
  return { items: all.slice(0, max), receipts };
}

export function rssPayloadHash(xml: string): string {
  return createHash('sha256').update(xml).digest('hex').slice(0, 16);
}

export function articleDoesNotAutoBecomeOpportunity(): true {
  return true;
}
