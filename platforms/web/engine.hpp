#pragma once
#include <stdint.h>
namespace nsmb {
struct PlayerState { float x, y, vx, vy; uint32_t grounded, facing, animation; };
void reset();
void update(float delta_ms, uint32_t input_bits);
const PlayerState& player();
float camera_x();
uint32_t score();
uint32_t level_complete();
}
