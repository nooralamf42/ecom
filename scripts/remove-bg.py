"""
Knock out a solid (white) background to transparency and trim.

Usage: python scripts/remove-bg.py <input_image> [output.png]

Uses flood-fill from the four corners so only the background that is connected
to the edges becomes transparent — interior highlights (e.g. the silver sheen
inside the B) are preserved.
"""
import sys
from PIL import Image, ImageDraw

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "public/bangleish-logo.png"

im = Image.open(src).convert("RGBA")
w, h = im.size

# Flood-fill transparent from each corner. thresh catches anti-aliased edges.
THRESH = 60
for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
    ImageDraw.floodfill(im, corner, (0, 0, 0, 0), thresh=THRESH)

# Also clear any remaining near-white pixels that are fully opaque and very
# light (stray specks in the margin), but keep bright metallic highlights by
# only removing pixels that are almost pure white.
px = im.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a != 0 and r > 244 and g > 244 and b > 244:
            px[x, y] = (r, g, b, 0)

# Trim to the visible logo.
bbox = im.getbbox()
if bbox:
    im = im.crop(bbox)

im.save(out)
print(f"Saved {out} ({im.size[0]}x{im.size[1]})")
