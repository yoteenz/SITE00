# 16 · All 37 screens — results

Structure (method 15-B, unmasked, 471 × 836): edge recall / precision / mean |Δ| against the authority, BEFORE (#1713 `f7e2739c`) → AFTER (this branch, which also carries OPUS1; changes on screens other than 02–05 include OPUS1's history / detail / correction refinements and this sprint's short-phone content clamp). Unmasked: live names, sample figures and dates differ by design, so no screen reaches 1.0.

| ID | Name | Primary class | BEFORE | AFTER | Δ recall | Reachable all 9 (B → A) | Evidence |
|---|---|---|---|---|---|---|---|
| 01 | MONEY DOT 01 VIEW ALL ACCOUNTS | AUTHORITY_MATCH_CANDIDATE | 0.924 / 0.968 / 17.3 | 0.924 / 0.968 / 17.3 | +0.000 | yes → yes | `evidence/before_after/01_AUTHORITY_BEFORE_AFTER.webp` |
| 02 | BANK ACCOUNT | AUTHORITY_MATCH_CANDIDATE | 0.952 / 0.940 / 18.2 | 0.952 / 0.941 / 18.1 | +0.001 | no → yes | `evidence/before_after/02_AUTHORITY_BEFORE_AFTER.webp` |
| 03 | RIDESHARE CARD | AUTHORITY_MATCH_CANDIDATE | 0.655 / 0.694 / 55.3 | 0.884 / 0.861 / 24.4 | +0.229 | no → yes | `evidence/before_after/03_AUTHORITY_BEFORE_AFTER.webp` |
| 04 | CASH ON HAND | AUTHORITY_MATCH_CANDIDATE | 0.655 / 0.713 / 58.7 | 0.848 / 0.870 / 24.9 | +0.193 | no → yes | `evidence/before_after/04_AUTHORITY_BEFORE_AFTER.webp` |
| 05 | CREDIT CARD | AUTHORITY_MATCH_CANDIDATE | 0.693 / 0.724 / 52.4 | 0.907 / 0.916 / 25.1 | +0.214 | no → yes | `evidence/before_after/05_AUTHORITY_BEFORE_AFTER.webp` |
| 06 | ALL ACCOUNTS | AUTHORITY_MATCH_CANDIDATE | 0.768 / 0.877 / 43.1 | 0.768 / 0.877 / 43.1 | +0.000 | yes → yes | `evidence/before_after/06_AUTHORITY_BEFORE_AFTER.webp` |
| 07 | BANK TRANSACTION HISTORY | STRUCTURAL_MISMATCH | 0.682 / 0.762 / 38.8 | 0.704 / 0.771 / 37.4 | +0.023 | yes → yes | `evidence/before_after/07_AUTHORITY_BEFORE_AFTER.webp` |
| 08 | RIDESHARE ACTIVITY | STRUCTURAL_MISMATCH | 0.645 / 0.802 / 56.8 | 0.633 / 0.812 / 49.6 | -0.012 | yes → yes | `evidence/before_after/08_AUTHORITY_BEFORE_AFTER.webp` |
| 09 | CASH USAGE HISTORY | STRUCTURAL_MISMATCH | 0.662 / 0.821 / 53.6 | 0.640 / 0.817 / 50.1 | -0.022 | yes → yes | `evidence/before_after/09_AUTHORITY_BEFORE_AFTER.webp` |
| 10 | CREDIT CARD ACTIVITY | STRUCTURAL_MISMATCH | 0.638 / 0.794 / 53.0 | 0.606 / 0.778 / 46.7 | -0.031 | yes → yes | `evidence/before_after/10_AUTHORITY_BEFORE_AFTER.webp` |
| 11 | TRANSACTION DETAIL | STRUCTURAL_MISMATCH | 0.640 / 0.783 / 52.2 | 0.640 / 0.785 / 52.2 | +0.001 | yes → yes | `evidence/before_after/11_AUTHORITY_BEFORE_AFTER.webp` |
| 12 | ACCOUNT DETAILS AND SETTINGS | STRUCTURAL_MISMATCH | 0.740 / 0.743 / 43.6 | 0.741 / 0.745 / 43.6 | +0.001 | yes → yes | `evidence/before_after/12_AUTHORITY_BEFORE_AFTER.webp` |
| 13 | ACCOUNT BALANCE REVIEW | STRUCTURAL_MISMATCH | 0.645 / 0.788 / 66.2 | 0.628 / 0.800 / 58.1 | -0.017 | yes → yes | `evidence/before_after/13_AUTHORITY_BEFORE_AFTER.webp` |
| 14 | ADD ACCOUNT | LAYOUT_MISMATCH | 0.607 / 0.747 / 69.6 | 0.596 / 0.738 / 67.3 | -0.011 | no → yes | `evidence/before_after/14_AUTHORITY_BEFORE_AFTER.webp` |
| 15 | EDIT ACCOUNT | LAYOUT_MISMATCH | 0.649 / 0.747 / 49.2 | 0.655 / 0.748 / 49.0 | +0.006 | yes → yes | `evidence/before_after/15_AUTHORITY_BEFORE_AFTER.webp` |
| 16 | RECORD BANK TRANSACTION | ASSET_MISMATCH | 0.728 / 0.769 / 58.4 | 0.721 / 0.762 / 59.5 | -0.007 | yes → yes | `evidence/before_after/16_AUTHORITY_BEFORE_AFTER.webp` |
| 17 | ADD CASH | ASSET_MISMATCH | 0.505 / 0.733 / 69.4 | 0.509 / 0.736 / 69.7 | +0.004 | yes → yes | `evidence/before_after/17_AUTHORITY_BEFORE_AFTER.webp` |
| 18 | RECORD CASH SPENDING | ASSET_MISMATCH | 0.668 / 0.749 / 61.0 | 0.659 / 0.744 / 61.8 | -0.009 | yes → yes | `evidence/before_after/18_AUTHORITY_BEFORE_AFTER.webp` |
| 19 | RECORD CREDIT CARD PURCHASE | ASSET_MISMATCH | 0.680 / 0.734 / 51.5 | 0.673 / 0.727 / 52.0 | -0.007 | yes → yes | `evidence/before_after/19_AUTHORITY_BEFORE_AFTER.webp` |
| 20 | RECORD CREDIT CARD PAYMENT | ASSET_MISMATCH | 0.709 / 0.810 / 51.9 | 0.721 / 0.813 / 51.7 | +0.012 | yes → yes | `evidence/before_after/20_AUTHORITY_BEFORE_AFTER.webp` |
| 21 | ACCOUNT PURPOSE PREFERENCES | ASSET_MISMATCH | 0.628 / 0.728 / 64.9 | 0.624 / 0.727 / 66.1 | -0.003 | yes → yes | `evidence/before_after/21_AUTHORITY_BEFORE_AFTER.webp` |
| 22 | EMPTY ACCOUNTS | LAYOUT_MISMATCH | 0.641 / 0.761 / 64.6 | 0.642 / 0.762 / 64.5 | +0.001 | no → yes | `evidence/before_after/22_AUTHORITY_BEFORE_AFTER.webp` |
| 23 | BALANCE ADJUSTMENT REVIEW | STRUCTURAL_MISMATCH | 0.624 / 0.774 / 60.7 | 0.614 / 0.772 / 52.9 | -0.009 | yes → yes | `evidence/before_after/23_AUTHORITY_BEFORE_AFTER.webp` |
| 24 | TRANSACTION CORRECTION / REVERSAL | STRUCTURAL_MISMATCH | 0.612 / 0.769 / 52.6 | 0.614 / 0.770 / 52.5 | +0.002 | yes → yes | `evidence/before_after/24_AUTHORITY_BEFORE_AFTER.webp` |
| 25 | ACCOUNT ARCHIVE CONFIRMATION | LAYOUT_MISMATCH | 0.635 / 0.746 / 57.8 | 0.612 / 0.735 / 59.0 | -0.023 | no → yes | `evidence/before_after/25_AUTHORITY_BEFORE_AFTER.webp` |
| 26 | CAPTURE RECEIPT | RESPONSIVE_MISMATCH | 0.888 / 0.942 / 27.2 | 0.888 / 0.944 / 27.2 | +0.001 | no → no | `evidence/before_after/26_AUTHORITY_BEFORE_AFTER.webp` |
| 27 | SCANNING RECEIPT | ASSET_MISMATCH | 0.607 / 0.747 / 58.1 | 0.600 / 0.747 / 57.9 | -0.006 | yes → yes | `evidence/before_after/27_AUTHORITY_BEFORE_AFTER.webp` |
| 28 | REVIEW EXTRACTED PURCHASE | STRUCTURAL_MISMATCH | 0.599 / 0.757 / 53.5 | 0.605 / 0.753 / 54.9 | +0.006 | yes → yes | `evidence/before_after/28_AUTHORITY_BEFORE_AFTER.webp` |
| 29 | RECEIPT EXCEPTION / DUPLICATE | ASSET_MISMATCH | 0.576 / 0.771 / 74.2 | 0.585 / 0.785 / 75.2 | +0.009 | no → yes | `evidence/before_after/29_AUTHORITY_BEFORE_AFTER.webp` |
| 30 | ACCOUNT SETUP DETAILS | LAYOUT_MISMATCH | 0.683 / 0.701 / 53.8 | 0.684 / 0.702 / 53.8 | +0.002 | yes → yes | `evidence/before_after/30_AUTHORITY_BEFORE_AFTER.webp` |
| 31 | TRANSACTION SEARCH AND FILTER | STRUCTURAL_MISMATCH | 0.644 / 0.773 / 48.3 | 0.686 / 0.773 / 49.9 | +0.042 | yes → yes | `evidence/before_after/31_AUTHORITY_BEFORE_AFTER.webp` |
| 32 | REORDER ACCOUNTS | ASSET_MISMATCH | 0.630 / 0.757 / 56.5 | 0.630 / 0.757 / 56.5 | +0.000 | no → yes | `evidence/before_after/32_AUTHORITY_BEFORE_AFTER.webp` |
| 33 | TRANSACTION REVIEW | STRUCTURAL_MISMATCH | 0.597 / 0.728 / 53.4 | 0.597 / 0.726 / 53.2 | +0.001 | yes → yes | `evidence/before_after/33_AUTHORITY_BEFORE_AFTER.webp` |
| 34 | RECEIPT CAPTURE FAILURE | ASSET_MISMATCH | 0.567 / 0.688 / 59.2 | 0.632 / 0.726 / 57.9 | +0.065 | no → yes | `evidence/before_after/34_AUTHORITY_BEFORE_AFTER.webp` |
| 35 | ACCOUNT NEEDS REVIEW | LAYOUT_MISMATCH | 0.585 / 0.762 / 61.6 | 0.585 / 0.762 / 61.6 | +0.000 | no → yes | `evidence/before_after/35_AUTHORITY_BEFORE_AFTER.webp` |
| 36 | ARCHIVE BLOCKED | ASSET_MISMATCH | 0.621 / 0.737 / 77.7 | 0.634 / 0.742 / 77.0 | +0.013 | yes → yes | `evidence/before_after/36_AUTHORITY_BEFORE_AFTER.webp` |
| 37 | CORRECTION / REVERSAL CONFIRMATION | ASSET_MISMATCH | 0.615 / 0.742 / 50.3 | 0.620 / 0.739 / 50.1 | +0.005 | yes → yes | `evidence/before_after/37_AUTHORITY_BEFORE_AFTER.webp` |
