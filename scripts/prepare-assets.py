"""Create web-sized copies; preserve all original portfolio files."""
from pathlib import Path
from PIL import Image, ImageOps
import json, shutil, unicodedata
ROOT = Path(__file__).resolve().parent.parent
source = next(p for p in ROOT.iterdir() if p.is_dir() and unicodedata.normalize('NFC', p.name) == '작품이미지')
files = sorted((p for p in source.iterdir() if p.suffix.lower() in ('.jpg', '.jpeg', '.png', '.gif')), key=lambda p: unicodedata.normalize('NFC', p.name))
out = ROOT / 'assets/artworks'
out.mkdir(parents=True, exist_ok=True)
aliases = {4:16, 5:45, 7:44, 8:17, 9:15, 29:48}
inventory = []
for i, path in enumerate(files, 1):
    original = ImageOps.exif_transpose(Image.open(path))
    record = {'id': i, 'source': str(path.relative_to(ROOT)), 'width':original.width, 'height':original.height, 'displayId':aliases.get(i,i)}
    inventory.append(record)
    if i in aliases: continue
    if path.suffix == '.gif': shutil.copy2(path, out / f'{i:02}.gif')
    if original.mode in ('RGBA', 'LA') or 'transparency' in original.info:
        canvas = Image.new('RGBA', original.size, 'white'); canvas.alpha_composite(original.convert('RGBA')); original = canvas.convert('RGB')
    else: original = original.convert('RGB')
    for size in (400, 900, 1800):
        im = original.copy(); im.thumbnail((size,size), Image.Resampling.LANCZOS)
        im.save(out / f'{i:02}-{size}.webp', 'WEBP', quality=88, method=6)
(ROOT / 'docs/asset-inventory.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2)+'\n')
portrait = ROOT / 'tmp/pdfs/portrait-000.jpg'
if portrait.exists():
    im=Image.open(portrait); im.thumbnail((700,700)); im.save(out / 'portrait.webp','WEBP',quality=90)
print(f'Prepared {len(files)-len(aliases)} artwork images from {len(files)} source files.')
