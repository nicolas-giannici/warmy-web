#!/usr/bin/env python3
"""Produce los recortes prolijos de las fotos de Warmy.

Lee las fotos originales de public/fotos/ y escribe en public/fotos/recorte/:
  - recorte/<slug>.webp        pieza recortada con fondo transparente (alpha)
  - recorte/enmarcado-<slug>.webp  foto de "puesta" con marco blanco (opaca)

Necesita: macOS (Vision, vía warmycut.swift) + Pillow para escribir WebP.
Correr:  python3 tools/fotos/prolijar.py
"""
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FOTOS = ROOT / "public" / "fotos"
OUT = FOTOS / "recorte"
BUILD = Path(__file__).resolve().parent / ".build"
BIN = BUILD / "warmycut"
TMP = BUILD / "tmp"

W, H = 700, 875   # tamaño de diseño; el archivo sale a ESCALA x

# slug: crop opcional en píxeles de la foto original (x,y,w,h desde arriba-izq)
ESCALA = 1.5      # 1.5x para pantallas retina sin inflar el peso

RECORTES = {
    "conejita-lila": None,
    "almohadon-corazon": (20, 240, 320, 300),   # solo el almohadón, no la silla
    "muneca-a-pedido": None,
    "muneca-a-pedido-2": None,
    "muneca-trenzas": None,
    "unicornio-arcoiris": None,
    "botitas": None,
    "princesas/tiana": None,
    "princesas/moana": None,
    "princesas/merida": None,
    "princesas/rapunzel": None,
    "princesas/jasmine": None,
    "princesas/anna": None,
    "princesas/ariel": None,
    "princesas/ariel-2": None,
    "princesas/malefica": None,
}

# fotos que se enmarcan enteras en vez de recortarse: la pieza "puesta" (manos, piernas)
# y las tomas donde el fondo está pegado a la pieza (sombra del árbol, pasto sobre el vestido)
ENMARCADOS = ["mitones", "polainas", "princesas/rapunzel", "princesas/cenicienta"]


def src(slug: str) -> Path:
    for ext in (".webp", ".jpg", ".png"):
        p = FOTOS / f"{slug}{ext}"
        if p.exists():
            return p
    raise SystemExit(f"no encuentro la foto de {slug}")


def to_webp(png: Path, dst: Path) -> None:
    im = Image.open(png)
    im = im.resize((int(W * ESCALA), int(H * ESCALA)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=82, method=6)


def run(args: list[str]) -> None:
    subprocess.run([str(BIN), *args], check=True, capture_output=True)


def build() -> None:
    """Compila warmycut.swift si hace falta (necesita Xcode Command Line Tools)."""
    swift = Path(__file__).resolve().parent / "warmycut.swift"
    if BIN.exists() and BIN.stat().st_mtime > swift.stat().st_mtime:
        return
    BUILD.mkdir(parents=True, exist_ok=True)
    subprocess.run(["swiftc", "-O", str(swift), "-o", str(BIN)], check=True)


def main() -> None:
    build()
    OUT.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)

    for slug, crop in RECORTES.items():
        name = slug.replace("/", "-")
        png = TMP / f"{name}.png"
        args = [str(src(slug)), str(png), "--mode", "cutout", "--bg", "none",
                "--w", str(W), "--h", str(H), "--pad", "0.07", "--erode", "2"]
        if crop:
            args += ["--crop", ",".join(str(v) for v in crop)]
        run(args)
        dst = OUT / f"{name}.webp"
        to_webp(png, dst)
        print(f"{dst.relative_to(ROOT)}  {dst.stat().st_size // 1024} KB")

    for slug in ENMARCADOS:
        name = slug.replace("/", "-")
        png = TMP / f"enmarcado-{name}.png"
        run([str(src(slug)), str(png), "--mode", "frame", "--bg", "ffffff",
             "--w", str(W), "--h", str(H), "--pad", "0.045", "--radius", "26"])
        dst = OUT / f"enmarcado-{name}.webp"
        to_webp(png, dst)
        print(f"{dst.relative_to(ROOT)}  {dst.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
