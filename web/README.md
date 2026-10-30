# Browser port foundation

This folder contains the browser-facing page and input layer for the experimental web port.

## Build the WebAssembly module

The browser target uses a separate C++/Clang build and leaves the original Nintendo DS `build.zig` untouched. Requirements: CMake 3.20+, Clang++ with the `wasm32-unknown-unknown` target, and wasm-ld.

From the repository root:

```sh
cmake -S platforms/web -B build/web
cmake --build build/web
```

The build writes `web/nsmb-web.wasm`. The page loads it, validates ABI version 1, calls `nsmb_web_init()`, and sends frame updates through `nsmb_web_update(delta_ms, input_bits)`.

The current C++ entry point is deliberately a no-op ABI scaffold. A successfully loaded module proves that the browser can instantiate the WASM artifact and call its exports; it does not mean the original game is playable.

## Browser controls

- Responsive game viewport and fullscreen button.
- Best-effort landscape orientation lock (browser/device permission required).
- Touch controls: virtual analog on the left; action buttons on the right.
- Keyboard controls for desktop.
- Input events published as the `nsmb-input` CustomEvent on `window`.

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | Arrow keys / WASD | Virtual analog |
| Jump | Space | A / B |
| Run | Shift | Y |
| Fire / action | X | X |
| Confirm / Start | Enter | START |
| Auxiliary | Q / E | L / R |

The event's `detail` contains `pressed`, `analog`, and `bitmask`. The bitmask order is left, right, up, down, jump, run, fire, confirm, L, R (least-significant bit first).

## Current limitations

This is not yet a playable browser build of New Super Mario Bros. The original DS decompilation is not a portable browser runtime, and this page does not contain a ROM, extracted game assets, music, levels, or the game engine. The preview canvas is procedural scaffolding only. The next engineering phase is to implement a portable game core and browser platform services, then replace the no-op ABI exports.
