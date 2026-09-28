"""Generate high-quality responsive WebP variants. Requires Pillow. Originals remain intact."""
import json
from pathlib import Path
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1]
manifest = {}
for source in sorted((root / 'public/images').rglob('*')):
    if source.suffix.lower() not in ('.jpg', '.jpeg', '.png') or source.name == 'logo.png':
        continue
    relative = source.relative_to(root / 'public')
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw).convert('RGB')
        w, h = image.size
        widths = sorted(set([n for n in (320, 640, 1024, 1600, 2400) if n < w] + [min(w, 2400)]))
        variants = []
        for width in widths:
            path = Path('media') / relative.parent.relative_to('images') / f'{source.stem}-{width}.webp'
            destination = root / 'public' / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            image.resize((width, round(h * width / w)), Image.Resampling.LANCZOS).save(destination, quality=87, method=6)
            variants.append({'src': str(path), 'width': width})
        manifest[str(relative)] = {'width': w, 'height': h, 'variants': variants}
(root / 'src/data/media.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Generated variants for {len(manifest)} images.')
