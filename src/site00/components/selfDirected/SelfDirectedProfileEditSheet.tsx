import { useEffect } from 'react';
import { useSite00MobileViewport } from '../../hooks/useSite00MobileViewport';

type SelfDirectedProfileEditSheetProps = {
  open: boolean;
  displayName: string;
  onClose: () => void;
  onSave?: (name: string) => void;
};

export function SelfDirectedProfileEditSheet({
  open,
  displayName,
  onClose,
  onSave,
}: SelfDirectedProfileEditSheetProps) {
  const isMobile = useSite00MobileViewport();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const panel = (
    <div
      className={`site00-sd-profile-edit${isMobile ? ' site00-sd-profile-edit--sheet' : ' site00-sd-profile-edit--modal'}`}
      role="dialog"
      aria-labelledby="sd-profile-edit-title"
    >
      <header className="site00-sd-profile-edit__header">
        <h2 id="sd-profile-edit-title">EDIT PROFILE</h2>
        <button type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>
      <form
        className="site00-sd-profile-edit__form"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get('displayName') ?? displayName);
          onSave?.(name);
          onClose();
        }}
      >
        <label>
          DISPLAY NAME
          <input name="displayName" defaultValue={displayName} />
        </label>
        <label>
          CREATOR TAGLINE
          <input name="tagline" defaultValue="IDEAS MOVE DIFFERENTLY." />
        </label>
        <div className="site00-sd-profile-edit__actions">
          <button type="button" className="site00-sd-profile-edit__cancel" onClick={onClose}>
            CANCEL
          </button>
          <button type="submit" className="site00-sd-profile-edit__save">
            SAVE →
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="site00-sd-profile-edit__backdrop" onClick={onClose} role="presentation">
      <div onClick={(e) => e.stopPropagation()}>{panel}</div>
    </div>
  );
}
