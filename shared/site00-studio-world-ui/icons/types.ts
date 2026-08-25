import type { NdxIconSizeToken } from './tokens.js';
import type { NdxIconTraceClassification, NdxIconVisualMatchStatus, NdxIconVisualVersion, IconOpticalCalibration, NdxIconActiveBehavior } from './p0ui3a/types.js';

export type NDXIconState = 'active' | 'inactive';

export type NDXIconName =
  | 'overview'
  | 'campaigns'
  | 'content_ops'
  | 'lab'
  | 'more'
  | 'ellipsis'
  | 'project_overview'
  | 'project_settings'
  | 'back_to_projects'
  | 'return_to_origin'
  | 'inspect'
  | 'help'
  | 'notifications'
  | 'experiments_hub'
  | 'campaign_board'
  | 'cultural_intelligence'
  | 'character_lab'
  | 'performance_learning'
  | 'archive'
  | 'projects'
  | 'origin';

export type NdxIconPathDef = {
  d: string;
  opacity?: number;
};

export type NdxIconCircleDef = {
  cx: number;
  cy: number;
  r: number;
  fill?: 'currentColor' | 'none';
  opacity?: number;
};

export type NdxIconDefinition = {
  name: NDXIconName;
  paths: NdxIconPathDef[];
  circles?: NdxIconCircleDef[];
  /** Host canon — reuse drawing, never hardcode NDX lime in SVG */
  hostCanonical?: boolean;
  /** P0.UI.3A reference trace metadata */
  visualVersion?: NdxIconVisualVersion;
  traceClassification?: NdxIconTraceClassification;
  visualMatchStatus?: NdxIconVisualMatchStatus;
  referenceSampleId?: string;
  strokeWidth?: number;
  optical?: IconOpticalCalibration;
  activeBehavior?: NdxIconActiveBehavior;
  supersededGeometryId?: string;
};

export type NDXIconProps = {
  name: NDXIconName;
  size?: number | NdxIconSizeToken;
  strokeWidth?: number;
  state?: NDXIconState;
  className?: string;
  ariaLabel?: string;
  decorative?: boolean;
};
