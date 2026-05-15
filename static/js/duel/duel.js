import { getCardDef, parseEffect, cloneCardInstance, effectsForCardLevel } from "../data/cards.js";
import { feedbackLinesForCard } from "../ui/combat-ui.js";
import { getGun, FALLBACK_GUN_ID, starterGunIdForClass } from "../data/guns.js";
import { makeEnemyRuntime } from "../data/opponents.js";
import { buildDeckFromIds, drawCards, shuffle } from "../data/deck.js";

const STAREDOWN_POOL = ["std_dead_eye", "std_warning_shot", "std_iron_will", "std_marked_man"];

const STAREDOWN_BY_CLASS = {
  marshal:       ["std_marked_man", "std_federal_stare", "std_cold_stare", "std_warning_shot"],
  vaquero:       ["std_twin_stance", "std_hot_blood", "std_iron_will", "std_dead_eye"],
  sheriff:       ["std_last_stand_eye", "std_tin_star", "std_iron_will", "std_warning_shot"],
  apache_tracker:["std_spirit_stare", "std_iron_will", "std_wind_read", "std_dead_eye"],
  bounty_hunter: ["std_quickdraw_eye", "std_vendetta_eye", "std_dead_eye", "std_marked_man"],
  outlaw:        ["std_outlaw_stare", "std_dirty_stare", "std_iron_will", "std_dead_eye"],
};

function isPersistentCardType(type) {
  return type === "stance" || type === "showdown" || type === "character";
}

export function emptyMods() {
  return {
    bulletDelta: 0,
    damageDelta: 0,
    accDelta: 0,
    damageMult: 1,
    pierce: false,
    ricochet: false,
    firstHitsAuto: 0,
    dodgeRecv: 0,
    returnBulletOnHit: 0,
    hpAfterShootout: 0,
    hpAfterCycle: 0,
    focusCycleBonus: 0,
    healNow: 0,
    // Synergy mods
    markBurstDmg: 0,       // extra damage per mark on enemy at shootout
    focusBonusBullets: 0,  // extra bullets if player is focused
    focusBonusAcc: 0,      // extra accuracy if player is focused
    gainFocused: false,    // whether playing this card grants focused state
    // New synergy mods
    markBulletPerMark: 0,  // +N bullets per enemy mark at shootout
    damagePerHp: 0,        // +1 damage per N current HP at shootout (denominator)
    spiritScaleAcc: 0,     // accShootout += spirit * value (accumulates per card)
    spiritScaleDamage: 0,  // damageShootout += spirit * value
    spiritScaleEnemyAcc: 0,// enemyAccNext debuff -= spirit * value
    extraVolleyShots: 0,   // bonus shootout shots (Outlaw legendary)
    focusRoundBonus: 0,    // extra focus each prep round while a stance/showdown is active
    damageReduce: 0,       // flat reduction from each incoming hit
    deadeye: false,
    dualWieldAccPenaltyReduce: 0,
  };
}

export function emptyDebuffs() {
  return { accNext: 0, bulletNext: 0 };
}

/** Build an activeGun record from a gun definition. Effects are baked into mods at equip time. */
function makeActiveGun(gunDef) {
  if (!gunDef) return null;
  const mods = emptyMods();
  mergeGunIntoMods(mods, gunDef.effects ?? [], 1);
  // Persistent gun mods do not grant single-shot states; strip those.
  mods.gainFocused = false;
  mods.healNow = 0;
  mods.focusCycleBonus = 0;
  mods.hpAfterCycle = 0;
  return {
    id: gunDef.id,
    name: gunDef.name,
    rarity: gunDef.rarity,
    flavor: gunDef.flavor ?? null,
    backstory: gunDef.backstory ?? null,
    effects: [...(gunDef.effects ?? [])],
    stats: { mag: gunDef.mag, damage: gunDef.damage, accuracy: gunDef.accuracy, name: gunDef.name },
    mods,
  };
}

/** Combined player gun stats — sums mag, averages damage/accuracy when dual-wielding. */
function combinedGunStats(duel) {
  const a = duel.playerActiveGun?.stats;
  if (!a) return null;
  const b = duel.playerSecondaryGun?.stats;
  if (!b) return a;
  return {
    mag: a.mag + b.mag,
    damage: Math.round((a.damage + b.damage) / 2),
    accuracy: (a.accuracy + b.accuracy) / 2,
    name: `${a.name} + ${b.name}`,
  };
}

function elDobleEffect(duel) {
  // If currently single gun → mirror into secondary slot
  // If already dual-wielding → stack primary stats a 2nd time on top (triple-stack)
  if (!duel.playerActiveGun) return;
  if (!duel.playerSecondaryGun) {
    duel.playerSecondaryGun = JSON.parse(JSON.stringify(duel.playerActiveGun));
    pushPlayLogBulletin(duel, "El Doble — your iron mirrors itself.");
  } else {
    // Triple-stack: add primary's stats and mods on top of existing pair
    const p = duel.playerActiveGun;
    const s = duel.playerSecondaryGun;
    s.stats.mag += p.stats.mag;
    s.stats.damage = Math.round((s.stats.damage + p.stats.damage) / 2);
    // Merge mods additively
    for (const k of Object.keys(p.mods)) {
      if (typeof p.mods[k] === "number") s.mods[k] += p.mods[k];
      else if (typeof p.mods[k] === "boolean") s.mods[k] = s.mods[k] || p.mods[k];
    }
    pushPlayLogBulletin(duel, "El Doble — triple-stack! Three guns in two hands.");
  }
  duel.dualWieldPenaltyRemoved = true;
}

function resolveStartingGun(run) {
  const id = run.activeGunId || run.gunId || starterGunIdForClass(run.classId) || FALLBACK_GUN_ID;
  return getGun(id);
}

function combineModSources(...sources) {
  const out = emptyMods();
  for (const src of sources) {
    if (!src) continue;
    for (const k of Object.keys(out)) {
      if (k === "damageMult") {
        out.damageMult *= src.damageMult ?? 1;
      } else if (typeof out[k] === "number") {
        out[k] += src[k] || 0;
      } else if (typeof out[k] === "boolean") {
        out[k] = out[k] || !!src[k];
      }
    }
  }
  return out;
}

function persistentModsFor(duel, side) {
  return side === "enemy"
    ? combineModSources(duel.enemyStanceMods, duel.enemyShowdownMods)
    : combineModSources(duel.playerStanceMods, duel.playerShowdownMods);
}

/** Combine persistent gun, stance/showdown, and transient per-cycle card mods. */
function combinedMods(activeGun, transient, secondaryGun = null, persistent = null) {
  return combineModSources(activeGun?.mods, secondaryGun?.mods, persistent, transient);
}

