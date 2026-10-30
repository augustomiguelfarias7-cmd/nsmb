#include "engine.hpp"
namespace nsmb {
namespace {
float clampf(float v,float lo,float hi){return v<lo?lo:(v>hi?hi:v);}
float absf(float v){return v<0?-v:v;}
constexpr float WORLD_W=2600.0f, GROUND_Y=440.0f, PLAYER_W=30.0f, PLAYER_H=46.0f;
constexpr float GRAVITY=1850.0f, JUMP_SPEED=690.0f;
constexpr uint32_t LEFT=1u<<0, RIGHT=1u<<1, JUMP=1u<<4, RUN=1u<<5, CONFIRM=1u<<7;
struct Rect{float x,y,w,h;};
constexpr Rect platforms[]={{260,360,150,18},{520,315,150,18},{790,365,180,18},{1110,320,170,18},{1430,355,190,18},{1770,300,170,18},{2070,355,180,18}};
constexpr float coins[][2]={{330,320},{585,275},{855,325},{1170,280},{1500,315},{1830,260},{2140,315}};
PlayerState p{}; float cam=0; uint32_t points=0,collected=0,finished=0; bool previous_jump=false;
}
void reset(){p={48.0f,GROUND_Y-PLAYER_H,0,0,1,1,0};cam=0;points=0;collected=0;finished=0;previous_jump=false;}
void update(float delta_ms,uint32_t input){
 if(finished){if(input&CONFIRM)reset();return;}
 float dt=clampf(delta_ms,0,33)/1000.0f;if(dt<=0)return;
 bool left=input&LEFT,right=input&RIGHT,jump=input&JUMP;float speed=(input&RUN)?310.0f:220.0f;
 p.vx=(right?speed:0)-(left?speed:0);if(p.vx<0)p.facing=0;else if(p.vx>0)p.facing=1;
 if(jump&&!previous_jump&&p.grounded){p.vy=-JUMP_SPEED;p.grounded=0;}previous_jump=jump;
 float old_y=p.y;p.x=clampf(p.x+p.vx*dt,0,WORLD_W-PLAYER_W);p.vy+=GRAVITY*dt;p.y+=p.vy*dt;p.grounded=0;
 if(p.y+PLAYER_H>=GROUND_Y&&old_y+PLAYER_H<=GROUND_Y+2&&p.vy>=0){p.y=GROUND_Y-PLAYER_H;p.vy=0;p.grounded=1;}
 for(const auto&r:platforms){bool overlap=p.x+PLAYER_W>r.x&&p.x<r.x+r.w;if(overlap&&p.vy>=0&&old_y+PLAYER_H<=r.y+3&&p.y+PLAYER_H>=r.y){p.y=r.y-PLAYER_H;p.vy=0;p.grounded=1;}}
 for(uint32_t i=0;i<sizeof(coins)/sizeof(coins[0]);++i){if(collected&(1u<<i))continue;float dx=p.x+PLAYER_W*.5f-coins[i][0],dy=p.y+PLAYER_H*.5f-coins[i][1];if(dx*dx+dy*dy<34.0f*34.0f){collected|=1u<<i;++points;}}
 cam=clampf(p.x-350,0,WORLD_W-960);p.animation=absf(p.vx)>.1f?1u:0u;if(p.x>=WORLD_W-PLAYER_W-24)finished=1;
}
const PlayerState&player(){return p;}float camera_x(){return cam;}uint32_t score(){return points;}uint32_t level_complete(){return finished;}
}
