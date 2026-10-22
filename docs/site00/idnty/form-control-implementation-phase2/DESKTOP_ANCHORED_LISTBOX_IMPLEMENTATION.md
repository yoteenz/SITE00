# Desktop anchored listbox

Reuses **DfSelect** (existing combobox + listbox APG):

- Trigger: `.df-select__trigger` inside field shell
- Placement above/below based on viewport space (existing `place()` logic)
- Keyboard: arrows, Home/End, Enter/Space commit, Escape close
- Selected row: red 6px period + inset red edge (Phase 2 CSS)
- Outside click closes without commit (unchanged DfSelect behavior)
