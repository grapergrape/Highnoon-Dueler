import { OPPONENTS, TOWNS } from "../data/opponents.js";
import { CARD_DEFINITIONS, effectsForCardLevel, getCardDef, getCardUpgradeOptions, upgradedCardDef } from "../data/cards.js";
import { activeDeedsForRun, deedProgressPct } from "../data/deeds.js";
import { getClass, CLASSES } from "../data/classes.js";
import { gunsForClass, getGun, starterGunIdForClass } from "../data/guns.js";
import {
  GEAR_SLOTS,
  TRINKET_SLOTS,
  describeItemEffect,
  equippedItems,
  getItem,
  itemBonuses,
  normalizeEquipment,
  rollMerchantTrinket,
  trinketPrice,
} from "../data/items.js";
import { whiskeyOfferForGame } from "../data/economy.js";
import { describeIntent, duelDisplayedVolleyPreview, estimateVolleyDamage } from "../duel/duel.js";

const RARITY_PRICE = { common: 25, uncommon: 40, rare: 65, epic: 110, legendary: 180 };
const DEED_GIVER_IMAGE = "/static/img/deed-giver.jpg";

function hasStaredownOnlyEffect(cardDef) {
  return Array.isArray(cardDef?.effects) && cardDef.effects.includes("staredownOnly");
}

function isUniqueDeckCard(cardDef) {
  return cardDef?.type === "showdown" || cardDef?.type === "stance";
}

/** Hover-friendly description for an effect token. Used by .card-eff tooltips. */
const EFFECT_TOOLTIPS = {
  bullets: "Legacy attack effect. Current cards should use Load.",
  load: "Loads bullets into your active gun, up to its capacity.",
  armor: "One-round damage reduction. Clears after Showdown.",
  position: "Changes Position. Position improves bullet damage but fuels Dodge.",
  positionSet: "Sets your Position to a specific value.",
  evadeBullets: "Evades incoming bullets this Showdown by spending or requiring Position.",
  evadeAttack: "Evades the next incoming attack this Showdown.",
  nerve: "Gain Nerve immediately.",
  nextNerve: "Gain extra Nerve next round.",
  draw: "Draw cards immediately.",
  rattled: "Reduces next round's Nerve gain.",
  enemyWeak: "Reduces enemy bullet damage for the next attack.",
  enemyArmor: "Changes enemy Armor.",
  overcap: "Temporarily lets your gun load above normal capacity.",
  damage: "Flat damage added to every successful hit.",
  accShootout: "Legacy accuracy effect. Current combat is deterministic.",
  accGlobal: "Legacy accuracy effect. Current combat is deterministic.",
  enemyAccNext: "Legacy aim debuff. Current cards map this to enemy damage reduction.",
  enemyBullets: "Legacy bullet debuff. Current cards map this to enemy damage reduction.",
  enemyDodge: "Reduces the enemy's deterministic dodges on the next shootout only.",
  pierce: "Shots ignore enemy damage reduction (pierce armor).",
  ricochet: "30% chance per hit for a half-damage ricochet.",
  healNow: "Heal HP immediately.",
  hpAfterShootout: "HP change applied after every volley while this gun is equipped.",
  hpAfterCycle: "Legacy timing effect from the old prep system.",
  focusCycle: "Legacy focus effect. Current combat treats this as immediate Nerve.",
  gainFocused: "Legacy focus state.",
  markEnemy: "Place mark tokens on the enemy. Marks amplify markBurst damage.",
  markBurst: "Each enemy mark adds this much damage to your hits.",
  focusBonusBullets: "While Focused: extra bullets in the next volley.",
  focusBonusAcc: "Legacy accuracy focus effect.",
  firstHitsAuto: "The first N shots of your volley automatically hit.",
  dodgeRecv: "Deterministically dodge this many incoming bullets each volley.",
  returnBulletOnHit: "Each hit returns this many bullets to your volley.",
  damageShootout: "Volley damage multiplier (additive percent).",
  maxHp: "Increases your maximum HP for the rest of the run.",
  healPerDuel: "Heal at the start of each duel.",
  deadeye: "Critical hits: ~15% of hits deal 30% bonus damage.",
  damageTaken: "Reduce incoming damage from each enemy hit.",
  focusPerRound: "Extra Nerve added next round.",
  staminaPerRound: "Extra Nerve added next round (legacy term).",
  extraMarkPerApply: "When you apply marks, add this many extra marks.",
  markBulletPerMark: "At shootout, add this many bullets per mark on the enemy.",
  damagePerHp: "At shootout, gain +1 damage per N current HP.",
  spirit: "Gain Spirit (cap 10). Spirit scales spirit-based effects.",
  spiritScaleAcc: "Legacy Spirit aim effect. Current combat maps this toward Position.",
  spiritScaleDamage: "At shootout, +volley damage per Spirit point.",
  spiritScaleEnemyAcc: "Legacy Spirit aim debuff. Current combat maps this to enemy damage reduction.",
  payHp: "Spend HP to play this card. Refused if it would be lethal.",
  comboBonus: "Bonus effect — triggers if 2+ outlaw cards play in the same round.",
  nextComboFree: "Your next outlaw combo card costs 0 Nerve until you play one.",
  extraPlay: "Legacy play-limit effect. Current combat maps this to Nerve.",
  elDoble: "Legacy Vaquero Oath effect.",
  removeDualPenalty: "Legacy dual-wield accuracy effect.",
  spiritDoubleNext: "All Spirit-scaling effects double for the next shootout.",
  extraVolleyShots: "Per combo trigger this duel, +N bonus shootout shots.",
  dualWieldAccPenaltyReduce: "Legacy dual-wield accuracy effect.",
  respectCapSet: "Set your Respect cap to at least this value for the run.",
  bountyOnHit: "Each successful player hit adds this many dollars to the duel bounty.",
  lifestealOnHit: "Each successful player hit restores this many HP.",
  infamy: "Outlaw scaling resource. Spend it for bullets, damage, or armor.",
  infamyPerRound: "Gain Infamy at the start of each later round.",
  infamyOnHit: "Gain Infamy after successful player hits.",
  infamyLoad: "Spend Infamy to load bullets.",
  infamyDamage: "Gain damage from current Infamy.",
  infamyArmor: "Gain Armor from current Infamy.",
  deputy: "Add Sheriff deputies for this duel.",
  deputies: "Add Sheriff deputies for this duel.",
  deputyArmorPerRound: "Deputies add Armor at the start of each later round.",
  deputyLoadOnAttack: "Deputies load bullets when the enemy intends to attack.",
  deputyBlock: "Gain Armor from active deputies.",
  caseFile: "Marshal procedure resource. Spend it for warrant payoffs.",
  casePerRound: "Gain Case File at the start of each later round.",
  casePath: "Start a Procedure Path. It advances each round up to III and grants that much Case File.",
  caseOnMark: "Gain Case File when you apply Marks.",
  caseSpendLoad: "Spend Case File to load bullets.",
  caseSpendArmor: "Spend Case File to gain Armor.",
  track: "Apache tracking resource. Track improves bullet damage.",
  trackDamage: "Gain damage from current Track.",
  trackLoad: "Load bullets from current Track.",
  snare: "If the enemy attacks, evade bullets; otherwise gain Armor.",
  snarePerRound: "Snare incoming attacks at the start of later rounds.",
  positionPerRound: "Gain Position at the start of each later round.",
  flourishDamage: "If Position is 3+, gain bullet damage for precision volleys of 3 or fewer bullets; otherwise gain Position.",
  infection: "Delayed Doctor damage. Deals damage after Showdown, then decays by 1.",
  infectionWeak: "If the enemy is infected, reduce their bullet damage.",
  infectionLeech: "Heal from Infection damage.",
  consumeInfection: "Spend all Infection for immediate burst damage.",
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
  staredown: "Legacy",
  stance: "Stance",
  showdown: "Legacy",
};

