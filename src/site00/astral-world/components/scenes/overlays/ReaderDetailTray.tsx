import { useAstralWorld } from '../../../context/AstralWorldContext';
import { AstralPortrait } from '../../immersive/AstralPortrait';
import { AstralStatusChip } from '../../immersive/AstralStatusChip';

type ReaderDetailTrayProps = {
  readerId: string | null;
  onClose: () => void;
  onGo: (destination: string) => void;
};

/** Reader detail as brass placard tray — world remains visible */
export function ReaderDetailTray({ readerId, onClose, onGo }: ReaderDetailTrayProps) {
  const { readers, toggleFavoriteReader } = useAstralWorld();
  const reader = readerId ? readers.find((r) => r.id === readerId) : null;

  if (!reader) return null;

  return (
    <div className="aw-reader-tray-root" role="presentation">
      <button type="button" className="aw-reader-tray-backdrop" aria-label="Close reader detail" onClick={onClose} />
      <div className="aw-reader-tray" role="dialog" aria-modal="true" aria-label={reader.name}>
        <div className="aw-reader-tray__plate">
          <div className="aw-reader-tray__ornament" aria-hidden />
          <div className="aw-reader-detail-head">
            <AstralPortrait personId={reader.id} name={reader.name} initials={reader.avatarInitials} size={72} showPresence variant="reader" />
            <div>
              <h2 className="aw-display">{reader.name}</h2>
              <p className="aw-muted">{reader.specialty} · ★ {reader.rating}</p>
              <AstralStatusChip label={reader.presence.replace(/_/g, ' ')} kind={reader.presence === 'READING_NOW' ? 'reading' : 'available'} />
            </div>
          </div>
          <p className="aw-muted">Currently: {reader.currentDestination?.replace(/-/g, ' ') ?? 'Offline'}</p>
          {reader.currentDestination ? (
            <button type="button" className="aw-btn-primary" onClick={() => onGo(reader.currentDestination!)}>Go to Them</button>
          ) : null}
          <button
            type="button"
            className={`aw-world-action${reader.isFavorite ? ' aw-world-action--active' : ''}`}
            onClick={() => toggleFavoriteReader(reader.id)}
          >
            {reader.isFavorite ? '★ Favorited' : '☆ Favorite'}
          </button>
        </div>
      </div>
    </div>
  );
}
