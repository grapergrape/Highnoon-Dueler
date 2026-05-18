import { getCardDef, parseEffect, effectsForCardLevel, upgradedCardDef } from "../data/cards.js";
import { feedbackLinesForCard } from "../ui/combat-ui.js";
import { getGun, FALLBACK_GUN_ID, starterGunIdForClass } from "../data/guns.js";
import { itemBonuses } from "../data/items.js";
import { makeEnemyRuntime } from "../data/opponents.js";
import { buildDeckFromIds, drawCards } from "../data/deck.js";

const START_NERVE = 4;
const BASE_MAX_NERVE = 7;
const BASE_NERVE_GAIN = 3;
const HAND_SIZE = 5;
const SHOWDOWN_SECONDS = 1.25;
const CALM_CARD_LIMIT = 3;
const PLAY_LOG_CAP = 140;
const POSITION_MIN = 0;
const POSITION_MAX = 3;
const POSITION_MULT = {
  0: 0.8,
  1: 1.0,
  2: 1.15,
  3: 1.5,
};
const POSITION_LABEL = {
  0: "Exposed",
  1: "Steady",
  2: "Lined up",
  3: "Perfect angle",
};

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function roundInt(n) {
  return Math.round(Number.isFinite(n) ? n : 0);
}

function gunCapacity(gunDef) {
  return Math.max(1, roundInt(gunDef?.capacity ?? gunDef?.mag ?? 5));
}

function gunBulletDamage(gunDef) {
  return Math.max(1, roundInt(gunDef?.bulletDamage ?? gunDef?.damage ?? 6));
}

function gunStartLoaded(gunDef) {
  return Math.max(0, roundInt(gunDef?.startLoaded ?? 0));
}

function gunProfileFor(gunDef) {
  if (!gunDef) return "balanced";
  if (gunDef.profile) return gunDef.profile;
  const capacity = gunCapacity(gunDef);
  const type = gunDef.weaponType ?? "";
  if (type === "shotgun") return "scatter";
  if (type === "rifle" || type === "bow") return "precision";
  if (type === "carbine" || capacity >= 7) return "repeater";
  if (capacity <= 3 || gunBulletDamage(gunDef) >= 9) return "quickdraw";
  return "balanced";
}

function makeActiveGun(gunDef) {
  if (!gunDef) return null;
  return {
    id: gunDef.id,
    name: gunDef.name,
    rarity: gunDef.rarity,
    flavor: gunDef.flavor ?? null,
    backstory: gunDef.backstory ?? null,
    effects: [...(gunDef.effects ?? [])],
    stats: {
      capacity: gunCapacity(gunDef),
      startLoaded: gunStartLoaded(gunDef),
      bulletDamage: gunBulletDamage(gunDef),
      name: gunDef.name,
      weaponType: gunDef.weaponType ?? null,
      profile: gunProfileFor(gunDef),
    },
  };
}

function combinedGunStats(duel) {
  const primary = duel.playerActiveGun?.stats;
  if (!primary) return {
    capacity: 5,
    startLoaded: 0,
    bulletDamage: 6,
    name: "Service Revolver",
    weaponType: "revolver",
    profile: "balanced",
  };
  const secondary = duel.playerSecondaryGun?.stats;
  if (!secondary) return { ...primary };
  return {
    capacity: primary.capacity + secondary.capacity,
    startLoaded: primary.startLoaded + secondary.startLoaded,
    bulletDamage: Math.max(1, Math.round((primary.bulletDamage + secondary.bulletDamage) / 2)),
    name: `${primary.name} + ${secondary.name}`,
    weaponType: "dual",
    profile: "dual",
  };
}

function resolveStartingGun(run) {
  const id = starterGunIdForClass(run?.classId) || run?.gunId || run?.activeGunId || FALLBACK_GUN_ID;
  return getGun(id);
}

function syncAliases(duel) {
  duel.playerFocus = duel.nerve;
  duel.playerMaxFocus = duel.maxNerve;
  duel.playerPlaysRemaining = Infinity;
  duel.playerMaxPlaysThisRound = Infinity;
}

function maxPositionFor(duel) {
  return Math.max(POSITION_MAX, POSITION_MAX + Math.max(0, roundInt(duel.positionCapBonus || 0)));
}

function setPosition(duel, value) {
  duel.position = clamp(roundInt(value), POSITION_MIN, maxPositionFor(duel));
}

function addPosition(duel, value) {
  const before = roundInt(duel.position ?? 1);
  setPosition(duel, before + roundInt(value));
  return Math.max(0, roundInt(duel.position ?? before) - before);
}

function positionMultiplier(position) {
  const p = clamp(roundInt(position), POSITION_MIN, POSITION_MAX);
  return POSITION_MULT[p] ?? 1;
}

function quickdrawDamageBonusFor(duel, gun, bullets) {
  const played = Math.max(0, roundInt(duel?.cardsPlayedThisRound || 0));
  if (bullets <= 0 || played > 2) return 0;
  const profile = gun?.profile ?? "balanced";
  if (profile === "quickdraw") return 2;
  if (profile === "scatter" && bullets <= 2) return 1;
  if (profile === "dual" && bullets <= 4) return 1;
  return 1;
}

function profileDamageBonusFor(duel, gun, bullets) {
  if (bullets <= 0) return { damage: 0, labels: [] };
  const profile = gun?.profile ?? "balanced";
  const labels = [];
  let damage = 0;
  if (profile === "scatter" && bullets <= 3) {
    damage += 2;
    labels.push("Scatter +2");
  }
  if (profile === "precision" && roundInt(duel?.position || 0) >= 2) {
    const add = roundInt(duel.position || 0) >= 3 ? 2 : 1;
    damage += add;
    labels.push(`Precision +${add}`);
  }
  if (profile === "repeater" && bullets >= Math.min(5, Math.max(1, roundInt(gun?.capacity || 5)))) {
    damage += 1;
    labels.push("Repeater +1");
  }
  if (profile === "dual" && bullets > 0 && bullets % 2 === 0) {
    damage += 1;
    labels.push("Paired +1");
  }
  const quickdraw = quickdrawDamageBonusFor(duel, gun, bullets);
  if (quickdraw > 0) {
    damage += quickdraw;
    labels.push(`Quickdraw +${quickdraw}`);
  }
  return { damage, labels };
}

export function positionName(position) {
  const p = clamp(roundInt(position), POSITION_MIN, POSITION_MAX);
  return POSITION_LABEL[p] ?? "Steady";
}

function currentCapacity(duel) {
  return combinedGunStats(duel).capacity
    + Math.max(0, roundInt(duel.itemCapacityBonus || 0))
    + Math.max(0, roundInt(duel.overcap || 0));
}

function loadBullets(duel, value) {
  const add = Math.max(0, roundInt(value));
  if (add <= 0) return 0;
  const before = Math.max(0, roundInt(duel.loadedBullets || 0));
  const cap = currentCapacity(duel);
  duel.loadedBullets = clamp(before + add, 0, cap);
  return duel.loadedBullets - before;
}

function ensureDeedStats(duel) {
  if (!duel.deedStats) {
    duel.deedStats = {
      bulletDamageDealt: 0,
      armorPrevented: 0,
      classResourceApplied: 0,
      maxLoadedShowdowns: 0,
      hpPaid: 0,
    };
  }
  return duel.deedStats;
}

