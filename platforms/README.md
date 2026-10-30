# Platform architecture

The project is being prepared for two independent runtimes:

- **Web:** a WebAssembly module loaded by the browser page on GitHub Pages.
- **LS:** a native build for the LS console.

The intended structure is:

```text
src/
  shared/       # game logic that can run on both targets
platforms/
  web/          # browser host and WebAssembly integration
  ls/           # LS host and native integration
web/            # GitHub Pages interface and browser controls
```

## Porting rule

Keep portable game logic in `src/shared/`. Put platform APIs, graphics/audio backends, input adapters, filesystem access, and timing behind platform-specific interfaces.

Do not copy Nintendo DS hardware assumptions into the shared layer. Replace them incrementally with host interfaces, and keep the original DS reconstruction/build pipeline separate until a component has been verified as portable.

## Build targets

The intended commands are `zig build web` and `zig build ls`. They will be wired to real source targets only after the shared runtime and each platform backend exist. At this stage these names describe the architecture, not working game builds.

No ROM, extracted copyrighted game assets, music, or levels are part of this platform scaffold.
