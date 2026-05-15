import { OPPONENTS, TOWNS } from "../data/opponents.js";
import { CARD_DEFINITIONS, effectsForCardLevel, getCardDef } from "../data/cards.js";
import { getClass, CLASSES } from "../data/classes.js";
import { gunsForClass, getGun } from "../data/guns.js";
import { getClassShowdownProgress, isShowdownUnlockedForClass } from "../app/unlock-state.js";

const RARITY_PRICE = { common: 25, uncommon: 40, rare: 65, epic: 110, legendary: 180 };

/** Hover-friendly description for an effect token. Used by .card-eff tooltips. */
const EFFECT_TOOLTIPS = {
  bullets: "Adds bullets to your shootout volley. More shots fired in High Noon.",
  damage: "Flat damage added to every successful hit.",
  accShootout: "Accuracy modifier applied during the shootout.",
  accGlobal: "Permanent accuracy modifier carried for the rest of the run.",
  enemyAccNext: "Reduces the enemy's accuracy on the next shootout only.",
  enemyBullets: "Reduces the enemy's bullet count on the next shootout only.",
  pierce: "Shots ignore enemy damage reduction (pierce armor).",
  ricochet: "30% chance per hit for a half-damage ricochet.",
  healNow: "Heal HP immediately.",
  hpAfterShootout: "HP change applied after every volley while this gun is equipped.",
  hpAfterCycle: "HP change applied when you Lock In this prep round.",
  focusCycle: "Bonus focus on the next prep round only.",
  gainFocused: "Enter the Focused state for the next shootout (synergy bonuses).",
  markEnemy: "Place mark tokens on the enemy. Marks amplify markBurst damage.",
  markBurst: "Each enemy mark adds this much damage to your hits.",
  focusBonusBullets: "While Focused: extra bullets in the next volley.",
  focusBonusAcc: "While Focused: extra accuracy in the next volley.",
  firstHitsAuto: "The first N shots of your volley automatically hit.",
  dodgeRecv: "Chance to dodge each incoming shot.",
  returnBulletOnHit: "Each hit returns this many bullets to your volley.",
  damageShootout: "Volley damage multiplier (additive percent).",
  maxHp: "Increases your maximum HP for the rest of the run.",
  healPerDuel: "Heal at the start of each duel.",
  deadeye: "Critical hits: ~15% of hits deal 30% bonus damage.",
  damageTaken: "Reduce incoming damage from each enemy hit.",
  focusPerRound: "Extra focus available each prep round.",
  staminaPerRound: "Extra focus each prep round (legacy term).",
  extraMarkPerApply: "When you apply marks, add this many extra marks.",
  markBulletPerMark: "At shootout, add this many bullets per mark on the enemy.",
  damagePerHp: "At shootout, gain +1 damage per N current HP.",
  spirit: "Gain Spirit (cap 10). Spirit scales spirit-based effects.",
  spiritScaleAcc: "At shootout, +acc per Spirit point.",
  spiritScaleDamage: "At shootout, +volley damage per Spirit point.",
  spiritScaleEnemyAcc: "Reduce enemy accuracy on next volley scaled by Spirit.",
  payHp: "Spend HP to play this card. Refused if it would be lethal.",
  comboBonus: "Bonus effect — triggers if 2+ outlaw cards play in the same prep round.",
  nextComboFree: "Your next outlaw combo card costs 0 focus until you play one.",
  elDoble: "Mirror your active gun into the off-hand. Triple-stack if already dual.",
  removeDualPenalty: "Removes the dual-wield accuracy penalty for this duel.",
  spiritDoubleNext: "All Spirit-scaling effects double for the next shootout.",
  extraVolleyShots: "Per combo trigger this duel, +N bonus shootout shots.",
  dualWieldAccPenaltyReduce: "Reduce the dual-wield accuracy penalty.",
  respectCapSet: "Set your Respect cap to at least this value for the run.",
};

function tooltipForEffect(raw) {
  const m = raw.match(/^([a-zA-Z_]+)/);
  if (!m) return null;
  return EFFECT_TOOLTIPS[m[1]] ?? null;
}

const panel = () => document.getElementById("panel");
const hudRun = () => document.getElementById("hud-run");
const hudHealth = () => document.getElementById("hud-health");
const hudClass = () => document.getElementById("hud-class");

