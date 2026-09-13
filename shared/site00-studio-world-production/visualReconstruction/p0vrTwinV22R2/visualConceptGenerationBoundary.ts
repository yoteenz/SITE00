/** Prompt contract: client canvas only — host shell applied by product. */
export const TWIN_V2_CLIENT_CANVAS_GENERATION_BOUNDARY = `Design only the NDXBOOK client canvas that sits inside the existing SITE 00 host shell.

Do not generate, redesign, replace, or invent SITE 00 global host navigation, global header controls, account controls, persistent bottom navigation, device chrome, or browser chrome.

SITE 00 host chrome will be applied by the product outside your generated canvas.`.trim();

export function appendClientCanvasBoundaryToPrompt(prompt: string): string {
  return `${prompt}\n\n${TWIN_V2_CLIENT_CANVAS_GENERATION_BOUNDARY}`;
}

export type TwinV2VisualGenerationContract = {
  clientCanvasOnly: boolean;
  boundaryText: string;
};

export function defaultTwinV2VisualGenerationContract(): TwinV2VisualGenerationContract {
  return {
    clientCanvasOnly: true,
    boundaryText: TWIN_V2_CLIENT_CANVAS_GENERATION_BOUNDARY,
  };
}
