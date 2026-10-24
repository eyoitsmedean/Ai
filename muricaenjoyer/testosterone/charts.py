"""Chart images for the @Muricaenjoyer testosterone article kit.

Every number is from the cited source on each chart. Output: PNGs sized for X
(16:9 inline at 1600x900, header at 1500x600).
"""
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import FancyBboxPatch
import numpy as np
import textwrap

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

BG = "#0C1018"
PANEL = "#141A25"
FG = "#F3F5F8"
MUTED = "#8E98AA"
GRID = "#232B3A"
RED = "#E8443A"
BLUE = "#4D8DFF"
WHITE = "#FFFFFF"
HANDLE = "@Muricaenjoyer"

for f in font_manager.findSystemFonts():
    if "Inter" in f:
        font_manager.fontManager.addfont(f)
plt.rcParams.update({
    "font.family": "Inter",
    "text.color": FG,
    "axes.labelcolor": FG,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "axes.edgecolor": GRID,
    "figure.facecolor": BG,
    "axes.facecolor": BG,
    "savefig.facecolor": BG,
})

DISPLAY = "Inter Display"


def frame(title, subtitle, source, size=(16, 9)):
    fig = plt.figure(figsize=size, dpi=100)
    fig.text(0.055, 0.905, title, fontsize=40, fontweight="black",
             family=DISPLAY, color=FG, va="bottom")
    fig.text(0.055, 0.86, subtitle, fontsize=21, color=MUTED, va="top")
    source = "\n".join(textwrap.fill(part, 118) for part in source.split("\n"))
    fig.text(0.055, 0.035, source, fontsize=13.5, color=MUTED, va="bottom", linespacing=1.4)
    fig.text(0.945, 0.04, HANDLE, fontsize=17, fontweight="bold",
             color=FG, ha="right", va="bottom", alpha=0.9)
    # thin flag stripe on the left edge
    fig.patches.append(plt.Rectangle((0, 0), 0.012, 1, transform=fig.transFigure,
                                     color=RED, zorder=10))
    fig.patches.append(plt.Rectangle((0.012, 0), 0.006, 1, transform=fig.transFigure,
                                     color=WHITE, zorder=10))
    fig.patches.append(plt.Rectangle((0.018, 0), 0.006, 1, transform=fig.transFigure,
                                     color=BLUE, zorder=10))
    return fig


def style_axes(ax, ygrid=True):
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.spines["bottom"].set_color(GRID)
    ax.tick_params(axis="both", length=0, labelsize=17)
    if ygrid:
        ax.yaxis.grid(True, color=GRID, linewidth=1)
        ax.set_axisbelow(True)


# 1. NHANES young men decline (Lokeshwar et al. 2021)
def chart_decline():
    fig = frame("Young American men: ~25% less testosterone",
                "Mean total testosterone, U.S. men aged 15–39 (NHANES), ng/dL",
                "Source: Lokeshwar et al., European Urology Focus 2021 (NHANES 1999–2016, n=4,045). "
                "Lab assay methods changed between survey cycles.")
    ax = fig.add_axes([0.075, 0.17, 0.87, 0.60])
    cycles = ["1999–00", "2003–04", "2011–12", "2013–14", "2015–16"]
    vals = [605.39, 567.44, 424.96, 431.76, 451.22]
    colors = [BLUE, BLUE, RED, RED, RED]
    bars = ax.bar(cycles, vals, color=colors, width=0.62, zorder=3)
    for b, v in zip(bars, vals):
        ax.text(b.get_x() + b.get_width() / 2, v + 12, f"{v:.0f}", ha="center",
                va="bottom", fontsize=24, fontweight="bold", color=FG)
    ax.set_ylim(0, 700)
    ax.set_yticks([0, 200, 400, 600])
    style_axes(ax)
    ax.set_xlim(-0.5, 5.75)
    ax.plot([-0.5, 4.36], [300, 300], color=MUTED, linestyle=(0, (4, 4)), linewidth=1.5, zorder=4)
    ax.text(4.42, 300, "300 ng/dL\n\"low T\" line\n(AUA)", ha="left",
            va="center", fontsize=15, color=MUTED, linespacing=1.3)
    fig.savefig(OUT / "chart-1-young-men-decline.png")
    plt.close(fig)


