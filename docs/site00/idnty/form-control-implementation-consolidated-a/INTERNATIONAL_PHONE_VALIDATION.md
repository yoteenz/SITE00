# International phone validation

**Library:** `libphonenumber-js` (shared `contactPhone.ts`).

**Default region:** `US` when no `+` prefix (preserves existing US-first behavior).

**International:** values with `+` or `00` prefix parsed globally; valid E.164 structure required for completion.

**Typing:** non-destructive — US local formatting via existing dashed helper; international via `AsYouType`.
