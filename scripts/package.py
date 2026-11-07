#!/usr/bin/env python3
"""Build a runtime-only extension ZIP and validate its manifest references."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent.parent
FILES = (
    'manifest.json', 'popup.html', 'popup.js', 'options.html', 'options.js',
    'settings.js', 'styles.css', 'icons/icon16.png', 'icons/icon48.png',
    'icons/icon128.png', 'LICENSE', 'PRIVACY.md',
)


def build(output, tag=None):
    manifest = json.loads((ROOT / 'manifest.json').read_text())
    version = manifest['version']
    if tag is not None and tag != f'v{version}':
        raise ValueError(f'Tag {tag} does not match manifest version v{version}')
    references = [manifest['action']['default_popup'], manifest['options_page']]
    references += list(manifest['icons'].values())
    references += list(manifest['action']['default_icon'].values())
    for name in (*FILES, *references):
        if name not in FILES or not (ROOT / name).is_file():
            raise ValueError(f'Missing packaged file: {name}')
    output.mkdir(parents=True, exist_ok=True)
    archive = output / f'dalex-chrome-cleaner-v{version}.zip'
    with ZipFile(archive, 'w', ZIP_DEFLATED) as package:
        for name in FILES:
            package.write(ROOT / name, name)
    with ZipFile(archive) as package:
        if package.testzip() is not None:
            raise ValueError('ZIP integrity check failed')
        assert set(package.namelist()) == set(FILES)
        assert json.loads(package.read('manifest.json')) == manifest
    checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
    (output / 'SHA256SUMS.txt').write_text(f'{checksum}  {archive.name}\n')
    print(f'Validated {archive} ({archive.stat().st_size} bytes)')
    return archive


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'dist')
    parser.add_argument('--tag', help='Require a tag matching the manifest version')
    args = parser.parse_args()
    build(args.output, args.tag)