const ROLE_LABEL = {
  easy: "Easy",
  medium: "Medium",
  boss: "Boss",
};

function pct(v) { return `${Math.round((v ?? 0) * 100)}%`; }

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

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
    case 'load': return `Load ${v} bullet${Math.abs(v) === 1 ? '' : 's'}`;
    case 'armor': return `Gain ${v} Armor`;
    case 'position': return v > 0 ? `+${v} Position` : `${v} Position`;
    case 'positionSet': return `Set Position ${v}`;
    case 'evadeBullets': return `Evade ${v} bullet${Math.abs(v) === 1 ? '' : 's'}`;
    case 'evadeAttack': return 'Evade next attack';
    case 'nerve': return v > 0 ? `+${v} Nerve` : `${v} Nerve`;
    case 'nextNerve': return v > 0 ? `+${v} Nerve next round` : `${v} Nerve next round`;
    case 'draw': return `Draw ${v}`;
    case 'rattled': return `Apply Rattled ${v || 1}`;
    case 'enemyWeak': return `Foe bullet dmg −${v}`;
    case 'enemyArmor': return v > 0 ? `Foe +${v} Armor` : `Foe ${v} Armor`;
    case 'overcap': return `Over-cap ${v}`;
    case 'damage': return v > 0 ? `+${v} damage` : `${v} damage`;
    case 'accShootout': return v > 0 ? `+${v} Position` : `${v} Position`;
    case 'accGlobal': return v > 0 ? `+${pct(v)} acc (perm)` : `${pct(v)} acc (perm)`;
    case 'enemyAccNext': return `Foe damage down`;
    case 'enemyBullets': return v < 0 ? `Foe ${v} bullets` : `Foe +${v} bullets`;
    case 'enemyDodge': return v < 0 ? `Foe ${v} dodges` : `Foe +${v} dodges`;
    case 'pierce': return 'Piercing shots';
    case 'ricochet': return 'Ricochet on hit';
    case 'healNow': return `Heal +${v} HP now`;
    case 'hpAfterShootout': return v < 0 ? `${v} HP after volley` : `+${v} HP after volley`;
    case 'hpAfterCycle': return v < 0 ? `${v} HP on lock-in` : `+${v} HP on lock-in`;
    case 'focusCycle': return `+${v} Nerve, +${v} play this cycle`;
    case 'gainFocused': return 'Gain Focused ✦';
    case 'markEnemy': return `Mark foe ×${v}`;
    case 'markBurst': return `+${v} dmg per mark`;
    case 'focusBonusBullets': return `+${v} bullets if Focused`;
    case 'focusBonusAcc': return `+${pct(v)} acc if Focused`;
    case 'firstHitsAuto': return `First ${v} shots auto-hit`;
    case 'dodgeRecv': return `Evade ${v} bullet${Math.abs(v) === 1 ? '' : 's'}`;
    case 'returnBulletOnHit': return `Return ${v} bullet/hit`;
    case 'damageShootout': return v > 0 ? `+${pct(v)} volley dmg` : `${pct(v)} volley dmg`;
    case 'maxHp': return v > 0 ? `+${v} max HP` : `${v} max HP`;
    case 'healPerDuel': return `+${v} HP per duel`;
    case 'deadeye': return 'Crit shots (Deadeye)';
    case 'damageTaken': return `−${Math.abs(v)} dmg taken`;
    case 'focusPerRound': return `+${v} Nerve next round`;
    case 'staminaPerRound': return `+${v} Nerve next round`;
    case 'extraMarkPerApply': return `+${v} mark per Mark apply`;
    case 'markBulletPerMark': return `+${v} bullet per mark`;
    case 'damagePerHp': return `+1 dmg per ${v} HP`;
    case 'spirit': return v > 0 ? `+${v} Spirit ✦` : `${v} Spirit`;
    case 'spiritScaleAcc': return `+${pct(v)} acc / Spirit`;
    case 'spiritScaleDamage': return `+${pct(v)} dmg / Spirit`;
    case 'spiritScaleEnemyAcc': return `Foe ${pct(v)} acc / Spirit`;
    case 'payHp': return `Pay ${v} HP`;
    case 'extraVolleyShots': return `+${v} shot / combo`;
    case 'bountyOnHit': return `+$${v} bounty / hit`;
    case 'lifestealOnHit': return `Heal ${v} HP / hit`;
    case 'infamy': return v > 0 ? `+${v} Infamy` : `${v} Infamy`;
    case 'infamyPerRound': return `+${v} Infamy/round`;
    case 'infamyOnHit': return `+${v} Infamy/hit`;
    case 'infamyLoad': return `Spend up to ${v} Infamy: load`;
    case 'infamyDamage': return `Infamy adds up to +${v} dmg`;
    case 'infamyArmor': return `Infamy adds up to ${v * 2} Armor`;
    case 'deputy':
    case 'deputies': return `+${v} Deput${Math.abs(v) === 1 ? 'y' : 'ies'}`;
    case 'deputyArmorPerRound': return `Deputies: +${v} Armor/round each`;
    case 'deputyLoadOnAttack': return `Deputies load up to ${v} vs attacks`;
    case 'deputyBlock': return `+${v} Armor/deputy`;
    case 'caseFile': return `+${v} Case File`;
    case 'casePerRound': return `+${v} Case File/round`;
    case 'casePath': return `Procedure Path +${v}`;
    case 'caseOnMark': return `+${v} Case File on Mark`;
    case 'caseSpendLoad': return `Spend up to ${v} Case: load`;
    case 'caseSpendArmor': return `Spend up to ${v} Case: Armor`;
    case 'track': return `+${v} Track`;
    case 'trackDamage': return `Track adds up to +${v} dmg`;
    case 'trackLoad': return `Load up to ${v} from Track`;
    case 'snare': return `Snare ${v} bullet${Math.abs(v) === 1 ? '' : 's'}`;
    case 'snarePerRound': return `Snare ${v}/round`;
    case 'positionPerRound': return `+${v} Position/round`;
    case 'flourishDamage': return `At Position 3, <=3 bullets: +${v} dmg`;
    case 'infection': return `Apply ${v} Infection`;
    case 'infectionWeak': return `Infected foe dmg −${v}`;
    case 'infectionLeech': return `Heal ${Math.round(v * 100)}% Infection dmg`;
    case 'consumeInfection': return 'Consume Infection for damage';
    case 'staredownOnly': return null;
    case 'nextComboFree': return 'Next combo card free until played';
    case 'extraPlay': return `+${v} Nerve`;
    case 'elDoble': return 'Legacy dual-wield effect';
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
  if (raw.match(/^(hpAfterShootout|hpAfterCycle|maxHp|bullets|damage|accShootout|position)-/)) return 'neg';
  return 'pos';
}

