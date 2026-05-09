import { duelDisplayedVolleyPreview } from "./duel.js";

/**
 * Quad index in 2×2 sheet (author art):
 * 0 = top-left — prep / playing cards
 * 1 = top-right — shootout (between rounds)
 * 2 = bottom-left — player wins
 * 3 = bottom-right — opponent wins
 */
export function duelSceneQuad(duel) {
  if (!duel) return 0;
  if (duel.phase === "prep") return 0;
  if (duel.phase === "highnoon") return 1;
  if (duel.phase === "ended") {
    if (duel.winner === "player") return 2;
    if (duel.winner === "enemy") return 3;
  }
  return 0;
}

/** One cell of a 2×2 spritesheet, cover-scaled like object-fit cover (pixel-crisp). */
function drawCoverSpriteQuad(ctx, img, quadIndex, w, h) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const sw = iw / 2;
  const sh = ih / 2;
  const sx = (quadIndex % 2) * sw;
  const sy = quadIndex >= 2 ? sh : 0;
  const ir = sw / sh;
  const cr = w / h;
  let dw;
  let dh;
  let ox;
  let oy;
  if (ir > cr) {
    dh = h;
    dw = h * ir;
    ox = (w - dw) * 0.5;
    oy = 0;
  } else {
    dw = w;
    dh = w / ir;
    ox = 0;
    oy = (h - dh) * 0.42;
  }
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, sw, sh, ox, oy, dw, dh);
  ctx.restore();
}

/** @param {CanvasRenderingContext2D} ctx */
export function drawGame(ctx, game, w, h) {
  const t = game.time * 0.001;
  const sh = game.screenShake || 0;
  if (sh > 0) {
    ctx.save();
    ctx.translate((Math.random() - 0.5) * sh * 18, (Math.random() - 0.5) * sh * 14);
  }

  const bgKey = game.duel?.opponentDef?.bgKey ?? "street";
  const scenes = game.assets?.duelScenes;

  if (scenes && scenes.complete && scenes.naturalWidth > 0 && game.duel) {
    const q = duelSceneQuad(game.duel);
    drawCoverSpriteQuad(ctx, scenes, q, w, h);
    drawAtmosphereOverPixelScene(ctx, w, h, t, q);
  } else {
    drawProceduralOTS(ctx, w, h, bgKey, t);
    drawAtmosphere(ctx, w, h, bgKey, t);
  }

  drawHud(ctx, w, h, game);
  drawStatGlows(ctx, w, h, game);
  drawCombatFloats(ctx, w, h, game);
  if (game.duel?.phase === "highnoon") {
    drawHighNoon(ctx, w, h, game.duel.highNoonT);
  }
  drawFx(ctx, w, h, game, t);
  if (sh > 0) ctx.restore();
}

