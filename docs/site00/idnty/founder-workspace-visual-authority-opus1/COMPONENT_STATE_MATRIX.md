# Component state matrix

**Status:** PROPOSED. Generated with the registry (`registry/build-registry.py`). Every interactive component uses one of the shared **state sets** below, or a custom list where its states come from a real enum (task status, stage status). Visuals for each state are on boards 24 (overlays and states) and 27 (component system).

## State sets

| Set | States | Visual rule | Accessibility |
| --- | --- | --- | --- |
| `nav` | default · hover · focus-visible · active/current · badge | Current = red index + red rule (sidebar), red top rule (bottom nav); badge = red count chip | nav landmark; aria-current="page"; 44×44 targets; badge text read as “3 founder decisions” |
| `button` | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline | Focus = 1 px red frame + 1 px inset; busy keeps width and label “WORKING…”; disabled-by-policy hatched with lock + reason | native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable) |
| `field` | empty · placeholder · focus · filled · invalid · read-only · disabled | Focus = red frame + red square before label; invalid = red frame + message with red square; data values keep case | label for/id; aria-invalid + aria-describedby to error; inputmode/autocomplete per type; case-sensitive values never CSS-uppercased |
| `row` | default · hover · focus-visible · selected · loading (skeleton) · stale | Hover = surface white; selected = 2 px red inset rule; skeleton mirrors geometry | row is a link/button with an accessible name = client + status + whose move; chevron decorative |
| `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) | Skeleton rows; filtered-empty names the filter + CLEAR; error banner + RETRY; stale banner with time | list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container |
| `panel` | loading · populated · empty · error + retry · partial (data gap labelled) | Section skeleton; section error with RETRY; data gaps as “—” | section with heading; heading levels follow page outline |
| `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) | 2 px red top rule; scrim 46 % ink; sheet from bottom (phone) / dialog centred (tablet, desktop) | role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel |
| `decision` | available · confirming · busy · success · error · unavailable (reason) | Primary ink; consequence named; confirmation sheet/dialog; success toast; failure keeps context | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |
| `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted | ok green outline · needs-founder red outline · policy hatched + lock · unverified dashed · failed red solid · test ink outline · warn amber | text, not colour, carries meaning; icon decorative; contrast ≥ 4.5:1 |
| `mark` | founder · client · work · blocked · done · idle · test | founder red solid · client hollow ink · work ink solid · blocked hollow red · done grey · idle hollow grey · test hatched | mark is aria-hidden; adjacent text carries the meaning |
| `tabs` | default · hover · focus-visible · selected · with count · overflow scroll | Selected = ink label + 2 px red underline; counts as count chips; phone strips scroll with the selected tab kept in view | tablist/tab/tabpanel; arrow keys move; counts included in tab name |
| `search` | idle · focus · typing · results · no results · min-length hint · error | Results grouped (clients, reviews, go to); highlighted row = red inset rule | combobox + listbox; ↑↓ ↵ ESC; results announced |
| `toast` | success · error (persists) · dismissed | Success ink; error white with red border, persists until dismissed | role=status (success) / role=alert (error); not the only feedback for errors |
| `send` | dry run · gated (reason) · approval required · confirming · accepted · failed · delivered (webhook only) | Status chips mirror SendIntentStatus; DELIVERED only from webhook; gated sends show the failing gate | primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect |

## Matrix (component × state set)

| ID | Component | State set | States |
| --- | --- | --- | --- |
| SH-01 | FounderWorkspaceShell | `nav` | default · hover · focus-visible · active/current · badge |
| SH-02 | FounderIdentity | `button` | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| SH-03 | EnvironmentIndicator | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SH-04 | GlobalSearch | `search` | idle · focus · typing · results · no results · min-length hint · error |
| SH-05 | NotificationCenter | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| SH-06 | GlobalCreate | `button` | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| SH-07 | AccountMenu | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| SH-08 | BottomNav | `nav` | default · hover · focus-visible · active/current · badge |
| SH-09 | WorkspaceMenuDrawer | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| SH-10 | IndexRail | `nav` | default · hover · focus-visible · active/current · badge |
| SH-11 | Sidebar | `nav` | default · hover · focus-visible · active/current · badge |
| SH-12 | InspectorHost | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| SH-13 | OverlayHost | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| SH-14 | FeedbackHost | `toast` | success · error (persists) · dismissed |
| SH-15 | ResponsiveLayoutController | `custom` | phone <768 · rail 768–1279 · sidebar ≥1280 · dock if width−nav ≥1100 |
| SH-16 | PageTitle (index rail + display headline) | `custom` | default |
| OV-01 | OverviewPage | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| OV-02 | OperationalSignals | `custom` | default · selected · attention (red when >0) · loading · error “—” |
| OV-03 | CurrentFocus | `custom` | decision pending · none pending (calm state) · loading · error |
| OV-04 | NeedsAttentionList | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| OV-05 | ActiveFoundationsList | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| OV-06 | RecentActivity | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| OV-07 | NextMilestone | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| OV-08 | OverviewEmptyErrorStates | `custom` | empty (first use) · all clear · error + retry · stale |
| FN-01 | FoundationsRegistryPage | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| FN-02 | RegistrySearch | `search` | idle · focus · typing · results · no results · min-length hint · error |
| FN-03 | StatusViews | `tabs` | default · hover · focus-visible · selected · with count · overflow scroll |
| FN-04 | FilterSortControls | `custom` | closed · open · applied (count) · reset |
| FN-05 | ClientRegistryRow | `row` | default · hover · focus-visible · selected · loading (skeleton) · stale |
| FN-06 | ClientPreviewInspector | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| FN-07 | CreateClientFlow | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| FN-08 | DuplicateWarning | `custom` | none · possible match |
| FN-09 | RegistryStates | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| FN-10 | RowActionMenu | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| CR-01 | ClientRecordPage | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| CR-02 | RecordHeader | `custom` | default · test client (hatched) · blocked · complete |
| CR-03 | QuickActions | `button` | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| CR-04 | JourneyTracker | `mark` | founder · client · work · blocked · done · idle · test |
| CR-05 | NextActionBlock | `decision` | available · confirming · busy · success · error · unavailable (reason) |
| CR-06 | IntakeSection | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| CR-07 | RecommendationsSection | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| CR-08 | QuoteSection | `decision` | available · confirming · busy · success · error · unavailable (reason) |
| CR-09 | OperationsSection | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| CR-10 | RecordsSection | `decision` | available · confirming · busy · success · error · unavailable (reason) |
| CR-11 | CommunicationsSection | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| CR-12 | ActivitySection | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| CR-13 | RecordSectionTabs | `tabs` | default · hover · focus-visible · selected · with count · overflow scroll |
| RV-01 | ReviewsQueuePage | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| RV-02 | ReviewCategoryTabs | `tabs` | default · hover · focus-visible · selected · with count · overflow scroll |
| RV-03 | ReviewItem | `row` | default · hover · focus-visible · selected · loading (skeleton) · stale |
| RV-04 | ReviewDetail | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| RV-05 | DecisionControls | `decision` | available · confirming · busy · success · error · unavailable (reason) |
| RV-06 | ReviewHistory | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| RV-07 | ReviewStates | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| OP-01 | OperationsPage | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| OP-02 | ActiveWorkGroups | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| OP-03 | StageRail | `custom` | done · current · blocked · future |
| OP-04 | TaskRow | `custom` | NOT_READY · READY · IN_PROGRESS · WAITING_CLIENT · WAITING_PROVIDER · BLOCKED · READY_TO_VERIFY · VERIFIED · FAILED · COMPLETE |
| OP-05 | TaskInspector | `decision` | available · confirming · busy · success · error · unavailable (reason) |
| OP-06 | DependencyView | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| OP-07 | VerificationCenter | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| OP-08 | ClientActionRequirements | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| OP-09 | BlockerControls | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OP-10 | RunbookSetup | `decision` | available · confirming · busy · success · error · unavailable (reason) |
| OP-11 | StageUpdate | `decision` | available · confirming · busy · success · error · unavailable (reason) |
| CO-01 | CorrespondencePage | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| CO-02 | CommunicationActivity | `send` | dry run · gated (reason) · approval required · confirming · accepted · failed · delivered (webhook only) |
| CO-03 | ClientThread | `list` | loading (skeleton) · populated · filtered-empty · empty (first use) · error + retry · stale (labelled) |
| CO-04 | LifecycleMap | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| CO-05 | EmailPreview | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| CO-06 | OutboundApproval (gated send) | `send` | dry run · gated (reason) · approval required · confirming · accepted · failed · delivered (webhook only) |
| CO-07 | StudioLink | `button` | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| CO-08 | CommunicationPreferences (read) | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SY-01 | SystemPage | `panel` | loading · populated · empty · error + retry · partial (data gap labelled) |
| SY-02 | ReadinessVerdict | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SY-03 | ModuleCard + ModuleDetail | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SY-04 | StagingStack | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SY-05 | Integrations | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SY-06 | DatabaseSecurityProbe | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SY-07 | ReadinessReport | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SY-08 | TechnicalConfiguration | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SY-09 | BuildMeta | `custom` | present · unknown |
| SY-10 | TestLab · CreateSyntheticClient | `field` | empty · placeholder · focus · filled · invalid · read-only · disabled |
| SY-11 | TestLab · Journey | `decision` | available · confirming · busy · success · error · unavailable (reason) |
| SY-12 | TestLab · EmailEvents | `send` | dry run · gated (reason) · approval required · confirming · accepted · failed · delivered (webhook only) |
| SY-13 | TestLab · ContinuityChecks | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SC-01 | ClientPlate (identity) | `custom` | default · attention · test · sm/md/lg |
| SC-02 | StatusMark + StatusLabel | `mark` | founder · client · work · blocked · done · idle · test |
| SC-03 | PhaseSegments + Journey | `mark` | founder · client · work · blocked · done · idle · test |
| SC-04 | StatusChip | `chip` | ok · needs founder · off by policy · unverified · failed · test · warn · muted |
| SC-05 | ActivityRow | `row` | default · hover · focus-visible · selected · loading (skeleton) · stale |
| SC-06 | Button | `button` | default · hover · focus-visible · pressed · busy · disabled-by-policy (reason) · success → toast · error → inline |
| SC-07 | Field | `field` | empty · placeholder · focus · filled · invalid · read-only · disabled |
| SC-08 | ActionMenu | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| SC-09 | Sheet | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| SC-10 | Tabs + SegmentedControl | `tabs` | default · hover · focus-visible · selected · with count · overflow scroll |
| SC-11 | Dialog + Confirmation | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| SC-12 | EmptyState | `custom` | first use · filtered empty · all clear |
| SC-13 | Skeleton + StaleBanner | `custom` | loading · stale · offline |
| SC-14 | Toast | `toast` | success · error (persists) · dismissed |
| SC-15 | ErrorBanner + TechnicalDetail | `custom` | error · retrying · detail open |
| SC-16 | ThresholdObject (decorative) | `custom` | default |
| SC-17 | KeyValueList | `custom` | default · data · gap “—” |
| SC-18 | LinkBlock (copy) | `custom` | default · copied · copy failed |
| OL-01 | Create foundation (sheet / dialog) | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-02 | Link ready | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-03 | Workspace menu drawer | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-04 | Search / command palette | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-05 | Notification center | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-06 | Row action menu | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-07 | Filter / sort | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-08 | Approve quote confirmation | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-09 | Revise quote / manual adjustment | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-10 | Mark foundation complete | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-11 | Request changes / add note | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-12 | Task detail | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-13 | Set blocker | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-14 | Compose message | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-15 | Send (gated, approval tick) | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-16 | System module detail | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-17 | Reset test data confirmation | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-18 | Account menu | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-19 | Client preview (inspector as sheet) | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |
| OL-20 | Technical error detail | `overlay` | closed · opening · open (focus trapped) · busy · error (stays open) · closing (focus returns) |

## Cross-cutting state rules

1. **No optimistic success.** A mutation shows busy, then success only from the API response (toast + refreshed data). Failure leaves the form or overlay open with values intact.
2. **Unavailable is visible.** Actions the API does not support (resend invitation G-05, archive/revoke G-06) render as disabled with a reason (FD-W5 decides shown-disabled vs hidden). Nothing is a silent no-op.
3. **Persistence honesty.** Actions that do not persist alone (G-04) carry a small “NOT SAVED ACROSS RESTART” note in their confirmation until the persistence workstream closes the gap.
4. **Stale ≠ live.** Data older than one refresh cycle after a failed refresh shows the stale banner with its age.
5. **Gaps are “—”.** Missing fields (G-01, G-02) never fall back to mock or sample values.
6. **Case.** Application copy is uppercase by CSS; email, domain, link, token, id, template id and environment names render in `.fw-data` and are never transformed.
