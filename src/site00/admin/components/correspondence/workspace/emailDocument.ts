import { useEffect, useState } from 'react';
import { renderEmailTemplate } from '@site00-email/render';
import { getTemplateById } from '@site00-email/registry/templates';
import type { EmailTemplateVersion } from '../../../../../../shared/site00-correspondence-studio/types.js';
import {
  classifyEmailBlocks,
  type EmailBlock,
  type EmailBlockDescriptor,
} from '../../../../../../shared/site00-correspondence-studio/workspaceLibrary.js';

export type EmailDocument = {
  source: 'repository_html' | 'site00_email_template';
  /** Document rendered into the stage iframe. Review-board chrome is hidden; the email markup is untouched. */
  srcDoc: string;
  subject: string | null;
  preheader: string | null;
  from: string | null;
  boardNote: string | null;
  blocks: EmailBlock[] | null;
  heroImage: string | null;
  checks: { images: number; imagesMissingAlt: number; links: number; personalizedFields: number; pendingFields: number } | null;
};

export type EmailDocumentState =
  | { status: 'loading' }
  | { status: 'ready'; doc: EmailDocument }
  | { status: 'unavailable'; reason: string };

const STAGE_STYLE =
  '<style data-correspondence-studio-stage>html,body{background:#fff!important}.stage{padding:0!important}.inbox{display:none!important}.email{margin:0 auto!important}</style>';

const cache = new Map<string, Promise<EmailDocument>>();

function text(el: Element | null | undefined): string | null {
  const t = el?.textContent?.replace(/\s+/g, ' ').trim();
  return t ? t : null;
}

const BLOCK_BOUNDARY = /^(P|DIV|H[1-6]|LI|TD|TH|TR|TABLE|SECTION|HEADER|FOOTER|FIGURE|FIGCAPTION|BR|HR)$/;
const ALNUM = /[\p{L}\p{N}]/u;

/** Email CSS sets many inline elements to display:block; keep adjacent words apart without layout. */
function spacedText(root: Element): string {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let out = '';
  let prevParent: Node | null = null;
  let boundary = false;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (BLOCK_BOUNDARY.test((node as Element).tagName)) boundary = true;
      continue;
    }
    const t = node.textContent ?? '';
    if (!t) continue;
    if (prevParent) {
      const joinedWord = ALNUM.test(out.slice(-1)) && ALNUM.test(t.charAt(0)) && prevParent !== node.parentNode;
      if (boundary || joinedWord) out += ' ';
    }
    out += t;
    prevParent = node.parentNode;
    boundary = false;
  }
  return out;
}

function injectStageStyle(html: string): string {
  return html.includes('</head>') ? html.replace('</head>', `${STAGE_STYLE}</head>`) : `${STAGE_STYLE}${html}`;
}

