import { Link } from 'react-router-dom';
import type { FastTravelContext, FastTravelDestination, FastTravelSection as FastTravelSectionModel } from '../../config/fast-travel';
import { resolveFastTravelHref } from '../../config/fast-travel';
import { AuthLockedDestination } from './AuthLockedDestination';

type FastTravelSectionProps = {
  section: FastTravelSectionModel;
  ctx: FastTravelContext;
  onNavigate: () => void;
};

function FastTravelDestinationLink({
  dest,
  ctx,
  onNavigate,
  variant,
}: {
  dest: FastTravelDestination;
  ctx: FastTravelContext;
  onNavigate: () => void;
  variant: 'primary' | 'list';
}) {
  const href = resolveFastTravelHref(dest, ctx);
  const locked = dest.requiresAuth && !ctx.isSignedIn;

  if (locked) {
    return (
      <AuthLockedDestination href={href} label={dest.label} description={dest.description} onNavigate={onNavigate} />
    );
  }

  return (
    <Link
      to={href}
      className={`site00-fast-travel__dest site00-fast-travel__dest--${variant}`}
      onClick={onNavigate}
      aria-label={dest.description ? `${dest.label} — ${dest.description}` : dest.label}
    >
      <span className="site00-fast-travel__dest-label">{dest.label}</span>
      {dest.description ? <span className="site00-fast-travel__dest-desc">{dest.description}</span> : null}
    </Link>
  );
}

export function FastTravelSection({ section, ctx, onNavigate }: FastTravelSectionProps) {
  const isUpNext = section.id === 'up-next';

  return (
    <section className="site00-fast-travel__section" aria-label={section.title}>
      <h3 className="site00-fast-travel__section-title">{section.title}</h3>
      <div className={`site00-fast-travel__section-body ${isUpNext ? 'site00-fast-travel__section-body--grid' : ''}`.trim()}>
        {section.destinations.map((dest) => (
          <FastTravelDestinationLink
            key={dest.id}
            dest={dest}
            ctx={ctx}
            onNavigate={onNavigate}
            variant={isUpNext ? 'primary' : 'list'}
          />
        ))}
      </div>
    </section>
  );
}