/** @type {Record<string,string>} */
const RIBBON_LABEL = {
  gun: "Gun",
  feat: "Feat",
  stance: "Stance",
  showdown: "Showdown",
};

const ROLE_LABEL = {
  easy: "Easy",
  medium: "Medium",
  boss: "Boss",
};

function pct(v) { return `${Math.round((v ?? 0) * 100)}%`; }

function sheriffCurrentHpAccBonus(run) {
  if (run?.classId !== "sheriff") return 0;
  const threshold = run?.permanent?.highHpAccThreshold ?? 100;
  const perHp = run?.permanent?.highHpAccPerHp ?? 0.03;
  const cap = run?.permanent?.highHpAccMax ?? 0.35;
  const above = Math.max(0, Math.floor((run?.hp ?? 0) - threshold));
  if (above <= 0) return 0;
  return Math.min(Math.max(0, cap), above * Math.max(0, perHp));
}

function effectToText(raw) {
  if (raw.startsWith("comboBonus:")) {
    const inner = effectToText(raw.slice("comboBonus:".length));
    return inner ? `Combo: ${inner}` : null;
  }
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
    case 'extraMarkPerApply': return `+${v} mark per Mark apply`;
    case 'markBulletPerMark': return `+${v} bullet per mark`;
    case 'damagePerHp': return `+1 dmg per ${v} HP`;
    case 'spirit': return v > 0 ? `+${v} Spirit ✦` : `${v} Spirit`;
    case 'spiritScaleAcc': return `+${pct(v)} acc / Spirit`;
    case 'spiritScaleDamage': return `+${pct(v)} dmg / Spirit`;
    case 'spiritScaleEnemyAcc': return `Foe ${pct(v)} acc / Spirit`;
    case 'payHp': return `Pay ${v} HP`;
    case 'extraVolleyShots': return `+${v} shot / combo`;
    case 'staredownOnly': return null;
    case 'nextComboFree': return 'Next combo card free until played';
    case 'elDoble': return 'El Doble: mirror or triple-stack';
    case 'removeDualPenalty': return 'Clears dual-wield penalty';
    case 'spiritDoubleNext': return 'Double Spirit scaling';
    case 'outlawCombo': return null;
    case 'dualWieldAccPenaltyReduce': return `−${pct(v)} dual penalty`;
    case 'firstCycleAccPenalty': return `−${pct(v)} acc on cycle 1`;
    case 'respectCapSet': return `Respect cap set to ${v}`;
    case 'startGunSchofield': return 'Start with Schofield';
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
  for (const raw of effectsForCardLevel(def, def.showdownLevel || 1)) {
    const text = effectToText(raw);
    if (!text) continue;
    const cls = classifyEffect(raw);
    const tip = tooltipForEffect(raw);
    const tipAttr = tip ? ` title="${tip.replace(/"/g, '&quot;')}"` : '';
    lines.push(`<span class="card-eff card-eff-${cls}"${tipAttr}>${text}</span>`);
  }
  if (!lines.length) return '';
  return `<span class="card-effects">${lines.join('')}</span>`;
}

/** Render a compact "Drawn Iron" badge for an active gun. */
function buildActiveGunBadgeHtml(activeGun, label = "Drawn Iron") {
  if (!activeGun) {
    return `<div class="iron-badge iron-badge-empty"><span class="iron-badge-label">${label}</span><span class="iron-badge-name">— no iron drawn —</span></div>`;
  }
  const effHtml = buildEffectsHtml({ effects: activeGun.effects });
  const titleParts = [];
  if (activeGun.flavor) titleParts.push(activeGun.flavor);
  if (activeGun.backstory) titleParts.push(activeGun.backstory);
  const tipAttr = titleParts.length ? ` title="${titleParts.join(' — ').replace(/"/g, '&quot;')}"` : '';
  return `<div class="iron-badge iron-rarity-${activeGun.rarity}"${tipAttr}>
    <span class="iron-badge-label">${label}</span>
    <span class="iron-badge-name">${activeGun.name}</span>
    ${effHtml}
  </div>`;
}

function buildPersistentRowHtml(d) {
  const stances = d.playerStances ?? [];
  const stanceHtml = stances.length
    ? stances.map((s) => `<span class="persistent-chip persistent-stance">${s.name}</span>`).join("")
    : `<span class="persistent-empty">No stance held</span>`;
  const showdown = d.playerShowdown
    ? `<span class="persistent-chip persistent-showdown">${d.playerShowdown.name} · Level ${d.playerShowdownLevel || 1}</span>`
    : `<span class="persistent-empty">No showdown</span>`;
  return `<div class="persistent-row">
    <div class="persistent-group"><span class="persistent-label">Stances</span>${stanceHtml}</div>
    <div class="persistent-group"><span class="persistent-label">Showdown</span>${showdown}</div>
  </div>`;
}