function buildEffectsHtml(def) {
  const lines = [];
  for (const raw of effectsForCardLevel(def, def.showdownLevel || 1)) {
    const text = effectToText(raw);
    if (!text) continue;
    const cls = classifyEffect(raw);
    const tip = tooltipForEffect(raw);
    const tipAttr = tip ? ` title="${escapeHtml(tip)}"` : '';
    lines.push(`<span class="card-eff card-eff-${cls}"${tipAttr}>${escapeHtml(text)}</span>`);
  }
  if (!lines.length) return '';
  return `<span class="card-effects">${lines.join('')}</span>`;
}

function buildItemEffectsHtml(itemDef) {
  const lines = (itemDef?.effects ?? [])
    .map((effect) => describeItemEffect(effect))
    .filter(Boolean)
    .map((text) => `<span class="card-eff card-eff-pos">${escapeHtml(text)}</span>`);
  return lines.length ? `<span class="card-effects">${lines.join("")}</span>` : "";
}

function buildItemCardHtml(itemDef, ribbon = null, price = null) {
  const label = ribbon ?? (itemDef.slot === "trinket" ? "Trinket" : itemDef.slot);
  const cost = price ? `$${price}` : itemDef.rarity.toUpperCase();
  return `<span class="shop-card-inner hand-card-inner item-card-inner">
    <span class="card-ribbon">${escapeHtml(label.toUpperCase())}</span>
    <span class="card-cost">${escapeHtml(cost)}</span>
    <span class="card-name-text">${escapeHtml(itemDef.name)}</span>
    <span class="card-flavor">${escapeHtml(itemDef.description)}</span>
    ${buildItemEffectsHtml(itemDef)}
  </span>`;
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
    ${activeGun.stats ? `<span class="iron-badge-stats">${activeGun.stats.capacity} cap · ${activeGun.stats.bulletDamage} dmg/bullet${activeGun.stats.startLoaded ? ` · starts ${activeGun.stats.startLoaded}` : ""}</span>` : ""}
    ${effHtml}
  </div>`;
}

function buildPersistentRowHtml(d) {
  const stances = d.playerStances ?? [];
  const cardName = (card) => card?.name ?? getCardDef(card?.id)?.name ?? "Unknown";
  const stanceHtml = stances.length
    ? stances.map((s) => `<span class="persistent-chip persistent-stance">${escapeHtml(cardName(s))}</span>`).join("")
    : `<span class="persistent-empty">No stance held</span>`;
  return `<div class="persistent-row">
    <div class="persistent-group"><span class="persistent-label">Stances</span>${stanceHtml}</div>
  </div>`;
}

export function updateHud(game) {
  if (!game.run) {
    if (hudRun()) hudRun().textContent = `Bounty: —`;
    if (hudHealth()) hudHealth().textContent = `— HP`;
    return;
  }
  if (hudRun()) hudRun().textContent = `Bounty: $${game.run.money | 0} · Signatures: ${game.run.signaturePoints || 0}`;
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

function buildDeedsPanelHtml(run) {
  const deeds = activeDeedsForRun(run);
  const rows = deeds.map((deed) => {
    const pct = deedProgressPct(deed);
    return `<div class="deed-card ${deed.completed ? "deed-complete" : ""}">
      <div class="deed-card-head">
        <strong>${escapeHtml(deed.name)}</strong>
        <span>${deed.completed ? "Complete" : `${deed.progress || 0}/${deed.target}`}</span>
      </div>
      <p>${escapeHtml(deed.description)}</p>
      <div class="deed-progress"><span style="width:${pct}%"></span></div>
      <em>Reward: +1 Signature Point</em>
    </div>`;
  }).join("");
  return `<aside class="town-deeds-panel">
    <div class="deed-giver-card">
      <img src="${DEED_GIVER_IMAGE}" alt="Deed giver">
      <div class="deed-giver-copy">
        <span>Deed Giver</span>
        <h3>Town Deeds</h3>
        <p>Hard work signs hard cards.</p>
      </div>
      <strong>${run.signaturePoints || 0} SP</strong>
    </div>
    <div class="town-deeds-list">${rows}</div>
  </aside>`;
}

function buildEquipmentPanelHtml(run) {
  normalizeEquipment(run);
  const gearRows = GEAR_SLOTS.map((slot) => {
    const itemDef = getItem(run.equipment.gear[slot]);
    return `<div class="gear-slot ${itemDef ? "gear-filled" : ""}">
      <span>${escapeHtml(slot)}</span>
      <strong>${itemDef ? escapeHtml(itemDef.name) : "Empty"}</strong>
    </div>`;
  }).join("");
  const trinkets = run.equipment.trinkets ?? [];
  const trinketRows = Array.from({ length: TRINKET_SLOTS }, (_, ix) => {
    const itemDef = getItem(trinkets[ix]);
    return `<span class="trinket-chip ${itemDef ? "trinket-filled" : ""}" title="${itemDef ? escapeHtml(itemDef.description) : "Empty trinket slot"}">${itemDef ? escapeHtml(itemDef.name) : "Empty"}</span>`;
  }).join("");
  const gearCount = GEAR_SLOTS.filter((slot) => run.equipment.gear[slot]).length;
  return `<aside class="equipment-panel">
    <div class="equipment-head">
      <span>Equipment</span>
      <strong>Gear ${gearCount}/${GEAR_SLOTS.length} · Trinkets ${trinkets.length}/${TRINKET_SLOTS}</strong>
    </div>
    <div class="equipment-subhead">Gear Slots</div>
    <div class="gear-grid">${gearRows}</div>
    <div class="equipment-subhead equipment-subhead-trinkets">Trinket Slots</div>
    <div class="trinket-row">${trinketRows}</div>
  </aside>`;
}

export function renderWanted(game, onPick, onUpgrade) {
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
    <div class="wanted-board-layout">
      <div>
        <div class="wanted-map">
          <div class="wanted-map-image">
            <img src="${currentTown.mapImage}" alt="${currentTown.name} trail map">
          </div>
          <div class="town-track">${townTrack}</div>
        </div>
        <button class="btn btn-signatures" id="open-upgrades" ${(game.run.signaturePoints || 0) > 0 ? "" : "disabled"}>Sign Cards (${game.run.signaturePoints || 0})</button>
        ${buildEquipmentPanelHtml(game.run)}
      </div>
      ${buildDeedsPanelHtml(game.run)}
    </div>
    <div class="town-roster"></div>`;
  const upgradeBtn = el.querySelector("#open-upgrades");
  if (upgradeBtn && onUpgrade) upgradeBtn.onclick = onUpgrade;

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
      const requiredOpp = townOpps.find((prev) => prev.roleOrder < o.roleOrder && !defeated.has(prev.id));
      const roleLockReason = requiredOpp ? `Defeat ${requiredOpp.name} first` : "";
      const isLockedPoster = isLockedTown || !!roleLockReason || isDefeated;
      const posterLockText = isDefeated ? "Bounty claimed" : (roleLockReason || lockReason);
      const d = document.createElement("button");
      d.type = "button";
      d.className = `poster wanted-poster role-${o.role}${isDefeated ? " poster-defeated" : ""}${isLockedPoster ? " poster-locked" : ""}`;
      d.disabled = isLockedPoster;
      if (isLockedPoster) d.title = posterLockText;
      d.innerHTML = `
        <span class="role-badge">${ROLE_LABEL[o.role]}</span>
        ${isLockedPoster && !isDefeated ? `<span class="locked-badge">Locked</span>` : ""}
        ${isDefeated ? `<span class="defeated-badge">Defeated</span>` : ""}
        <h3>${o.name}</h3>
        <p><em>${o.title}</em></p>
        ${isLockedPoster ? `<p class="poster-lock-note">${posterLockText}</p>` : ""}
        <p class="wanted-backstory">${o.backstory.slice(0, 150)}...</p>
        <div class="wanted-stat-row">
          <span><strong>HP</strong> ${o.maxHp}</span>
          <span><strong>Tier</strong> ${o.difficultyTier}</span>
        </div>
        <div class="wanted-stat-row">
          <span><strong>Nerve</strong> ${o.focus}</span>
          <span><strong>Iron</strong> ${gun.name}</span>
        </div>`;
      if (!isLockedPoster) d.onclick = () => onPick(o.id);
      g.appendChild(d);
    }
    roster.appendChild(townWrap);
  }
}

