(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const readout = document.getElementById("inputReadout");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const status = document.getElementById("status");
  const controls = new Set();
  const keys = new Map([
    ["ArrowLeft", "left"], ["a", "left"], ["A", "left"],
    ["ArrowRight", "right"], ["d", "right"], ["D", "right"],
    ["ArrowUp", "up"], ["w", "up"], ["W", "up"],
    ["ArrowDown", "down"], ["s", "down"], ["S", "down"],
    [" ", "jump"], ["Shift", "run"], ["x", "fire"], ["X", "fire"],
    ["Enter", "confirm"], ["q", "l"], ["Q", "l"], ["e", "r"], ["E", "r"]
  ]);
  const inputOrder = ["left", "right", "up", "down", "jump", "run", "fire", "confirm", "l", "r"];
  let stickPointer = null;
  let stickVector = { x: 0, y: 0 };
  let wasmExports = null;
  let previousFrame = 0;

  function inputMask() {
    return inputOrder.reduce((mask, key, bit) => mask | (controls.has(key) ? (1 << bit) : 0), 0) >>> 0;
  }

  function publishInput() {
    const active = [...controls];
    readout.textContent = "ENTRADA: " + (active.length ? active.map(v => v.toUpperCase()).join(" + ") : "NEUTRA");
    window.dispatchEvent(new CustomEvent("nsmb-input", {
      detail: {
        pressed: Object.fromEntries(inputOrder.map(k => [k, controls.has(k)])),
        analog: { ...stickVector },
        bitmask: inputMask()
      }
    }));
  }

  function press(control) { controls.add(control); publishInput(); }
  function release(control) { controls.delete(control); publishInput(); }

  window.addEventListener("keydown", event => {
    const control = keys.get(event.key);
    if (!control) return;
    if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) event.preventDefault();
    press(control);
  });
  window.addEventListener("keyup", event => {
    const control = keys.get(event.key);
    if (control) release(control);
  });
  window.addEventListener("blur", () => {
    controls.clear();
    stickVector = { x: 0, y: 0 };
    resetStick();
    publishInput();
  });

  document.querySelectorAll("[data-control]").forEach(button => {
    const control = button.dataset.control;
    const down = event => { event.preventDefault(); button.classList.add("pressed"); press(control); };
    const up = event => { event.preventDefault(); button.classList.remove("pressed"); release(control); };
    button.addEventListener("pointerdown", down);
    ["pointerup", "pointercancel", "pointerleave"].forEach(name => button.addEventListener(name, up));
  });

  const stickArea = document.getElementById("stickArea");
  const stickKnob = document.getElementById("stickKnob");
  function resetStick() { stickKnob.style.transform = "translate(0px, 0px)"; }
  function moveStick(event) {
    const rect = stickArea.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const max = Math.min(rect.width, rect.height) * .32;
    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;
    const length = Math.hypot(dx, dy);
    if (length > max) { dx = dx / length * max; dy = dy / length * max; }
    stickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
    stickVector = { x: Math.max(-1, Math.min(1, dx / max)), y: Math.max(-1, Math.min(1, -dy / max)) };
    ["left", "right", "up", "down"].forEach(k => controls.delete(k));
    if (stickVector.x < -.28) controls.add("left");
    if (stickVector.x > .28) controls.add("right");
    if (stickVector.y > .35) controls.add("up");
    if (stickVector.y < -.35) controls.add("down");
    publishInput();
  }
  stickArea.addEventListener("pointerdown", event => {
    event.preventDefault();
    stickPointer = event.pointerId;
    stickArea.setPointerCapture(stickPointer);
    moveStick(event);
  });
  stickArea.addEventListener("pointermove", event => {
    if (event.pointerId === stickPointer) moveStick(event);
  });
  function endStick(event) {
    if (event.pointerId !== stickPointer) return;
    stickPointer = null;
    stickVector = { x: 0, y: 0 };
    ["left", "right", "up", "down"].forEach(k => controls.delete(k));
    resetStick();
    publishInput();
  }
  stickArea.addEventListener("pointerup", endStick);
  stickArea.addEventListener("pointercancel", endStick);

  async function enterFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) {
          try { await screen.orientation.lock("landscape"); } catch (_) { /* Optional browser capability. */ }
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {
      status.textContent = "TELA CHEIA INDISPONÍVEL";
    }
  }
  fullscreenButton.addEventListener("click", enterFullscreen);
  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "⤢" : "⛶";
    fullscreenButton.setAttribute("aria-label", document.fullscreenElement ? "Sair da tela cheia" : "Ativar tela cheia");
  });

  async function loadWasm() {
    try {
      const response = await fetch("./nsmb-web.wasm", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      const result = await WebAssembly.instantiate(bytes, {});
      const exports = result.instance.exports;
      const required = ["nsmb_web_abi_version","nsmb_web_init","nsmb_web_update",
        "nsmb_web_player_x","nsmb_web_player_y","nsmb_web_camera_x","nsmb_web_score",
        "nsmb_web_level_complete","nsmb_web_reset"];
      if (required.some(name => typeof exports[name] !== "function")) throw new Error("ABI incompleta");
      if (exports.nsmb_web_abi_version() !== 2) throw new Error("ABI incompatível");
      const initResult = exports.nsmb_web_init();
      if (initResult !== 0) throw new Error(`Inicialização recusada (${initResult})`);
      wasmExports = exports;
      document.querySelector(".screen-overlay").hidden = true;
      status.textContent = "MOTOR WASM ATIVO · ABI 2";
    } catch (error) {
      status.textContent = "MOTOR WASM INDISPONÍVEL";
      console.info("[NSMB] Módulo WebAssembly não carregado:", error.message);
    }
  }

  const worldPlatforms = [
    [260,360,150,18],[520,315,150,18],[790,365,180,18],
    [1110,320,170,18],[1430,355,190,18],[1770,300,170,18],[2070,355,180,18]
  ];
  const worldCoins = [[330,320],[585,275],[855,325],[1170,280],[1500,315],[1830,260],[2140,315]];
  function drawGame(timestamp) {
    const w = canvas.width, h = canvas.height;
    const sky = ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#5aa5d8"); sky.addColorStop(1,"#d8efff");
    ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
    const camera = wasmExports ? wasmExports.nsmb_web_camera_x() : 0;
    ctx.fillStyle="#ffffff";
    [[130,105,42],[410,75,30],[740,125,48],[890,70,27]].forEach(([x,y,r])=>{
      const sx=((x-camera*.22)%(w+100)+w+100)%(w+100)-50;
      ctx.beginPath();ctx.arc(sx,y,r,0,Math.PI*2);ctx.arc(sx+r*.8,y+8,r*.72,0,Math.PI*2);ctx.fill();
    });
    ctx.fillStyle="#6eae70";
    ctx.beginPath();ctx.moveTo(0,380);ctx.quadraticCurveTo(230,260,470,380);ctx.quadraticCurveTo(720,270,960,370);ctx.lineTo(960,540);ctx.lineTo(0,540);ctx.fill();
    ctx.fillStyle="#b87942";ctx.fillRect(0,440,w,100);
    ctx.fillStyle="#70bd54";ctx.fillRect(0,440,w,12);
    for(let x=-(camera%64);x<w;x+=64){ctx.fillStyle="#8a542f";ctx.fillRect(x,458,42,5);ctx.fillRect(x+18,480,5,5);}
    worldPlatforms.forEach(([x,y,pw,ph])=>{
      const sx=x-camera;if(sx+pw<0||sx>w)return;
      ctx.fillStyle="#9b6338";ctx.fillRect(sx,y,pw,ph);
      ctx.fillStyle="#79c94f";ctx.fillRect(sx,y,pw,6);
      ctx.fillStyle="rgba(255,255,255,.2)";ctx.fillRect(sx+8,y+8,pw-16,3);
    });
    worldCoins.forEach(([x,y],i)=>{
      const sx=x-camera;if(sx< -20||sx>w+20)return;
      const got=wasmExports && (wasmExports.nsmb_web_score()>i && false);
      ctx.fillStyle="#ffd447";ctx.beginPath();ctx.ellipse(sx,y,9,13,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#fff1a6";ctx.lineWidth=2;ctx.stroke();
    });
    const goalX=2520-camera;
    ctx.fillStyle="#f5f5f5";ctx.fillRect(goalX,270,8,170);
    ctx.fillStyle="#e84b4b";ctx.beginPath();ctx.moveTo(goalX+8,274);ctx.lineTo(goalX+68,294);ctx.lineTo(goalX+8,314);ctx.fill();
    if(wasmExports){
      const px=wasmExports.nsmb_web_player_x()-camera, py=wasmExports.nsmb_web_player_y();
      ctx.fillStyle="#e33b35";ctx.fillRect(px+4,py,22,13);
      ctx.fillStyle="#ffd2a1";ctx.fillRect(px+7,py+11,18,15);
      ctx.fillStyle="#2768c7";ctx.fillRect(px+3,py+25,25,17);
      ctx.fillStyle="#5b392b";ctx.fillRect(px+2,py+40,12,6);ctx.fillRect(px+18,py+40,12,6);
      ctx.fillStyle="#222";ctx.fillRect(px+(exportsFacingRight()?19:7),py+16,3,3);
      ctx.fillStyle="rgba(12,25,37,.72)";ctx.fillRect(22,20,220,42);
      ctx.fillStyle="#fff";ctx.font="bold 17px system-ui";
      ctx.fillText("MOEDAS: "+wasmExports.nsmb_web_score()+" / 7",36,47);
      if(wasmExports.nsmb_web_level_complete()){
        ctx.fillStyle="rgba(8,18,30,.72)";ctx.fillRect(0,0,w,h);
        ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="bold 38px system-ui";
        ctx.fillText("FASE CONCLUÍDA!",w/2,h/2-8);
        ctx.font="18px system-ui";ctx.fillText("Pressione ENTER ou START para jogar novamente",w/2,h/2+32);ctx.textAlign="left";
      }
      const delta=previousFrame?Math.min(timestamp-previousFrame,33):16;
      wasmExports.nsmb_web_update(delta,inputMask());
    } else {
      ctx.fillStyle="#17324b";ctx.font="bold 16px system-ui";ctx.fillText("AGUARDANDO MOTOR WEBASSEMBLY",28,42);
    }
    previousFrame=timestamp;
    requestAnimationFrame(drawGame);
  }
  function exportsFacingRight(){return wasmExports && wasmExports.nsmb_web_player_facing ? wasmExports.nsmb_web_player_facing()===1 : true;}

  publishInput();
  loadWasm();
  requestAnimationFrame(drawGame);
})();
