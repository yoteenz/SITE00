# Founder workspace component registry — single source of truth (PROPOSED; nothing here is founder-approved).
# build-registry.py renders component-registry.json, COMPLETE_COMPONENT_INVENTORY.md and COMPONENT_STATE_MATRIX.md from this file.

ADMIN = 'src/site00/admin'
PAGES = f'{ADMIN}/pages/foundation'
FW = f'{ADMIN}/founder-workspace'  # proposed root; Composer may rename in Phase 0
API = '/api/admin/site00-foundation'
READY_API = f'{ADMIN}/services/foundationReadinessApi.ts'
LIST_API = f'{ADMIN}/services/foundationAdminApi.ts'

# Interaction state sets (expanded in COMPONENT_STATE_MATRIX.md)
ST = {
    'nav': ['default', 'hover', 'focus-visible', 'active/current', 'badge'],
    'button': ['default', 'hover', 'focus-visible', 'pressed', 'busy', 'disabled-by-policy (reason)', 'success → toast', 'error → inline'],
    'field': ['empty', 'placeholder', 'focus', 'filled', 'invalid', 'read-only', 'disabled'],
    'row': ['default', 'hover', 'focus-visible', 'selected', 'loading (skeleton)', 'stale'],
    'list': ['loading (skeleton)', 'populated', 'filtered-empty', 'empty (first use)', 'error + retry', 'stale (labelled)'],
    'panel': ['loading', 'populated', 'empty', 'error + retry', 'partial (data gap labelled)'],
    'overlay': ['closed', 'opening', 'open (focus trapped)', 'busy', 'error (stays open)', 'closing (focus returns)'],
    'decision': ['available', 'confirming', 'busy', 'success', 'error', 'unavailable (reason)'],
    'chip': ['ok', 'needs founder', 'off by policy', 'unverified', 'failed', 'test', 'warn', 'muted'],
    'mark': ['founder', 'client', 'work', 'blocked', 'done', 'idle', 'test'],
    'tabs': ['default', 'hover', 'focus-visible', 'selected', 'with count', 'overflow scroll'],
    'search': ['idle', 'focus', 'typing', 'results', 'no results', 'min-length hint', 'error'],
    'toast': ['success', 'error (persists)', 'dismissed'],
    'send': ['dry run', 'gated (reason)', 'approval required', 'confirming', 'accepted', 'failed', 'delivered (webhook only)'],
}

A11Y = {
    'nav': 'nav landmark; aria-current="page"; 44×44 targets; badge text read as “3 founder decisions”',
    'button': 'native button; visible label; aria-busy while busy; disabled-by-policy uses aria-disabled + reason in aria-describedby (stays focusable)',
    'field': 'label for/id; aria-invalid + aria-describedby to error; inputmode/autocomplete per type; case-sensitive values never CSS-uppercased',
    'row': 'row is a link/button with an accessible name = client + status + whose move; chevron decorative',
    'list': 'list/table semantics; live region announces result counts after filter; skeletons aria-hidden with aria-busy on container',
    'overlay': 'role=dialog aria-modal; labelled by title; focus trap; ESC closes; focus returns to trigger; scrim click = cancel',
    'decision': 'primary action names the consequence (“APPROVE QUOTE V2”); confirmation states the external effect',
    'chip': 'text, not colour, carries meaning; icon decorative; contrast ≥ 4.5:1',
    'mark': 'mark is aria-hidden; adjacent text carries the meaning',
    'tabs': 'tablist/tab/tabpanel; arrow keys move; counts included in tab name',
    'search': 'combobox + listbox; ↑↓ ↵ ESC; results announced',
    'toast': 'role=status (success) / role=alert (error); not the only feedback for errors',
    'region': 'section with heading; heading levels follow page outline',
    'decor': 'aria-hidden; never carries data',
}

ERR = {
    'list': 'Load failure → banner “COULDN’T LOAD …” + RETRY; previous data kept and labelled stale',
    'action': 'Action failure → inline error at the control + error toast; form keeps values; no optimistic success',
    'panel': 'Section-level error with RETRY; rest of page stays usable',
    'gap': 'Data gap shown as “—” with gap ID in tooltip/detail; never filled with mock values',
    'none': 'Presentational; no own error state',
    'policy': 'Unavailable by policy → disabled-by-policy control naming the gate; never a silent no-op',
}

def C(id, fam, name, exist, prop, parent, children, purpose, boards, st, mob, tab, desk, data, api, a11y, err, phase, approval='PROPOSED'):
    return dict(id=id, family=fam, name=name, existing=exist, proposed=prop, parent=parent, children=children, purpose=purpose,
                visual=boards, states=st, mobile=mob, tablet=tab, desktop=desk, data=data, api=api, a11y=a11y, error=err,
                phase=phase, approval=approval)

R = []
add = R.append

