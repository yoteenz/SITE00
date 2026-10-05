# Family 1 asset-first methodology

Permanent method after `P0.SITE00.FAMILY1.ASSET-FIRST.VISUAL-SEMANTIC-DECOMPOSITION.CORRECTION2`.

ASSET-FIRST
+ VISUAL-SEMANTIC DECOMPOSITION
+ MINIMUM NECESSARY ASSETS
+ LIVE-UI SEPARATION
+ LAYER-AWARE COMPOSITING

This replaces object-by-object decomposition.

## Order

1. Reference
2. Semantic region detection
3. Layer classification (`FAMILY1_PARENT_LAYER_MAP.json`)
4. Minimum-asset optimization
5. Asset manifest
6. Generate only regions marked `needs_generation`
7. Register
8. Live structure
9. Media
10. Live text
11. Live controls
12. QA

## Roles

Each region gets one role: live text, live control, structural UI, panel or surface, thumbnail or media slot, environment plate, independent visual asset, layered decorative asset, interactive stateful asset, effect or rendering treatment, or not an asset.

Text and controls stay in HTML. A static room, including plants, books, stone, fabric, and sunlight, is one environment plate unless a piece must move, change state, be reused alone, or overlap live UI on its own layer.

Do not generate a panel, a button, or a headline as an image.

## Resolution

Generated environment plates use OpenArt `resolutionTier: 4k` (GPT Image 2.5 Sunburst, 9:16, quality high). That setting delivers **2016×3584**. The OpenArt gallery labels this file **3K** because the long edge is 3584. Use this setting for environment plates and other generated image assets. Do not use the 2k tier for plates.
