# Preview alignment plan (founder approval gate FD-06)

1. Merge or pin tunnel worktree to **tested candidate SHA** after founder accepts branch.
2. On canonical connector env: `bash .cursor/scripts/post-merge-preview-tunnel-refresh.sh` with worktree checked out to candidate.
3. Confirm `/tmp/site00-preview-runtime-lineage.txt` PREVIEW_SHA matches candidate.
4. Hard refresh mobile; verify `data-site00-preview-build` matches.

**Not executed this sprint** (explicit prohibition on tunnel mutation without authorization).
