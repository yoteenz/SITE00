# Visual authority foundation

**Status:** the two-font rule is LOCKED by the founder; everything else is PROPOSED. Boards 27 (component system) and 24 (states). Proposal stylesheet: `boards/src/fw.css` (board use only; never imported by the app).

## 1. Typography: two families

Verified in source, not inferred from screenshots:

| Family | Files | Declared in | Weights | Use |
| --- | --- | --- | --- | --- |
| SITE 00 Display | `public/site00-correspondence-studio/fndatn-01/fonts/site00-correspondence-display.woff2` (one cut) | `src/site00/styles/site00-correspondence-fonts.css` | Declared 400–900 against the single file | Headlines, sheet titles, numerals of record |
| Saira Semi Condensed | `public/site00-correspondence-studio/fndatn-01/fonts/saira-semi-condensed-latin-{300…700}.woff2` | same | 300–700 | Everything else |

These are the IDNTY intake faces: the Digital Foundation client uses them through `--df-display` and `--df-text` (`src/site00/styles/site00-df-client.css`). **Inside the founder workspace:**
- Martian Mono (admin shell, `src/site00/styles/tokens.css:33-44`) is **not used**.
- Barlow Condensed (Correspondence Studio) is **not used**.

Correspondence Studio keeps its own chrome (FD-W10).

### Type scale

| Role | Family / weight | Size (board) | Tracking | Notes |
| --- | --- | --- | --- | --- |
| H1 desktop | Display 900 | 68 / 0.84 | 0 | Index rail above, red period after |
| H1 phone | Display 900 | 50 / 0.84 | 0 | Two lines max |
| H2 (sheet, focus, record name) | Display 900 | 26–36 / 0.88 | 0 | |
| Numeral of record | Display 900 | 30–44 | 0 | Signals, totals |
| H3 section | Saira 700 | 11 | 0.22em | |
| Row title | Saira 700 | 11.5 | 0.14em | Ellipsis, never wraps in a row |
| Label | Saira 700 | 8 | 0.20em | Muted |
| Meta | Saira 500 | 8.5 | 0.16em | Muted |
| Index | Saira 400 | 12.5 | 0.02em | Red |
| Data | Saira 500 | 10–12 | 0.02em | `.fw-data`, case preserved |

**Readability (FD-W8).** The board scale matches the shipped DF client (`site00-df-client.css` uses 7.5–11 px tracked uppercase for labels). The sprint asks to avoid unreadably tiny labels, and the workspace is an operational tool used for long sessions. The recommended implementation minimums on phones are:
- Label and meta: 10 px.
- Row title: 12 px.
- Data: 12 px.

Sizes must be set in rem so the browser text size scales them. The founder confirms whether the workspace follows the DF client scale exactly or uses these minimums.

### Case

- `text-transform: uppercase` is applied to application copy at the workspace root.
- Case-sensitive values carry `.fw-data` and are never transformed: email, domain, personal link, token, artifact id, template id, environment variable names, provider ids, typed search text and message bodies.
- Names render uppercase as presentation only; the stored value is unchanged.

## 2. Tokens

The proposal extends the live DF tokens rather than introducing a new system.

| Proposal token | Value | DF source token |
| --- | --- | --- |
| `--fw-page` | #fbfaf8 | (new, lighter than `--df-bg` for long sessions) |
| `--fw-surface` | #ffffff | — |
| `--fw-chamber` | #f3f2ef | `--df-bg` |
| `--fw-hair` | #eeede9 | — |
| `--fw-rule` | #dcdad5 | `--df-rule` |
| `--fw-rule-strong` | #c9c7c2 | `--df-rule-strong` |
| `--fw-ink` | #0c0c0c | `--df-ink` |
| `--fw-ink-2` | #2f2f2e | `--df-ink-2` |
| `--fw-muted` | #75736e | `--df-muted` |
| `--fw-faint` | #a3a19c | `--df-faint` |
| `--fw-red` | #ce1017 | `--df-red` |
| `--fw-red-ink` | #b30f17 | `--df-red-ink` |
| `--fw-red-tint` | #fff5f5 | `--df-red-tint` (opaque equivalent) |
| `--fw-ok` | #2e7a4b | — (system chips only) |
| `--fw-warn` | #a65208 | — (expiry, not-awaited persistence) |
| `--fw-r` | 3 px | form-control authority radius |
| `--fw-display` / `--fw-text` | as §1 | `--df-display` / `--df-text` |

