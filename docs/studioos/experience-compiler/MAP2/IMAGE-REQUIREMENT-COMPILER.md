# Image requirement compiler

One `ImageRequirement` per Grok-required asset slot. Every requirement includes **must_include** and **must_exclude**, continuity group, surface derivation, negative space, shadow/reflection/mask ownership, and deterministic `canonical_name`.

Validation: `validateMustIncludeExclude()` in tests.
