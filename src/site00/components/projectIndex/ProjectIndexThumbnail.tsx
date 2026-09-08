import { resolveProjectIndexVisual } from '../../../../shared/site00-projects/projectIndexVisual.js';
import type { ProjectIndexItem } from '../../../../shared/site00-projects/projectIndexItem.js';

type ProjectIndexThumbnailProps = {
  item: ProjectIndexItem;
  className?: string;
};

export function ProjectIndexThumbnail({ item, className = '' }: ProjectIndexThumbnailProps) {
  const visual = resolveProjectIndexVisual(item.projectId, item.projectName);

  if (item.projectImage) {
    return (
      <div className={`site00-pidx-thumb ${className}`.trim()}>
        <img src={item.projectImage} alt="" className="site00-pidx-thumb__img" loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={`site00-pidx-thumb site00-pidx-thumb--initials ${className}`.trim()}
      style={{ ['--pidx-accent' as string]: visual.accent, ['--pidx-accent-bg' as string]: visual.accentBg }}
      aria-hidden="true"
    >
      <span className="site00-pidx-thumb__initials">{item.projectInitials}</span>
    </div>
  );
}
