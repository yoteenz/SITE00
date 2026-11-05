"""The 37-screen matrix: runtime environment, expected SIDEKICK family, classification, this sprint's change."""
# runtime env per screen (from the code: Dot01Frame env props; 01 = MoneyMotionParent on F05_MOTION_SIDEKICK = SK01 field)
ENV = {'01': 'SK01 (F05_MOTION_SIDEKICK)', '02': 'SK02_FIELD + SK02 papers', '03': 'SK02_FIELD + SCENE_03 band', '04': 'SK02_FIELD + SCENE_04 band', '05': 'SK02_FIELD + SCENE_05 band',
       '06': 'SK01_FIELD + CARD06 papers + ACTION06 surfaces', '22': 'SK02_FIELD + SCENE_22 band + SEAL_22', '26': 'SK03 (full, baked)', '32': 'SK02_FIELD (reorder list)'}
for s in ['07', '08', '09', '10', '11', '12', '13', '31', '35']:
    ENV[s] = 'SK02_FIELD + papers'
for s in ['14', '15', '16', '17', '18', '19', '20', '21', '23', '24', '25', '27', '28', '29', '30', '33', '34', '36', '37']:
    ENV[s] = 'SK03_FIELD + papers'
BEFORE_ENV = dict(ENV, **{'06': 'SK02_FIELD + flow grid (SK01 card thumbnails) + generic strip', '22': 'SK02_FIELD + generic panel / tiles'})

