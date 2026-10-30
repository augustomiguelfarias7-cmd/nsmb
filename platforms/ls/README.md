# LS platform

The LS target is the native host build for the planned LS console.

Responsibilities of this host:

- Translate LS controller input into the shared game input interface.
- Provide the LS graphics, audio, timing, and storage backends.
- Package the game using the LS platform's eventual application format.
- Keep LS-specific APIs outside `src/shared/`.

The LS hardware and operating environment are not finalized in this repository yet. Therefore, no CPU architecture, graphics API, executable format, or SDK is assumed here.

This is an architecture placeholder, not a native LS game build yet.
