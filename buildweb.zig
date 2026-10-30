const std = @import("std");

/// Separate WebAssembly build. The original build.zig remains untouched.
pub fn build(b: *std.Build) void {
    const target = b.resolveTargetQuery(.{
        .cpu_arch = .wasm32,
        .os_tag = .freestanding,
    });
    const optimize = b.standardOptimizeOption(.{});

    const root_module = b.createModule(.{
        .root_source_file = b.path("platforms/web/wasm_entry.zig"),
        .target = target,
        .optimize = optimize,
    });

    const wasm = b.addExecutable(.{
        .name = "nsmb-web",
        .root_module = root_module,
        .entry = .disabled,
    });

    b.installArtifact(wasm);
}