function shopCardPool(game) {
  const owned = new Set(game.run.deckIds);
  const classId = game.run.classId;
  return CARD_DEFINITIONS.filter((c) =>
    c.type !== "gun" &&
    c.type !== "showdown" &&
    !c.opponentOnly &&
    !hasStaredownOnlyEffect(c) &&
    !!classId &&
    c.classId === classId &&
    (
      !isUniqueDeckCard(c)
      || !owned.has(c.id)
    )
  );
}

function shopGunPool(game) {
  const owned = new Set(game.run.deckIds);
  const classId = game.run.classId;
  const starterGunId = starterGunIdForClass(classId);
  const starterSecondaryGunId = game.run.permanent?.startSecondaryGunId ?? null;
  return gunsForClass(classId).filter((g) =>
    !owned.has(g.id) &&
    g.id !== starterGunId &&
    g.id !== starterSecondaryGunId
  );
}

export function rollShopInventory(game) {
  const trinket = rollMerchantTrinket(game.run);
  return {
    cardIds: shuffle([...shopCardPool(game)]).slice(0, 5).map((c) => c.id),
    gunIds: shuffle([...shopGunPool(game)]).slice(0, 4).map((g) => g.id),
    trinketId: trinket?.id ?? null,
    healUsed: false,
    purchaseUsed: false,
  };
}

function priceForCard(c, game = null) {
  const discount = Math.max(0, Math.min(0.35, itemBonuses(game?.run).cardDiscount || 0));
  return Math.max(5, Math.round((8 + (c.cost || 0) * 3) * (1 - discount)));
}

function priceForGun(g, game = null) {
  const discount = Math.max(0, Math.min(0.35, itemBonuses(game?.run).gunDiscount || 0));
  return Math.max(20, Math.round((RARITY_PRICE[g.rarity] ?? 40) * (1 - discount)));
}

function ownedGunIdsInDeck(deckIds) {
  return deckIds.filter((id) => id.startsWith("gun_"));
}

function ownedNonGunIdsInDeck(deckIds) {
  return deckIds.filter((id) => !id.startsWith("gun_"));
}

