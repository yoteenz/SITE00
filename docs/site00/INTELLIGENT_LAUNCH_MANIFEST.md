# Intelligent Launch Manifest

A Launch Manifest represents:

> **What must be true for this particular project to achieve this particular target?**

## Not a Static Checklist

Each project may have multiple manifests over its lifetime:

- MVP Launch
- Core Operations
- Public Beta
- Full Brand Launch
- Campaign Launch
- Custom

## Manifest Fields

| Field | Description |
|-------|-------------|
| target_name | Human-readable target |
| target_type | Launch target classification |
| objective | Why this target exists |
| target_date | When known |
| manifest_state | PROPOSED → APPROVED → ACTIVE |
| approval_state | Admin approval required |
| requirements | Target-specific requirement set |
| readiness_score | Auditable percentage |
| readiness_explanation | Contributing items breakdown |

## Requirement Model

Each requirement has **two separate dimensions**:

### Classification (scope role)
- `REQUIRED_FOR_LAUNCH`
- `REQUIRED_FOR_MILESTONE`
- `OPTIONAL_POST_LAUNCH`
- `OUT_OF_SCOPE`
- `DEFERRED_BY_OWNER`
- `BLOCKED`
- `COMPLETE`

### Execution Status (work state)
- `NOT_STARTED`
- `IN_PROGRESS`
- `READY_FOR_REVIEW`
- `BLOCKED`
- `COMPLETE`

## Workflow

```
PROJECT CONTEXT → GENERATE PROPOSED MANIFEST → ADMIN REVIEW → EDIT → APPROVE → ACTIVE MANIFEST
```

Never silently activate an AI-proposed manifest.

## Readiness Algorithm

Only `REQUIRED_FOR_LAUNCH` and appropriate `REQUIRED_FOR_MILESTONE` items participate.

Excluded from readiness penalty:
- `DEFERRED_BY_OWNER`
- `OPTIONAL_POST_LAUNCH`
- `OUT_OF_SCOPE`

Output:
- Readiness score (%)
- Blocking requirements remaining
- Required / complete counts
- Per-requirement contribution audit

## Deferral

Admin defers incomplete requirement → impact calculated → flows to EVOLVE roadmap.

## Launch Override

Owner launches with incomplete requirement → explicit reason + approver + timestamp. Underlying requirement state **preserved**.

## Explainability

Every requirement can answer:
- **Why is this required?** (`why_required`, dependency chain)
- **Why is this not blocking?** (classification, deferral reason, target milestone)

## Database Tables

- `site00_launch_manifests`
- `site00_manifest_requirements`
- `site00_requirement_dependencies`
- `site00_manifest_deferrals`
- `site00_launch_overrides`
