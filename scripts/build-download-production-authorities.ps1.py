#!/usr/bin/env python3
"""
Forensic builder: OpenArt project Q7IHYCEK3RPn2c1ConEG -> download_production_authorities.ps1
Read-only aggregation from cached openart_creation_list JSON dumps + optional page files.
"""
from __future__ import annotations

import glob
import json
import os
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from typing import Literal

Breakpoint = Literal["mobile", "desktop_tablet"]
Product = Literal["experience", "library"]

AGENT_TOOLS = "/home/ubuntu/.cursor/projects/workspace/agent-tools"
EXTRA_PAGES = glob.glob("/tmp/openart-q7ih-pages/*.json")
OUTPUT_PS1 = os.path.join(os.path.dirname(os.path.dirname(__file__)), "download_production_authorities.ps1")
OUTPUT_MANIFEST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts", "production-openart-recovery2", "AUTHORITY_DOWNLOADER_MANIFEST.json")


@dataclass
class Record:
    product: Product
    breakpoint: Breakpoint
    family_code: str
    family_label: str
    route_label: str
    route_id: str
    filename: str
    rel_path: str
    url: str
    history_id: str
    created_at: str
    prompt_excerpt: str


def load_all_items() -> dict[str, dict]:
    items: dict[str, dict] = {}
    paths = glob.glob(os.path.join(AGENT_TOOLS, "*.txt")) + EXTRA_PAGES
    for path in paths:
        try:
            data = json.load(open(path, encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(data, dict) or "items" not in data:
            continue
        for it in data["items"]:
            hid = it.get("historyId") or it.get("id")
            if hid:
                items[hid] = it
    return items


def bucket(item: dict) -> str | None:
    pr = item.get("prompt") or ""
    u = pr.upper()
    if "APPROVED LIBRARY MOBILE AUTHORITY" in u:
        return "LIB_MOB"
    if "APPROVED EXPERIENCE MOBILE AUTHORITY" in u:
        return "EXP_MOB"
    if "PRODUCTION EXPERIENCE" in u and ("EXACTLY TWO" in u or "TWO FULL-SCREEN" in u):
        return "EXP_HYB"
    if "PRODUCTION LIBRARY" in u and "DESKTOP" in u and "TABLET" in u:
        return "LIB_HYB"
    return None


def extract_route_line(prompt: str) -> str | None:
    for line in prompt.split("\n"):
        ls = line.strip()
        if ls.upper().startswith("ROUTE:"):
            return ls.split(":", 1)[1].strip().rstrip(".")
    return None


def extract_mobile_route(prompt: str) -> str | None:
    rl = extract_route_line(prompt)
    if rl:
        return rl
    create_lines: list[str] = []
    for line in prompt.split("\n"):
        ls = line.strip()
        if re.match(
            r"^Create (?:ONE SINGLE MOBILE|grandchild|child workspace|child|Library|Experience)",
            ls,
            re.I,
        ):
            create_lines.append(ls)
    if not create_lines:
        return None
    last = create_lines[-1]
    last = re.sub(r"^Create ONE SINGLE MOBILE SCREEN ONLY\.\s*", "", last, flags=re.I)
    last = re.sub(r"^Create (?:grandchild|child workspace|child)\s*", "", last, flags=re.I)
    last = re.sub(r"^Create Library / ", "", last, flags=re.I)
    return last.rstrip(".").strip()


def normalize_lib_route_id(mobile_route: str) -> str:
    """Map library mobile prompt tail to LIB_HYB ROUTE: token."""
    raw = mobile_route.strip()
    head = raw.split(".")[0].strip()
    if head.upper().startswith("CREATE LIBRARY /"):
        head = head.replace("Create Library /", "").strip()
    if " / " in head:
        fam, route = head.split(" / ", 1)
        fam = fam.strip().upper()
        route = route.split(" for ", 1)[0].strip().upper().replace(" + ", "_").replace(" ", "_").replace("-", "_")
    else:
        fam = head.split()[0].upper().rstrip(".")
        route = "ROOT"
    fam = fam.rstrip(".")
    fam_map = {
        "AUTHORITIES": "AUTHORITY",
        "ASSETS": "ASSET",
        "CHARACTERS": "CHARACTER",
        "ENVIRONMENTS": "ENVIRONMENT",
        "EXPRESSIONS": "EXPRESSION",
        "REFERENCES": "REFERENCE",
        "ICONS": "ICON",
        "MATERIALS": "MATERIAL",
        "DOCUMENTS": "DOCUMENT",
        "ARCHIVE": "ARCHIVE",
    }
    prefix = fam_map.get(fam, fam)
    if route == "ROOT":
        if fam == "AUTHORITIES":
            return "AUTHORITIES_ROOT"
        if fam == "ASSETS":
            return "ASSETS_ROOT"
        if fam == "CHARACTERS":
            return "CHARACTERS_ROOT"
        if fam == "ENVIRONMENTS":
            return "ENVIRONMENTS_ROOT"
        if fam == "EXPRESSIONS":
            return "EXPRESSIONS_ROOT"
        if fam == "REFERENCES":
            return "REFERENCES_ROOT"
        if fam == "ICONS":
            return "ICONS_ROOT"
        if fam == "MATERIALS":
            return "MATERIALS_ROOT"
        if fam == "DOCUMENTS":
            return "DOCUMENTS_ROOT"
        if fam == "ARCHIVE":
            return "ARCHIVE_ROOT"
        return f"{fam}_ROOT"
    route_map = {
        ("ASSET", "3D_+_SPATIAL"): "ASSET_3D",
        ("ASSET", "3D_SPATIAL"): "ASSET_3D",
        ("AUTHORITY", "AUTHORITY_DETAIL"): "AUTHORITY_DETAIL",
        ("AUTHORITY", "AUTHORITY_INDEX"): "AUTHORITY_INDEX",
        ("AUTHORITY", "AUTHORITY_LINEAGE"): "AUTHORITY_LINEAGE",
        ("AUTHORITY", "CANONICAL_AUTHORITIES"): "CANONICAL_AUTHORITIES",
        ("AUTHORITY", "IN_REVIEW_AUTHORITIES"): "IN_REVIEW_AUTHORITIES",
        ("AUTHORITY", "SUPERSEDED_AUTHORITIES"): "SUPERSEDED_AUTHORITIES",
        ("REFERENCE", "AUTHORITY_INDEX"): "AUTHORITY_INDEX",
        ("CHARACTER", "CHARACTER_INDEX"): "CHARACTER_INDEX",
        ("ENVIRONMENT", "ENVIRONMENT_INDEX"): "ENVIRONMENT_INDEX",
        ("EXPRESSION", "EXPRESSION_INDEX"): "EXPRESSION_INDEX",
        ("ICON", "ICON_INDEX"): "ICON_INDEX",
        ("MATERIAL", "MATERIAL_INDEX"): "MATERIAL_INDEX",
        ("DOCUMENT", "DOCUMENT_INDEX"): "DOCUMENT_INDEX",
        ("ARCHIVE", "ARCHIVE_INDEX"): "ARCHIVE_INDEX",
        ("ICON", "ICON_DETAIL"): "ICON_DETAIL",
        ("MATERIAL", "MATERIAL_DETAIL"): "MATERIAL_DETAIL",
        ("MATERIAL", "UI_MATERIALS"): "UI_MATERIALS",
        ("ICON", "PROJECT_ICONS"): "PROJECT_ICONS",
        ("ICON", "NAVIGATION_ICONS"): "NAVIGATION_ICONS",
        ("ICON", "FUNCTIONAL_ICONS"): "FUNCTIONAL_ICONS",
        ("ICON", "ICON_FAMILIES"): "ICON_FAMILIES",
        ("CHARACTER", "EXTERNAL_TALENT"): "EXTERNAL_TALENT",
        ("CHARACTER", "PROJECT_CHARACTERS"): "PROJECT_CHARACTERS",
        ("CHARACTER", "CHARACTERS_RESIDENTS"): "CHARACTERS_RESIDENTS",
        ("CHARACTER", "RESIDENTS"): "CHARACTERS_RESIDENTS",
        ("ENVIRONMENT", "WORLDS"): "ENVIRONMENT_WORLDS",
        ("ENVIRONMENT", "ZONES"): "ENVIRONMENT_ZONES",
        ("ENVIRONMENT", "SETS"): "ENVIRONMENT_SETS",
        ("ENVIRONMENT", "PLATES"): "ENVIRONMENT_PLATES",
        ("EXPRESSION", "ENTRIES"): "EXPRESSION_ENTRIES",
        ("EXPRESSION", "CAMPAIGNS"): "EXPRESSION_CAMPAIGNS",
        ("EXPRESSION", "FORMATS"): "EXPRESSION_FORMATS",
        ("EXPRESSION", "PACKAGES"): "EXPRESSION_PACKAGES",
        ("REFERENCE", "VISUAL_REFERENCES"): "VISUAL_REFERENCES",
        ("REFERENCE", "RESEARCH_REFERENCES"): "RESEARCH_REFERENCES",
        ("REFERENCE", "STYLE_REFERENCES"): "STYLE_REFERENCES",
        ("REFERENCE", "SOURCE_REFERENCES"): "SOURCE_REFERENCES",
        ("MATERIAL", "SURFACES"): "MATERIAL_SURFACES",
        ("MATERIAL", "COMPONENTS"): "MATERIAL_COMPONENTS",
        ("MATERIAL", "TEXTURES"): "MATERIAL_TEXTURES",
        ("DOCUMENT", "BRIEFS"): "DOCUMENT_BRIEFS",
        ("DOCUMENT", "BIBLES"): "DOCUMENT_BIBLES",
        ("DOCUMENT", "SPECS"): "DOCUMENT_SPECS",
        ("DOCUMENT", "REPORTS"): "DOCUMENT_REPORTS",
        ("DOCUMENT", "NOTES"): "DOCUMENT_NOTES",
        ("ARCHIVE", "ARCHIVED_ASSETS"): "ARCHIVED_ASSETS",
        ("ARCHIVE", "ARCHIVED_AUTHORITIES"): "ARCHIVED_AUTHORITIES",
        ("ARCHIVE", "ARCHIVED_CHARACTERS"): "ARCHIVED_CHARACTERS",
        ("ARCHIVE", "ARCHIVED_ENVIRONMENTS"): "ARCHIVED_ENVIRONMENTS",
        ("ARCHIVE", "ARCHIVED_EXPRESSIONS"): "ARCHIVED_EXPRESSIONS",
        ("ARCHIVE", "ARCHIVE_DETAIL"): "ARCHIVE_DETAIL",
    }
    key = (prefix, route)
    if key in route_map:
        return route_map[key]
    if route.endswith("_ROOT"):
        return route
    if prefix in ("AUTHORITY", "ASSET", "CHARACTER", "ENVIRONMENT", "EXPRESSION", "REFERENCE", "ICON", "MATERIAL", "DOCUMENT", "ARCHIVE"):
        if route.startswith(prefix + "_"):
            return route
        return f"{prefix}_{route}"
    return f"{fam}_{route}"


def normalize_exp_hyb_id(route: str) -> str:
    return route.strip().rstrip(".").upper()


EXP_MOB_TO_HYB: dict[str, str] = {
    "WORLD. WORLD active": "WORLD_ROOT",
    "WORLD / WORLD OVERVIEW": "WORLD_OVERVIEW",
    "WORLD / ARCHITECTURE": "WORLD_ARCHITECTURE",
    "WORLD / ENVIRONMENTS": "WORLD_ENVIRONMENTS",
    "WORLD / DESTINATIONS": "WORLD_DESTINATIONS",
    "WORLD / WORLD DETAIL": "WORLD_DETAIL",
    "ZONES. ZONES active": "ZONES_ROOT",
    "ZONES / ZONE INDEX": "ZONES_INDEX",
    "ZONES / ROOMS": "ZONES_ROOMS",
    "ZONES / DISTRICTS": "ZONES_DISTRICTS",
    "ZONES / PORTALS": "ZONES_PORTALS",
    "ZONES / THRESHOLDS": "ZONES_THRESHOLDS",
    "ZONES / ZONE DETAIL": "ZONE_DETAIL",
    "PATHS. PATHS active": "PATHS_ROOT",
    "PATHS / PATHWAYS": "PATHWAYS",
    "PATHS / ROUTE MAP": "ROUTE_MAP",
    "PATHS / ENTRY PATHS": "ENTRY_PATHS",
    "PATHS / EXIT PATHS": "EXIT_PATHS",
    "PATHS / JOURNEY DETAIL": "JOURNEY_DETAIL",
    "INTERACTIONS. INTERACTIONS active": "INTERACTIONS_ROOT",
    "INTERACTIONS / INTERACTION INDEX": "INTERACTION_INDEX",
    "INTERACTIONS / OBJECT INTERACTIONS": "OBJECT_INTERACTIONS",
    "INTERACTIONS / SPATIAL ACTIONS": "SPATIAL_ACTIONS",
    "INTERACTIONS / TRIGGERS": "TRIGGERS",
    "INTERACTIONS / INTERACTION DETAIL": "INTERACTION_DETAIL",
    "INHABITANTS. INHABITANTS active": "INHABITANTS_ROOT",
    "INHABITANTS / INHABITANT INDEX": "INHABITANT_INDEX",
    "INHABITANTS / RESIDENTS": "RESIDENTS",
    "INHABITANTS / CHARACTERS": "CHARACTERS",
    "INHABITANTS / PRESENCE": "PRESENCE",
    "INHABITANTS / RELATIONSHIPS": "RELATIONSHIPS",
    "INHABITANTS / INHABITANT DETAIL": "INHABITANT_DETAIL",
    "STATES. STATES active": "STATES_ROOT",
    "STATES / SCENE STATES": "SCENE_STATES",
    "STATES / LIGHTING": "LIGHTING",
    "STATES / ATMOSPHERE": "ATMOSPHERE",
    "STATES / TIME + CONDITION": "TIME_CONDITION",
    "STATES / LIVE STATE": "LIVE_STATE",
    "STATES / STATE DETAIL": "STATE_DETAIL",
    "ACCESS. ACCESS active": "ACCESS_ROOT",
    "ACCESS / ACCESS RULES": "ACCESS_RULES",
    "ACCESS / ROLES + PERMISSIONS": "ROLES_PERMISSIONS",
    "ACCESS / ZONE ACCESS": "ZONE_ACCESS",
    "ACCESS / CONDITIONAL ACCESS": "CONDITIONAL_ACCESS",
    "ACCESS / PRIVACY + PRESENCE": "PRIVACY_PRESENCE",
    "ACCESS / ACCESS DETAIL": "ACCESS_DETAIL",
}


def normalize_exp_mobile_to_hyb(mobile_route: str) -> str:
    if mobile_route in EXP_MOB_TO_HYB:
        return EXP_MOB_TO_HYB[mobile_route]
    raise KeyError(f"Unmapped experience mobile route: {mobile_route}")


EXP_FAMILIES = [
    ("01_World", "WORLD"),
    ("02_Zones", "ZONES"),
    ("03_Paths", "PATHS"),
    ("04_Interactions", "INTERACTIONS"),
    ("05_Inhabitants", "INHABITANTS"),
    ("06_States", "STATES"),
    ("07_Access", "ACCESS"),
]

LIB_FAMILIES = [
    ("01_Authorities", "AUTHORITIES"),
    ("02_Assets", "ASSETS"),
    ("03_Characters", "CHARACTERS"),
    ("04_Environments", "ENVIRONMENTS"),
    ("05_Expressions", "EXPRESSIONS"),
    ("06_References", "REFERENCES"),
    ("07_Icons", "ICONS"),
    ("08_Materials", "MATERIALS"),
    ("09_Documents", "DOCUMENTS"),
    ("10_Archive", "ARCHIVE"),
]

EXP_MOB_ORDER: dict[str, list[str]] = {
    "WORLD": [
        "WORLD. WORLD active",
        "WORLD / WORLD OVERVIEW",
        "WORLD / ARCHITECTURE",
        "WORLD / ENVIRONMENTS",
        "WORLD / DESTINATIONS",
        "WORLD / WORLD DETAIL",
    ],
    "ZONES": [
        "ZONES. ZONES active",
        "ZONES / ZONE INDEX",
        "ZONES / ROOMS",
        "ZONES / DISTRICTS",
        "ZONES / PORTALS",
        "ZONES / THRESHOLDS",
        "ZONES / ZONE DETAIL",
    ],
    "PATHS": [
        "PATHS. PATHS active",
        "PATHS / PATHWAYS",
        "PATHS / ROUTE MAP",
        "PATHS / ENTRY PATHS",
        "PATHS / EXIT PATHS",
        "PATHS / JOURNEY DETAIL",
    ],
    "INTERACTIONS": [
        "INTERACTIONS. INTERACTIONS active",
        "INTERACTIONS / INTERACTION INDEX",
        "INTERACTIONS / OBJECT INTERACTIONS",
        "INTERACTIONS / SPATIAL ACTIONS",
        "INTERACTIONS / TRIGGERS",
        "INTERACTIONS / INTERACTION DETAIL",
    ],
    "INHABITANTS": [
        "INHABITANTS. INHABITANTS active",
        "INHABITANTS / INHABITANT INDEX",
        "INHABITANTS / RESIDENTS",
        "INHABITANTS / CHARACTERS",
        "INHABITANTS / PRESENCE",
        "INHABITANTS / RELATIONSHIPS",
        "INHABITANTS / INHABITANT DETAIL",
    ],
    "STATES": [
        "STATES. STATES active",
        "STATES / SCENE STATES",
        "STATES / LIGHTING",
        "STATES / ATMOSPHERE",
        "STATES / TIME + CONDITION",
        "STATES / LIVE STATE",
        "STATES / STATE DETAIL",
    ],
    "ACCESS": [
        "ACCESS. ACCESS active",
        "ACCESS / ACCESS RULES",
        "ACCESS / ROLES + PERMISSIONS",
        "ACCESS / ZONE ACCESS",
        "ACCESS / CONDITIONAL ACCESS",
        "ACCESS / PRIVACY + PRESENCE",
        "ACCESS / ACCESS DETAIL",
    ],
}


def safe_filename(label: str) -> str:
    s = label.upper()
    s = s.replace(" + ", "_").replace("/", "_").replace(" ", "_").replace("-", "_")
    s = re.sub(r"[^A-Z0-9_]", "", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s


def pick_best(items: list[dict]) -> dict:
    def score(it: dict) -> tuple:
        pr = (it.get("prompt") or "").upper()
        exact = 1 if "EXACTLY TWO FULL-SCREEN VERSIONS OF THE SAME PRODUCTION" in pr.replace("\n", " ") else 0
        created = int(it.get("createdAt") or 0)
        return (exact, created)

    return sorted(items, key=score)[-1]


def build_records(items: dict[str, dict]) -> tuple[list[Record], dict]:
    buckets: dict[str, list[dict]] = defaultdict(list)
    for it in items.values():
        b = bucket(it)
        if b:
            buckets[b].append(it)

    stats = {
        "LIB_MOB": len(buckets["LIB_MOB"]),
        "EXP_MOB": len(buckets["EXP_MOB"]),
        "EXP_HYB": len(buckets["EXP_HYB"]),
        "LIB_HYB_raw": len(buckets["LIB_HYB"]),
    }

    exp_mob_by_route = {extract_mobile_route(it["prompt"]): it for it in buckets["EXP_MOB"]}
    exp_hyb_by_route = {normalize_exp_hyb_id(extract_route_line(it["prompt"]) or ""): it for it in buckets["EXP_HYB"]}

    lib_mob_by_route = {extract_mobile_route(it["prompt"]): it for it in buckets["LIB_MOB"]}
    lib_hyb_by_route: dict[str, dict] = {}
    lib_hyb_dupes = 0
    grouped: dict[str, list[dict]] = defaultdict(list)
    for it in buckets["LIB_HYB"]:
        rid = extract_route_line(it["prompt"])
        if rid:
            grouped[rid].append(it)
    for rid, group in grouped.items():
        if len(group) > 1:
            lib_hyb_dupes += len(group) - 1
        lib_hyb_by_route[rid] = pick_best(group)

    records: list[Record] = []
    missing: list[str] = []
    ambiguous: list[str] = []

    # Experience mobile + hybrid
    for fam_dir, fam_key in EXP_FAMILIES:
        order = EXP_MOB_ORDER[fam_key]
        for idx, mob_key in enumerate(order, start=1):
            it_m = exp_mob_by_route.get(mob_key)
            hyb_id = normalize_exp_mobile_to_hyb(mob_key)
            it_h = exp_hyb_by_route.get(hyb_id)
            label = mob_key.split(" / ")[-1].split(".")[0].strip()
            if mob_key.endswith(" active"):
                label = f"{fam_key} ROOT"
            fn = f"{idx:02d}_{safe_filename(label)}.png"
            base = f"PRODUCTION_AUTHORITY_EXPORT/01_EXPERIENCE"
            if not it_m:
                missing.append(f"EXP_MOB:{mob_key}")
            else:
                url = it_m.get("url") or ""
                if not url:
                    missing.append(f"EXP_MOB URL:{mob_key}")
                else:
                    records.append(
                        Record(
                            "experience",
                            "mobile",
                            fam_dir,
                            fam_key,
                            label,
                            hyb_id,
                            fn,
                            f"{base}/01_MOBILE/{fam_dir}/{fn}",
                            url,
                            it_m.get("historyId") or "",
                            str(it_m.get("createdAt") or ""),
                            mob_key[:120],
                        )
                    )
            fn_h = fn
            if not it_h:
                missing.append(f"EXP_HYB:{hyb_id}")
            else:
                url = it_h.get("url") or ""
                if not url:
                    missing.append(f"EXP_HYB URL:{hyb_id}")
                else:
                    records.append(
                        Record(
                            "experience",
                            "desktop_tablet",
                            fam_dir,
                            fam_key,
                            label,
                            hyb_id,
                            fn_h,
                            f"{base}/02_DESKTOP_TABLET/{fam_dir}/{fn_h}",
                            url,
                            it_h.get("historyId") or "",
                            str(it_h.get("createdAt") or ""),
                            hyb_id,
                        )
                    )

    # Library: derive order from mobile keys grouped by family
    lib_mob_routes = sorted(lib_mob_by_route.keys(), key=lambda s: (s or "").upper())
    by_fam: dict[str, list[str]] = defaultdict(list)
    for key in lib_mob_routes:
        if not key:
            continue
        head = key.split(".")[0].strip()
        if head.startswith("Create Library /"):
            parts = head.replace("Create Library /", "").split("/")
            fam = parts[0].strip().upper()
        elif " / " in head:
            fam = head.split(" / ", 1)[0].strip().upper()
        else:
            fam = head.split()[0].upper().rstrip(".")
        by_fam[fam].append(key)

    fam_dir_map = {k: d for d, k in LIB_FAMILIES}

    for fam_dir, fam_key in LIB_FAMILIES:
        keys = by_fam.get(fam_key, [])
        # stable order: roots first, then alphabetical on route segment
        def sort_key(k: str) -> tuple:
            head = k.split(".")[0]
            is_root = "root" in head.lower() or (fam_key in head and " / " not in head and "Create Library" not in head)
            seg = head.split(" / ")[-1] if " / " in head else head
            return (0 if is_root else 1, seg.upper())

        keys = sorted(keys, key=sort_key)
        for idx, mob_key in enumerate(keys, start=1):
            it_m = lib_mob_by_route[mob_key]
            hyb_id = normalize_lib_route_id(mob_key)
            it_h = lib_hyb_by_route.get(hyb_id)
            head = mob_key.split(".")[0].strip()
            if " / " in head:
                label = head.split(" / ", 1)[1].strip()
            elif "Create Library /" in head:
                label = head.replace("Create Library /", "").split("/")[-1].strip()
            else:
                label = f"{fam_key} ROOT"
            fn = f"{idx:02d}_{safe_filename(label)}.png"
            base = "PRODUCTION_AUTHORITY_EXPORT/02_LIBRARY"
            url = it_m.get("url") or ""
            if not url:
                missing.append(f"LIB_MOB URL:{mob_key[:80]}")
            else:
                records.append(
                    Record(
                        "library",
                        "mobile",
                        fam_dir,
                        fam_key,
                        label,
                        hyb_id,
                        fn,
                        f"{base}/01_MOBILE/{fam_dir}/{fn}",
                        url,
                        it_m.get("historyId") or "",
                        str(it_m.get("createdAt") or ""),
                        mob_key[:120],
                    )
                )
            if not it_h:
                missing.append(f"LIB_HYB:{hyb_id} (from {mob_key[:60]})")
                ambiguous.append(f"{hyb_id} <- {mob_key[:80]}")
            else:
                url_h = it_h.get("url") or ""
                if not url_h:
                    missing.append(f"LIB_HYB URL:{hyb_id}")
                else:
                    records.append(
                        Record(
                            "library",
                            "desktop_tablet",
                            fam_dir,
                            fam_key,
                            label,
                            hyb_id,
                            fn,
                            f"{base}/02_DESKTOP_TABLET/{fam_dir}/{fn}",
                            url_h,
                            it_h.get("historyId") or "",
                            str(it_h.get("createdAt") or ""),
                            hyb_id,
                        )
                    )

    stats["lib_hyb_dupes_resolved"] = lib_hyb_dupes
    stats["missing"] = missing
    stats["ambiguous"] = ambiguous
    stats["record_count"] = len(records)
    return records, stats


def emit_ps1(records: list[Record]) -> str:
    lines: list[str] = []
    lines.append("# download_production_authorities.ps1")
    lines.append("# SITE 00 — Production responsive authority export (242 records)")
    lines.append("# OpenArt project: Q7IHYCEK3RPn2c1ConEG — forensic retrieval only (no generation)")
    lines.append(f"# Generated: {datetime.utcnow().isoformat(timespec='seconds')}Z")
    lines.append("")
    lines.append("$ErrorActionPreference = 'Stop'")
    lines.append("$MaxAttempts = 3")
    lines.append("$RetryDelaySec = 2")
    lines.append("$Root = Join-Path $PSScriptRoot 'PRODUCTION_AUTHORITY_EXPORT'")
    lines.append("")
    lines.append("$Expected = @{")
    lines.append("  'Experience Mobile' = 46")
    lines.append("  'Experience Desktop/Tablet' = 46")
    lines.append("  'Library Mobile' = 75")
    lines.append("  'Library Desktop/Tablet' = 75")
    lines.append("}")
    lines.append("")
    lines.append("$Assets = @(")
    for r in records:
        url = r.url.replace("'", "''")
        path = r.rel_path.replace("'", "''")
        meta = f"{r.product}|{r.breakpoint}|{r.family_label}|{r.route_label}"
        meta = meta.replace("'", "''")
        lines.append("  @{")
        lines.append(f"    Url = '{url}'")
        lines.append(f"    RelPath = '{path}'")
        lines.append(f"    Meta = '{meta}'")
        lines.append("  },")
    lines.append(")")
    lines.append("")
    lines.append("function Ensure-ParentDir {")
    lines.append("  param([string]$FilePath)")
    lines.append("  $dir = Split-Path -Parent $FilePath")
    lines.append("  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }")
    lines.append("}")
    lines.append("")
    lines.append("function Download-Asset {")
    lines.append("  param([string]$Url, [string]$OutFile)")
    lines.append("  Ensure-ParentDir -FilePath $OutFile")
    lines.append("  for ($i = 1; $i -le $MaxAttempts; $i++) {")
    lines.append("    try {")
    lines.append("      if (Test-Path $OutFile) { Remove-Item -Force $OutFile }")
    lines.append("      Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing -TimeoutSec 120 -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PowerShell'")
    lines.append("      if ((Test-Path $OutFile) -and ((Get-Item $OutFile).Length -gt 0)) { return $true }")
    lines.append("    } catch {")
    lines.append("      Write-Warning \"Attempt $i failed for $OutFile : $($_.Exception.Message)\"")
    lines.append("    }")
    lines.append("    Start-Sleep -Seconds $RetryDelaySec")
    lines.append("  }")
    lines.append("  return $false")
    lines.append("}")
    lines.append("")
    lines.append("Write-Host 'PRODUCTION AUTHORITY DOWNLOAD — starting...'")
    lines.append("$failures = @()")
    lines.append("$counts = @{")
    lines.append("  'Experience Mobile' = 0")
    lines.append("  'Experience Desktop/Tablet' = 0")
    lines.append("  'Library Mobile' = 0")
    lines.append("  'Library Desktop/Tablet' = 0")
    lines.append("}")
    lines.append("$i = 0")
    lines.append("foreach ($a in $Assets) {")
    lines.append("  $i++")
    lines.append("  $out = Join-Path $PSScriptRoot $a.RelPath")
    lines.append("  $metaParts = $a.Meta -split '\\|'")
    lines.append("  $bucket = switch ($metaParts[0] + ':' + $metaParts[1]) {")
    lines.append("    'experience:mobile' { 'Experience Mobile' }")
    lines.append("    'experience:desktop_tablet' { 'Experience Desktop/Tablet' }")
    lines.append("    'library:mobile' { 'Library Mobile' }")
    lines.append("    'library:desktop_tablet' { 'Library Desktop/Tablet' }")
    lines.append("  }")
    lines.append("  Write-Host (\"[{0}/{1}] {2} -> {3}\" -f $i, $Assets.Count, $a.Meta, $a.RelPath)")
    lines.append("  if (Download-Asset -Url $a.Url -OutFile $out) { $counts[$bucket]++ } else { $failures += $a.Meta + ' :: ' + $a.RelPath }")
    lines.append("}")
    lines.append("")
    lines.append("$total = ($counts.Values | Measure-Object -Sum).Sum")
    lines.append("$ok = $true")
    lines.append("foreach ($k in $Expected.Keys) {")
    lines.append("  if ($counts[$k] -ne $Expected[$k]) {")
    lines.append("    Write-Host \"VALIDATION FAIL: $k expected $($Expected[$k]) got $($counts[$k])\" -ForegroundColor Red")
    lines.append("    $ok = $false")
    lines.append("  }")
    lines.append("}")
    lines.append("if (-not $ok -or $failures.Count -gt 0) {")
    lines.append("  Write-Host ''")
    lines.append("  Write-Host 'PRODUCTION AUTHORITY EXPORT INCOMPLETE' -ForegroundColor Red")
    lines.append("  Write-Host ('FAILED: {0}' -f $failures.Count)")
    lines.append("  foreach ($f in $failures) { Write-Host ('  - ' + $f) }")
    lines.append("  exit 1")
    lines.append("}")
    lines.append("")
    lines.append("function New-AuthorityZip {")
    lines.append("  param([string]$SourceDir, [string]$ZipPath)")
    lines.append("  if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }")
    lines.append("  Compress-Archive -Path (Join-Path $SourceDir '*') -DestinationPath $ZipPath -Force")
    lines.append("}")
    lines.append("")
    lines.append("$zipRoot = $PSScriptRoot")
    lines.append("New-AuthorityZip -SourceDir (Join-Path $Root '01_EXPERIENCE/01_MOBILE') -ZipPath (Join-Path $zipRoot 'EXPERIENCE_MOBILE_AUTHORITY.zip')")
    lines.append("New-AuthorityZip -SourceDir (Join-Path $Root '01_EXPERIENCE/02_DESKTOP_TABLET') -ZipPath (Join-Path $zipRoot 'EXPERIENCE_DESKTOP_TABLET_AUTHORITY.zip')")
    lines.append("New-AuthorityZip -SourceDir (Join-Path $Root '02_LIBRARY/01_MOBILE') -ZipPath (Join-Path $zipRoot 'LIBRARY_MOBILE_AUTHORITY.zip')")
    lines.append("New-AuthorityZip -SourceDir (Join-Path $Root '02_LIBRARY/02_DESKTOP_TABLET') -ZipPath (Join-Path $zipRoot 'LIBRARY_DESKTOP_TABLET_AUTHORITY.zip')")
    lines.append("")
    lines.append("Write-Host ''")
    lines.append("Write-Host 'PRODUCTION AUTHORITY EXPORT COMPLETE'")
    lines.append("Write-Host ''")
    lines.append("Write-Host 'Experience Mobile:'")
    lines.append("Write-Host ('  {0} / 46' -f $counts['Experience Mobile'])")
    lines.append("Write-Host 'Experience Desktop/Tablet:'")
    lines.append("Write-Host ('  {0} / 46' -f $counts['Experience Desktop/Tablet'])")
    lines.append("Write-Host 'Library Mobile:'")
    lines.append("Write-Host ('  {0} / 75' -f $counts['Library Mobile'])")
    lines.append("Write-Host 'Library Desktop/Tablet:'")
    lines.append("Write-Host ('  {0} / 75' -f $counts['Library Desktop/Tablet'])")
    lines.append("Write-Host 'TOTAL:'")
    lines.append("Write-Host ('  {0} / 242' -f $total)")
    lines.append("Write-Host ('FAILED: {0}' -f $failures.Count)")
    lines.append("Write-Host ''")
    lines.append("Write-Host 'ZIP FILES:'")
    lines.append("Write-Host '  EXPERIENCE_MOBILE_AUTHORITY.zip'")
    lines.append("Write-Host '  EXPERIENCE_DESKTOP_TABLET_AUTHORITY.zip'")
    lines.append("Write-Host '  LIBRARY_MOBILE_AUTHORITY.zip'")
    lines.append("Write-Host '  LIBRARY_DESKTOP_TABLET_AUTHORITY.zip'")
    lines.append("Write-Host ''")
    lines.append("Write-Host ('EXPORT ROOT: {0}' -f $Root)")
    lines.append("")
    return "\n".join(lines) + "\n"


def main() -> None:
    items = load_all_items()
    records, stats = build_records(items)
    os.makedirs(os.path.dirname(OUTPUT_MANIFEST), exist_ok=True)
    with open(OUTPUT_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(
            {
                "projectId": "Q7IHYCEK3RPn2c1ConEG",
                "stats": {k: v for k, v in stats.items() if k not in ("missing", "ambiguous")},
                "missing": stats["missing"],
                "ambiguous": stats["ambiguous"],
                "records": [r.__dict__ for r in records],
            },
            f,
            indent=2,
        )
    ps1 = emit_ps1(records)
    with open(OUTPUT_PS1, "w", encoding="utf-8", newline="\r\n") as f:
        f.write(ps1)
    print("items", len(items))
    print("records", len(records))
    print("missing", len(stats["missing"]))
    if stats["missing"]:
        for m in stats["missing"][:20]:
            print(" ", m)
    print("written", OUTPUT_PS1)


if __name__ == "__main__":
    main()
