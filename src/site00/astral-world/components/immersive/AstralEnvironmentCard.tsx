import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AstralScene } from './AstralScene';
import type { ReferenceCropKey } from '../../../../../shared/site00-astral-world/referenceCropRegistry.js';
import { AstralPortraitRow } from './AstralPortrait';

type AstralEnvironmentCardProps = {
  crop: ReferenceCropKey;
  title: string;
  descriptor: string;
  to: string;
  cta: string;
  accent?: 'suite' | 'mall' | 'coffee';
  activity?: string;
  people?: { id: string; name: string; initials?: string }[];
  children?: ReactNode;
  minHeight?: number;
};

export function AstralEnvironmentCard({
  crop,
  title,
  descriptor,
  to,
  cta,
  accent,
  activity,
  people,
  children,
  minHeight = 220,
}: AstralEnvironmentCardProps) {
  return (
    <Link
      to={to}
      className={`aw-env-card${accent ? ` aw-env-card--${accent}` : ''}`}
    >
      <AstralScene crop={crop} className="aw-env-card__scene" minHeight={minHeight}>
        <div className="aw-env-card__plate">
          <h3 className="aw-display">{title}</h3>
          <p className="aw-muted">{descriptor}</p>
          {activity ? <p className="aw-env-card__activity">{activity}</p> : null}
          {children}
          <span className="aw-btn-primary aw-env-card__cta">{cta}</span>
          {people && people.length > 0 ? <AstralPortraitRow people={people} size={32} /> : null}
        </div>
      </AstralScene>
    </Link>
  );
}
