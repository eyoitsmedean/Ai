# One-off: makes the small woff2 subsets in src/fonts that build.js inlines.
# Needs fonttools + brotli:  pip install --target /some/dir fonttools brotli
#   PYTHONPATH=/some/dir python3 tools/subset-fonts.py
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', '..', 'forty-days', 'fonts')
OUT = os.path.join(HERE, '..', 'src', 'fonts')
UNICODES = list(range(0x20, 0x7F)) + [0xA0, 0xA9, 0xB7, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2013, 0x2014, 0x2022, 0x2190, 0x2192, 0x2713, 0x00D7]

def run(src, out, axes=None):
    f = TTFont(os.path.join(SRC, src), lazy=False)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'onum', 'lnum', 'pnum', 'tnum']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    s = subset.Subsetter(opts)
    s.populate(unicodes=UNICODES)
    s.subset(f)
    if axes:
        f = instancer.instantiateVariableFont(f, axes)
    f.flavor = 'woff2'
    f.save(os.path.join(OUT, out))
    print(out, os.path.getsize(os.path.join(OUT, out)))

run('IMFeENrm28P.ttf', 'fell-roman.woff2')
run('IMFeENit28P.ttf', 'fell-italic.woff2')
run('Literata[opsz,wght].ttf', 'literata.woff2', {'opsz': 14, 'wght': (400, 700)})
run('Literata-Italic[opsz,wght].ttf', 'literata-italic.woff2', {'opsz': 14, 'wght': (400, 600)})
