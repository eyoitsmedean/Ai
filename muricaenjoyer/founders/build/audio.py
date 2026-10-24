# Original synthesized "message pop" track for The Founders' Group Chat. No samples.
import json, sys, wave
import numpy as np
SR = 48000
cues = json.load(open(sys.argv[1]))
total = next(c["total"] for c in cues if c["kind"] == "end")
n = int(SR * total); mix = np.zeros(n)

def add(sig, at, gain):
    i = int(at * SR); j = min(n, i + len(sig))
    if 0 <= i < n: mix[i:j] += gain * sig[: j - i]

def blip(f0, f1, dur, decay, glide=0.05, harm=0.25):
    tt = np.arange(int(SR * dur)) / SR
    f = f1 + (f0 - f1) * np.exp(-tt / glide)          # quick pitch glide f0 -> f1
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = (1 - np.exp(-tt * 900)) * np.exp(-tt * decay)
    return env * (np.sin(ph) + harm * np.sin(2 * ph))

pop_in = blip(470, 700, 0.16, 38) + 0.55 * np.pad(blip(700, 820, 0.12, 50), (int(SR * 0.045), 0))[: int(SR * 0.16)]
pop_out = blip(560, 1050, 0.14, 42, glide=0.03, harm=0.15)
pop_soft = blip(420, 640, 0.20, 26, harm=0.1)
tick = blip(300, 360, 0.12, 60, harm=0.0)

def chord(freqs, dur, attack, decay):
    tt = np.arange(int(SR * dur)) / SR
    env = (1 - np.exp(-tt / attack)) * np.exp(-tt * decay)
    return env * sum(np.sin(2 * np.pi * f * tt) * (0.7 ** k) for k, f in enumerate(freqs))

add(pop_in, 0.08, 0.20)                                 # opening notification: the thumbnail chat "arrives"
for c in cues:
    k = c["kind"]
    if k == "in": add(pop_in, c["t"], 0.20)
    elif k == "out": add(pop_soft if c.get("final") else pop_out, c["t"], 0.13 if c.get("final") else 0.18)
    elif k == "sys": add(tick, c["t"], 0.10)
    elif k == "end": add(chord([220.0, 329.63, 440.0], 4.2, 0.35, 0.9), c["t"] + 0.3, 0.07)

peak = np.max(np.abs(mix)); mix = mix / peak * 0.42 if peak > 0 else mix
fade = int(SR * 0.4); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
st = np.repeat(pcm[:, None], 2, axis=1)
with wave.open(sys.argv[2], "w") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print("audio ok", len(cues), "cues", round(total, 2), "s")
