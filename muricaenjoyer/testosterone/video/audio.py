import json, sys, wave
import numpy as np
SR = 48000; T = 52.5
n = int(SR * T); t = np.arange(n) / SR
mix = np.zeros(n)
beats = json.load(open(sys.argv[1]))

def add(sig, at, gain):
    i = int(at * SR); j = min(n, i + len(sig))
    if i < n: mix[i:j] += gain * sig[: j - i]

def thump(freq, dur, decay):
    tt = np.arange(int(SR * dur)) / SR
    env = np.exp(-tt * decay) * (1 - np.exp(-tt * 400))
    sweep = freq * (1 + 0.6 * np.exp(-tt * 30))          # slight pitch drop = body
    return env * np.sin(2 * np.pi * np.cumsum(sweep) / SR)

def tick(freq=1800, dur=0.05):
    tt = np.arange(int(SR * dur)) / SR
    return np.exp(-tt * 90) * np.sin(2 * np.pi * freq * tt)

lub, dub = thump(58, 0.28, 18), thump(72, 0.22, 22)
for b in beats:
    add(lub, b - 0.02, 0.85)
    add(dub, b + 0.14, 0.55)

# quiet low pad, ducked to silence during the flatline (36.8-38.7)
pad = 0.06 * (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 82.5 * t)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.18 * t))
duck = np.ones(n)
for a, b_, lo in [(36.3, 36.8, 0.0)]:
    pass
duck = np.interp(t, [0, 0.4, 36.3, 36.8, 38.7, 39.4, T - 1.2, T], [0, 1, 1, 0, 0, 1, 1, 0])
mix += pad * duck

# ticks on reveals
for at in [12.2, 17.7, 23.0, 27.9, 31.6, 36.3, 40.7, 41.65, 42.6, 43.55]:
    add(tick(), at, 0.22)
# resolve under the closing title
add(thump(42, 0.9, 4.5), 48.9, 0.9)

mix = mix / np.max(np.abs(mix)) * 0.85
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[2], "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("audio ok", len(beats), "beats")
