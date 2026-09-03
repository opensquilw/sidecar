from PIL import Image, ImageDraw

TOP = (26, 32, 40)
BOT = (10, 12, 16)


def make_icon(size, path, rounded=True):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        r = int(TOP[0] + (BOT[0] - TOP[0]) * t)
        g = int(TOP[1] + (BOT[1] - TOP[1]) * t)
        b = int(TOP[2] + (BOT[2] - TOP[2]) * t)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))

    radius = size * 0.22 if rounded else 0
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)

    d = ImageDraw.Draw(out)
    cx, cy = size / 2, size / 2
    white = (245, 165, 36, 255)
    amber = (245, 165, 36, 255)

    # car body (side profile): lower slab + cabin
    body_w = size * 0.66
    body_h = size * 0.17
    body_top = cy - size * 0.01
    d.rounded_rectangle(
        [cx - body_w / 2, body_top, cx + body_w / 2, body_top + body_h],
        radius=body_h * 0.42, fill=white)

    cabin_w = size * 0.40
    cabin_h = size * 0.16
    d.rounded_rectangle(
        [cx - cabin_w / 2 - size * 0.02, body_top - cabin_h + size * 0.02,
         cx + cabin_w / 2 - size * 0.02, body_top + size * 0.03],
        radius=size * 0.06, fill=white)

    # wheels
    wr = size * 0.085
    wy = body_top + body_h
    for wx in (cx - body_w * 0.28, cx + body_w * 0.28):
        d.ellipse([wx - wr, wy - wr * 0.75, wx + wr, wy + wr * 1.25], fill=white)
        d.ellipse([wx - wr * 0.4, wy - wr * 0.15, wx + wr * 0.4, wy + wr * 0.65], fill=(10, 12, 16, 255))

    # amber oil drop above the car
    dr = size * 0.075
    dtop = cy - size * 0.36
    dbot = dtop + dr * 2.4
    d.ellipse([cx + size * 0.16 - dr, dbot - dr * 1.5, cx + size * 0.16 + dr, dbot + dr * 0.5], fill=amber)
    d.polygon([(cx + size * 0.16, dtop),
               (cx + size * 0.16 - dr * 0.95, dbot - dr * 0.7),
               (cx + size * 0.16 + dr * 0.95, dbot - dr * 0.7)], fill=amber)

    out.save(path)


make_icon(192, 'icons/icon-192.png')
make_icon(512, 'icons/icon-512.png')
make_icon(180, 'icons/apple-touch-icon.png', rounded=False)
print('icons generated')
