"""Sidecar 車伴 app icons — cute red racer, mountains, road.

Drawn as SVG and rasterised with cairosvg, so every size comes from the
vector with no resampling loss.  Run:  python3 gen_icons.py

Three output families:
  * "any"      — rounded square (the PWA / browser icon)
  * "maskable" — full-bleed square with the subject pulled inside the 80%
                 safe circle, so Android can crop it to any shape
  * apple-touch — full-bleed square, no rounded corners (iOS masks it itself)
"""
import cairosvg

W, R, SW, INK = 512, 114, 15, "#111111"
SKY, GLASS, AMBER, RED = "#7FC4E8", "#BFD9F2", "#F0AD4E", "#E8402F"


def _eyes(x1, x2, y, r=10):
    return (f'<circle cx="{x1}" cy="{y}" r="{r}" fill="{INK}"/>'
            f'<circle cx="{x2}" cy="{y}" r="{r}" fill="{INK}"/>')


def _scene():
    """sun, peaks, road, then the car — road runs past the bottom edge so it
    still bleeds after the subject group is scaled down for maskable icons."""
    sun = '<circle cx="96" cy="118" r="40" fill="#FFE08A"/>'
    peaks = ('<polygon points="150,404 470,404 336,104" fill="#43A047"/>'
             '<polygon points="10,404 300,404 156,132" fill="#63C062"/>')
    road = ('<rect x="0" y="434" width="512" height="266" fill="#6E7987"/>'
            '<rect x="54" y="472" width="84" height="15" rx="7" fill="#FFFFFF"/>'
            '<rect x="214" y="472" width="84" height="15" rx="7" fill="#FFFFFF"/>'
            '<rect x="374" y="472" width="84" height="15" rx="7" fill="#FFFFFF"/>')
    car = f'''<g transform="translate(0,6)">
      <rect x="104" y="222" width="22" height="46" rx="8" fill="{INK}"/>
      <rect x="150" y="222" width="22" height="46" rx="8" fill="{INK}"/>
      <rect x="82" y="200" width="112" height="24" rx="11" fill="{INK}"/>
      <path d="M 96,300 L 100,264 C 102,250 112,242 128,242 L 168,238 L 232,196
               C 240,190 248,188 258,188 L 300,188 C 314,188 322,194 328,206 L 348,248
               L 420,266 C 440,272 448,284 448,300 L 448,326
               C 448,340 438,348 424,348 L 112,348 C 100,348 96,338 96,326 Z"
            fill="{RED}" stroke="{INK}" stroke-width="{SW}" stroke-linejoin="round"/>
      <path d="M 100,282 L 446,302 L 446,320 L 98,302 Z" fill="#FFFFFF"/>
      <path d="M 246,236 L 276,200 C 280,196 286,194 292,194 L 306,194
               C 312,194 316,198 318,204 L 330,236 Z"
            fill="{GLASS}" stroke="{INK}" stroke-width="11" stroke-linejoin="round"/>
      {_eyes(282, 312, 218, 10)}
      <circle cx="196" cy="270" r="25" fill="#FFFFFF" stroke="{INK}" stroke-width="10"/>
      <text x="196" y="280" font-family="Arial Black, Arial, Helvetica, sans-serif"
            font-size="28" font-weight="900" text-anchor="middle" fill="{INK}">07</text>
      <circle cx="166" cy="350" r="52" fill="{INK}"/><circle cx="166" cy="350" r="22" fill="#FFFFFF"/>
      <circle cx="382" cy="350" r="46" fill="{INK}"/><circle cx="382" cy="350" r="19" fill="#FFFFFF"/>
      <rect x="424" y="276" width="30" height="22" rx="10" fill="{AMBER}" stroke="{INK}" stroke-width="10"/>
    </g>'''
    return sun + peaks + road + car


def build(rounded=True, subject=1.0):
    radius = f'rx="{R}" ry="{R}"' if rounded else ""
    inner = _scene()
    if subject != 1.0:
        inner = (f'<g transform="translate(256,256) scale({subject}) translate(-256,-256)">'
                 f'{inner}</g>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{W}" '
            f'viewBox="0 0 {W} {W}"><rect x="0" y="0" width="{W}" height="{W}" {radius} '
            f'fill="{SKY}"/>{inner}</svg>')


def render(size, path, rounded=True, subject=1.0):
    cairosvg.svg2png(bytestring=build(rounded, subject).encode(),
                     write_to=path, output_width=size, output_height=size)


if __name__ == "__main__":
    for s in (128, 192, 256, 384, 512, 1024):
        render(s, f"icons/icon-{s}.png")
    # maskable: subject inside the 80% safe circle, background bleeds
    for s in (192, 512):
        render(s, f"icons/icon-maskable-{s}.png", rounded=False, subject=0.86)
    render(180, "icons/apple-touch-icon.png", rounded=False, subject=0.95)
    render(32, "icons/favicon-32.png", rounded=False, subject=0.95)
    # the vector master, handy for a store listing later
    open("icons/icon.svg", "w").write(build())
    print("icons generated")