export function renderShop(game, shopInventory, onBuyCard, onHeal, onContinue, onUpgrade) {
  const el = panel();
  el.className = "panel";
  const offers = shopInventory ?? rollShopInventory(game);
  const healUsed = !!offers.healUsed;
  const purchaseUsed = !!offers.purchaseUsed;
  const cardPool = (offers.cardIds ?? [])
    .map((id) => getCardDef(id))
    .filter((c) => !!c && c.type !== "gun");
  const gunPool = (offers.gunIds ?? [])
    .map((id) => getGun(id))
    .filter(Boolean);
  const trinketOffer = offers.trinketId ? getItem(offers.trinketId) : null;
  const deckSize = game.run.deckIds.length;
  const atDeckCap = deckSize >= 24;
  const whiskey = whiskeyOfferForGame(game);
  const canBuyWhiskey = !healUsed && game.run.money >= whiskey.price && game.run.hp < game.run.maxHp;

  el.innerHTML = `<h2>Merchant</h2><p>Spend your bounty. Health does not refill between fights.</p>
    <p>Wallet: <strong>$${game.run.money}</strong></p>
    <button class="btn btn-signatures" id="shop-upgrades" ${(game.run.signaturePoints || 0) > 0 ? "" : "disabled"}>Sign Cards (${game.run.signaturePoints || 0})</button>
    <h3 class="shop-section-title">Trinket <span class="shop-section-sub">(appears from merchant visit 2, one purchase per visit)</span></h3>
    <div class="shop-list" id="shop-trinkets"></div>
    <h3 class="shop-section-title">Guns <span class="shop-section-sub">(deck holds up to 2 extra guns, one purchase per visit)</span></h3>
    <div class="shop-list" id="shop-guns"></div>
    <h3 class="shop-section-title">Cards & Tricks <span class="shop-section-sub">(deck cap 24)</span></h3>
    ${atDeckCap ? `<p class="shop-empty"><em>Deck is full (${deckSize}/24). Buy a card to replace one non-gun card.</em></p>` : ''}
    <div class="shop-list" id="shop-cards"></div>
    <button class="btn" id="heal" ${canBuyWhiskey ? "" : "disabled"}>${healUsed ? "Whiskey (Used)" : `Whiskey ($${whiskey.price}) +${whiskey.heal} HP`}</button>
    ${healUsed ? `<p class="hint">You can only buy whiskey once per merchant visit.</p>` : ""}
    <button class="btn" id="done">Ride On</button>`;

  const ironRow = el.querySelector("#shop-guns");
  const trinketRow = el.querySelector("#shop-trinkets");
  const upgradeBtn = el.querySelector("#shop-upgrades");
  if (upgradeBtn && onUpgrade) upgradeBtn.onclick = onUpgrade;
  if (trinketOffer) {
    const price = trinketPrice(trinketOffer, game.run);
    const b = document.createElement("button");
    b.type = "button";
    b.disabled = purchaseUsed || game.run.money < price;
    b.className = `shop-card hand-card-trinket item-rarity-${trinketOffer.rarity}`;
    b.innerHTML = buildItemCardHtml(trinketOffer, "Trinket", price);
    b.onclick = () => {
      if (purchaseUsed) return;
      onBuyCard(trinketOffer.id, price);
    };
    trinketRow.appendChild(b);
  } else {
    const reason = (game.run.merchantVisits || 0) < 2
      ? "Trinket dealer reaches the second merchant stop."
      : "No open trinket slots or no trinkets left.";
    trinketRow.innerHTML = `<p class="shop-empty"><em>${reason}</em></p>`;
  }
  for (const g of gunPool) {
    const price = priceForGun(g, game);
    const card = document.createElement("button");
    card.type = "button";
    card.disabled = purchaseUsed;
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
      if (purchaseUsed) return;
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
    const price = priceForCard(c, game);
    b.type = "button";
    b.disabled = purchaseUsed;
    b.className = `shop-card hand-card-${c.type}`;
    b.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${RIBBON_LABEL[c.type] ?? c.type} — $${price}</span>
        <span class="card-cost">${c.cost}</span>
        <span class="card-name-text">${c.name}</span>
        ${buildEffectsHtml(c)}
      </span>`;
    b.onclick = () => {
      if (purchaseUsed) return;
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
  const skipLabel = reward.skipLabel ?? (noRewards ? "Continue to Merchant" : "Skip Reward");
  el.innerHTML = `<h2>Victory Reward</h2>
    <p>You defeated <strong>${reward.opponentName ?? "Outlaw"}</strong> ${opponentTitle}.</p>
    <p>Bounty earned: <strong>$${reward.bountyEarned | 0}</strong> · Run bounty: <strong>$${game.run.money | 0}</strong></p>
    <p>Choose one card reward or skip. ${atDeckCap ? `<em>Deck full (${deckSize}/${deckCap}): taking a card requires replacing a non-gun card.</em>` : ""}</p>
    <div class="shop-list" id="reward-cards"></div>
    <button class="btn" id="skip-reward">${skipLabel}</button>`;

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

export function renderPostDuelGunReward(game, reward, onTakeGun, onSkip) {
  const el = panel();
  el.className = "panel";
  const rewardGuns = Array.isArray(reward.rewardGuns) ? reward.rewardGuns : [];
  const deckCap = Number.isFinite(reward.deckCap) ? reward.deckCap : 24;
  const deckSize = game.run.deckIds.length;
  const ownedGuns = ownedGunIdsInDeck(game.run.deckIds);
  const gunSlotsFull = ownedGuns.length >= 2;
  const deckFull = deckSize >= deckCap;
  const opponentTitle = reward.opponentTitle ? `<em>${reward.opponentTitle}</em>` : "";
  const noRewards = rewardGuns.length === 0;
  let note = "";
  if (gunSlotsFull) {
    note = "<em>Gun slots full: taking this gun requires holstering one extra gun.</em>";
  } else if (deckFull) {
    note = `<em>Deck full (${deckSize}/${deckCap}): taking this gun requires replacing a non-gun card.</em>`;
  }

  el.innerHTML = `<h2>Gun Drop</h2>
    <p>You defeated <strong>${reward.opponentName ?? "Outlaw"}</strong> ${opponentTitle}.</p>
    <p>Choose one gun drop or skip. ${note}</p>
    <div class="shop-list" id="reward-guns"></div>
    <button class="btn" id="skip-gun-reward">${noRewards ? "Continue to Merchant" : "Skip Gun"}</button>`;

  const rewardRow = el.querySelector("#reward-guns");
  for (const g of rewardGuns) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `shop-card hand-card-gun iron-rarity-${g.rarity}`;
    const cardDef = getCardDef(g.id);
    const back = g.backstory ? `<span class="card-flavor card-backstory">${g.backstory}</span>` : "";
    b.innerHTML = `
      <span class="shop-card-inner hand-card-inner">
        <span class="card-ribbon">${g.rarity.toUpperCase()} GUN DROP</span>
        <span class="card-cost">${g.cost}</span>
        <span class="card-name-text">${g.name}</span>
        <span class="card-flavor">${g.flavor ?? ""}</span>
        ${back}
        ${buildEffectsHtml(cardDef ?? { effects: g.effects })}
      </span>`;
    b.onclick = () => {
      if (gunSlotsFull) {
        promptReplaceGun(game, ownedGuns, (replaceId) => {
          if (!replaceId) {
            renderPostDuelGunReward(game, reward, onTakeGun, onSkip);
            return;
          }
          onTakeGun(g.id, { replaceGunId: replaceId });
        });
        return;
      }
      if (deckFull) {
        const ownedCards = ownedNonGunIdsInDeck(game.run.deckIds);
        if (!ownedCards.length) return;
        promptReplaceCard(
          game,
          ownedCards,
          (replaceId) => {
            if (!replaceId) {
              renderPostDuelGunReward(game, reward, onTakeGun, onSkip);
              return;
            }
            onTakeGun(g.id, { replaceCardId: replaceId });
          },
          {
            title: "Deck Full",
            description: "Your deck is at the 24-card cap. Choose one non-gun card to replace with this gun:",
          }
        );
        return;
      }
      onTakeGun(g.id);
    };
    rewardRow.appendChild(b);
  }

  if (noRewards) {
    rewardRow.innerHTML = `<p class="shop-empty"><em>No class gun drops available. Ride to the merchant.</em></p>`;
  }
  el.querySelector("#skip-gun-reward").onclick = onSkip;
}

export function renderPostDuelItemReward(game, reward, onTakeItem, onSkip) {
  const el = panel();
  el.className = "panel";
  const rewardItems = Array.isArray(reward.rewardItems) ? reward.rewardItems : [];
  const mandatory = !!reward.mandatory;
  const noRewards = rewardItems.length === 0;
  const opponentTitle = reward.opponentTitle ? `<em>${reward.opponentTitle}</em>` : "";
  const title = rewardItems.some((itemDef) => itemDef.slot === "trinket") ? "Trinket Drop" : "Boss Gear";
  const copy = mandatory
    ? "Bosses always leave one piece of gear for an empty slot."
    : "A small trinket shook loose in the dust.";
  el.innerHTML = `<h2>${title}</h2>
    <p>You defeated <strong>${reward.opponentName ?? "Outlaw"}</strong> ${opponentTitle}.</p>
    <p>${copy}</p>
    <div class="shop-list" id="reward-items"></div>
    ${mandatory ? "" : `<button class="btn" id="skip-item-reward">${noRewards ? "Continue to Merchant" : "Skip Trinket"}</button>`}`;

  const rewardRow = el.querySelector("#reward-items");
  for (const itemDef of rewardItems) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `shop-card hand-card-item item-rarity-${itemDef.rarity}`;
    b.innerHTML = buildItemCardHtml(itemDef, itemDef.slot === "trinket" ? "Trinket Drop" : `${itemDef.slot} Gear`);
    b.onclick = () => onTakeItem(itemDef.id);
    rewardRow.appendChild(b);
  }
  if (noRewards) {
    rewardRow.innerHTML = `<p class="shop-empty"><em>No gear slots are open.</em></p>`;
  }
  const skip = el.querySelector("#skip-item-reward");
  if (skip) skip.onclick = onSkip;
}

export function renderPostDuelDeeds(game, summary, onUpgrade, onContinue) {
  const el = panel();
  el.className = "panel panel-deeds";
  const rows = Array.isArray(summary?.rows) ? summary.rows : [];
  const earned = summary?.earnedSignaturePoints || 0;
  el.innerHTML = `<div class="deed-shop-shell">
    <aside class="deed-ledger-portrait">
      <img src="${DEED_GIVER_IMAGE}" alt="Deed giver">
      <div class="deed-ledger-caption">
        <span>Deed Giver</span>
        <strong>The Ledger Man</strong>
        <em>${earned ? `Signed credit earned: +${earned}` : "No new signatures yet"}</em>
      </div>
    </aside>
    <section class="deed-ledger-main">
      <div class="deed-ledger-head">
        <div>
          <h2>Deed Ledger</h2>
          <p>${escapeHtml(summary?.opponentName ?? "The duel")} moved the town ledger.</p>
        </div>
        <strong>${game.run.signaturePoints || 0} SP</strong>
      </div>
      <div class="deed-result-list"></div>
      <div class="deed-actions">
        <button class="btn" id="deed-upgrade" ${(game.run.signaturePoints || 0) > 0 ? "" : "disabled"}>Sign Cards</button>
        <button class="btn" id="deed-continue">Continue</button>
      </div>
    </section>
  </div>`;
  const list = el.querySelector(".deed-result-list");
  for (const row of rows) {
    const pct = Math.max(0, Math.min(100, Math.round((row.progressAfter / Math.max(1, row.target)) * 100)));
    const node = document.createElement("div");
    node.className = `deed-result ${row.completed ? "deed-complete" : ""}`;
    node.innerHTML = `<div class="deed-card-head">
        <strong>${escapeHtml(row.name)}</strong>
        <span>${row.progressAfter}/${row.target}${row.delta ? ` (+${row.delta})` : ""}</span>
      </div>
      <p>${escapeHtml(row.description)}</p>
      <div class="deed-progress"><span style="width:${pct}%"></span></div>
      ${row.justCompleted ? `<em>Completed: +1 Signature Point</em>` : ""}`;
    list.appendChild(node);
  }
  el.querySelector("#deed-upgrade").onclick = onUpgrade;
  el.querySelector("#deed-continue").onclick = onContinue;
}

export function renderCardUpgrade(game, eligibleCards, onUpgrade, onDone) {
  const el = panel();
  el.className = "panel panel-upgrades";
  const points = game.run.signaturePoints || 0;
  const cards = Array.isArray(eligibleCards) ? eligibleCards : [];
  el.innerHTML = `<h2>Sign Cards</h2>
    <p>Spend Signature Points earned from Deeds. Each point signs one card once.</p>
    <p>Signature Points: <strong>${points}</strong></p>
    <div class="upgrade-list"></div>
    <button class="btn" id="done-upgrades">Done</button>`;
  const list = el.querySelector(".upgrade-list");
  if (!cards.length) {
    list.innerHTML = `<p class="shop-empty"><em>No unsigned non-gun cards are available.</em></p>`;
  }
  for (const entry of cards) {
    const base = getCardDef(entry.id);
    if (!base) continue;
    const options = getCardUpgradeOptions(base);
    const row = document.createElement("section");
    row.className = "upgrade-card-row";
    row.innerHTML = `<div class="upgrade-base">
      <div class="shop-card hand-card-${base.type}">
        <span class="shop-card-inner hand-card-inner">
          <span class="card-ribbon">${RIBBON_LABEL[base.type] ?? base.type}</span>
          <span class="card-cost">${base.cost}</span>
          <span class="card-name-text">${escapeHtml(base.name)}</span>
          ${buildEffectsHtml(base)}
        </span>
      </div>
    </div>
    <div class="upgrade-choices"></div>`;
    const choices = row.querySelector(".upgrade-choices");
    for (const option of options) {
      const upgraded = upgradedCardDef(base, option.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "upgrade-choice";
      btn.disabled = points <= 0;
      btn.innerHTML = `<span class="upgrade-choice-name">${escapeHtml(option.name)}</span>
        <span class="upgrade-choice-desc">${escapeHtml(option.description)}</span>
        <span class="upgrade-preview-cost">Cost ${upgraded.cost}</span>
        ${buildEffectsHtml(upgraded)}`;
      btn.onclick = () => onUpgrade(entry.uid, option.id);
      choices.appendChild(btn);
    }
    list.appendChild(row);
  }
  el.querySelector("#done-upgrades").onclick = onDone;
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

function buildForecastCardHtml(label, subLabel, forecast, sideClass, valuePrefix = "") {
  const dodge = forecast.dodge > 0
    ? `<span>Evaded ${forecast.dodge}</span>`
    : `<span>No evade</span>`;
  const blocked = forecast.armor > 0
    ? `<span>${forecast.armor} Armor</span>`
    : `<span>No Armor</span>`;
  return `<div class="forecast-card ${sideClass}">
    <div class="forecast-kicker">${escapeHtml(label)}</div>
    <div class="forecast-value">${escapeHtml(valuePrefix)}${Math.round(forecast.expectedDamage)} dmg</div>
    <div class="forecast-sub">${escapeHtml(subLabel)}</div>
    <div class="forecast-facts">
      <span>${forecast.liveShots}/${forecast.bullets} bullets</span>
      <span>${forecast.damagePerHit} dmg/bullet</span>
      ${blocked}
      ${dodge}
    </div>
  </div>`;
}

function buildForecastPanelHtml(d, run) {
  const preview = duelDisplayedVolleyPreview(d, run);
  const outgoing = estimateVolleyDamage(preview.player, preview.enemy);
  const incoming = estimateVolleyDamage(preview.enemy, preview.player);
  const foe = d.opponentDef?.name ?? "Foe";
  const playerGun = `${preview.player.loaded}/${preview.player.capacity} loaded · ${preview.player.positionName} x${preview.player.positionMult.toFixed(2)}`;
  const foeGun = describeIntent(d.enemyIntent);
  return `<div class="forecast-grid">
    ${buildForecastCardHtml(`Damage to ${foe}`, playerGun, outgoing, "forecast-outgoing")}
    ${buildForecastCardHtml("HP loss if you end now", foeGun, incoming, "forecast-incoming")}
  </div>`;
}

function buildPlayedCardTileHtml(play) {
  const def = getCardDef(play.id) ?? play;
  const level = play.showdownLevel || def.showdownLevel || 1;
  const viewDef = {
    ...def,
    effects: play.effects ?? def.effects ?? [],
    showdownLevel: level,
  };
  const type = play.cardType ?? def.type ?? "feat";
  const label = RIBBON_LABEL[type] ?? type;
  const flavor = play.flavorText || def.flavorText || "";
  const rarity = play.rarity || def.rarity || "common";
  return `<div class="played-card played-card-${escapeHtml(type)} played-rarity-${escapeHtml(rarity)}">
    <div class="played-card-top">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(play.cost ?? def.cost ?? 0))}</strong>
    </div>
    <div class="played-card-name">${escapeHtml(play.name || def.name || "Unknown Card")}</div>
    ${flavor ? `<div class="played-card-flavor">${escapeHtml(flavor)}</div>` : ""}
    ${buildEffectsHtml(viewDef)}
  </div>`;
}

function buildPlayedLaneHtml(label, cards, emptyText) {
  const body = cards?.length
    ? cards.map(buildPlayedCardTileHtml).join("")
    : `<div class="played-empty">${escapeHtml(emptyText)}</div>`;
  return `<div class="played-lane">
    <div class="played-lane-label">${escapeHtml(label)}</div>
    <div class="played-card-list">${body}</div>
  </div>`;
}

function buildPrepPlayGroupHtml(title, prepRound, playerCards, enemyCards, enemyEmpty, playerEmpty = "No card played") {
  return `<div class="played-group">
    <div class="combat-section-title">
      <span>${escapeHtml(title)}</span>
      <strong>Prep ${prepRound}/3</strong>
    </div>
    <div class="played-lanes">
      ${buildPlayedLaneHtml("You", playerCards, playerEmpty)}
      ${buildPlayedLaneHtml("Opponent", enemyCards, enemyEmpty)}
    </div>
  </div>`;
}

function buildPlayedCardsPanelHtml(d) {
  const groups = [];
  if (d.phase === "prep") {
    const current = d.playedThisPrep ?? { player: [], enemy: [] };
    groups.push(buildPrepPlayGroupHtml(
      "Current prep plays",
      d.prepRound,
      current.player ?? [],
      current.enemy ?? [],
      d.playerLocked ? `${d.opponentDef?.name ?? "Opponent"} has not played` : "Reveals after Lock In",
      "No card played yet"
    ));
  }
  const currentCycle = d.cycleNumber ?? 1;
  const historySource = Array.isArray(d.prepPlayHistory) && d.prepPlayHistory.length
    ? d.prepPlayHistory
    : (d.lastPrepPlays ? [d.lastPrepPlays] : []);
  const history = historySource
    .filter((entry) => entry && entry.cycleNumber === currentCycle)
    .filter((entry) => (
      d.phase !== "prep"
      || entry.prepRound !== d.prepRound
    ))
    .sort((a, b) => b.prepRound - a.prepRound);
  for (const last of history) {
    groups.push(buildPrepPlayGroupHtml(
      "Locked prep",
      last.prepRound,
      last.player ?? [],
      last.enemy ?? [],
      `${d.opponentDef?.name ?? "Opponent"} held nerve`
    ));
  }
  if (!groups.length) return "";
  return `<section class="combat-section played-board">
    ${groups.join("")}
  </section>`;
}

function buildCombatDashboardHtml(game) {
  const d = game.duel;
  if (!d || d.phase === "ended") return "";
  return `<div class="combat-dashboard">
    ${buildForecastPanelHtml(d, game.run)}
    ${buildCombatDeedsHtml(game.run)}
  </div>`;
}

function buildCombatDeedsHtml(run) {
  const deeds = activeDeedsForRun(run).filter((deed) => !deed.completed);
  if (!deeds.length) return "";
  return `<div class="combat-deeds">
    <div class="combat-deeds-title">Deeds</div>
    ${deeds.map((deed) => {
      const pct = deedProgressPct(deed);
      return `<div class="combat-deed-row">
        <span>${escapeHtml(deed.name)}</span>
        <strong>${deed.progress || 0}/${deed.target}</strong>
        <em><i style="width:${pct}%"></i></em>
      </div>`;
    }).join("")}
  </div>`;
}

function buildCardHtml(def, costLabel = 'free') {
  const ribbon = hasStaredownOnlyEffect(def) ? "Legacy" : (RIBBON_LABEL[def.type] ?? def.type);
  const upgrade = def.upgradeName ? `<span class="card-signature">${escapeHtml(def.upgradeName)}</span>` : "";
  return `
    <span class="hand-card-inner">
      <span class="card-ribbon">${escapeHtml(ribbon)}</span>
      <span class="card-cost">${escapeHtml(costLabel)}</span>
      <span class="card-name-text">${escapeHtml(def.name)}</span>
      ${upgrade}
      ${def.flavorText ? `<span class="card-flavor">${escapeHtml(def.flavorText)}</span>` : ''}
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
            const heal = sh.lifesteal ? ` <span class="shot-rico">+${sh.lifesteal} HP</span>` : "";
            return `<li class="shot shot-hit"><span class="shot-i">#${sh.i}</span><span class="shot-out">HIT</span><span class="shot-dmg">${sh.dmg} dmg</span>${extra}${heal}</li>`;
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
        <span class="stat-hit">${side.hits} fired</span>
        ${side.dodged ? `<span class="stat-dodge">${side.dodged} dodged</span>` : ""}
        ${side.armorBlocked ? `<span>${side.armorBlocked} blocked</span>` : ""}
        <span><strong>${side.damage}</strong> total dmg</span>
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