export function updateHud(game) {
  if (!game.run) {
    if (hudRun()) hudRun().textContent = `Bounty: —`;
    if (hudHealth()) hudHealth().textContent = `— HP`;
    return;
  }
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
  const currentTownOrder = Number.isFinite(game.run.currentTownOrder)
    ? Math.min(TOWNS.length, Math.max(1, Math.round(game.run.currentTownOrder)))
    : 1;
  const currentTown = TOWNS.find((t) => t.order === currentTownOrder) ?? TOWNS[0];
  const defeated = new Set(Array.isArray(game.run.defeatedOpponentIds) ? game.run.defeatedOpponentIds : []);
  const bossByTownOrder = new Map(
    OPPONENTS.filter((o) => o.role === "boss").map((o) => [o.townOrder, o])
  );
  const lockReasonForTown = (townOrder) => {
    const previousBoss = bossByTownOrder.get(townOrder - 1);
    return previousBoss
      ? `Defeat ${previousBoss.name}, the Town ${townOrder - 1} boss, to unlock this town`
      : "Defeat the previous town boss to unlock this town";
  };
  const defeatedBossOrders = new Set(
    OPPONENTS.filter((o) => o.role === "boss" && defeated.has(o.id)).map((o) => o.townOrder)
  );
  const head = cls
    ? `<div class="wanted-class-summary" style="--tint:${cls.portraitTint}">
        <strong>${cls.name}</strong> · <em>${cls.title}</em>
        <span>${cls.abilityBlurb}</span>
      </div>` : "";
  const townTrack = TOWNS.map((town) => {
    const townOpps = OPPONENTS.filter((o) => o.townOrder === town.order);
    const defeatedCount = townOpps.filter((o) => defeated.has(o.id)).length;
    const isLockedTown = town.order > currentTownOrder;
    const clsNames = [
      "town-node",
      town.order === currentTownOrder ? "town-node-current" : "",
      defeatedBossOrders.has(town.order) ? "town-node-cleared" : "",
      isLockedTown ? "town-node-locked" : "",
    ].filter(Boolean).join(" ");
    return `<div class="${clsNames}">
      <span class="town-node-order">${town.order}</span>
      <span class="town-node-name">${town.name}</span>
      <span class="town-node-count">${defeatedCount}/3</span>
    </div>`;
  }).join("");
  el.innerHTML = `${head}
    <h2>Wanted Board</h2>
    <p>Pick a soul to send to judgment.</p>
    <div class="wanted-map">
      <div class="wanted-map-image">
        <img src="${currentTown.mapImage}" alt="${currentTown.name} trail map">
      </div>
      <div class="town-track">${townTrack}</div>
    </div>
    <div class="town-roster"></div>`;

  const roster = el.querySelector(".town-roster");
  for (const town of TOWNS) {
    const isLockedTown = town.order > currentTownOrder;
    const lockReason = isLockedTown ? lockReasonForTown(town.order) : "";
    const townStatus = isLockedTown
      ? `Locked — ${lockReason}`
      : town.order === currentTownOrder
        ? "Current trail stop"
        : defeatedBossOrders.has(town.order)
          ? "Boss defeated"
          : "Open bounty board";
    const townWrap = document.createElement("section");
    townWrap.className = [
      "town-group",
      town.order === currentTownOrder ? "town-group-current" : "",
      defeatedBossOrders.has(town.order) ? "town-group-cleared" : "",
      isLockedTown ? "town-group-locked" : "",
    ].filter(Boolean).join(" ");
    townWrap.innerHTML = `<header class="town-header">
      <div>
        <h3>${town.name}</h3>
        <p>${townStatus}</p>
      </div>
      <span class="town-order">Town ${town.order}</span>
    </header>
    <div class="wanted-grid"></div>`;

    const g = townWrap.querySelector(".wanted-grid");
    const townOpps = OPPONENTS
      .filter((o) => o.townOrder === town.order)
      .sort((a, b) => a.roleOrder - b.roleOrder);
    for (const o of townOpps) {
      const gun = getGun(o.gunId);
      const isDefeated = defeated.has(o.id);
      const d = document.createElement("button");
      d.type = "button";
      d.className = `poster wanted-poster role-${o.role}${isDefeated ? " poster-defeated" : ""}${isLockedTown ? " poster-locked" : ""}`;
      d.disabled = isLockedTown;
      if (isLockedTown) d.title = lockReason;
      d.innerHTML = `
        <span class="role-badge">${ROLE_LABEL[o.role]}</span>
        ${isLockedTown ? `<span class="locked-badge">Locked</span>` : ""}
        ${isDefeated ? `<span class="defeated-badge">Defeated</span>` : ""}
        <h3>${o.name}</h3>
        <p><em>${o.title}</em></p>
        ${isLockedTown ? `<p class="poster-lock-note">${lockReason}</p>` : ""}
        <p class="wanted-backstory">${o.backstory.slice(0, 150)}...</p>
        <div class="wanted-stat-row">
          <span><strong>HP</strong> ${o.maxHp}</span>
          <span><strong>Tier</strong> ${o.difficultyTier}</span>
        </div>
        <div class="wanted-stat-row">
          <span><strong>Focus</strong> ${o.focus}</span>
          <span><strong>Iron</strong> ${gun.name}</span>
        </div>`;
      if (!isLockedTown) d.onclick = () => onPick(o.id);
      g.appendChild(d);
    }
    roster.appendChild(townWrap);
  }
}