/**
 * @param {import('../data/opponents.js').Opponent} oppDef
 * @param {object} run
 */
export function createDuel(oppDef, run) {
  const enemy = makeEnemyRuntime(oppDef);
  const pool = oppDef.deckTemplate.map((id) => cloneCardInstance(id)).filter(Boolean);
  enemy.drawPile = shuffle(pool);
  enemy.discardPile = [];
  enemy.hand = [];

  // Initialize each side's persistent active gun.
  const playerStartGun = resolveStartingGun(run);
  const playerActiveGun = makeActiveGun(playerStartGun);
  const enemyStartGun = getGun(oppDef.gunId);
  enemy.activeGun = makeActiveGun(enemyStartGun);

  return {
    opponentDef: oppDef,
    enemy,
    phase: "staredown_commit",
    prepRound: 1,
    cycleNumber: 1,
    cycleCount: 0,
    playerLocked: false,
    playerHand: [],
    playerDrawPile: buildDeckFromIds(run.deckIds),
    playerDiscard: [],
    playerFocus: 0,
    playerMaxFocus: 5 + (run.permanent?.focusPerRound ?? 0),
    focusBonusCycle: 0,
    playerActiveGun,
    playerMods: emptyMods(),
    enemyMods: emptyMods(),
    playerDebuffs: emptyDebuffs(),
    enemyDebuffs: emptyDebuffs(),
    // Synergy state (persists across prep rounds, cleared after shootout)
    extraMarkPerApply: run.permanent?.extraMarkPerApply ?? 0,
    enemyMarked: 0,
    playerFocused: false,
    playerStances: [],
    enemyStances: [],
    playerShowdown: null,
    enemyShowdown: null,
    playerShowdownLevel: 0,
    enemyShowdownLevel: 0,
    playerStanceMods: emptyMods(),
    enemyStanceMods: emptyMods(),
    playerShowdownMods: emptyMods(),
    enemyShowdownMods: emptyMods(),
    // Apache spirit (persists across prep rounds, cleared after shootout)
    spirit: 0,
    spiritDoubleNext: false,
    // Vaquero dual-wield (secondary gun slot)
    playerSecondaryGun: null,
    dualWieldPenaltyRemoved: false,
    // Outlaw combo tracking
    roundOutlawCount: 0,
    nextComboFree: false,
    duelComboTriggers: 0,
    shootoutLog: [],
    message: "STARE-DOWN — commit your hidden card before the prep.",
    winner: null,
    highNoonT: 0,
    staredownT: 0,
    playerStaredown: null,
    enemyStaredown: null,
    staredownChoices: [],
    feedbackEnemyRound: [],
    playLog: [],
    cycleNumber: 1,
  };
}

const PLAY_LOG_CAP = 120;

function trimPlayLog(duel) {
  while (duel.playLog.length > PLAY_LOG_CAP) duel.playLog.shift();
}

/** @param {'you'|'outlaw'} actor */
export function pushPlayLogCard(duel, actor, def) {
  if (!duel.playLog) duel.playLog = [];
  trimPlayLog(duel);
  duel.playLog.push({
    kind: "card",
    actor,
    name: def.name,
    cardType: def.type,
    prepRound: duel.prepRound,
  });
}

export function pushPlayLogBulletin(duel, text) {
  if (!duel.playLog) duel.playLog = [];
  trimPlayLog(duel);
  duel.playLog.push({ kind: "bulletin", text, prepRound: duel.prepRound });
}

export function refillFocus(duel, run) {
  const persistent = persistentModsFor(duel, "player");
  const base = 5 + (run.permanent?.focusPerRound ?? 0) + (persistent.focusRoundBonus ?? 0);
  duel.playerMaxFocus = base + duel.focusBonusCycle;
  duel.playerFocus = duel.playerMaxFocus;
  duel.enemy.focus = duel.enemy.maxFocus;
}

// Legacy alias used by external modules that read run.permanent.staminaPerRound
// (kept for save-state compatibility)
export { refillFocus as refillStamina };

export function dealStaredownChoices(duel, run) {
  const classId = run?.classId;
  const pool = (classId && STAREDOWN_BY_CLASS[classId]) ? STAREDOWN_BY_CLASS[classId] : STAREDOWN_POOL;
  duel.staredownChoices = pool.slice(0, 4).map((id) => cloneCardInstance(id)).filter(Boolean);
}

function commitEnemyStaredown(duel) {
  const eligible = duel.enemy.drawPile.filter((c) => {
    const d = getCardDef(c.id);
    return d && !isPersistentCardType(d.type) && d.type !== "gun";
  });
  if (eligible.length > 0) {
    const pick = eligible[(Math.random() * eligible.length) | 0];
    duel.enemyStaredown = pick;
    const idx = duel.enemy.drawPile.indexOf(pick);
    if (idx >= 0) duel.enemy.drawPile.splice(idx, 1);
  }
}

export function commitPlayerStaredown(duel, run, cardUid) {
  if (duel.phase !== "staredown_commit") return false;
  if (duel.playerStaredown) return false;
  const card = duel.staredownChoices.find((c) => c.uid === cardUid);
  if (!card) return false;
  duel.playerStaredown = card;
  duel.staredownChoices = [];
  commitEnemyStaredown(duel);
  pushPlayLogBulletin(duel, "Both gunslingers commit their stare-down card…");
  duel.phase = "prep";
  duel.message = "Round 1 — the street goes quiet.";
  startPrepRound(duel, run);
  return true;
}

