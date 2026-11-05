# 08 · Screens 01 and 02

**01 MONEY parent** — SK01 pixel pair (hero MAD 5.8). Composition as OPUS / Cursor left it; this sprint did not touch the parent.
Deviation found: on `d6992b3fc` the ACCOUNTS collection is Cursor's snap rail (two pockets + ADD A POCKET + MOVE MONEY papers),
where the authority draws the four account papers. The probe flags CASH and CREDIT as off-screen in every viewport because they
are in the horizontal rail (reachable by swipe). The carousel / motion E2E specs still assert the four-paper layout and fail on the
untouched base too (report 26): the rail is a founder-facing decision, recorded FOUNDER_REVIEW_REQUIRED, not changed here.

**02 BANK ACCOUNT** — SK02 pixel pair (hero 6.0, foot 9.1). Unchanged. Deviations: the tunnel copy sets SET ASIDE / PENDING /
INCOMING where the authority prints AVAILABLE / HELD / PENDING; ACCOUNT HISTORY's open-book art is a vector.
