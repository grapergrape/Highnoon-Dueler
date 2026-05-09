import { OPPONENTS } from "./opponents.js";
import { getCardDef } from "./cards.js";
import { CARD_DEFINITIONS } from "./cards.js";
import { getClass } from "./classes.js";

const panel = () => document.getElementById("panel");
const hudRun = () => document.getElementById("hud-run");
const hudHealth = () => document.getElementById("hud-health");
const hudClass = () => document.getElementById("hud-class");

/** @type {Record<string,string>} */
const RIBBON_LABEL = {
  gun: "Iron",
  attack: "Trick",
  feat: "Grit",
  character: "Legend",
};

function pct(v) { return `${Math.round((v ?? 0) * 100)}%`; }

function effectToText(raw) {
  const m = raw.match(/^([a-zA-Z_]+)([+-]\d+(?:\.\d+)?)?$/);
  if (!m) return null;
  const kind = m[1];
  const numStr = m[2];
  const v = numStr ? (numStr.includes('.') ? parseFloat(numStr) : parseInt(numStr, 10)) : null;
  switch (kind) {
    case 'bullets': return v > 0 ? `+${v} bullets` : `${v} bullets`;
    case 'damage': return v > 0 ? `+${v} damage` : `${v} damage`;
    case 'accShootout': return v > 0 ? `+${pct(v)} accuracy` : `${pct(v)} accuracy`;
    case 'accGlobal': return v > 0 ? `+${pct(v)} acc (perm)` : `${pct(v)} acc (perm)`;
    case 'enemyAccNext': return `Foe −${pct(-v)} accuracy`;
    case 'enemyBullets': return v < 0 ? `Foe ${v} bullets` : `Foe +${v} bullets`;
    case 'pierce': return 'Piercing shots';
    case 'ricochet': return 'Ricochet on hit';
    case 'healNow': return `Heal +${v} HP now`;
    case 'hpAfterShootout': return v < 0 ? `${v} HP after volley` : `+${v} HP after volley`;
    case 'hpAfterCycle': return v < 0 ? `${v} HP on lock-in` : `+${v} HP on lock-in`;
    case 'focusCycle': return `+${v} focus next cycle`;
    case 'gainFocused': return 'Gain Focused ✦';
    case 'markEnemy': return `Mark foe ×${v}`;
    case 'markBurst': return `+${v} dmg per mark`;
    case 'focusBonusBullets': return `+${v} bullets if Focused`;
    case 'focusBonusAcc': return `+${pct(v)} acc if Focused`;
    case 'firstHitsAuto': return `First ${v} shots auto-hit`;
    case 'dodgeRecv': return `${pct(v)} dodge chance`;
    case 'returnBulletOnHit': return `Return ${v} bullet/hit`;
    case 'damageShootout': return v > 0 ? `+${pct(v)} volley dmg` : `${pct(v)} volley dmg`;
    case 'maxHp': return v > 0 ? `+${v} max HP` : `${v} max HP`;
    case 'healPerDuel': return `+${v} HP per duel`;
    case 'deadeye': return 'Crit shots (Deadeye)';
    case 'damageTaken': return `−${Math.abs(v)} dmg taken`;
    case 'focusPerRound': return `+${v} focus/round`;
    case 'staminaPerRound': return `+${v} focus/round`;
    case 'staredownOnly': return null;
    default: return raw;
  }
}

function classifyEffect(raw) {
  if (raw.startsWith('enemy') || raw.startsWith('markEnemy')) return 'enemy';
  if (raw.startsWith('markBurst')) return 'pos';
  if (raw.match(/^(hpAfterShootout|hpAfterCycle|maxHp|bullets|damage|accShootout)-/)) return 'neg';
  return 'pos';
}

function buildEffectsHtml(def) {
  const lines = [];
  for (const raw of def.effects ?? []) {
    const text = effectToText(raw);
    if (!text) continue;
    const cls = classifyEffect(raw);
    lines.push(`<span class="card-eff card-eff-${cls}">${text}</span>`);
  }
  if (!lines.length) return '';
  return `<span class="card-effects">${lines.join('')}</span>`;
}