# ── GLOBAL SHELL ──────────────────────────────────────────────────────────────
add(C('SH-01', 'SHELL', 'FounderWorkspaceShell', f'{ADMIN}/components/shell/Site00AdminShell.tsx (R7 only)', f'{FW}/shell/FounderWorkspaceShell.tsx', '—', 'SH-02…SH-14', 'One host for all six destinations, overlays and feedback', '01 · 02 · 25', 'nav', 'Header + stage + bottom nav', 'Rail + stage (+ dock ≥1100)', 'Sidebar 232 + stage + inspector 392', 'Admin session', 'resolveAdminAuth (AdminGuard)', 'region', 'Shell error boundary keeps “[ ADMIN · INITIALIZATION FAILED ]” recovery (Reload / Return to sign-in)', 1))
add(C('SH-02', 'SHELL', 'FounderIdentity', f'{ADMIN}/components/shell/Site00AdminShell.tsx footer (static “OWNER / ADMIN”)', f'{FW}/shell/FounderIdentity.tsx', 'SH-01', 'SH-07', 'Shows who is signed in; opens account menu', '01 · 02', 'button', 'In MENU drawer', 'Rail foot plate', 'Sidebar foot', 'Supabase auth session (email = data)', '—', 'button', 'none', 1))
add(C('SH-03', 'SHELL', 'EnvironmentIndicator', 'none (static “ONLINE”)', f'{FW}/shell/EnvironmentIndicator.tsx', 'SH-01', '—', 'STAGING tag from the real deployment identity', '01 · 02', 'chip', 'Header tag', 'Rail tooltip', 'Brand tag', 'readiness-report deployment identity', f'{API} readiness-report', 'chip', 'Unknown → “ENV UNKNOWN” (muted), never assumes production', 1))
add(C('SH-04', 'SHELL', 'GlobalSearch', f'{ADMIN}/components/operations/AdminSearchModal.tsx (production search)', f'{FW}/shell/WorkspaceSearch.tsx', 'SH-01', 'OL-04', 'Find client / review / destination', '01 · 24', 'search', 'Full-screen search', 'Palette 620', 'Topbar field + ⌘K palette', 'list (+ detail for names, G-01); review derivation', f'{API} list', 'search', 'Error row in results + retry; min-length hint kept from AdminSearchModal', 1))
add(C('SH-05', 'SHELL', 'NotificationCenter', 'Site00AdminHeader bell (no handler)', f'{FW}/shell/NotificationCenter.tsx', 'SH-01', 'OL-05', 'Founder decisions first, then recent movement', '01 · 24', 'list', 'Sheet', 'Popover', 'Popover', 'Derived: §4 review items + events (G-03, G-10)', f'{API} list/detail', 'list', 'list', 1))
add(C('SH-06', 'SHELL', 'GlobalCreate', 'R1 “Create lead + link” (hard-coded email)', f'{FW}/shell/CreateEntry.tsx', 'SH-01', 'OL-01', 'Single entry for new foundation / synthetic client', '01 · 07 · 08', 'button', 'Centre red block → sheet', 'Rail + → dialog', 'NEW FOUNDATION → dialog', '—', 'create-artifact · create-test-client', 'button', 'action', 1))
add(C('SH-07', 'SHELL', 'AccountMenu', 'none', f'{FW}/shell/AccountMenu.tsx', 'SH-02', '—', 'Identity, environment, tools, sign out', '01 · 02', 'overlay', 'Inside MENU drawer', 'Menu', 'Menu', 'Session', 'Supabase signOut', 'overlay', 'Sign-out failure → error toast; session kept', 1))
add(C('SH-08', 'SHELL', 'BottomNav', 'none', f'{FW}/shell/BottomNav.tsx', 'SH-01', '—', 'HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM', '01 · 25', 'nav', 'Visible', 'Hidden', 'Hidden', 'Review count', '—', 'nav', 'Count unknown → no badge', 1))
add(C('SH-09', 'SHELL', 'WorkspaceMenuDrawer', 'none', f'{FW}/shell/WorkspaceDrawer.tsx', 'SH-01', 'SH-07', 'All six destinations incl. OPERATIONS + CORRESPONDENCE, tools, account', '01', 'overlay', 'Right drawer 86%', '—', '—', '—', '—', 'overlay', 'none', 1))
add(C('SH-10', 'SHELL', 'IndexRail', 'none', f'{FW}/shell/IndexRail.tsx', 'SH-01', '—', 'Tablet navigation, 72 px, index-labelled', '02 · 25', 'nav', '—', 'Visible', '—', 'Review count', '—', 'nav', 'none', 1))
add(C('SH-11', 'SHELL', 'Sidebar', f'{ADMIN}/components/shell (control-nav.ts — no DF item)', f'{FW}/shell/Sidebar.tsx', 'SH-01', 'SH-02', 'Desktop navigation + NEW FOUNDATION + tools', '02 · 25', 'nav', '—', '—', 'Visible 232', 'Review count', '—', 'nav', 'none', 1))
add(C('SH-12', 'SHELL', 'InspectorHost', 'none', f'{FW}/shell/InspectorHost.tsx', 'SH-01', 'FN-05 · RV-04 · OP-05 · SY-03', 'Docks the selected context; becomes a sheet below the threshold', '02 · 25', 'overlay', 'Sheet / push', 'Right sheet or dock (≥1100)', 'Dock 392', 'Selection', '—', 'overlay', 'Inner component handles errors', 1))
add(C('SH-13', 'SHELL', 'OverlayHost', 'window.prompt · none', f'{FW}/shell/OverlayHost.tsx', 'SH-01', 'OL-*', 'Single portal for sheets, dialogs, menus', '24', 'overlay', 'Sheets', 'Dialogs', 'Dialogs', '—', '—', 'overlay', 'none', 1))
add(C('SH-14', 'SHELL', 'FeedbackHost', 'bare <p> errors', f'{FW}/shell/FeedbackHost.tsx', 'SH-01', 'SC-14', 'Toasts + page banners', '24', 'toast', 'Above nav', 'Bottom-left of stage', 'Bottom-left of stage', '—', '—', 'toast', 'none', 1))
add(C('SH-15', 'SHELL', 'ResponsiveLayoutController', 'none', f'{FW}/shell/useWorkspaceLayout.ts', 'SH-01', '—', 'Chooses phone / rail / sidebar and dock vs sheet by width', '25', ['phone <768', 'rail 768–1279', 'sidebar ≥1280', 'dock if width−nav ≥1100'], '<768', '768–1279', '≥1280', 'matchMedia', '—', 'decor', 'none', 1))
add(C('SH-16', 'SHELL', 'PageTitle (index rail + display headline)', 'none', f'{FW}/shell/PageTitle.tsx', 'SH-01', 'SC-16', 'Index · headline · red period · optional threshold object', '03–22', ['default'], 'H1 50', 'H1 50–68', 'H1 68', '—', '—', 'region', 'none', 1))

