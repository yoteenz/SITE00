# 09 · Component variant matrix

All **124** OPUS1 components (ids unchanged), each with an authority for the five tiers.

- **Source of truth:** `registry/component-registry-responsive.json` / `.csv`, built by `registry/build-responsive-registry.py` from the OPUS1 registry.
- **Typography values:** `03_TYPOGRAPHY_REFLOW_MATRIX.md`.
- **Container rules:** `08_RESPONSIVE_GRID_SPECIFICATION.md`.
- **Live gallery:** D-15 (1440, 1920) and C-03 (390, 834, 1440, 1920). It prints computed sizes from the page itself.

**Tiers:**

| Tier | Viewport |
| --- | --- |
| M | < 768 |
| TP | 768–1023 |
| TL | 1024–1279 |
| D | 1280–1919 |
| UW | ≥ 1920 |

**Status of every row:** RESPONSIVE REFINEMENT · PROPOSED.

**Measured button and field heights (D-15):**

| Element | M / TP / TL | D / UW |
| --- | --- | --- |
| Buttons | 44 | 40 (34 small, 30 extra-small) |
| Inputs | 46 | 42 |

## SHELL (16)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SH-01 | FounderWorkspaceShell | top 52 + stage + bottom nav 72 | rail 80 + top 56 + stage | rail 80 + stage; inspector docks ≥ 1100 | sidebar 224 (248 ≥ 1600) + stage + inspector clamp(344,24vw,420) | sidebar 248 + stage (content ≤ 1760, centred) + inspector clamp(420,18vw,480) | stage scrolls; shell never scrolls horizontally | D01 TP01 TL01 C05 | 1 |
| SH-02 | FounderIdentity | in MENU drawer | rail foot plate (opens OL-18) | rail foot plate | sidebar foot: plate + FOUNDER + ADMIN · SIGNED IN | same | meta ellipsis with title | D01 TP01 | 1 |
| SH-03 | EnvironmentIndicator | header tag 16 h | rail tooltip + top bar crumb | same as TP | brand tag under SITE 00 | same | nowrap | D01 | 1 |
| SH-04 | GlobalSearch | icon → OL-04 full screen | icon → OL-04 palette 640 | field clamp(200,26vw,420) + ⌘K | field clamp(200,26vw,420) + ⌘K | field 420 | placeholder ellipsis allowed | D01 TP01 D14 | 1 |
| SH-05 | NotificationCenter | OL-05 bottom sheet | OL-05 popover 400 anchored to bell | popover 400 | popover 400, flips above when short | same | body scrolls inside popover | D01 D14 TP10 TL10 | 1 |
| SH-06 | GlobalCreate | centre CREATE block 46×38 in bottom nav | rail NEW block 48×44 | rail NEW | sidebar NEW FOUNDATION (block, 40 h) | same | never truncated (padding 12) | D01 D04 | 1 |
| SH-07 | AccountMenu | rows in MENU drawer | OL-18 popover 280 from rail foot | same | OL-18 popover opening upward from sidebar foot | same | labels ellipsis + title | D01 | 1 |
| SH-08 | BottomNav | visible: 1fr 1.3fr 64 1fr 1fr (FOUNDATIONS fits at 320) | hidden | hidden | hidden | hidden | labels never truncate (widths sized for 320) | D14 TP01 | 1 |
| SH-09 | WorkspaceMenuDrawer | OL-03 right drawer min(340,86vw) | OL-03 left drawer 320 (tools + account) | same | not used — sidebar carries tools | not used | scrolls | D14 TP01 | 1 |
| SH-10 | IndexRail | — | visible 80: icon + word (10/700) | visible 80 | — | — | words fit 72 (OPS, MAIL shortened in rail only) | TP01 TL01 | 1 |
| SH-11 | Sidebar | — | — | — | visible 224 / 248 | visible 248 | primary labels never truncate; tools may wrap | D01 C04 | 1 |
| SH-12 | InspectorHost | bottom sheet below the header, 2 px red edge | right sheet min(420,88vw) + scrim | docks at ≥ 1100 (340), sheet below | docked clamp(344,24vw,420) | docked clamp(420,18vw,480) | body scrolls; foot fixed | D03 TL03 C05 | 8 |
| SH-13 | OverlayHost | sheet / full / drawer / action | dialog / popover / palette / sheet-r / drawer | same as TP | dialog / popover / palette / inline | same, sizes capped | body scroll, sticky head/foot | D14 TP10 TL10 | 8 |
| SH-14 | FeedbackHost | toast above bottom nav (12 inset) | bottom-left of stage, ≤ 440 | same | bottom-left of stage, 440 | same | text wraps (2 lines max) | D14 | 8 |
| SH-15 | ResponsiveLayoutController | < 768 | 768–1023 | 1024–1279 | 1280–1919 | ≥ 1920 | — | D01 C03 | 1 |
| SH-16 | PageTitle (index rail + display headline) | rail index + title clamp(40,13.3vw,50) | title 48 (index rail hidden; crumb carries it) | title 48 (44 when height ≤ 860) | title 52 (44 when height ≤ 860) | title 60 | balance; never ellipsis | D02 C03 C04 | 2 |

