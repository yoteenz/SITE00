# 09 — Identity pack and Look preset recommendations

## 1. Required identity references (sprint §07) against what exists

Key: ● exists with images · ○ slot or field only · — absent

| Reference | Studio World catalogue | CAST NDX (NDXBOOK) | THE EXCHANGE | Residents (branch) |
| --- | --- | --- | --- | --- |
| Primary facial master | ○ FRONTAL view, `storagePath: null` | ● identity anchor (Supabase) | ● Sloane, Gideon locked; Richard, Vivienne, Nadine provisional | ● casting thumbnail, natural authority (IN_REVIEW) |
| Full-body reference | ○ FULL_BODY view | ○ FULL_BODY role | — Kai's full body founder-held | ● uniform full body (IN_REVIEW) |
| Front angle | ○ | ● 12-angle turnaround slots | ● facial identity sheet and face-lock board per character (angles inside not itemized in the registry) | ● geometry slots |
| Three-quarter angles | ○ THREE_QUARTER | ● turnaround | not itemized; Kai's 10 close-up angles founder-held (UNIMPORTED) | ● geometry slots |
| Side profiles | ○ PROFILE | ● turnaround (SIDE) | not itemized | ● geometry slots |
| Expression references | — | ○ Bible slots | — | — |
| Body proportions | text field | `VisualIdentityLock.build` (text) | `heightAndProportions: null` | — |
| Hairline and hair texture | text | `hairline`, `hairTexture`, `hairDensity` (text) | `hairAndGrooming: null` | — |
| Skin tone authority | text | `skinTone` (text) | in master image only | — |
| Distinctive facial details | text | `identitySignature` (text) | in master image only | — |
| Approved identity constraints | `immutable: true` on authority | `constraints` | founder lock status | — |

Evidence:
- `shared/site00-studio-world/acting-catalogue/seedCatalogue.ts` L22–27
- `shared/site00-studio-world-production/characterVisualCasting/*`
- `THE_EXCHANGE/MANIFEST/CHARACTER_VISUAL_REGISTRY_V1.json` (asset types FACIAL_IDENTITY_SHEET and FACE_LOCK_EDITORIAL_BOARD)
- `THE_EXCHANGE/SEASON_1/CAST_REGISTRY_V1.json` (fields and 12 BLOCKER findings)
- residents branch @ a11622d1

**Redundancy.** Four different angle schemes exist:
- 4 catalogue views;
- 5 Actor Genesis angles;
- the 12-angle CAST NDX turnaround;
- 14 resident geometry slots.

One pack definition should replace them, mapping to each.

**Can be generated automatically, after founder approval of the job:** missing angles and full body derived from an approved facial master.

**Requires founder approval:** every new view before it becomes identity material.

**Must remain unchanged:** any view marked locked or immutable, and the founder-selected face masters (hash-checked).

## 2. One-click identity pack (proposal)

One action, **Complete identity pack**, on an Actor:

1. **Inventory.** List the pack's required views. Mark each as approved, in review or missing, from the canonical registry (D-05).
2. **Plan.** For missing views only, propose one job each with route, input (the approved master, as IDENTITY_REFERENCE) and quote. Nothing is proposed for an approved view.
3. **Authorize.** Founder approves the plan and budget (the same gate as scene jobs, G-COST-02).
4. **Generate.** One candidate per missing view by default. More only if the founder asks.
5. **Review.** Each candidate is approved or rejected individually against the master.
6. **Lock.** An approved view is hashed, stored and becomes immutable. A rejected one is kept for provenance.

| Rule (sprint §07) | How it is enforced |
| --- | --- |
| Generate only missing references | Inventory step; the job planner refuses a target with an approved view |
| Never overwrite approved identity | Immutable views; the store rejects writes to a locked view (pattern: `assertWorkingDraft`, `manifest.ts`) |
| No unnecessary variations | One candidate per view by default |
| Never replace a selected face for attractiveness | The master is input only; the pack never proposes a new master |
| Never smooth distinctive features | The approval checklist names the actor's distinctive details; the founder confirms each |
| Never change ethnicity, age, proportions or structure | Prompt carries the locked descriptors from the record; a candidate that changes them is rejected, and the founder decides |

Owner: Character Studios. Depends on: G-ID-02, G-ID-03, G-ASSET-01, G-COST-02. Acceptance: on an actor with N missing views, at most N jobs are proposed and quoted, no approved view changes, and each approval is recorded. Gap: G-ID-05.

For THE EXCHANGE the first step is not generation. It is importing the founder-held files: Kai's 10 close-ups and full body, and Sloane's wardrobe (G-ID-06). That costs nothing.

## 3. Look presets

**Structure (G-LOOK-01):**

```
Look
  lookId, version, label (e.g. EVENING ARRIVAL), characterId
  items: wardrobe[], hair, makeup, jewelry[], nails, accessories[], footwear, skinFinish
  styling: direction, era, presentation notes
  references: approved files per item (WARDROBE_AUTHORITY), each hashed
  approval: state, by, at, history
  usedBy: shot IDs (computed)
```

**Behaviour:**
- Selecting a Look on a shot binds exactly its approved references.
- Editing any item creates a new version.
- Shots on the old version are listed for the founder, not silently changed.
- A Look never carries facial references, so a wardrobe change cannot change the face.
- Reusable items (a necklace used in several Looks) are referenced, not copied. The type `WardrobeItem` exists for this (`shared/site00-studio-world/modular-production-engine/operational/wardrobeDepartment.ts:32`).

**THE EXCHANGE today.** No principal Look can be filled. All six wardrobe entries and all six props are DESIGN_REQUIRED (G-LOOK-04; deliverable 04 §4). The structure can be built now; the values come only from founder-approved references when they exist.

**Global, not Exchange-specific.** The preset structure belongs to Character Studios and carries no Exchange fields. THE EXCHANGE supplies its Looks as data through its project authority package.

## 4. Recommendations

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| I-01 | One identity pack definition mapped to the four angle schemes | Character Studios | D-05 | Each existing slot maps to exactly one pack view |
| I-02 | Complete identity pack action (above) | Character Studios | G-ID-02, G-COST-02, G-ASSET-01 | As in §2 |
| I-03 | Import THE EXCHANGE's founder-held references | Founder, then Character Studios | Founder supplies files | Cast registry BLOCKER findings reach 0 |
| L-01 | Versioned Look with item references | Character Studios | G-DATA-01 | Look v2 to v3 lists affected shots; v2 shots unchanged |
| L-02 | Nails and accessories in the fabrication manifest | Character Studios | L-01 | Round-trip test passes |
