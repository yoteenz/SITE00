#!/usr/bin/env python3
"""Import the FNDATN-01 founder visual authority (14 JPEG references) into the repository.

Usage:
  python3 scripts/correspondence-studio/fndatn01/import_authority.py /path/to/extracted_zip

The extracted ZIP must contain MANIFEST.json, README.txt and emails/<slug>/{desktop,mobile}.jpg.
Copies the references unchanged and writes the asset manifest with both hashes: the source PNG
hash recorded by the founder package, and the hash of the JPEG derivative actually committed.
No step generates, upscales or retouches the authority images.
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
PUBLIC_DIR = ROOT / 'public/site00-correspondence-studio/fndatn-01/authority'
PUBLIC_URL = '/site00-correspondence-studio/fndatn-01/authority'
DOCS_DIR = ROOT / 'docs/site00/correspondence/fndatn-01'
SOURCE_ATTACHMENT = 'SITE00_FNDATN_7_EMAILS_UNDER_4MB_5cf4.zip'


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main(src: Path) -> None:
    source_manifest = json.loads((src / 'MANIFEST.json').read_text())
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src / 'MANIFEST.json', DOCS_DIR / 'SOURCE_MANIFEST.json')
    shutil.copyfile(src / 'README.txt', DOCS_DIR / 'SOURCE_README.txt')

    entries = []
    for item in source_manifest['items']:
        slug = item['slug']
        out = {'slug': slug, 'title': item['title'], 'registry_mapping_candidate': item['existing_registry_mapping_candidate'],
               'send_guard': item['send_guard'], 'authorities': {}}
        for device in ('desktop', 'mobile'):
            asset = item['assets'][device]
            src_file = src / asset['file']
            dest = PUBLIC_DIR / slug / f'{device}.jpg'
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src_file, dest)
            with Image.open(dest) as im:
                width, height = im.size
            if (width, height) != (asset['width'], asset['height']):
                raise SystemExit(f'{slug}/{device}: dimensions {width}x{height} differ from manifest')
            out['authorities'][device] = {
                'repo_path': str(dest.relative_to(ROOT)),
                'public_path': f'{PUBLIC_URL}/{slug}/{device}.jpg',
                'width': width,
                'height': height,
                'bytes': dest.stat().st_size,
                'jpeg_sha256': sha256(dest),
                'source_png': asset['source'],
                'source_png_sha256': asset['sha256'],
            }
        entries.append(out)

    manifest = {
        'pack': 'FNDATN-01',
        'pack_title': 'SITE 00 / DIGITAL FOUNDATION / FOUNDATIONAL CORRESPONDENCE / PACK 01',
        'brand': 'SITE 00',
        'source_attachment': SOURCE_ATTACHMENT,
        'source_package': source_manifest['package'],
        'source_package_version': source_manifest['version'],
        'authority_status': 'FOUNDER VISUAL AUTHORITY SUPPLIED',
        'hash_note': 'source_png_sha256 is the founder PNG hash recorded in the package manifest. The package ships optimized JPEG '
                     'derivatives, so jpeg_sha256 is the hash of the committed file.',
        'non_authoritative_content': [
            'All names, dates, amounts, references, payment methods and progress states shown in the artwork are illustrative.',
            'The RESUME artwork shows PAYMENT RECEIVED in its tracker; that step is not workflow truth.',
            'The QUOTE EXPIRY countdown is illustrative; the live email uses the actual quote expiration.',
            'The $500 shown in the quote artwork never overrides the actual quote.',
        ],
        'emails': entries,
    }
    (DOCS_DIR / 'FNDATN_01_AUTHORITY_MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'imported {sum(len(e["authorities"]) for e in entries)} authorities')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(Path(sys.argv[1]))