## OVERVIEW (8)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OV-01 | OverviewPage | focus · signals · work · movement · milestone | focus · signals · needs / movement · work · milestone | stage 944: 7/5 grid, work full width | stage ≥ 1100: focus / needs · signals · work / movement | stage ≥ 1440: focus / needs / signals · work / movement | no horizontal scroll | D02 TP02 TL02 | 3 |
| OV-02 | OperationalSignals | 4-up (2×2 below 360) | 4-up strip | 4-up strip | 4-up strip | 2×2 block beside the queue | labels nowrap except phone | D02 C04 | 3 |
| OV-03 | CurrentFocus | card: label, identity, statement, CTA | card full width | card 7fr | card 7fr: identity + statement top, CTA row bottom | card 6fr | statement balance | D02 C04 | 3 |
| OV-04 | NeedsAttentionList | hidden (Reviews tab owns it) | panel beside movement | panel 5fr | panel 5fr | panel 3fr | names ellipsis + title | D02 | 3 |
| OV-05 | ActiveFoundationsList | registry card rows | registry CLIENT/STATUS/NEXT | registry 5 columns (full width) | registry 3 columns in 7fr (5 columns ≥ 1300 px of width) | registry 5 columns | see FN-05 | D02 | 3 |
| OV-06 | RecentActivity | panel | panel beside needs | panel | panel 5fr beside work | panel 3fr | sub-lines wrap | D02 | 3 |
| OV-07 | NextMilestone | panel | panel | panel | panel under work | panel | labels clamp 2 lines | D02 | 3 |
| OV-08 | OverviewEmptyErrorStates | inline states | same | same | same | same | — | D02 | 3 |

## FOUNDATIONS (10)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FN-01 | FoundationsRegistryPage | search + filter/sort icons · tabs · card rows | search row · tabs row · CLIENT/STATUS/NEXT | 1024: toolbar one row · 5 columns; 1194 + inspector: 3 columns | toolbar one row · 5 columns (3 with inspector) | 5 columns with capped widths; extra space trails | no horizontal scroll at any width | D03 TP03 TL03 C05 | 3 |
| FN-02 | RegistrySearch | field 44 h, icon + text | field 44 h | field 40 h, 260–340 | field 40 h, 260–340 | same | placeholder ellipsis | D03 | 3 |
| FN-03 | StatusViews | scrolling tabs + fade | own row, scroll + fade | beside search | beside search | beside search | scroll, never crushed | D03 C03 | 3 |
| FN-04 | FilterSortControls | OL-07 sheet | OL-07 popover 360 below FILTER | same | same | same | body scroll | D03 D14 | 3 |
| FN-05 | ClientRegistryRow | card: plate · name/cat · status + time · segments | CLIENT · STATUS (state, segments, time · step) · NEXT (owner + action) | five columns | five or three by width | five, capped | name ellipsis + title; status wraps ≤ 2 lines; next action clamp 2 | D03 C03 C05 | 3 |
| FN-06 | ClientPreviewInspector | push to record | right sheet (OL-19) | sheet < 1100, docked ≥ 1100 | docked | docked | email nowrap ellipsis + title | D03 C05 | 3 |
| FN-07 | CreateClientFlow | OL-01 full screen | OL-01 dialog min(600, 100vw−48) | dialog 600, keyboard-aware | dialog 600 | dialog 600 | body scroll, sticky footer | D04 TP04 TL04 | 3 |
| FN-08 | DuplicateWarning | banner in form | same | same | same | same | wraps | D04 | 3 |
| FN-09 | RegistryStates | inline | inline | inline | inline | inline | — | D03 | 3 |
| FN-10 | RowActionMenu | OL-06 action sheet | OL-06 popover 280 anchored to ⋯ | same | same | same | labels ellipsis | D03 D14 | 3 |