function shopCardPool(game) {
  const owned = new Set(game.run.deckIds);
  const classId = game.run.classId;
  const unlockState = game.unlocks;
  return CARD_DEFINITIONS.filter((c) =>
    c.type !== "gun" &&
    !c.opponentOnly &&
    !owned.has(c.id) &&
    (!c.classId || c.classId === classId) &&
    (
      c.type !== "showdown"
      || (
        !!c.classId
        && c.classId === classId
        && isShowdownUnlockedForClass(unlockState, classId, c.id)
      )
    )
  );
}

function shopGunPool(game) {
  const owned = new Set(game.run.deckIds);
  const classId = game.run.classId;
  return gunsForClass(classId).filter((g) => !owned.has(g.id));
}

export function rollShopInventory(game) {
  return {
    cardIds: shuffle([...shopCardPool(game)]).slice(0, 5).map((c) => c.id),
    gunIds: shuffle([...shopGunPool(game)]).slice(0, 4).map((g) => g.id),
    healUsed: false,
  };
}

function priceForCard(c) {
  return 8 + (c.cost || 0) * 3;
}

function priceForGun(g) {
  return RARITY_PRICE[g.rarity] ?? 40;
}

function ownedGunIdsInDeck(deckIds) {
  return deckIds.filter((id) => id.startsWith("gun_"));
}

function ownedNonGunIdsInDeck(deckIds) {
  return deckIds.filter((id) => !id.startsWith("gun_"));
}

