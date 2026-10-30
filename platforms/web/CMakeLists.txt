cmake_minimum_required(VERSION 3.20)
project(nsmb_web LANGUAGES NONE)

find_program(NSMB_CLANGXX NAMES clang++ REQUIRED)
set(NSMB_WEB_OUTPUT "${CMAKE_CURRENT_LIST_DIR}/../../web/nsmb-web.wasm")
set(NSMB_WEB_SOURCE "${CMAKE_CURRENT_LIST_DIR}/wasm_entry.cpp")

add_custom_command(
    OUTPUT "${NSMB_WEB_OUTPUT}"
    COMMAND "${NSMB_CLANGXX}"
        --target=wasm32-unknown-unknown
        -std=c++17
        -O2
        -ffreestanding
        -fno-exceptions
        -fno-rtti
        -nostdlib
        "${NSMB_WEB_SOURCE}"
        -Wl,--no-entry
        -Wl,--export=nsmb_web_abi_version
        -Wl,--export=nsmb_web_init
        -Wl,--export=nsmb_web_update
        -Wl,--export=nsmb_web_shutdown
        -Wl,--strip-all
        -o "${NSMB_WEB_OUTPUT}"
    DEPENDS "${NSMB_WEB_SOURCE}"
    COMMENT "Compiling NSMB browser runtime to WebAssembly with Clang"
    VERBATIM
)

add_custom_target(nsmb-web ALL DEPENDS "${NSMB_WEB_OUTPUT}")