# ── 01 OVERVIEW ──────────────────────────────────────────────────────────────
add(C('OV-01', 'OVERVIEW', 'OverviewPage', 'none (admin /admin/site00 has no DF data)', f'{FW}/overview/OverviewPage.tsx', 'SH-01', 'OV-02…OV-08', 'What needs the founder now', '03 · 04', 'panel', 'Single column', 'Single column', 'Focus + rail + active work', 'list · §4 derivation', f'{API} list', 'region', 'list', 2))
add(C('OV-02', 'OVERVIEW', 'OperationalSignals', 'none', f'{FW}/overview/Signals.tsx', 'OV-01', '—', 'ACTIVE · NEEDS REVIEW · AWAITING CLIENT · COMPLETE; each filters Foundations', '03 · 04', ['default', 'selected', 'attention (red when >0)', 'loading', 'error “—”'], '4-up compact', '4-up', 'Rail beside title', 'DATA_CONTRACT_MAPPING §3', f'{API} list', 'button', 'gap', 2))
add(C('OV-03', 'OVERVIEW', 'CurrentFocus', 'none', f'{FW}/overview/CurrentFocus.tsx', 'OV-01', 'SC-01', 'The single oldest founder decision with its action', '03 · 04', ['decision pending', 'none pending (calm state)', 'loading', 'error'], 'Card', 'Card', 'Wide card', '§4 review queue', '—', 'decision', 'panel', 2))
add(C('OV-04', 'OVERVIEW', 'NeedsAttentionList', 'none', f'{FW}/overview/NeedsAttention.tsx', 'OV-01', 'SC-01', 'Remaining decisions + blocked items', '03 · 04', 'list', 'List', 'List', 'List', '§4 + blockers', '—', 'list', 'list', 2))
add(C('OV-05', 'OVERVIEW', 'ActiveFoundationsList', 'R1 table (state/payment/created)', f'{FW}/overview/ActiveWork.tsx', 'OV-01', 'FN-03', 'Clients in motion, whose move, next action', '03 · 04', 'list', 'Card rows', 'Dense rows', 'Table', 'list (+ G-01)', f'{API} list', 'list', 'list', 2))
add(C('OV-06', 'OVERVIEW', 'RecentActivity', 'R2 “Recent events” (last 10)', f'{FW}/overview/RecentMovement.tsx', 'OV-01', 'SC-05', 'Movement across clients', '03 · 04', 'list', 'Collapsed', 'List', 'Side column', 'detail.events (memory-only, G-03)', f'{API} detail', 'list', 'list', 2))
add(C('OV-07', 'OVERVIEW', 'NextMilestone', 'none', f'{FW}/overview/NextMilestone.tsx', 'OV-01', '—', 'Next stage completion across active projects', '04', 'panel', 'Hidden (in focus)', 'Panel', 'Panel', 'pipeline.next_action (G-04)', f'{API} pipeline', 'region', 'gap', 2))
add(C('OV-08', 'OVERVIEW', 'OverviewEmptyErrorStates', 'none', f'{FW}/overview/OverviewStates.tsx', 'OV-01', 'SC-12 · SC-13', 'First use, all clear, load failure', '03 · 24', ['empty (first use)', 'all clear', 'error + retry', 'stale'], 'Inline', 'Inline', 'Inline', '—', '—', 'region', 'list', 2))

# ── 02 FOUNDATIONS ───────────────────────────────────────────────────────────
add(C('FN-01', 'FOUNDATIONS', 'FoundationsRegistryPage', f'{PAGES}/FoundationAdminListPage.tsx', f'{FW}/foundations/FoundationsPage.tsx', 'SH-01', 'FN-02…FN-09', 'All client foundations', '05 · 06', 'list', 'Card list', 'Dense rows', 'Table + inspector', 'list', f'{API} list ({LIST_API})', 'list', 'list', 3))
add(C('FN-02', 'FOUNDATIONS', 'RegistrySearch', 'none', f'{FW}/foundations/RegistrySearch.tsx', 'FN-01', '—', 'Filter by business, email, domain', '05 · 06', 'search', 'Field', 'Field', 'Field', 'list (client-side filter)', '—', 'search', 'none', 3))
add(C('FN-03', 'FOUNDATIONS', 'StatusViews', 'none', f'{FW}/foundations/StatusViews.tsx', 'FN-01', 'SC-10', 'ALL · INVITED · INTAKE · REVIEW · QUOTE · ACTIVE · COMPLETE', '05 · 06', 'tabs', 'Scrolling tabs', 'Tabs', 'Tabs', 'Display phases §2', '—', 'tabs', 'none', 3))
add(C('FN-04', 'FOUNDATIONS', 'FilterSortControls', 'none', f'{FW}/foundations/FilterSheet.tsx', 'FN-01', 'OL-07', 'Whose move, phase, test clients, sort', '05 · 06', ['closed', 'open', 'applied (count)', 'reset'], 'Sheet', 'Popover', 'Popover', 'list', '—', 'overlay', 'none', 3))
add(C('FN-05', 'FOUNDATIONS', 'ClientRegistryRow', 'R1 table row', f'{FW}/foundations/ClientRow.tsx', 'FN-01', 'SC-01 · SC-02 · SC-03', 'Identity, status, phase, whose move, last activity', '05 · 06 · 25', 'row', 'Card row', 'Dense row', 'Table row', 'list (+ G-01 name/industry)', f'{API} list', 'row', 'gap', 3))
add(C('FN-06', 'FOUNDATIONS', 'ClientPreviewInspector', 'none', f'{FW}/foundations/ClientInspector.tsx', 'SH-12', 'SC-03 · SC-05', 'Selected client summary without leaving the list', '02 · 06', 'panel', 'Push to record', 'Sheet / dock', 'Dock 392', 'detail', f'{API} detail', 'overlay', 'panel', 3))
add(C('FN-07', 'FOUNDATIONS', 'CreateClientFlow', 'R1 create (prospect@example.com) + window.prompt', f'{FW}/foundations/CreateFoundation.tsx', 'SH-06', 'OL-01 · OL-02', 'Create artifact + personal link', '07 · 08', 'overlay', 'Full-screen form', 'Dialog', 'Dialog', 'create-artifact response (personalized_url)', f'{API} create-artifact', 'field', 'action', 3))
add(C('FN-08', 'FOUNDATIONS', 'DuplicateWarning', 'none', f'{FW}/foundations/DuplicateNotice.tsx', 'FN-07', '—', 'Client-side match on email in loaded list (no API dedupe, G-11)', '07', ['none', 'possible match'], 'Banner', 'Banner', 'Banner', 'list (loaded rows)', '—', 'region', 'none', 3))
add(C('FN-09', 'FOUNDATIONS', 'RegistryStates', 'R1 bare <p> error; dev preview bootstrap', f'{FW}/foundations/RegistryStates.tsx', 'FN-01', 'SC-12 · SC-13', 'Loading, empty, filtered-empty, error, stale', '05 · 24', 'list', 'Inline', 'Inline', 'Inline', '—', '/api/dev/site00-digital-foundation-preview-bootstrap (dev only, kept)', 'list', 'list', 3))
add(C('FN-10', 'FOUNDATIONS', 'RowActionMenu', 'none', f'{FW}/foundations/RowMenu.tsx', 'FN-05', 'OL-06', 'Open, copy link, client view, message; resend/archive shown unavailable', '24', 'overlay', 'Action sheet', 'Menu', 'Menu', '—', '—', 'overlay', 'policy', 3))

