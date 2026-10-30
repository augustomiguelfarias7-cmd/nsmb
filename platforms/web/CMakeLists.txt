cmake_minimum_required(VERSION 3.20)
project(nsmb_web LANGUAGES NONE)

find_program(NSMB_CLANGXX NAMES clang++ REQUIRED)
set(NSMB_WEB_OUTPUT "${CMAKE_CURRENT_LIST_DIR}/../../web/nsmb-web.wasm")
set(NSMB_WEB_ENTRY "${CMAKE_CURRENT_LIST_DIR}/wasm_entry.cpp")
set(NSMB_ENGINE_SOURCE "${CMAKE_CURRENT_LIST_DIR}/engine.cpp")
set(NSMB_ENGINE_HEADER "${CMAKE_CURRENT_LIST_DIR}/engine.hpp")

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
        "${NSMB_WEB_ENTRY}"
        "${NSMB_ENGINE_SOURCE}"
        -Wl,--no-entry
        -Wl,--export=nsmb_web_abi_version
        -Wl,--export=nsmb_web_init
        -Wl,--export=nsmb_web_update
        -Wl,--export=nsmb_web_reset
        -Wl,--export=nsmb_web_player_x
        -Wl,--export=nsmb_web_player_y
        -Wl,--export=nsmb_web_player_vx
        -Wl,--export=nsmb_web_player_grounded
        -Wl,--export=nsmb_web_player_facing
        -Wl,--export=nsmb_web_camera_x
        -Wl,--export=nsmb_web_score
        -Wl,--export=nsmb_web_level_complete
        -Wl,--export=nsmb_web_shutdown
        -Wl,--strip-all
        -o "${NSMB_WEB_OUTPUT}"
    DEPENDS "${NSMB_WEB_ENTRY}" "${NSMB_ENGINE_SOURCE}" "${NSMB_ENGINE_HEADER}"
    COMMENT "Compiling NSMB browser game engine to WebAssembly with Clang"
    VERBATIM
)

add_custom_target(nsmb-web ALL DEPENDS "${NSMB_WEB_OUTPUT}")