export function updateHud(game) {
  if (hudRun()) hudRun().textContent = `Bounty: $${game.run.money | 0}`;
  if (hudHealth()) hudHealth().textContent = `${game.run.hp | 0} / ${game.run.maxHp} HP`;
  const chip = hudClass();
  if (chip) {
    const cls = getClass(game.run.classId);
    if (!cls || !game.run.classId) {
      chip.textContent = "";
      chip.style.borderColor = "";
      return;
    }
    chip.textContent = `${cls.name} — ${cls.abilityName}`;
    chip.title = cls.abilityBlurb;
    chip.style.setProperty("--tint", cls.portraitTint);
  }
}

export function renderWanted(game, onPick) {
  const el = panel();
  el.className = "panel";
  const cls = getClass(game.run.classId);
  const head = cls
    ? `<div class="wanted-class-summary" style="--tint:${cls.portraitTint}">
        <strong>${cls.name}</strong> · <em>${cls.title}</em>
        <span>${cls.abilityBlurb}</span>
      </div>` : "";
  el.innerHTML = `${head}<h2>Wanted Board</h2><p>Pick a soul to send to judgment.</p><div class="wanted-grid"></div>`;
  const g = el.querySelector(".wanted-grid");
  for (const o of OPPONENTS) {
    const d = document.createElement("div");
    d.className = "poster";
    d.innerHTML = `<h3>${o.name}</h3><p><em>${o.title}</em></p><p>${o.backstory.slice(0, 120)}…</p><p><strong>HP</strong> ${o.maxHp}</p>`;
    d.onclick = () => onPick(o.id);
    g.appendChild(d);
  }
}

function shopPool(game) {
  const owned = new Set(game.run.deckIds);
  return CARD_DEFINITIONS.filter((c) => c.type !== "gun" && !owned.has(c.id)).slice(0, 24);
}