# (classification after this sprint, what changed, remaining deviation) — OPUS2 matrix revalidated; 06 and 22 rebuilt
M = {
    '01': ('AUTHORITY_MATCH_CANDIDATE · FOUNDER_REVIEW_REQUIRED', 'UNCHANGED (tunnel base: Cursor accounts rail)', 'the accounts collection shows two pockets + ADD A POCKET + MOVE MONEY (Cursor rail, d6992b3fc) where the authority draws four account papers; dock glyphs are vectors'),
    '02': ('AUTHORITY_MATCH_CANDIDATE · FOUNDER_REVIEW_REQUIRED', 'UNCHANGED', 'summary labels SET ASIDE / PENDING / INCOMING (tunnel copy) vs the authority AVAILABLE / HELD / PENDING; ACCOUNT HISTORY open-book art not supplied (vector)'),
    '03': ('AUTHORITY_MATCH_CANDIDATE · MISSING_MICRO_ASSET', 'UNCHANGED (OPUS2 scene band verified)', 'CARD DETAILS info glyph is an inline vector (Batch 02 medallion is glossy); on phones shorter than 9:16 the landscape under the last row is below the fold'),
    '04': ('AUTHORITY_MATCH_CANDIDATE · MISSING_MICRO_ASSET', 'UNCHANGED (OPUS2 scene band verified)', 'CASH DETAILS info glyph inline vector; short-phone foot as 03'),
    '05': ('AUTHORITY_MATCH_CANDIDATE · MISSING_MICRO_ASSET', 'UNCHANGED (OPUS2 scene band verified)', 'CARD DETAILS glyph inline vector; short-phone foot as 03'),
    '06': ('AUTHORITY_MATCH_CANDIDATE (4 pockets) · FOUNDER_REVIEW_REQUIRED (0–3, ≥ 5 variants)', 'REBUILT this sprint', 'reduced / extended counts are proposals; back chip glyph is an inline vector on the amber tile; the dock glyphs are the canonical vectors'),
    '07': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'authority: plain DATE / TRANSACTION / AMOUNT ledger with account summary; runtime keeps search + filters'),
    '08': ('STRUCTURAL_MISMATCH · MISSING_FOREGROUND_ASSET', 'NOT CHANGED', 'authority rows carry scene thumbnails and a payout summary'),
    '09': ('STRUCTURAL_MISMATCH · MISSING_FOREGROUND_ASSET', 'NOT CHANGED', 'authority rows carry scene thumbnails and a cash summary'),
    '10': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'authority header pairs CURRENT BALANCE + AVAILABLE CREDIT over a plain table'),
    '11': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'receipt preview beside the rows; four action rows'),
    '12': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'authority row set and toggles differ'),
    '13': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'TRACKED / ACTUAL / DIFFERENCE hierarchy not reconstructed'),
    '14': ('INCORRECT_LAYOUT', 'NOT CHANGED', 'form fields below the type cards laid out differently'),
    '15': ('INCORRECT_LAYOUT', 'NOT CHANGED', 'purpose tags, balance tracking and status action arrangement'),
    '16': ('MISSING_MICRO_ASSET · SOURCE_ART_BLOCKED · INCORRECT_LAYOUT', 'NOT CHANGED', 'temple (bank) seal and receipt-with-corners header art not mounted; the authority frames the hero higher (title paper at y ≈ 250)'),
    '17': ('MISSING_MICRO_ASSET · SOURCE_ART_BLOCKED', 'NOT CHANGED', 'amphora-with-coins header art and coin seal not supplied'),
    '18': ('MISSING_MICRO_ASSET · SOURCE_ART_BLOCKED', 'NOT CHANGED', 'amphora seal not supplied; receipt slip under the heading'),
    '19': ('MISSING_MICRO_ASSET · SOURCE_ART_BLOCKED', 'NOT CHANGED', 'coin seal not supplied'),
    '20': ('MISSING_MICRO_ASSET · SOURCE_ART_BLOCKED', 'NOT CHANGED', 'card seal not supplied'),
    '21': ('MISSING_MICRO_ASSET · INCORRECT_LAYOUT', 'NOT CHANGED', 'chip surfaces await corrected Batch 05 (CHIP.PARCHMENT rejected)'),
    '22': ('AUTHORITY_MATCH_CANDIDATE · FOUNDER_REVIEW_REQUIRED', 'REBUILT this sprint', 'LEARN ACCOUNT TYPES opens a new plain-language explainer (no authority for its sheet)'),
    '23': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'TRACKED / ACTUAL papers and ADJUSTMENT AMOUNT band'),
    '24': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'original / revised receipt preview beside the rows'),
    '25': ('INCORRECT_LAYOUT · MISSING_FOREGROUND_ASSET', 'NOT CHANGED (probe fixture corrected for the zero-balance policy)', 'account summary paper with scene thumbnail'),
    '26': ('AUTHORITY_MATCH_CANDIDATE · RESPONSIVE_FAILURE (393 × 660)', 'NOT CHANGED', 'buttons baked into SK03; ENTER MANUALLY is half below the fold at 393 × 660'),
    '27': ('MISSING_MICRO_ASSET · SOURCE_ART_BLOCKED', 'NOT CHANGED', 'scan corners / beam await corrected Batch 06 (B06-01 / B06-02)'),
    '28': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'receipt preview beside the read values'),
    '29': ('MISSING_MICRO_ASSET · SOURCE_ART_BLOCKED', 'NOT CHANGED', 'duplicate comparison papers + red notice (Batch 06 rejected)'),
    '30': ('INCORRECT_LAYOUT', 'NOT CHANGED', 'field list arrangement'),
    '31': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'authority filter chips row + thumbnail list (V3 quick search is a separate drawer, unbuilt)'),
    '32': ('INCORRECT_LAYOUT · MISSING_MICRO_ASSET', 'NOT CHANGED', 'six-dot grip art (Batch 04 / 08 is a menu glyph, held); list rows not on the 06 composition'),
    '33': ('STRUCTURAL_MISMATCH', 'NOT CHANGED', 'receipt preview left, totals paper'),
    '34': ('MISSING_MICRO_ASSET · INCORRECT_LAYOUT', 'NOT CHANGED', 'caution surface (Batch 06)'),
    '35': ('INCORRECT_LAYOUT · MISSING_FOREGROUND_ASSET', 'NOT CHANGED', 'account summary card with scene; review-issue rows'),
    '36': ('MISSING_MICRO_ASSET · SOURCE_ART_BLOCKED', 'NOT CHANGED (V3 caution in the V9 frame, OPUS1 V3)', 'padlock wax seal not supplied'),
    '37': ('INCORRECT_LAYOUT', 'NOT CHANGED', 'comparison badge and paper arrangement'),
}
GROUPS = {'01-13': [f'{i:02d}' for i in range(1, 14)], '14-25': [f'{i:02d}' for i in range(14, 26)], '26-37': [f'{i:02d}' for i in range(26, 38)]}
