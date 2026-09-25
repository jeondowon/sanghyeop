"""Create display copies using the stable IDs in docs/asset-inventory.json."""

import json
import shutil
import unicodedata
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif'}


def normalize(value):
    return unicodedata.normalize('NFC', value)


def load_sources():
    """Validate the complete source mapping before overwriting any display files."""
    inventory = json.loads((ROOT / 'docs/asset-inventory.json').read_text())
    folders = [p for p in ROOT.iterdir() if p.is_dir() and normalize(p.name) == '작품이미지']
    if len(folders) != 1:
        raise ValueError('Expected one original artwork folder named 작품이미지.')

    sources = {
        normalize(str(p.relative_to(ROOT))): p
        for p in folders[0].iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS
    }
    expected = {normalize(record['source']) for record in inventory}
    ids = {record['id'] for record in inventory}
    if len(expected) != len(inventory) or len(ids) != len(inventory):
        raise ValueError('Duplicate source paths or artwork IDs in the inventory.')
    if expected != sources.keys():
        missing = sorted(expected - sources.keys())
        unmapped = sorted(sources.keys() - expected)
        raise ValueError(f'Update the image mapping before generating assets. Missing: {missing}; unmapped: {unmapped}')
    display_ids = {record['id'] for record in inventory if record['id'] == record['displayId']}
    if any(record['displayId'] not in display_ids for record in inventory):
        raise ValueError('Every displayId must refer to a displayed original in the inventory.')
    return inventory, sources


def main():
    inventory, sources = load_sources()
    output = ROOT / 'assets/artworks'
    output.mkdir(parents=True, exist_ok=True)
    count = 0
    for record in inventory:
        if record['id'] != record['displayId']:
            continue
        path = sources[normalize(record['source'])]
        with Image.open(path) as source:
            original = ImageOps.exif_transpose(source)
            if original.mode in ('RGBA', 'LA') or 'transparency' in original.info:
                canvas = Image.new('RGBA', original.size, 'white')
                canvas.alpha_composite(original.convert('RGBA'))
                original = canvas.convert('RGB')
            else:
                original = original.convert('RGB')
            for size in (400, 900, 1800):
                image = original.copy()
                image.thumbnail((size, size), Image.Resampling.LANCZOS)
                image.save(output / f"{record['id']:02}-{size}.webp", 'WEBP', quality=88, method=6)
        if path.suffix.lower() == '.gif':
            shutil.copy2(path, output / f"{record['id']:02}.gif")
        count += 1

    portrait = ROOT / 'tmp/pdfs/portrait-000.jpg'
    if portrait.exists():
        with Image.open(portrait) as image:
            image.thumbnail((700, 700))
            image.save(output / 'portrait.webp', 'WEBP', quality=90)
    print(f'Prepared {count} artwork images from {len(inventory)} source files.')


if __name__ == '__main__':
    main()