export function renderShop(game, shopInventory, onBuyCard, onHeal, onContinue) {
  const el = panel();
  el.className = "panel";
  const offers = shopInventory ?? rollShopInventory(game);
  const healUsed = !!offers.healUsed;
  const cardPool = (offers.cardIds ?? [])
    .map((id) => getCardDef(id))
    .filter((c) => !!c && c.type !== "gun");
  const gunPool = (offers.gunIds ?? [])
    .map((id) => getGun(id))
    .filter(Boolean);
  const deckSize = game.run.deckIds.length;
  const atDeckCap = deckSize >= 24;

  el.innerHTML = `<h2>Merchant</h2><p>Spend your bounty. Health does not refill between fights.</p>
    <p>Wallet: <strong>$${game.run.money}</strong></p>
    <h3 class="shop-section-title">Guns <span class="shop-section-sub">(deck holds up to 2 extra guns)</span></h3>
    <div class="shop-list" id="shop-guns"></div>
    <h3 class="shop-section-title">Cards & Tricks <span class="shop-section-sub">(deck cap 24)</span></h3>
    ${atDeckCap ? `<p class="shop-empty"><em>Deck is full (${deckSize}/24). Buy a card to replace one non-gun card.</em></p>` : ''}
    <div class="shop-list" id="shop-cards"></div>
    <button class="btn" id="heal" ${healUsed ? "disabled" : ""}>${healUsed ? "Whiskey (Used)" : "Whiskey ($12) +20 HP"}</button>
    ${healUsed ? `<p class="hint">You can only buy whiskey once per merchant visit.</p>` : ""}
    <button class="btn" id="done">Ride On</button>`;

  const ironRow = el.querySelector("#shop-guns");
  for (const g of gunPool) {
    const price = priceForGun(g);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `shop-card hand-card-gun iron-rarity-${g.rarity}`;
    const cardDef = getCardDef(g.id);
    const back = g.backstory ? `<span class="card-flavor card-backstory">${g.backstory}</span>` : '';
    card.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${g.rarity.toUpperCase()} GUN — $${price}</span>
        <span class="card-cost">${g.cost}</span>
        <span class="card-name-text">${g.name}</span>
        <span class="card-flavor">${g.flavor ?? ''}</span>
        ${back}
        ${buildEffectsHtml(cardDef ?? { effects: g.effects })}
      </span>`;
    card.onclick = () => {
      const ownedGuns = ownedGunIdsInDeck(game.run.deckIds);
      if (ownedGuns.length >= 2) {
        promptReplaceGun(game, ownedGuns, (replaceId) => {
          if (replaceId) onBuyCard(g.id, price, { replaceGunId: replaceId });
        });
      } else {
        onBuyCard(g.id, price);
      }
    };
    ironRow.appendChild(card);
  }
  if (gunPool.length === 0) {
    ironRow.innerHTML = `<p class="shop-empty"><em>The blacksmith is out of iron today.</em></p>`;
  }

  const sc = el.querySelector("#shop-cards");
  for (const c of cardPool) {
    const b = document.createElement("button");
    const price = priceForCard(c);
    b.type = "button";
    b.className = `shop-card hand-card-${c.type}`;
    b.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${RIBBON_LABEL[c.type] ?? c.type} — $${price}</span>
        <span class="card-cost">${c.cost}</span>
        <span class="card-name-text">${c.name}</span>
        ${buildEffectsHtml(c)}
      </span>`;
    b.onclick = () => {
      if (atDeckCap) {
        const ownedCards = ownedNonGunIdsInDeck(game.run.deckIds);
        if (!ownedCards.length) return;
        promptReplaceCard(game, ownedCards, (replaceId) => {
          if (!replaceId) {
            renderShop(game, offers, onBuyCard, onHeal, onContinue);
            return;
          }
          onBuyCard(c.id, price, { replaceCardId: replaceId });
        });
        return;
      }
      onBuyCard(c.id, price);
    };
    sc.appendChild(b);
  }
  el.querySelector("#heal").onclick = onHeal;
  el.querySelector("#done").onclick = onContinue;
}

/** Modal-ish in-panel prompt for picking which gun to replace when at the 3-gun cap. */
function promptReplaceGun(game, ownedGunIds, cb) {
  const el = panel();
  const owned = ownedGunIds.map((id) => getGun(id)).filter(Boolean);
  el.innerHTML = `<h2>Holster One</h2>
    <p>Your deck already carries two extra guns. Choose one to leave behind:</p>
    <div class="shop-list" id="replace-guns"></div>
    <button class="btn" id="cancel-replace">Cancel</button>`;
  const row = el.querySelector("#replace-guns");
  for (const g of owned) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `shop-card hand-card-gun iron-rarity-${g.rarity}`;
    const cardDef = getCardDef(g.id);
    b.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${g.rarity.toUpperCase()} GUN</span>
        <span class="card-cost">${g.cost}</span>
        <span class="card-name-text">${g.name}</span>
        <span class="card-flavor">${g.flavor ?? ''}</span>
        ${buildEffectsHtml(cardDef ?? { effects: g.effects })}
      </span>`;
    b.onclick = () => cb(g.id);
    row.appendChild(b);
  }
  el.querySelector("#cancel-replace").onclick = () => cb(null);
}

function promptReplaceCard(game, ownedCardIds, cb, opts = {}) {
  const title = opts.title ?? "Deck Full";
  const description = opts.description ?? "Your deck is at the 24-card cap. Choose one non-gun card to leave behind:";
  const cancelLabel = opts.cancelLabel ?? "Cancel";
  const el = panel();
  el.innerHTML = `<h2>${title}</h2>
    <p>${description}</p>
    <div class="shop-list" id="replace-cards"></div>
    <button class="btn" id="cancel-replace">${cancelLabel}</button>`;
  const row = el.querySelector("#replace-cards");
  for (const cardId of ownedCardIds) {
    const c = getCardDef(cardId);
    if (!c || c.type === "gun") continue;
    const b = document.createElement("button");
    b.type = "button";
    b.className = `shop-card hand-card-${c.type}`;
    b.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${RIBBON_LABEL[c.type] ?? c.type}</span>
        <span class="card-cost">${c.cost}</span>
        <span class="card-name-text">${c.name}</span>
        ${buildEffectsHtml(c)}
      </span>`;
    b.onclick = () => cb(cardId);
    row.appendChild(b);
  }
  el.querySelector("#cancel-replace").onclick = () => cb(null);
}

