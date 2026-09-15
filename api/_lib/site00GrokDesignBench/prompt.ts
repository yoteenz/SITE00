export const GROK_VISUAL_TRANSLATION_SYSTEM = `You are a senior interface designer reconstructing an existing UI in Figma.

CRITICAL:
- The attached image is the ONLY visual authority.
- Do NOT redesign, modernize, simplify, or invent a generic dashboard.
- Do NOT substitute SITE 00 or NDXBOOK section lists unless they are visibly present.
- COPY the visible design intelligence: composition, proportions, hierarchy, type, spacing, grids, alignment, color, borders, radii, surfaces, imagery, crops, weight, controls, states, density, and negative space.
- Return ONLY valid JSON matching the schema. No markdown. No prose outside JSON.

You are producing a FigmaStyleInterfaceTranslationPackage another implementation model could build without reinterpreting the source image.`;

export function buildGrokVisualTranslationUserPrompt(meta: {
  filename: string;
  width: number;
  height: number;
  mime: string;
  sha256: string;
}): string {
  return `Translate this uploaded golden interface reference into a complete Figma-style interface design package.

REFERENCE META
filename: ${meta.filename}
width: ${meta.width}
height: ${meta.height}
mime: ${meta.mime}
sha256: ${meta.sha256}

Return a single JSON object with EXACTLY these keys:

{
  "visualInterfacePreview": {
    "kind": "FIGMA_STYLE_ARTBOARD",
    "frameWidth": number,
    "frameHeight": number,
    "background": "#hex",
    "layers": [
      {
        "id": "string",
        "type": "rect|text|image|line|ellipse|group",
        "name": "string",
        "x": number, "y": number, "width": number, "height": number,
        "fill": "#hex optional",
        "stroke": "#hex optional",
        "strokeWidth": number,
        "radius": number,
        "opacity": number,
        "text": "string",
        "fontFamily": "string",
        "fontSize": number,
        "fontWeight": number,
        "letterSpacing": number,
        "lineHeight": number,
        "textAlign": "left|center|right",
        "textColor": "#hex",
        "textTransform": "none|uppercase|lowercase",
        "objectFit": "cover|contain|fill|none",
        "imageRole": "string",
        "zIndex": number
      }
    ],
    "notes": "string"
  },
  "pageFrameSpec": {
    "sourceViewportWidth": number,
    "sourceViewportHeight": number,
    "designFrameWidth": number,
    "designFrameHeight": number,
    "pageBackground": "#hex",
    "contentBounds": { "x": number, "y": number, "width": number, "height": number },
    "outerMargins": { "top": number, "right": number, "bottom": number, "left": number },
    "columnGrid": { "columns": number, "gutter": number, "margin": number },
    "gutters": number,
    "majorSectionPositions": [{ "id": "string", "name": "string", "x": number, "y": number, "width": number, "height": number }]
  },
  "sectionTree": {
    "id": "page",
    "name": "PAGE",
    "kind": "PAGE",
    "children": [{ "id": "string", "name": "string", "kind": "SECTION|GROUP|COMPONENT", "children": [] }]
  },
  "componentTree": [
    {
      "componentId": "string",
      "name": "string",
      "parentId": "string|null",
      "role": "string",
      "siblingOrder": number,
      "x": number, "y": number, "width": number, "height": number,
      "normalizedGeometry": { "x": 0-1, "y": 0-1, "width": 0-1, "height": 0-1 },
      "layoutBehavior": "string",
      "alignment": "string",
      "visualPriority": "PRIMARY|SECONDARY|TERTIARY|MUTED"
    }
  ],
  "layoutGeometrySpec": {
    "sectionDimensions": [{ "id": "string", "width": number, "height": number, "relativeWidth": number, "relativeHeight": number }],
    "rowColumnRelationships": ["string"],
    "gaps": { "section": number },
    "padding": { "page": number },
    "alignmentAnchors": ["string"],
    "nesting": ["string"],
    "repeatedDimensions": ["string"],
    "overlaps": ["string"],
    "positioningBehavior": "string"
  },
  "typographySystem": {
    "hierarchy": [{
      "id": "string", "role": "string", "fontCategory": "string", "size": number,
      "weight": number, "lineHeight": number, "tracking": "string", "casing": "string",
      "alignment": "string", "lineCount": number, "wrapBehavior": "string"
    }],
    "notes": "string"
  },
  "colorSystem": {
    "pageBackground": "#hex",
    "surfaceColors": ["#hex"],
    "primaryText": "#hex",
    "secondaryText": "#hex",
    "mutedText": "#hex",
    "accents": ["#hex"],
    "statusColors": ["#hex"],
    "bordersDividers": ["#hex"],
    "sampled": true
  },
  "spacingSystem": {
    "outerMargin": number,
    "sectionGap": number,
    "panelPadding": number,
    "componentGaps": number,
    "inlineGaps": number,
    "metadataSpacing": number,
    "denseRegions": ["string"],
    "openRegions": ["string"]
  },
  "borderRadiusSurfaceSystem": {
    "borderWidths": [number],
    "borderColors": ["#hex"],
    "radii": [number],
    "surfaceHierarchy": ["string"],
    "fills": ["#hex"],
    "shadows": ["string"],
    "separators": ["string"],
    "selectedActiveSurfaces": ["string"]
  },
  "assetPlacementMap": [{
    "assetId": "string",
    "assetRole": "string",
    "componentAssociation": "string",
    "targetBounds": { "x": number, "y": number, "width": number, "height": number },
    "aspectRatio": "string",
    "crop": "string",
    "focalPosition": "string",
    "objectFit": "string",
    "framing": "string"
  }],
  "controlStateSystem": [{
    "controlId": "string",
    "name": "string",
    "states": ["PRIMARY|SECONDARY|TERTIARY|SELECTED|ACTIVE|DISABLED|LOCKED|NEUTRAL"],
    "visibleSupport": "string"
  }],
  "visualHierarchyMap": {
    "firstVisualFocus": "string",
    "secondVisualFocus": "string",
    "tertiaryInformation": "string",
    "dominantRegions": ["string"],
    "subordinateRegions": ["string"],
    "highContrastAnchors": ["string"],
    "visualWeightRelationships": ["string"]
  },
  "implementationHandoff": {
    "title": "GrokComposerImplementationHandoff",
    "summary": "string",
    "buildOrder": ["string"],
    "componentImplementationNotes": ["string"],
    "layoutNotes": ["string"],
    "typographyNotes": ["string"],
    "colorNotes": ["string"],
    "assetNotes": ["string"],
    "stateNotes": ["string"],
    "doNotReinterpret": ["string"],
    "acceptanceChecks": ["string"]
  },
  "doNotChangeRules": {
    "rules": ["section ordering", "proportions", "other visible invariants"]
  }
}

LAYER RULES
- visualInterfacePreview.layers must be dense enough that a Figma-style artboard renderer can show the interface without the source image.
- Include every meaningful visible region: chrome, nav, headlines, imagery, cards, metadata, controls, dividers.
- Coordinates are in source pixels. frameWidth/frameHeight must match the reference.
- Sample visible colors. Do not invent a new palette.
- Control states only when visibly supported.
- implementationHandoff must be precise enough that an implementation agent does not redesign.`;
}
