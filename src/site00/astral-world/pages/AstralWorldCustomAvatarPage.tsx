import { useState } from 'react';
import { PROTOTYPE_AVATAR_OPTIONS } from '../../../../shared/site00-astral-world/fixtures.js';

export default function AstralWorldCustomAvatarPage() {
  const [style, setStyle] = useState<string>(PROTOTYPE_AVATAR_OPTIONS[0] ?? 'Celestial');
  return (
    <div className="aw-mobile-screen">
      <h1 className="aw-display">Custom Avatar</h1>
      <section className="aw-card aw-card--gold">
        <p className="aw-muted">Prototype customization — full avatar engine reserved for later.</p>
        <div className="aw-avatar" style={{ width: 80, height: 80, fontSize: '2rem', margin: '1rem auto' }} aria-hidden>✦</div>
        <div className="aw-chips">
          {PROTOTYPE_AVATAR_OPTIONS.map((opt) => (
            <button key={opt} type="button" className={`aw-chip${style === opt ? ' aw-tab--active' : ''}`} onClick={() => setStyle(opt)}>{opt}</button>
          ))}
        </div>
        <p className="aw-muted" style={{ marginTop: '0.75rem' }}>Selected: {style} style</p>
        <p className="aw-muted" style={{ fontSize: '0.65rem' }}>Future: photo-to-avatar, outfits, identity items</p>
      </section>
    </div>
  );
}