function mergeGunIntoMods(mods, effects, sign = 1) {
  for (const raw of effects ?? []) {
    const e = parseEffect(raw);
    if (e.kind === "bullets") mods.bulletDelta += sign * (e.value || 0);
    else if (e.kind === "damage") mods.damageDelta += sign * (e.value || 0);
    else if (e.kind === "accShootout") mods.accDelta += sign * (e.value || 0);
    else if (e.kind === "accGlobal") mods.accDelta += sign * (e.value || 0);
    else if (e.kind === "damageShootout") mods.damageMult += sign * (e.value || 0);
    else if (e.kind === "pierce") mods.pierce = sign > 0;
    else if (e.kind === "ricochet") mods.ricochet = sign > 0;
    else if (e.kind === "firstHitsAuto") mods.firstHitsAuto += sign * (e.value || 0);
    else if (e.kind === "dodgeRecv") mods.dodgeRecv += sign * (e.value || 0);
    else if (e.kind === "returnBulletOnHit") mods.returnBulletOnHit += sign * (e.value || 0);
    else if (e.kind === "hpAfterShootout") mods.hpAfterShootout += sign * (e.value || 0);
    else if (e.kind === "hpAfterCycle") mods.hpAfterCycle += sign * (e.value || 0);
    else if (e.kind === "focusCycle") mods.focusCycleBonus += sign * (e.value || 0);
    else if (e.kind === "focusPerRound") mods.focusRoundBonus += sign * (e.value || 0);
    else if (e.kind === "staminaPerRound") mods.focusRoundBonus += sign * (e.value || 0);
    else if (e.kind === "healNow") mods.healNow += sign * (e.value || 0);
    // Synergy effects
    else if (e.kind === "markBurst") mods.markBurstDmg += sign * (e.value || 0);
    else if (e.kind === "focusBonusBullets") mods.focusBonusBullets += sign * (e.value || 0);
    else if (e.kind === "focusBonusAcc") mods.focusBonusAcc += sign * (e.value || 0);
    else if (e.kind === "gainFocused" && sign > 0) mods.gainFocused = true;
    else if (e.kind === "markBulletPerMark") mods.markBulletPerMark += sign * (e.value || 0);
    else if (e.kind === "damagePerHp") mods.damagePerHp += sign * (e.value || 0);
    else if (e.kind === "spiritScaleAcc") mods.spiritScaleAcc += sign * (e.value || 0);
    else if (e.kind === "spiritScaleDamage") mods.spiritScaleDamage += sign * (e.value || 0);
    else if (e.kind === "spiritScaleEnemyAcc") mods.spiritScaleEnemyAcc += sign * (e.value || 0);
    else if (e.kind === "extraVolleyShots") mods.extraVolleyShots += sign * (e.value || 0);
    else if (e.kind === "damageTaken") mods.damageReduce += sign * Math.abs(e.value ?? 1);
    else if (e.kind === "deadeye" && sign > 0) mods.deadeye = true;
    else if (e.kind === "dualWieldAccPenaltyReduce") mods.dualWieldAccPenaltyReduce += sign * (e.value || 0);
  }
}

function applyPlayerCardEffects(duel, run, def) {
  const eff = def.effects ?? [];
  // Spirit-scaled debuffs use the spirit value at play time for next-volley enemy acc
  const spiritNow = duel.spirit || 0;
  for (const raw of eff) {
    const e = parseEffect(raw);
    if (e.kind === "enemyAccNext") {
      duel.enemyDebuffs.accNext += e.value || 0;
    } else if (e.kind === "enemyBullets") {
      duel.enemyDebuffs.bulletNext += e.value || 0;
    } else if (e.kind === "markEnemy") {
      const baseMarks = e.value || 0;
      const extra = run?.permanent?.extraMarkPerApply ?? 0;
      duel.enemyMarked += baseMarks + extra;
    } else if (e.kind === "spirit") {
      const cap = run?.permanent?.spiritMax ?? 10;
      duel.spirit = Math.min(cap, (duel.spirit || 0) + (e.value || 0));
    } else if (e.kind === "spiritScaleEnemyAcc") {
      // Apply now using current spirit as a debuff on enemy next volley
      duel.enemyDebuffs.accNext += spiritNow * (e.value || 0);
    } else {
      mergeGunIntoMods(duel.playerMods, [raw], 1);
    }
  }
  // Apply gainFocused directly to duel state
  if (duel.playerMods.gainFocused) {
    duel.playerFocused = true;
    duel.playerMods.gainFocused = false;
  }
}

function applyEnemyPlayedCard(duel, def) {
  if (def.type === "gun") {
    const gunDef = getGun(def.id);
    const prev = duel.enemy.activeGun;
    duel.enemy.activeGun = makeActiveGun(gunDef);
    if (prev && prev.id !== gunDef.id) {
      pushPlayLogBulletin(duel, `${duel.opponentDef.name} holsters the ${prev.name} and draws the ${gunDef.name}.`);
    }
    return;
  }
  for (const raw of def.effects ?? []) {
    const e = parseEffect(raw);
    if (e.kind === "enemyAccNext") {
      duel.playerDebuffs.accNext += e.value || 0;
    } else if (e.kind === "enemyBullets") {
      duel.playerDebuffs.bulletNext += e.value || 0;
    } else if (e.kind === "markEnemy") {
      // Enemy marking player doesn't use the same mechanic
    } else {
      mergeGunIntoMods(duel.enemyMods, [raw], 1);
    }
  }
}

function applyPersistentEffects(duel, run, def, targetMods, playedBy, level = 1) {
  const effects = effectsForCardLevel(def, level);
  for (const raw of effects) {
    const e = parseEffect(raw);
    if (playedBy === "player") {
      if (e.kind === "enemyAccNext") {
        duel.enemyDebuffs.accNext += e.value || 0;
      } else if (e.kind === "enemyBullets") {
        duel.enemyDebuffs.bulletNext += e.value || 0;
      } else if (e.kind === "markEnemy") {
        const extra = run?.permanent?.extraMarkPerApply ?? 0;
        duel.enemyMarked += (e.value || 0) + extra;
      } else if (e.kind === "spirit") {
        const cap = run?.permanent?.spiritMax ?? 10;
        duel.spirit = Math.min(cap, (duel.spirit || 0) + (e.value || 0));
      } else if (e.kind === "healNow") {
        run.hp = Math.min(run.maxHp, run.hp + (e.value || 0));
      } else if (e.kind === "maxHp") {
        run.maxHp += e.value || 0;
        run.hp = Math.min(run.maxHp, run.hp + (e.value || 0));
      } else if (e.kind === "respectCapSet") {
        const nextCap = Math.max(0, Math.round(e.value || 0));
        if (nextCap > 0) {
          if (!run.permanent || typeof run.permanent !== "object") run.permanent = {};
          const curCap = Number.isFinite(run.permanent.respectMax) ? run.permanent.respectMax : 5;
          run.permanent.respectMax = Math.max(curCap, nextCap);
        }
      } else if (e.kind === "gainFocused") {
        duel.playerFocused = true;
      } else if (e.kind === "removeDualPenalty") {
        duel.dualWieldPenaltyRemoved = true;
      } else {
        mergeGunIntoMods(targetMods, [raw], 1);
      }
    } else {
      if (e.kind === "enemyAccNext") {
        duel.playerDebuffs.accNext += e.value || 0;
      } else if (e.kind === "enemyBullets") {
        duel.playerDebuffs.bulletNext += e.value || 0;
      } else if (e.kind !== "healNow" && e.kind !== "maxHp") {
        mergeGunIntoMods(targetMods, [raw], 1);
      }
    }
  }
}