export function renderShop(game, onBuyCard, onHeal, onGun, onContinue) {
  const el = panel();
  el.className = "panel";
  const pool = shuffle([...shopPool(game)]).slice(0, 5);
  el.innerHTML = `<h2>Merchant</h2><p>Spend your bounty. Health does not refill between fights.</p>
    <p>Wallet: <strong>$${game.run.money}</strong></p>
    <div class="shop-list" id="shop-cards"></div>
    <button class="btn" id="heal">Whiskey ($12) +20 HP</button>
    <button class="btn" id="gun">Schofield ($45)</button>
    <button class="btn" id="done">Ride On</button>`;

  const sc = el.querySelector("#shop-cards");
  for (const c of pool) {
    const b = document.createElement("button");
    const price = 8 + (c.cost || 0) * 3;
    b.type = "button";
    b.className = `shop-card hand-card-${c.type}`;
    b.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${RIBBON_LABEL[c.type] ?? c.type} — $${price}</span>
        <span class="card-cost">${c.cost}</span>
        <span class="card-name-text">${c.name}</span>
        ${buildEffectsHtml(c)}
      </span>`;
    b.onclick = () => onBuyCard(c.id, price);
    sc.appendChild(b);
  }
  el.querySelector("#heal").onclick = onHeal;
  el.querySelector("#gun").onclick = onGun;
  el.querySelector("#done").onclick = onContinue;
}

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

function fillBattleLog(container, duel) {
  if (!container) return;
  container.replaceChildren();
  for (const e of duel.playLog ?? []) {
    const row = document.createElement("div");
    if (e.kind === "bulletin") {
      row.className = "log-line log-bulletin";
      row.textContent = e.text;
    } else {
      row.className = `log-line log-card ${e.actor === "you" ? "log-you" : "log-outlaw"}`;
      const label = RIBBON_LABEL[e.cardType] ?? e.cardType ?? "?";
      const who = e.actor === "you" ? "You" : duel.opponentDef.name;
      row.textContent = `${who} — ${e.name} (${label})`;
    }
    container.appendChild(row);
  }
  queueMicrotask(() => {
    container.scrollTop = container.scrollHeight;
  });
}

function buildCardHtml(def, costLabel = 'free') {
  return `
    <span class="hand-card-inner">
      <span class="card-ribbon">${RIBBON_LABEL[def.type] ?? def.type}</span>
      <span class="card-cost">${costLabel}</span>
      <span class="card-name-text">${def.name}</span>
      ${def.flavorText ? `<span class="card-flavor">${def.flavorText}</span>` : ''}
      ${buildEffectsHtml(def)}
    </span>`;
}

export function renderDuelPanel(game, onPlayCard, onLockIn, onCommitStaredown) {
  const el = panel();
  const d = game.duel;
  if (!d) return;
  el.className = "panel panel-duel";
  let html = `<h3>${d.message}</h3>`;
  html += `<div class="battle-log-wrap">
    <div class="battle-log-title">Sheriff's ledger</div>
    <div class="battle-log" id="battle-log" role="log" aria-live="polite" aria-relevant="additions"></div>
  </div>`;

  if (d.phase === "staredown_commit") {
    html += `<div class="staredown-panel">
      <p class="staredown-desc">Before the prep — commit one card face-down. It resolves <em>before</em> the shootout, free of cost.</p>
      <div class="card-row" id="staredown-choices"></div>
    </div>`;
  } else if (d.phase === "staredown_reveal") {
    const pDef = d.playerStaredown ? getCardDef(d.playerStaredown.id) : null;
    const eDef = d.enemyStaredown ? getCardDef(d.enemyStaredown.id) : null;
    html += `<div class="staredown-panel staredown-reveal">
      <div class="staredown-sides">
        <div class="staredown-side">
          <div class="staredown-side-label">Your card</div>
          ${pDef ? `<div class="hand-card hand-card-${pDef.type}">${buildCardHtml(pDef)}</div>` : "<em>—</em>"}
        </div>
        <div class="staredown-vs">⚔</div>
        <div class="staredown-side">
          <div class="staredown-side-label">${d.opponentDef.name}</div>
          ${eDef ? `<div class="hand-card hand-card-${eDef.type}">${buildCardHtml(eDef)}</div>` : "<em>Nothing</em>"}
        </div>
      </div>
    </div>`;
  } else if (d.phase === "prep") {
    const markStr = d.enemyMarked > 0 ? `<span class="status-tag status-mark">◆ Marked ×${d.enemyMarked}</span>` : "";
    const focStr = d.playerFocused ? `<span class="status-tag status-focused">✦ Focused</span>` : "";
    const focPips = Array.from({ length: d.playerMaxFocus }, (_, i) =>
      `<span class="focus-pip${i < d.playerFocus ? ' filled' : ''}"></span>`
    ).join('');
    html += `<div class="prep-bar">
      <span class="prep-round">Round ${d.prepRound}/3</span>
      <span class="focus-bar" title="Focus: ${d.playerFocus}/${d.playerMaxFocus}">${focPips}</span>
      <span class="focus-label">${d.playerFocus}/${d.playerMaxFocus} focus</span>
      ${markStr}${focStr}
      <button class="btn btn-lockin" id="lock" ${d.playerLocked ? "disabled" : ""}>Lock In</button>
    </div>`;
    html += `<div class="card-row" id="hand"></div>`;
  } else if (d.phase === "highnoon") {
    html += `<p>Steel sings across the dust…</p>`;
  } else if (d.phase === "ended") {
    html += `<p><strong>${d.winner === "player" ? "You survived." : "You died."}</strong></p>`;
  }

  el.innerHTML = html;
  fillBattleLog(el.querySelector("#battle-log"), d);

  if (d.phase === "staredown_commit") {
    const row = el.querySelector("#staredown-choices");
    if (row) {
      for (const c of d.staredownChoices) {
        const def = getCardDef(c.id);
        if (!def) continue;
        const card = document.createElement("div");
        card.className = `hand-card hand-card-${def.type} staredown-choice`;
        card.innerHTML = buildCardHtml(def);
        card.onclick = () => onCommitStaredown(c.uid);
        row.appendChild(card);
      }
    }
  } else if (d.phase === "prep" && !d.playerLocked) {
    const row = el.querySelector("#hand");
    for (const c of d.playerHand) {
      const def = getCardDef(c.id);
      if (!def) continue;
      const card = document.createElement("div");
      const affordable = def.cost <= d.playerFocus;
      card.className = `hand-card hand-card-${def.type}${affordable ? "" : " disabled"}`;
      card.innerHTML = buildCardHtml(def, def.cost);
      if (affordable) {
        card.onclick = () => onPlayCard(c.uid);
      }
      row.appendChild(card);
    }
    const lock = el.querySelector("#lock");
    if (lock) lock.onclick = () => onLockIn();
  }
}

export function renderGameOver(game, onRestart) {
  const el = panel();
  el.className = "panel panel-gameover";
  el.innerHTML = `<h2>Game Over</h2><p>The desert keeps your coin.</p>
    <p class="game-over-wait">Back to Wanted Board shortly… Press below to ride now.</p>
    <button class="btn" id="rs">Return now</button>`;
  el.querySelector("#rs").onclick = onRestart;
}
