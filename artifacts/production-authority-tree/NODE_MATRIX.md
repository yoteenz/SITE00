# NODE CLASSIFICATION MATRIX

**Sprint:** P0.STUDIOOS.PRODUCTION.AUTHORITY-TREE.COMPOSER1
**Generated:** 2026-10-03T06:08:29.682Z
**Base SHA:** 269f2af563b5e69044c4afa41a6a72605a284ae1

Every node is evaluated against its **parent tab**, **parent route**, and **ProductionAuthorityFrame** shell (`.pxa` + chrome). Status taxonomy is fixed — no generic PASS.

| ID | Parent | Route / trigger | Viewports | Status | Authority source | Inherited visual | Deviation allowed | Stale fallback risk | Founder review | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| shell-frame | PRODUCTION | mount on all authority tabs | mobile,tablet,desktop | REFERENCE_LOCKED | approved generated authority + live implementation | ProductionAuthorityFrame (.pxa) | no | low | no | Portal to body; locks scroll; hosts header/nav. |
| shell-header-mobile | shell-frame | viewport <700px | mobile,mobile-xl | STRUCTURALLY_CORRECT_VISUALLY_WRONG | legacy locked 864 canvas | ph-top (864-space scaled) | no | high | no | 34px strip vs authority ~57px — shared with hub machine, CF, design overlay. |
| shell-header-host | shell-frame | viewport ≥700px | tablet,desktop | REFERENCE_LOCKED | live implementation | pxh-top | no | low | no |  |
| shell-bottom-nav | shell-frame | persistent 7-tab nav | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no | HUB INBOX DESIGN EXPERIENCE EXPRESSION LIBRARY ACTIVITY |
| shell-nav-inbox-badge | shell-bottom-nav | attention queue count | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-root | HUB | /production | mobile,tablet,desktop | REFERENCE_LOCKED | founder reference + Grok1 hub crystal plate | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-hero | hub-root | AuthorityHero crystal chamber | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-status-bar | hub-root | LiveStatusBar | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-overview | hub-root | project overview cards | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-entries | hub-root | ENTRY 002 rail + expression links | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no | Entry 002 OH NOW IT WAS FUN subject canon. |
| hub-components | hub-root | production graph nodes | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-operations | hub-root | attention → queue | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-operations-empty | hub-operations | no attention items | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-activity-preview | hub-root | recent activity strip | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-activity-empty | hub-activity-preview | no activity | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-open-machine | hub-root | Link ?view=machine | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| hub-machine | HUB | /production?view=machine \| panel \| node \| scene query | mobile,tablet,desktop | LEGACY_LOCKED | legacy locked surface | ProductionHub 864-space | no | critical | yes | Whole-project machine view — not Entry 002 disguised; do not redesign in tree sprint. |
| inbox-root | INBOX | /production/queue | mobile,tablet,desktop | REFERENCE_LOCKED | founder reference inbox plate | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-tab-needs | inbox-root | tab needs | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-tab-watching | inbox-root | tab watching | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-tab-resolved | inbox-root | tab resolved | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-attention-detail | inbox-root | founder gate / approval card | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-approve | inbox-attention-detail | APPROVE button | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-revision | inbox-attention-detail | REQUEST REVISION | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-decision-note | inbox-root | post-decision footnote | mobile,tablet,desktop | PARTIAL | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no | Inline note not toast system. |
| inbox-queue-list | inbox-root | queued requests | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-empty-needs | inbox-root | empty needs tab | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-watching-list | inbox-root | in-progress requests | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| inbox-resolved-feed | inbox-root | activity-derived resolved | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-root | LIBRARY | /production/libraries | mobile,tablet,desktop | REFERENCE_LOCKED | founder reference library vault | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-authorities | library-root | category AUTHORITIES | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-assets | library-root | category ASSETS | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-characters | library-root | category CHARACTERS | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-environments | library-root | category ENVIRONMENTS | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-expressions | library-root | category EXPRESSIONS | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-references | library-root | category REFERENCES | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-icons | library-root | category ICONS | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-materials | library-root | category MATERIALS | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-documents | library-root | category DOCUMENTS | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-category-archive | library-root | category ARCHIVE | mobile,tablet,desktop | PARTIAL | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-canon-tabs | library-root | CANONICAL\|IN REVIEW\|SUPERSEDED\|ARCHIVE | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-canon-detail | library-root | canonical vault hero + lineage | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-collections | library-root | COLLECTIONS list | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-collection-panel | library-collections | expand collection row | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-recent | library-root | recent assets strip | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| library-empty-review | library-root | non-canonical empty | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| activity-root | ACTIVITY | /production/activity | mobile,tablet,desktop | REFERENCE_LOCKED | founder reference activity log | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| activity-hero | activity-root | hub crystal atmosphere | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| activity-filters | activity-root | workspace filter chips | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| activity-log-row | activity-root | event row expand | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| activity-empty | activity-root | no rows after filter | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-root | DESIGN | /production/ndxbook/design?mode=* | mobile,tablet,desktop | REFERENCE_LOCKED | six mode reference plates + Grok1 chamber art | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-mode-bar | design-root | DesignModeBar 6 links | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-mode-brand | design-root | ?mode=brand | mobile,tablet,desktop | REFERENCE_LOCKED | production-authority-registry design-brand | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-mode-experience | design-root | ?mode=experience | mobile,tablet,desktop | REFERENCE_LOCKED | production-authority-registry design-experience | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-mode-surfaces | design-root | ?mode=surfaces | mobile,tablet,desktop | REFERENCE_LOCKED | production-authority-registry design-surfaces | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-mode-compiler | design-root | ?mode=compiler | mobile,tablet,desktop | REFERENCE_LOCKED | production-authority-registry design-compiler | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-mode-assets | design-root | ?mode=assets | mobile,tablet,desktop | REFERENCE_LOCKED | production-authority-registry design-assets | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-mode-viewport | design-root | ?mode=viewport | mobile,tablet,desktop | REFERENCE_LOCKED | production-authority-registry design-viewport | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-chamber-boards | design-root | floating board panels | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-pipeline | design-root | pipeline strip | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-on-your-table | design-root | ON YOUR TABLE cards | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-viewport-stage | design-mode-viewport | device frame + iframe | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-viewport-zoom | design-mode-viewport | FIT\|50\|75\|100 | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-viewport-safe | design-mode-viewport | safe area toggle | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-viewport-target-select | design-mode-viewport | device target dropdown | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| design-validation-sheet-link | design-mode-viewport | link → design/workspace | mobile,tablet,desktop | PARTIAL | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no | Hands off to twin-opus bench overlay. |
| design-child-workspace | DESIGN | /production/ndxbook/design/workspace | mobile,tablet,desktop | STRUCTURALLY_CORRECT_VISUALLY_WRONG | legacy twin-opus bench | DesignProductionWorkspaceLayout + ph overlay | no | high | no | Mobile: fixed 768 canvas scaled — RESPONSIVE_AUTHORITY_FAILURE. |
| design-child-references | DESIGN | /production/ndxbook/design/references | mobile,tablet,desktop | REFERENCE_LOCKED | production design sections | PwFrame + section | no | medium | no | In-shell DesignProductionSections. |
| design-child-assets | DESIGN | /production/ndxbook/design/assets | mobile,tablet,desktop | REFERENCE_LOCKED | production design sections | PwFrame + section | no | medium | no | In-shell DesignProductionSections. |
| design-child-pages | DESIGN | /production/ndxbook/design/pages | mobile,tablet,desktop | REFERENCE_LOCKED | production design sections | PwFrame + section | no | medium | no | In-shell DesignProductionSections. |
| design-child-skins | DESIGN | /production/ndxbook/design/skins | mobile,tablet,desktop | REFERENCE_LOCKED | production design sections | PwFrame + section | no | medium | no | In-shell DesignProductionSections. |
| design-child-history | DESIGN | /production/ndxbook/design/history | mobile,tablet,desktop | REFERENCE_LOCKED | production design sections | PwFrame + section | no | medium | no | In-shell DesignProductionSections. |
| design-child-more | DESIGN | /production/ndxbook/design/more | mobile,tablet,desktop | REFERENCE_LOCKED | production design sections | PwFrame + section | no | medium | no | In-shell DesignProductionSections. |
| design-overlay-chrome | design-child-workspace | ProductionChromeOverlay on design/* child routes | mobile,tablet,desktop | LEGACY_LOCKED | inherited parent | ph strip | no | low | no | Shared 864-space chrome over twin-opus. |
| experience-root | EXPERIENCE | /production/ndxbook/experience | mobile,tablet,desktop | REFERENCE_LOCKED | ExperienceBody + world plate | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| experience-child-world | EXPERIENCE | /production/ndxbook/experience/world | mobile,tablet,desktop | PARTIAL | inherited parent | PwFrame + pwa-xchild | no | low | no | Capsule label WORLD. Content: UNMOUNTED empty — honest placeholder. |
| experience-capsules-world | experience-child-world | horizontal capsule nav | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| experience-empty-world | experience-child-world | NO WORKSPACE SURFACE MOUNTED | mobile,tablet,desktop | UNMOUNTED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | yes | Sub-workspace not mounted in Production yet. |
| experience-child-zones | EXPERIENCE | /production/ndxbook/experience/zones | mobile,tablet,desktop | PARTIAL | inherited parent | PwFrame + pwa-xchild | no | low | no | Capsule label ZONES. Content: UNMOUNTED empty — honest placeholder. |
| experience-capsules-zones | experience-child-zones | horizontal capsule nav | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| experience-empty-zones | experience-child-zones | NO WORKSPACE SURFACE MOUNTED | mobile,tablet,desktop | UNMOUNTED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | yes | Sub-workspace not mounted in Production yet. |
| experience-child-environments | EXPERIENCE | /production/ndxbook/experience/environments | mobile,tablet,desktop | PARTIAL | inherited parent | PwFrame + pwa-xchild | no | low | no | Capsule label PATHS. Content: UNMOUNTED empty — honest placeholder. |
| experience-capsules-environments | experience-child-environments | horizontal capsule nav | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| experience-empty-environments | experience-child-environments | NO WORKSPACE SURFACE MOUNTED | mobile,tablet,desktop | UNMOUNTED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | yes | Sub-workspace not mounted in Production yet. |
| experience-child-modules | EXPERIENCE | /production/ndxbook/experience/modules | mobile,tablet,desktop | PARTIAL | inherited parent | PwFrame + pwa-xchild | no | low | no | Capsule label INTERACTIONS. Content: UNMOUNTED empty — honest placeholder. |
| experience-capsules-modules | experience-child-modules | horizontal capsule nav | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| experience-empty-modules | experience-child-modules | NO WORKSPACE SURFACE MOUNTED | mobile,tablet,desktop | UNMOUNTED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | yes | Sub-workspace not mounted in Production yet. |
| experience-child-simulations | EXPERIENCE | /production/ndxbook/experience/simulations | mobile,tablet,desktop | PARTIAL | inherited parent | PwFrame + pwa-xchild | no | low | no | Capsule label INHABITANTS. Content: UNMOUNTED empty — honest placeholder. |
| experience-capsules-simulations | experience-child-simulations | horizontal capsule nav | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| experience-empty-simulations | experience-child-simulations | NO WORKSPACE SURFACE MOUNTED | mobile,tablet,desktop | UNMOUNTED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | yes | Sub-workspace not mounted in Production yet. |
| experience-child-assets | EXPERIENCE | /production/ndxbook/experience/assets | mobile,tablet,desktop | PARTIAL | inherited parent | PwFrame + pwa-xchild | no | low | no | Capsule label STATES. Content: UNMOUNTED empty — honest placeholder. |
| experience-capsules-assets | experience-child-assets | horizontal capsule nav | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| experience-empty-assets | experience-child-assets | NO WORKSPACE SURFACE MOUNTED | mobile,tablet,desktop | UNMOUNTED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | yes | Sub-workspace not mounted in Production yet. |
| experience-child-review | EXPERIENCE | /production/ndxbook/experience/review | mobile,tablet,desktop | PARTIAL | inherited parent | PwFrame + pwa-xchild | no | low | no | Capsule label ACCESS. Content: UNMOUNTED empty — honest placeholder. |
| experience-capsules-review | experience-child-review | horizontal capsule nav | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| experience-empty-review | experience-child-review | NO WORKSPACE SURFACE MOUNTED | mobile,tablet,desktop | UNMOUNTED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | yes | Sub-workspace not mounted in Production yet. |
| experience-canon-paths-alias | experience-root | PATHS capsule → environments route | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no | Product canon label PATHS; registry id environments. |
| expression-root | EXPRESSION | /production/ndxbook/expression?entry=002 | mobile,tablet,desktop | REFERENCE_LOCKED | ExpressionBody production floor | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-child-narrative | EXPRESSION | /production/ndxbook/expression/narrative?entry=* | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-child-character-fabrication | EXPRESSION | /production/ndxbook/expression/character-fabrication?entry=* | mobile,tablet,desktop | PARTIAL | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-child-casting | EXPRESSION | /production/ndxbook/expression/casting?entry=* | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-child-wardrobe | EXPRESSION | /production/ndxbook/expression/wardrobe?entry=* | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-child-performance | EXPRESSION | /production/ndxbook/expression/performance?entry=* | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-child-sets | EXPRESSION | /production/ndxbook/expression/sets?entry=* | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-child-storyboard | EXPRESSION | /production/ndxbook/expression/storyboard?entry=* | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-child-review | EXPRESSION | /production/ndxbook/expression/review?entry=* | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-floors-grid | expression-root | PRODUCTION FLOORS cards | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-making | expression-root | CURRENTLY MAKING | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-active-entries | expression-root | ACTIVE PRODUCTIONS | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-travel-table | expression-root | ON YOUR TABLE formats | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-campaign-context | expression-root | entry query + context store | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| narrative-tabs | expression-child-narrative | story\|structure\|momentum tabs | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| narrative-momentum | expression-child-narrative | Open narrative momentum / tab=momentum | mobile,tablet,desktop | REFERENCE_LOCKED | NME embed remapped in .pw--authority | ProductionAuthorityFrame (.pxa) | no | low | no | Grandchild wizard; founder recording surface. |
| casting-tab-actors | expression-child-casting | Actors sub-tab | mobile,tablet,desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| expression-engine-legacy | EXPRESSION | /projects/ndxbook/content-operations/expression-engine | mobile,tablet,desktop | LEGACY_LOCKED | inherited parent | expression-engine UI | no | critical | no | Linked from wardrobe/performance/storyboard/review engine buttons. |
| cf-surface | expression-child-character-fabrication | CharacterFabrication component | mobile,tablet,desktop | PARTIAL | legacy locked CF spec | CF authority (Fab Condensed) | yes | low | no | Wide hosts: scaled 432 canvas; own typography. |
| resp-hub-root-mobile | HUB | hub-root @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-hub-root-mobile-xl | HUB | hub-root @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-hub-root-tablet | HUB | hub-root @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-hub-root-desktop | HUB | hub-root @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-inbox-root-mobile | INBOX | inbox-root @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-inbox-root-mobile-xl | INBOX | inbox-root @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-inbox-root-tablet | INBOX | inbox-root @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-inbox-root-desktop | INBOX | inbox-root @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-design-root-mobile | DESIGN | design-root @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-design-root-mobile-xl | DESIGN | design-root @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-design-root-tablet | DESIGN | design-root @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-design-root-desktop | DESIGN | design-root @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-design-child-workspace-mobile | DESIGN | design-child-workspace @ mobile | mobile | STRUCTURALLY_CORRECT_VISUALLY_WRONG | inherited parent | ProductionAuthorityFrame (.pxa) | no | high | no | RESPONSIVE_AUTHORITY_FAILURE: 768 desktop canvas scaled into phone. |
| resp-design-child-workspace-mobile-xl | DESIGN | design-child-workspace @ mobile-xl | mobile-xl | STRUCTURALLY_CORRECT_VISUALLY_WRONG | inherited parent | ProductionAuthorityFrame (.pxa) | no | high | no | RESPONSIVE_AUTHORITY_FAILURE: 768 desktop canvas scaled into phone. |
| resp-design-child-workspace-tablet | DESIGN | design-child-workspace @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-design-child-workspace-desktop | DESIGN | design-child-workspace @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-experience-root-mobile | EXPERIENCE | experience-root @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-experience-root-mobile-xl | EXPERIENCE | experience-root @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-experience-root-tablet | EXPERIENCE | experience-root @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-experience-root-desktop | EXPERIENCE | experience-root @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-experience-child-world-mobile | EXPERIENCE | experience-child-world @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no | Pw descendant shell; empty UNMOUNTED body same all breakpoints. |
| resp-experience-child-world-mobile-xl | EXPERIENCE | experience-child-world @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no | Pw descendant shell; empty UNMOUNTED body same all breakpoints. |
| resp-experience-child-world-tablet | EXPERIENCE | experience-child-world @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no | Pw descendant shell; empty UNMOUNTED body same all breakpoints. |
| resp-experience-child-world-desktop | EXPERIENCE | experience-child-world @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-expression-root-mobile | EXPRESSION | expression-root @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-expression-root-mobile-xl | EXPRESSION | expression-root @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-expression-root-tablet | EXPRESSION | expression-root @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-expression-root-desktop | EXPRESSION | expression-root @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-cf-surface-mobile | EXPRESSION | cf-surface @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-cf-surface-mobile-xl | EXPRESSION | cf-surface @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-cf-surface-tablet | EXPRESSION | cf-surface @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-cf-surface-desktop | EXPRESSION | cf-surface @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-library-root-mobile | LIBRARY | library-root @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-library-root-mobile-xl | LIBRARY | library-root @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-library-root-tablet | LIBRARY | library-root @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-library-root-desktop | LIBRARY | library-root @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-activity-root-mobile | ACTIVITY | activity-root @ mobile | mobile | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-activity-root-mobile-xl | ACTIVITY | activity-root @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-activity-root-tablet | ACTIVITY | activity-root @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-activity-root-desktop | ACTIVITY | activity-root @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-hub-machine-mobile | HUB | hub-machine @ mobile | mobile | LEGACY_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-hub-machine-mobile-xl | HUB | hub-machine @ mobile-xl | mobile-xl | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-hub-machine-tablet | HUB | hub-machine @ tablet | tablet | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |
| resp-hub-machine-desktop | HUB | hub-machine @ desktop | desktop | REFERENCE_LOCKED | inherited parent | ProductionAuthorityFrame (.pxa) | no | low | no |  |

## Status totals

- **LEGACY_LOCKED:** 4
- **PARTIAL:** 12
- **REFERENCE_LOCKED:** 134
- **STRUCTURALLY_CORRECT_VISUALLY_WRONG:** 4
- **UNMOUNTED:** 7

## Kind totals

- route: 30
- section: 59
- interaction: 23
- temporary: 5
- responsive-variant: 44
- **all nodes:** 161