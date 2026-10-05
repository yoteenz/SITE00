# download_production_authorities.ps1
# SITE 00 — Production responsive authority export (242 records)
# OpenArt project: Q7IHYCEK3RPn2c1ConEG — forensic retrieval only (no generation)
# Generated: 2026-10-04T13:22:44Z

$ErrorActionPreference = 'Stop'
$MaxAttempts = 3
$RetryDelaySec = 2
$Root = Join-Path $PSScriptRoot 'PRODUCTION_AUTHORITY_EXPORT'

$Expected = @{
  'Experience Mobile' = 46
  'Experience Desktop/Tablet' = 46
  'Library Mobile' = 75
  'Library Desktop/Tablet' = 75
}

$Assets = @(
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077797731_aee19a64.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/01_World/01_WORLD_ROOT.png'
    Meta = 'experience|mobile|WORLD|WORLD ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078149253_25404194.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/01_World/01_WORLD_ROOT.png'
    Meta = 'experience|desktop_tablet|WORLD|WORLD ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077800998_3df8a79d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/01_World/02_WORLD_OVERVIEW.png'
    Meta = 'experience|mobile|WORLD|WORLD OVERVIEW'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078158762_47aff42f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/01_World/02_WORLD_OVERVIEW.png'
    Meta = 'experience|desktop_tablet|WORLD|WORLD OVERVIEW'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077803227_aa8c59f4.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/01_World/03_ARCHITECTURE.png'
    Meta = 'experience|mobile|WORLD|ARCHITECTURE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078160917_af79b9f6.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/01_World/03_ARCHITECTURE.png'
    Meta = 'experience|desktop_tablet|WORLD|ARCHITECTURE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077810204_6204daef.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/01_World/04_ENVIRONMENTS.png'
    Meta = 'experience|mobile|WORLD|ENVIRONMENTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078181474_e9397b68.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/01_World/04_ENVIRONMENTS.png'
    Meta = 'experience|desktop_tablet|WORLD|ENVIRONMENTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077812700_8de37c50.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/01_World/05_DESTINATIONS.png'
    Meta = 'experience|mobile|WORLD|DESTINATIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078168055_fe7490da.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/01_World/05_DESTINATIONS.png'
    Meta = 'experience|desktop_tablet|WORLD|DESTINATIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077815112_ab669ca3.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/01_World/06_WORLD_DETAIL.png'
    Meta = 'experience|mobile|WORLD|WORLD DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078176436_ee0288cd.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/01_World/06_WORLD_DETAIL.png'
    Meta = 'experience|desktop_tablet|WORLD|WORLD DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077817217_26f00f36.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/02_Zones/01_ZONES_ROOT.png'
    Meta = 'experience|mobile|ZONES|ZONES ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078179461_5435f05c.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/02_Zones/01_ZONES_ROOT.png'
    Meta = 'experience|desktop_tablet|ZONES|ZONES ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077822026_fc40fd6e.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/02_Zones/02_ZONE_INDEX.png'
    Meta = 'experience|mobile|ZONES|ZONE INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078188547_d8e91b0b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/02_Zones/02_ZONE_INDEX.png'
    Meta = 'experience|desktop_tablet|ZONES|ZONE INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077824589_9b3aad5c.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/02_Zones/03_ROOMS.png'
    Meta = 'experience|mobile|ZONES|ROOMS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078194212_56099213.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/02_Zones/03_ROOMS.png'
    Meta = 'experience|desktop_tablet|ZONES|ROOMS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077830133_ed946954.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/02_Zones/04_DISTRICTS.png'
    Meta = 'experience|mobile|ZONES|DISTRICTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078197932_cde3b725.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/02_Zones/04_DISTRICTS.png'
    Meta = 'experience|desktop_tablet|ZONES|DISTRICTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077833157_26b5c11d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/02_Zones/05_PORTALS.png'
    Meta = 'experience|mobile|ZONES|PORTALS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078209534_52396dec.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/02_Zones/05_PORTALS.png'
    Meta = 'experience|desktop_tablet|ZONES|PORTALS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077837892_efe658dd.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/02_Zones/06_THRESHOLDS.png'
    Meta = 'experience|mobile|ZONES|THRESHOLDS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078223687_bd9a956d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/02_Zones/06_THRESHOLDS.png'
    Meta = 'experience|desktop_tablet|ZONES|THRESHOLDS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077840221_6cdf0819.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/02_Zones/07_ZONE_DETAIL.png'
    Meta = 'experience|mobile|ZONES|ZONE DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078209735_5f40926f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/02_Zones/07_ZONE_DETAIL.png'
    Meta = 'experience|desktop_tablet|ZONES|ZONE DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077848375_d5ee896f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/03_Paths/01_PATHS_ROOT.png'
    Meta = 'experience|mobile|PATHS|PATHS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078217950_06450ad2.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/03_Paths/01_PATHS_ROOT.png'
    Meta = 'experience|desktop_tablet|PATHS|PATHS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077847788_fab9fc5a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/03_Paths/02_PATHWAYS.png'
    Meta = 'experience|mobile|PATHS|PATHWAYS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078224049_f4092992.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/03_Paths/02_PATHWAYS.png'
    Meta = 'experience|desktop_tablet|PATHS|PATHWAYS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077851033_9639aa06.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/03_Paths/03_ROUTE_MAP.png'
    Meta = 'experience|mobile|PATHS|ROUTE MAP'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078229305_24c012eb.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/03_Paths/03_ROUTE_MAP.png'
    Meta = 'experience|desktop_tablet|PATHS|ROUTE MAP'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077856503_ed393114.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/03_Paths/04_ENTRY_PATHS.png'
    Meta = 'experience|mobile|PATHS|ENTRY PATHS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078235636_cee0b02e.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/03_Paths/04_ENTRY_PATHS.png'
    Meta = 'experience|desktop_tablet|PATHS|ENTRY PATHS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077863458_3606d3d6.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/03_Paths/05_EXIT_PATHS.png'
    Meta = 'experience|mobile|PATHS|EXIT PATHS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078237466_696b6c4a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/03_Paths/05_EXIT_PATHS.png'
    Meta = 'experience|desktop_tablet|PATHS|EXIT PATHS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077863642_3848b9ce.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/03_Paths/06_JOURNEY_DETAIL.png'
    Meta = 'experience|mobile|PATHS|JOURNEY DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078247573_c734da2a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/03_Paths/06_JOURNEY_DETAIL.png'
    Meta = 'experience|desktop_tablet|PATHS|JOURNEY DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077902466_8cf08e7b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/04_Interactions/01_INTERACTIONS_ROOT.png'
    Meta = 'experience|mobile|INTERACTIONS|INTERACTIONS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078271364_f9a64d33.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/04_Interactions/01_INTERACTIONS_ROOT.png'
    Meta = 'experience|desktop_tablet|INTERACTIONS|INTERACTIONS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077907216_8b4c2f25.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/04_Interactions/02_INTERACTION_INDEX.png'
    Meta = 'experience|mobile|INTERACTIONS|INTERACTION INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078270655_2c26ab87.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/04_Interactions/02_INTERACTION_INDEX.png'
    Meta = 'experience|desktop_tablet|INTERACTIONS|INTERACTION INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077911166_02a2785e.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/04_Interactions/03_OBJECT_INTERACTIONS.png'
    Meta = 'experience|mobile|INTERACTIONS|OBJECT INTERACTIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078279545_4253b623.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/04_Interactions/03_OBJECT_INTERACTIONS.png'
    Meta = 'experience|desktop_tablet|INTERACTIONS|OBJECT INTERACTIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077914566_803d500d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/04_Interactions/04_SPATIAL_ACTIONS.png'
    Meta = 'experience|mobile|INTERACTIONS|SPATIAL ACTIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078282654_0ce6a277.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/04_Interactions/04_SPATIAL_ACTIONS.png'
    Meta = 'experience|desktop_tablet|INTERACTIONS|SPATIAL ACTIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077919411_6653cf8d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/04_Interactions/05_TRIGGERS.png'
    Meta = 'experience|mobile|INTERACTIONS|TRIGGERS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078289379_ee2d0cd9.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/04_Interactions/05_TRIGGERS.png'
    Meta = 'experience|desktop_tablet|INTERACTIONS|TRIGGERS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077923422_81359e23.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/04_Interactions/06_INTERACTION_DETAIL.png'
    Meta = 'experience|mobile|INTERACTIONS|INTERACTION DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078292129_bd66c8db.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/04_Interactions/06_INTERACTION_DETAIL.png'
    Meta = 'experience|desktop_tablet|INTERACTIONS|INTERACTION DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077924375_cee7c49f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/05_Inhabitants/01_INHABITANTS_ROOT.png'
    Meta = 'experience|mobile|INHABITANTS|INHABITANTS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078310155_3e305cc1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/05_Inhabitants/01_INHABITANTS_ROOT.png'
    Meta = 'experience|desktop_tablet|INHABITANTS|INHABITANTS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077930471_c5eb2fe3.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/05_Inhabitants/02_INHABITANT_INDEX.png'
    Meta = 'experience|mobile|INHABITANTS|INHABITANT INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078300313_9a9e5a6f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/05_Inhabitants/02_INHABITANT_INDEX.png'
    Meta = 'experience|desktop_tablet|INHABITANTS|INHABITANT INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077937625_1520e3a4.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/05_Inhabitants/03_RESIDENTS.png'
    Meta = 'experience|mobile|INHABITANTS|RESIDENTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078310967_de47fbfb.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/05_Inhabitants/03_RESIDENTS.png'
    Meta = 'experience|desktop_tablet|INHABITANTS|RESIDENTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077939439_f4c90c87.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/05_Inhabitants/04_CHARACTERS.png'
    Meta = 'experience|mobile|INHABITANTS|CHARACTERS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078309271_689d0b58.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/05_Inhabitants/04_CHARACTERS.png'
    Meta = 'experience|desktop_tablet|INHABITANTS|CHARACTERS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077943395_52c68867.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/05_Inhabitants/05_PRESENCE.png'
    Meta = 'experience|mobile|INHABITANTS|PRESENCE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078315167_463ca21d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/05_Inhabitants/05_PRESENCE.png'
    Meta = 'experience|desktop_tablet|INHABITANTS|PRESENCE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077947313_23f3368a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/05_Inhabitants/06_RELATIONSHIPS.png'
    Meta = 'experience|mobile|INHABITANTS|RELATIONSHIPS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078320801_0dca375b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/05_Inhabitants/06_RELATIONSHIPS.png'
    Meta = 'experience|desktop_tablet|INHABITANTS|RELATIONSHIPS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077951313_a50e9794.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/05_Inhabitants/07_INHABITANT_DETAIL.png'
    Meta = 'experience|mobile|INHABITANTS|INHABITANT DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078324152_f160110e.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/05_Inhabitants/07_INHABITANT_DETAIL.png'
    Meta = 'experience|desktop_tablet|INHABITANTS|INHABITANT DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077955138_76817485.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/06_States/01_STATES_ROOT.png'
    Meta = 'experience|mobile|STATES|STATES ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078327377_a9fe5f00.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/06_States/01_STATES_ROOT.png'
    Meta = 'experience|desktop_tablet|STATES|STATES ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077957401_b2fbb8e5.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/06_States/02_SCENE_STATES.png'
    Meta = 'experience|mobile|STATES|SCENE STATES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078356641_84cffa2e.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/06_States/02_SCENE_STATES.png'
    Meta = 'experience|desktop_tablet|STATES|SCENE STATES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077964028_b35423f0.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/06_States/03_LIGHTING.png'
    Meta = 'experience|mobile|STATES|LIGHTING'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078353783_49d1e465.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/06_States/03_LIGHTING.png'
    Meta = 'experience|desktop_tablet|STATES|LIGHTING'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077971487_8d90421c.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/06_States/04_ATMOSPHERE.png'
    Meta = 'experience|mobile|STATES|ATMOSPHERE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078360957_aa73baa6.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/06_States/04_ATMOSPHERE.png'
    Meta = 'experience|desktop_tablet|STATES|ATMOSPHERE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077972584_2558c872.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/06_States/05_TIME_CONDITION.png'
    Meta = 'experience|mobile|STATES|TIME + CONDITION'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078365449_85957460.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/06_States/05_TIME_CONDITION.png'
    Meta = 'experience|desktop_tablet|STATES|TIME + CONDITION'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077972165_35c9e4d0.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/06_States/06_LIVE_STATE.png'
    Meta = 'experience|mobile|STATES|LIVE STATE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078387815_cc8834dc.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/06_States/06_LIVE_STATE.png'
    Meta = 'experience|desktop_tablet|STATES|LIVE STATE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077977551_c28c7d94.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/06_States/07_STATE_DETAIL.png'
    Meta = 'experience|mobile|STATES|STATE DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078374257_0992f182.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/06_States/07_STATE_DETAIL.png'
    Meta = 'experience|desktop_tablet|STATES|STATE DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791077993189_c50b6e6c.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/07_Access/01_ACCESS_ROOT.png'
    Meta = 'experience|mobile|ACCESS|ACCESS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078380537_95915728.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/07_Access/01_ACCESS_ROOT.png'
    Meta = 'experience|desktop_tablet|ACCESS|ACCESS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078000025_16255642.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/07_Access/02_ACCESS_RULES.png'
    Meta = 'experience|mobile|ACCESS|ACCESS RULES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078390630_b12c8d83.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/07_Access/02_ACCESS_RULES.png'
    Meta = 'experience|desktop_tablet|ACCESS|ACCESS RULES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078000406_60cf2ff9.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/07_Access/03_ROLES_PERMISSIONS.png'
    Meta = 'experience|mobile|ACCESS|ROLES + PERMISSIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078396116_ccd4470a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/07_Access/03_ROLES_PERMISSIONS.png'
    Meta = 'experience|desktop_tablet|ACCESS|ROLES + PERMISSIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078005437_060bbebb.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/07_Access/04_ZONE_ACCESS.png'
    Meta = 'experience|mobile|ACCESS|ZONE ACCESS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078401128_0735d031.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/07_Access/04_ZONE_ACCESS.png'
    Meta = 'experience|desktop_tablet|ACCESS|ZONE ACCESS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078007387_8a919824.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/07_Access/05_CONDITIONAL_ACCESS.png'
    Meta = 'experience|mobile|ACCESS|CONDITIONAL ACCESS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078400882_cdf5c7a7.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/07_Access/05_CONDITIONAL_ACCESS.png'
    Meta = 'experience|desktop_tablet|ACCESS|CONDITIONAL ACCESS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078011810_d82dbe9a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/07_Access/06_PRIVACY_PRESENCE.png'
    Meta = 'experience|mobile|ACCESS|PRIVACY + PRESENCE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078402014_a88e8895.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/07_Access/06_PRIVACY_PRESENCE.png'
    Meta = 'experience|desktop_tablet|ACCESS|PRIVACY + PRESENCE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078018437_85e7cb30.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/01_MOBILE/07_Access/07_ACCESS_DETAIL.png'
    Meta = 'experience|mobile|ACCESS|ACCESS DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791078412150_9b4525b1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE/02_DESKTOP_TABLET/07_Access/07_ACCESS_DETAIL.png'
    Meta = 'experience|desktop_tablet|ACCESS|ACCESS DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086369269_baff0ebb.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/01_Authorities/01_AUTHORITIES_ROOT.png'
    Meta = 'library|mobile|AUTHORITIES|AUTHORITIES ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088894596_e8219444.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/01_Authorities/01_AUTHORITIES_ROOT.png'
    Meta = 'library|desktop_tablet|AUTHORITIES|AUTHORITIES ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086390523_977c2499.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/01_Authorities/02_AUTHORITY_DETAIL_FOR_A_SELECTED_AUTHORITY.png'
    Meta = 'library|mobile|AUTHORITIES|AUTHORITY DETAIL for a selected authority'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088928552_f4f3ed35.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/01_Authorities/02_AUTHORITY_DETAIL_FOR_A_SELECTED_AUTHORITY.png'
    Meta = 'library|desktop_tablet|AUTHORITIES|AUTHORITY DETAIL for a selected authority'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086376117_1750e884.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/01_Authorities/03_AUTHORITY_INDEX.png'
    Meta = 'library|mobile|AUTHORITIES|AUTHORITY INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088895464_57c6b3b1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/01_Authorities/03_AUTHORITY_INDEX.png'
    Meta = 'library|desktop_tablet|AUTHORITIES|AUTHORITY INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086379922_b2d0f444.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/01_Authorities/04_CANONICAL_AUTHORITIES.png'
    Meta = 'library|mobile|AUTHORITIES|CANONICAL AUTHORITIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088900811_fa9dc91c.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/01_Authorities/04_CANONICAL_AUTHORITIES.png'
    Meta = 'library|desktop_tablet|AUTHORITIES|CANONICAL AUTHORITIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086387295_02cc2ca6.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/01_Authorities/05_IN_REVIEW_AUTHORITIES.png'
    Meta = 'library|mobile|AUTHORITIES|IN REVIEW AUTHORITIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088903556_aade9e41.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/01_Authorities/05_IN_REVIEW_AUTHORITIES.png'
    Meta = 'library|desktop_tablet|AUTHORITIES|IN REVIEW AUTHORITIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086395555_a82412cf.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/01_Authorities/06_LINEAGE.png'
    Meta = 'library|mobile|AUTHORITIES|LINEAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088918373_f7f7c915.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/01_Authorities/06_LINEAGE.png'
    Meta = 'library|desktop_tablet|AUTHORITIES|LINEAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086388637_6e98ae1f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/01_Authorities/07_SUPERSEDED_AUTHORITIES.png'
    Meta = 'library|mobile|AUTHORITIES|SUPERSEDED AUTHORITIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088924106_7f52cb6b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/01_Authorities/07_SUPERSEDED_AUTHORITIES.png'
    Meta = 'library|desktop_tablet|AUTHORITIES|SUPERSEDED AUTHORITIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086401023_602b9052.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/02_Assets/01_ASSETS_ROOT.png'
    Meta = 'library|mobile|ASSETS|ASSETS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088919455_77157e3a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/02_Assets/01_ASSETS_ROOT.png'
    Meta = 'library|desktop_tablet|ASSETS|ASSETS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086415698_55bb0911.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/02_Assets/02_3D_SPATIAL.png'
    Meta = 'library|mobile|ASSETS|3D + SPATIAL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088941836_b40a0efb.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/02_Assets/02_3D_SPATIAL.png'
    Meta = 'library|desktop_tablet|ASSETS|3D + SPATIAL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086420041_e6c43e6d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/02_Assets/03_ASSET_DETAIL.png'
    Meta = 'library|mobile|ASSETS|ASSET DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088948168_be5ac765.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/02_Assets/03_ASSET_DETAIL.png'
    Meta = 'library|desktop_tablet|ASSETS|ASSET DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086404061_66721056.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/02_Assets/04_ASSET_INDEX.png'
    Meta = 'library|mobile|ASSETS|ASSET INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088926459_29a0abac.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/02_Assets/04_ASSET_INDEX.png'
    Meta = 'library|desktop_tablet|ASSETS|ASSET INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086413251_6e441930.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/02_Assets/05_AUDIO.png'
    Meta = 'library|mobile|ASSETS|AUDIO'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088942765_0dbf3cef.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/02_Assets/05_AUDIO.png'
    Meta = 'library|desktop_tablet|ASSETS|AUDIO'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086407673_ccad8c55.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/02_Assets/06_IMAGES.png'
    Meta = 'library|mobile|ASSETS|IMAGES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088930288_ac188281.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/02_Assets/06_IMAGES.png'
    Meta = 'library|desktop_tablet|ASSETS|IMAGES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086424407_53448ed2.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/02_Assets/07_USAGE.png'
    Meta = 'library|mobile|ASSETS|USAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088965008_7bde0fbb.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/02_Assets/07_USAGE.png'
    Meta = 'library|desktop_tablet|ASSETS|USAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086411294_7223b304.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/02_Assets/08_VIDEO.png'
    Meta = 'library|mobile|ASSETS|VIDEO'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088934656_05bc85ec.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/02_Assets/08_VIDEO.png'
    Meta = 'library|desktop_tablet|ASSETS|VIDEO'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086445102_d1048bf0.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/03_Characters/01_CHARACTERS_ROOT.png'
    Meta = 'library|mobile|CHARACTERS|CHARACTERS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088954929_1203a90a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/03_Characters/01_CHARACTERS_ROOT.png'
    Meta = 'library|desktop_tablet|CHARACTERS|CHARACTERS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086462666_b1d7dfd9.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/03_Characters/02_CHARACTER_DETAIL.png'
    Meta = 'library|mobile|CHARACTERS|CHARACTER DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088994667_fe7c0c33.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/03_Characters/02_CHARACTER_DETAIL.png'
    Meta = 'library|desktop_tablet|CHARACTERS|CHARACTER DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086446669_11bb67f3.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/03_Characters/03_CHARACTER_INDEX.png'
    Meta = 'library|mobile|CHARACTERS|CHARACTER INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088977114_911a649d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/03_Characters/03_CHARACTER_INDEX.png'
    Meta = 'library|desktop_tablet|CHARACTERS|CHARACTER INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086469972_80aab64f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/03_Characters/04_CHARACTER_LINEAGE.png'
    Meta = 'library|mobile|CHARACTERS|CHARACTER LINEAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791089000389_140101d2.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/03_Characters/04_CHARACTER_LINEAGE.png'
    Meta = 'library|desktop_tablet|CHARACTERS|CHARACTER LINEAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086459655_e8251109.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/03_Characters/05_EXTERNAL_TALENT.png'
    Meta = 'library|mobile|CHARACTERS|EXTERNAL TALENT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088989868_aa9206a9.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/03_Characters/05_EXTERNAL_TALENT.png'
    Meta = 'library|desktop_tablet|CHARACTERS|EXTERNAL TALENT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086456021_f596228f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/03_Characters/06_PROJECT_CHARACTERS.png'
    Meta = 'library|mobile|CHARACTERS|PROJECT CHARACTERS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088971816_305f022f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/03_Characters/06_PROJECT_CHARACTERS.png'
    Meta = 'library|desktop_tablet|CHARACTERS|PROJECT CHARACTERS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086454935_fdc87258.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/03_Characters/07_RESIDENTS.png'
    Meta = 'library|mobile|CHARACTERS|RESIDENTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791088963569_9db05d26.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/03_Characters/07_RESIDENTS.png'
    Meta = 'library|desktop_tablet|CHARACTERS|RESIDENTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086468651_f4bb01aa.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/04_Environments/01_ENVIRONMENTS_ROOT.png'
    Meta = 'library|mobile|ENVIRONMENTS|ENVIRONMENTS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791089002902_4cd03aa0.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/04_Environments/01_ENVIRONMENTS_ROOT.png'
    Meta = 'library|desktop_tablet|ENVIRONMENTS|ENVIRONMENTS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086492761_2efe2346.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/04_Environments/02_ENVIRONMENT_DETAIL.png'
    Meta = 'library|mobile|ENVIRONMENTS|ENVIRONMENT DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090193066_1565f0ae.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/04_Environments/02_ENVIRONMENT_DETAIL.png'
    Meta = 'library|desktop_tablet|ENVIRONMENTS|ENVIRONMENT DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086473950_0f0c54b5.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/04_Environments/03_ENVIRONMENT_INDEX.png'
    Meta = 'library|mobile|ENVIRONMENTS|ENVIRONMENT INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090164647_064e993b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/04_Environments/03_ENVIRONMENT_INDEX.png'
    Meta = 'library|desktop_tablet|ENVIRONMENTS|ENVIRONMENT INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086494929_56c1805a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/04_Environments/04_ENVIRONMENT_LINEAGE.png'
    Meta = 'library|mobile|ENVIRONMENTS|ENVIRONMENT LINEAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090192382_ead61108.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/04_Environments/04_ENVIRONMENT_LINEAGE.png'
    Meta = 'library|desktop_tablet|ENVIRONMENTS|ENVIRONMENT LINEAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086487168_38aab0e6.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/04_Environments/05_PLATES.png'
    Meta = 'library|mobile|ENVIRONMENTS|PLATES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090181106_e4388725.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/04_Environments/05_PLATES.png'
    Meta = 'library|desktop_tablet|ENVIRONMENTS|PLATES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086484603_db523b8a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/04_Environments/06_SETS.png'
    Meta = 'library|mobile|ENVIRONMENTS|SETS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090178157_3a884599.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/04_Environments/06_SETS.png'
    Meta = 'library|desktop_tablet|ENVIRONMENTS|SETS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086474580_f6b8b86f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/04_Environments/07_WORLDS.png'
    Meta = 'library|mobile|ENVIRONMENTS|WORLDS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090168287_eedc947f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/04_Environments/07_WORLDS.png'
    Meta = 'library|desktop_tablet|ENVIRONMENTS|WORLDS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086477833_331a34cd.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/04_Environments/08_ZONES.png'
    Meta = 'library|mobile|ENVIRONMENTS|ZONES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090171094_1c02577b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/04_Environments/08_ZONES.png'
    Meta = 'library|desktop_tablet|ENVIRONMENTS|ZONES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086515031_a8911815.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/05_Expressions/01_EXPRESSIONS_ROOT.png'
    Meta = 'library|mobile|EXPRESSIONS|EXPRESSIONS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090212481_7382bcbd.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/05_Expressions/01_EXPRESSIONS_ROOT.png'
    Meta = 'library|desktop_tablet|EXPRESSIONS|EXPRESSIONS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086530484_7b03a6fa.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/05_Expressions/02_CAMPAIGNS.png'
    Meta = 'library|mobile|EXPRESSIONS|CAMPAIGNS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090215775_92d70847.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/05_Expressions/02_CAMPAIGNS.png'
    Meta = 'library|desktop_tablet|EXPRESSIONS|CAMPAIGNS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086526623_eb2b906b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/05_Expressions/03_ENTRIES.png'
    Meta = 'library|mobile|EXPRESSIONS|ENTRIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090206307_eb3e89b1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/05_Expressions/03_ENTRIES.png'
    Meta = 'library|desktop_tablet|EXPRESSIONS|ENTRIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086541735_a31b3245.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/05_Expressions/04_EXPRESSION_DETAIL.png'
    Meta = 'library|mobile|EXPRESSIONS|EXPRESSION DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090238875_8018e4cb.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/05_Expressions/04_EXPRESSION_DETAIL.png'
    Meta = 'library|desktop_tablet|EXPRESSIONS|EXPRESSION DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086527226_4c5f234e.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/05_Expressions/05_EXPRESSION_INDEX.png'
    Meta = 'library|mobile|EXPRESSIONS|EXPRESSION INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090213570_c4e9f9ae.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/05_Expressions/05_EXPRESSION_INDEX.png'
    Meta = 'library|desktop_tablet|EXPRESSIONS|EXPRESSION INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086548388_087dbfdc.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/05_Expressions/06_EXPRESSION_LINEAGE.png'
    Meta = 'library|mobile|EXPRESSIONS|EXPRESSION LINEAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090229333_bddab623.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/05_Expressions/06_EXPRESSION_LINEAGE.png'
    Meta = 'library|desktop_tablet|EXPRESSIONS|EXPRESSION LINEAGE'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086531625_c420b66c.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/05_Expressions/07_FORMATS.png'
    Meta = 'library|mobile|EXPRESSIONS|FORMATS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090226632_59161540.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/05_Expressions/07_FORMATS.png'
    Meta = 'library|desktop_tablet|EXPRESSIONS|FORMATS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086539106_c90a1f37.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/05_Expressions/08_PACKAGES.png'
    Meta = 'library|mobile|EXPRESSIONS|PACKAGES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090214411_d99243e1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/05_Expressions/08_PACKAGES.png'
    Meta = 'library|desktop_tablet|EXPRESSIONS|PACKAGES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086547969_8f1f860b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/06_References/01_REFERENCES_ROOT.png'
    Meta = 'library|mobile|REFERENCES|REFERENCES ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090230921_77434ac5.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/06_References/01_REFERENCES_ROOT.png'
    Meta = 'library|desktop_tablet|REFERENCES|REFERENCES ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086572465_3b86679e.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/06_References/02_REFERENCE_DETAIL.png'
    Meta = 'library|mobile|REFERENCES|REFERENCE DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090289863_5fcc5d2b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/06_References/02_REFERENCE_DETAIL.png'
    Meta = 'library|desktop_tablet|REFERENCES|REFERENCE DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086556271_d61f9c28.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/06_References/03_REFERENCE_INDEX.png'
    Meta = 'library|mobile|REFERENCES|REFERENCE INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090249296_75a9ca88.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/06_References/03_REFERENCE_INDEX.png'
    Meta = 'library|desktop_tablet|REFERENCES|REFERENCE INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086560840_072d475b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/06_References/04_RESEARCH_REFERENCES.png'
    Meta = 'library|mobile|REFERENCES|RESEARCH REFERENCES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090276447_b73087b3.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/06_References/04_RESEARCH_REFERENCES.png'
    Meta = 'library|desktop_tablet|REFERENCES|RESEARCH REFERENCES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086569652_4d493c15.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/06_References/05_SOURCE_REFERENCES.png'
    Meta = 'library|mobile|REFERENCES|SOURCE REFERENCES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090286528_166b8fa5.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/06_References/05_SOURCE_REFERENCES.png'
    Meta = 'library|desktop_tablet|REFERENCES|SOURCE REFERENCES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086566075_cb7a226a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/06_References/06_STYLE_REFERENCES.png'
    Meta = 'library|mobile|REFERENCES|STYLE REFERENCES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090266414_bbfbf8b2.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/06_References/06_STYLE_REFERENCES.png'
    Meta = 'library|desktop_tablet|REFERENCES|STYLE REFERENCES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086557967_1a59cac1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/06_References/07_VISUAL_REFERENCES.png'
    Meta = 'library|mobile|REFERENCES|VISUAL REFERENCES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090241696_82602849.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/06_References/07_VISUAL_REFERENCES.png'
    Meta = 'library|desktop_tablet|REFERENCES|VISUAL REFERENCES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086590747_ef9386a1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/07_Icons/01_ICONS_ROOT.png'
    Meta = 'library|mobile|ICONS|ICONS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090281596_fb05e76f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/07_Icons/01_ICONS_ROOT.png'
    Meta = 'library|desktop_tablet|ICONS|ICONS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086609438_5a0ac035.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/07_Icons/02_FUNCTIONAL_ICONS.png'
    Meta = 'library|mobile|ICONS|FUNCTIONAL ICONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090298633_6eb92bb3.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/07_Icons/02_FUNCTIONAL_ICONS.png'
    Meta = 'library|desktop_tablet|ICONS|FUNCTIONAL ICONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086626400_5db63b5a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/07_Icons/03_ICON_DETAIL.png'
    Meta = 'library|mobile|ICONS|Icon Detail'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090318517_11d0f393.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/07_Icons/03_ICON_DETAIL.png'
    Meta = 'library|desktop_tablet|ICONS|Icon Detail'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086600893_e9ecbe56.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/07_Icons/04_ICON_FAMILIES.png'
    Meta = 'library|mobile|ICONS|ICON FAMILIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090293437_070ea688.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/07_Icons/04_ICON_FAMILIES.png'
    Meta = 'library|desktop_tablet|ICONS|ICON FAMILIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086599190_3a87a5c2.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/07_Icons/05_ICON_INDEX.png'
    Meta = 'library|mobile|ICONS|ICON INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090284759_3ce6372f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/07_Icons/05_ICON_INDEX.png'
    Meta = 'library|desktop_tablet|ICONS|ICON INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086604992_4c6fee62.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/07_Icons/06_NAVIGATION_ICONS.png'
    Meta = 'library|mobile|ICONS|NAVIGATION ICONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090293718_f428fe8f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/07_Icons/06_NAVIGATION_ICONS.png'
    Meta = 'library|desktop_tablet|ICONS|NAVIGATION ICONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086624971_7d2335c5.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/07_Icons/07_PROJECT_ICONS.png'
    Meta = 'library|mobile|ICONS|Project Icons'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090304506_acd86aa0.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/07_Icons/07_PROJECT_ICONS.png'
    Meta = 'library|desktop_tablet|ICONS|Project Icons'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086628740_2e2169a2.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/08_Materials/01_MATERIALS_ROOT.png'
    Meta = 'library|mobile|MATERIALS|MATERIALS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090310167_b0a479b2.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/08_Materials/01_MATERIALS_ROOT.png'
    Meta = 'library|desktop_tablet|MATERIALS|MATERIALS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086641370_9485bbb9.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/08_Materials/02_COMPONENTS.png'
    Meta = 'library|mobile|MATERIALS|Components'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090322257_6a7937f5.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/08_Materials/02_COMPONENTS.png'
    Meta = 'library|desktop_tablet|MATERIALS|Components'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086654376_a6b0b6c9.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/08_Materials/03_MATERIAL_DETAIL.png'
    Meta = 'library|mobile|MATERIALS|Material Detail'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090336860_8fee85e7.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/08_Materials/03_MATERIAL_DETAIL.png'
    Meta = 'library|desktop_tablet|MATERIALS|Material Detail'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086634054_6779141d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/08_Materials/04_MATERIAL_INDEX.png'
    Meta = 'library|mobile|MATERIALS|Material Index'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090319154_e059e269.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/08_Materials/04_MATERIAL_INDEX.png'
    Meta = 'library|desktop_tablet|MATERIALS|Material Index'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086637955_6a88ff3b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/08_Materials/05_SURFACES.png'
    Meta = 'library|mobile|MATERIALS|Surfaces'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090315113_be8a0c4b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/08_Materials/05_SURFACES.png'
    Meta = 'library|desktop_tablet|MATERIALS|Surfaces'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086646498_a193571d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/08_Materials/06_TEXTURES.png'
    Meta = 'library|mobile|MATERIALS|Textures'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090327420_4aac7dca.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/08_Materials/06_TEXTURES.png'
    Meta = 'library|desktop_tablet|MATERIALS|Textures'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086647073_d0307d26.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/08_Materials/07_UI_MATERIALS.png'
    Meta = 'library|mobile|MATERIALS|UI Materials'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090329489_028d0735.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/08_Materials/07_UI_MATERIALS.png'
    Meta = 'library|desktop_tablet|MATERIALS|UI Materials'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086674504_fbb5ab47.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/09_Documents/01_DOCUMENTS_ROOT.png'
    Meta = 'library|mobile|DOCUMENTS|DOCUMENTS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090357612_8bf8b002.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/09_Documents/01_DOCUMENTS_ROOT.png'
    Meta = 'library|desktop_tablet|DOCUMENTS|DOCUMENTS ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086685077_dcc51488.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/09_Documents/02_BIBLES.png'
    Meta = 'library|mobile|DOCUMENTS|BIBLES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090371823_1881105b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/09_Documents/02_BIBLES.png'
    Meta = 'library|desktop_tablet|DOCUMENTS|BIBLES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086681550_00cd886d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/09_Documents/03_BRIEFS.png'
    Meta = 'library|mobile|DOCUMENTS|BRIEFS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090366335_978bb383.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/09_Documents/03_BRIEFS.png'
    Meta = 'library|desktop_tablet|DOCUMENTS|BRIEFS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086701542_ecc703a1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/09_Documents/04_DOCUMENT_DETAIL.png'
    Meta = 'library|mobile|DOCUMENTS|DOCUMENT DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090390530_5b6041fd.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/09_Documents/04_DOCUMENT_DETAIL.png'
    Meta = 'library|desktop_tablet|DOCUMENTS|DOCUMENT DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086680111_ae57563f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/09_Documents/05_DOCUMENT_INDEX.png'
    Meta = 'library|mobile|DOCUMENTS|DOCUMENT INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090362542_1c73fc92.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/09_Documents/05_DOCUMENT_INDEX.png'
    Meta = 'library|desktop_tablet|DOCUMENTS|DOCUMENT INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086695978_db92e470.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/09_Documents/06_NOTES.png'
    Meta = 'library|mobile|DOCUMENTS|NOTES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090380511_d673c17c.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/09_Documents/06_NOTES.png'
    Meta = 'library|desktop_tablet|DOCUMENTS|NOTES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086692353_976e6ae1.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/09_Documents/07_REPORTS.png'
    Meta = 'library|mobile|DOCUMENTS|REPORTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090373945_90d9a516.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/09_Documents/07_REPORTS.png'
    Meta = 'library|desktop_tablet|DOCUMENTS|REPORTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086686359_17819331.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/09_Documents/08_SPECS.png'
    Meta = 'library|mobile|DOCUMENTS|SPECS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090375988_c5537d9d.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/09_Documents/08_SPECS.png'
    Meta = 'library|desktop_tablet|DOCUMENTS|SPECS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086701596_beae539c.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/10_Archive/01_ARCHIVE_ROOT.png'
    Meta = 'library|mobile|ARCHIVE|ARCHIVE ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090387791_d4552a4a.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/10_Archive/01_ARCHIVE_ROOT.png'
    Meta = 'library|desktop_tablet|ARCHIVE|ARCHIVE ROOT'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086730237_209c3351.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/10_Archive/02_ARCHIVE_DETAIL.png'
    Meta = 'library|mobile|ARCHIVE|ARCHIVE DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090424009_56664a04.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/10_Archive/02_ARCHIVE_DETAIL.png'
    Meta = 'library|desktop_tablet|ARCHIVE|ARCHIVE DETAIL'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086710091_f83d6f13.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/10_Archive/03_ARCHIVE_INDEX.png'
    Meta = 'library|mobile|ARCHIVE|ARCHIVE INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090394176_73f6719b.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/10_Archive/03_ARCHIVE_INDEX.png'
    Meta = 'library|desktop_tablet|ARCHIVE|ARCHIVE INDEX'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086711120_cb44f66f.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/10_Archive/04_ARCHIVED_ASSETS.png'
    Meta = 'library|mobile|ARCHIVE|ARCHIVED ASSETS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090401534_29110468.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/10_Archive/04_ARCHIVED_ASSETS.png'
    Meta = 'library|desktop_tablet|ARCHIVE|ARCHIVED ASSETS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086712997_da72dd50.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/10_Archive/05_ARCHIVED_AUTHORITIES.png'
    Meta = 'library|mobile|ARCHIVE|ARCHIVED AUTHORITIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090406381_ab1adcd6.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/10_Archive/05_ARCHIVED_AUTHORITIES.png'
    Meta = 'library|desktop_tablet|ARCHIVE|ARCHIVED AUTHORITIES'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086719216_8621cb14.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/10_Archive/06_ARCHIVED_CHARACTERS.png'
    Meta = 'library|mobile|ARCHIVE|ARCHIVED CHARACTERS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090413788_98dcd274.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/10_Archive/06_ARCHIVED_CHARACTERS.png'
    Meta = 'library|desktop_tablet|ARCHIVE|ARCHIVED CHARACTERS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086721685_7056fd5e.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/10_Archive/07_ARCHIVED_ENVIRONMENTS.png'
    Meta = 'library|mobile|ARCHIVE|ARCHIVED ENVIRONMENTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090417598_af57a386.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/10_Archive/07_ARCHIVED_ENVIRONMENTS.png'
    Meta = 'library|desktop_tablet|ARCHIVE|ARCHIVED ENVIRONMENTS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791086727062_f32fb7f4.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/01_MOBILE/10_Archive/08_ARCHIVED_EXPRESSIONS.png'
    Meta = 'library|mobile|ARCHIVE|ARCHIVED EXPRESSIONS'
  },
  @{
    Url = 'https://cdn.openart.ai/openart-ai/production/2026-10/create-image/r70bB5cq1TcusCDgMpPY/gpt-image-2.5-sunburst-edit-1_1791090419256_bcb585d7.png'
    RelPath = 'PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY/02_DESKTOP_TABLET/10_Archive/08_ARCHIVED_EXPRESSIONS.png'
    Meta = 'library|desktop_tablet|ARCHIVE|ARCHIVED EXPRESSIONS'
  },
)