function recordClassResource(duel, run, kind, amount) {
  const n = Math.max(0, roundInt(amount || 0));
  if (n <= 0) return;
  const classId = run?.classId || duel?.classId;
  const counts = (
    (classId === "outlaw" && ["infamy", "infamyPerRound", "infamyOnHit", "infamyLoad", "infamyDamage", "infamyArmor", "outlawCombo"].includes(kind))
    || (classId === "sheriff" && ["deputy", "deputies", "deputyArmorPerRound", "deputyLoadOnAttack", "deputyBlock"].includes(kind))
    || (classId === "marshal" && ["markEnemy", "markBurst", "markBulletPerMark", "caseFile", "casePerRound", "casePath", "caseOnMark", "caseSpendLoad", "caseSpendArmor"].includes(kind))
    || (classId === "apache_tracker" && ["spirit", "spiritScaleDamage", "spiritScaleAcc", "spiritScaleEnemyAcc", "track", "trackDamage", "trackLoad", "snare", "snarePerRound"].includes(kind))
    || (classId === "vaquero" && ["position", "positionPerRound", "flourishDamage"].includes(kind))
    || (classId === "bounty_hunter" && ["bountyOnHit", "lifestealOnHit", "infection", "infectionWeak", "infectionLeech", "consumeInfection"].includes(kind))
  );
  if (counts) ensureDeedStats(duel).classResourceApplied += n;
}

function discardHand(duel) {
  for (const c of duel.playerHand) duel.playerDiscard.push(c);
  duel.playerHand.length = 0;
}

function trimPlayLog(duel) {
  while ((duel.playLog?.length ?? 0) > PLAY_LOG_CAP) duel.playLog.shift();
}

export function pushPlayLogBulletin(duel, text) {
  if (!duel.playLog) duel.playLog = [];
  trimPlayLog(duel);
  duel.playLog.push({ kind: "bulletin", text, roundNumber: duel.roundNumber });
}

export function pushPlayLogCard(duel, actor, def) {
  if (!duel.playLog) duel.playLog = [];
  trimPlayLog(duel);
  const cardType = def.effects?.includes("staredownOnly") ? "staredown" : def.type;
  duel.playLog.push({
    kind: "card",
    actor,
    id: def.id,
    name: def.name,
    cardType,
    cost: def.cost ?? 0,
    effects: [...effectsForCardLevel(def, def.showdownLevel || 1)],
    roundNumber: duel.roundNumber,
  });
}

function defaultIntentForOpponent(opp, roundNumber) {
  const tier = Math.max(1, roundInt(opp?.difficultyTier ?? 1));
  const role = opp?.role ?? "easy";
  const boss = role === "boss";
  const medium = role === "medium";
  const baseDamage = Math.max(4, Math.min(17, 5 + Math.floor(tier * 0.75)));
  if (boss && roundNumber % 4 === 0) {
    return {
      id: "boss_warning_shot",
      type: "attack",
      label: "Judgment Shot",
      bullets: 1,
      damage: baseDamage + 12,
      description: `Attack 1x${baseDamage + 12}.`,
    };
  }
  if (roundNumber % 3 === 2) {
    return {
      id: "take_cover",
      type: "armor",
      label: "Take Cover",
      armor: 7 + tier,
      description: `Gain ${7 + tier} Armor.`,
    };
  }
  const bullets = boss ? 3 : (medium ? 2 : (roundNumber % 3 === 0 ? 2 : 1));
  return {
    id: "steady_fire",
    type: "attack",
    label: "Steady Fire",
    bullets,
    damage: baseDamage,
    description: `Attack ${bullets}x${baseDamage}.`,
  };
}

function cloneIntent(intent) {
  return intent ? JSON.parse(JSON.stringify(intent)) : null;
}

function selectEnemyIntent(duel) {
  const opp = duel.opponentDef;
  const pattern = Array.isArray(opp.intentPattern) ? opp.intentPattern : null;
  const intents = opp.intents && typeof opp.intents === "object" ? opp.intents : null;
  if (pattern?.length && intents) {
    const key = pattern[(duel.roundNumber - 1) % pattern.length];
    const intent = cloneIntent(intents[key]);
    if (intent) {
      intent.id = intent.id ?? key;
      return intent;
    }
  }
  return defaultIntentForOpponent(opp, duel.roundNumber);
}

function intentConditionalModifiers(duel, intent = duel?.enemyIntent) {
  const out = { damage: 0, bullets: 0, enemyArmor: 0, notes: [] };
  if (!duel || !intent) return out;
  const loaded = Math.max(0, roundInt(duel.loadedBullets || 0));
  const armor = Math.max(0, roundInt(duel.playerArmor || 0));
  const nerve = Math.max(0, roundInt(duel.nerve || 0));
  const position = roundInt(duel.position || 0);
  const cardsPlayed = Math.max(0, roundInt(duel.cardsPlayedThisRound || 0));

  if (intent.bonusDamageIfNoArmor && armor <= 0) {
    out.damage += Math.max(0, roundInt(intent.bonusDamageIfNoArmor));
    out.notes.push("No Armor punished");
  }
  if (intent.bonusDamageIfNerveAtLeast && nerve >= roundInt(intent.bonusDamageIfNerveAtLeast)) {
    const add = Math.max(0, roundInt(intent.bonusDamage || 1));
    out.damage += add;
    out.notes.push(`Unused Nerve +${add}`);
  }
  if (intent.bonusDamageIfPositionBelow != null && position <= roundInt(intent.bonusDamageIfPositionBelow)) {
    const add = Math.max(0, roundInt(intent.positionPunishDamage || 2));
    out.damage += add;
    out.notes.push(`Low Position +${add}`);
  }
  if (intent.bonusDamageIfCardsPlayedAtLeast && cardsPlayed >= roundInt(intent.bonusDamageIfCardsPlayedAtLeast)) {
    const add = Math.max(0, roundInt(intent.cardPunishDamage || 1));
    out.damage += add;
    out.notes.push(`Long prep +${add}`);
  }
  if (intent.punishRepeatedTypes && duel.repeatedCardTypeThisRound) {
    const add = Math.max(0, roundInt(intent.repeatedTypeDamage || 2));
    out.damage += add;
    out.notes.push(`Repeat ${duel.repeatedCardTypeThisRound} +${add}`);
  }
  if (intent.guardLoadedAt && loaded >= roundInt(intent.guardLoadedAt)) {
    const add = Math.max(0, roundInt(intent.guardLoadedArmor || 8));
    out.enemyArmor += add;
    out.notes.push(`Guard +${add} Armor`);
  }
  if (intent.spoilLowVolleyAt && loaded > 0 && loaded <= roundInt(intent.spoilLowVolleyAt)) {
    const add = Math.max(0, roundInt(intent.spoilLowVolleyArmor || 6));
    out.enemyArmor += add;
    out.notes.push(`Spoil +${add} Armor`);
  }
  return out;
}

