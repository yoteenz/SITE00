/**
 * P0.CGO.1 — Associative creative reasoning engine.
 */

import type {
  AssociationChain,
  AssociationChainLink,
  AssociativeDistance,
  ProductCategory,
} from './types.js';
import { resolveProductBodyRelationship } from './productBodyRelationship.js';

let chainCounter = 0;

export class AssociativeCreativeReasoningEngine {
  expandFromProduct(input: {
    productCategory: ProductCategory;
    productName?: string;
    seedTerms?: string[];
  }): AssociationChain[] {
    const rel = resolveProductBodyRelationship(input.productCategory);
    const seeds = input.seedTerms ?? [input.productCategory, rel.bodySurfaces[0] ?? 'HANDS'];

    const chains: AssociationChain[] = [];

    if (input.productCategory === 'JEWELRY') {
      chains.push(
        this.buildChain([
          ['PRODUCT', 'Jewelry', 'LITERAL', 'Starting product'],
          ['BODY_RELATIONSHIP', 'Hands', 'LITERAL', 'Primary wear surface'],
          ['HUMAN_GESTURE', 'Grip / release', 'ADJACENT', 'Hands in action'],
          ['GAME', 'Billiards', 'LATERAL', 'Hand-centric competitive game'],
          ['RISK', 'Wager', 'LATERAL', 'Stakes in gameplay'],
          ['PHRASE', 'Double or nothing', 'UNEXPECTED', 'Risk phrase becomes title language'],
        ]),
      );
    }

    if (input.productCategory === 'HAIR') {
      chains.push(
        this.buildChain([
          ['PRODUCT', 'Hair', 'LITERAL', 'Product category'],
          ['BODY_RELATIONSHIP', 'Movement / silhouette', 'ADJACENT', 'Hair as kinetic signal'],
          ['MOTION', 'Wind tunnel / subway grate', 'LATERAL', 'Environmental motion reveals hair'],
          ['ENVIRONMENT', 'Transit platform', 'LATERAL', 'Real-world motion context'],
          ['HUMAN_BEHAVIOR', 'Commute ritual', 'UNEXPECTED', 'Daily life as campaign world'],
          ['PHRASE', 'In transit', 'UNEXPECTED', 'Title language from behavior'],
        ]),
      );
      chains.push(
        this.buildChain([
          ['PRODUCT', 'Hair', 'LITERAL', 'Product category'],
          ['BODY_RELATIONSHIP', 'Texture / light', 'ADJACENT', 'Hair catches light'],
          ['MATERIAL', 'Copper / brass', 'LATERAL', 'Warm metal echoes hair tone'],
          ['ENVIRONMENT', 'Vintage elevator', 'LATERAL', 'Confined reflective space'],
          ['GEOMETRY', 'Vertical lines', 'LATERAL', 'Mirror panels echo hair length'],
          ['PHRASE', 'Floor by floor', 'UNEXPECTED', 'Elevator ritual as narrative'],
        ]),
      );
    }

    if (input.productCategory === 'FRAGRANCE') {
      chains.push(
        this.buildChain([
          ['PRODUCT', 'Fragrance', 'LITERAL', 'Product category'],
          ['RITUAL', 'Application', 'LITERAL', 'Wrist/neck ritual'],
          ['ENVIRONMENT', 'Hotel corridor', 'LATERAL', 'Departure moment'],
          ['MEMORY', 'Last look in mirror', 'LATERAL', 'Pre-exit ritual'],
          ['TENSION', 'Almost late', 'UNEXPECTED', 'Behavioral tension'],
          ['PHRASE', 'One more stop', 'UNEXPECTED', 'Copy from ritual tension'],
        ]),
      );
    }

    if (input.productCategory === 'FASHION') {
      chains.push(
        this.buildChain([
          ['PRODUCT', 'Fashion', 'LITERAL', 'Product category'],
          ['HUMAN_BEHAVIOR', 'Packing / unpacking', 'ADJACENT', 'Garment lifecycle'],
          ['OBJECT', 'Luggage / garment bag', 'LATERAL', 'Travel prop system'],
          ['ENVIRONMENT', 'Hotel room floor', 'LATERAL', 'Intimate staging'],
          ['TRANSFORMATION', 'Arrival vs departure', 'UNEXPECTED', 'Wardrobe arc'],
          ['PHRASE', 'Carry on', 'UNEXPECTED', 'Idiom as title'],
        ]),
      );
    }

    if (chains.length === 0) {
      chains.push(
        this.buildChain([
          ['PRODUCT', seeds[0] ?? 'Product', 'LITERAL', 'Seed'],
          ['BODY_RELATIONSHIP', rel.bodySurfaces[0] ?? 'Hands', 'ADJACENT', 'Body surface'],
          ['ENVIRONMENT', 'Lived-in space', 'LATERAL', 'Environmental story'],
          ['HUMAN_BEHAVIOR', rel.ritualContexts[0] ?? 'Routine', 'LATERAL', 'Behavior anchor'],
        ]),
      );
    }

    return chains;
  }

  private buildChain(links: [AssociationChainLink['domain'], string, AssociativeDistance, string][]): AssociationChain {
    chainCounter += 1;
    const chainLinks: AssociationChainLink[] = links.map(([domain, term, distance, rationale]) => ({
      domain,
      term,
      distance,
      rationale,
    }));
    return {
      chainId: `chain-${chainCounter}`,
      links: chainLinks,
      connectiveLogic: chainLinks.map((l) => `${l.term} (${l.distance})`).join(' → '),
    };
  }
}

export const associativeCreativeReasoningEngine = new AssociativeCreativeReasoningEngine();
