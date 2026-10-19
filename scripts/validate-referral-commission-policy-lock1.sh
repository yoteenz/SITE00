#!/usr/bin/env bash
# Consistency checks for referral-commission-policy-founder-lock1 (docs-only sprint).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
POL="$ROOT/docs/site00/idnty/referral-commission-policy-founder-lock1"
REG="$ROOT/docs/site00/idnty/founder-workspace-referrals-authority-opus3/29_FOUNDER_APPROVAL_REGISTER.md"

fail() { echo "VALIDATION FAIL: $*" >&2; exit 1; }

rg -q '2500' "$POL/FIXED_FEE_RATE_SCHEDULE.md" || fail 'missing 2500'
rg -q '3500' "$POL/FIXED_FEE_RATE_SCHEDULE.md" || fail 'missing 3500'
rg -q '5000' "$POL/FIXED_FEE_RATE_SCHEDULE.md" || fail 'missing 5000'
rg -q '50000' "$POL/FIXED_FEE_RATE_SCHEDULE.md" || fail 'missing 50000 base'
rg -q '90.day' "$POL/REFERRAL_ATTRIBUTION_POLICY.md" || fail 'missing 90-day window'
rg -q '14.day' "$POL/COMMISSION_ELIGIBILITY_MATRIX.md" || fail 'missing 14-day hold'
rg -q '15th' "$POL/MONTHLY_PAYOUT_POLICY.md" || fail 'missing 15th payout'
rg -q 'Minimum threshold' "$POL/MONTHLY_PAYOUT_POLICY.md" && rg -q 'None' "$POL/MONTHLY_PAYOUT_POLICY.md" || fail 'missing no minimum threshold'
rg -q 'DECIDED.*FIXED' "$REG" || fail 'register FD-R01 not decided'
rg -q 'DECIDED.*500' "$REG" || fail 'register FD-R02 not decided'
rg -q 'DECIDED.*25' "$REG" || fail 'register FD-R03 not decided'

# Reject active percentage policy in lock folder (allow only explicit rejection prose)
while IFS= read -r -d '' f; do
  if rg -q '15%' "$f" && ! rg -qi 'reject|not adopt|illustrative' "$f"; then
    fail "15% appears without rejection context in $f"
  fi
done < <(find "$POL" -name '*.md' -print0)

# Cap enforcement language
rg -q '5000' "$POL/FOUNDER_POLICY_DECISIONS.md" || fail 'cap not in decisions doc'

echo "VALIDATION PASS: referral-commission-policy-founder-lock1"