function enemyArmorForIntent(duel, intent = duel?.enemyIntent) {
  if (!intent) return 0;
  const base = intent.type === "armor" ? Math.max(0, roundInt(intent.armor || 0)) : 0;
  return base + intentConditionalModifiers(duel, intent).enemyArmor;
}

function intentAttackMath(duel, intent = duel.enemyIntent) {
  if (!intent || intent.type !== "attack") return { bullets: 0, damage: 0, raw: 0 };
  const mods = intentConditionalModifiers(duel, intent);
  const bullets = Math.max(0, roundInt(intent.bullets ?? 1) + roundInt(duel.enemyLoadedBullets || 0) + mods.bullets);
  const markReducePer = Math.max(0, roundInt(duel.runPermanent?.markDamageReducePerMark || 0));
  const markReduceCap = Number.isFinite(duel.runPermanent?.markDamageReduceCap)
    ? Math.max(0, roundInt(duel.runPermanent.markDamageReduceCap))
    : 0;
  const markReduce = markReducePer > 0
    ? Math.min(markReduceCap || Infinity, Math.max(0, roundInt(duel.enemyMarked || 0)) * markReducePer)
    : 0;
  const damage = Math.max(
    0,
    roundInt(intent.damage ?? 0)
      + roundInt(duel.enemyDamageBonus || 0)
      + roundInt(duel.overplayPressure || 0)
      + mods.damage
      - roundInt(duel.enemyWeak || 0)
      - markReduce
  );
  return { bullets, damage, raw: bullets * damage };
}

export function describeIntent(intent) {
  if (!intent) return "Waiting";
  const notes = [];
  if (intent.bonusDamageIfNoArmor) notes.push("punishes no Armor");
  if (intent.bonusDamageIfNerveAtLeast) notes.push(`punishes ${roundInt(intent.bonusDamageIfNerveAtLeast)}+ Nerve held`);
  if (intent.bonusDamageIfPositionBelow != null) notes.push(`punishes Position ${roundInt(intent.bonusDamageIfPositionBelow)} or less`);
  if (intent.bonusDamageIfCardsPlayedAtLeast) notes.push(`punishes ${roundInt(intent.bonusDamageIfCardsPlayedAtLeast)}+ card prep`);
  if (intent.punishRepeatedTypes) notes.push("punishes repeated card types");
  if (intent.guardLoadedAt) notes.push(`guards vs ${roundInt(intent.guardLoadedAt)}+ loaded`);
  if (intent.spoilLowVolleyAt) notes.push(`spoils volleys of ${roundInt(intent.spoilLowVolleyAt)} or less`);
  const suffix = notes.length ? ` (${notes.join("; ")})` : "";
  if (intent.type === "attack") {
    const b = Math.max(0, roundInt(intent.bullets ?? 1));
    const d = Math.max(0, roundInt(intent.damage ?? 0));
    return `${intent.label ?? "Attack"}: ${b}x${d} = ${b * d}${suffix}`;
  }
  if (intent.type === "armor") return `${intent.label ?? "Cover"}: gain ${roundInt(intent.armor || 0)} Armor${suffix}`;
  if (intent.type === "buff") return `${intent.label ?? "Buff"}: ${intent.description ?? "prepare"}${suffix}`;
  if (intent.type === "rattled") return `${intent.label ?? "Rattle"}: apply Rattled${suffix}`;
  if (intent.type === "load") return `${intent.label ?? "Load"}: load ${roundInt(intent.bullets || 0)} bullets${suffix}`;
  return `${intent.description ?? intent.label ?? "Special"}${suffix}`;
}

export function createDuel(oppDef, run) {
  const enemy = makeEnemyRuntime(oppDef);
  const gearBonuses = itemBonuses(run);
  const playerStartGun = resolveStartingGun(run);
  const playerActiveGun = makeActiveGun(playerStartGun);
  const playerSecondaryGun = run?.permanent?.dualWieldEnabled && run?.permanent?.startSecondaryGunId
    ? makeActiveGun(getGun(run.permanent.startSecondaryGunId))
    : null;
  const startStats = playerSecondaryGun
    ? {
        capacity: playerActiveGun.stats.capacity + playerSecondaryGun.stats.capacity,
        startLoaded: playerActiveGun.stats.startLoaded + playerSecondaryGun.stats.startLoaded,
      }
    : playerActiveGun.stats;
  const enemyGun = getGun(oppDef.gunId);
  enemy.activeGun = makeActiveGun(enemyGun);

  const duel = {
    opponentDef: oppDef,
    classId: run?.classId ?? null,
    enemy,
    phase: "player_turn",
    roundNumber: 1,
    cycleNumber: 1,
    cycleCount: 0,
    playerHand: [],
    playerDrawPile: buildDeckFromIds(run.deckCards ?? run.deckIds),
    playerDiscard: [],
    runPermanent: { ...(run?.permanent ?? {}) },
    itemBonuses: gearBonuses,
    nerve: START_NERVE + Math.max(0, roundInt(gearBonuses.startNerve || 0)),
    maxNerve: (run?.permanent?.maxNerve ?? BASE_MAX_NERVE) + Math.max(0, roundInt(gearBonuses.maxNerve || 0)),
    nerveGain: (run?.permanent?.nerveGain ?? BASE_NERVE_GAIN) + Math.max(0, roundInt(gearBonuses.nerveGain || 0)),
    nextNerveBonus: 0,
    rattled: 0,
    playerArmor: Math.max(0, roundInt(gearBonuses.startArmor || 0)),
    enemyArmor: 0,
    position: (run?.permanent?.startPosition ?? 1) + roundInt(gearBonuses.position || 0),
    positionCapBonus: Math.max(0, roundInt(gearBonuses.positionCap || 0)),
    evadeBullets: 0,
    evadeAttack: false,
    overcap: 0,
    itemCapacityBonus: Math.max(0, roundInt(gearBonuses.capacity || 0)),
    itemBulletDamage: roundInt(gearBonuses.bulletDamage || 0),
    loadedBullets: Math.min(
      startStats.capacity + Math.max(0, roundInt(gearBonuses.capacity || 0)),
      Math.max(0, roundInt(startStats.startLoaded || 0) + roundInt(gearBonuses.startLoaded || 0))
    ),
    playerActiveGun,
    playerSecondaryGun,
    freeGunPlayed: false,
    freeCardAvailable: false,
    cardsPlayedThisRound: 0,
    overplayPressure: 0,
    cardsPlayedByType: {},
    repeatedCardTypeThisRound: null,
    playerStances: [],
    enemyStances: [],
    playerShowdown: null,
    enemyShowdown: null,
    playerShowdownLevel: 0,
    enemyShowdownLevel: 0,
    enemyIntent: null,
    enemyIntentHistory: [],
    enemyLoadedBullets: 0,
    enemyDamageBonus: 0,
    enemyWeak: 0,
    tempBulletDamage: 0,
    flourishTempDamage: 0,
    tempDamageMult: 1,
    tempMarkBurst: 0,
    tempMarkBulletPerMark: 0,
    tempDamagePerHp: 0,
    lifestealOnHit: 0,
    bountyOnHit: 0,
    hpAfterShootout: 0,
    enemyMarked: 0,
    spirit: 0,
    spiritDoubleNext: false,
    infamy: 0,
    infamyPerRound: 0,
    infamyOnHit: 0,
    deputies: 0,
    deputyArmorPerRound: 0,
    deputyLoadOnAttack: 0,
    caseFile: 0,
    casePerRound: 0,
    casePath: 0,
    casePathStage: 0,
    caseOnMark: 0,
    track: 0,
    snarePerRound: 0,
    positionPerRound: 0,
    enemyInfection: 0,
    infectionLeech: 0,
    infectionDecay: 1,
    roundOutlawCount: 0,
    nextComboFree: false,
    duelComboTriggers: 0,
    bonusBounty: 0,
    deedStats: {
      bulletDamageDealt: 0,
      armorPrevented: 0,
      classResourceApplied: 0,
      maxLoadedShowdowns: 0,
      hpPaid: 0,
    },
    shootoutLog: [],
    shootoutSummary: null,
    playLog: [],
    message: "Round 1 — read their intent, then load, brace, or move.",
    winner: null,
    highNoonT: 0,
    staredownT: 0,
    staredownChoices: [],
  };

  startPlayerRound(duel, run, { first: true });
  return duel;
}

