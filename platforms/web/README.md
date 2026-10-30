# WebAssembly platform

The browser target is built independently from the Nintendo DS build.

## Build

From the repository root, using a Zig compiler compatible with the project's build API:

```sh
zig build --build-file buildweb.zig
```

The build file targets `wasm32-freestanding` and installs `nsmb-web.wasm` under `zig-out/bin/`. Copy that artifact to `web/nsmb-web.wasm` for the static browser page. The page instantiates it without WASI imports, checks ABI version 1, and calls the exported initialization/update functions.

## Current ABI scaffold

`wasm_entry.zig` exports:

- `nsmb_web_abi_version() -> u32`
- `nsmb_web_init() -> u32`
- `nsmb_web_update(delta_ms: f32, input_bits: u32) -> void`
- `nsmb_web_shutdown() -> void`

These are no-op exports used to establish the build and browser-loading boundary. They do not implement the game or render gameplay.

## Host responsibilities

- Connect browser keyboard and touch input to the shared game input interface.
- Provide the browser-facing rendering surface and frame loop.
- Handle audio through browser-supported APIs.
- Provide controlled asset loading for original or properly licensed project assets.
- Keep browser-specific code outside `src/shared/`.

Do not assume WASI is available in GitHub Pages' browser runtime. Do not move reconstructed DS code into the shared layer until its hardware and operating-system dependencies have been identified and replaced.
