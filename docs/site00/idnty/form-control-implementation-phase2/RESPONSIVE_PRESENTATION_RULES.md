# Responsive presentation rules

**Default query:** `(pointer: coarse) and (max-width: 600px)` → sheet.

| Profile | Expected |
| --- | --- |
| Phone portrait 320–430 | Sheet |
| Phone landscape | Sheet while width ≤600; listbox if wider with fine pointer |
| Tablet portrait touch | Sheet |
| Tablet + mouse (fine pointer, wide) | Listbox |
| Desktop 1280+ | Listbox |

Orientation change while open: close overlay, preserve value.

Tablet uses approved family (sheet or listbox), not a third design.