export function renderPostDuelReward(game, reward, onTakeCard, onSkip) {
  const el = panel();
  el.className = "panel";
  const rewardCards = Array.isArray(reward.rewardCards) ? reward.rewardCards : [];
  const deckCap = Number.isFinite(reward.deckCap) ? reward.deckCap : 24;
  const deckSize = game.run.deckIds.length;
  const atDeckCap = deckSize >= deckCap;
  const opponentTitle = reward.opponentTitle ? `<em>${reward.opponentTitle}</em>` : "";
  const noRewards = rewardCards.length === 0;
  el.innerHTML = `<h2>Victory Reward</h2>
    <p>You defeated <strong>${reward.opponentName ?? "Outlaw"}</strong> ${opponentTitle}.</p>
    <p>Bounty earned: <strong>$${reward.bountyEarned | 0}</strong> · Run bounty: <strong>$${game.run.money | 0}</strong></p>
    <p>Choose one card reward or skip. ${atDeckCap ? `<em>Deck full (${deckSize}/${deckCap}): taking a card requires replacing a non-gun card.</em>` : ""}</p>
    <div class="shop-list" id="reward-cards"></div>
    <button class="btn" id="skip-reward">${noRewards ? "Continue to Merchant" : "Skip Reward"}</button>`;

  const rewardRow = el.querySelector("#reward-cards");
  for (const c of rewardCards) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `shop-card hand-card-${c.type}`;
    b.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${c.rarity.toUpperCase()} ${RIBBON_LABEL[c.type] ?? c.type}</span>
        <span class="card-cost">${c.cost}</span>
        <span class="card-name-text">${c.name}</span>
        ${buildEffectsHtml(c)}
      </span>`;
    b.onclick = () => {
      if (atDeckCap) {
        const ownedCards = ownedNonGunIdsInDeck(game.run.deckIds);
        if (!ownedCards.length) return;
        promptReplaceCard(
          game,
          ownedCards,
          (replaceId) => {
            if (!replaceId) {
              renderPostDuelReward(game, reward, onTakeCard, onSkip);
              return;
            }
            onTakeCard(c.id, { replaceCardId: replaceId });
          },
          {
            title: "Deck Full",
            description: "Your deck is at the 24-card cap. Choose one non-gun card to replace with this reward:",
          }
        );
        return;
      }
      onTakeCard(c.id);
    };
    rewardRow.appendChild(b);
  }

  if (noRewards) {
    rewardRow.innerHTML = `<p class="shop-empty"><em>No class rewards available. Ride to the merchant.</em></p>`;
  }
  el.querySelector("#skip-reward").onclick = onSkip;
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

function buildShootoutSummaryHtml(d) {
  const s = d.shootoutSummary;
  if (!s) return "";
  const youName = "You";
  const foeName = d.opponentDef?.name ?? "Outlaw";
  const sideHtml = (label, side) => {
    const shotsStr = side.shots.length
      ? side.shots.map(sh => {
          if (sh.outcome === "hit") {
            const extra = sh.ricochet ? ` <span class="shot-rico">+${sh.ricochet} rico</span>` : "";
            return `<li class="shot shot-hit"><span class="shot-i">#${sh.i}</span><span class="shot-out">HIT</span><span class="shot-dmg">${sh.dmg} dmg</span>${extra}</li>`;
          }
          if (sh.outcome === "dodged") {
            return `<li class="shot shot-dodge"><span class="shot-i">#${sh.i}</span><span class="shot-out">DODGED</span><span class="shot-dmg">—</span></li>`;
          }
          return `<li class="shot shot-miss"><span class="shot-i">#${sh.i}</span><span class="shot-out">MISS</span><span class="shot-dmg">—</span></li>`;
        }).join("")
      : `<li class="shot shot-empty"><em>No shots fired.</em></li>`;
    return `<div class="duel-summary-side">
      <h4>${label}</h4>
      <div class="duel-summary-stats">
        <span><strong>${side.bullets}</strong> bullets</span>
        <span class="stat-hit">${side.hits} hit</span>
        <span class="stat-miss">${side.misses} miss</span>
        ${side.dodged ? `<span class="stat-dodge">${side.dodged} dodged</span>` : ""}
        <span><strong>${side.damage}</strong> total dmg</span>
        <span class="stat-acc">${pct(side.accuracy)} acc</span>
      </div>
      <ul class="shot-list">${shotsStr}</ul>
    </div>`;
  };
  return `<div class="duel-summary">
    <div class="duel-summary-grid">
      ${sideHtml(youName, s.player)}
      ${sideHtml(foeName, s.enemy)}
    </div>
    <button class="btn" id="duel-continue">Continue</button>
  </div>`;
}