# 2. Epic Research prescribing rebound
def chart_rebound():
    fig = frame("The testosterone comeback",
                "Share of U.S. men with a testosterone prescription, by year",
                "Source: Epic Research, July 29, 2026 (109M men, Jan 2012–Jun 2026). "
                "Only the four reported years are shown; 2026 covers January–June.")
    ax = fig.add_axes([0.075, 0.17, 0.87, 0.60])
    labels = ["2013 (old peak)", "2021 (low point)", "2025", "2026 (Jan–Jun)"]
    vals = [0.83, 0.64, 0.93, 0.95]
    colors = [MUTED, MUTED, RED, RED]
    bars = ax.bar(labels, vals, color=colors, width=0.58, zorder=3)
    for b, v in zip(bars, vals):
        ax.text(b.get_x() + b.get_width() / 2, v + 0.02, f"{v:.2f}%", ha="center",
                va="bottom", fontsize=26, fontweight="bold", color=FG)
    ax.set_ylim(0, 1.32)
    ax.set_yticks([0, 0.25, 0.5, 0.75, 1.0])
    ax.set_yticklabels(["0%", "0.25%", "0.5%", "0.75%", "1%"])
    style_axes(ax)
    ax.text(3.3, 1.30, "Every age group 30+ is now above its early-2010s peak",
            ha="right", va="top", fontsize=16, color=FG,
            bbox=dict(boxstyle="round,pad=0.5", fc=PANEL, ec=GRID))
    fig.savefig(OUT / "chart-2-prescribing-comeback.png")
    plt.close(fig)


# 3. TRAVERSE trial
def chart_traverse():
    fig = frame("TRT and your heart: what the big trial found",
                "TRAVERSE trial, 5,246 men aged 45–80 with low T and heart risk: % with each outcome",
                "Source: Lincoff et al., New England Journal of Medicine 2023 (TRAVERSE). "
                "Testosterone gel vs. placebo, mean follow-up 33 months.")
    ax = fig.add_axes([0.075, 0.17, 0.87, 0.58])
    outcomes = ["Heart attack, stroke\nor cardiac death", "Atrial fibrillation",
                "Acute kidney injury"]
    t = [7.0, 3.5, 2.3]
    p = [7.3, 2.4, 1.5]
    x = np.arange(len(outcomes))
    w = 0.34
    b1 = ax.bar(x - w / 2, t, w, color=RED, label="Testosterone", zorder=3)
    b2 = ax.bar(x + w / 2, p, w, color=MUTED, label="Placebo", zorder=3)
    for bars in (b1, b2):
        for b in bars:
            ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 0.12,
                    f"{b.get_height():.1f}%", ha="center", va="bottom",
                    fontsize=22, fontweight="bold", color=FG)
    ax.set_xticks(x)
    ax.set_xticklabels(outcomes, fontsize=18, color=FG)
    ax.set_ylim(0, 9)
    ax.set_yticks([0, 2, 4, 6, 8])
    ax.set_yticklabels([f"{v}%" for v in [0, 2, 4, 6, 8]])
    style_axes(ax)
    leg = ax.legend(loc="upper right", fontsize=17, frameon=False)
    for txt in leg.get_texts():
        txt.set_color(FG)
    fig.savefig(OUT / "chart-3-traverse-heart.png")
    plt.close(fig)