# ── CLIENT RECORD ────────────────────────────────────────────────────────────
add(C('CR-01', 'CLIENT RECORD', 'ClientRecordPage', f'{PAGES}/FoundationAdminDetailPage.tsx', f'{FW}/record/ClientRecordPage.tsx', 'SH-01', 'CR-02…CR-13', 'Complete contextual workspace for one client', '09 · 10', 'panel', 'Pushed page, 5 tabs', '8 tabs', '8 tabs + side column', 'detail', f'{API} detail', 'region', 'panel', 4))
add(C('CR-02', 'CLIENT RECORD', 'RecordHeader', 'R2 “Artifact {id8}” + dl', f'{FW}/record/RecordHeader.tsx', 'CR-01', 'SC-01 · SC-02', 'Plate, name, category, status, step n of 8, email (data)', '09 · 10', ['default', 'test client (hatched)', 'blocked', 'complete'], 'Band + header', 'Header', 'Header', 'detail + lead', '—', 'region', 'gap', 4))
add(C('CR-03', 'CLIENT RECORD', 'QuickActions', 'R2 links (client intake, client home)', f'{FW}/record/QuickActions.tsx', 'CR-01', '—', 'COPY LINK · CLIENT VIEW · MESSAGE · RESEND (N/A G-05) · MORE', '09 · 10', 'button', '5-up grid', 'Inline buttons', 'Header buttons', 'public_token', '— (copy client-side) · send-message', 'button', 'policy', 4))
add(C('CR-04', 'CLIENT RECORD', 'JourneyTracker', 'none', f'{FW}/record/Journey.tsx', 'CR-01', 'SC-03', 'Eight display phases with dates', '09 · 10 · 25', 'mark', 'Segments + step', 'Short labels', 'Full + dates', '§2 mapping', '—', 'mark', 'gap', 4))
add(C('CR-05', 'CLIENT RECORD', 'NextActionBlock', 'none', f'{FW}/record/NextAction.tsx', 'CR-01', '—', 'Whose move + the one next action', '09 · 10', 'decision', 'Card', 'Card', 'Card', '§2 whose move', '—', 'decision', 'panel', 4))
add(C('CR-06', 'CLIENT RECORD', 'IntakeSection', 'R2 “Submitted intake” dl', f'{FW}/record/IntakeSection.tsx', 'CR-01', '—', 'Submitted intake grouped by step; progress by phase, no %', '11', 'panel', 'Collapsible groups', 'Groups', 'Two-column', 'detail.intake', f'{API} detail', 'region', 'panel', 4))
add(C('CR-07', 'CLIENT RECORD', 'RecommendationsSection', 'none', f'{FW}/record/Recommendations.tsx', 'CR-01', '—', 'Engine output, manual-review reasons', '11', 'panel', 'List', 'List', 'List + reasons', 'detail.recommendation', f'{API} detail · update-quote', 'region', 'panel', 4))
add(C('CR-08', 'CLIENT RECORD', 'QuoteSection', 'R2 “Quote v{n}” subtotal', f'{FW}/record/QuoteSection.tsx', 'CR-01', 'OL-08 · OL-09', 'Lines, totals, expiry, versions, approve / revise', '12', 'decision', 'Fixed decision bar', 'Panel + decision', 'Quote + decision column', 'detail.quote · commercialConfig · addonCatalog', 'update-quote · quote-commercial-ready · manual-adjustment (G-04)', 'decision', 'action', 4))
add(C('CR-09', 'CLIENT RECORD', 'OperationsSection', f'{PAGES}/FoundationProjectCommandPage.tsx · FoundationWorkbenchPage.tsx (JSON)', f'{FW}/record/OperationsSection.tsx', 'CR-01', 'OP-03 · OP-04', 'Stages and tasks for this client', '17 · 18', 'panel', 'Stage + tasks', 'Stage + tasks', 'Runbook view', 'project-command · workbench', f'{API} project-command · workbench', 'region', 'panel', 4))
add(C('CR-10', 'CLIENT RECORD', 'RecordsSection', 'R2 Mark foundation complete (hard-coded ownership)', f'{FW}/record/RecordsSection.tsx', 'CR-01', 'OL-10', 'Ownership records, completion gate, mark complete', '10 · 24', 'decision', 'List + confirm sheet', 'Panel', 'Panel', 'completion-gate', 'completion-gate · mark-complete (G-04)', 'decision', 'action', 4))
add(C('CR-11', 'CLIENT RECORD', 'CommunicationsSection', 'none', f'{FW}/record/ClientMessages.tsx', 'CR-01', 'CO-03', 'Per-client messages and email intents', '19 · 20', 'list', 'Thread', 'Thread', 'Thread', 'messages · email-timeline', 'messages · send-message', 'list', 'list', 4))
add(C('CR-12', 'CLIENT RECORD', 'ActivitySection', 'R2 Recent events', f'{FW}/record/Activity.tsx', 'CR-01', 'SC-05', 'Full event history', '10', 'list', 'List', 'List', 'List', 'detail.events (G-03)', f'{API} detail', 'list', 'list', 4))
add(C('CR-13', 'CLIENT RECORD', 'RecordSectionTabs', 'none', f'{FW}/record/SectionTabs.tsx', 'CR-01', 'SC-10', 'OVERVIEW · INTAKE · RECOMMENDATIONS · QUOTE · OPERATIONS · RECORDS · COMMUNICATIONS · ACTIVITY', '09 · 10', 'tabs', '5 + MORE', '8', '8', '?section=', '—', 'tabs', 'none', 4))