function startPlayerRound(duel, run, { first = false } = {}) {
  duel.phase = "player_turn";
  duel.cycleNumber = duel.roundNumber;
  duel.cardsPlayedThisRound = 0;
  duel.overplayPressure = 0;
  duel.cardsPlayedByType = {};
  duel.repeatedCardTypeThisRound = null;
  duel.enemyIntent = selectEnemyIntent(duel);
  duel.enemyIntentHistory.push({ roundNumber: duel.roundNumber, intent: cloneIntent(duel.enemyIntent) });
  applyRoundStartBuildEffects(duel);
  applyRoundStartItemEffects(duel);
  duel.freeCardAvailable = !!run?.permanent?.freeFirstCardPerRound
    || (first && Math.max(0, roundInt(duel.itemBonuses?.firstCardFree || 0)) > 0);
  duel.roundOutlawCount = 0;
  duel.roundOutlawCards = [];
  if (!first) {
    const rattledPenalty = Math.max(0, roundInt(duel.rattled || 0));
    const gain = Math.max(0, roundInt(duel.nerveGain || BASE_NERVE_GAIN) + roundInt(duel.nextNerveBonus || 0) - rattledPenalty);
    duel.nerve = clamp(roundInt(duel.nerve || 0) + gain, 0, duel.maxNerve);
    duel.nextNerveBonus = 0;
    duel.rattled = 0;
    pushPlayLogBulletin(duel, `Round ${duel.roundNumber} — gained ${gain} Nerve. ${describeIntent(duel.enemyIntent)}.`);
  } else {
    pushPlayLogBulletin(duel, `${duel.opponentDef.name} shows intent: ${describeIntent(duel.enemyIntent)}.`);
  }
  const drawn = drawCards(duel.playerDrawPile, duel.playerDiscard, HAND_SIZE);
  duel.playerHand.push(...drawn);
  duel.message = `Round ${duel.roundNumber} — ${describeIntent(duel.enemyIntent)}.`;
  syncAliases(duel);
}

function applyRoundStartBuildEffects(duel) {
  if (!duel || duel.roundNumber <= 1) return;
  if (duel.infamyPerRound > 0) {
    duel.infamy = Math.max(0, roundInt(duel.infamy || 0) + roundInt(duel.infamyPerRound));
  }
  if (duel.casePerRound > 0) {
    duel.caseFile = Math.max(0, roundInt(duel.caseFile || 0) + roundInt(duel.casePerRound));
  }
  if (duel.casePath > 0) {
    duel.casePathStage = Math.min(3, Math.max(0, roundInt(duel.casePathStage || 0)) + roundInt(duel.casePath));
    duel.caseFile = Math.max(0, roundInt(duel.caseFile || 0) + roundInt(duel.casePathStage));
  }
  if (duel.deputies > 0 && duel.deputyArmorPerRound > 0) {
    duel.playerArmor += Math.max(0, roundInt(duel.deputyArmorPerRound));
  }
  if (duel.deputies > 0 && duel.deputyLoadOnAttack > 0 && duel.enemyIntent?.type === "attack") {
    loadBullets(duel, Math.min(roundInt(duel.deputies), roundInt(duel.deputyLoadOnAttack)));
  }
  if (duel.positionPerRound > 0) {
    addPosition(duel, duel.positionPerRound);
  }
  if (duel.snarePerRound > 0 && duel.enemyIntent?.type === "attack") {
    duel.evadeBullets += Math.max(0, roundInt(duel.snarePerRound));
  }
}

function applyRoundStartItemEffects(duel) {
  const bonuses = duel?.itemBonuses ?? {};
  if (!duel) return;
  const armor = Math.max(0, roundInt(bonuses.armorPerRound || 0));
  if (armor > 0) duel.playerArmor += armor;
  if (duel.roundNumber === 1) {
    duel.evadeBullets += Math.max(0, roundInt(bonuses.evadeFirstRound || 0));
    duel.enemyWeak += Math.max(0, roundInt(bonuses.enemyWeakFirstRound || 0));
  } else {
    loadBullets(duel, bonuses.loadPerRound || 0);
    if (bonuses.positionPerRound) addPosition(duel, bonuses.positionPerRound);
  }
}

export function dealStaredownChoices(duel) {
  if (duel) duel.staredownChoices = [];
}

export function commitPlayerStaredown() {
  return false;
}

function payHpCostFor(def) {
  let total = 0;
  for (const raw of effectsForCardLevel(def, def.showdownLevel || 1)) {
    const e = parseEffect(raw);
    if (e.kind === "payHp") total += Math.abs(roundInt(e.value || 0));
  }
  return total;
}

function drawExtraCards(duel, count) {
  const drawn = drawCards(duel.playerDrawPile, duel.playerDiscard, Math.max(0, roundInt(count)));
  duel.playerHand.push(...drawn);
}

