# OL-07 filter duplication fix (P2)

## Problem

Foundations toolbar maintained `query` / `stateFilter` locally while OL-07 was a static message — two UX paths, no shared state.

## Fix

- `RegistryFilterProvider` wraps founder workspace app (`FounderWorkspaceApp.tsx`).  
- `FoundationsPage` and `Ol07RegistryFilters` (OL-07) read/write the same context.  
- Toolbar retains inline search/state for desktop/tablet; overlay adds sort + consolidated Apply/Reset.  
- Opening OL-07 passes `lifecycle_states` for select options.

## Verification

Unit: `idntyFounderWorkspaceAcceptance.test.ts` (shared provider + OL-07 component).

Browser interaction: pending authenticated session.
