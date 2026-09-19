# EXPRESSION_ENGINE_SELF_APPLICATION

Sprint B5.0 formalizes how the Expression Engine applies its own production methodology to improve its operator interface.

## Concept

**EXPRESSION_ENGINE_SELF_APPLICATION** — the system uses its understanding of creative-production workflow to derive interface hierarchy, visual prominence, action hierarchy, progressive disclosure, and context-specific composition.

This is not autonomous UI generation. It is a documented methodology for Studio World workspace design.

## Input dimensions

| Dimension | Entry 002 example |
|-----------|-------------------|
| Domain | Creative-production workflow |
| User | Founder / creative director |
| Primary job | Move Entry through production |
| Context | Active current gate (e.g. FINAL STORYBOARD) |
| Artifact | Current production object (storyboard strip, authority board) |
| Continuity | Locked world / artifact / palette relationships |
| Destination | Campaign Board ingestion |

## Derivation rules

1. **Hierarchy** — Three levels: Entry Command Header → Production Journey → Active Workspace + Supporting Intelligence.
2. **Visual prominence** — The active artifact consumes the viewport center; metadata recedes.
3. **Action hierarchy** — One dominant primary action from canonical `nextAction` state.
4. **Progressive disclosure** — Raw gate IDs, telemetry, JSON → System Inspector.
5. **Context-specific composition** — Active production stage determines WORK tab content, not equal pill navigation.

## Experience principles (locked)

01. SHOW THE WORK BEFORE THE SYSTEM.
02. CURRENT GATE OWNS THE VIEW.
03. APPROVED ARTIFACTS BECOME VISUAL OBJECTS, NOT TEXT RECORDS.
04. SYSTEM INTELLIGENCE USES PROGRESSIVE DISCLOSURE.
05. PRODUCTION STATE SHOULD BE SEEN BEFORE IT IS READ.
06. THE USER SHOULD ALWAYS KNOW: WHERE AM I? WHAT AM I REVIEWING? WHAT HAPPENS NEXT?
07. HISTORICAL INTELLIGENCE SHOULD NEVER COMPETE WITH CURRENT PRODUCTION.
08. CONTINUITY SHOULD BE VISUALIZED AS RELATIONSHIPS, NOT DUMPED AS PROSE.
09. THE WORKFLOW SHOULD TERMINATE IN A VISIBLE DESTINATION (CAMPAIGN BOARD).
10. CREATIVE WORKSPACE ≠ ADMIN DASHBOARD.

## Implementation reference

- Workspace root: `src/site00/components/founderWorkspace/expressionEngine/ExpressionEngineEntry002Workspace.tsx`
- Journey mapping: `src/site00/components/founderWorkspace/expressionEngine/productionJourney.ts`
- Components: EntryCommandHeader, ProductionJourney, CurrentGate, AuthorityGalleryWorkspace, FinalStoryboardWorkspace, ContinuityMap, SystemInspector, CampaignBoardDestination

## Future application

This methodology should inform:

- Campaign Board ingestion workspace
- Keyframe / video production stages
- Other NDXBOOK entry production surfaces
- Studio World operator tools beyond Expression Engine
