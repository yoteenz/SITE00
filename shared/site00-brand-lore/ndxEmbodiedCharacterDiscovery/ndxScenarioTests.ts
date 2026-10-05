/**
 * P0.5E.3 — NDX character scenario stress tests (12 minimum).
 */

import { buildCharacterScenarioTest } from '../../site00-studio-world-production/embodiedCharacterDiscovery/scenarioTests.js';
import type { CharacterScenarioTest } from '../../site00-studio-world-production/embodiedCharacterDiscovery/types.js';

export function buildNdxCharacterScenarioTests(): CharacterScenarioTest[] {
  return [
    buildCharacterScenarioTest({
      scenario: 'SHE FINDS A RECEIPT THAT PROVES HER RIGHT',
      thought: 'She knew it. But she checks twice anyway — wants the receipt clean.',
      spokenReaction: 'Wait. I knew this felt off.',
      physicalReaction: 'Leans in, zooms, circles the line',
      primaryArtifactBehavior: 'Bookmarks the source before posting',
      platformExpression: 'Reel — Book in motion; receipt accumulation visible',
      whatSheWouldNotDo: 'Gloat without showing the proof chain',
    }),
    buildCharacterScenarioTest({
      scenario: 'SHE FINDS A RECEIPT THAT PROVES HER WRONG',
      thought: 'Shit. She was confident. Now she has to care about being accurate.',
      spokenReaction: 'Okay. I was wrong about that.',
      physicalReaction: 'Pause. Exhale. Starts typing Errata',
      primaryArtifactBehavior: 'Publishes Errata — does not quietly delete',
      platformExpression: 'Page or Margin depending on severity',
      whatSheWouldNotDo: 'Spin it as she meant it all along',
    }),
    buildCharacterScenarioTest({
      scenario: 'EVERYONE ONLINE LOVES SOMETHING SHE HATES',
      thought: 'She sees why people like it. Still finds it corny.',
      spokenReaction: 'I get the appeal. Not for me.',
      physicalReaction: 'Side-eye at screen, maybe closes laptop',
      primaryArtifactBehavior: 'May dog-ear for later investigation instead of hot take',
      platformExpression: 'Story Margin — question or poll',
      whatSheWouldNotDo: 'Perform contrarian outrage for engagement',
    }),
    buildCharacterScenarioTest({
      scenario: "SHE DOESN'T UNDERSTAND A TREND",
      thought: 'This might be generational or regional — she will look before speaking.',
      spokenReaction: 'I genuinely do not get this yet.',
      physicalReaction: 'Scrolls, reads comments, texts group chat',
      primaryArtifactBehavior: 'Research queue — not a Page until she understands',
      platformExpression: 'TikTok — thought being worked out',
      whatSheWouldNotDo: 'Fake fluency with slang she does not mean',
    }),
    buildCharacterScenarioTest({
      scenario: 'A TOPIC IS SERIOUS AND NOT APPROPRIATE FOR HUMOR',
      thought: 'Her humor instinct shuts off. Respect mode.',
      spokenReaction: 'Quiet or minimal — lets the fact stand',
      physicalReaction: 'Stillness, direct look, no performative empathy',
      primaryArtifactBehavior: 'Page with care — no punchline framing',
      platformExpression: 'Feed Page — editorial judgment',
      whatSheWouldNotDo: 'Use humor to soften what should not be softened',
    }),
    buildCharacterScenarioTest({
      scenario: 'SHE BECOMES OBSESSED WITH SOMETHING TRIVIAL',
      thought: 'She knows it is trivial. Cannot let it go.',
      spokenReaction: 'This is stupid but I need to know.',
      physicalReaction: 'Rabbit hole posture — tabs multiply',
      primaryArtifactBehavior: 'Margin notes stack before Page decision',
      platformExpression: 'TikTok ramble → Reel investigation → maybe Page',
      whatSheWouldNotDo: 'Pretend the obsession is more important than it is',
    }),
    buildCharacterScenarioTest({
      scenario: 'SOMEONE CORRECTS HER',
      thought: 'Annoyance first, then curiosity — were they right?',
      spokenReaction: 'Send the link.',
      physicalReaction: 'Arms cross, then she reads',
      primaryArtifactBehavior: 'FLIP BACK to prior Page if needed',
      platformExpression: 'Margin or Errata depending on correction',
      whatSheWouldNotDo: 'Block or dismiss without reading',
    }),
    buildCharacterScenarioTest({
      scenario: 'AN OLD PAGE BECOMES RELEVANT AGAIN',
      thought: 'She remembers writing it — pattern recognition kicks in.',
      spokenReaction: 'We already talked about this.',
      physicalReaction: 'Pulls up archive, points at old line',
      primaryArtifactBehavior: 'FLIP BACK + callback Page',
      platformExpression: 'Reel callback + Feed reference',
      whatSheWouldNotDo: 'Act like she never said it',
    }),
    buildCharacterScenarioTest({
      scenario: 'SHE HAS NO OPINION YET',
      thought: 'Uncomfortable with fake certainty.',
      spokenReaction: 'I do not know yet.',
      physicalReaction: 'Shrugs, keeps researching on camera',
      primaryArtifactBehavior: 'Bookmark — not a Page',
      platformExpression: 'TikTok — unfinished thinking allowed',
      whatSheWouldNotDo: 'Publish a Page to fill silence',
    }),
    buildCharacterScenarioTest({
      scenario: 'SHE IS TIRED BUT STILL CURIOUS',
      thought: 'Should sleep. One more tab.',
      spokenReaction: 'Last one. Actually last one.',
      physicalReaction: 'Lounging, phone close to face, yawning mid-scroll',
      primaryArtifactBehavior: 'Margin note instead of full Page',
      platformExpression: 'Story Margin — low stakes observation',
      whatSheWouldNotDo: 'Full glam presentation while exhausted',
    }),
    buildCharacterScenarioTest({
      scenario: 'SOMETHING IS FUNNY BUT SHE SHOULD NOT BE THE JOKE',
      thought: 'She can laugh without making herself the punchline.',
      spokenReaction: 'That is insane.',
      physicalReaction: 'Laughs, covers mouth, keeps camera on subject',
      primaryArtifactBehavior: 'Shows the thing — not self-roast for views',
      platformExpression: 'Reel or TikTok — subject-forward',
      whatSheWouldNotDo: 'Self-deprecate into the butt of the joke',
    }),
    buildCharacterScenarioTest({
      scenario: 'THE GROUP CHAT WAS RIGHT',
      thought: 'She hates when they are right before she is.',
      spokenReaction: 'Fine. You were right.',
      physicalReaction: 'Types and deletes, then sends screenshot',
      primaryArtifactBehavior: 'Adds group chat receipt to Book',
      platformExpression: 'Margin → Page if it survives process',
      whatSheWouldNotDo: 'Credit herself for their observation',
    }),
  ];
}
