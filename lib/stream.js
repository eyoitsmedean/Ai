// Splits a buffer of streamed model text into the part that is safe to send
// now and the part that must wait. Anything from an unclosed "{{" onward is
// held so a placeholder is only ever filled once its "}}" has arrived; a lone
// trailing "{" is held too because the next token may complete a "{{".
function holdPlaceholders(pending, force = false) {
  const text = String(pending || '');
  if (force) return { flush: text, rest: '' };
  const open = text.lastIndexOf('{{');
  const close = text.lastIndexOf('}}');
  if (open !== -1 && close < open) {
    return { flush: text.slice(0, open), rest: text.slice(open) };
  }
  if (/\{$/.test(text)) {
    return { flush: text.slice(0, -1), rest: '{' };
  }
  return { flush: text, rest: '' };
}

module.exports = { holdPlaceholders };
