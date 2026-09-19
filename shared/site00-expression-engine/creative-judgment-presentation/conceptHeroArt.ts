/**
 * P0.CJ.2V — Concept hero symbol / visual treatment registry.
 */

export type ConceptHeroArt = {
  symbolLines: string[];
  artClass: string;
  aspect: '16-9' | '4-5' | 'poster' | 'square';
  pendingLabel: string;
};

const REGISTRY: Record<string, ConceptHeroArt> = {
  'savor-celeste-private-room': {
    symbolLines: ['◌', 'PRIVATE', 'ROOM'],
    artClass: 'is-savor-celeste',
    aspect: '4-5',
    pendingLabel: 'CONCEPT VISUAL PENDING · FRAGRANCE CHAMBER',
  },
  'territory-entry-003-door': {
    symbolLines: ['▣', 'EMPLOYEE', 'ONLY DOOR'],
    artClass: 'is-ndx-door',
    aspect: '16-9',
    pendingLabel: 'CONCEPT VISUAL PENDING · BACK-OF-HOUSE ACCESS',
  },
  'verdant-spring-rescue': {
    symbolLines: ['◈', 'LEAF', 'DIAGNOSTIC'],
    artClass: 'is-verdant-leaf',
    aspect: 'square',
    pendingLabel: 'CONCEPT VISUAL PENDING · BOTANICAL RECEIPT',
  },
  'territory-sleep-debt-archive': {
    symbolLines: ['⌁', 'SLEEP DEBT', 'ARCHIVE'],
    artClass: 'is-sleep-archive',
    aspect: 'poster',
    pendingLabel: 'CONCEPT VISUAL PENDING · REST RECEIPT STRIP',
  },
};

export function resolveConceptHeroArt(conceptId: string, fallbackTitle: string): ConceptHeroArt {
  return (
    REGISTRY[conceptId] ?? {
      symbolLines: ['◌', fallbackTitle.slice(0, 12).toUpperCase()],
      artClass: 'is-default',
      aspect: '16-9',
      pendingLabel: 'CONCEPT VISUAL PENDING',
    }
  );
}