# 4. Steroid risk multipliers
def chart_steroid_risk():
    fig = frame("The steroid tax",
                "How much higher the risk is, compared with the group named in each row",
                "Sources: Windfeld-Mathiasen et al., JAMA 2024 and Circulation 2025 (Danish men sanctioned for steroid use vs. "
                "matched controls);\nVecchiato et al., European Heart Journal 2025 (20,286 male IFBB competitors).")
    ax = fig.add_axes([0.40, 0.17, 0.53, 0.58])
    rows = [
        ("Death, any cause\nsteroid users vs. non-users", 2.8),
        ("Heart attack\nsteroid users vs. non-users", 3.0),
        ("Heart failure\nsteroid users vs. non-users", 3.6),
        ("Sudden cardiac death\npro vs. amateur bodybuilders", 5.23),
    ]
    labels = [r[0] for r in rows][::-1]
    vals = [r[1] for r in rows][::-1]
    y = np.arange(len(rows))
    ax.barh(y, vals, color=RED, height=0.56, zorder=3)
    ax.axvline(1, color=FG, linewidth=1.5, zorder=4)
    ax.text(1.05, len(rows) - 0.42, "1× = same risk", fontsize=14.5, color=MUTED, va="bottom")
    for yi, v in zip(y, vals):
        ax.text(v + 0.1, yi, f"{v:.1f}×", va="center", fontsize=26,
                fontweight="bold", color=FG)
    ax.set_yticks(y)
    ax.set_yticklabels(labels, fontsize=17.5, color=FG, linespacing=1.35)
    ax.set_xlim(0, 6.3)
    ax.set_xticks([0, 1, 2, 3, 4, 5, 6])
    ax.set_xticklabels([f"{v}×" for v in range(7)])
    style_axes(ax, ygrid=False)
    ax.xaxis.grid(True, color=GRID, linewidth=1)
    ax.set_axisbelow(True)
    fig.savefig(OUT / "chart-4-steroid-tax.png")
    plt.close(fig)


# 5. Timeline
def chart_timeline():
    fig = frame("How America got testosterone-pilled in 12 weeks",
                "The Pentagon, the gym, and the comment section, July to October 2026",
                "Sources: war.gov, Defense Health Agency, ABC News, CNN, NPR, Fitness Volt, Daily Beast, IBTimes, "
                "Federal Register. All dates 2026.")
    ax = fig.add_axes([0.04, 0.12, 0.92, 0.68])
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")
    events = [
        ("JUL 15", "Hegseth posts\n\"The High-T\nDepartment of War\"", BLUE),
        ("SEP 2–3", "Military T guidance\nposted, then pulled\na day later", MUTED),
        ("SEP 17", "Reissued, men only:\nT is \"not a\nperformance enhancer\"", MUTED),
        ("SEP 30", "Quantico speech:\n\"testosterone\ntesting on top\"", BLUE),
        ("OCT 3", "Joey Swoll rushed\nto the hospital\nfor his heart", RED),
        ("OCT 5–7", "Hegseth workout\nclip goes viral:\n\"Low-T Pete\"", RED),
    ]
    n = len(events)
    xs = np.linspace(9, 91, n)
    ax.plot([3, 97], [62, 62], color=GRID, linewidth=4, zorder=1)
    ax.add_patch(FancyBboxPatch((9, 4), 82, 15, boxstyle="round,pad=0.6,rounding_size=1.5",
                                fc=PANEL, ec=GRID, lw=1.5, zorder=1))
    ax.text(12, 11.5, "NEXT: DEC 31", fontsize=21, fontweight="black", family=DISPLAY,
            color=RED, va="center")
    ax.text(30, 11.5, "The federal rule that lets apps prescribe testosterone\nwithout an in-person visit expires.",
            fontsize=16.5, color=FG, va="center", linespacing=1.35)
    for i, (x, (date, text, color)) in enumerate(zip(xs, events)):
        ax.scatter([x], [62], s=520, color=color, zorder=3, edgecolors=BG, linewidths=4)
        ax.text(x, 72, date, ha="center", va="bottom", fontsize=23,
                fontweight="black", family=DISPLAY, color=FG)
        ax.text(x, 53, text, ha="center", va="top", fontsize=16, color=FG,
                linespacing=1.4)
    fig.savefig(OUT / "chart-5-timeline.png")
    plt.close(fig)