function Ensure-ParentDir {
  param([string]$FilePath)
  $dir = Split-Path -Parent $FilePath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

function Download-Asset {
  param([string]$Url, [string]$OutFile)
  Ensure-ParentDir -FilePath $OutFile
  for ($i = 1; $i -le $MaxAttempts; $i++) {
    try {
      if (Test-Path $OutFile) { Remove-Item -Force $OutFile }
      Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing -TimeoutSec 120 -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PowerShell'
      if ((Test-Path $OutFile) -and ((Get-Item $OutFile).Length -gt 0)) { return $true }
    } catch {
      Write-Warning "Attempt $i failed for $OutFile : $($_.Exception.Message)"
    }
    Start-Sleep -Seconds $RetryDelaySec
  }
  return $false
}

Write-Host 'PRODUCTION AUTHORITY DOWNLOAD — starting...'
$failures = @()
$counts = @{
  'Experience Mobile' = 0
  'Experience Desktop/Tablet' = 0
  'Library Mobile' = 0
  'Library Desktop/Tablet' = 0
}
$i = 0
foreach ($a in $Assets) {
  $i++
  $out = Join-Path $PSScriptRoot $a.RelPath
  $metaParts = $a.Meta -split '\|'
  $bucket = switch ($metaParts[0] + ':' + $metaParts[1]) {
    'experience:mobile' { 'Experience Mobile' }
    'experience:desktop_tablet' { 'Experience Desktop/Tablet' }
    'library:mobile' { 'Library Mobile' }
    'library:desktop_tablet' { 'Library Desktop/Tablet' }
  }
  Write-Host ("[{0}/{1}] {2} -> {3}" -f $i, $Assets.Count, $a.Meta, $a.RelPath)
  if (Download-Asset -Url $a.Url -OutFile $out) { $counts[$bucket]++ } else { $failures += $a.Meta + ' :: ' + $a.RelPath }
}

$total = ($counts.Values | Measure-Object -Sum).Sum
$ok = $true
foreach ($k in $Expected.Keys) {
  if ($counts[$k] -ne $Expected[$k]) {
    Write-Host "VALIDATION FAIL: $k expected $($Expected[$k]) got $($counts[$k])" -ForegroundColor Red
    $ok = $false
  }
}
if (-not $ok -or $failures.Count -gt 0) {
  Write-Host ''
  Write-Host 'PRODUCTION AUTHORITY EXPORT INCOMPLETE' -ForegroundColor Red
  Write-Host ('FAILED: {0}' -f $failures.Count)
  foreach ($f in $failures) { Write-Host ('  - ' + $f) }
  exit 1
}

function New-AuthorityZip {
  param([string]$SourceDir, [string]$ZipPath)
  if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
  Compress-Archive -Path (Join-Path $SourceDir '*') -DestinationPath $ZipPath -Force
}

$zipRoot = $PSScriptRoot
New-AuthorityZip -SourceDir (Join-Path $Root '01_EXPERIENCE/01_MOBILE') -ZipPath (Join-Path $zipRoot 'EXPERIENCE_MOBILE_AUTHORITY.zip')
New-AuthorityZip -SourceDir (Join-Path $Root '01_EXPERIENCE/02_DESKTOP_TABLET') -ZipPath (Join-Path $zipRoot 'EXPERIENCE_DESKTOP_TABLET_AUTHORITY.zip')
New-AuthorityZip -SourceDir (Join-Path $Root '02_LIBRARY/01_MOBILE') -ZipPath (Join-Path $zipRoot 'LIBRARY_MOBILE_AUTHORITY.zip')
New-AuthorityZip -SourceDir (Join-Path $Root '02_LIBRARY/02_DESKTOP_TABLET') -ZipPath (Join-Path $zipRoot 'LIBRARY_DESKTOP_TABLET_AUTHORITY.zip')

Write-Host ''
Write-Host 'PRODUCTION AUTHORITY EXPORT COMPLETE'
Write-Host ''
Write-Host 'Experience Mobile:'
Write-Host ('  {0} / 46' -f $counts['Experience Mobile'])
Write-Host 'Experience Desktop/Tablet:'
Write-Host ('  {0} / 46' -f $counts['Experience Desktop/Tablet'])
Write-Host 'Library Mobile:'
Write-Host ('  {0} / 75' -f $counts['Library Mobile'])
Write-Host 'Library Desktop/Tablet:'
Write-Host ('  {0} / 75' -f $counts['Library Desktop/Tablet'])
Write-Host 'TOTAL:'
Write-Host ('  {0} / 242' -f $total)
Write-Host ('FAILED: {0}' -f $failures.Count)
Write-Host ''
Write-Host 'ZIP FILES:'
Write-Host '  EXPERIENCE_MOBILE_AUTHORITY.zip'
Write-Host '  EXPERIENCE_DESKTOP_TABLET_AUTHORITY.zip'
Write-Host '  LIBRARY_MOBILE_AUTHORITY.zip'
Write-Host '  LIBRARY_DESKTOP_TABLET_AUTHORITY.zip'
Write-Host ''
Write-Host ('EXPORT ROOT: {0}' -f $Root)

