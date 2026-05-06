import { getCardDef, parseEffect, cloneCardInstance } from "./cards.js";
import { feedbackLinesForCard } from "./combat-ui.js";
import { getGun } from "./guns.js";
import { makeEnemyRuntime } from "./opponents.js";
import { buildDeckFromIds, drawCards, shuffle } from "./deck.js";

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
    staminaCycleBonus: 0,
    healNow: 0,
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
    phase: "prep",
    prepRound: 1,
    playerLocked: false,
    playerHand: [],
    playerDrawPile: buildDeckFromIds(run.deckIds),
    playerDiscard: [],
    playerStamina: 0,
    playerMaxStamina: 10 + (run.permanent?.staminaPerRound ?? 0),
    staminaBonusThisCycle: 0,
    playerMods: emptyMods(),
    enemyMods: emptyMods(),
    playerDebuffs: emptyDebuffs(),
    enemyDebuffs: emptyDebuffs(),
    shootoutLog: [],
    message: "Round 1 — the street goes quiet.",
    winner: null,
    highNoonT: 0,
    feedbackEnemyRound: [],
    playLog: [],
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

export function refillStamina(duel, run) {
  const base = 10 + (run.permanent?.staminaPerRound ?? 0);
  duel.playerMaxStamina = base + duel.staminaBonusThisCycle;
  duel.playerStamina = duel.playerMaxStamina;
  duel.enemy.stamina = duel.enemy.maxStamina;
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
    else if (e.kind === "staminaCycle") mods.staminaCycleBonus += sign * (e.value || 0);
    else if (e.kind === "healNow") mods.healNow += sign * (e.value || 0);
  }
}

function applyPlayerCardEffects(duel, def) {
  const eff = def.effects ?? [];
  for (const raw of eff) {
    const e = parseEffect(raw);
    if (e.kind === "enemyAccNext") {
      duel.enemyDebuffs.accNext += e.value || 0;
    } else if (e.kind === "enemyBullets") {
      duel.enemyDebuffs.bulletNext += e.value || 0;
    } else {
      mergeGunIntoMods(duel.playerMods, [raw], 1);
    }
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
    } else {
      mergeGunIntoMods(duel.enemyMods, [raw], 1);
    }
  }
}

export function startPrepRound(duel, run) {
  duel.playerLocked = false;
  duel.message = `Preparation — round ${duel.prepRound} of 3. Play your hand, then Lock In.`;
  pushPlayLogBulletin(duel, `Preparation round ${duel.prepRound}/3 — draw and play.`);
  refillStamina(duel, run);

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

  const heal = run.permanent?.healPerDuel ?? 0;
  if (heal) {
    run.hp = Math.min(run.maxHp, run.hp + heal);
  }
}

export function tryPlayCard(duel, run, cardUid) {
  const idx = duel.playerHand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return { ok: false, reason: "No card" };
  const card = duel.playerHand[idx];
  const def = getCardDef(card.id);
  if (!def) return { ok: false, reason: "Bad card" };
  if (duel.playerLocked) return { ok: false, reason: "Locked in" };
  if (def.cost > duel.playerStamina) return { ok: false, reason: "Not enough stamina" };

  if (def.type === "character") {
    applyPermanentFromCharacter(run, def);
    duel.playerStamina -= def.cost;
    duel.playerHand.splice(idx, 1);
    duel.playerDiscard.push(card);
    duel.message = `${def.name} — carries for the whole trail.`;
    pushPlayLogCard(duel, "you", def);
    return { ok: true, character: true, feedback: feedbackLinesForCard(def, "player") };
  }

  duel.playerStamina -= def.cost;
  duel.playerHand.splice(idx, 1);
  duel.playerDiscard.push(card);

  if (def.type === "gun") {
    applyPlayerCardEffects(duel, def);
  } else {
    applyPlayerCardEffects(duel, def);
  }

  if (def.effects?.some((x) => x.startsWith("healNow"))) {
    const h = def.effects.map(parseEffect).find((e) => e.kind === "healNow");
    if (h) run.hp = Math.min(run.maxHp, run.hp + (h.value || 0));
  }
  if (def.effects?.some((x) => x.startsWith("staminaCycle"))) {
    const s = def.effects.map(parseEffect).find((e) => e.kind === "staminaCycle");
    const add = s?.value || 0;
    duel.staminaBonusThisCycle += add;
    duel.playerMaxStamina += add;
    duel.playerStamina += add;
  }

  duel.message = `Played ${def.name}.`;
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
    if (e.kind === "staminaPerRound") run.permanent.staminaPerRound = (run.permanent.staminaPerRound || 0) + (e.value || 0);
    if (e.kind === "deadeye") run.permanent.deadeye = true;
    if (e.kind === "damageTaken") run.permanent.damageReduce = (run.permanent.damageReduce || 0) + Math.abs(e.value ?? 1);
  }
}

