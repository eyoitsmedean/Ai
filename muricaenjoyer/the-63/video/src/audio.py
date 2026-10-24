# Original synthesized audio (numpy only, no samples). usage: audio.py beats.json out.wav total
import json, sys, wave
import numpy as np
SR = 48000; T = float(sys.argv[3])
n = int(SR * (T + 0.1)); mix = np.zeros(n)
cues = json.load(open(sys.argv[1]))
rng = np.random.default_rng(63)

def add(sig, at, gain):
    i = int(round(at * SR))
    if i < 0: sig = sig[-i:]; i = 0
    j = min(n, i + len(sig))
    if i < n: mix[i:j] += gain * sig[: j - i]

def tt(d): return np.arange(int(SR * d)) / SR

def tick(freq):
    t = tt(0.045)
    return np.exp(-t * 110) * np.sin(2 * np.pi * freq * t) * (1 - np.exp(-t * 3000))

def thump(freq, dur, decay):
    t = tt(dur)
    env = np.exp(-t * decay) * (1 - np.exp(-t * 600))
    f = freq * (1 + 0.8 * np.exp(-t * 35))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR)
    click = rng.standard_normal(len(t)) * np.exp(-t * 180) * 0.25
    return env * body + click

def whoosh(dur=0.55):
    t = tt(dur); x = rng.standard_normal(len(t))
    cut = 250 * (5000 / 250) ** (t / dur)            # rising cutoff
    a = np.exp(-2 * np.pi * cut / SR); y = np.zeros_like(x); s = 0.0
    for k in range(len(x)):
        s = (1 - a[k]) * x[k] + a[k] * s; y[k] = s
    env = (t / dur) ** 2.2 * (1 - np.exp(-(dur - t) * 60))
    y = y / (np.max(np.abs(y)) + 1e-9)
    return y * env

def brass(freq, dur, att=0.03, decay=1.4):
    t = tt(dur)
    env = (1 - np.exp(-t / att)) * np.exp(-t * decay) * (1 - np.exp(-(dur - t) * 40))
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t)
    ph = 2 * np.pi * np.cumsum(freq * vib) / SR
    sig = sum((1.0 / h) * np.sin(h * ph) for h in range(1, 7))
    return env * sig / 2.2

tick_f = {"D": 1300, "C": 1500, "B": 1700, "A": 1950}
k = 0
for c in cues:
    t0 = c["t"]
    if c["k"] == "tick":
        add(tick(tick_f[c["tier"]] * (1 + 0.04 * (k % 3))), t0, 0.16); k += 1
    elif c["k"] == "spicy":
        add(brass(311.1, 0.16, 0.01, 6), t0, 0.16); add(brass(233.1, 0.28, 0.01, 5), t0 + 0.13, 0.16)
    elif c["k"] in ("reveal", "fanfare"):
        add(whoosh(0.55), t0 - 0.55, 0.16)
        add(thump(52, 0.7, 7), t0, 0.75)
        if c["k"] == "fanfare":
            add(brass(392.0, 0.13, 0.008, 4), t0 + 0.02, 0.22)
            add(brass(392.0, 0.13, 0.008, 4), t0 + 0.17, 0.22)
            for f, d in [(261.6, 0), (329.6, 0.015), (392.0, 0.03), (523.3, 0.045)]:
                add(brass(f, 2.6, 0.03, 1.1), t0 + 0.33 + d, 0.2)
            add(thump(44, 1.0, 4), t0 + 0.33, 0.5)
    elif c["k"] == "end":
        add(thump(46, 0.9, 5), t0, 0.45)
        for f in (196.0, 261.6, 329.6):
            add(brass(f, 2.0, 0.08, 1.6), t0, 0.07)
add(thump(50, 0.6, 7), 0.0, 0.5)   # soft hit under the hook

mix = mix[: int(SR * T)]
fade = np.ones(len(mix)); m = int(SR * 0.6); fade[-m:] = np.linspace(1, 0, m); mix *= fade
mix = mix / np.max(np.abs(mix)) * 0.55
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[2], "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("audio ok", len(cues), "cues", len(mix) / SR, "s")
