/**
 * P0.5E.4 — Character synthesis preview (founder-facing, not Character Bible).
 */

import { randomUUID } from 'node:crypto';
import type { CharacterSynthesisPreview, EmbodiedCharacterFounderDiscoveryRun } from './types.js';

const BRAND_DECK_MARKERS = ['INTELLIGENT', 'WITTY', 'CULTURAL', 'AUTHENTIC', 'BRAND ATTRIBUTES'];

export function synthesisReadsLikeBrandDeck(text: string): boolean {
  const upper = text.toUpperCase();
  const hits = BRAND_DECK_MARKERS.filter((m) => upper.includes(m));
  return hits.length >= 3 && upper.includes('BRAND');
}

export function buildCharacterSynthesisPreview(run: EmbodiedCharacterFounderDiscoveryRun): CharacterSynthesisPreview {
  const confirmed = run.ledger.filter((e) => e.authority === 'FOUNDER_CONFIRMED' || e.authority === 'FOUNDER_REVISED');
  const whoSheIs =
    confirmed.slice(0, 3).map((e) => e.currentStatement).join(' ') ||
    'A woman still being discovered — seeded proposals remain non-canon until founder confirms.';

  const preview: CharacterSynthesisPreview = {
    previewId: randomUUID(),
    whoSheIs,
    whatSheWants: 'To understand things properly before she speaks — and to be right without performing certainty.',
    whatSheFears: 'Being wrong in public; being reduced to a type; losing the thread of her own argument.',
    whatShesGoodAt: run.intelligenceMap.couldTalkForHours.join('; ') || 'Pattern recognition when she has receipts.',
    whatShesBadAt: run.intelligenceMap.embarrassinglyBadAt.join('; ') || 'Spatial reasoning; admitting she is lost in a new city.',
    whatSheGetsWrong: 'Forms an opinion too early when the topic feels morally obvious.',
    whatMakesHerFunny: run.humorBehavior.whatMakesHerLaugh.join('; ') || 'Petty observations delivered with a pause.',
    whatMakesHerAnnoying: run.flawProfile.bestFriendWouldRoastHerFor.join('; ') || 'Will not let a wrong statement slide.',
    whatSheLoves: 'A receipt that proves she was right; a friend who argues back.',
    whatSheHides: 'How much she cares whether a Page lands.',
    whatFriendsKnow: run.publicPrivate.friendsKnow.join('; ') || 'She is softer than she performs online.',
    whatStrangersAssume: run.publicPrivate.strangersThink.join('; ') || 'Cooler and more unbothered than she is.',
    whenWrong: 'Publishes Errata — after sitting with it longer than she admits.',
    whenCurious: 'Fourteen tabs, background noise, forgotten snack.',
    whenBored: 'Opens an app without thinking; reorganizes something unnecessarily.',
    whenHurt: 'Gets quieter; saves screenshots she will never re-read.',
    whenRight: 'Tempted to post immediately; sometimes waits for the perfect receipt anyway.',
    bookMeaning: run.bookDiscovery.whySheWritesThingsDown ?? 'External memory because she does not trust recall alone.',
    howSheSounds: 'Same woman, different register — margin vs TikTok vs text to friend.',
    howSheMoves: 'Research posture when thinking; stillness when she has found the contradiction.',
    howSheOccupiesRoom: 'Present but not performing until she forgets the camera.',
    stillDontKnow: run.forensicReport.unresolvedTraits > 0 ? ['Final face', 'Exact age range', 'Some contradictions still being tested'] : [],
    readsLikeBrandDeck: false,
    generatedAt: new Date().toISOString(),
  };

  const combined = Object.values(preview).filter((v) => typeof v === 'string').join(' ');
  preview.readsLikeBrandDeck = synthesisReadsLikeBrandDeck(combined);
  return preview;
}

export function synthesisPreviewFailsIfBrandDeck(preview: CharacterSynthesisPreview): boolean {
  return preview.readsLikeBrandDeck;
}