function applyCardEffects(duel, run, def, effects = effectsForCardLevel(def, def.showdownLevel || 1)) {
  for (const raw of effects) {
    if (raw.startsWith("comboBonus:")) continue;
    const e = parseEffect(raw);
    const value = Number.isFinite(e.value) ? e.value : 0;
    const amount = Number.isFinite(e.value) ? e.value : 1;
    switch (e.kind) {
      case "load":
      case "bullets":
      case "focusBonusBullets":
      case "extraVolleyShots":
        loadBullets(duel, value);
        break;
      case "armor":
        duel.playerArmor += Math.max(0, roundInt(value));
        break;
      case "damageTaken":
        duel.playerArmor += Math.max(0, Math.abs(roundInt(value)) * 4);
        break;
      case "position":
      case "accShootout":
        recordClassResource(duel, run, "position", addPosition(duel, e.kind === "accShootout" ? Math.sign(value) : value));
        break;
      case "positionSet":
        setPosition(duel, value);
        break;
      case "evadeBullets":
      case "dodgeRecv":
        duel.evadeBullets += Math.max(0, roundInt(value));
        break;
      case "evadeAttack":
        duel.evadeAttack = true;
        break;
      case "nerve":
      case "focusCycle":
      case "staminaPerRound":
      case "extraPlay":
        duel.nerve = clamp(roundInt(duel.nerve || 0) + roundInt(value), 0, duel.maxNerve);
        break;
      case "nextNerve":
      case "focusPerRound":
        duel.nextNerveBonus += roundInt(value);
        break;
      case "draw":
        drawExtraCards(duel, value);
        break;
      case "rattled":
        duel.rattled = Math.max(duel.rattled || 0, Math.max(1, roundInt(value || 1)));
        break;
      case "enemyWeak":
      case "enemyAccNext":
        duel.enemyWeak += e.kind === "enemyAccNext" ? Math.max(1, Math.round(Math.abs(value) * 20)) : Math.max(0, roundInt(value));
        break;
      case "enemyArmor":
        duel.enemyArmor = Math.max(0, duel.enemyArmor + roundInt(value));
        break;
      case "enemyBullets":
        duel.enemyWeak += Math.max(0, Math.abs(roundInt(value)) * 2);
        break;
      case "overcap":
        duel.overcap += Math.max(0, roundInt(value));
        break;
      case "damage":
        duel.tempBulletDamage += roundInt(value);
        break;
      case "damageShootout":
        duel.tempDamageMult *= Math.max(0.25, 1 + value);
        break;
      case "healNow":
        run.hp = Math.min(run.maxHp, run.hp + Math.max(0, roundInt(value)));
        break;
      case "hpAfterShootout":
        duel.hpAfterShootout += roundInt(value);
        break;
      case "markEnemy": {
        const extra = run?.permanent?.extraMarkPerApply ?? 0;
        const added = Math.max(0, roundInt(value) + roundInt(extra));
        duel.enemyMarked += added;
        recordClassResource(duel, run, e.kind, added);
        if (duel.caseOnMark > 0) {
          duel.caseFile = Math.max(0, roundInt(duel.caseFile || 0) + roundInt(duel.caseOnMark));
          recordClassResource(duel, run, "caseFile", duel.caseOnMark);
        }
        break;
      }
      case "markBurst":
        duel.tempMarkBurst += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "markBulletPerMark":
        duel.tempMarkBulletPerMark += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "damagePerHp":
        duel.tempDamagePerHp = Math.max(duel.tempDamagePerHp || 0, Math.max(0, roundInt(value)));
        break;
      case "spirit": {
        const cap = run?.permanent?.spiritMax ?? 10;
        const before = roundInt(duel.spirit || 0);
        duel.spirit = Math.min(cap, Math.max(0, roundInt(duel.spirit || 0) + roundInt(value)));
        recordClassResource(duel, run, e.kind, duel.spirit - before);
        break;
      }
      case "spiritScaleDamage":
        recordClassResource(duel, run, e.kind, Math.ceil(Math.abs(value) * 100));
        if (duel.spirit > 0) duel.tempDamageMult *= Math.max(0.25, 1 + duel.spirit * value);
        break;
      case "spiritScaleAcc":
        recordClassResource(duel, run, e.kind, Math.ceil(Math.abs(value) * 100));
        if (duel.spirit > 0) addPosition(duel, Math.sign(value));
        break;
      case "spiritScaleEnemyAcc":
        recordClassResource(duel, run, e.kind, Math.ceil(Math.abs(value) * 100));
        if (duel.spirit > 0) duel.enemyWeak += Math.max(0, Math.round(Math.abs(value) * 20 * duel.spirit));
        break;
      case "spiritDoubleNext":
        duel.spiritDoubleNext = true;
        break;
      case "lifestealOnHit":
        duel.lifestealOnHit += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "bountyOnHit":
        duel.bountyOnHit += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "infamy":
        duel.infamy = Math.max(0, roundInt(duel.infamy || 0) + roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "infamyPerRound":
        duel.infamyPerRound += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "infamyOnHit":
        duel.infamyOnHit += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "infamyLoad": {
        const spent = Math.min(Math.max(0, roundInt(duel.infamy || 0)), Math.max(0, roundInt(value)));
        duel.infamy -= spent;
        loadBullets(duel, spent);
        recordClassResource(duel, run, e.kind, spent);
        break;
      }
      case "infamyDamage":
        duel.tempBulletDamage += Math.min(Math.max(0, roundInt(duel.infamy || 0)), Math.max(0, roundInt(value)));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "infamyArmor":
        duel.playerArmor += Math.min(Math.max(0, roundInt(duel.infamy || 0)), Math.max(0, roundInt(value))) * 3;
        recordClassResource(duel, run, e.kind, value);
        break;
      case "deputy":
      case "deputies":
        duel.deputies = Math.max(0, roundInt(duel.deputies || 0) + roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "deputyArmorPerRound":
        duel.deputyArmorPerRound += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "deputyLoadOnAttack":
        duel.deputyLoadOnAttack += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "deputyBlock":
        duel.playerArmor += Math.max(0, roundInt(duel.deputies || 0) * roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "caseFile":
        duel.caseFile = Math.max(0, roundInt(duel.caseFile || 0) + roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "casePerRound":
        duel.casePerRound += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "casePath":
        duel.casePath += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value * 2);
        break;
      case "caseOnMark":
        duel.caseOnMark += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "caseSpendLoad": {
        const spent = Math.min(Math.max(0, roundInt(duel.caseFile || 0)), Math.max(0, roundInt(value)));
        duel.caseFile -= spent;
        loadBullets(duel, spent);
        recordClassResource(duel, run, e.kind, spent);
        break;
      }
      case "caseSpendArmor": {
        const spent = Math.min(Math.max(0, roundInt(duel.caseFile || 0)), Math.max(0, roundInt(value)));
        duel.caseFile -= spent;
        duel.playerArmor += spent * 4;
        recordClassResource(duel, run, e.kind, spent);
        break;
      }
      case "track":
        duel.track = Math.max(0, roundInt(duel.track || 0) + roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "trackDamage":
        duel.tempBulletDamage += Math.min(Math.max(0, roundInt(duel.track || 0)), Math.max(0, roundInt(value)));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "trackLoad": {
        const spent = Math.min(Math.max(0, roundInt(duel.track || 0)), Math.max(0, roundInt(value)));
        duel.track -= spent;
        loadBullets(duel, spent);
        recordClassResource(duel, run, e.kind, spent);
        break;
      }
      case "snare":
        if (duel.enemyIntent?.type === "attack") {
          duel.evadeBullets += Math.max(0, roundInt(value));
        } else {
          duel.playerArmor += Math.max(0, roundInt(value)) * 3;
        }
        recordClassResource(duel, run, e.kind, value);
        break;
      case "snarePerRound":
        duel.snarePerRound += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "positionPerRound":
        duel.positionPerRound += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "flourishDamage":
        if (roundInt(duel.position || 0) >= 3) {
          duel.flourishTempDamage += Math.max(0, roundInt(value));
        } else {
          recordClassResource(duel, run, "position", addPosition(duel, 1));
        }
        recordClassResource(duel, run, e.kind, value);
        break;
      case "infection":
        duel.enemyInfection = Math.max(0, roundInt(duel.enemyInfection || 0) + roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "infectionWeak":
        if (duel.enemyInfection > 0) duel.enemyWeak += Math.max(0, roundInt(value));
        recordClassResource(duel, run, e.kind, value);
        break;
      case "infectionLeech":
        duel.infectionLeech += Math.max(0, amount);
        recordClassResource(duel, run, e.kind, Math.ceil(amount * 10));
        break;
      case "consumeInfection": {
        const stacks = Math.max(0, roundInt(duel.enemyInfection || 0));
        if (stacks > 0) {
          duel.enemy.hp -= Math.max(0, roundInt(stacks * Math.max(1, amount)));
          duel.enemyInfection = 0;
          recordClassResource(duel, run, e.kind, stacks);
          pushPlayLogBulletin(duel, `${def.name} cashed in ${stacks} Infection.`);
        }
        break;
      }
      case "payHp":
        break;
      case "outlawCombo":
      case "firstHitsAuto":
      case "pierce":
      case "ricochet":
      case "deadeye":
      case "removeDualPenalty":
      case "dualWieldAccPenaltyReduce":
      case "gainFocused":
        recordClassResource(duel, run, e.kind, 1);
        break;
      default:
        break;
    }
  }
  syncAliases(duel);
}

function applyOutlawComboIfNeeded(duel, run, def) {
  if (!def.outlawCombo && !(def.effects ?? []).includes("outlawCombo")) return;
  duel.roundOutlawCount = (duel.roundOutlawCount || 0) + 1;
  if (!duel.roundOutlawCards) duel.roundOutlawCards = [];
  duel.roundOutlawCards.push(def);
  const comboTokens = (d) => (d.effects ?? [])
    .filter((t) => t.startsWith("comboBonus:"))
    .map((t) => t.slice("comboBonus:".length));
  if (duel.roundOutlawCount === 2) {
    for (const prior of duel.roundOutlawCards) {
      const tokens = comboTokens(prior);
      if (tokens.length) applyCardEffects(duel, run, { effects: tokens }, tokens);
    }
    duel.duelComboTriggers += 1;
    recordClassResource(duel, run, "outlawCombo", 1);
    pushPlayLogBulletin(duel, "Outlaw combo — the second dirty move pays off.");
  } else if (duel.roundOutlawCount > 2) {
    const tokens = comboTokens(def);
    if (tokens.length) applyCardEffects(duel, run, { effects: tokens }, tokens);
    duel.duelComboTriggers += 1;
    recordClassResource(duel, run, "outlawCombo", 1);
    pushPlayLogBulletin(duel, `Outlaw combo — ${def.name} stacks.`);
  }
}

function recordCardTempoPressure(duel, def) {
  duel.cardsPlayedThisRound = Math.max(0, roundInt(duel.cardsPlayedThisRound || 0)) + 1;
  const type = def?.type ?? "card";
  if (!duel.cardsPlayedByType) duel.cardsPlayedByType = {};
  duel.cardsPlayedByType[type] = Math.max(0, roundInt(duel.cardsPlayedByType[type] || 0)) + 1;
  if (duel.cardsPlayedByType[type] >= 2) duel.repeatedCardTypeThisRound = type;
  const excess = Math.max(0, duel.cardsPlayedThisRound - CALM_CARD_LIMIT);
  if (excess <= 0) return;
  const pressure = Math.floor(excess / 2);
  if (pressure <= 0) {
    pushPlayLogBulletin(duel, "Past the calm line - the next card will expose you.");
    return;
  }
  duel.overplayPressure = pressure;
  pushPlayLogBulletin(duel, `Overextended - enemy attacks gain +${pressure} damage per bullet this Showdown.`);
}

export function tryPlayCard(duel, run, cardUid) {
  if (!duel || duel.phase !== "player_turn") return { ok: false, reason: "Not your turn" };
  const idx = duel.playerHand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return { ok: false, reason: "No card" };
  const card = duel.playerHand[idx];
  const baseDef = getCardDef(card.id);
  const def = upgradedCardDef(baseDef, card.upgradeId);
  if (!def) return { ok: false, reason: "Bad card" };

  const isGun = def.type === "gun";
  const isGunFree = isGun
    && (!!run?.permanent?.freeFirstGunEachDuel || Math.max(0, roundInt(duel.itemBonuses?.firstGunFree || 0)) > 0)
    && !duel.freeGunPlayed;
  const usingFreebie = !isGun && !def.noFree && !!duel.freeCardAvailable;
  const cost = (isGunFree || usingFreebie) ? 0 : Math.max(0, roundInt(def.cost || 0));
  if (cost > duel.nerve) return { ok: false, reason: "Not enough Nerve" };

  const hpCost = payHpCostFor(def);
  if (hpCost > 0 && run.hp - hpCost <= 0) return { ok: false, reason: "Would be lethal" };

  duel.nerve -= cost;
  if (usingFreebie) {
    duel.freeCardAvailable = false;
    pushPlayLogBulletin(duel, "First card read clean — no Nerve spent.");
  }
  if (isGunFree) {
    duel.freeGunPlayed = true;
    pushPlayLogBulletin(duel, "Quick holster — first gun swap was free.");
  }
  if (hpCost > 0) {
    run.hp = Math.max(1, run.hp - hpCost);
    ensureDeedStats(duel).hpPaid += hpCost;
    recordClassResource(duel, run, "payHp", hpCost);
    pushPlayLogBulletin(duel, `Paid ${hpCost} HP for ${def.name}.`);
  }

  duel.playerHand.splice(idx, 1);
  recordCardTempoPressure(duel, def);

  if (isGun) {
    const gunDef = getGun(def.id);
    const nextGun = makeActiveGun(gunDef);
    if (run?.permanent?.dualWieldEnabled) {
      const prev = duel.playerSecondaryGun;
      duel.playerSecondaryGun = nextGun;
      pushPlayLogBulletin(duel, prev ? `Off-hand swap: ${prev.name} -> ${nextGun.name}.` : `Off-hand drawn: ${nextGun.name}.`);
    } else {
      const prev = duel.playerActiveGun;
      duel.playerActiveGun = nextGun;
      pushPlayLogBulletin(duel, prev ? `Holstered ${prev.name}; drew ${nextGun.name}.` : `Drew ${nextGun.name}.`);
    }
    applyCardEffects(duel, run, def);
    duel.loadedBullets = Math.min(duel.loadedBullets, currentCapacity(duel));
    duel.playerDiscard.push(card);
    pushPlayLogCard(duel, "you", def);
    duel.message = `Drew ${gunDef.name}.`;
    syncAliases(duel);
    return { ok: true, gunSwap: true, feedback: feedbackLinesForCard(def, "player") };
  }

  if (def.type === "stance") {
    duel.playerStances.push(card);
  } else {
    duel.playerDiscard.push(card);
  }

  applyCardEffects(duel, run, def);
  applyOutlawComboIfNeeded(duel, run, def);
  if ((def.effects ?? []).includes("nextComboFree")) {
    duel.nextComboFree = true;
  }

  pushPlayLogCard(duel, "you", def);
  duel.message = `Played ${def.name}.`;
  syncAliases(duel);
  return { ok: true, feedback: feedbackLinesForCard(def, "player") };
}

export function duelDisplayedVolleyPreview(duel, run) {
  const gun = combinedGunStats(duel);
  const marks = Math.max(0, roundInt(duel.enemyMarked || 0));
  let bullets = Math.max(0, roundInt(duel.loadedBullets || 0));
  bullets += Math.max(0, roundInt(duel.tempMarkBulletPerMark || 0)) * marks;
  let baseDamage = gun.bulletDamage + roundInt(duel.itemBulletDamage || 0) + roundInt(duel.tempBulletDamage || 0);
  if (bullets > 0 && bullets <= 3) {
    baseDamage += roundInt(duel.flourishTempDamage || 0);
  }
  const brinkPct = run?.permanent?.brinkThresholdPct ?? null;
  if (
    Number.isFinite(brinkPct)
    && run?.permanent?.brinkDamageBonus > 0
    && (run?.hp ?? 0) <= Math.max(1, Math.round((run?.maxHp ?? 0) * brinkPct))
  ) {
    baseDamage += roundInt(run.permanent.brinkDamageBonus);
  }
  if (marks > 0 && run?.permanent?.markDamagePerMark > 0) {
    const cap = Number.isFinite(run.permanent.markDamageCap) ? run.permanent.markDamageCap : 8;
    baseDamage += Math.min(cap, marks * run.permanent.markDamagePerMark);
  }
  if (duel.tempMarkBurst > 0 && marks > 0) baseDamage += duel.tempMarkBurst * marks;
  const spirit = Math.max(0, roundInt(duel.spirit || 0));
  if (spirit > 0 && run?.permanent?.spiritDamagePerSpirit > 0) {
    const cap = Number.isFinite(run.permanent.spiritDamageCap) ? run.permanent.spiritDamageCap : 5;
    baseDamage += Math.min(cap, spirit * run.permanent.spiritDamagePerSpirit);
  }
  if (duel.tempDamagePerHp > 0) baseDamage += Math.floor((run?.hp ?? 0) / duel.tempDamagePerHp);
  const tempoBonus = profileDamageBonusFor(duel, gun, bullets);
  baseDamage += tempoBonus.damage;
  const mult = positionMultiplier(duel.position);
  const damage = Math.max(1, Math.round(baseDamage * mult * (duel.tempDamageMult || 1)));
  const spiritArmor = spirit > 0 && run?.permanent?.spiritArmorPerSpirit > 0
    ? Math.min(
        Number.isFinite(run.permanent.spiritArmorCap) ? run.permanent.spiritArmorCap : 6,
        spirit * run.permanent.spiritArmorPerSpirit
      )
    : 0;
  const attack = intentAttackMath(duel);
  return {
    player: {
      side: "player",
      bullets,
      liveShots: bullets,
      loaded: Math.max(0, roundInt(duel.loadedBullets || 0)),
      capacity: currentCapacity(duel),
      damage,
      baseDamage: gun.bulletDamage,
      damageMult: mult * (duel.tempDamageMult || 1),
      acc: 1,
      armor: Math.max(0, roundInt(duel.playerArmor || 0) + roundInt(spiritArmor)),
      evadeBullets: Math.max(0, roundInt(duel.evadeBullets || 0)),
      evadeAttack: !!duel.evadeAttack,
      position: duel.position,
      positionName: positionName(duel.position),
      positionMult: mult,
      gunName: gun.name,
      gunProfile: gun.profile,
      tempoLabel: tempoBonus.labels.join(" / "),
      lifestealOnHit: Math.max(0, roundInt(duel.lifestealOnHit || 0)),
      bountyOnHit: Math.max(0, roundInt(duel.bountyOnHit || 0)),
    },
    enemy: {
      side: "enemy",
      bullets: attack.bullets,
      liveShots: attack.bullets,
      damage: attack.damage,
      baseDamage: attack.damage,
      damageMult: 1,
      acc: 1,
      armor: Math.max(0, roundInt(duel.enemyArmor || 0)) + enemyArmorForIntent(duel),
      evadeBullets: 0,
      evadeAttack: false,
      gunName: duel.enemy?.activeGun?.name ?? duel.enemy?.gun?.name ?? "Enemy gun",
      intent: duel.enemyIntent,
    },
  };
}

export function estimateVolleyDamage(attacker, defender) {
  const bullets = Math.max(0, roundInt(attacker?.bullets || 0));
  let dodged = 0;
  if (defender?.evadeAttack) {
    dodged = bullets;
  } else {
    dodged = Math.min(bullets, Math.max(0, roundInt(defender?.evadeBullets || 0)));
  }
  const liveShots = Math.max(0, bullets - dodged);
  const damagePerHit = Math.max(0, roundInt(attacker?.damage || 0));
  const rawDamage = liveShots * damagePerHit;
  const armor = Math.max(0, roundInt(defender?.armor || 0));
  const expectedDamage = Math.max(0, rawDamage - armor);
  return {
    bullets,
    liveShots,
    dodge: dodged,
    autoHits: liveShots,
    acc: 1,
    expectedHits: liveShots,
    damagePerHit,
    rawDamage,
    armor,
    expectedDamage,
    maxDamage: expectedDamage,
    swingy: false,
    tempoLabel: attacker?.tempoLabel ?? "",
  };
}

function shotList(count, damagePerHit, blockedDamage, prefix = "hit") {
  const shots = [];
  let remainingBlock = Math.max(0, blockedDamage);
  for (let i = 0; i < count; i++) {
    const blocked = Math.min(remainingBlock, damagePerHit);
    remainingBlock -= blocked;
    shots.push({
      i: i + 1,
      outcome: prefix,
      dmg: Math.max(0, damagePerHit - blocked),
      blocked,
    });
  }
  return shots;
}

function applyEnemyNonAttackIntent(duel) {
  const intent = duel.enemyIntent;
  if (!intent) return;
  if (intent.type === "buff") {
    duel.enemyDamageBonus += Math.max(0, roundInt(intent.damageNext || intent.damage || 0));
  } else if (intent.type === "rattled") {
    duel.rattled = Math.max(duel.rattled || 0, Math.max(1, roundInt(intent.amount || 1)));
  } else if (intent.type === "load") {
    duel.enemyLoadedBullets += Math.max(0, roundInt(intent.bullets || 0));
  }
}

export function resolveShootout(duel, run) {
  const preview = duelDisplayedVolleyPreview(duel, run);
  const outgoing = estimateVolleyDamage(preview.player, preview.enemy);
  const incoming = estimateVolleyDamage(preview.enemy, preview.player);
  const playerHpBefore = run.hp;
  const enemyHpBefore = duel.enemy.hp;

  duel.enemy.hp -= outgoing.expectedDamage;
  run.hp -= incoming.expectedDamage;
  ensureDeedStats(duel).bulletDamageDealt += Math.max(0, roundInt(outgoing.expectedDamage || 0));

  const playerHits = outgoing.liveShots;
  if (playerHits > 0 && outgoing.expectedDamage > 0) {
    const heal = playerHits * Math.max(0, roundInt(duel.lifestealOnHit || 0));
    if (heal > 0) run.hp = Math.min(run.maxHp, run.hp + heal);
    const bounty = playerHits * Math.max(0, roundInt(duel.bountyOnHit || 0));
    if (bounty > 0) duel.bonusBounty += bounty;
    const infamy = playerHits * Math.max(0, roundInt(duel.infamyOnHit || 0));
    if (infamy > 0) duel.infamy = Math.max(0, roundInt(duel.infamy || 0) + infamy);
  }

  if (incoming.expectedDamage > 0) {
    duel.rattled = Math.max(duel.rattled || 0, 1);
  }

  if (duel.enemyIntent?.type !== "attack") applyEnemyNonAttackIntent(duel);

  const infectionBefore = Math.max(0, roundInt(duel.enemyInfection || 0));
  let infectionDamage = 0;
  if (infectionBefore > 0) {
    infectionDamage = Math.max(1, Math.ceil(infectionBefore * 0.5));
    duel.enemy.hp -= infectionDamage;
    if (duel.infectionLeech > 0) {
      run.hp = Math.min(run.maxHp, run.hp + Math.max(0, roundInt(infectionDamage * duel.infectionLeech)));
    }
    duel.enemyInfection = Math.max(0, infectionBefore - Math.max(1, roundInt(duel.infectionDecay || 1)));
    pushPlayLogBulletin(duel, `Infection dealt ${infectionDamage}; ${duel.enemyInfection} remains.`);
  }

  run.hp = Math.max(0, Math.min(run.maxHp, run.hp + roundInt(duel.hpAfterShootout || 0)));

  const outgoingBlocked = Math.min(outgoing.rawDamage, outgoing.armor);
  const incomingBlocked = Math.min(incoming.rawDamage, incoming.armor);
  ensureDeedStats(duel).armorPrevented += Math.max(0, roundInt(incomingBlocked || 0));
  const playerShots = shotList(outgoing.liveShots, outgoing.damagePerHit, outgoingBlocked, "hit");
  for (let i = 0; i < outgoing.dodge; i++) {
    playerShots.unshift({ i: i + 1, outcome: "dodged", dmg: 0, blocked: 0 });
  }
  const enemyShots = shotList(incoming.liveShots, incoming.damagePerHit, incomingBlocked, "hit");
  for (let i = 0; i < incoming.dodge; i++) {
    enemyShots.unshift({ i: i + 1, outcome: "dodged", dmg: 0, blocked: 0 });
  }

  duel.shootoutSummary = {
    player: {
      bullets: outgoing.bullets,
      hits: outgoing.liveShots,
      misses: 0,
      dodged: outgoing.dodge,
      damage: outgoing.expectedDamage,
      accuracy: 1,
      baseDamage: preview.player.damage,
      shots: playerShots,
      rawDamage: outgoing.rawDamage,
      armorBlocked: outgoingBlocked,
    },
    enemy: {
      bullets: incoming.bullets,
      hits: incoming.liveShots,
      misses: 0,
      dodged: incoming.dodge,
      damage: incoming.expectedDamage,
      accuracy: 1,
      baseDamage: preview.enemy.damage,
      shots: enemyShots,
      rawDamage: incoming.rawDamage,
      armorBlocked: incomingBlocked,
    },
  };

  duel.shootoutLog = [];
  for (const shot of playerShots) {
    if (shot.outcome === "hit") {
      duel.shootoutLog.push({ kind: "hit", by: "player", dmg: shot.dmg, blocked: shot.blocked, i: shot.i });
    }
  }
  if (infectionDamage > 0) duel.shootoutLog.push({ kind: "infection", by: "player", dmg: infectionDamage });
  for (const shot of enemyShots) {
    if (shot.outcome === "hit") {
      duel.shootoutLog.push({ kind: "hit", by: "enemy", dmg: shot.dmg, blocked: shot.blocked, i: shot.i });
    }
  }
  if (outgoing.dodge > 0) duel.shootoutLog.push({ kind: "dodge", who: "enemy", n: outgoing.dodge });
  if (incoming.dodge > 0) duel.shootoutLog.push({ kind: "dodge", who: "player", n: incoming.dodge });

  pushPlayLogBulletin(
    duel,
    `Showdown: you dealt ${Math.max(0, enemyHpBefore - duel.enemy.hp)}; ${duel.opponentDef.name} dealt ${Math.max(0, playerHpBefore - run.hp)}.`
  );

  duel.cycleCount += 1;
  duel.loadedBullets = 0;
  if (duel.enemyIntent?.type === "attack") duel.enemyLoadedBullets = 0;
  duel.playerArmor = 0;
  duel.enemyArmor = 0;
  duel.evadeBullets = 0;
  duel.evadeAttack = false;
  duel.overcap = 0;
  duel.tempBulletDamage = 0;
  duel.flourishTempDamage = 0;
  duel.tempDamageMult = 1;
  duel.tempMarkBurst = 0;
  duel.tempMarkBulletPerMark = 0;
  duel.tempDamagePerHp = 0;
  duel.lifestealOnHit = 0;
  duel.bountyOnHit = 0;
  duel.hpAfterShootout = 0;
  duel.enemyWeak = 0;
  duel.spiritDoubleNext = false;
  duel.cardsPlayedThisRound = 0;
  duel.overplayPressure = 0;
  duel.cardsPlayedByType = {};
  duel.repeatedCardTypeThisRound = null;

  let winner = null;
  if (duel.enemy.hp <= 0 && run.hp <= 0) {
    winner = run?.permanent?.quickdrawWin ? "player" : "enemy";
    if (winner === "player" && run?.permanent?.quickdrawHealPct > 0) {
      run.hp = Math.max(1, Math.round(run.maxHp * run.permanent.quickdrawHealPct));
    }
  } else if (duel.enemy.hp <= 0) {
    winner = "player";
  } else if (run.hp <= 0) {
    winner = "enemy";
  }

  duel.winner = winner;
  if (winner) {
    duel.phase = "ended";
    duel.message = winner === "player" ? "You walk away. They don't." : "You hit the dust.";
    pushPlayLogBulletin(duel, winner === "player" ? "You win the duel." : "You lose the duel.");
  } else {
    duel.roundNumber += 1;
    startPlayerRound(duel, run);
  }
  syncAliases(duel);
  return { winner, log: duel.shootoutLog };
}

export function lockInPrep(duel, run) {
  if (!duel || duel.phase !== "player_turn") return { toShootout: false, enemyFeedback: [] };
  if (roundInt(duel.loadedBullets || 0) >= currentCapacity(duel)) {
    ensureDeedStats(duel).maxLoadedShowdowns += 1;
  }
  discardHand(duel);
  duel.phase = "showdown";
  duel.highNoonT = SHOWDOWN_SECONDS;
  duel.showdownT = SHOWDOWN_SECONDS;
  duel.message = "SHOWDOWN";
  pushPlayLogBulletin(duel, "Showdown — both sides fire.");
  syncAliases(duel);
  return { toShootout: true, enemyFeedback: [] };
}

export function tickStaredown() {
  // Legacy no-op. The hidden Staredown phase is disabled in the rework.
}

export function tickHighNoon(duel, run, dt) {
  if (!duel || duel.phase !== "showdown") return;
  duel.highNoonT -= dt;
  duel.showdownT = duel.highNoonT;
  if (duel.highNoonT <= 0) {
    resolveShootout(duel, run);
  }
}

export { lockInPrep as endPlayerTurn };
