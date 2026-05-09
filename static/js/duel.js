import { getCardDef, parseEffect, cloneCardInstance } from "./cards.js";
import { feedbackLinesForCard } from "./combat-ui.js";
import { getGun } from "./guns.js";
import { makeEnemyRuntime } from "./opponents.js";
import { buildDeckFromIds, drawCards, shuffle } from "./deck.js";

const STAREDOWN_POOL = ["std_dead_eye", "std_warning_shot", "std_iron_will", "std_marked_man"];

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
  };
}

export function emptyDebuffs() {
  return { accNext: 0, bulletNext: 0 };
}

/**
 * @param {import('./opponents.js').Opponent} oppDef
 * @param {object} run
 */
export function createDuel(oppDef, run) {
  const enemy = makeEnemyRuntime(oppDef);
  const pool = oppDef.deckTemplate.map((id) => cloneCardInstance(id)).filter(Boolean);
  enemy.drawPile = shuffle(pool);
  enemy.discardPile = [];
  enemy.hand = [];

  return {
    opponentDef: oppDef,
    enemy,
    phase: "staredown_commit",
    prepRound: 1,
    cycleNumber: 1,
    playerLocked: false,
    playerHand: [],
    playerDrawPile: buildDeckFromIds(run.deckIds),
    playerDiscard: [],
    playerFocus: 0,
    playerMaxFocus: 5 + (run.permanent?.focusPerRound ?? 0),
    focusBonusCycle: 0,
    playerMods: emptyMods(),
    enemyMods: emptyMods(),
    playerDebuffs: emptyDebuffs(),
    enemyDebuffs: emptyDebuffs(),
    // Synergy state (persists across prep rounds, cleared after shootout)
    enemyMarked: 0,
    playerFocused: false,
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
  const base = 5 + (run.permanent?.focusPerRound ?? 0);
  duel.playerMaxFocus = base + duel.focusBonusCycle;
  duel.playerFocus = duel.playerMaxFocus;
  duel.enemy.focus = duel.enemy.maxFocus;
}

// Legacy alias used by external modules that read run.permanent.staminaPerRound
// (kept for save-state compatibility)
export { refillFocus as refillStamina };

export function dealStaredownChoices(duel) {
  const pool = shuffle([...STAREDOWN_POOL]);
  duel.staredownChoices = pool.slice(0, 4).map((id) => cloneCardInstance(id)).filter(Boolean);
}

function commitEnemyStaredown(duel) {
  const eligible = duel.enemy.drawPile.filter((c) => {
    const d = getCardDef(c.id);
    return d && d.type !== "character" && d.type !== "gun";
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
    else if (e.kind === "damageShootout") mods.damageMult += sign * (e.value || 0);
    else if (e.kind === "pierce") mods.pierce = sign > 0;
    else if (e.kind === "ricochet") mods.ricochet = sign > 0;
    else if (e.kind === "firstHitsAuto") mods.firstHitsAuto += sign * (e.value || 0);
    else if (e.kind === "dodgeRecv") mods.dodgeRecv += sign * (e.value || 0);
    else if (e.kind === "returnBulletOnHit") mods.returnBulletOnHit += sign * (e.value || 0);
    else if (e.kind === "hpAfterShootout") mods.hpAfterShootout += sign * (e.value || 0);
    else if (e.kind === "hpAfterCycle") mods.hpAfterCycle += sign * (e.value || 0);
    else if (e.kind === "focusCycle") mods.focusCycleBonus += sign * (e.value || 0);
    else if (e.kind === "healNow") mods.healNow += sign * (e.value || 0);
    // Synergy effects
    else if (e.kind === "markBurst") mods.markBurstDmg += sign * (e.value || 0);
    else if (e.kind === "focusBonusBullets") mods.focusBonusBullets += sign * (e.value || 0);
    else if (e.kind === "focusBonusAcc") mods.focusBonusAcc += sign * (e.value || 0);
    else if (e.kind === "gainFocused" && sign > 0) mods.gainFocused = true;
  }
}

function applyPlayerCardEffects(duel, run, def) {
  const eff = def.effects ?? [];
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

function applyEnemyGunAuto(duel, gunCardDef) {
  if (gunCardDef?.type === "gun") mergeGunIntoMods(duel.enemyMods, gunCardDef.effects ?? [], 1);
}

function applyEnemyPlayedCard(duel, def) {
  if (def.type === "gun") {
    mergeGunIntoMods(duel.enemyMods, def.effects ?? [], 1);
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

export function startPrepRound(duel, run) {
  duel.playerLocked = false;
  duel.freeCardAvailable = !!run.permanent?.freeFirstCardPerRound;
  duel.message = `Preparation — round ${duel.prepRound} of 3. Play your hand, then Lock In.`;
  pushPlayLogBulletin(duel, `Preparation round ${duel.prepRound}/3 — draw and play.`);
  refillFocus(duel, run);

  const gunPool = ["gun_quick_draw", "gun_heavy_slugger", "gun_oiled_chamber", "gun_bandit_gambit"];
  const gid = gunPool[(Math.random() * gunPool.length) | 0];
  const gunCard = cloneCardInstance(gid);
  const drawn = drawCards(duel.playerDrawPile, duel.playerDiscard, 3);
  duel.playerHand.push(gunCard, ...drawn);

  const enemyGunIds = ["gun_quick_draw", "gun_heavy_slugger", "gun_oiled_chamber", "gun_bandit_gambit"];
  const egid = enemyGunIds[(Math.random() * enemyGunIds.length) | 0];
  const enemyGun = cloneCardInstance(egid);
  const enemyGunDef = getCardDef(enemyGun.id);
  applyEnemyGunAuto(duel, enemyGunDef);
  if (enemyGunDef) {
    pushPlayLogCard(duel, "outlaw", enemyGunDef);
  }

  const eDraw = drawCards(duel.enemy.drawPile, duel.enemy.discardPile, 3);
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

  const isCharacter = def.type === "character";
  const usingFreebie = !isCharacter && duel.freeCardAvailable === true;
  const cost = usingFreebie ? 0 : def.cost;

  if (cost > duel.playerFocus) return { ok: false, reason: "Not enough focus" };

  if (def.type === "character") {
    applyPermanentFromCharacter(run, def);
    duel.playerFocus -= def.cost;
    duel.playerHand.splice(idx, 1);
    duel.playerDiscard.push(card);
    duel.message = `${def.name} — carries for the whole trail.`;
    pushPlayLogCard(duel, "you", def);
    return { ok: true, character: true, feedback: feedbackLinesForCard(def, "player") };
  }

  duel.playerFocus -= cost;
  if (usingFreebie) {
    duel.freeCardAvailable = false;
    pushPlayLogBulletin(duel, "Read the wind — first card was free.");
  }
  duel.playerHand.splice(idx, 1);
  duel.playerDiscard.push(card);

  applyPlayerCardEffects(duel, run, def);

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
  }
}

function enemyPrepPlay(duel) {
  const { enemy } = duel;
  duel.feedbackEnemyRound = [];
  const playable = enemy.hand.filter((c) => {
    const d = getCardDef(c.id);
    return d && d.type !== "character" && d.cost <= enemy.focus;
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
    enemy.discardPile.push(pick);
    applyEnemyPlayedCard(duel, d);
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
  enemyPrepPlay(duel);
  const enemyFeedback = duel.feedbackEnemyRound ? [...duel.feedbackEnemyRound] : [];
  duel.feedbackEnemyRound = [];

  const cyc = duel.playerMods.hpAfterCycle;
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
  const pg = getGun(run.gunId);
  const eg = duel.enemy.gun;
  let permAcc = run.permanent?.accBonus ?? 0;
  if (duel.playerFocused) {
    permAcc += run.permanent?.focusedAccBonus ?? 0;
  }
  const result = {
    player: buildVolleySide(pg, duel.playerMods, duel.playerDebuffs, permAcc),
    enemy: buildVolleySide(eg, duel.enemyMods, duel.enemyDebuffs, 0),
  };
  const cyc = duel.cycleNumber ?? 1;
  const fcp = run.permanent?.firstCycleAccPenalty ?? 0;
  if (cyc === 1 && fcp > 0) {
    result.player.acc = Math.max(0.08, result.player.acc - fcp);
  }

  // Mirror the late-cycle damage bonus so HUD preview matches actual shootout
  const lateBonus = run.permanent?.lateCycleDmgBonus ?? 0;
  if (cyc >= 3 && lateBonus > 0) {
    result.player.damageMult = Math.max(0.25, result.player.damageMult * (1 + lateBonus));
  }
  return result;
}

function buildVolleySide(gun, mods, debuffs, permAcc, cycleAccPenalty = 0) {
  let bullets = gun.mag + mods.bulletDelta + (debuffs?.bulletNext ?? 0);
  bullets = Math.max(1, Math.round(bullets));
  let damage = gun.damage + mods.damageDelta;
  damage = Math.max(1, Math.round(damage));
  let acc = gun.accuracy + mods.accDelta + (permAcc || 0) + (debuffs?.accNext ?? 0) - (cycleAccPenalty || 0);
  acc = Math.min(0.96, Math.max(0.08, acc));
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
  const pg = getGun(run.gunId);
  const eg = duel.enemy.gun;
  const permAcc = run.permanent?.accBonus ?? 0;
  const cycleAccPenalty = duel.cycleNumber === 1 ? (run.permanent?.firstCycleAccPenalty ?? 0) : 0;

  const P = buildVolleySide(pg, duel.playerMods, duel.playerDebuffs, permAcc, cycleAccPenalty);
  const E = buildVolleySide(eg, duel.enemyMods, duel.enemyDebuffs, 0);

  // Apply mark burst: each mark on enemy amplifies damage
  if (duel.enemyMarked > 0 && duel.playerMods.markBurstDmg > 0) {
    const markBonus = Math.floor(duel.playerMods.markBurstDmg * duel.enemyMarked);
    P.damage += markBonus;
  }

  // Apply focus bonuses if player is focused this cycle
  if (duel.playerFocused) {
    P.bullets = Math.max(1, Math.round(P.bullets + duel.playerMods.focusBonusBullets));
    P.acc = Math.min(0.96, P.acc + duel.playerMods.focusBonusAcc);
    const focBonus = run.permanent?.focusedAccBonus ?? 0;
    if (focBonus > 0) {
      P.acc = Math.min(0.96, P.acc + focBonus);
    }
  }

  const cyc = duel.cycleNumber ?? 1;
  const firstCycleAccPenalty = run.permanent?.firstCycleAccPenalty ?? 0;
  if (cyc === 1 && firstCycleAccPenalty > 0) {
    P.acc = Math.max(0.08, P.acc - firstCycleAccPenalty);
  }

  // Apply late-cycle damage bonus (Vaquero: cycles 3+)
  const lateBonus = run.permanent?.lateCycleDmgBonus ?? 0;
  if (cyc >= 3 && lateBonus > 0) {
    P.damageMult = Math.max(0.25, P.damageMult * (1 + lateBonus));
  }

  // Apply late-cycle damage bonus (Vaquero: cycles 3+)
  const cyc = duel.cycleNumber ?? 1;
  const lateBonus = run.permanent?.lateCycleDmgBonus ?? 0;
  if (cyc >= 3 && lateBonus > 0) {
    P.damageMult = Math.max(0.25, P.damageMult * (1 + lateBonus));
  }

  // Vaquero late-cycle damage bonus: active from cycle 3 onward
  const cyc = duel.cycleNumber ?? 1;
  const lateBonus = run.permanent?.lateCycleDmgBonus ?? 0;
  if (cyc >= 3 && lateBonus > 0) {
    P.damageMult = Math.max(0.25, P.damageMult * (1 + lateBonus));
  }

  const log = [];
  let pi = 0;
  let ei = 0;
  const reduce = run.permanent?.damageReduce ?? 0;
  const deadeye = run.permanent?.deadeye;

  const volley = { P, E };

  const fire = (attKey, defKey, tag, bulletIndex) => {
    const att = volley[attKey];
    const def = volley[defKey];
    if (def.dodgeRecv > 0 && Math.random() < def.dodgeRecv) {
      log.push({ kind: "dodge", who: defKey === "P" ? "player" : "enemy" });
      return;
    }
    const roll = Math.random();
    const auto = att.firstHitsAuto > bulletIndex;
    const hit = auto || roll < att.acc;
    if (!hit) {
      log.push({ kind: "miss", by: tag });
      return;
    }
    let dmg = Math.round(att.damage * att.damageMult);
    if (deadeye && tag === "player" && roll > 0.85) dmg = Math.round(dmg * 1.3);
    if (tag === "enemy") dmg = Math.max(1, dmg - reduce);

    if (tag === "player") {
      duel.enemy.hp -= dmg;
      log.push({ kind: "hit", by: "player", dmg });
      if (att.ricochet && Math.random() < 0.3) {
        const rd = Math.max(1, Math.round(dmg * 0.5));
        duel.enemy.hp -= rd;
        log.push({ kind: "rico", dmg: rd });
      }
      if (att.returnBulletOnHit > 0) {
        const add = Math.min(4, att.returnBulletOnHit);
        att.bullets += add;
        log.push({ kind: "return", n: add });
      }
    } else {
      run.hp -= dmg;
      log.push({ kind: "hit", by: "enemy", dmg });
    }
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

  run.hp = Math.max(0, Math.min(run.maxHp, run.hp + duel.playerMods.hpAfterShootout));

  // Clear all mods, debuffs, and synergy state for next cycle
  duel.playerMods = emptyMods();
  duel.enemyMods = emptyMods();
  duel.playerDebuffs = emptyDebuffs();
  duel.enemyDebuffs = emptyDebuffs();
  duel.enemyMarked = 0;
  duel.playerFocused = false;
  duel.focusBonusCycle = 0;

  let winner = null;
  if (duel.enemy.hp <= 0 && run.hp <= 0) {
    winner = run.hp >= duel.enemy.hp ? "player" : "enemy";
  } else if (duel.enemy.hp <= 0) {
    winner = "player";
  } else if (run.hp <= 0) {
    winner = "enemy";
  }

  duel.shootoutLog = log;
  duel.winner = winner;
  if (!winner) {
    duel.cycleNumber = (duel.cycleNumber ?? 1) + 1;
    pushPlayLogBulletin(duel, "Volleys done — both still standing. New prep.");
    duel.cycleNumber = (duel.cycleNumber || 1) + 1;
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
