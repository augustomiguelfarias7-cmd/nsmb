# WebAssembly platform

The browser target is built independently from the Nintendo DS build. The original root `build.zig` is unchanged and remains dedicated to the DS project.

## Build with C++

Requirements: CMake 3.20+, Clang++ with the `wasm32-unknown-unknown` target, and wasm-ld.

From the repository root:

```sh
cmake -S platforms/web -B build/web
cmake --build build/web
```

The build writes `web/nsmb-web.wasm` directly. The browser page loads this file, validates ABI version 1, and calls the exported initialization/update functions.

## Current ABI scaffold

`wasm_entry.cpp` exports:

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
