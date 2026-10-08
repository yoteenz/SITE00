# Asset model

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

| Class | Layer | Definition | Rules |
|---|---|---|---|
| EMAIL_ENVIRONMENT | L1 | Broad contextual visual: still life, architectural scene, crop or texture. | No text, numbers or UI. Never an app screenshot. Exported 1280 px wide (2×). |
| EMAIL_ARTIFACT_SHELL | L2 | The correspondence object with no live content: envelope, dossier, sheet, invitation, ledger head, card edges. | Blank where live content sits; the body of a sheet is an HTML paper cell, not an image. Edges and heads are sliced so the HTML cell between them can grow. |
| EMAIL_DECORATIVE_INSERT | L2 | Classical print, botanical, paper fragment, ribbon, seal, clip. | Decorative (alt="") unless it carries meaning. No words or figures in seals or prints. |
| EMAIL_THUMBNAIL | L2 | Small contextual image (≤ 240 px display). | Never a product screenshot. |
| EMAIL_LIVE_CONTENT | L3 | Headlines, copy, figures, dates, CTAs, links, legal. | HTML only — never an image. |

## Lineage groups
| Group | Families | Emails | Materials | Founded by |
|---|---|---|---|---|
| ARRIVAL | E01, E02 | A01, A04 | morning still life on stone and linen, heavy cream stock, olive emboss | A01 |
| SECURE_CORRESPONDENCE | E06 | A02, A08 | plain correspondence card, blind emboss, no environment | A02 |
| DESK_NOTE | E05 | A03, A06 | pinned note / desk slip, brass clip, pencil rule | A03 |
| BRIEFING | E03 | A05 | clipped briefing sheet, ledger rules, narrow desk crop | A05 |
| CEREMONIAL | E04 | A07 | ceremonial card, wax / blind seal, burgundy, brass | A07 |
| FIELD_GUIDE | E02 | — | annotated field guide pages, botanical and architectural plates | — |
| EDITORIAL | E07 | — | magazine spreads, broadsides, art-history references — per campaign | — |

## Reuse rules
| Action | When | Never |
|---|---|---|
| REUSE | Same lineage group and the asset fits the new email unchanged (same artifact, new crop or new live content). | Reuse an environment across different lineage groups just to save work. |
| DERIVE | Same material family, different object or format (A04 entry card from the A01 letter stock; A06 slip from the A03 note). | Derive across families whose mood conflicts (ceremonial seal into a security email). |
| REGENERATE | An approved asset fails QA (resolution, artefacts, dark-mode edges) or the founder asks for a revision; keep the slot, replace the file, record the superseded version. | Regenerate silently; the old version is marked SUPERSEDED, not deleted. |
| CREATE_NEW | First asset of a lineage group, or a new message type the existing groups cannot carry. | Create a new world per email. |

- PAGE / AUTHORITY FIRST → asset decomposition second. Do not generate random plates in advance.
- Every asset records: class, lineage group, lineage action, source authority, approval state, superseded-by.
- No live content in any asset (names, figures, dates, CTA labels, links, legal text).
- At most one arch or loggia per lineage group; none in SECURE_CORRESPONDENCE.

## Planned slots (nothing generated)
| Email | Slot | Class | Action | Note |
|---|---|---|---|---|
| A01 | L1 arrival still life | EMAIL_ENVIRONMENT | CREATE_NEW | Founds the ARRIVAL lineage; reused by A04. |
| A01 | L2 welcome letter shell (top + edges) | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Blank stock; headline and copy stay HTML. |
| A01 | olive emboss | EMAIL_DECORATIVE_INSERT | CREATE_NEW | Shared ARRIVAL mark. |
| A02 | L2 correspondence card shell | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Founds SECURE_CORRESPONDENCE; reused by A08. |
| A02 | blind emboss mark | EMAIL_DECORATIVE_INSERT | CREATE_NEW | Shared security mark. |
| A03 | L2 pinned note shell | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Founds DESK_NOTE; derived by A06. |
| A03 | brass clip | EMAIL_DECORATIVE_INSERT | CREATE_NEW | Shared DESK_NOTE detail. |
| A04 | L1 arrival still life | EMAIL_ENVIRONMENT | REUSE | From A01, new crop. |
| A04 | L2 entry card shell | EMAIL_ARTIFACT_SHELL | DERIVE | Derived from the A01 letter stock. |
| A05 | L1 briefing desk crop | EMAIL_ENVIRONMENT | CREATE_NEW | Founds BRIEFING; monthly brief reuses it. |
| A05 | L2 briefing sheet head (clip + torn top) | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Body of the sheet is an HTML paper cell. |
| A06 | L2 desk slip shell | EMAIL_ARTIFACT_SHELL | DERIVE | Derived from the A03 pinned note stock. |
| A07 | L1 ceremonial still life | EMAIL_ENVIRONMENT | CREATE_NEW | Founds CEREMONIAL; all milestone states reuse it. |
| A07 | L2 milestone card shell | EMAIL_ARTIFACT_SHELL | CREATE_NEW | Blank card. |
| A07 | seal | EMAIL_DECORATIVE_INSERT | CREATE_NEW | No text or numbers in the seal. |
| A08 | L2 correspondence card shell | EMAIL_ARTIFACT_SHELL | REUSE | From A02. |
| A08 | blind emboss mark | EMAIL_DECORATIVE_INSERT | REUSE | From A02. |