# ── 03 REVIEWS ───────────────────────────────────────────────────────────────
add(C('RV-01', 'REVIEWS', 'ReviewsQueuePage', 'none', f'{FW}/reviews/ReviewsPage.tsx', 'SH-01', 'RV-02…RV-07', 'All founder decisions in one queue', '13 · 14', 'list', 'Card list', 'List (+ dock)', 'List + inspector', '§4 derivation', f'{API} list · detail', 'list', 'list', 5))
add(C('RV-02', 'REVIEWS', 'ReviewCategoryTabs', 'none', f'{FW}/reviews/ReviewTabs.tsx', 'RV-01', 'SC-10', 'ALL · INTAKES · RECOMMEND · QUOTES · REQUESTS · EXCEPTIONS · HISTORY', '13 · 14', 'tabs', 'Scrolling', 'Tabs', 'Tabs', '§4', '—', 'tabs', 'none', 5))
add(C('RV-03', 'REVIEWS', 'ReviewItem', 'none', f'{FW}/reviews/ReviewItem.tsx', 'RV-01', 'SC-01', 'Type, client, why it needs you, age, primary action', '13 · 14', 'row', 'Card + ink action', 'Row', 'Row', '§4 item', '—', 'row', 'gap', 5))
add(C('RV-04', 'REVIEWS', 'ReviewDetail', 'none', f'{FW}/reviews/ReviewDetail.tsx', 'RV-01', 'RV-05 · CR-04', 'Understand → compare → decide → confirm', '15 · 16', 'panel', 'Pushed page + fixed bar', 'Dock / page', 'Inspector / page', 'detail + §4 item', f'{API} detail', 'region', 'panel', 5))
add(C('RV-05', 'REVIEWS', 'DecisionControls', 'none', f'{FW}/reviews/DecisionBar.tsx', 'RV-04', 'OL-08 · OL-11', 'APPROVE / REQUEST CHANGES / ADD NOTE; only API-backed outcomes', '15 · 16', 'decision', 'Fixed bar', 'Foot', 'Inspector foot', '—', 'quote-commercial-ready · approval-resolve (G-04) · update-quote', 'decision', 'action', 5))
add(C('RV-06', 'REVIEWS', 'ReviewHistory', 'none', f'{FW}/reviews/ReviewHistory.tsx', 'RV-01', 'SC-05', 'Resolved approvals, ready quotes, verified tasks', '13 · 14', 'list', 'Tab', 'Tab', 'Tab', 'events (G-03)', f'{API} detail', 'list', 'list', 5))
add(C('RV-07', 'REVIEWS', 'ReviewStates', 'none', f'{FW}/reviews/ReviewStates.tsx', 'RV-01', 'SC-12', 'All clear, loading, error', '13 · 24', 'list', 'Inline', 'Inline', 'Inline', '—', '—', 'list', 'list', 5))

# ── 04 OPERATIONS ────────────────────────────────────────────────────────────
add(C('OP-01', 'OPERATIONS', 'OperationsPage', f'{PAGES}/FoundationPipelinePage.tsx (table)', f'{FW}/operations/OperationsPage.tsx', 'SH-01', 'OP-02…OP-09', 'Active fulfilment across clients', '17 · 18', 'list', 'Grouped list', 'List', 'Runbook workspace', 'pipeline', f'{API} pipeline', 'list', 'list', 6))
add(C('OP-02', 'OPERATIONS', 'ActiveWorkGroups', 'R3 table rows', f'{FW}/operations/ActiveWork.tsx', 'OP-01', 'FN-05', 'Projects by state with the next startable task', '17', 'list', 'Groups', 'Groups', 'Table', 'pipeline', f'{API} pipeline', 'list', 'list', 6))
add(C('OP-03', 'OPERATIONS', 'StageRail', 'none (JSON)', f'{FW}/operations/StageRail.tsx', 'OP-01', '—', 'Seven stages 01_DETAILS_RECEIVED … 07_FOUNDATION_COMPLETE', '17 · 18', ['done', 'current', 'blocked', 'future'], 'Scroll strip', 'Strip', 'Strip', 'projectStages.ts', f'{API} project-command', 'tabs', 'panel', 6))
add(C('OP-04', 'OPERATIONS', 'TaskRow', 'none (JSON)', f'{FW}/operations/TaskRow.tsx', 'OP-03', '—', 'Task, execution mode, status, dependency', '17 · 18', ['NOT_READY', 'READY', 'IN_PROGRESS', 'WAITING_CLIENT', 'WAITING_PROVIDER', 'BLOCKED', 'READY_TO_VERIFY', 'VERIFIED', 'FAILED', 'COMPLETE'], 'Row', 'Row', 'Row', 'workbench', f'{API} workbench', 'row', 'panel', 6))
add(C('OP-05', 'OPERATIONS', 'TaskInspector', 'none', f'{FW}/operations/TaskInspector.tsx', 'SH-12', 'OL-12 · OL-13', 'Instructions, metadata, actions', '17 · 18', 'decision', 'Sheet', 'Sheet / dock', 'Dock', 'workbench task', 'start-task · complete-task · verify-task · escalate-task · set-blocker (G-04)', 'overlay', 'action', 6))
add(C('OP-06', 'OPERATIONS', 'DependencyView', 'none', f'{FW}/operations/Dependencies.tsx', 'OP-01', '—', 'dns_verify ← mx/spf/dkim/dmarc; final ← dns/send/receive/ownership', '18', 'panel', 'List', 'Diagram', 'Diagram', 'runbookGenerator depMap', '—', 'region', 'panel', 6))
add(C('OP-07', 'OPERATIONS', 'VerificationCenter', 'none', f'{FW}/operations/Verification.tsx', 'OP-01', '—', 'Verification checks and completion-gate reasons', '18', 'panel', 'Section', 'Section', 'Side column', 'completion-gate', f'{API} completion-gate', 'region', 'panel', 6))
add(C('OP-08', 'OPERATIONS', 'ClientActionRequirements', 'none', f'{FW}/operations/ClientActions.tsx', 'OP-01', '—', 'Open client actions (e.g. APPROVE_DNS_CHANGE)', '17 · 18', 'list', 'List', 'List', 'Side column', 'detail.client_actions', 'client-action (G-04)', 'list', 'list', 6))
add(C('OP-09', 'OPERATIONS', 'BlockerControls', 'none', f'{FW}/operations/BlockerSheet.tsx', 'OP-05', 'OL-13', 'BlockerCategory + reason', '17', 'overlay', 'Sheet', 'Dialog', 'Dialog', 'BlockerCategory', 'set-blocker (G-04)', 'overlay', 'action', 6))
add(C('OP-10', 'OPERATIONS', 'RunbookSetup', 'none', f'{FW}/operations/RunbookSetup.tsx', 'OP-01', '—', 'Generate / activate runbook, set providers', '18', 'decision', 'Sheet', 'Dialog', 'Panel', '—', 'generate-runbook · activate-runbook · set-providers (G-04)', 'decision', 'action', 6))
add(C('OP-11', 'OPERATIONS', 'StageUpdate', 'none', f'{FW}/operations/StageUpdate.tsx', 'OP-03', '—', 'Manual stage status update', '18', 'decision', 'Sheet', 'Dialog', 'Inspector', 'projectStages', 'update-stage (G-04)', 'decision', 'action', 6))