function rebuildShowdownMods(duel, run, side) {
  if (side === "enemy") {
    duel.enemyShowdownMods = emptyMods();
    if (duel.enemyShowdown) {
      applyPersistentEffects(duel, run, duel.enemyShowdown, duel.enemyShowdownMods, "enemy", duel.enemyShowdownLevel || 1);
    }
    return;
  }
  duel.playerShowdownMods = emptyMods();
  if (duel.playerShowdown) {
    applyPersistentEffects(duel, run, duel.playerShowdown, duel.playerShowdownMods, "player", duel.playerShowdownLevel || 1);
  }
}

function playPersistentCard(duel, run, card, def, playedBy) {
  const side = playedBy === "enemy" ? "enemy" : "player";
  if (def.type === "showdown") {
    if (side === "enemy") {
      if (duel.enemyShowdown) duel.enemy.discardPile.push(duel.enemyShowdown);
      duel.enemyShowdown = card;
      duel.enemyShowdownLevel = 1;
      duel.enemyShowdown.showdownLevel = 1;
      rebuildShowdownMods(duel, run, "enemy");
    } else {
      if (duel.playerShowdown) duel.playerDiscard.push(duel.playerShowdown);
      duel.playerShowdown = card;
      duel.playerShowdownLevel = 1;
      duel.playerShowdown.showdownLevel = 1;
      rebuildShowdownMods(duel, run, "player");
      duel.message = `${def.name} — Showdown Level I.`;
    }
    return;
  }

  if (side === "enemy") {
    duel.enemyStances.push(card);
    applyPersistentEffects(duel, run, def, duel.enemyStanceMods, "enemy");
  } else {
    duel.playerStances.push(card);
    applyPersistentEffects(duel, run, def, duel.playerStanceMods, "player");
    duel.message = `${def.name} — stance held.`;
  }
}

function advanceShowdowns(duel, run) {
  if (duel.playerShowdown && duel.playerShowdownLevel < 3) {
    duel.playerShowdownLevel += 1;
    duel.playerShowdown.showdownLevel = duel.playerShowdownLevel;
    rebuildShowdownMods(duel, run, "player");
    pushPlayLogBulletin(duel, `${duel.playerShowdown.name} advances to Level ${duel.playerShowdownLevel}.`);
  }
  if (duel.enemyShowdown && duel.enemyShowdownLevel < 3) {
    duel.enemyShowdownLevel += 1;
    duel.enemyShowdown.showdownLevel = duel.enemyShowdownLevel;
    rebuildShowdownMods(duel, run, "enemy");
    pushPlayLogBulletin(duel, `${duel.opponentDef.name}'s ${duel.enemyShowdown.name} advances to Level ${duel.enemyShowdownLevel}.`);
  }
}

export function startPrepRound(duel, run) {
  duel.playerLocked = false;
  duel.freeCardAvailable = !!run.permanent?.freeFirstCardPerRound;
  duel.roundOutlawCount = 0;
  duel.roundOutlawCards = [];
  duel.message = `Preparation — round ${duel.prepRound} of 3. Play your hand, then Lock In.`;
  pushPlayLogBulletin(duel, `Preparation round ${duel.prepRound}/3 — draw and play.`);
  refillFocus(duel, run);

  const drawn = drawCards(duel.playerDrawPile, duel.playerDiscard, 4);
  duel.playerHand.push(...drawn);

  const eDraw = drawCards(duel.enemy.drawPile, duel.enemy.discardPile, 4);
  duel.enemy.hand.push(...eDraw);

  // healPerDuel fires once per duel (cycle 1, prep round 1 only)
  if (duel.cycleNumber === 1 && duel.prepRound === 1) {
    const heal = run.permanent?.healPerDuel ?? 0;
    if (heal) {
      run.hp = Math.min(run.maxHp, run.hp + heal);
    }
  }

  duel.freeCardAvailable = !!run.permanent?.freeFirstCardPerRound;
}