export function renderDuelPanel(game, onPlayCard, onLockIn, onCommitStaredown, onContinueDuel) {
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
    const freeStr = d.freeCardAvailable ? `<span class="status-tag status-free">★ Free Card</span>` : "";
    const spiritStr = (d.spirit > 0) ? `<span class="status-tag status-spirit" title="Spirit scales spirit-based effects.">✦ Spirit ${d.spirit}${d.spiritDoubleNext ? " ×2" : ""}</span>` : "";
    const dualStr = d.playerSecondaryGun ? `<span class="status-tag status-dual" title="Dual-wielding: mag stacks, damage averages, ${d.dualWieldPenaltyRemoved ? 'no acc penalty' : '−10% acc'}.">⚔ Dual Wield${d.dualWieldPenaltyRemoved ? '' : ' −10%'}</span>` : "";
    const comboStr = (d.roundOutlawCount > 0) ? `<span class="status-tag status-combo" title="Outlaw cards played this round.">↻ Combo ${d.roundOutlawCount}${d.roundOutlawCount >= 2 ? '!' : ''}</span>` : "";
    const comboFreeStr = d.nextComboFree ? `<span class="status-tag status-free" title="Next outlaw combo card costs 0 until used.">★ Free Combo</span>` : "";
    const sheriffBonus = sheriffCurrentHpAccBonus(game.run);
    const sheriffStr = game.run.classId === "sheriff"
      ? `<span class="status-tag status-respect" title="Above 100 current HP grants +3% shotgun accuracy per HP, up to +35%.">${sheriffBonus > 0 ? `★ Respect Aim +${Math.round(sheriffBonus * 100)}%` : "★ Respect Aim inactive"}</span>`
      : "";
    const focPips = Array.from({ length: d.playerMaxFocus }, (_, i) =>
      `<span class="focus-pip${i < d.playerFocus ? ' filled' : ''}"></span>`
    ).join('');
    const secondaryHtml = d.playerSecondaryGun
      ? buildActiveGunBadgeHtml(d.playerSecondaryGun, "Off-Hand")
      : "";
    html += `<div class="iron-row">
      ${buildActiveGunBadgeHtml(d.playerActiveGun, "Your Iron")}
      ${secondaryHtml}
      ${buildActiveGunBadgeHtml(d.enemy?.activeGun, `${d.opponentDef?.name ?? 'Foe'}'s Iron`)}
    </div>`;
    html += buildPersistentRowHtml(d);
    html += `<div class="prep-bar">
      <span class="prep-round">Round ${d.prepRound}/3</span>
      <span class="focus-bar" title="Focus: ${d.playerFocus}/${d.playerMaxFocus}">${focPips}</span>
      <span class="focus-label">${d.playerFocus}/${d.playerMaxFocus} focus</span>
      ${markStr}${focStr}${freeStr}${spiritStr}${dualStr}${comboStr}${comboFreeStr}${sheriffStr}
      <button class="btn btn-lockin" id="lock" ${d.playerLocked ? "disabled" : ""}>Lock In</button>
    </div>`;
    html += `<div class="card-row" id="hand"></div>`;
  } else if (d.phase === "highnoon") {
    html += `<p>Steel sings across the dust…</p>`;
  } else if (d.phase === "ended") {
    html += `<p class="duel-end-headline"><strong>${d.winner === "player" ? "You survived." : "You died."}</strong></p>`;
    html += buildShootoutSummaryHtml(d);
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
      const isFreeEligible = d.freeCardAvailable && def.type !== "gun" && def.type !== "stance" && def.type !== "showdown";
      let payHpAmount = 0;
      for (const raw of def.effects ?? []) {
        const m = raw.match(/^payHp([+-]?\d+)/);
        if (m) payHpAmount += Math.abs(parseInt(m[1], 10) || 0);
      }
      const wouldBeLethal = payHpAmount > 0 && (game.run.hp - payHpAmount <= 0);
      const affordable = (def.cost <= d.playerFocus || isFreeEligible) && !wouldBeLethal;
      const costLabel = isFreeEligible && def.cost > d.playerFocus ? "★ free" : def.cost;
      card.className = `hand-card hand-card-${def.type}${affordable ? "" : " disabled"}`;
      card.innerHTML = buildCardHtml(def, costLabel);
      if (affordable) {
        card.onclick = () => onPlayCard(c.uid);
      }
      row.appendChild(card);
    }
    const lock = el.querySelector("#lock");
    if (lock) lock.onclick = () => onLockIn();
  } else if (d.phase === "ended") {
    const cont = el.querySelector("#duel-continue");
    if (cont && onContinueDuel) cont.onclick = () => onContinueDuel();
  }
}

export function renderGameOver(game, onRestart, opts = {}) {
  const recentUnlocks = Array.isArray(opts.recentUnlocks) ? opts.recentUnlocks : [];
  const unlockItems = recentUnlocks.map((entry) =>
    `<li><strong>${entry.cardName}</strong> (${entry.className}) — Town ${entry.townOrder} boss clear (${entry.townName})</li>`
  ).join("");
  const unlockReport = unlockItems
    ? `<div class="gameover-unlock-report">
        <h3>Showdown Catalog Updated</h3>
        <ul>${unlockItems}</ul>
      </div>`
    : "";
  const el = panel();
  el.className = "panel panel-gameover";
  el.innerHTML = `<h2>Game Over</h2><p>The desert keeps your coin.</p>
    <p class="game-over-wait">Back to class select shortly… Press below to ride now.</p>
    ${unlockReport}
    <button class="btn" id="rs">Return now</button>`;
  el.querySelector("#rs").onclick = onRestart;
}

export function renderClassSelect(onPick, opts = {}) {
  const unlockState = opts.unlockState ?? null;
  const recentUnlocks = Array.isArray(opts.recentUnlocks) ? opts.recentUnlocks : [];
  const unlockItems = recentUnlocks.map((entry) =>
    `<li><strong>${entry.cardName}</strong> unlocked for ${entry.className} (Town ${entry.townOrder} boss clear)</li>`
  ).join("");
  const unlockBanner = unlockItems
    ? `<div class="catalog-unlock-banner">
        <h3>New Showdown Unlocks</h3>
        <ul>${unlockItems}</ul>
      </div>`
    : "";
  const el = panel();
  el.className = "panel panel-class-select";
  el.innerHTML = `<h2>Choose Your Path</h2>
    <p>Your class shapes your starting deck and abilities.</p>
    ${unlockBanner}
    <div class="class-grid"></div>`;
  const g = el.querySelector(".class-grid");
  for (const cls of CLASSES) {
    const progress = getClassShowdownProgress(unlockState, cls.id);
    const progressLine = progress.totalCount > 0
      ? `${progress.unlockedCount}/${progress.totalCount} Showdowns unlocked`
      : "No class Showdown catalog";
    let nextTarget = "Catalog complete";
    if (progress.nextLocked) {
      const townOrder = progress.nextLocked.unlockTownOrder;
      nextTarget = Number.isFinite(townOrder)
        ? `Next: Town ${townOrder} boss clear (${progress.nextLocked.name})`
        : `Next: ${progress.nextLocked.name}`;
    }
    const d = document.createElement("div");
    d.className = "poster class-card";
    d.style.setProperty("--tint", cls.portraitTint);
    d.innerHTML = `
      <h3 style="color:${cls.portraitTint}">${cls.name}</h3>
      <p><em>${cls.title}</em></p>
      <p>${cls.abilityBlurb}</p>
      <p class="class-catalog-progress">${progressLine}</p>
      <p class="class-catalog-next">${nextTarget}</p>`;
    d.onclick = () => onPick(cls.id);
    g.appendChild(d);
  }
}