function enemyPrepPlay(duel) {
  const { enemy } = duel;
  duel.feedbackEnemyRound = [];
  const playable = enemy.hand.filter((c) => {
    const d = getCardDef(c.id);
    return d && d.type !== "character" && d.cost <= enemy.stamina;
  });
  playable.sort(() => Math.random() - 0.5);
  let guard = 0;
  while (guard++ < 10) {
    if (Math.random() > duel.opponentDef.prepAggression && guard > 1) break;
    const pick = playable.find((c) => getCardDef(c.id).cost <= enemy.stamina);
    if (!pick) break;
    const d = getCardDef(pick.id);
    enemy.stamina -= d.cost;
    const ix = enemy.hand.indexOf(pick);
    enemy.hand.splice(ix, 1);
    enemy.discard.push(pick);
    applyEnemyPlayedCard(duel, d);
    pushPlayLogCard(duel, "outlaw", d);
    duel.feedbackEnemyRound.push(...feedbackLinesForCard(d, "enemy"));
    const pi = playable.indexOf(pick);
    if (pi >= 0) playable.splice(pi, 1);
  }
  for (const c of [...enemy.hand]) {
    enemy.discard.push(c);
  }
  enemy.hand.length = 0;
}

export function lockInPrep(duel, run) {
  if (duel.phase !== "prep") return { toShootout: false, enemyFeedback: [] };
  duel.playerLocked = true;
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
    duel.phase = "highnoon";
    duel.highNoonT = 2.4;
    duel.message = "HIGH NOON";
    pushPlayLogBulletin(duel, "HIGH NOON — steel answers.");
    return { toShootout: true, enemyFeedback };
  }
  duel.prepRound += 1;
  startPrepRound(duel, run);
  return { toShootout: false, enemyFeedback };
}

export function duelDisplayedVolleyPreview(duel, run) {
  const pg = getGun(run.gunId);
  const eg = duel.enemy.gun;
  const permAcc = run.permanent?.accBonus ?? 0;
  return {
    player: buildVolleySide(pg, duel.playerMods, duel.playerDebuffs, permAcc),
    enemy: buildVolleySide(eg, duel.enemyMods, duel.enemyDebuffs, 0),
  };
}

function buildVolleySide(gun, mods, debuffs, permAcc) {
  let bullets = gun.mag + mods.bulletDelta + (debuffs?.bulletNext ?? 0);
  bullets = Math.max(1, Math.round(bullets));
  let damage = gun.damage + mods.damageDelta;
  damage = Math.max(1, Math.round(damage));
  let acc = gun.accuracy + mods.accDelta + (permAcc || 0) + (debuffs?.accNext ?? 0);
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

  const P = buildVolleySide(pg, duel.playerMods, duel.playerDebuffs, permAcc);
  const E = buildVolleySide(eg, duel.enemyMods, duel.enemyDebuffs, 0);

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
  duel.playerMods = emptyMods();
  duel.enemyMods = emptyMods();
  duel.playerDebuffs = emptyDebuffs();
  duel.enemyDebuffs = emptyDebuffs();

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
    pushPlayLogBulletin(duel, "Volleys done — both still standing. New prep.");
    duel.phase = "prep";
    duel.prepRound = 1;
    duel.message = "Smoke clears. Neither buried. Prepare again.";
    startPrepRound(duel, run);
  } else {
    duel.phase = "ended";
    duel.message = winner === "player" ? "You walk away. They don't." : "The crows get a feast.";
    pushPlayLogBulletin(duel, winner === "player" ? "You win the duel." : "Outlaw wins the street.");
  }
  return { winner, log };
}

export function tickHighNoon(duel, run, dt) {
  if (duel.phase !== "highnoon") return;
  duel.highNoonT -= dt;
  if (duel.highNoonT <= 0) {
    resolveShootout(duel, run);
  }
}
