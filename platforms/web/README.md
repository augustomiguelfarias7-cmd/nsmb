# WebAssembly platform

The browser target is intended to load a compiled WebAssembly module from the GitHub Pages game page.

Responsibilities of this host:

- Connect browser keyboard and touch input to the shared game input interface.
- Provide the browser-facing rendering surface and frame loop.
- Handle audio through browser-supported APIs.
- Provide controlled asset loading for original or properly licensed project assets.
- Keep browser-specific code outside `src/shared/`.

The existing `web/` directory remains the page and user-interface layer. The WebAssembly binary and its JavaScript loader will be added here when a portable runtime entry point exists.

## Target decision

The first browser build should use a browser-compatible WebAssembly target and explicit JavaScript host imports. Do not assume WASI is available in GitHub Pages' browser runtime.

This is an architecture placeholder, not a playable game module yet.
