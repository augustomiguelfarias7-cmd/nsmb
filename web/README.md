# Browser port foundation

This folder contains the first browser-facing foundation for the experimental web port.

## Current scope

- Responsive game viewport.
- Fullscreen button using the Fullscreen API.
- Best-effort landscape orientation lock (browser/device permission required).
- Touch controls: virtual analog on the left; action buttons on the right.
- Keyboard controls for desktop.
- Input events published as the `nsmb-input` CustomEvent on `window`.

## Input map

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | Arrow keys / WASD | Virtual analog |
| Jump | Space | A / B |
| Run | Shift | Y |
| Fire / action | X | X |
| Confirm / Start | Enter | START |
| Auxiliary | Q / E | L / R |

Consumers can listen for `nsmb-input` and read `event.detail.pressed` and `event.detail.analog`.

## Important boundary

This is an input and presentation scaffold, not a playable browser build of New Super Mario Bros. The original DS decompilation is not yet a complete build and this page does not contain a ROM, extracted game assets, music, levels, or a game engine. Integrating a lawful browser runtime and original project code is a separate engineering phase.


## Multi-platform direction

This browser scaffold is one host for the planned shared game core. The project is also preparing a separate LS host; see [platform architecture](../platforms/README.md) and [the WebAssembly host plan](../platforms/web/README.md).

The page does not yet load a WebAssembly game module. The browser target will be connected after a portable game entry point and browser host interface have been implemented.
