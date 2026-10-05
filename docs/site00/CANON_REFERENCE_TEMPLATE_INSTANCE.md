# Canon / Reference / Template / Instance

Four distinct production concepts. **Do not collapse them.**

## 1. Canon

Authoritative facts.

Examples: company info, brand rules, products, services, audience, positioning, approved colors, voice, pricing, claims, project objectives.

**Tables:** `site00_canon_records`, `site00_canon_versions`

## 2. Reference

Approved visual/creative truth — what something **should** look or feel like.

Example: SITE 00 Email Family 05 Hero Reference.

**Tables:** `site00_reference_families`, `site00_references`

Fields: family, reference type, asset ref, approval state, version, parent reference.

## 3. Template

Reusable implementation derived from an approved reference.

Example: MilestoneCompleteEmail component.

**Table:** `site00_production_templates`

Linked to reference via `reference_id`. Contains `implementation_spec`.

## 4. Instance

Actual production output generated from a template.

Example: "Phase 01 Complete — Project 00-458."

**Table:** `site00_production_instances`

Linked to template via `template_id`. Contains `rendered_output_ref`.

## Email Family Process

The existing SITE 00 Email Family workflow maps to this model:

```
REFERENCE FAMILY (EMAIL / MILESTONE_CELEBRATION)
  └── REFERENCE (Family 05 Hero) [APPROVED]
        └── TEMPLATE (Milestone Complete)
        └── TEMPLATE (Phase Complete)
        └── INSTANCE ("Phase 01 Complete — Project 00-458")
```

## Content Brain Foundation

`site00_content_brain_entries` — structured knowledge for future content generation:

Brand facts, products, FAQs, objections, testimonials, hooks, CTAs, campaign ideas, approved/forbidden claims, etc.

Sprint 01 creates the model only — not the full content engine.

## Rules

- Reference ≠ Template
- Template ≠ Instance
- Evidence of external activity ≠ Instance completion
- Approval gates apply to Canon and Reference promotion
