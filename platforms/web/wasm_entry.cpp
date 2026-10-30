#include <stdint.h>

extern "C" {
__attribute__((visibility("default"), export_name("nsmb_web_abi_version")))
uint32_t nsmb_web_abi_version() { return 1; }

__attribute__((visibility("default"), export_name("nsmb_web_init")))
uint32_t nsmb_web_init() { return 0; }

__attribute__((visibility("default"), export_name("nsmb_web_update")))
void nsmb_web_update(float delta_ms, uint32_t input_bits) {
    (void)delta_ms;
    (void)input_bits;
}

__attribute__((visibility("default"), export_name("nsmb_web_shutdown")))
void nsmb_web_shutdown() {}
}
