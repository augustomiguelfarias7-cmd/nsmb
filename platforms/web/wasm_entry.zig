//! Temporary browser ABI entry point.
//!
//! This module only verifies the WebAssembly build pipeline. It does not
//! contain or emulate New Super Mario Bros. gameplay. Replace these no-op
//! exports when the portable game core and browser platform layer are ready.

pub export fn nsmb_web_abi_version() u32 {
    return 1;
}

/// Initializes the browser-side game runtime. Returns 0 while the runtime is
/// still a scaffold.
pub export fn nsmb_web_init() u32 {
    return 0;
}

/// Advances the runtime by delta_ms. input_bits is reserved for the shared
/// input contract. This scaffold intentionally performs no game update.
pub export fn nsmb_web_update(delta_ms: f32, input_bits: u32) void {
    _ = delta_ms;
    _ = input_bits;
}

/// Releases runtime resources. There are no resources in the current scaffold.
pub export fn nsmb_web_shutdown() void {}