export function tryPlayCard(duel, run, cardUid) {
  const idx = duel.playerHand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return { ok: false, reason: "No card" };
  const card = duel.playerHand[idx];
  const def = getCardDef(card.id);
  if (!def) return { ok: false, reason: "Bad card" };
  if (duel.playerLocked) return { ok: false, reason: "Locked in" };

  const isPersistent = isPersistentCardType(def.type);
  const isOutlawCombo = !!def.outlawCombo;
  const isComboFree = !isPersistent && isOutlawCombo && duel.nextComboFree;
  const usingFreebie = def.type !== "gun" && !isPersistent && !isComboFree && duel.freeCardAvailable === true;
  const cost = (usingFreebie || isComboFree) ? 0 : def.cost;

  if (cost > duel.playerFocus) return { ok: false, reason: "Not enough focus" };

  // payHp gating: refuse if HP cost would kill caster
  let payHpAmount = 0;
  for (const raw of def.effects ?? []) {
    const e = parseEffect(raw);
    if (e.kind === "payHp") payHpAmount += Math.abs(e.value || 0);
  }
  if (payHpAmount > 0 && run.hp - payHpAmount <= 0) {
    return { ok: false, reason: "Would be lethal" };
  }

  duel.playerFocus -= cost;
  if (usingFreebie) {
    duel.freeCardAvailable = false;
    pushPlayLogBulletin(duel, "Read the wind — first card was free.");
  }
  if (isComboFree) {
    duel.nextComboFree = false;
    pushPlayLogBulletin(duel, "Free combo spent - that one was on the house.");
  }
  duel.playerHand.splice(idx, 1);

  if (isPersistent) {
    playPersistentCard(duel, run, card, def, "player");
    pushPlayLogCard(duel, "you", def);
    return { ok: true, persistent: true, feedback: feedbackLinesForCard(def, "player") };
  }

  duel.playerDiscard.push(card);

  // Pay HP cost if any
  if (payHpAmount > 0) {
    run.hp = Math.max(1, run.hp - payHpAmount);
    pushPlayLogBulletin(duel, `Spent ${payHpAmount} HP for ${def.name}.`);
  }

  if (def.type === "gun") {
    const gunDef = getGun(def.id);
    const dualWieldEnabled = !!run.permanent?.dualWieldEnabled;
    if (dualWieldEnabled) {
      // Vaquero path: secondary slot
      if (!duel.playerActiveGun) {
        duel.playerActiveGun = makeActiveGun(gunDef);
        if (run) run.activeGunId = gunDef.id;
        pushPlayLogBulletin(duel, `You draw the ${gunDef.name}.`);
      } else if (!duel.playerSecondaryGun) {
        duel.playerSecondaryGun = makeActiveGun(gunDef);
        pushPlayLogBulletin(duel, `Off-hand: you also draw the ${gunDef.name}. Dos pistolas.`);
      } else {
        // Already dual; replace secondary
        const prev = duel.playerSecondaryGun;
        duel.playerSecondaryGun = makeActiveGun(gunDef);
        pushPlayLogBulletin(duel, `Off-hand swap: ${prev.name} → ${gunDef.name}.`);
      }
    } else {
      const prev = duel.playerActiveGun;
      duel.playerActiveGun = makeActiveGun(gunDef);
      if (run) run.activeGunId = gunDef.id;
      if (prev && prev.id !== gunDef.id) {
        pushPlayLogBulletin(duel, `You holster the ${prev.name} and draw the ${gunDef.name}.`);
      } else if (!prev) {
        pushPlayLogBulletin(duel, `You draw the ${gunDef.name}.`);
      }
    }
    duel.message = `Drew ${gunDef.name}.`;
    pushPlayLogCard(duel, "you", def);
    return { ok: true, gunSwap: true, feedback: feedbackLinesForCard(def, "player") };
  }

  // Outlaw combo tracking — count outlaw-combo cards in this round
  if (isOutlawCombo) {
    duel.roundOutlawCount = (duel.roundOutlawCount || 0) + 1;
    if (!duel.roundOutlawCards) duel.roundOutlawCards = [];
    duel.roundOutlawCards.push(def);
  }

  applyPlayerCardEffects(duel, run, def);

  if (isOutlawCombo) {
    const extractCombo = (d) => (d.effects ?? []).filter(t => t.startsWith("comboBonus:")).map(t => t.slice("comboBonus:".length));
    if (duel.roundOutlawCount === 2) {
      // Retroactively apply 1st card's comboBonus + this card's
      for (const prior of duel.roundOutlawCards) {
        const tokens = extractCombo(prior);
        if (tokens.length) {
          applyPlayerCardEffects(duel, run, { effects: tokens });
          duel.duelComboTriggers = (duel.duelComboTriggers || 0) + 1;
        }
      }
      pushPlayLogBulletin(duel, "Combo! Outlaw cards stack their bonuses.");
    } else if (duel.roundOutlawCount > 2) {
      // Each subsequent combo card applies its own bonus
      const tokens = extractCombo(def);
      if (tokens.length) {
        applyPlayerCardEffects(duel, run, { effects: tokens });
        duel.duelComboTriggers = (duel.duelComboTriggers || 0) + 1;
        pushPlayLogBulletin(duel, `Combo! ${def.name} stacks.`);
      }
    }
    if ((def.effects || []).includes("nextComboFree")) {
      duel.nextComboFree = true;
      pushPlayLogBulletin(duel, "Your next outlaw combo card is free until used.");
    }
  }

  // removeDualPenalty effect
  if ((def.effects || []).includes("removeDualPenalty")) {
    duel.dualWieldPenaltyRemoved = true;
    pushPlayLogBulletin(duel, "Dual-wield penalty cleared for this duel.");
  }
  // El Doble triple-stack: if already dual, double-apply primary stats; else mirror primary into secondary
  if ((def.effects || []).includes("elDoble")) {
    elDobleEffect(duel);
  }

  // Spirit-doubling for Apache legendary
  if ((def.effects || []).includes("spiritDoubleNext")) {
    duel.spiritDoubleNext = true;
  }

  if (def.effects?.some((x) => x.startsWith("healNow"))) {
    const h = def.effects.map(parseEffect).find((e) => e.kind === "healNow");
    if (h) run.hp = Math.min(run.maxHp, run.hp + (h.value || 0));
  }
  if (def.effects?.some((x) => x.startsWith("focusCycle"))) {
    const s = def.effects.map(parseEffect).find((e) => e.kind === "focusCycle");
    const add = s?.value || 0;
    duel.focusBonusCycle += add;
    duel.playerMaxFocus += add;
    duel.playerFocus += add;
  }

  duel.message = `Played ${def.name}.`;
  if (duel.enemyMarked > 0) {
    duel.message += ` (Enemy marked ×${duel.enemyMarked})`;
  }
  if (duel.playerFocused) {
    duel.message += ` (Focused)`;
  }
  pushPlayLogCard(duel, "you", def);
  return { ok: true, feedback: feedbackLinesForCard(def, "player") };
}

function applyPermanentFromCharacter(run, def) {
  if (!run.permanent) run.permanent = {};
  for (const raw of def.effects ?? []) {
    const e = parseEffect(raw);
    if (e.kind === "maxHp") {
      run.maxHp += e.value || 0;
      run.hp += e.value || 0;
    }
    if (e.kind === "healPerDuel") run.permanent.healPerDuel = (run.permanent.healPerDuel || 0) + (e.value || 0);
    if (e.kind === "accGlobal") run.permanent.accBonus = (run.permanent.accBonus || 0) + (e.value || 0);
    if (e.kind === "focusPerRound") run.permanent.focusPerRound = (run.permanent.focusPerRound || 0) + (e.value || 0);
    if (e.kind === "staminaPerRound") run.permanent.focusPerRound = (run.permanent.focusPerRound || 0) + (e.value || 0); // legacy compat
    if (e.kind === "deadeye") run.permanent.deadeye = true;
    if (e.kind === "damageTaken") run.permanent.damageReduce = (run.permanent.damageReduce || 0) + Math.abs(e.value ?? 1);
    if (e.kind === "firstCycleAccPenalty") run.permanent.firstCycleAccPenalty = (run.permanent.firstCycleAccPenalty || 0) + (e.value || 0);
    if (e.kind === "bountyMult") run.permanent.bountyMult = (run.permanent.bountyMult ?? 1) + (e.value || 0);
    if (e.kind === "dualWieldAccPenaltyReduce") run.permanent.dualWieldAccPenaltyReduce = (run.permanent.dualWieldAccPenaltyReduce || 0) + (e.value || 0);
    if (e.kind === "spiritMax") run.permanent.spiritMax = (run.permanent.spiritMax || 10) + (e.value || 0);
    if (e.kind === "respectCapSet") run.permanent.respectMax = Math.max(run.permanent.respectMax || 5, Math.round(e.value || 0));
  }
}

