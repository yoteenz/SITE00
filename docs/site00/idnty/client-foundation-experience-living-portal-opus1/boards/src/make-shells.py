#!/usr/bin/env python3
"""Writes one board-<ID>-<slug>.html shell per board defined in boards.js (all content lives in boards.js)."""
import re
from pathlib import Path
here = Path(__file__).parent
src = (here / 'boards.js').read_text()
ids = re.findall(r"^  ([A-Z]+\d\d): \(\) => (?:\(\{ fam: '[^']*', title: '([^']*)'|\w+\('([^']*)')", src, re.M)
for f in here.glob('board-*.html'):
    f.unlink()
for bid, t1, t2 in ids:
    slug = re.sub(r'[^a-z0-9]+', '-', (t1 or t2).lower()).strip('-')[:48].strip('-')
    (here / f'board-{bid}-{slug}.html').write_text(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>BOARD {bid} {(t1 or t2).upper()}</title>
<link rel="stylesheet" href="/src/site00/styles/site00-correspondence-fonts.css">
<link rel="stylesheet" href="../../../founder-workspace-visual-authority-opus1/boards/src/board.css">
<link rel="stylesheet" href="../../../founder-workspace-responsive-authority-opus2/boards/src/board2.css">
<link rel="stylesheet" href="./cf-board.css">
</head>
<body data-board="{bid}">
<div id="board"></div>
<script type="module" src="./boards.js"></script>
</body>
</html>
''')
print(len(ids), 'shells')
