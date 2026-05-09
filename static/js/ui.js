import { OPPONENTS } from "./opponents.js";
import { getCardDef } from "./cards.js";
import { CARD_DEFINITIONS } from "./cards.js";

const panel = () => document.getElementById("panel");
const hudRun = () => document.getElementById("hud-run");
const hudHealth = () => document.getElementById("hud-health");

/** @type {Record<string,string>} */
const RIBBON_LABEL = {
  gun: "Iron",
  attack: "Trick",
  feat: "Grit",
  character: "Legend",
};

function accentLine(def) {
  const t = def.type;
  if (t === "gun") return "Chamber these modifiers for High Noon.";
  if (t === "attack") return "Weaken the outlaw before the bells ring.";
  if (t === "feat") return "One duel only — burns bright.";
  return "Keeps for the whole trail.";
}

export function updateHud(game) {
  if (hudRun()) hudRun().textContent = `Bounty: $${game.run.money | 0}`;
  if (hudHealth()) hudHealth().textContent = `${game.run.hp | 0} / ${game.run.maxHp} HP`;
}

export function renderWanted(game, onPick) {
  const el = panel();
  el.className = "panel";
  el.innerHTML = `<h2>Wanted Board</h2><p>Pick a soul to send to judgment.</p><div class="wanted-grid"></div>`;
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
    const typeClass = typeToClass(c.type);
    const price = 8 + (c.cost || 0) * 3;
    b.type = "button";
    b.className = `shop-card hand-card-${c.type}`;
    b.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${RIBBON_LABEL[c.type] ?? c.type}</span>
        <span class="card-cost">${c.cost}</span>
        <span class="card-name-text">${c.name}</span>
        <span class="card-rule">${accentLine(c)} — <strong>$${price}</strong></span>
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

function buildCardHtml(def) {
  return `
    <span class="hand-card-inner">
      <span class="card-ribbon">${RIBBON_LABEL[def.type] ?? def.type}</span>
      <span class="card-cost">free</span>
      <span class="card-name-text">${def.name}</span>
      <span class="card-rule">${def.flavorText ?? accentLine(def)}</span>
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
    const markStr = d.enemyMarked > 0 ? ` · Marked ◆×${d.enemyMarked}` : "";
    const focStr = d.playerFocused ? " · Focused ✦" : "";
    html += `<p>Round <strong>${d.prepRound}</strong>/3 · Focus <strong>${d.playerFocus}</strong>/${d.playerMaxFocus}${markStr}${focStr}</p>`;
    html += `<button class="btn" id="lock" ${d.playerLocked ? "disabled" : ""}>Lock In (Space)</button>`;
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
      card.innerHTML = `
        <span class="hand-card-inner">
          <span class="card-ribbon">${RIBBON_LABEL[def.type] ?? def.type}</span>
          <span class="card-cost">${def.cost}</span>
          <span class="card-name-text">${def.name}</span>
          <span class="card-rule">${accentLine(def)}</span>
        </span>`;
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
