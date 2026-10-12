import type { DigitalFoundationArtifactPayload } from '../../site00-digital-foundation/types.js';
import { derive01, derive02, derive03, derive04, derive05, derive06, derive07, type Eligibility, type Fndatn01Context } from './contracts.js';
import { compose01, compose02, compose03, compose04, compose05, compose06, compose07, type Composition } from './emails.js';
import { assetResolver } from './html.js';
import { documentHtml, inboxBlock } from './layout.js';
import { FNDATN01_PUBLIC_ROOT, type Fndatn01EmailId } from './pack.js';

export type Fndatn01RenderOptions = Fndatn01Context & {
  /**
   * `send` requires an absolute https asset base and an eligible payload; it is the only mode a
   * delivery path may use. `review` renders the studio preview with root-relative assets and an
   * inbox header; it still refuses ineligible payloads.
   */
  mode: 'send' | 'review';
  assetBase: string;
  founderAuthorized?: boolean;
  reminderAlreadySentForActivity?: boolean;
  reviewNote?: string;
};

export type Fndatn01Rendered =
  { ok: true; html: string; subject: string; preheader: string; eligibility: Eligibility } | { ok: false; eligibility: Eligibility };

export const FNDATN01_REVIEW_SENDER = 'FROM · SENDER ADDRESS PENDING REGISTRATION';

function compose(
  id: Fndatn01EmailId,
  payload: DigitalFoundationArtifactPayload,
  o: Fndatn01RenderOptions,
): { eligibility: Eligibility; comp: Composition | null } {
  const asset = assetResolver(o.assetBase, FNDATN01_PUBLIC_ROOT);
  switch (id) {
    case '01': {
      const r = derive01(payload, o, { founderAuthorized: Boolean(o.founderAuthorized) });
      return { eligibility: r.eligibility, comp: r.data ? compose01(asset, r.data) : null };
    }
    case '02': {
      const r = derive02(payload, o);
      return { eligibility: r.eligibility, comp: r.data ? compose02(asset, r.data) : null };
    }
    case '03': {
      const r = derive03(payload, o);
      return { eligibility: r.eligibility, comp: r.data ? compose03(asset, r.data) : null };
    }
    case '04': {
      const r = derive04(payload, o);
      return { eligibility: r.eligibility, comp: r.data ? compose04(asset, r.data) : null };
    }
    case '05': {
      const r = derive05(payload, o);
      return { eligibility: r.eligibility, comp: r.data ? compose05(asset, r.data) : null };
    }
    case '06': {
      const r = derive06(payload, o, { reminderAlreadySentForActivity: o.reminderAlreadySentForActivity });
      return { eligibility: r.eligibility, comp: r.data ? compose06(asset, r.data) : null };
    }
    case '07': {
      const r = derive07(payload, o);
      return { eligibility: r.eligibility, comp: r.data ? compose07(asset, r.data) : null };
    }
  }
}

export function renderFndatn01Email(id: Fndatn01EmailId, payload: DigitalFoundationArtifactPayload, o: Fndatn01RenderOptions): Fndatn01Rendered {
  if (o.mode === 'send' && !/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(o.assetBase)) {
    throw new Error('FNDATN-01 send mode requires an absolute https asset base');
  }
  if (o.mode === 'review' && o.assetBase !== '' && !/^https:\/\//i.test(o.assetBase)) {
    throw new Error('FNDATN-01 review asset base must be empty (root-relative) or https');
  }
  const { eligibility, comp } = compose(id, payload, o);
  if (!comp) return { ok: false, eligibility };
  const inbox = o.mode === 'review' ? inboxBlock(FNDATN01_REVIEW_SENDER, comp.subjectHtml, comp.preheader, o.reviewNote ?? '') : null;
  const html = documentHtml({
    title: comp.subject,
    preheader: comp.preheader,
    assetBase: o.assetBase,
    root: FNDATN01_PUBLIC_ROOT,
    inbox,
    label: comp.label,
    blocks: comp.blocks,
    styles: comp.styles,
  });
  return { ok: true, html, subject: comp.subject, preheader: comp.preheader, eligibility };
}
