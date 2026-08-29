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

  function paintBackground(ctx, style) {
    if (style === 'dawn') {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#F7E8D4');
      g.addColorStop(0.45, '#F0D5B8');
      g.addColorStop(1, '#C45A3A');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      return { quote: '#2A1208', brand: 'rgba(42,18,8,0.45)', cite: '#8B1212', frame: 'rgba(42,18,8,0.18)' };
    }
    if (style === 'manuscript') {
      ctx.fillStyle = '#EDE6D8';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(26,22,18,0.03)';
      for (let i = 0; i < 2200; i += 1) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
      }
      return { quote: '#C41E1E', brand: 'rgba(26,22,18,0.4)', cite: '#1A1612', frame: 'rgba(26,22,18,0.14)' };
    }
    // void (default)
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#1A0A0A');
    g.addColorStop(0.45, '#3B0C0C');
    g.addColorStop(1, '#0E0C0B');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const bloom = ctx.createRadialGradient(W * 0.5, H * 0.28, 20, W * 0.5, H * 0.35, H * 0.55);
    bloom.addColorStop(0, 'rgba(196,30,30,0.45)');
    bloom.addColorStop(1, 'rgba(196,30,30,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);
    return { quote: '#FFF5F0', brand: 'rgba(255,255,255,0.55)', cite: 'rgba(255,180,170,0.9)', frame: 'rgba(255,255,255,0.14)' };
  }

  function drawCard({ quote, verse, theme, brand = 'Red Letter', style = 'void' }) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const colors = paintBackground(ctx, style);

    ctx.strokeStyle = colors.frame;
    ctx.lineWidth = 2;
    ctx.strokeRect(64, 64, W - 128, H - 128);

    ctx.fillStyle = colors.brand;
    ctx.font = '500 26px Figtree, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✝  RED LETTER', W / 2, 140);

    if (theme) {
      ctx.fillStyle = colors.cite;
      ctx.font = '600 22px Figtree, system-ui, sans-serif';
      ctx.fillText(String(theme).toUpperCase(), W / 2, 190);
    }

    const raw = String(quote || '').replace(/^["“]|["”]$/g, '');
    const q = `“${raw}”`;
    ctx.fillStyle = colors.quote;
    ctx.textAlign = 'center';
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
    ctx.font = '600 28px Figtree, system-ui, sans-serif';
    ctx.fillText(verse ? `— ${verse}` : '', W / 2, Math.min(y + 64, H - 220));

    ctx.fillStyle = colors.brand;
    ctx.font = '500 22px Figtree, system-ui, sans-serif';
    ctx.fillText(brand, W / 2, H - 110);
    ctx.font = '400 18px Figtree, system-ui, sans-serif';
    ctx.fillText('Only the words He spoke', W / 2, H - 74);

    return canvas;
  }

  async function canvasToFile(canvas, name = 'red-letter.png') {
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    return new File([blob], name, { type: 'image/png' });
  }

  async function shareCard(opts) {
    const canvas = drawCard(opts);
    const file = await canvasToFile(canvas);
    const title = opts.verse || 'Red Letter';
    const text = `${opts.quote || ''}${opts.verse ? `\n— ${opts.verse}` : ''}\n\nShared from Red Letter`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title, text });
      return 'shared';
    }
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return 'shared-text';
      } catch (_) { /* fall through */ }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
    return 'downloaded';
  }

  global.RedLetterShare = { drawCard, shareCard, canvasToFile };
})(window);