## CLIENT RECORD (13)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CR-01 | ClientRecordPage | header · progress · tabs · section · context below | same, actions under name | two zones: section / context 300–360 | two zones: section / 360 | section / 400 | no horizontal scroll | D05 TP05 TL05 | 4 |
| CR-02 | RecordHeader | plate · title 36 · cat + email | plate / title + sub; actions row | same | plate / title + sub / actions (one baseline) | same | email wraps anywhere (data) | D05 | 4 |
| CR-03 | QuickActions | 4-up icon buttons (62 h, 2-line allowed) | out buttons sm, wrap | same | out buttons sm | same | labels never truncate | D05 | 4 |
| CR-04 | JourneyTracker | abbreviated labels + dates | abbreviated | full labels (stage ≥ 920) | full labels, max 1180 | beside status column (300 + journey) | labels nowrap | D05 C04 | 4 |
| CR-05 | NextActionBlock | card | card | card | card with two CTAs | card | balance | D05 | 4 |
| CR-06 | IntakeSection | groups, one column | groups, one column | groups, two columns (≥ 760 px) | two columns | two columns | data wraps anywhere | D06 TP05 | 4 |
| CR-07 | RecommendationsSection | list with reasons | same | same | same | same | wraps | D06 | 4 |
| CR-08 | QuoteSection | table (type + unit hidden < 560) + decision below | same | table / decision 320 | table / decision 320 | same | amounts nowrap | D07 TP05 TL05 | 4 |
| CR-09 | OperationsSection | stage numbers + tasks | same | stage labels + tasks | same | same | — | D05 | 4 |
| CR-10 | RecordsSection | list + OL-10 full | panel + OL-10 dialog | same | same | same | — | D10 | 4 |
| CR-11 | CommunicationsSection | thread | thread | thread | thread (68ch) | same | — | D11 | 4 |
| CR-12 | ActivitySection | list | list | list | list | list | — | D05 | 4 |
| CR-13 | RecordSectionTabs | scrolling tabs (8) | scrolling tabs | all 8 visible at 944 | all 8 visible | same | scroll, never crushed | D05 TP05 | 4 |

## REVIEWS (7)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RV-01 | ReviewsQueuePage | queue → pushed detail + sticky bar | queue in two columns → pushed detail + sticky bar | queue / context, decision footer | stage ≥ 1160: queue / context / decision | queue 360 / context / decision 400 | panes scroll independently | D08 TP06 TL06 C06 | 5 |
| RV-02 | ReviewCategoryTabs | scrolling tabs | scrolling tabs | tabs | tabs | tabs | scroll | D08 | 5 |
| RV-03 | ReviewItem | q-item | q-item (2-up) | q-item | q-item | q-item | ellipsis + title | D08 | 5 |
| RV-04 | ReviewDetail | pushed page | pushed page | context pane | context pane | context pane (kv two columns ≥ 720) | data wraps | D09 | 5 |
| RV-05 | DecisionControls | sticky bar: REQUEST REVISION · APPROVE (wraps at 320) | same | footer grid: choices / note / CTA (dec ≥ 560) | pane: stacked choices, note, CTA | same | buttons wrap rows, never truncate | D09 TL06 C06 | 5 |
| RV-06 | ReviewHistory | tab | tab | tab | tab | tab | — | D08 | 5 |
| RV-07 | ReviewStates | inline | inline | inline | inline | inline | — | D09 | 5 |

## OPERATIONS (11)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OP-01 | OperationsPage | runbook strip · main · context below | same | runbooks / main; context 3-up below | stage < 1440: runbooks / main; context 3-up below | runbooks / main / context | no horizontal scroll | D10 TP07 TL07 | 6 |
| OP-02 | ActiveWorkGroups | horizontal card strip | card strip | list 280 | list 280–300 | list 320 | name ellipsis | D10 | 6 |
| OP-03 | StageRail | numbers only | numbers only | labels (2-line clamp) | labels | labels | numbers-only below 700 px of width | D10 C04 | 6 |
| OP-04 | TaskRow | row: box · title/key · mode + status stacked | same | row | row (text ≤ 480, status after) | same | title ellipsis + title | D10 | 6 |
| OP-05 | TaskInspector | OL-12 sheet | sheet | docked ≥ 1100 | docked | docked | body scroll | D10 TL07 | 6 |
| OP-06 | DependencyView | list | list | list | segmented view | same | — | D10 | 6 |
| OP-07 | VerificationCenter | panel | panel | 3-up row | side column at stage ≥ 1440 | side | keys ellipsis | D10 | 6 |
| OP-08 | ClientActionRequirements | panel | panel | 3-up row | side | side | — | D10 | 6 |
| OP-09 | BlockerControls | OL-13 sheet | OL-13 dialog 500 | dialog | dialog | dialog | — | D10 TP07 | 6 |
| OP-10 | RunbookSetup | sheet | dialog | dialog | dialog | dialog | — | D10 | 6 |
| OP-11 | StageUpdate | sheet | dialog | dialog | inspector | inspector | — | D10 | 6 |

