import { useState } from 'react';
import { PROTOTYPE_AVATAR_OPTIONS } from '../../../../shared/site00-astral-world/fixtures.js';
import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralScene } from '../components/immersive/AstralScene';
import { AstralPortrait } from '../components/immersive/AstralPortrait';

export default function AstralWorldCustomAvatarPage() {
  const { demoSession } = useAstralWorld();
  const [style, setStyle] = useState<string>(PROTOTYPE_AVATAR_OPTIONS[0] ?? 'Celestial');
  return (
    <div className="aw-mobile-screen">
      <AstralScene crop="CUSTOM_AVATAR" minHeight={240}>
        <h1 className="aw-display" style={{ margin: 0 }}>Custom Avatar</h1>
        <p className="aw-muted">Shape how you appear in Astral World</p>
      </AstralScene>
      <section className="aw-card aw-card--gold" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <AstralPortrait personId={demoSession.userId} name={demoSession.displayName} initials={demoSession.displayName[0]} size={80} />
        </div>
        <p className="aw-muted">Prototype customization — full avatar engine reserved for later.</p>
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
