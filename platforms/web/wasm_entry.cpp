#include "engine.hpp"
#include <stdint.h>
#define NSMB_EXPORT(name) __attribute__((visibility("default"), export_name(name)))
extern "C" {
NSMB_EXPORT("nsmb_web_abi_version") uint32_t nsmb_web_abi_version(){return 2;}
NSMB_EXPORT("nsmb_web_init") uint32_t nsmb_web_init(){nsmb::reset();return 0;}
NSMB_EXPORT("nsmb_web_update") void nsmb_web_update(float dt,uint32_t input){nsmb::update(dt,input);}
NSMB_EXPORT("nsmb_web_reset") void nsmb_web_reset(){nsmb::reset();}
NSMB_EXPORT("nsmb_web_player_x") float nsmb_web_player_x(){return nsmb::player().x;}
NSMB_EXPORT("nsmb_web_player_y") float nsmb_web_player_y(){return nsmb::player().y;}
NSMB_EXPORT("nsmb_web_player_vx") float nsmb_web_player_vx(){return nsmb::player().vx;}
NSMB_EXPORT("nsmb_web_player_grounded") uint32_t nsmb_web_player_grounded(){return nsmb::player().grounded;}
NSMB_EXPORT("nsmb_web_player_facing") uint32_t nsmb_web_player_facing(){return nsmb::player().facing;}
NSMB_EXPORT("nsmb_web_camera_x") float nsmb_web_camera_x(){return nsmb::camera_x();}
NSMB_EXPORT("nsmb_web_score") uint32_t nsmb_web_score(){return nsmb::score();}
NSMB_EXPORT("nsmb_web_level_complete") uint32_t nsmb_web_level_complete(){return nsmb::level_complete();}
NSMB_EXPORT("nsmb_web_shutdown") void nsmb_web_shutdown(){}
}