## CORRESPONDENCE (8)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CO-01 | CorrespondencePage | index → pushed thread | index → pushed thread | index / thread | index / thread / context (stage ≥ 1160) | same; thread stays 68ch centred | panes scroll | D11 TP08 TL08 | 6 |
| CO-02 | CommunicationActivity | list | list | list | table | table | — | D11 | 6 |
| CO-03 | ClientThread | thread + composer above keyboard | same | thread pane | thread pane, max 68ch + 96 | same | messages wrap; never wider than 88% | D11 TP08 | 6 |
| CO-04 | LifecycleMap | table in a scrolling panel | same | table | table | table | panel scrolls horizontally if needed | D11 TP08 | 6 |
| CO-05 | EmailPreview | sheet | sheet | docked ≥ 1100 | docked | docked | — | D11 | 6 |
| CO-06 | OutboundApproval (gated send) | OL-15 sheet | OL-15 dialog 540 | dialog | dialog | dialog | — | D13 | 6 |
| CO-07 | StudioLink | row | button | button | header button | same | — | D11 | 6 |
| CO-08 | CommunicationPreferences (read) | row | kv | kv | context pane kv | same | — | D11 | 6 |

## SYSTEM (13)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SY-01 | SystemPage | tabs · verdict · console rows | same | full console row at ≥ 960 | console + attention order beside at stage ≥ 1440 | same | no horizontal scroll | D12 TP09 TL09 C07 | 7 |
| SY-02 | ReadinessVerdict | band, chips wrap | band | band + chips right (≥ 760) | same | same | chips wrap | D12 | 7 |
| SY-03 | ModuleCard + ModuleDetail | row: icon · module + detail · status | same | MODULE / STATUS / AREA / DETAIL / CHECKED | same | same | detail ellipsis on narrow, wraps on wide | D12 C07 | 7 |
| SY-04 | StagingStack | console rows | same | same | same | same | — | D12 | 7 |
| SY-05 | Integrations | console rows | same | same | same | same | — | D12 | 7 |
| SY-06 | DatabaseSecurityProbe | console rows | same | same | same | same | — | D12 | 7 |
| SY-07 | ReadinessReport | stacked | stacked | console | console | console | — | D12 | 7 |
| SY-08 | TechnicalConfiguration | details in sheet | details in sheet | details in inspector | details | details | names ellipsis + title | D12 | 7 |
| SY-09 | BuildMeta | line | line | line | line | line | wraps | D12 | 7 |
| SY-10 | TestLab · CreateSyntheticClient | panel | panel | 2-up | 2-up | 3-up | — | D13 | 7 |
| SY-11 | TestLab · Journey | panel | panel | 2-up | 2-up | 3-up | — | D13 | 7 |
| SY-12 | TestLab · EmailEvents | panel | panel | 2-up | 2-up | 3-up | — | D13 | 7 |
| SY-13 | TestLab · ContinuityChecks | panel | panel | 2-up | 2-up | 3-up | — | D13 | 7 |

