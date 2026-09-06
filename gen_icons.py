"""Sidecar 車伴 app icons — racing-red speedo dial.

Rendered at 4x and downsampled for clean edges. Three output kinds:
  * "any"      — rounded square, used in-browser and as the PWA icon
  * "maskable" — full-bleed square with the dial inside the 80% safe zone,
                 so Android can crop it to any shape without clipping the dial
  * apple-touch — full-bleed square, no rounded corners (iOS applies its own mask)
"""
from PIL import Image, ImageDraw
import math

S = 4  # supersample factor

BG_TOP  = (152, 28, 32)
BG_BOT  = (84, 10, 16)
ARC     = (255, 238, 208)   # cream sweep
TRACK   = (112, 26, 30)     # unlit remainder of the dial
HOT     = (38, 8, 10)       # red-line segment
NEEDLE  = (255, 206, 80)    # amber needle + hub
RING    = (198, 96, 92)     # outer bezel


def _plate(n, radius_ratio):
    """Vertical-gradient red plate, optionally rounded."""
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for y in range(n):
        t = y / n
        d.line([(0, y), (n, y)],
               fill=tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3)) + (255,))
    if radius_ratio <= 0:
        return img
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, n - 1, n - 1],
                                           radius=int(n * radius_ratio), fill=255)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def _dial(d, cx, cy, r, n):
    """Speedo dial. Stroke weights are deliberately heavy so the icon still
    reads at ~60px on a homescreen."""
    box = [cx - r, cy - r, cx + r, cy + r]
    d.ellipse(box, outline=RING + (255,), width=max(1, int(n * 0.020)))
    w = max(2, int(n * 0.075))
    d.arc(box, 135, 300, fill=ARC + (255,), width=w)
    d.arc(box, 300, 45, fill=HOT + (255,), width=w)
    a = math.radians(255)
    d.line([cx - r * 0.18 * math.cos(a), cy - r * 0.18 * math.sin(a),
            cx + r * 0.78 * math.cos(a), cy + r * 0.78 * math.sin(a)],
           fill=NEEDLE + (255,), width=max(2, int(n * 0.046)))
    hr = n * 0.058
    d.ellipse([cx - hr, cy - hr, cx + hr, cy + hr], fill=NEEDLE + (255,))


def make(size, path, radius_ratio=0.22, dial_scale=0.335):
    n = size * S
    img = _plate(n, radius_ratio)
    _dial(ImageDraw.Draw(img), n / 2, n / 2, n * dial_scale, n)
    img = img.resize((size, size), Image.LANCZOS)
    if radius_ratio <= 0:                       # opaque square for iOS / maskable
        img = img.convert("RGB")
    img.save(path)


if __name__ == "__main__":
    # rounded-square icons ("any" purpose)
    for s in (1024, 512, 384, 256, 192, 128):
        make(s, f"icons/icon-{s}.png")
    # maskable: full bleed, dial pulled into the safe zone
    for s in (512, 192):
        make(s, f"icons/icon-maskable-{s}.png", radius_ratio=0, dial_scale=0.255)
    # iOS home screen
    make(180, "icons/apple-touch-icon.png", radius_ratio=0)
    make(32, "icons/favicon-32.png", radius_ratio=0)
    print("icons generated")
