"""
Gera todos os assets da Landing Page a partir dos originais da pasta Quezada/.

Uso (da pasta Quezada/Landing Page):
    python scripts/build-assets.py

Requer: pip install pillow imageio-ffmpeg
Saída: assets/img/*.webp, assets/fonts/*.woff2, assets/video/*.mp4
Todas as imagens saem em WEBP.
"""
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]          # .../Landing Page
Q = ROOT.parent                                      # .../Quezada
SITE = Q / "site" / "assets"
BANCO = Q / "Banco de trafego"
OUT_IMG = ROOT / "assets" / "img"
OUT_FONT = ROOT / "assets" / "fonts"
OUT_VID = ROOT / "assets" / "video"
for d in (OUT_IMG, OUT_FONT, OUT_VID):
    d.mkdir(parents=True, exist_ok=True)


def save(im, name, q=82):
    path = OUT_IMG / name
    im.save(path, "WEBP", quality=q, method=6)
    print(f"  {name:32} {im.size[0]}x{im.size[1]}  {path.stat().st_size / 1024:6.1f} KB")


def fit_w(im, w):
    if im.width <= w:
        return im.copy()
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def crop_ratio(im, ratio):
    """Recorta ao centro para a proporção largura/altura pedida."""
    w, h = im.size
    if w / h > ratio:
        nw = round(h * ratio)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w / ratio)
    y = (h - nh) // 2
    return im.crop((0, y, w, y + nh))


def row_segments(alpha, min_gap=12):
    """Faixas horizontais com conteúdo (para separar símbolo, palavra e assinatura do logo)."""
    w, h = alpha.size
    px = alpha.load()
    rows = [any(px[x, y] > 16 for x in range(0, w, 3)) for y in range(h)]
    segs, start, gap = [], None, 0
    for y, filled in enumerate(rows):
        if filled:
            if start is None:
                start = y
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                segs.append((start, y - gap + 1))
                start, gap = None, 0
    if start is not None:
        segs.append((start, h))
    return segs


print("Hero")
hero = Image.open(BANCO / "Imagens do Angelson para criativos" / "Imagem que pode ser usada na hero da lp.png").convert("RGB")
save(fit_w(hero, 1200), "hero-angelson.webp", 80)
save(fit_w(hero, 720), "hero-angelson-sm.webp", 78)

print("Popup do Raio-X (Angelson, mão na cabeça)")
mao = Image.open(BANCO / "Imagens do Angelson para criativos" / "Mao na cabeça.jpeg").convert("RGB")  # 1792x2400
save(mao.crop((300, 120, 1500, 1620)).resize((640, 800), Image.LANCZOS), "popup-angelson.webp", 80)      # retrato 4:5 (desktop)
save(mao.crop((330, 420, 1630, 1270)).resize((720, 471), Image.LANCZOS), "popup-angelson-sm.webp", 78)   # faixa (celular)

print("Sala antes/depois (mesmo enquadramento, recortado na mesa)")
# As duas imagens têm o mesmo enquadramento. A bagunça fica em volta da mesa (lado direito),
# então o recorte foca ali — senão a régua no meio mostra só parede vazia dos dois lados.
BOX = (0.40, 0.22, 1.0, 0.98)  # x0, y0, x1, y1 normalizados


def mesa(src):
    im = crop_ratio(Image.open(SITE / "img" / src).convert("RGB"), 16 / 9).resize((1600, 900), Image.LANCZOS)
    return im.crop((round(BOX[0] * 1600), round(BOX[1] * 900), round(BOX[2] * 1600), round(BOX[3] * 900)))


antes, depois = mesa("sala-bagunca.webp"), mesa("sala-organizada.webp")
for w, suf in ((960, ""), (640, "-sm")):
    save(fit_w(antes, w), f"sala-antes{suf}.webp", 80)
    save(fit_w(depois, w), f"sala-depois{suf}.webp", 80)

print("Dupla")
duo = Image.open(SITE / "img" / "duo-base.webp").convert("RGB")
save(fit_w(duo, 1600), "duo.webp", 80)
save(fit_w(crop_ratio(duo, 4 / 3), 900), "duo-sm.webp", 78)

print("Livros")
for src, name in (("capa-arquitetura.webp", "livro-arquitetura.webp"), ("capa-pensamento.webp", "livro-pensamento.webp")):
    im = Image.open(SITE / "img" / src).convert("RGBA")
    im = im.crop(im.getbbox())
    save(im.resize((round(im.width * 420 / im.height), 420), Image.LANCZOS), name, 84)

