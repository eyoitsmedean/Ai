/* Museum-quality Red Letter share cards — Void / Dawn / Manuscript */
(function (global) {
  const W = 1080;
  const H = 1350;

  function wrapText(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function paintGrain(ctx, alpha) {
    const image = ctx.createImageData(W, H);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() * 255) | 0;
      data[i] = n;
      data[i + 1] = n;
      data[i + 2] = n;
      data[i + 3] = alpha;
    }
    ctx.putImageData(image, 0, 0);
  }

  function paintBackground(ctx, style) {
    if (style === 'dawn') {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#F7E8D4');
      g.addColorStop(0.42, '#F0D5B8');
      g.addColorStop(1, '#C45A3A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      paintGrain(ctx, 18);
      return { quote: '#2A1208', brand: 'rgba(42,18,8,0.5)', cite: '#8B1212', frame: 'rgba(42,18,8,0.2)', rule: 'rgba(139,18,18,0.35)' };
    }
    if (style === 'manuscript') {
      ctx.fillStyle = '#EDE6D8';
      ctx.fillRect(0, 0, W, H);
      paintGrain(ctx, 22);
      return { quote: '#C41E1E', brand: 'rgba(26,22,18,0.45)', cite: '#1A1612', frame: 'rgba(26,22,18,0.16)', rule: 'rgba(26,22,18,0.18)' };
    }
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#1A0A0A');
    g.addColorStop(0.45, '#3B0C0C');
    g.addColorStop(1, '#0E0C0B');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const bloom = ctx.createRadialGradient(W * 0.5, H * 0.28, 20, W * 0.5, H * 0.35, H * 0.55);
    bloom.addColorStop(0, 'rgba(196,30,30,0.48)');
    bloom.addColorStop(1, 'rgba(196,30,30,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);
    paintGrain(ctx, 28);
    return { quote: '#FFF5F0', brand: 'rgba(255,255,255,0.58)', cite: 'rgba(255,180,170,0.92)', frame: 'rgba(255,255,255,0.16)', rule: 'rgba(255,180,170,0.35)' };
  }

  function drawCard({ quote, verse, theme, brand = 'Red Letter', style = 'void' }) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const colors = paintBackground(ctx, style);
    const cleanVerse = String(verse || '').replace(/^[—–\-\s]+/, '').trim();

    ctx.strokeStyle = colors.frame;
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, W - 112, H - 112);

    ctx.fillStyle = colors.brand;
    ctx.font = '600 22px Fraunces, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.22em';
    ctx.fillText('RED LETTER', W / 2, 128);

    ctx.strokeStyle = colors.rule;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 28, 152);
    ctx.lineTo(W / 2 + 28, 152);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2, 144);
    ctx.lineTo(W / 2, 160);
    ctx.stroke();

    if (theme) {
      ctx.fillStyle = colors.cite;
      ctx.font = '600 20px Figtree, system-ui, sans-serif';
      ctx.letterSpacing = '0.16em';
      ctx.fillText(String(theme).toUpperCase(), W / 2, 198);
    }

    const raw = String(quote || '').replace(/^["“]|["”]$/g, '');
    const q = `“${raw}”`;
    ctx.fillStyle = colors.quote;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0';
    let size = q.length > 200 ? 40 : q.length > 120 ? 48 : 58;
    ctx.font = `italic 500 ${size}px Literata, Georgia, serif`;
    let lines = wrapText(ctx, q, W - 200);
    while (lines.length > 11 && size > 34) {
      size -= 3;
      ctx.font = `italic 500 ${size}px Literata, Georgia, serif`;
      lines = wrapText(ctx, q, W - 200);
    }
    const lineH = size * 1.32;
    let y = H * 0.44 - (lines.length * lineH) / 2;
    lines.forEach((ln) => {
      ctx.fillText(ln, W / 2, y);
      y += lineH;
    });

    ctx.fillStyle = colors.cite;
    ctx.font = '600 26px Figtree, system-ui, sans-serif';
    ctx.letterSpacing = '0.08em';
    ctx.fillText(cleanVerse ? cleanVerse.toUpperCase() : '', W / 2, Math.min(y + 72, H - 220));

    ctx.fillStyle = colors.brand;
    ctx.font = '500 20px Figtree, system-ui, sans-serif';
    ctx.letterSpacing = '0.04em';
    ctx.fillText(brand, W / 2, H - 110);
    ctx.font = '400 17px Figtree, system-ui, sans-serif';
    ctx.fillText('Only the words He spoke', W / 2, H - 74);

    return canvas;
  }

  async function canvasToFile(canvas, name = 'red-letter.png') {
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) throw new Error('Canvas export unavailable');
    return new File([blob], name, { type: 'image/png' });
  }

  // navigator.share() needs transient activation, which is a short timer
  // started by the tap. Rendering happens when the picker opens so the tap
  // itself has (almost) nothing to await.
  const prepared = new Map();
  const STYLES = ['void', 'dawn', 'manuscript'];

  function cacheKey(opts) {
    return JSON.stringify([opts.style || 'void', opts.quote || '', opts.verse || '', opts.theme || '', opts.brand || 'Red Letter']);
  }

  async function renderFile(opts) {
    try {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 400)),
        ]);
      }
    } catch (_) { /* ignore */ }
    return canvasToFile(drawCard(opts));
  }

  function prewarm(base) {
    if (!base || !base.quote) return;
    STYLES.forEach((style) => {
      const opts = { ...base, style };
      const key = cacheKey(opts);
      if (prepared.has(key)) return;
      prepared.set(key, renderFile(opts).catch(() => null));
    });
    if (prepared.size > 12) {
      const oldest = prepared.keys().next().value;
      prepared.delete(oldest);
    }
  }

  function activationAlive() {
    const ua = navigator.userActivation;
    return !ua || ua.isActive !== false;
  }

  function download(file, name) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return 'downloaded';
  }

  async function shareCard(opts) {
    const key = cacheKey(opts);
    let file = prepared.has(key) ? await prepared.get(key) : null;
    if (!file) file = await renderFile(opts);
    const title = opts.verse || 'Red Letter';
    const text = `${opts.quote || ''}${opts.verse ? `\n— ${opts.verse}` : ''}\n\nShared from Red Letter`;

    if (!navigator.share) return download(file, 'red-letter.png');

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        return 'shared';
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return 'aborted';
      // A failed share() consumed the activation; a second share() would
      // throw NotAllowedError, so fall straight through to a download.
      if ((err && err.name === 'NotAllowedError') || !activationAlive()) {
        return download(file, 'red-letter.png');
      }
    }

    if (!activationAlive()) return download(file, 'red-letter.png');

    try {
      await navigator.share({ title, text });
      return 'shared-text';
    } catch (err) {
      if (err && err.name === 'AbortError') return 'aborted';
    }

    return download(file, 'red-letter.png');
  }

  global.drawShareCard = drawCard;
  global.shareCard = shareCard;
  global.prewarmShareCard = prewarm;
  // Callers in app.js / craft.js / trust.js look for this namespace.
  global.RedLetterShare = { shareCard, drawCard, prewarm };
})(window);