function decodeCfEmail(hex: string): string | null {
  if (!/^(?:[0-9a-f]{2}){2,}$/i.test(hex)) return null;
  const key = parseInt(hex.slice(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

/**
 * Proxies in front of the preview host (Cloudflare email obfuscation) rewrite addresses and inject
 * scripts. The preview iframe runs no scripts, so restore the repository text and drop any script.
 */
function restoreRepositoryMarkup(dom: Document): void {
  dom.querySelectorAll('script').forEach((el) => el.remove());
  dom.querySelectorAll('[data-cfemail]').forEach((el) => {
    const email = decodeCfEmail(el.getAttribute('data-cfemail') ?? '');
    if (email) el.replaceWith(dom.createTextNode(email));
  });
  dom.querySelectorAll<HTMLAnchorElement>('a[href*="/cdn-cgi/l/email-protection#"]').forEach((a) => {
    const email = decodeCfEmail(a.getAttribute('href')?.split('#')[1] ?? '');
    if (email) a.setAttribute('href', `mailto:${email}`);
  });
}

function parseRepositoryHtml(html: string): EmailDocument {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  const proxied = /data-cfemail|<script/i.test(html);
  if (proxied) restoreRepositoryMarkup(dom);
  const markup = proxied ? `<!doctype html>\n${dom.documentElement.outerHTML}` : html;
  const email = dom.querySelector('.email');
  const descriptors: EmailBlockDescriptor[] = email
    ? Array.from(email.children).map((node) => ({
        tag: node.tagName.toLowerCase(),
        className: node.getAttribute('class') ?? '',
        text: spacedText(node),
        imageSrc: node.matches('img') ? node.getAttribute('src') : node.querySelector('img')?.getAttribute('src') ?? null,
        hasHeading1: Boolean(node.querySelector('h1')),
        hasHeading2: Boolean(node.querySelector('h2')),
      }))
    : [];
  const images = email ? Array.from(email.querySelectorAll('img')) : [];
  return {
    source: 'repository_html',
    srcDoc: injectStageStyle(markup),
    subject: text(dom.querySelector('.inbox .subj')),
    preheader: text(dom.querySelector('.inbox .pre')),
    from: text(dom.querySelector('.inbox .from')),
    boardNote: text(dom.querySelector('.inbox .note')),
    blocks: email ? classifyEmailBlocks(descriptors) : null,
    heroImage: images[0]?.getAttribute('src') ?? null,
    checks: email
      ? {
          images: images.length,
          imagesMissingAlt: images.filter((img) => !img.hasAttribute('alt')).length,
          links: email.querySelectorAll('a[href]').length,
          personalizedFields: email.querySelectorAll('.v').length,
          pendingFields: email.querySelectorAll('.tok').length,
        }
      : null,
  };
}

export function loadRepositoryEmail(path: string): Promise<EmailDocument> {
  let hit = cache.get(path);
  if (!hit) {
    hit = fetch(path, { credentials: 'same-origin' }).then(async (res) => {
      if (!res.ok) throw new Error(`PREVIEW ${res.status}`);
      const body = await res.text();
      if (!body.includes('class="email"')) throw new Error('PREVIEW IS NOT A COMPOSED EMAIL');
      return parseRepositoryHtml(body);
    });
    hit.catch(() => cache.delete(path));
    cache.set(path, hit);
  }
  return hit;
}

async function loadVersion(version: EmailTemplateVersion): Promise<EmailDocument | string> {
  const source = version.preview_source;
  if (source.kind === 'repository_html') {
    if (!source.publicPreviewPath) return 'PREVIEW PATH NOT PUBLISHED. RUN sync-opus-previews.';
    return loadRepositoryEmail(source.publicPreviewPath);
  }
  if (source.kind === 'site00_email_template') {
    if (!getTemplateById(source.templateId)) return 'NOT YET COMPOSED IN CORRESPONDENCE STUDIO.';
    const rendered = await renderEmailTemplate(source.templateId);
    return {
      source: 'site00_email_template',
      srcDoc: rendered.html,
      subject: null,
      preheader: null,
      from: null,
      boardNote: null,
      blocks: null,
      heroImage: null,
      checks: null,
    };
  }
  return 'UNSUPPORTED PREVIEW SOURCE.';
}

export function useEmailDocument(version: EmailTemplateVersion | null): EmailDocumentState {
  const [state, setState] = useState<EmailDocumentState>({ status: 'loading' });
  useEffect(() => {
    if (!version) {
      setState({ status: 'unavailable', reason: 'NO VERSION SELECTED.' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    loadVersion(version)
      .then((out) => {
        if (cancelled) return;
        setState(typeof out === 'string' ? { status: 'unavailable', reason: out } : { status: 'ready', doc: out });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ status: 'unavailable', reason: err instanceof Error ? err.message : 'PREVIEW FAILED TO LOAD.' });
      });
    return () => {
      cancelled = true;
    };
  }, [version]);
  return state;
}

/** Hero image per composed preview path, for library thumbnails. */
export function useLibraryThumbnails(paths: string[]): Record<string, string | null> {
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});
  const key = paths.join('|');
  useEffect(() => {
    let cancelled = false;
    for (const path of paths) {
      loadRepositoryEmail(path)
        .then((doc) => {
          if (!cancelled) setThumbs((prev) => (prev[path] === doc.heroImage ? prev : { ...prev, [path]: doc.heroImage }));
        })
        .catch(() => {
          if (!cancelled) setThumbs((prev) => ({ ...prev, [path]: null }));
        });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return thumbs;
}