print("Logo")
for variant, src in (("ouro", "Colorido.png"), ("branco", "Branco.png")):
    logo = Image.open(Q / "Logo" / "PNG" / src).convert("RGBA")
    logo = logo.crop(logo.getbbox())
    segs = row_segments(logo.getchannel("A"))
    # esperado: [símbolo, palavra QUEZADA, assinatura]
    simbolo = logo.crop((0, segs[0][0], logo.width, segs[0][1]))
    simbolo = simbolo.crop(simbolo.getbbox())
    palavra = logo.crop((0, segs[1][0], logo.width, segs[1][1]))
    palavra = palavra.crop(palavra.getbbox())
    save(simbolo.resize((round(simbolo.width * 200 / simbolo.height), 200), Image.LANCZOS), f"simbolo-{variant}.webp", 90)
    save(palavra.resize((round(palavra.width * 60 / palavra.height), 60), Image.LANCZOS), f"palavra-{variant}.webp", 90)
    save(fit_w(logo, 520), f"lockup-{variant}.webp", 90)
    if variant == "ouro":
        big = simbolo.resize((round(simbolo.width * 900 / simbolo.height), 900), Image.LANCZOS)
        save(big, "selo-q.webp", 80)
        # favicon quadrado
        s = simbolo.copy()
        side = max(s.size)
        sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        sq.paste(s, ((side - s.width) // 2, (side - s.height) // 2), s)
        save(sq.resize((192, 192), Image.LANCZOS), "favicon-192.webp", 90)
        save(sq.resize((48, 48), Image.LANCZOS), "favicon-48.webp", 90)
        fav_symbol = sq

print("Imagem de compartilhamento (og)")
og = Image.new("RGB", (1200, 630), (12, 11, 12))
h_im = hero.resize((630, 630), Image.LANCZOS)
og.paste(h_im, (570, 0))
grad = Image.new("L", (630, 1))
for x in range(630):
    grad.putpixel((x, 0), max(0, 255 - int(x * 255 / 260)))
grad = grad.resize((630, 630))
og.paste(Image.new("RGB", (630, 630), (12, 11, 12)), (570, 0), grad)
draw = ImageDraw.Draw(og)
font_path = SITE / "fonts" / "raleway.semibold.ttf"
f_big = ImageFont.truetype(str(font_path), 50)
f_small = ImageFont.truetype(str(font_path), 20)
mark = fav_symbol.resize((84, 84), Image.LANCZOS)
og.paste(mark, (70, 70), mark)
y = 210
for line in ("Cresça com a empresa", "organizada e as costas", "protegidas."):
    draw.text((70, y), line, font=f_big, fill=(250, 250, 247) if line != "protegidas." else (210, 185, 144))
    y += 64
draw.text((70, 470), "GESTÃO E JURÍDICO NO MESMO TIME", font=f_small, fill=(210, 185, 144))
draw.text((70, 505), "QUEZADA · 100% ONLINE PARA TODO O BRASIL", font=f_small, fill=(170, 168, 160))
save(og, "og-quezada.webp", 84)

print("Fontes")
for f in ("cormorant-garamond.woff2", "raleway.woff2"):
    shutil.copy2(SITE / "fonts" / f, OUT_FONT / f)
    print(f"  {f}")

print("Vídeo (compressão + poster)")
import imageio_ffmpeg  # noqa: E402

ff = imageio_ffmpeg.get_ffmpeg_exe()
src_vid = BANCO / "feitos para quezada" / "CAIXINHA - Como voces ajudam-Metodo de atuacao-Quente - Legendado.mp4"
out_vid = OUT_VID / "como-ajudamos.mp4"
subprocess.run([ff, "-y", "-loglevel", "error", "-i", str(src_vid),
                "-vf", "scale=720:-2", "-c:v", "libx264", "-preset", "slow", "-crf", "26",
                "-profile:v", "main", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                "-c:a", "aac", "-b:a", "96k", str(out_vid)], check=True)
print(f"  como-ajudamos.mp4  {out_vid.stat().st_size / 1024 / 1024:.2f} MB")
tmp = OUT_VID / "_poster.png"
subprocess.run([ff, "-y", "-loglevel", "error", "-ss", "2.2", "-i", str(src_vid), "-frames:v", "1", str(tmp)], check=True)
save(fit_w(Image.open(tmp).convert("RGB"), 540), "video-poster.webp", 80)
tmp.unlink()
print("Pronto.")