# ── 05 CORRESPONDENCE ────────────────────────────────────────────────────────
add(C('CO-01', 'CORRESPONDENCE', 'CorrespondencePage', f'{PAGES}/CommunicationsCommandPage.tsx (static text)', f'{FW}/correspondence/CorrespondencePage.tsx', 'SH-01', 'CO-02…CO-08', 'All client communication + send policy', '19 · 20', 'list', 'List', 'List', 'List + preview', 'messages · email-timeline', f'{API} messages · email-timeline', 'list', 'list', 7))
add(C('CO-02', 'CORRESPONDENCE', 'CommunicationActivity', 'none', f'{FW}/correspondence/Activity.tsx', 'CO-01', '—', 'Intents with SendIntentStatus', '19 · 20', 'send', 'List', 'List', 'Table', 'email-timeline (G-09)', f'{API} email-timeline', 'list', 'list', 7))
add(C('CO-03', 'CORRESPONDENCE', 'ClientThread', 'none', f'{FW}/correspondence/Thread.tsx', 'CO-01', 'OL-14', 'Per-client messages (client can send once PAID)', '19 · 20', 'list', 'Pushed thread', 'Thread', 'Thread', 'messages', 'messages · send-message', 'list', 'action', 7))
add(C('CO-04', 'CORRESPONDENCE', 'LifecycleMap', 'R6 text + eventMap.ts', f'{FW}/correspondence/LifecycleMap.tsx', 'CO-01', '—', 'Every lifecycle event, template id, enabled:false', '19 · 20', 'chip', 'List', 'List', 'Table', 'communications/eventMap.ts', '—', 'list', 'none', 7))
add(C('CO-05', 'CORRESPONDENCE', 'EmailPreview', 'R7 invitation preview', f'{FW}/correspondence/EmailPreview.tsx', 'CO-01', '—', 'Rendered template + recipient (masked), link validity', '20', 'panel', 'Sheet', 'Dock', 'Inspector', 'prepare-test-invitation', f'{API} prepare-test-invitation', 'region', 'panel', 7))
add(C('CO-06', 'CORRESPONDENCE', 'OutboundApproval (gated send)', 'R7 approval checkbox + inconsistent lifecycle send', f'{FW}/correspondence/SendGate.tsx', 'CO-05', 'OL-15', 'One approval tick for every send; gates 1–5 shown', '19 · 20 · 23', 'send', 'Sheet', 'Dialog', 'Inspector foot', 'deliveryWorker gates', 'dispatch-test-email (founder_approved_send)', 'decision', 'policy', 7))
add(C('CO-07', 'CORRESPONDENCE', 'StudioLink', 'Correspondence Studio (own chrome)', 'unchanged · linked', 'CO-01', '—', 'Templates, campaigns, pack review stay in the Studio', '19', 'button', 'Row', 'Row', 'Button', '—', '—', 'button', 'none', 7))
add(C('CO-08', 'CORRESPONDENCE', 'CommunicationPreferences (read)', 'none (client sets via public link)', f'{FW}/correspondence/Consents.tsx', 'CO-03', '—', 'Client consent state shown read-only', '20', 'chip', 'Row', 'Row', 'Row', 'communication preferences (G-09)', '—', 'chip', 'gap', 7))