# 6. Fertility
def chart_fertility():
    fig = frame("The side effect nobody puts in the ad",
                "Testosterone shuts down sperm production. Recovery after stopping takes months.",
                "Sources: WHO Task Force, The Lancet 1990 (271 healthy men, 200 mg testosterone enanthate weekly); "
                "Liu et al., The Lancet 2006 (1,549 men in 30 short-term studies; long-term users may recover more slowly).")
    ax1 = fig.add_axes([0.06, 0.16, 0.36, 0.58])
    ax1.axis("off")
    ax1.set_xlim(0, 10)
    ax1.set_ylim(0, 10)
    ax1.text(0.2, 7.2, "65%", fontsize=120, fontweight="black", family=DISPLAY,
             color=RED, va="center")
    ax1.text(0.3, 3.6, "of healthy men on weekly\ntestosterone injections had\nzero sperm within 6 months",
             fontsize=21, color=FG, va="center", linespacing=1.4)
    ax2 = fig.add_axes([0.52, 0.18, 0.43, 0.54])
    months = ["6 mo", "12 mo", "16 mo", "24 mo"]
    vals = [67, 90, 96, 100]
    bars = ax2.bar(months, vals, color=BLUE, width=0.6, zorder=3)
    for b, v in zip(bars, vals):
        ax2.text(b.get_x() + b.get_width() / 2, v + 2, f"{v}%", ha="center",
                 va="bottom", fontsize=22, fontweight="bold", color=FG)
    ax2.set_ylim(0, 118)
    ax2.set_yticks([0, 25, 50, 75, 100])
    ax2.set_yticklabels([f"{v}%" for v in [0, 25, 50, 75, 100]])
    style_axes(ax2)
    ax2.set_title("Share back to 20 million sperm/mL after stopping",
                  fontsize=17, color=MUTED, loc="left", pad=14)
    fig.savefig(OUT / "chart-6-fertility.png")
    plt.close(fig)


# Header 1500x600 (5:2)
def header():
    fig = plt.figure(figsize=(15, 6), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 150)
    ax.set_ylim(0, 60)
    ax.axis("off")
    # subtle grid like ECG paper
    for gx in range(0, 151, 5):
        ax.plot([gx, gx], [0, 60], color="#151C28", linewidth=1, zorder=0)
    for gy in range(0, 61, 5):
        ax.plot([0, 150], [gy, gy], color="#151C28", linewidth=1, zorder=0)
    # ECG trace that turns into a rising line
    xs = np.linspace(0, 150, 3000)
    base = 14 + np.where(xs > 95, (xs - 95) * 0.42, 0)
    ys = base.copy()
    for c in (22, 47, 72):
        ys += 15 * np.exp(-((xs - c) ** 2) / 0.35) - 5 * np.exp(-((xs - c - 1.6) ** 2) / 0.3)
        ys += 2.2 * np.exp(-((xs - c + 4) ** 2) / 2.5) + 3 * np.exp(-((xs - c + 7) ** 2) / 4)
    ax.plot(xs, ys, color=RED, linewidth=4.5, solid_capstyle="round", zorder=3)
    ax.plot(xs, ys, color=RED, linewidth=14, alpha=0.12, zorder=2)
    ax.text(5, 50, "HIGH-T", fontsize=96, fontweight="black", family=DISPLAY,
            color=FG, va="center")
    ax.text(5.6, 38.5, "NATION", fontsize=96, fontweight="black", family=DISPLAY,
            color=RED, va="center")
    ax.text(84, 52.5, "The Pentagon tests it.", fontsize=24, color=FG, va="center")
    ax.text(84, 46.5, "Apps sell it.", fontsize=24, color=FG, va="center")
    ax.text(84, 40.5, "The gym abuses it.", fontsize=24, color=FG, va="center")
    ax.text(84, 34.5, "Here's the truth.", fontsize=24, color=RED, va="center",
            fontweight="bold")
    ax.text(145, 3, HANDLE, fontsize=15, fontweight="bold", color=MUTED, ha="right")
    fig.savefig(OUT / "header-1500x600.png")
    plt.close(fig)


chart_decline()
chart_rebound()
chart_traverse()
chart_steroid_risk()
chart_timeline()
chart_fertility()
header()
print("ok")
