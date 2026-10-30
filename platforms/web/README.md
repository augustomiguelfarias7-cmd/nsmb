# WebAssembly platform

The browser target is built independently from the Nintendo DS build. The original root `build.zig` remains unchanged.

## Build

Requirements: CMake 3.20+, Clang++ with the `wasm32-unknown-unknown` target, and wasm-ld.

```sh
cmake -S platforms/web -B build/web
cmake --build build/web
```

The build writes `web/nsmb-web.wasm`.

## Engine foundation (ABI 2)

The freestanding C++ engine in `engine.cpp` currently implements a small original platform-game test level:
- fixed-step-safe frame delta clamping and player movement;
- gravity, jump edge detection, ground and platform landing collisions;
- run speed, facing direction, and camera following;
- seven collectible coins, score, goal detection, and restart;
- exported player/camera/score state consumed by the browser renderer.

The browser host in `web/app.js` supplies keyboard and touch input, renders the engine state on Canvas, and displays the HUD. This is a playable engine integration test, not yet the reconstructed New Super Mario Bros. game. The existing DS decompilation still needs a separate integration pass; DS-specific hardware and OS dependencies must not be pulled into the shared browser runtime blindly.

No ROM, extracted game assets, music, or original game levels are included. The test level uses original procedural graphics.
