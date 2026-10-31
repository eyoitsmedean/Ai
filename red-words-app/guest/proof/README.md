# Chrome, 2026-10-31

Headless Chrome opened `RedWords.html` as a file. No server.

- `splash.png` — promise and knot. Dock stays off.
- `today.png` — Matthew 6:34, citation, knot, reflection, step cue, dock.

The first shot showed the dock during splash because `#dock { display: flex }` overrode the `hidden` attribute. `guest.css` now forces `[hidden] { display: none !important; }`. These frames are after that fix.
