# P0.STUDIOOS.PRODUCTION.OPENART-ASSET-FORENSICS.MOUNT1

Forensic mount of Production visual sources. No new OpenArt generations.

## Architecture

- Runtime paths: `src/site00/productionAssets/productionAssetRegistry.ts` (`productionAssetPaths`, re-exported as `AUTHORITY_ASSETS`).
- Route slots: `src/site00/productionAssets/routeAssetManifests.ts`.
- Provenance table (not a public UI): `public/site00/production-authority-assets/SOURCE.md`.
- OpenArt project: `Q7IHYCEK3RPn2c1ConEG` (SITE00 DESIGN Unified Creative Environment).

## What was retrieved

- Confirmed existing history `VGvorDOJjL2Unqkf1q5R` (design atrium) via read-only `creation_get`. No generate/regenerate.
- Sampled 100 recent image histories: all LIBRARY responsive composition boards. Classified as composition authority, not discrete vault plates.
- Reused GROK1 files already in `public/site00/production-authority-assets/` (16 generated plates + 3 hub hero crops).
- Reused design-pack extracts and seven bottom-nav master PNGs.
- Nav masters: runtime canon is the PNG; OpenArt history id is **not** in repo (`SOURCE_MATCH_UNCERTAIN` for provider lineage only).

## Not dumped

Full OpenArt project was not copied into the repo.

## Recovery 2

Design project `Q7IHYCEK3RPn2c1ConEG` creation list paginated until `hasMore: false`.

- Unique histories in that list: 462
- Oldest `createdAt`: 1790911331848
- Newest `createdAt`: 1791090384443
- Related resident projects (not the design project) were listed separately. Approved-portrait uploads mounted for Etta, Jules, Caspian, Iona. Zuri file is labeled identity candidate only.
- No workspace project exists for Noa Kline, Marlowe Saint, or Elio Vahn.
- The 16 GROK1 history ids in SOURCE.md did not reappear in this paginated list. Atrium id was confirmed earlier with creation_get. Treat that as a list-window gap, not as permission to regenerate.
- Inbox project thumbnails: `NO_SOURCE_ASSET_REQUIRED` for the current data-driven root.
- Nav PNGs: `UNKNOWN_OPENART_PROVENANCE`. Files stay canonical.
