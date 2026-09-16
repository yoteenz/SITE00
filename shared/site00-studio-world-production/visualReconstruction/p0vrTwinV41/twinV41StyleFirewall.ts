import type { TwinV41ProjectStyleFirewall } from './twinV41Types.js';

/** Client-safe constants — do not import compileTwinV41PixelExtraction from UI (pulls raster pipeline). */
export const TWIN_V41_PROJECT_STYLE_FIREWALL: TwinV41ProjectStyleFirewall = {
  forbidNdxbookDarkTheme: true,
  forbidLimePageBackground: true,
  forbidV3ImplementationCards: true,
  forbidProjectPanelStyling: true,
};