function buildRoundStateHtml(d, run) {
  const preview = duelDisplayedVolleyPreview(d, run);
  const incoming = estimateVolleyDamage(preview.enemy, preview.player);
  const outgoing = estimateVolleyDamage(preview.player, preview.enemy);
  const rattled = d.rattled > 0
    ? `<span class="status-tag status-rattled">Rattled: next Nerve −${d.rattled}</span>`
    : "";
  const evade = d.evadeAttack
    ? `<span class="status-tag status-dodge">Evade next attack</span>`
    : (d.evadeBullets > 0 ? `<span class="status-tag status-dodge">Evade ${d.evadeBullets}</span>` : "");
  const marks = d.enemyMarked > 0 ? `<span class="status-tag status-mark">Mark ×${d.enemyMarked}</span>` : "";
  const spirit = d.spirit > 0 ? `<span class="status-tag status-spirit">Spirit ${d.spirit}</span>` : "";
  const infamy = d.infamy > 0 ? `<span class="status-tag">Infamy ${d.infamy}</span>` : "";
  const deputies = d.deputies > 0 ? `<span class="status-tag">Deputies ${d.deputies}</span>` : "";
  const caseFile = d.caseFile > 0 ? `<span class="status-tag">Case ${d.caseFile}</span>` : "";
  const casePath = d.casePath > 0 ? `<span class="status-tag">Procedure ${d.casePathStage || 0}/3</span>` : "";
  const track = d.track > 0 ? `<span class="status-tag">Track ${d.track}</span>` : "";
  const infection = d.enemyInfection > 0 ? `<span class="status-tag status-rattled">Infection ${d.enemyInfection}</span>` : "";
  return `<section class="combat-section round-state-board">
    <div class="combat-section-title">
      <span>Round ${d.roundNumber}</span>
      <strong>${escapeHtml(describeIntent(d.enemyIntent))}</strong>
    </div>
    <div class="round-state-grid">
      <div class="round-state-cell">
        <span class="round-state-label">Loaded</span>
        <strong>${preview.player.loaded}/${preview.player.capacity}</strong>
        <em>${escapeHtml(preview.player.gunName)}</em>
      </div>
      <div class="round-state-cell">
        <span class="round-state-label">Position</span>
        <strong>${preview.player.position}</strong>
        <em>${escapeHtml(preview.player.positionName)} · x${preview.player.positionMult.toFixed(2)}</em>
      </div>
      <div class="round-state-cell">
        <span class="round-state-label">Armor</span>
        <strong>${preview.player.armor}</strong>
        <em>Blocks ${Math.min(preview.player.armor, incoming.rawDamage)} now</em>
      </div>
      <div class="round-state-cell">
        <span class="round-state-label">Nerve</span>
        <strong>${d.nerve}/${d.maxNerve}</strong>
        <em>Gain ${Math.max(0, (d.nerveGain ?? 3) + (d.nextNerveBonus ?? 0) - (d.rattled ?? 0))} next round</em>
      </div>
    </div>
    <div class="status-strip">
      <span class="status-tag">Outgoing ${Math.round(outgoing.expectedDamage)}</span>
      <span class="status-tag">Incoming HP loss ${Math.round(incoming.expectedDamage)}</span>
      ${evade}${marks}${spirit}${infamy}${deputies}${caseFile}${casePath}${track}${infection}${rattled}
    </div>
  </section>`;
}