# ── 06 SYSTEM ────────────────────────────────────────────────────────────────
add(C('SY-01', 'SYSTEM', 'SystemPage', f'{PAGES}/FoundationReadinessPage.tsx', f'{FW}/system/SystemPage.tsx', 'SH-01', 'SY-02…SY-12', 'Category-first diagnostics', '21 · 22', 'panel', 'Tabs + modules', 'Tabs + modules', 'Tabs + 4-col modules + inspector', 'readiness-report', f'{API} readiness-report ({READY_API})', 'region', 'list', 8))
add(C('SY-02', 'SYSTEM', 'ReadinessVerdict', 'R7 overall status line', f'{FW}/system/Verdict.tsx', 'SY-01', '—', 'One verdict + counts', '21 · 22', 'chip', 'Card', 'Card', 'Band', 'readiness-report', '—', 'region', 'list', 8))
add(C('SY-03', 'SYSTEM', 'ModuleCard + ModuleDetail', 'R7 sections', f'{FW}/system/Module.tsx', 'SY-01', 'OL-16', 'STACK · PERSISTENCE · DB SECURITY · EMAIL · DKIM · STRIPE · API HEALTH · E2E', '21 · 22', 'chip', 'Grid 2 + sheet', 'Grid + sheet', 'Grid 4 + inspector', 'readiness-report', '—', 'button', 'panel', 8))
add(C('SY-04', 'SYSTEM', 'StagingStack', 'R7 :146-203', f'{FW}/system/Stack.tsx', 'SY-01', '—', 'Frontend, API, Supabase ref, persistence, origin, E2E', '21', 'chip', 'List', 'List', 'Tab', 'readiness-report', '—', 'list', 'panel', 8))
add(C('SY-05', 'SYSTEM', 'Integrations', 'R7 (Stripe key mode, Resend)', f'{FW}/system/Integrations.tsx', 'SY-01', '—', 'Stripe, Resend, GoDaddy DNS by provider', '21', 'chip', 'Groups', 'Groups', 'Tab', 'readiness-report', '—', 'list', 'panel', 8))
add(C('SY-06', 'SYSTEM', 'DatabaseSecurityProbe', 'R7 :205-222', f'{FW}/system/Security.tsx', 'SY-01', '—', 'RLS probe, service role, exposure, founder session', '21', 'chip', 'Groups', 'Groups', 'Tab', 'stagingDatabaseSecurityProbe', '—', 'list', 'panel', 8))
add(C('SY-07', 'SYSTEM', 'ReadinessReport', 'R7 :224-259', f'{FW}/system/Report.tsx', 'SY-01', '—', 'Ready / Action required / Blocked / Unverified', '22', 'chip', 'Stacked', 'Stacked', '4 columns', 'readiness-report', '—', 'list', 'panel', 8))
add(C('SY-08', 'SYSTEM', 'TechnicalConfiguration', 'R7 :261-290 (env groups + legacy presence)', f'{FW}/system/TechConfig.tsx', 'SY-01', '—', 'Env names, purpose, state — never values', '22', 'chip', 'Pushed page', 'Section', 'Details table', 'stagingEnvConfig', '—', 'list', 'panel', 8))
add(C('SY-09', 'SYSTEM', 'BuildMeta', 'R7 :292-294', f'{FW}/system/BuildMeta.tsx', 'SY-01', '—', 'API build commit + marker (data)', '21 · 22', ['present', 'unknown'], 'Line', 'Line', 'Line', 'readiness-report', '—', 'region', 'none', 8))
add(C('SY-10', 'SYSTEM', 'TestLab · CreateSyntheticClient', 'R7 :301-322', f'{FW}/system/testlab/CreateTestClient.tsx', 'SY-01', '—', 'Allowlisted synthetic client', '23', 'field', 'Form', 'Form', 'Panel', '—', 'create-test-client', 'field', 'action', 8))
add(C('SY-11', 'SYSTEM', 'TestLab · Journey', 'R7 :326-362', f'{FW}/system/testlab/TestJourney.tsx', 'SY-01', 'OL-17', 'State/intake/payment/surface + test steps + reset', '23', 'decision', 'Card', 'Card', 'Panel', 'test-journey', 'advance-test-intake · advance-test-quote · reset-test-data', 'decision', 'action', 8))
add(C('SY-12', 'SYSTEM', 'TestLab · EmailEvents', 'R7 :363-462', f'{FW}/system/testlab/EmailEvents.tsx', 'SY-01', 'CO-05 · CO-06', 'Email events table, invitation preview, gated sends', '23', 'send', 'List + sheet', 'List', 'Panel', 'email-timeline', 'prepare-test-invitation · dispatch-test-email', 'list', 'list', 8))
add(C('SY-13', 'SYSTEM', 'TestLab · ContinuityChecks', 'none (proposed, unverified)', f'{FW}/system/testlab/Continuity.tsx', 'SY-01', '—', 'Restart / link / resume checks, shown UNVERIFIED until a probe exists', '23', 'chip', 'List', 'List', 'Panel', 'none yet', 'none (persistence workstream)', 'chip', 'gap', 8, 'PROPOSED · DEPENDS ON PERSISTENCE WORKSTREAM'))

