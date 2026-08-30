#!/usr/bin/env python3
from pathlib import Path
import re

html = Path("public/index.html").read_text()

# Fonts
html = html.replace(
    "family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600;700",
    "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400;1,8..60,500&family=Figtree:wght@400;500;600;700",
)
html = html.replace('content="#8B1A1A"', 'content="#F6F3EC"')
html = html.replace("--font-disp: 'Playfair Display', Georgia, serif;", "--font-disp: 'Fraunces', Georgia, serif;")
html = html.replace("--font-body: 'Lora', Georgia, serif;", "--font-body: 'Source Serif 4', Georgia, serif;")
html = html.replace("--font-ui:   'Inter', system-ui, sans-serif;", "--font-ui:   'Figtree', system-ui, sans-serif;")
html = html.replace("--bg:          #FAF6EF;", "--bg:          #F6F3EC;")
html = html.replace("--bg-2:        #F3EDE2;", "--bg-2:        #EFEBE3;")
html = html.replace("--surface:     #FFFFFF;", "--surface:     #FBF8F2;")
html = html.replace("--surface-2:   #FDF9F3;", "--surface-2:   #F3EFE6;")
html = html.replace("--border:      #E5D9C8;", "--border:      rgba(28,22,18,.10);")
html = html.replace("--border-2:    #D4C4B0;", "--border-2:    rgba(28,22,18,.16);")
html = html.replace("--crimson:     #8B1A1A;", "--crimson:     #8F1D1D;")
html = html.replace("--text-1:      #1A1208;", "--text-1:      #1C1612;")
html = html.replace("--text-2:      #4A3C2A;", "--text-2:      #4A433C;")
html = html.replace("--text-3:      #7A6A55;", "--text-3:      #6A6258;")
html = html.replace("--text-4:      #A09080;", "--text-4:      #9A9288;")
html = html.replace("--r:      16px;", "--r:      14px;")
html = html.replace("--nav-h:    68px;", "--nav-h:    64px;")
html = html.replace("--header-h: 58px;", "--header-h: 56px;")

atelier = Path("scripts/atelier-snippet.css").read_text()
if "THE QUIET PAGE" not in html:
    html = html.replace("</style>", atelier + "\n</style>")

# Onboarding
old_ob_start = html.find('<div id="onboarding" class="onboarding">')
old_ob_end = html.find('<div class="intent-grid" id="intent-grid">')
if old_ob_start != -1 and old_ob_end != -1:
    new_ob = """<div id="onboarding" class="onboarding">
  <div class="ob-mark">R</div>
  <p class="ob-eyebrow">The red letters</p>
  <h1 class="ob-title">A quiet page<br>for His words</h1>
  <p class="ob-sub">Guidance, encouragement, and a daily sentence drawn only from what Jesus said.</p>
  <blockquote class="ob-quote">“Come unto me, all ye that labour and are heavy laden, and I will give you rest.”<cite>Matthew 11:28</cite></blockquote>
  <p class="ob-note" style="margin-bottom:10px">What brings you here?</p>
  """
    html = html[:old_ob_start] + new_ob + html[old_ob_end:]

html = html.replace('<span class="header-cross">✝</span>', '<span class="header-mark" aria-hidden="true">R</span>')
html = html.replace('<div class="header-name">Red Letter Advisor</div>', '<div class="header-name">Red Letter</div>')
html = html.replace(
    '<div class="streak-badge" id="streak-badge">🔥 <span id="streak-num">1</span></div>',
    '<div class="streak-badge" id="streak-badge"><span id="streak-num">1</span></div>',
)

# Theme icons → initials
initials = {
    "Anxiety & Worry": "A",
    "Grief & Loss": "G",
    "Forgiveness": "F",
    "Loneliness": "L",
    "Conflict & Relationships": "C",
    "Fear": "F",
    "Purpose & Direction": "P",
    "Faith & Doubt": "F",
    "Suffering & Pain": "S",
    "Shame & Guilt": "S",
    "Peace": "P",
    "Hope": "H",
}


def repl_icon(m):
    theme = m.group(1)
    initial = initials.get(theme, theme[:1])
    return f'<button class="theme-card" data-theme="{theme}" onclick="loadEnc(\'{theme}\')"><span class="theme-initial" aria-hidden="true">{initial}</span>'


html, n = re.subn(
    r'<button class="theme-card" data-theme="([^"]+)" onclick="loadEnc\(\'[^\']+\'\)"><span class="theme-icon">[^<]*</span>',
    repl_icon,
    html,
)
print("theme cards", n)

# Sit button
needle = """              <button class=\"action-btn-dark\" onclick=\"openShareCard('word')\">
                <svg viewBox=\"0 0 24 24\"><path d=\"M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13\"/></svg>
                Share
              </button>"""
if needle in html and "openSit()" not in html:
    html = html.replace(
        needle,
        needle + '\n              <button class="action-btn-dark" type="button" onclick="openSit()">Sit with this</button>',
    )
    print("sit button")

if 'id="sit-overlay"' not in html:
    sit = """
<div class="sit-overlay" id="sit-overlay">
  <button type="button" class="sit-close" onclick="closeSit()">Close</button>
  <p class="sit-quote" id="sit-quote"></p>
  <p class="sit-ref" id="sit-ref"></p>
  <div class="sit-breath" aria-hidden="true"></div>
  <p class="sit-hint">Stay with the sentence. Nothing else is required.</p>
</div>
"""
    html = html.replace('<div class="toast" id="toast"></div>', sit + '\n<div class="toast" id="toast"></div>')
    print("sit overlay")

html = html.replace(
    "document.getElementById('today-streak-label').textContent = count > 1 ? '🔥 ' + count + '-day streak' : '';",
    "document.getElementById('today-streak-label').textContent = count > 1 ? count + ' days of quiet' : '';",
)

html = html.replace("Today's <em>Light</em>", "Today’s <em>light</em>")
html = html.replace("Words of <em>Encouragement</em>", "Words of <em>comfort</em>")
html = html.replace("The <em>Advisor</em>", "Ask <em>Him</em>")
html = html.replace("My <em>Journal</em>", "Commonplace")
html = html.replace("✦ For You Today", "For this day")

sit_js = """
function openSit() {
  const q = (dailyData && dailyData.word && dailyData.word.passage) || '';
  const v = (dailyData && dailyData.word && dailyData.word.verse) || '';
  if (!q) return;
  document.getElementById('sit-quote').textContent = '“' + q + '”';
  document.getElementById('sit-ref').textContent = v;
  document.getElementById('sit-overlay').classList.add('on');
}
function closeSit() {
  document.getElementById('sit-overlay').classList.remove('on');
}
"""
if "function openSit" not in html:
    idx = html.rfind("</script>")
    html = html[:idx] + sit_js + html[idx:]
    print("sit js")

Path("public/index.html").write_text(html)
print("wrote", len(html))
