import json, sys, pathlib
here = pathlib.Path(__file__).resolve().parent
data = json.load(open(here.parent / 'parks.json'))
tpl = (here / 'the-63.tpl.html').read_text()
js = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
assert tpl.count('__DATA__') == 1
out = tpl.replace('__DATA__', js)
(here.parent / 'the-63.html').write_text(out)
print('wrote', len(out), 'bytes')