# ── SHARED COMPONENTS ────────────────────────────────────────────────────────
add(C('SC-01', 'SHARED', 'ClientPlate (identity)', 'none', f'{FW}/shared/ClientPlate.tsx', '—', '—', 'Initials + threshold sliver; attention / test variants', '27', ['default', 'attention', 'test', 'sm/md/lg'], '42', '42', '32–64', 'business name', '—', 'decor', 'gap', 1))
add(C('SC-02', 'SHARED', 'StatusMark + StatusLabel', 'none', f'{FW}/shared/Status.tsx', '—', '—', 'Whose move', '27', 'mark', 'Same', 'Same', 'Same', '§2', '—', 'mark', 'none', 1))
add(C('SC-03', 'SHARED', 'PhaseSegments + Journey', 'none', f'{FW}/shared/Progress.tsx', '—', '—', 'Eight phases, no percentages', '25 · 27', 'mark', 'Segments', 'Short journey', 'Full journey', '§2', '—', 'mark', 'gap', 1))
add(C('SC-04', 'SHARED', 'StatusChip', 'none', f'{FW}/shared/Chip.tsx', '—', '—', 'Condition of a thing', '21 · 27', 'chip', 'Same', 'Same', 'Same', 'varies', '—', 'chip', 'none', 1))
add(C('SC-05', 'SHARED', 'ActivityRow', 'R2 events list', f'{FW}/shared/ActivityRow.tsx', '—', '—', 'Time · mark · event · detail', '27', 'row', 'Row', 'Row', 'Row', 'events', '—', 'row', 'none', 1))
add(C('SC-06', 'SHARED', 'Button', 'native buttons', f'{FW}/shared/Button.tsx', '—', '—', 'Ink / red / outline / ghost; busy; disabled-by-policy', '24 · 27', 'button', '44 h', '44 h', '40–44 h', '—', '—', 'button', 'none', 1))
add(C('SC-07', 'SHARED', 'Field', 'native inputs', f'{FW}/shared/Field.tsx (from form-control authority)', '—', '—', 'Text / email / domain / select fields', '07 · 27', 'field', 'Full width', 'Grid', 'Grid', '—', '—', 'field', 'action', 1))
add(C('SC-08', 'SHARED', 'ActionMenu', 'none', f'{FW}/shared/ActionMenu.tsx', '—', '—', 'Row / account / more menus', '24', 'overlay', 'Action sheet', 'Menu', 'Menu', '—', '—', 'overlay', 'policy', 1))
add(C('SC-09', 'SHARED', 'Sheet', 'none', f'{FW}/shared/Sheet.tsx', 'SH-13', '—', 'Mobile overlay container', '24', 'overlay', 'Bottom sheet', 'Right sheet', '—', '—', '—', 'overlay', 'none', 1))
add(C('SC-10', 'SHARED', 'Tabs + SegmentedControl', 'Correspondence Studio tabs', f'{FW}/shared/Tabs.tsx', '—', '—', 'Section and filter switching', '27', 'tabs', 'Scroll', 'Inline', 'Inline', '—', '—', 'tabs', 'none', 1))
add(C('SC-11', 'SHARED', 'Dialog + Confirmation', 'none (unconfirmed actions)', f'{FW}/shared/Dialog.tsx', 'SH-13', '—', 'Confirm external / destructive effects', '24', 'overlay', 'Sheet', 'Dialog 440', 'Dialog 440', '—', '—', 'overlay', 'action', 1))
add(C('SC-12', 'SHARED', 'EmptyState', 'none', f'{FW}/shared/EmptyState.tsx', '—', '—', 'Teach the one next action', '24', ['first use', 'filtered empty', 'all clear'], 'Inline', 'Inline', 'Inline', '—', '—', 'region', 'none', 1))
add(C('SC-13', 'SHARED', 'Skeleton + StaleBanner', '“Loading…” text', f'{FW}/shared/Loading.tsx', '—', '—', 'Loading geometry + stale labelling', '24', ['loading', 'stale', 'offline'], 'Inline', 'Inline', 'Inline', '—', '—', 'list', 'none', 1))
add(C('SC-14', 'SHARED', 'Toast', 'none', f'{FW}/shared/Toast.tsx', 'SH-14', '—', 'Outcome confirmation', '24', 'toast', 'Above nav', 'Stage', 'Stage', '—', '—', 'toast', 'none', 1))
add(C('SC-15', 'SHARED', 'ErrorBanner + TechnicalDetail', 'role=alert <p>', f'{FW}/shared/ErrorBanner.tsx', '—', '—', 'Plain line + RETRY + optional detail (no secrets)', '24', ['error', 'retrying', 'detail open'], 'Inline', 'Inline', 'Inline', 'error response', '—', 'toast', 'none', 1))
add(C('SC-16', 'SHARED', 'ThresholdObject (decorative)', 'src/site00/foundation-client/objects.tsx', 'reuse objects.tsx', '—', '—', 'One architectural accent per destination', '03–22', ['default'], 'Small', 'Small', 'Medium', '—', '—', 'decor', 'none', 1, 'IMPLEMENTED (DF client) · USE PROPOSED'))
add(C('SC-17', 'SHARED', 'KeyValueList', 'R2 dl', f'{FW}/shared/KeyValue.tsx', '—', '—', 'Label / value pairs; data values unchanged case', '27', ['default', 'data', 'gap “—”'], 'Stacked', 'Two-col', 'Two-col', 'varies', '—', 'region', 'gap', 1))
add(C('SC-18', 'SHARED', 'LinkBlock (copy)', 'window.prompt', f'{FW}/shared/LinkBlock.tsx', '—', '—', 'Visible personal link + copy', '08 · 24', ['default', 'copied', 'copy failed'], 'Block', 'Block', 'Inline', 'public_token', '—', 'button', 'action', 1))

# ── OVERLAYS (also in OVERLAY_AND_MODAL_INVENTORY.md) ────────────────────────
OL = [
    ('OL-01', 'Create foundation (sheet / dialog)', 'SH-06', '07 · 08'),
    ('OL-02', 'Link ready', 'FN-07', '07 · 08'),
    ('OL-03', 'Workspace menu drawer', 'SH-09', '01'),
    ('OL-04', 'Search / command palette', 'SH-04', '01 · 24'),
    ('OL-05', 'Notification center', 'SH-05', '01 · 24'),
    ('OL-06', 'Row action menu', 'FN-10', '24'),
    ('OL-07', 'Filter / sort', 'FN-04', '05 · 06'),
    ('OL-08', 'Approve quote confirmation', 'CR-08', '12 · 15'),
    ('OL-09', 'Revise quote / manual adjustment', 'CR-08', '12'),
    ('OL-10', 'Mark foundation complete', 'CR-10', '24'),
    ('OL-11', 'Request changes / add note', 'RV-05', '15 · 16'),
    ('OL-12', 'Task detail', 'OP-05', '17'),
    ('OL-13', 'Set blocker', 'OP-09', '17'),
    ('OL-14', 'Compose message', 'CO-03', '19'),
    ('OL-15', 'Send (gated, approval tick)', 'CO-06', '19 · 23'),
    ('OL-16', 'System module detail', 'SY-03', '21 · 22'),
    ('OL-17', 'Reset test data confirmation', 'SY-11', '23'),
    ('OL-18', 'Account menu', 'SH-07', '02'),
    ('OL-19', 'Client preview (inspector as sheet)', 'FN-06', '25'),
    ('OL-20', 'Technical error detail', 'SC-15', '24'),
]
for oid, name, parent, boards in OL:
    add(C(oid, 'OVERLAY', name, 'none' if oid not in ('OL-04',) else 'AdminSearchModal.tsx', f'{FW}/overlays/', parent, '—', name, boards, 'overlay', 'Sheet / full screen', 'Dialog / right sheet', 'Dialog / popover / inspector', 'per parent', 'per parent', 'overlay', 'action', 1))