## SHARED (18)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SC-01 | ClientPlate (identity) | 44 / 64 / 36 / 30 | same | same | same | same | — | D15 | 2 |
| SC-02 | StatusMark + StatusLabel | mark 7 + label 10/700 | label 11 | label 11 | label 11 | label 12 | wraps ≤ 2 lines, never ellipsis | D15 | 2 |
| SC-03 | PhaseSegments + Journey | segments + abbreviated journey | abbreviated | full ≥ 920 | full, max 1180 | same | nowrap labels | D15 C04 | 2 |
| SC-04 | StatusChip | chip 22 h, 10/700 | same | same | same | same | nowrap | D15 | 2 |
| SC-05 | ActivityRow | time 52 · mark · text | same | same | same | same | wraps | D15 | 2 |
| SC-06 | Button | 44 h (36 sm, 30 xs), 11 px | 44 h | 44 h | 40 h (34 sm, 30 xs), 12 px | same | single line, never truncated | D15 C04 | 2 |
| SC-07 | Field | 46 h, 16 px input | 46 h, 15 px | 46 h, 15 px | 42 h, 14 px | same | value ellipsis; textarea wraps | D15 | 2 |
| SC-08 | ActionMenu | action sheet | popover | popover | popover | popover | ellipsis + title | D14 | 2 |
| SC-09 | Sheet | bottom sheet, square, 2 px red edge (FD-6) | right sheet | right sheet | — | — | body scroll | D14 | 2 |
| SC-10 | Tabs + SegmentedControl | scroll strip | scroll strip | scroll strip | inline | inline | scroll | D15 | 2 |
| SC-11 | Dialog + Confirmation | sheet or full screen | dialog min(w, 100vw−48) | same, keyboard-aware | dialog, max h min(100dvh−96, 820) | same | body scroll | D14 | 2 |
| SC-12 | EmptyState | dashed panel | same | same | same | same | — | D02 D03 | 2 |
| SC-13 | Skeleton + StaleBanner | skeleton rows | same | same | same | same | — | D02 | 2 |
| SC-14 | Toast | above bottom nav | stage bottom-left | same | same | same | wraps | D14 | 2 |
| SC-15 | ErrorBanner + TechnicalDetail | banner + details | same | same | same, max 760 | same | wraps | D02 | 2 |
| SC-16 | ThresholdObject (decorative) | crown ≤ 104 h in title | same | same | right of header, ≤ 104 h | same | never overlaps content | D02 D12 | 2 |
| SC-17 | KeyValueList | dt 34% / dd | same | two columns ≥ 720 | same | same | data wraps anywhere | D15 | 2 |
| SC-18 | LinkBlock (copy) | 44 h block | same | same | same | same | ellipsis + full value on copy | D05 | 2 |

## OVERLAY (20)

| ID | Component | M | TP | TL | D | UW | Overflow / wrapping | Boards | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OL-01 | Create foundation (sheet / dialog) | full | dialog 600 | dialog 600 | dialog 600 | dialog 600 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-02 | Link ready | full | dialog 560 | dialog 560 | dialog 560 | dialog 560 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-03 | Workspace menu drawer | drawer right | drawer left 320 | drawer left 320 | n/a (sidebar) | n/a (sidebar) | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-04 | Search / command palette | full + keyboard | palette 640 | palette 640 | palette 680 | palette 680 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-05 | Notification center | sheet | popover 400 | popover 400 | popover 400 | popover 400 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-06 | Row action menu | action sheet | popover 280 | popover 280 | popover 280 | popover 280 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-07 | Filter / sort | sheet | popover 360 | popover 360 | popover 360 | popover 360 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-08 | Approve quote confirmation | sheet | dialog 500 | dialog 500 | dialog 500 | dialog 500 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-09 | Revise quote / manual adjustment | full | dialog 720 | dialog 720 | dialog 720 | dialog 720 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-10 | Mark foundation complete | full | dialog 560 | dialog 560 | dialog 560 | dialog 560 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-11 | Request changes / add note | sheet + keyboard | dialog 520 | inline decision footer | inline decision pane | inline decision pane | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-12 | Task detail | inspector sheet | inspector sheet | inspector docked ≥ 1100 | inspector docked | inspector docked | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-13 | Set blocker | sheet | dialog 500 | dialog 500 | dialog 500 | dialog 500 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-14 | Compose message | inline composer + keyboard | inline composer | inline composer | inline composer | inline composer | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-15 | Send (gated, approval tick) | sheet | dialog 540 | dialog 540 | dialog 540 | dialog 540 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-16 | System module detail | inspector sheet | inspector sheet | docked ≥ 1100 | docked | docked | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-17 | Reset test data confirmation | sheet + keyboard | dialog 500 | dialog 500 | dialog 500 | dialog 500 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-18 | Account menu | in MENU drawer | popover 280 from rail foot | popover 280 | popover 280, opens upward | popover 280, opens upward | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-19 | Client preview (inspector as sheet) | push to record | inspector sheet | sheet < 1100 / docked | docked | docked | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |
| OL-20 | Technical error detail | inline details | inline details | inline details | inline details, max 760 | inline details, max 760 | max-height = viewport − margins − keyboard; body scrolls; head and foot sticky | D14 TP10 TL10 | 8 |

Typography, layout, interaction, accessibility and regression columns for each row are in the JSON / CSV registry; they are summarised by family in `17_OPUS2_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md`.
