# Shared game code

Code placed in this directory must be independent of browser APIs, LS APIs, and Nintendo DS hardware registers or services.

The shared layer will gradually own portable game behavior such as:

- Game-state updates and simulation.
- Platform-neutral input state.
- Timing interfaces and deterministic update logic.
- Resource identifiers and asset-independent game systems.

Platform services must be provided through narrow interfaces implemented separately by `platforms/web/` and `platforms/ls/`.

Do not move reconstructed DS code here until its hardware and operating-system dependencies have been identified and replaced. This directory intentionally starts as an architecture boundary rather than claiming that the existing decompilation is already portable.
