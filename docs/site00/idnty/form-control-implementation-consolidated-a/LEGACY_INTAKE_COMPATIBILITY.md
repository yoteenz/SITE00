# Legacy intake compatibility

- Partial drafts without phone: load and save; blocked at CONTINUE / completion.
- `intake_state === 'COMPLETE'` before phone rule: `completeIntake` no-op return preserves status even if phone later cleared in memory tests.
- Paid / accepted clients: no checkout changes in this sprint.

Founder follow-up for historic completes without phone: operational, not client-blocking.