/** Light overlay so HUD + hand panel stay readable over pixel art */
function drawAtmosphereOverPixelScene(ctx, w, h, t, quadIndex) {
  const bottomFade = ctx.createLinearGradient(0, h * 0.45, 0, h);
  bottomFade.addColorStop(0, "rgba(0,0,0,0)");
  bottomFade.addColorStop(1, "rgba(18,14,12,0.78)");
  ctx.fillStyle = bottomFade;
  ctx.fillRect(0, 0, w, h);

  const vig = ctx.createRadialGradient(w * 0.5, h * 0.4, w * 0.2, w * 0.5, h * 0.48, w * 0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(12,10,9,0.35)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  if (quadIndex === 1) {
    ctx.fillStyle = "rgba(255,200,120,0.04)";
    ctx.fillRect(0, 0, w, h);
  }
}

/** Fallback when images not loaded — OTS-style composition */
function drawProceduralOTS(ctx, w, h, bgKey, t) {
  const skyTop = bgKey === "night" ? "#2a3650" : bgKey === "mine" ? "#6a6258" : "#a8c4e8";
  const skyBot = bgKey === "night" ? "#5a6780" : "#d8c4a0";
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  g.addColorStop(0, skyTop);
  g.addColorStop(1, skyBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h * 0.58);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (let i = 0; i < 6; i++) {
    const x = ((t * 10 + i * 110) % (w + 60)) - 30;
    ctx.fillRect(x, 16 + i * 14, 55, 6);
  }

  const groundY = h * 0.5;
  const gg = ctx.createLinearGradient(0, groundY, 0, h);
  gg.addColorStop(0, "#b89a78");
  gg.addColorStop(0.4, "#7d6548");
  gg.addColorStop(1, "#4a3a2a");
  ctx.fillStyle = gg;
  ctx.fillRect(0, groundY, w, h - groundY);

  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(w * 0.55, h * 0.78, w * 0.45, h * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  drawSilhouettePlayer(ctx, w, h, t);
  drawSilhouetteEnemy(ctx, w, h, bgKey, t);
}

function drawSilhouettePlayer(ctx, w, h, t) {
  const bx = w * 0.02;
  const by = h * 0.95;
  ctx.save();
  ctx.translate(bx, by);
  ctx.fillStyle = "#2a1f18";
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(-40, -h * 0.38);
  ctx.quadraticCurveTo(-20, -h * 0.42, 30, -h * 0.48);
  ctx.lineTo(120, -h * 0.35);
  ctx.lineTo(160, -h * 0.15);
  ctx.lineTo(175, 0);
  ctx.closePath();
  ctx.fill();

  const sway = Math.sin(t * 1.2) * 3;
  ctx.fillStyle = "#4a3a2a";
  ctx.beginPath();
  ctx.moveTo(55 + sway, -h * 0.08);
  ctx.lineTo(95 + sway, -h * 0.22);
  ctx.lineTo(108 + sway, -h * 0.2);
  ctx.lineTo(85 + sway, -h * 0.02);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1a1410";
  ctx.fillRect(72 + sway, -h * 0.12, 28, 14);
  ctx.strokeStyle = "#6b5344";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(98 + sway, -h * 0.105, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#5c4a38";
  ctx.fillRect(65 + sway, -h * 0.06, 38, 8);

  ctx.fillStyle = "#8b7355";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(48 + i * 7 + sway, -h * 0.03, 4, 4);
  }

  ctx.fillStyle = "rgba(40,35,28,0.45)";
  ctx.beginPath();
  ctx.ellipse(190, -20, w * 0.25, h * 0.08, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSilhouetteEnemy(ctx, w, h, bgKey, t) {
  const ex = w * 0.58;
  const ey = h * 0.72;
  const shirt =
    bgKey === "saloon"
      ? "#6b4424"
      : bgKey === "night"
        ? "#2e3440"
        : bgKey === "mine"
          ? "#5c4a38"
          : "#4a5840";

  ctx.save();
  ctx.translate(ex, ey);

  ctx.fillStyle = "#2e2a26";
  ctx.fillRect(-22, -95, 44, 10);
  ctx.beginPath();
  ctx.arc(0, -118, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = shirt;
  ctx.fillRect(-16, -90, 32, 55);
  ctx.fillStyle = "#3d3630";
  ctx.fillRect(-18, -40, 36, 45);

  const bob = Math.sin(t * 1.8) * 2;
  ctx.strokeStyle = "#2a2520";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-32 + bob, -25);
  ctx.lineTo(-50 + bob, 5);
  ctx.moveTo(32 - bob, -25);
  ctx.lineTo(50 - bob, 5);
  ctx.stroke();

  ctx.fillStyle = "#2a1f18";
  ctx.fillRect(10, -32, 6, 18);
  ctx.fillRect(-16, -32, 6, 18);
  ctx.restore();
}

function drawAtmosphere(ctx, w, h, bgKey, t) {
  const vig = ctx.createRadialGradient(w * 0.5, h * 0.45, w * 0.15, w * 0.5, h * 0.5, w * 0.72);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(25,18,14,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  const bottomFade = ctx.createLinearGradient(0, h * 0.52, 0, h);
  bottomFade.addColorStop(0, "rgba(0,0,0,0)");
  bottomFade.addColorStop(1, "rgba(35,28,22,0.92)");
  ctx.fillStyle = bottomFade;
  ctx.fillRect(0, 0, w, h);

  if (bgKey === "mine") {
    ctx.fillStyle = "rgba(110,98,82,0.15)";
    ctx.fillRect(0, 0, w, h);
  } else if (bgKey === "night") {
    ctx.fillStyle = "rgba(30,42,74,0.25)";
    ctx.fillRect(0, 0, w, h);
  }

  ctx.fillStyle = "rgba(245,228,190,0.03)";
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(((t * 40 + i * 97) % (w + 20)) - 10, ((i * 37) % (h - 80)) + 40, 2, (i % 3) + 2);
  }
}

function focusLine(duel, side) {
  if (duel.phase !== "prep") return "FOC —";
  if (side === "player") {
    const mark = duel.enemyMarked > 0 ? ` ◆×${duel.enemyMarked}` : "";
    const foc = duel.playerFocused ? " ✦" : "";
    return `FOC ${duel.playerFocus}/${duel.playerMaxFocus}${mark}${foc}`;
  }
  return `FOC ${duel.enemy.focus}/${duel.enemy.maxFocus}`;
}

function drawHud(ctx, w, h, game) {
  if (!game.duel) return;
  const { run } = game;
  const duel = game.duel;
  const ehp = duel.enemy.hp;
  const em = duel.enemy.maxHp;
  const { player: Pv, enemy: Ev } = duelDisplayedVolleyPreview(duel, run);
  const pAcc = Math.round(Pv.acc * 100);
  const eAcc = Math.round(Ev.acc * 100);
  const pSta = focusLine(duel, "player");
  const eSta = focusLine(duel, "enemy");

  const boxW = Math.min(w * 0.44, 400);
  const boxH = 118;
  const lx = 10;
  const rx = w - boxW - 10;

  ctx.save();
  ctx.textBaseline = "top";

  roundRect(ctx, lx, 10, boxW, boxH, 8);
  ctx.fillStyle = "rgba(14,10,8,0.82)";
  ctx.fill();
  ctx.strokeStyle = "#c4a574";
  ctx.lineWidth = 2;
  ctx.stroke();

  roundRect(ctx, rx, 10, boxW, boxH, 8);
  ctx.fillStyle = "rgba(14,10,8,0.82)";
  ctx.fill();
  ctx.strokeStyle = "#c4a574";
  ctx.stroke();

  ctx.fillStyle = "#f0e6d8";
  ctx.textAlign = "left";
  ctx.font = "700 13px Georgia, serif";
  ctx.fillText("YOU", lx + 14, 20);
  ctx.font = "11px monospace";
  ctx.fillStyle = "rgba(232,218,196,0.92)";
  ctx.fillText(`${pSta} · ACC ${pAcc}% · VOLLEY ×${Pv.bullets}`, lx + 14, 40);
  ctx.font = "10px monospace";
  ctx.fillStyle = "rgba(200,184,164,0.75)";
  const pDmg = Pv.damageMult !== 1 ? `Dmg ×${Pv.damageMult.toFixed(2)} · ` : "";
  ctx.fillText(`${pDmg}HP ${Math.max(0, run.hp | 0)} / ${run.maxHp}`, lx + 14, 56);

  ctx.textAlign = "right";
  ctx.fillStyle = "#f0e6d8";
  ctx.font = "700 13px Georgia, serif";
  ctx.fillText("OUTLAW", rx + boxW - 14, 20);
  ctx.font = "11px monospace";
  ctx.fillStyle = "rgba(232,218,196,0.92)";
  ctx.fillText(`${eSta} · ACC ${eAcc}% · VOLLEY ×${Ev.bullets}`, rx + boxW - 14, 40);
  ctx.font = "10px monospace";
  ctx.fillStyle = "rgba(200,184,164,0.75)";
  const eDmg = Ev.damageMult !== 1 ? `Dmg ×${Ev.damageMult.toFixed(2)} · ` : "";
  ctx.fillText(`${eDmg}HP ${Math.max(0, ehp | 0)} / ${em}`, rx + boxW - 14, 56);

  const barYW = 88;
  const barH = 9;
  const barMaxW = boxW - 28;
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  roundRect(ctx, lx + 14, barYW, barMaxW, barH, 3);
  ctx.fill();
  ctx.fillStyle = "#5c2424";
  roundRect(ctx, lx + 14, barYW, Math.max(0, barMaxW * Math.max(0, run.hp / run.maxHp)), barH, 3);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  roundRect(ctx, rx + 14, barYW, barMaxW, barH, 3);
  ctx.fill();
  ctx.fillStyle = "#6b3828";
  roundRect(ctx, rx + 14, barYW, Math.max(0, barMaxW * Math.max(0, ehp / em)), barH, 3);
  ctx.fill();

  ctx.restore();
}

function drawStatGlows(ctx, w, h, game) {
  const pulse = game.statPulse;
  if (!pulse || (!pulse.player && !pulse.enemy)) return;
  const boxW = Math.min(w * 0.44, 400);
  const boxH = 118;
  const lx = 10;
  const rx = w - boxW - 10;

  const drawGlow = (intensity, kind, bx) => {
    if (intensity < 0.04) return;
    ctx.save();
    const debuff = kind === "debuff";
    ctx.shadowBlur = 10 + intensity * 22;
    ctx.shadowColor = debuff ? "rgba(235,72,92,0.95)" : "rgba(250,206,132,0.9)";
    ctx.strokeStyle = debuff
      ? `rgba(240,85,105,${0.35 + 0.55 * intensity})`
      : `rgba(255,220,140,${0.4 + 0.5 * intensity})`;
    ctx.lineWidth = 3 + intensity * 5;
    roundRect(ctx, bx - 3, 7, boxW + 6, boxH + 6, 10);
    ctx.stroke();
    ctx.restore();
  };

  ctx.save();
  drawGlow(pulse.player || 0, pulse.playerKind || "buff", lx);
  drawGlow(pulse.enemy || 0, pulse.enemyKind || "buff", rx);
  ctx.restore();
}

function drawCombatFloats(ctx, w, h, game) {
  const floats = game.combatFloats;
  if (!floats?.length) return;
  for (const f of floats) {
    const t = f.age / f.max;
    if (t >= 1) continue;
    const alpha = Math.min(1, t * 4) * (1 - t);
    const xBase = f.targetSide === "player" ? w * 0.2 : w * 0.78;
    const y = h * 0.68 - f.age * 42;
    const x = xBase + (f.xOff || 0);
    const buff = f.kind !== "debuff";
    ctx.save();
    ctx.font = "700 12px monospace";
    ctx.textAlign = "center";
    ctx.strokeStyle = `rgba(14,10,10,${alpha * 0.9})`;
    ctx.lineWidth = 3;
    ctx.strokeText(f.text, x, y);
    ctx.fillStyle = buff ? `rgba(255,226,156,${alpha})` : `rgba(255,130,136,${alpha})`;
    ctx.fillText(f.text, x, y);
    ctx.restore();
  }
}

function roundRect(ctx, x, y, wid, hei, r) {
  if (wid <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + wid - r, y);
  ctx.quadraticCurveTo(x + wid, y, x + wid, y + r);
  ctx.lineTo(x + wid, y + hei - r);
  ctx.quadraticCurveTo(x + wid, y + hei, x + wid - r, y + hei);
  ctx.lineTo(x + r, y + hei);
  ctx.quadraticCurveTo(x, y + hei, x, y + hei - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawHighNoon(ctx, w, h, remain) {
  const pulse = 1 + Math.sin(performance.now() * 0.012) * 0.06;
  ctx.save();
  ctx.translate(w * 0.5, h * 0.32);
  ctx.scale(pulse, pulse);
  ctx.textAlign = "center";
  ctx.font = "bold 48px Georgia, serif";
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillText("HIGH NOON", 5, 5);
  ctx.fillStyle = "#f4d98a";
  ctx.fillText("HIGH NOON", 0, 0);
  ctx.font = "22px Georgia, serif";
  ctx.fillStyle = "#2a1f18";
  ctx.fillText("☆", 0, -38);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(240,232,218,0.95)";
  ctx.font = "15px monospace";
  ctx.fillText(`${remain.toFixed(1)}`, w * 0.5, h * 0.48);

  ctx.strokeStyle = "rgba(212,169,116,0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.5, h * 0.22 + (1 - remain / 2.4) * 12, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFx(ctx, w, h, game, t) {
  const fx = game.muzzleFx;
  if (!fx?.length) return;
  for (const m of fx) {
    const life = 1 - m.age / m.max;
    if (life <= 0) continue;
    ctx.strokeStyle = `rgba(255,230,140,${life * 0.95})`;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(m.x0, m.y0);
    ctx.lineTo(m.x1, m.y1);
    ctx.stroke();
    ctx.fillStyle = `rgba(255,210,120,${life * 0.9})`;
    ctx.beginPath();
    ctx.arc(m.x0, m.y0, 8 + 4 * life, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,245,${life})`;
    ctx.beginPath();
    ctx.arc(m.x0, m.y0, 3 * life, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(180,40,40,${life * 0.55})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(m.x1, m.y1, 14 * life, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function tracerEndpoints(w, h, fromPlayer) {
  if (fromPlayer) {
    return {
      x0: w * 0.2,
      y0: h * 0.58,
      x1: w * 0.56 + (Math.random() - 0.5) * 24,
      y1: h * 0.38 + (Math.random() - 0.5) * 20,
    };
  }
  return {
    x0: w * 0.58,
    y0: h * 0.4,
    x1: w * 0.18 + (Math.random() - 0.5) * 32,
    y1: h * 0.55 + (Math.random() - 0.5) * 28,
  };
}

export function pushTracer(game, fromPlayer) {
  if (!game.muzzleFx) game.muzzleFx = [];
  const w = game.canvas.width;
  const h = game.canvas.height;
  const e = tracerEndpoints(w, h, fromPlayer);
  game.muzzleFx.push({
    ...e,
    age: 0,
    max: 26,
  });
}

export function tickFx(game, dt) {
  if (!game.muzzleFx) return;
  for (const m of game.muzzleFx) m.age += dt * 1000;
  game.muzzleFx = game.muzzleFx.filter((m) => m.age < m.max);
}
