import sys
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
import numpy as np

out = Path(sys.argv[1])
for f in font_manager.findSystemFonts():
    if "Inter" in f:
        font_manager.fontManager.addfont(f)
BG, FG, MUTED, RED, BLUE = "#0C1018", "#F3F5F8", "#8E98AA", "#E8443A", "#4D8DFF"
plt.rcParams.update({"font.family": "Inter", "figure.facecolor": BG, "savefig.facecolor": BG})

fig = plt.figure(figsize=(15, 6), dpi=100)
ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 150); ax.set_ylim(0, 60); ax.axis("off")
for gx in range(0, 151, 5):
    ax.plot([gx, gx], [0, 60], color="#151C28", lw=1, zorder=0)
for gy in range(0, 61, 5):
    ax.plot([0, 150], [gy, gy], color="#151C28", lw=1, zorder=0)
# flag stripe
for i, c in enumerate([RED, FG, BLUE]):
    ax.add_patch(plt.Rectangle((i * 0.8, 0), 0.8, 60, color=c, zorder=5))
xs = np.linspace(0, 150, 3000)
ys = 11 + np.where(xs > 100, (xs - 100) * 0.30, 0)
for c in (30, 55, 80):
    ys += 11 * np.exp(-((xs - c) ** 2) / 0.35) - 4 * np.exp(-((xs - c - 1.6) ** 2) / 0.3)
    ys += 1.8 * np.exp(-((xs - c + 4) ** 2) / 2.5) + 2.2 * np.exp(-((xs - c + 7) ** 2) / 4)
ax.plot(xs, ys, color=RED, lw=4, solid_capstyle="round", zorder=3)
ax.plot(xs, ys, color=RED, lw=13, alpha=0.12, zorder=2)
ax.text(6, 49, "TESTOSTERONE", fontsize=84, fontweight="black", family="Inter Display", color=FG, va="center")
ax.text(6.4, 36, "ISN'T A PERSONALITY", fontsize=58, fontweight="black", family="Inter Display", color=RED, va="center")
ax.text(6.6, 26.5, "The Pentagon tests it. Apps sell it. The gym abuses it.", fontsize=21, color=MUTED, va="center")
ax.text(145, 3, "@Muricaenjoyer", fontsize=15, fontweight="bold", color=MUTED, ha="right")
fig.savefig(out / "header-personality-1500x600.png")
print("ok")
