/* Red Letter share cards — canvas PNG for Web Share / download */
(function (global) {
  const W = 1080;
  const H = 1350;

  function wrapText(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
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

  function drawCard({ quote, verse, theme, brand = 'Red Letter Advisor' }) {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Deep crimson field with soft vignette
    const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 40, W * 0.5, H * 0.5, H * 0.75);
    g.addColorStop(0, '#9B2222');
    g.addColorStop(0.45, '#6B1212');
    g.addColorStop(1, '#2A0808');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Subtle paper grain
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Top brand mark
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '500 28px "DM Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✝  RED LETTER', W / 2, 120);

    if (theme) {
      ctx.fillStyle = 'rgba(255,230,180,0.85)';
      ctx.font = '600 26px "DM Sans", system-ui, sans-serif';
      ctx.fillText(String(theme).toUpperCase(), W / 2, 180);
    }

    // Quote
    const q = '“' + String(quote || '').replace(/^["“]|["”]$/g, '') + '”';
    ctx.fillStyle = '#FFF8F0';
    ctx.textAlign = 'center';
    let size = q.length > 180 ? 42 : q.length > 100 ? 48 : 56;
    ctx.font = 'italic 600 ' + size + 'px "Cormorant Garamond", Georgia, serif';
    let lines = wrapText(ctx, q, W - 160);
    while (lines.length > 10 && size > 34) {
      size -= 4;
      ctx.font = 'italic 600 ' + size + 'px "Cormorant Garamond", Georgia, serif';
      lines = wrapText(ctx, q, W - 160);
    }
    const lineH = size * 1.28;
    const blockH = lines.length * lineH;
    let y = H * 0.42 - blockH / 2;
    lines.forEach((ln) => {
      ctx.fillText(ln, W / 2, y);
      y += lineH;
    });

    // Citation
    ctx.fillStyle = 'rgba(255,220,180,0.95)';
    ctx.font = '600 32px "DM Sans", system-ui, sans-serif';
    ctx.fillText('— ' + (verse || ''), W / 2, Math.min(y + 70, H - 220));

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '500 24px "DM Sans", system-ui, sans-serif';
    ctx.fillText(brand, W / 2, H - 100);
    ctx.font = '400 20px "DM Sans", system-ui, sans-serif';
    ctx.fillText('Only the words He spoke', W / 2, H - 64);

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
    const text = (opts.quote || '') + (opts.verse ? '\n— ' + opts.verse : '') + '\n\nShared from Red Letter Advisor';

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title, text });
      return 'shared';
    }
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return 'shared-text';
      } catch (_) {}
    }
    // Download fallback
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
    return 'downloaded';
  }

  global.RedLetterShare = { drawCard, shareCard, canvasToFile };
})(window);