export function renderDuelPanel(game, onPlayCard, onLockIn, onContinueDuel) {
  const el = panel();
  const d = game.duel;
  if (!d) return;
  el.className = "panel panel-duel";
  let html = `<h3>${escapeHtml(d.message)}</h3>`;
  html += buildCombatDashboardHtml(game);

  if (d.phase === "player_turn") {
    const secondaryHtml = d.playerSecondaryGun ? buildActiveGunBadgeHtml(d.playerSecondaryGun, "Off-Hand") : "";
    html += `<div class="iron-row">
      ${buildActiveGunBadgeHtml(d.playerActiveGun, "Your Iron")}
      ${secondaryHtml}
      ${buildActiveGunBadgeHtml(d.enemy?.activeGun, `${d.opponentDef?.name ?? 'Foe'}'s Iron`)}
    </div>`;
    html += buildRoundStateHtml(d, game.run);
    html += `<div class="prep-bar">
      <span class="focus-label">${d.nerve}/${d.maxNerve} Nerve</span>
      <button class="btn btn-lockin" id="lock">Showdown</button>
    </div>`;
    html += `<div class="card-row" id="hand"></div>`;
  } else if (d.phase === "showdown") {
    html += `<p>Steel sings across the dust…</p>`;
  } else if (d.phase === "ended") {
    html += `<p class="duel-end-headline"><strong>${d.winner === "player" ? "You survived." : "You died."}</strong></p>`;
    html += buildShootoutSummaryHtml(d);
  }

  html += `<details class="battle-log-wrap">
    <summary class="battle-log-title">Full duel ledger</summary>
    <div class="battle-log" id="battle-log" role="log" aria-live="polite" aria-relevant="additions"></div>
  </details>`;

  el.innerHTML = html;
  fillBattleLog(el.querySelector("#battle-log"), d);

  if (d.phase === "player_turn") {
    const row = el.querySelector("#hand");
    for (const c of d.playerHand) {
      const def = upgradedCardDef(getCardDef(c.id), c.upgradeId);
      if (!def) continue;
      const card = document.createElement("div");
      const isFreeEligible = d.freeCardAvailable && def.type !== "gun" && !def.noFree;
      const isComboFree = false;
      const isGunFree = def.type === "gun"
        && (!!game.run.permanent?.freeFirstGunEachDuel || Math.max(0, itemBonuses(game.run).firstGunFree || 0) > 0)
        && !d.freeGunPlayed;
      let payHpAmount = 0;
      for (const raw of def.effects ?? []) {
        const m = raw.match(/^payHp([+-]?\d+)/);
        if (m) payHpAmount += Math.abs(parseInt(m[1], 10) || 0);
      }
      const wouldBeLethal = payHpAmount > 0 && (game.run.hp - payHpAmount <= 0);
      const affordable = ((def.cost ?? 0) <= d.nerve || isFreeEligible || isGunFree) && !wouldBeLethal;
      const costLabel = (isFreeEligible || isComboFree || isGunFree) && def.cost > 0 ? "★ free" : def.cost;
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

export function renderGameOver(game, onRestart) {
  const el = panel();
  el.className = "panel panel-gameover";
  el.innerHTML = `<h2>Game Over</h2><p>The desert keeps your coin.</p>
    <p class="game-over-wait">Back to class select shortly… Press below to ride now.</p>
    <button class="btn" id="rs">Return now</button>`;
  el.querySelector("#rs").onclick = onRestart;
}

export function renderClassSelect(onPick) {
  const el = panel();
  el.className = "panel panel-class-select";
  el.innerHTML = `<h2>Choose Your Path</h2>
    <p>Your class shapes your starting deck and abilities.</p>
    <div class="class-grid"></div>`;
  const g = el.querySelector(".class-grid");
  for (const cls of CLASSES) {
    const d = document.createElement("div");
    d.className = "poster class-card";
    d.style.setProperty("--tint", cls.portraitTint);
    d.innerHTML = `
      <h3 style="color:${cls.portraitTint}">${cls.name}</h3>
      <p><em>${cls.title}</em></p>
      <p>${cls.abilityBlurb}</p>`;
    d.onclick = () => onPick(cls.id);
    g.appendChild(d);
  }
}

export function renderStartingGear(game, choices, onPick) {
  const el = panel();
  el.className = "panel panel-starting-gear";
  const cls = getClass(game.run.classId);
  el.innerHTML = `<h2>Choose Starting Gear</h2>
    <p>${cls ? `${cls.name} rides out with one piece of shared gear.` : "Pick one piece of gear to start the run."}</p>
    <div class="shop-list starting-gear-list"></div>`;
  const list = el.querySelector(".starting-gear-list");
  for (const itemDef of choices ?? []) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `shop-card hand-card-item item-rarity-${itemDef.rarity}`;
    b.innerHTML = buildItemCardHtml(itemDef, `${itemDef.slot} Gear`);
    b.onclick = () => onPick(itemDef.id);
    list.appendChild(b);
  }
}