**Red is reserved** for:
- founder decisions
- the create action
- focus frames
- destructive confirmation
- the red period

It is never decoration on data.

**Green** appears only in system chips where a check actually passed. There are no shadows except the 2 px red inset selection rule.

## 3. Status grammar

Two separate vocabularies, never mixed:

**Marks: whose move a client is on** (square, 8 px). Rules from DATA_CONTRACT_MAPPING.md §2.

| Mark | Meaning |
| --- | --- |
| Red solid | Founder decision pending (the only red status) |
| Hollow ink | Waiting on the client |
| Ink solid | SITE 00 working |
| Hollow red | Blocked |
| Grey | Done |
| Hollow grey | Not started |
| Hatched | Synthetic test |

**Chips: the condition of a thing** (system check, quote, send).

| Chip | Meaning | Never used for |
| --- | --- | --- |
| OK (green outline) | A real check ran and passed | An endpoint merely responding |
| NEEDS FOUNDER (red outline) | Configuration required; the founder can act | Deliberate policy |
| OFF BY POLICY (hatched + lock) | Disabled on purpose | Errors |
| UNVERIFIED (dashed) | No check exists or it has not run | Passing |
| FAILED (red solid) | A check ran and failed | Unknown |
| TEST (ink outline) | Synthetic / Stripe test keys | Real clients |
| WARN (amber) | Time-bound (quote expiry) or not-awaited write | Errors |
| MUTED | Neutral fixed values ("NOT PASSED · BY DESIGN") | |

**Progress.**
- Eight display phases (INVITED, INTAKE, RECOMMEND, QUOTE, PAYMENT, SETUP, VERIFY, COMPLETE), shown as 3 px segments or as a journey of square nodes:
  - done = ink + check
  - current = red (founder) or ink outline (client)
  - blocked = red "!"
- **No percentages** exist in the data (G-02), so none are shown. The reference's "70% COMPLETE" becomes "STEP n OF 8" (FD-W11).

## 4. Controls

| Control | Grammar |
| --- | --- |
| Primary (decide) | Ink fill, white label, arrow; one per view (FD-W9) |
| Create / destructive | Red fill |
| Secondary | 1 px ink outline |
| Navigate | Ghost (no border), optional leading icon |
| Disabled by policy | Hatched, lock icon, names the reason; stays focusable |
| Busy | Keeps width; "WORKING…" |
| Focus | 1 px red frame + 1 px inset (form-control authority) |
| Fields | From the form-control visual authority (PR #1658, PROPOSED): label above, red square on focus and on error, message below |
| Heights | 44 px touch, 36–40 px desktop dense |

Geometry is rectilinear with a 3 px radius. The references' circular create button and journey nodes become rectilinear (FD-W4).

## 5. Imagery

- **Client identity:** a typographic plate (two initials and a threshold sliver).
  - A red sliver means a founder decision is pending; hatched means test.
  - No client photography exists and none is invented.
  - An image slot is reserved for future approved client assets (FD-W3).
- **Architecture:** the DF threshold objects (`DfThresholdHero`, `DfCrownObject`, `DfCornerFragment` in `src/site00/foundation-client/objects.tsx`, "purely decorative, never carries client data").
  - Used at most once per destination title (FD-W14).
  - Never behind data.
- **Not used:**
  - FNDATN-01 email art (email-only, approval pending)
  - NDXBOOK founder workspace CSS (different product)
  - generated imagery

## 6. Icons

Every glyph comes from the DF icon catalog: 16 families, 142 icons plus 6 legacy extras (`src/site00/foundation-client/icons/meta.ts`, `glyphs.ts`). Icons are 1.5 px stroke, round caps, decorative (`aria-hidden`) unless they are the only content of a button, which then carries an `aria-label`.
