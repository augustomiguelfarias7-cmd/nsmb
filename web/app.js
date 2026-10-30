(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const readout = document.getElementById("inputReadout");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const controls = new Set();
  const keys = new Map([
    ["ArrowLeft", "left"], ["a", "left"], ["A", "left"],
    ["ArrowRight", "right"], ["d", "right"], ["D", "right"],
    ["ArrowUp", "up"], ["w", "up"], ["W", "up"],
    ["ArrowDown", "down"], ["s", "down"], ["S", "down"],
    [" ", "jump"], ["Shift", "run"], ["x", "fire"], ["X", "fire"],
    ["Enter", "confirm"], ["q", "l"], ["Q", "l"], ["e", "r"], ["E", "r"]
  ]);

  let stickPointer = null;
  let stickVector = { x: 0, y: 0 };

  function publishInput() {
    const active = [...controls];
    const labels = active.length ? active.map(v => v.toUpperCase()).join(" + ") : "NEUTRA";
    readout.textContent = "ENTRADA: " + labels;
    window.dispatchEvent(new CustomEvent("nsmb-input", {
      detail: {
        pressed: Object.fromEntries(["left","right","up","down","jump","run","fire","confirm","l","r"].map(k => [k, controls.has(k)])),
        analog: { ...stickVector }
      }
    }));
  }

  function press(control) {
    controls.add(control);
    publishInput();
  }
  function release(control) {
    controls.delete(control);
    publishInput();
  }

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
    ["pointerup","pointercancel","pointerleave"].forEach(name => button.addEventListener(name, up));
  });

  const stickArea = document.getElementById("stickArea");
  const stickKnob = document.getElementById("stickKnob");
  function resetStick() {
    stickKnob.style.transform = "translate(0px, 0px)";
  }
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
    ["left","right","up","down"].forEach(k => controls.delete(k));
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
    ["left","right","up","down"].forEach(k => controls.delete(k));
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
          try { await screen.orientation.lock("landscape"); } catch (_) { /* Device/browser may not allow orientation locking. */ }
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      readout.textContent = "TELA CHEIA INDISPONÍVEL NESTE NAVEGADOR";
    }
  }
  fullscreenButton.addEventListener("click", enterFullscreen);
  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "⤢" : "⛶";
    fullscreenButton.setAttribute("aria-label", document.fullscreenElement ? "Sair da tela cheia" : "Ativar tela cheia");
  });

  function drawPreview() {
    const w = canvas.width, h = canvas.height;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#426b91");
    sky.addColorStop(1, "#a6c5c4");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    [[150,125,75],[390,90,52],[760,145,88]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = "#456b55";
    ctx.beginPath(); ctx.moveTo(0,350); ctx.quadraticCurveTo(240,245,470,350); ctx.quadraticCurveTo(720,250,960,340); ctx.lineTo(960,540); ctx.lineTo(0,540); ctx.fill();
    ctx.fillStyle = "#263d36";
    ctx.fillRect(0, 430, w, 110);
    ctx.fillStyle = "#d5b36b";
    for (let x=0; x<w; x+=64) ctx.fillRect(x, 430, 42, 7);
    ctx.fillStyle = "rgba(12,25,37,.55)";
    ctx.fillRect(28, 28, 240, 38);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px system-ui";
    ctx.fillText("WEB RUNTIME: AGUARDANDO INTEGRAÇÃO", 42, 52);
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = "13px system-ui";
    ctx.fillText("Prévia técnica original · sem assets do jogo", 32, h-28);
    requestAnimationFrame(drawPreview);
  }
  publishInput();
  drawPreview();
})();