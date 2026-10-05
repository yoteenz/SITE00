/**
 * P0.VR.DESIGN.GROK-PROJECT-TAB-ASSETS1 — destination / action marks.
 *
 * The component names stay what Opus wired (PsIcon*). The drawings now come
 * from the staged project-tab catalog so hamburger, action bars and More
 * modules share one family with the rest of the support pack.
 */

import { PTV_ICON_BY_PS, type ProjectTabIconId } from '../../../../../../shared/site00-design-workspace-production/designProjectTabVisuals.js';
import { ProjectTabIcon } from './ProjectTabIcon';

type IconProps = { className?: string };

function mark(name: ProjectTabIconId) {
  return function Icon({ className }: IconProps) {
    return <ProjectTabIcon name={name} className={className} />;
  };
}

export const PsIconHome = mark(PTV_ICON_BY_PS.PsIconHome);
export const PsIconGrid = mark(PTV_ICON_BY_PS.PsIconGrid);
export const PsIconDoc = mark(PTV_ICON_BY_PS.PsIconDoc);
export const PsIconImage = mark(PTV_ICON_BY_PS.PsIconImage);
export const PsIconLink = mark(PTV_ICON_BY_PS.PsIconLink);
export const PsIconLayers = mark(PTV_ICON_BY_PS.PsIconLayers);
export const PsIconPalette = mark(PTV_ICON_BY_PS.PsIconPalette);
export const PsIconClock = mark(PTV_ICON_BY_PS.PsIconClock);
export const PsIconUpload = mark(PTV_ICON_BY_PS.PsIconUpload);
export const PsIconSearch = mark(PTV_ICON_BY_PS.PsIconSearch);
export const PsIconCompare = mark(PTV_ICON_BY_PS.PsIconCompare);
export const PsIconChart = mark(PTV_ICON_BY_PS.PsIconChart);
export const PsIconPlus = mark(PTV_ICON_BY_PS.PsIconPlus);
export const PsIconCheck = mark(PTV_ICON_BY_PS.PsIconCheck);
export const PsIconFilter = mark(PTV_ICON_BY_PS.PsIconFilter);
export const PsIconBox = mark(PTV_ICON_BY_PS.PsIconBox);
export const PsIconBell = mark(PTV_ICON_BY_PS.PsIconBell);
export const PsIconSliders = mark(PTV_ICON_BY_PS.PsIconSliders);
export const PsIconMonitor = mark(PTV_ICON_BY_PS.PsIconMonitor);
export const PsIconExit = mark(PTV_ICON_BY_PS.PsIconExit);
export const PsIconUser = mark(PTV_ICON_BY_PS.PsIconUser);
export const PsIconShield = mark(PTV_ICON_BY_PS.PsIconShield);
export const PsIconArchive = mark(PTV_ICON_BY_PS.PsIconArchive);

export { ProjectTabIcon };