function enemyPrepPlay(duel, run) {
  const { enemy } = duel;
  duel.feedbackEnemyRound = [];
  const playable = enemy.hand.filter((c) => {
    const d = getCardDef(c.id);
    return d && d.cost <= enemy.focus;
  });
  playable.sort(() => Math.random() - 0.5);
  let guard = 0;
  while (guard++ < 10) {
    if (Math.random() > duel.opponentDef.prepAggression && guard > 1) break;
    const pick = playable.find((c) => getCardDef(c.id).cost <= enemy.focus);
    if (!pick) break;
    const d = getCardDef(pick.id);
    enemy.focus -= d.cost;
    const ix = enemy.hand.indexOf(pick);
    enemy.hand.splice(ix, 1);
    if (isPersistentCardType(d.type)) {
      playPersistentCard(duel, run, pick, d, "enemy");
    } else {
      enemy.discardPile.push(pick);
      applyEnemyPlayedCard(duel, d);
    }
    pushPlayLogCard(duel, "outlaw", d);
    duel.feedbackEnemyRound.push(...feedbackLinesForCard(d, "enemy"));
    const pi = playable.indexOf(pick);
    if (pi >= 0) playable.splice(pi, 1);
  }
  for (const c of [...enemy.hand]) {
    enemy.discardPile.push(c);
  }
  enemy.hand.length = 0;
}

export function lockInPrep(duel, run) {
  if (duel.phase !== "prep") return { toShootout: false, enemyFeedback: [] };
  duel.playerLocked = true;
  duel.freeCardAvailable = false;
  for (const c of duel.playerHand) {
    duel.playerDiscard.push(c);
  }
  duel.playerHand.length = 0;

  pushPlayLogBulletin(duel, "You lock in…");
  enemyPrepPlay(duel, run);
  const enemyFeedback = duel.feedbackEnemyRound ? [...duel.feedbackEnemyRound] : [];
  duel.feedbackEnemyRound = [];

  const persistent = persistentModsFor(duel, "player");
  const cyc = duel.playerMods.hpAfterCycle + (persistent.hpAfterCycle || 0);
  if (cyc) {
    run.hp = Math.max(1, Math.min(run.maxHp, run.hp + cyc));
    duel.playerMods.hpAfterCycle = 0;
  }

  if (duel.prepRound >= 3) {
    duel.phase = "staredown_reveal";
    duel.staredownT = 2.2;
    duel.message = "STARE-DOWN — read their eyes…";
    pushPlayLogBulletin(duel, "STARE-DOWN — the moment of truth.");
    return { toShootout: false, toStaredown: true, enemyFeedback };
  }
  duel.prepRound += 1;
  startPrepRound(duel, run);
  return { toShootout: false, toStaredown: false, enemyFeedback };
}

export function duelDisplayedVolleyPreview(duel, run) {
  const pg = combinedGunStats(duel) ?? getGun(FALLBACK_GUN_ID);
  const eg = duel.enemy.activeGun?.stats ?? duel.enemy.gun;
  let permAcc = run.permanent?.accBonus ?? 0;
  if (duel.playerFocused) {
    permAcc += run.permanent?.focusedAccBonus ?? 0;
  }
  const playerMods = combinedMods(duel.playerActiveGun, duel.playerMods, duel.playerSecondaryGun, persistentModsFor(duel, "player"));
  const enemyMods = combinedMods(duel.enemy.activeGun, duel.enemyMods, null, persistentModsFor(duel, "enemy"));
  const result = {
    player: buildVolleySide(pg, playerMods, duel.playerDebuffs, permAcc),
    enemy: buildVolleySide(eg, enemyMods, duel.enemyDebuffs, 0),
  };
  if (duel.playerFocused) {
    result.player.bullets = Math.max(1, Math.round(result.player.bullets + (playerMods.focusBonusBullets || 0)));
    result.player.acc += playerMods.focusBonusAcc || 0;
  }
  if (duel.playerSecondaryGun && !duel.dualWieldPenaltyRemoved) {
    let pen = run.permanent?.dualWieldAccPenalty ?? 0.10;
    pen = Math.max(0, pen - (run.permanent?.dualWieldAccPenaltyReduce ?? 0) - (playerMods.dualWieldAccPenaltyReduce || 0));
    result.player.acc -= pen;
  }
  const cyc = duel.cycleNumber ?? 1;
  const fcp = effectiveFirstCycleAccPenalty(run);
  if (cyc === 1 && fcp > 0) {
    result.player.acc -= fcp;
  }

  // Mirror the late-cycle damage bonus so HUD preview matches actual shootout
  const lateBonus = run.permanent?.lateCycleDmgBonus ?? 0;
  if (cyc >= 3 && lateBonus > 0) {
    result.player.damageMult = Math.max(0.25, result.player.damageMult * (1 + lateBonus));
  }

  // Sheriff passive: current-HP accuracy bonus above threshold.
  result.player.sheriffHpAccBonus = sheriffHighHpAccBonus(run, run.hp);
  result.player.acc += result.player.sheriffHpAccBonus;

  // Final player clamp after all modifiers (including sheriff bonus).
  const floor = Math.max(MIN_VOLLEY_ACC, run.permanent?.accFloor ?? 0);
  result.player.acc = clampVolleyAcc(result.player.acc, floor);
  result.enemy.acc = clampVolleyAcc(result.enemy.acc);

  return result;
}

const MIN_VOLLEY_ACC = 0.08;
const MAX_VOLLEY_ACC = 0.96;

function clampVolleyAcc(acc, floor = MIN_VOLLEY_ACC) {
  return Math.min(MAX_VOLLEY_ACC, Math.max(floor, acc));
}

function sheriffHighHpAccBonus(run, hpNow = run?.hp ?? 0) {
  if (run?.classId !== "sheriff") return 0;
  const threshold = run?.permanent?.highHpAccThreshold ?? 100;
  const perHp = run?.permanent?.highHpAccPerHp ?? 0.03;
  const cap = run?.permanent?.highHpAccMax ?? 0.35;
  const above = Math.max(0, Math.floor((hpNow ?? 0) - threshold));
  if (above <= 0) return 0;
  return Math.min(Math.max(0, cap), above * Math.max(0, perHp));
}

// Legacy compatibility: old Sheriff saves can still carry this field.
function effectiveFirstCycleAccPenalty(run) {
  const base = run.permanent?.firstCycleAccPenalty ?? 0;
  if (base <= 0) return 0;
  const respect = run.permanent?.respect ?? 0;
  const each = run.permanent?.respectAccPenaltyReduceEach ?? 0;
  return Math.max(0, base - respect * each);
}

