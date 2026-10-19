#!/usr/bin/env python3
"""Writes one board-<ID>-<slug>.html shell per board id (all content lives in boards.js)."""
from pathlib import Path
BOARDS = [
 ('D01','global-shell'),('D02','overview'),('D03','foundations-registry'),('D04','create-client'),('D05','client-record'),
 ('D06','client-intake-recommendations'),('D07','client-quote'),('D08','reviews-queue'),('D09','review-detail'),('D10','operations'),
 ('D11','correspondence'),('D12','system'),('D13','test-lab'),('D14','global-overlays'),('D15','component-system'),
 ('TP01','global-shell'),('TP02','overview'),('TP03','foundations'),('TP04','create-client'),('TP05','client-record'),
 ('TP06','reviews'),('TP07','operations'),('TP08','correspondence'),('TP09','system'),('TP10','global-overlays'),
 ('TL01','global-shell'),('TL02','overview'),('TL03','foundations'),('TL04','create-client'),('TL05','client-record'),
 ('TL06','reviews'),('TL07','operations'),('TL08','correspondence'),('TL09','system'),('TL10','global-overlays'),
 ('C01','desktop-before-after'),('C02','tablet-portrait-landscape'),('C03','typographic-reflow'),('C04','component-proportions'),
 ('C05','registry-inspector-responsiveness'),('C06','reviews-workbench-responsiveness'),('C07','system-console-responsiveness'),
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
<link rel="stylesheet" href="./board2.css">
</head>
<body data-board="{bid}">
<div id="board"></div>
<script type="module" src="./boards.js"></script>
</body>
</html>
''')
print(len(BOARDS), 'shells')
