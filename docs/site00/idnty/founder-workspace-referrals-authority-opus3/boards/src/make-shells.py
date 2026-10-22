#!/usr/bin/env python3
"""Writes one board-<ID>-<slug>.html shell per board id (all content lives in boards.js)."""
from pathlib import Path
BOARDS = [
 ('R01','overview-mobile'),('R02','overview-tablet-portrait'),('R03','overview-tablet-landscape'),('R04','overview-desktop'),('R05','overview-ultra-wide'),
 ('R06','partners-mobile'),('R07','partners-tablet'),('R08','partners-desktop'),('R09','partner-detail-mobile'),('R10','partner-detail-desktop'),('R11','partner-creation-terms'),
 ('R12','referral-history-mobile'),('R13','attribution-ledger-desktop'),('R14','source-trace'),('R15','attribution-exception'),
 ('R16','commissions-mobile'),('R17','commissions-tablet'),('R18','commissions-desktop'),('R19','commission-detail'),('R20','commission-approval'),
 ('R21','payouts-mobile'),('R22','payouts-tablet'),('R23','payouts-desktop'),('R24','payout-detail'),('R25','record-payment'),
 ('R26','card-studio-mobile'),('R27','card-studio-tablet'),('R28','card-studio-desktop'),('R29','card-front-concepts'),('R30','card-back-concepts'),
 ('R31','qr-validation'),('R32','digital-card-share'),('R33','print-preview'),('R34','print-production-specimen'),
 ('R35','partner-portal-mobile-home'),('R36','partner-portal-mobile-card'),('R37','partner-portal-mobile-earnings'),('R38','partner-portal-desktop'),
 ('R39','referral-activity'),('R40','overlay-system'),('R41','responsive-component-matrix'),('R42','navigation-route-tree'),
 ('R43','e2e-attribution-journey'),('R44','e2e-commission-payout-journey'),
]
here = Path(__file__).parent
for bid, slug in BOARDS:
    (here / f'board-{bid}-{slug}.html').write_text(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>BOARD {bid} {slug.replace('-', ' ').upper()}</title>
<link rel="stylesheet" href="/src/site00/styles/site00-correspondence-fonts.css">
<link rel="stylesheet" href="../../../founder-workspace-visual-authority-opus1/boards/src/board.css">
<link rel="stylesheet" href="../../../founder-workspace-responsive-authority-opus2/boards/src/board2.css">
<link rel="stylesheet" href="./rf-board.css">
</head>
<body data-board="{bid}">
<div id="board"></div>
<script type="module" src="./boards.js"></script>
</body>
</html>
''')
print(len(BOARDS), 'shells')