function buildVolleySide(gun, mods, debuffs, permAcc) {
  let bullets = gun.mag + mods.bulletDelta + (debuffs?.bulletNext ?? 0);
  bullets = Math.max(1, Math.round(bullets));
  let damage = gun.damage + mods.damageDelta;
  damage = Math.max(1, Math.round(damage));
  const acc = gun.accuracy + mods.accDelta + (permAcc || 0) + (debuffs?.accNext ?? 0);
  return {
    bullets,
    damage,
    acc,
    damageMult: Math.max(0.25, mods.damageMult),
    pierce: mods.pierce,
    ricochet: mods.ricochet,
    firstHitsAuto: mods.firstHitsAuto,
    dodgeRecv: mods.dodgeRecv,
    returnBulletOnHit: mods.returnBulletOnHit,
    gunName: gun.name,
  };
}

export function resolveShootout(duel, run) {
  const pg = combinedGunStats(duel) ?? getGun(FALLBACK_GUN_ID);
  const eg = duel.enemy.activeGun?.stats ?? duel.enemy.gun;
  const permAcc = run.permanent?.accBonus ?? 0;

  const playerMods = combinedMods(duel.playerActiveGun, duel.playerMods, duel.playerSecondaryGun, persistentModsFor(duel, "player"));
  const enemyMods = combinedMods(duel.enemy.activeGun, duel.enemyMods, null, persistentModsFor(duel, "enemy"));

  const P = buildVolleySide(pg, playerMods, duel.playerDebuffs, permAcc);
  const E = buildVolleySide(eg, enemyMods, duel.enemyDebuffs, 0);

  // Apply mark burst: each mark on enemy amplifies damage
  if (duel.enemyMarked > 0 && playerMods.markBurstDmg > 0) {
    const markBonus = Math.floor(playerMods.markBurstDmg * duel.enemyMarked);
    P.damage += markBonus;
  }
  // Marshal legendary: +N bullets per enemy mark
  if (duel.enemyMarked > 0 && playerMods.markBulletPerMark > 0) {
    const addBullets = playerMods.markBulletPerMark * duel.enemyMarked;
    P.bullets += addBullets;
    pushPlayLogBulletin(duel, `Federal Bounty — +${addBullets} bullets from ${duel.enemyMarked} marks.`);
  }
  // Sheriff: +1 damage per N current HP
  if (playerMods.damagePerHp > 0) {
    const bonus = Math.floor(run.hp / playerMods.damagePerHp);
    if (bonus > 0) {
      P.damage += bonus;
      pushPlayLogBulletin(duel, `Star of Justice — HP empowers your shot (+${bonus} dmg).`);
    }
  }
  // Apache spirit scaling
  const spiritMult = duel.spiritDoubleNext ? 2 : 1;
  if ((duel.spirit || 0) > 0 && spiritMult > 0) {
    if (playerMods.spiritScaleAcc > 0) {
      P.acc += duel.spirit * playerMods.spiritScaleAcc * spiritMult;
    }
    if (playerMods.spiritScaleDamage > 0) {
      P.damageMult = Math.max(0.25, P.damageMult * (1 + duel.spirit * playerMods.spiritScaleDamage * spiritMult));
    }
  }
  // Vaquero dual-wield accuracy penalty
  if (duel.playerSecondaryGun && !duel.dualWieldPenaltyRemoved) {
    let pen = run.permanent?.dualWieldAccPenalty ?? 0.10;
    pen = Math.max(0, pen - (run.permanent?.dualWieldAccPenaltyReduce ?? 0) - (playerMods.dualWieldAccPenaltyReduce || 0));
    P.acc -= pen;
  }
  // Outlaw legendary: +1 volley shot per combo trigger this duel
  if (playerMods.extraVolleyShots > 0) {
    const extra = playerMods.extraVolleyShots * (duel.duelComboTriggers || 0);
    if (extra > 0) {
      P.bullets += extra;
      pushPlayLogBulletin(duel, `No Honor Among Thieves — +${extra} bonus shots from combos.`);
    }
  }

  // Apply focus bonuses if player is focused this cycle
  if (duel.playerFocused) {
    P.bullets = Math.max(1, Math.round(P.bullets + playerMods.focusBonusBullets));
    P.acc += playerMods.focusBonusAcc;
    const focBonus = run.permanent?.focusedAccBonus ?? 0;
    if (focBonus > 0) {
      P.acc += focBonus;
    }
  }

  const cyc = duel.cycleNumber ?? 1;
  const firstCycleAccPenalty = effectiveFirstCycleAccPenalty(run);
  if (cyc === 1 && firstCycleAccPenalty > 0) {
    P.acc -= firstCycleAccPenalty;
  }

  // Final clamp floor for the player (e.g. Apache Tracker floor).
  const accFloor = Math.max(MIN_VOLLEY_ACC, run.permanent?.accFloor ?? 0);
  E.acc = clampVolleyAcc(E.acc);

  // Sheriff passive scales off current HP and can change inside the same volley.
  const currentPlayerAcc = () => {
    const sheriffBonus = sheriffHighHpAccBonus(run, run.hp);
    return clampVolleyAcc(P.acc + sheriffBonus, accFloor);
  };
  let lastSheriffBonus = sheriffHighHpAccBonus(run, run.hp);
  if (lastSheriffBonus > 0) {
    pushPlayLogBulletin(duel, `Respect steadying your aim: +${Math.round(lastSheriffBonus * 100)}% accuracy while above 100 HP.`);
  }

  // Apply late-cycle damage bonus (Vaquero: cycles 3+)
  const lateBonus = run.permanent?.lateCycleDmgBonus ?? 0;
  if (cyc >= 3 && lateBonus > 0) {
    P.damageMult = Math.max(0.25, P.damageMult * (1 + lateBonus));
  }

  const log = [];
  let pi = 0;
  let ei = 0;
  const reduce = (run.permanent?.damageReduce ?? 0) + (playerMods.damageReduce || 0);
  const deadeye = !!(run.permanent?.deadeye || playerMods.deadeye);
  const playerAccSamples = [];

  const volley = { P, E };
  const summary = {
    player: { hits: 0, misses: 0, dodged: 0, damage: 0, accuracy: currentPlayerAcc(), baseDamage: P.damage, shots: [] },
    enemy: { hits: 0, misses: 0, dodged: 0, damage: 0, accuracy: E.acc, baseDamage: E.damage, shots: [] },
  };

  const fire = (attKey, defKey, tag, bulletIndex) => {
    const att = volley[attKey];
    const def = volley[defKey];
    const side = tag === "player" ? summary.player : summary.enemy;
    const shot = { i: bulletIndex + 1, outcome: "miss", dmg: 0 };
    if (def.dodgeRecv > 0 && Math.random() < def.dodgeRecv) {
      log.push({ kind: "dodge", who: defKey === "P" ? "player" : "enemy" });
      shot.outcome = "dodged";
      side.dodged++;
      side.shots.push(shot);
      return;
    }
    const shotAcc = tag === "player" ? currentPlayerAcc() : att.acc;
    if (tag === "player") {
      const sheriffBonusNow = sheriffHighHpAccBonus(run, run.hp);
      if (sheriffBonusNow !== lastSheriffBonus) {
        const pct = Math.round(sheriffBonusNow * 100);
        if (pct > 0) {
          pushPlayLogBulletin(duel, `HP check: Sheriff accuracy bonus now +${pct}% (${Math.max(0, Math.round(run.hp))} HP).`);
        } else {
          pushPlayLogBulletin(duel, "HP check: dropped to 100 HP or lower — Sheriff accuracy bonus lost.");
        }
        lastSheriffBonus = sheriffBonusNow;
      }
      playerAccSamples.push(shotAcc);
    }
    const roll = Math.random();
    const auto = att.firstHitsAuto > bulletIndex;
    const hit = auto || roll < shotAcc;
    if (!hit) {
      log.push({ kind: "miss", by: tag });
      side.misses++;
      side.shots.push(shot);
      return;
    }
    let dmg = Math.round(att.damage * att.damageMult);
    if (deadeye && tag === "player" && roll > 0.85) dmg = Math.round(dmg * 1.3);
    if (tag === "enemy") dmg = Math.max(1, dmg - reduce);

    shot.outcome = "hit";
    shot.dmg = dmg;

    if (tag === "player") {
      duel.enemy.hp -= dmg;
      log.push({ kind: "hit", by: "player", dmg });
      if (att.ricochet && Math.random() < 0.3) {
        const rd = Math.max(1, Math.round(dmg * 0.5));
        duel.enemy.hp -= rd;
        log.push({ kind: "rico", dmg: rd });
        shot.ricochet = rd;
        side.damage += rd;
      }
      if (att.returnBulletOnHit > 0) {
        const add = Math.min(4, att.returnBulletOnHit);
        att.bullets += add;
        log.push({ kind: "return", n: add });
        shot.returnBullet = add;
      }
    } else {
      run.hp -= dmg;
      log.push({ kind: "hit", by: "enemy", dmg });
    }
    side.hits++;
    side.damage += dmg;
    side.shots.push(shot);
  };

  let rounds = 0;
  const maxRounds = 200;
  while ((pi < volley.P.bullets || ei < volley.E.bullets) && rounds < maxRounds) {
    rounds++;
    if (pi < volley.P.bullets) {
      fire("P", "E", "player", pi);
      pi++;
    }
    if (duel.enemy.hp <= 0 && run.hp <= 0) break;
    if (ei < volley.E.bullets) {
      fire("E", "P", "enemy", ei);
      ei++;
    }
    if (duel.enemy.hp <= 0 || run.hp <= 0) break;
  }

  const totalHpAfter = playerMods.hpAfterShootout;
  run.hp = Math.max(0, Math.min(run.maxHp, run.hp + totalHpAfter));

  // Clear all mods, debuffs, and synergy state for next cycle
  duel.playerMods = emptyMods();
  duel.enemyMods = emptyMods();
  duel.playerDebuffs = emptyDebuffs();
  duel.enemyDebuffs = emptyDebuffs();
  duel.enemyMarked = 0;
  duel.playerFocused = false;
  duel.focusBonusCycle = 0;
  duel.spiritDoubleNext = false;
  duel.roundOutlawCount = 0;

  let winner = null;
  if (duel.enemy.hp <= 0 && run.hp <= 0) {
    if (run.permanent?.quickdrawWin) {
      winner = "player";
      const healPct = run.permanent?.quickdrawHealPct ?? 0;
      if (healPct > 0) {
        const healed = Math.max(1, Math.round(run.maxHp * healPct));
        run.hp = Math.min(run.maxHp, healed);
        pushPlayLogBulletin(duel, `Quickdraw — you live, +${healed} HP.`);
      }
    } else {
      winner = run.hp >= duel.enemy.hp ? "player" : "enemy";
    }
  } else if (duel.enemy.hp <= 0) {
    winner = "player";
  } else if (run.hp <= 0) {
    winner = "enemy";
  }

  duel.shootoutLog = log;
  if (playerAccSamples.length) {
    summary.player.accuracy = playerAccSamples.reduce((sum, v) => sum + v, 0) / playerAccSamples.length;
  }
  summary.player.bullets = summary.player.shots.length;
  summary.enemy.bullets = summary.enemy.shots.length;
  duel.shootoutSummary = summary;
  duel.cycleCount += 1;
  duel.winner = winner;
  if (!winner) {
    duel.cycleNumber = (duel.cycleNumber ?? 1) + 1;
    advanceShowdowns(duel, run);
    pushPlayLogBulletin(duel, "Volleys done — both still standing. New prep.");
    duel.phase = "prep";
    duel.prepRound = 1;
    duel.playerStaredown = null;
    duel.enemyStaredown = null;
    duel.message = "Smoke clears. Neither buried. Prepare again.";
    startPrepRound(duel, run);
  } else {
    duel.phase = "ended";
    duel.message = winner === "player" ? "You walk away. They don't." : "The crows get a feast.";
    pushPlayLogBulletin(duel, winner === "player" ? "You win the duel." : "Outlaw wins the street.");
  }
  return { winner, log };
}

function resolveStaredown(duel, run) {
  if (duel.playerStaredown) {
    const def = getCardDef(duel.playerStaredown.id);
    if (def) {
      applyPlayerCardEffects(duel, run, def);
      pushPlayLogCard(duel, "you", def);
    }
  }
  if (duel.enemyStaredown) {
    const def = getCardDef(duel.enemyStaredown.id);
    if (def) {
      applyEnemyPlayedCard(duel, def);
      pushPlayLogCard(duel, "outlaw", def);
    }
  }
  duel.phase = "highnoon";
  duel.highNoonT = 2.4;
  duel.message = "HIGH NOON";
  pushPlayLogBulletin(duel, "HIGH NOON — steel answers.");
}

export function tickStaredown(duel, run, dt) {
  if (duel.phase !== "staredown_reveal") return;
  duel.staredownT -= dt;
  if (duel.staredownT <= 0) {
    resolveStaredown(duel, run);
  }
}

export function tickHighNoon(duel, run, dt) {
  if (duel.phase !== "highnoon") return;
  duel.highNoonT -= dt;
  if (duel.highNoonT <= 0) {
    resolveShootout(duel, run);
  }
}
