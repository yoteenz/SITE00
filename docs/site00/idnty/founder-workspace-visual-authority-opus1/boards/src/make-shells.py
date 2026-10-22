#!/usr/bin/env python3
"""Emit the HTML shell for every board-XX-*.js module (identical head; the module builds the board)."""
import glob, os
HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<link rel="stylesheet" href="/src/site00/styles/site00-df-client.css">
<link rel="stylesheet" href="/src/site00/styles/site00-df-components.css">
<link rel="stylesheet" href="./board.css">
<link rel="stylesheet" href="./fw.css">
</head>
<body>
<div id="board"></div>
<script type="module" src="./{js}"></script>
</body>
</html>
'''
here = os.path.dirname(os.path.abspath(__file__))
for js in sorted(glob.glob(os.path.join(here, 'board-*.js'))):
    name = os.path.basename(js)
    title = name[:-3].replace('-', ' ').upper()
    with open(js[:-3] + '.html', 'w') as f:
        f.write(HEAD.format(title=title, js=name))
print('ok')
