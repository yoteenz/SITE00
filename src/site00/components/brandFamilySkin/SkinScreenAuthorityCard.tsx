/**
 * Authority card — post-registration screen authority status + actions.
 */

import { implementScreenAuthority } from './brandFamilySkinApi.js';

type AuthorityCard = {
  screenType: string;
  moduleId: string;
  viewport: string;
  version: string;
  authorityMode: string;
  fidelityMode: string;
  status: string;
  implementationStatus: string;
  visualMatchStatus: string;
  referenceAssetId: string | null;
};

type Props = {
  brandFamilySkinId: string;
  projectId: string;
  card: AuthorityCard;
  onImplement: () => void;
  onReplace: () => void;
};

export function SkinScreenAuthorityCard({ brandFamilySkinId, projectId, card, onImplement, onReplace }: Props) {
  async function handleImplement() {
    await implementScreenAuthority({
      brandFamilySkinId,
      moduleId: card.moduleId,
      screenType: card.screenType,
      viewport: card.viewport as 'MOBILE' | 'DESKTOP' | 'TABLET',
      projectId,
    });
    onImplement();
  }

  return (
    <article className="site00-bfs-authority-card" data-status={card.status}>
      <header>
        <strong>{card.screenType.replace(/_/g, ' ')}</strong>
        <span>{card.viewport}</span>
      </header>
      <p className="site00-bfs-authority-card__mode">
        {card.authorityMode.replace(/_/g, ' ')} · {card.fidelityMode}
      </p>
      <dl>
        <div>
          <dt>STATUS</dt>
          <dd>{card.status}</dd>
        </div>
        <div>
          <dt>IMPLEMENTATION</dt>
          <dd>{card.implementationStatus.replace(/_/g, ' ')}</dd>
        </div>
        <div>
          <dt>VISUAL MATCH</dt>
          <dd>{card.visualMatchStatus.replace(/_/g, ' ')}</dd>
        </div>
        <div>
          <dt>VERSION</dt>
          <dd>{card.version}</dd>
        </div>
      </dl>
      <div className="site00-bfs-authority-card__actions">
        {card.referenceAssetId ? (
          <button type="button" className="site00-bfs-authority-card__view">
            VIEW REFERENCE
          </button>
        ) : null}
        <button type="button" className="site00-bfs-authority-card__implement" onClick={() => void handleImplement()}>
          IMPLEMENT
        </button>
        <button type="button" className="site00-bfs-authority-card__replace" onClick={onReplace}>
          REPLACE AUTHORITY
        </button>
      </div>
    </article>
  );
}
