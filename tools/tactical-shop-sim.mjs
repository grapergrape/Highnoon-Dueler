import { defaultRun } from "../static/js/app/run-state.js";
import { CLASSES } from "../static/js/data/classes.js";
import { CARD_DEFINITIONS, effectsForCardLevel, getCardDef, getCardUpgradeOptions, parseEffect, upgradedCardDef } from "../static/js/data/cards.js";
import { addDeckCard, deckCardEntries, normalizeDeck, replaceDeckCardAt, upgradeDeckCard } from "../static/js/data/deck-state.js";
import { applyDuelDeedProgress, ensureDeedState } from "../static/js/data/deeds.js";
import { WHISKEY_HEAL_AMOUNT, whiskeyPriceFromBounty } from "../static/js/data/economy.js";
import { getGun, gunsForClass, starterGunIdForClass } from "../static/js/data/guns.js";
import { equipItem, itemBonuses, rollBossGearDrop, rollMerchantTrinket, rollStartingGearChoices, rollTrinketDrop, trinketPrice } from "../static/js/data/items.js";
import { OPPONENTS } from "../static/js/data/opponents.js";
import {
  createDuel,
  duelDisplayedVolleyPreview,
  estimateVolleyDamage,
  lockInPrep,
  tickHighNoon,
  tryPlayCard,
} from "../static/js/duel/duel.js";

const route = [...OPPONENTS].sort((a, b) => a.townOrder - b.townOrder || a.roleOrder - b.roleOrder);
const args = parseArgs(process.argv.slice(2));
const runsPerClass = args.runs ?? 10;
const baseSeed = args.seed ?? 900000;

const CLASS_BUILD_PATHS = {
  outlaw: ["combo", "infamy"],
  sheriff: ["street", "posse"],
  marshal: ["marks", "procedure"],
  apache_tracker: ["spirit", "trail"],
  vaquero: ["dual", "flourish"],
  bounty_hunter: ["blood", "doctor"],
};

const GUN_DROP_CHANCE = 0.20;
const MAX_DECK = 24;
const RARITY_WEIGHTS = { common: 34, uncommon: 40, rare: 18, epic: 6, legendary: 2 };
const RARITY_SCORE = { common: 0, uncommon: 2, rare: 5, epic: 9, legendary: 14 };
const PRICE_BY_RARITY = { common: 25, uncommon: 40, rare: 65, epic: 110, legendary: 180 };

const classesToRun = args.classId ? CLASSES.filter((cls) => cls.id === args.classId) : CLASSES;
for (const cls of classesToRun) {
  const buildPaths = args.buildPaths
    ? (CLASS_BUILD_PATHS[cls.id] ?? [null])
    : [args.buildPath ?? null];
  for (const buildPath of buildPaths) {
    const rows = [];
    for (let i = 0; i < runsPerClass; i++) {
      rows.push(runOne(cls.id, baseSeed + i * 1009 + cls.id.length * 101, buildPath));
    }
    const clears = rows.filter((r) => r.clear).length;
    const suffix = buildPath ? `/${buildPath}` : "";
    console.log(`\n${cls.id}${suffix}: ${clears}/${runsPerClass} clears`);
    rows.forEach((r, i) => {
      const status = r.clear ? "CLEAR " : "DIED  ";
      console.log(`${i + 1}. ${status} wins=${r.wins} hp=${r.hp}/${r.maxHp} upgrades=${r.upgrades} deeds=${r.deeds} money=$${r.money} last=${r.last}`);
    });
  }
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--runs") parsed.runs = Number.parseInt(rawArgs[++i] ?? "", 10);
    else if (arg === "--seed") parsed.seed = Number.parseInt(rawArgs[++i] ?? "", 10);
    else if (arg === "--class") parsed.classId = rawArgs[++i];
    else if (arg === "--build") parsed.buildPath = rawArgs[++i];
    else if (arg === "--build-paths") parsed.buildPaths = true;
  }
  return parsed;
}

function makeRng(seed) {
  let s = seed >>> 0;
  return {
    random() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0x100000000;
    },
    snapshot() {
      return s;
    },
    restore(next) {
      s = next >>> 0;
    },
  };
}

function withSeed(seed, fn) {
  const rng = makeRng(seed);
  const original = Math.random;
  Math.random = () => rng.random();
  try {
    return fn(rng);
  } finally {
    Math.random = original;
  }
}

function clone(obj) {
  return structuredClone(obj);
}

function finishShowdown(duel, run) {
  lockInPrep(duel, run);
  tickHighNoon(duel, run, 2);
}

function evalState(duel, run) {
  const enemyHp = duel.enemy?.hp ?? 0;
  if (duel.phase === "ended") {
    if (duel.winner === "player") return 100000 + run.hp * 140 + run.money * 0.5 - enemyHp * 20;
    return -100000 + Math.max(0, -enemyHp) * 10 + run.hp * 20;
  }
  const preview = duelDisplayedVolleyPreview(duel, run);
  const incoming = estimateVolleyDamage(preview.enemy, preview.player).expectedDamage;
  const outgoing = estimateVolleyDamage(preview.player, preview.enemy).expectedDamage;
  return run.hp * 95
    - enemyHp * 75
    + outgoing * 22
    - incoming * 36
    + (duel.playerArmor || 0) * 18
    + (duel.loadedBullets || 0) * 25
    + (duel.position || 0) * 40
    + (duel.nerve || 0) * 10
    + (duel.enemyMarked || 0) * 12
    + (duel.spirit || 0) * 8
    + (duel.infamy || 0) * 8
    + (duel.deputies || 0) * 12
    + (duel.caseFile || 0) * 7
    + (duel.casePathStage || 0) * 12
    + (duel.track || 0) * 8
    + (duel.enemyInfection || 0) * 10;
}

function searchTurn(duel, run, rng, depth = 0, seen = 0) {
  const rng0 = rng.snapshot();
  const endDuel = clone(duel);
  const endRun = clone(run);
  finishShowdown(endDuel, endRun);
  let best = { score: evalState(endDuel, endRun), ids: [] };
  if (depth >= 4 || seen > 7 || duel.phase !== "player_turn") {
    rng.restore(rng0);
    return best;
  }

  const hand = [...duel.playerHand]
    .sort((a, b) => (
      cardScore(upgradedCardDef(getCardDef(b.id), b.upgradeId), { duel, run })
      - cardScore(upgradedCardDef(getCardDef(a.id), a.upgradeId), { duel, run })
    ))
    .slice(0, 4);
  for (const card of hand) {
    rng.restore(rng0);
    const d = clone(duel);
    const r = clone(run);
    const c = d.playerHand.find((x) => x.uid === card.uid);
    if (!c) continue;
    const res = tryPlayCard(d, r, c.uid);
    if (!res.ok) continue;
    const next = searchTurn(d, r, rng, depth + 1, seen + 1);
    const score = next.score - 0.15 * depth;
    if (score > best.score) best = { score, ids: [card.id, ...next.ids] };
  }
  rng.restore(rng0);
  return best;
}

function playTacticalTurn(duel, run, rng) {
  const snap = rng.snapshot();
  const pick = searchTurn(duel, run, rng);
  rng.restore(snap);
  for (const id of pick.ids) {
    const card = duel.playerHand.find((c) => c.id === id);
    if (!card) continue;
    tryPlayCard(duel, run, card.uid);
  }
  finishShowdown(duel, run);
}

function fight(run, opp, rng) {
  const duel = createDuel(opp, run);
  let turns = 0;
  while (duel.phase !== "ended" && turns < 80) {
    if (duel.phase === "player_turn") {
      playTacticalTurn(duel, run, rng);
      turns += 1;
    } else if (duel.phase === "showdown") {
      tickHighNoon(duel, run, 2);
    } else {
      break;
    }
  }
  if (duel.phase !== "ended") {
    duel.phase = "ended";
    duel.winner = "enemy";
  }
  return duel;
}

function hasStaredownOnlyEffect(cardDef) {
  return Array.isArray(cardDef?.effects) && cardDef.effects.includes("staredownOnly");
}

function isUniqueDeckCard(cardDef) {
  return cardDef?.type === "showdown" || cardDef?.type === "stance";
}

function cardPool(run) {
  normalizeDeck(run);
  const owned = new Set(run.deckIds);
  return CARD_DEFINITIONS.filter((c) =>
    c.type !== "gun" &&
    c.type !== "showdown" &&
    !c.opponentOnly &&
    !hasStaredownOnlyEffect(c) &&
    c.classId === run.classId &&
    (!isUniqueDeckCard(c) || !owned.has(c.id))
  );
}

function gunPool(run) {
  normalizeDeck(run);
  const owned = new Set(run.deckIds);
  const starter = starterGunIdForClass(run.classId);
  const secondary = run.permanent?.startSecondaryGunId ?? null;
  return gunsForClass(run.classId).filter((g) =>
    !owned.has(g.id) &&
    g.id !== starter &&
    g.id !== secondary
  );
}

function drawRarity(pool) {
  const available = new Set(pool.map((x) => x.rarity));
  const weighted = Object.entries(RARITY_WEIGHTS).filter(([rarity]) => available.has(rarity));
  const total = weighted.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const [rarity, weight] of weighted) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return weighted.at(-1)?.[0] ?? null;
}

function rewardCards(run, count = 3) {
  const pool = cardPool(run);
  const picks = [];
  const paths = CLASS_BUILD_PATHS[run.classId] ?? [];
  for (const path of paths) {
    if (picks.length >= count || pool.length <= 0) break;
    const pathPool = pool.filter((c) => c.buildPath === path);
    if (!pathPool.length) continue;
    const rarity = drawRarity(pathPool);
    const candidates = rarity ? pathPool.filter((c) => c.rarity === rarity) : pathPool;
    const card = candidates[(Math.random() * candidates.length) | 0];
    if (!card) continue;
    picks.push(card);
    const ix = pool.findIndex((c) => c.id === card.id);
    if (ix >= 0) pool.splice(ix, 1);
  }
  while (pool.length && picks.length < count) {
    const rarity = drawRarity(pool);
    const candidates = rarity ? pool.filter((c) => c.rarity === rarity) : pool;
    const card = candidates[(Math.random() * candidates.length) | 0];
    picks.push(card);
    const ix = pool.findIndex((c) => c.id === card.id);
    if (ix >= 0) pool.splice(ix, 1);
  }
  return picks;
}

function rewardGun(run) {
  if (Math.random() >= GUN_DROP_CHANCE) return null;
  const pool = gunPool(run);
  if (!pool.length) return null;
  const rarity = drawRarity(pool);
  const candidates = rarity ? pool.filter((g) => g.rarity === rarity) : pool;
  return candidates[(Math.random() * candidates.length) | 0] ?? null;
}

function effectScore(raw, ctx) {
  const e = parseEffect(raw);
  const v = e.value ?? 0;
  const hpMissing = Math.max(0, (ctx.run?.maxHp ?? 0) - (ctx.run?.hp ?? 0));
  switch (e.kind) {
    case "load": return v * 9;
    case "bullets": return v * 7;
    case "damage": return v * 12;
    case "damageShootout": return v * 80;
    case "armor": return v * 7;
    case "dodgeRecv": return v * 8;
    case "position": return v * 13;
    case "positionCap": return v * 9;
    case "nerveNext":
    case "nextNerve": return v * 11;
    case "focusCycle":
    case "focusPerRound": return v * 10;
    case "draw": return v * 8;
    case "extraPlay": return v * 7;
    case "mark": return v * 12;
    case "markBurst": return v * 13;
    case "markBulletPerMark": return v * 12;
    case "spirit": return v * 13;
    case "spiritDouble": return 25;
    case "firstHitsAuto": return v * 18;
    case "lifestealOnHit": return v * 14;
    case "bountyOnHit": return v * 3;
    case "infamy": return v * 9;
    case "infamyPerRound": return v * 18;
    case "infamyOnHit": return v * 16;
    case "infamyLoad": return v * 10;
    case "infamyDamage": return v * 9;
    case "infamyArmor": return v * 6;
    case "deputy":
    case "deputies": return v * 15;
    case "deputyArmorPerRound": return v * 14;
    case "deputyLoadOnAttack": return v * 14;
    case "deputyBlock": return v * 8;
    case "caseFile": return v * 8;
    case "casePerRound": return v * 15;
    case "casePath": return v * 20;
    case "caseOnMark": return v * 13;
    case "caseSpendLoad": return v * 10;
    case "caseSpendArmor": return v * 8;
    case "track": return v * 9;
    case "trackDamage": return v * 9;
    case "trackLoad": return v * 10;
    case "snare": return v * 13;
    case "snarePerRound": return v * 16;
    case "positionPerRound": return v * 15;
    case "flourishDamage": return v * 10;
    case "infection": return v * 6;
    case "infectionWeak": return v * 6;
    case "infectionLeech": return v * 28;
    case "consumeInfection": return v * 12;
    case "healNow": return Math.min(v, hpMissing) * 3;
    case "hpAfterShootout": return v * 5;
    case "hpAfterCycle": return v * 4;
    case "payHp": return -Math.abs(v) * 3;
    case "damageTaken": return Math.abs(v) * 7;
    case "rattled": return v * 6;
    case "comboBonus": return 12;
    default: return 0;
  }
}

function itemScore(itemDef, ctx = {}) {
  if (!itemDef) return -999;
  const cls = ctx.run?.classId;
  let score = 0;
  for (const effect of itemDef.effects ?? []) {
    const v = Number(effect.value) || 0;
    switch (effect.kind) {
      case "maxHp": score += v * 2.2; break;
      case "startNerve": score += v * 18; break;
      case "maxNerve": score += v * 15; break;
      case "nerveGain": score += v * 22; break;
      case "startArmor": score += v * 2.1; break;
      case "armorPerRound": score += v * 13; break;
      case "startLoaded": score += v * 16; break;
      case "loadPerRound": score += v * 19; break;
      case "capacity": score += v * 12; break;
      case "bulletDamage": score += v * 24; break;
      case "position": score += v * 12; break;
      case "positionCap": score += v * 10; break;
      case "positionPerRound": score += v * 17; break;
      case "evadeFirstRound": score += v * 12; break;
      case "enemyWeakFirstRound": score += v * 7; break;
      case "firstCardFree": score += v * 30; break;
      case "firstGunFree": score += v * 12; break;
      case "healAfterDuel": score += v * 7; break;
      case "healAfterBoss": score += v * 2.5; break;
      case "bountyFlat": score += v * 0.65; break;
      case "bountyMult": score += v * 90; break;
      case "cardDiscount":
      case "gunDiscount":
      case "trinketDiscount": score += v * 70; break;
      default: break;
    }
  }
  if (cls === "outlaw" && itemDef.effects?.some((e) => e.kind === "firstCardFree" || e.kind === "startNerve")) score += 8;
  if (cls === "sheriff" && itemDef.effects?.some((e) => e.kind === "armorPerRound" || e.kind === "maxHp")) score += 8;
  if (cls === "marshal" && itemDef.effects?.some((e) => e.kind === "bountyFlat" || e.kind === "bountyMult")) score += 6;
  if (cls === "apache_tracker" && itemDef.effects?.some((e) => e.kind === "position" || e.kind === "positionPerRound")) score += 7;
  if (cls === "vaquero" && itemDef.effects?.some((e) => e.kind === "capacity" || e.kind === "startLoaded" || e.kind === "bulletDamage")) score += 8;
  if (cls === "bounty_hunter" && itemDef.effects?.some((e) => e.kind === "healAfterDuel" || e.kind === "maxHp")) score += 8;
  return score;
}

function cardScore(card, ctx = {}) {
  if (!card) return -999;
  const effects = effectsForCardLevel(card, card.showdownLevel || 1);
  const base = (RARITY_SCORE[card.rarity] ?? 0)
    + effects.reduce((sum, e) => sum + effectScore(e, ctx), 0)
    - (card.cost || 0) * 9;
  const cls = ctx.run?.classId;
  const text = effects.join(" ");
  let synergy = 0;
  const preferredBuild = ctx.buildPath ?? ctx.run?.preferredBuildPath ?? null;
  if (preferredBuild && card.buildPath) {
    synergy += card.buildPath === preferredBuild ? 26 : -12;
  }
  if (cls === "apache_tracker" && /spirit|position|firstHitsAuto/.test(text)) synergy += 14;
  if (cls === "vaquero" && /dual|offhand|load|firstHitsAuto|position/.test(text)) synergy += 14;
  if (cls === "outlaw" && /comboBonus|position-|load|nextNerve|damage/.test(text)) synergy += 12;
  if (cls === "marshal" && /mark|damageTaken|bountyOnHit/.test(text)) synergy += 12;
  if (cls === "sheriff" && /armor|position|damageTaken|healNow/.test(text)) synergy += 9;
  if (cls === "bounty_hunter" && /payHp|lifesteal|bountyOnHit|healNow/.test(text)) synergy += 11;
  return base + synergy;
}

function gunScore(gun, ctx = {}) {
  if (!gun) return -999;
  const effects = gun.effects ?? [];
  const cap = gun.capacity ?? gun.mag ?? 0;
  const dmg = gun.bulletDamage ?? gun.damage ?? 0;
  return (RARITY_SCORE[gun.rarity] ?? 0) * 4
    + cap * 8
    + dmg * 9
    + effects.reduce((sum, e) => sum + effectScore(e, ctx), 0);
}

function takeStartingGear(run) {
  const pick = rollStartingGearChoices(3)
    .sort((a, b) => itemScore(b, { run }) - itemScore(a, { run }))[0];
  if (pick) equipItem(run, pick.id);
}

function worstCardIndex(run) {
  normalizeDeck(run);
  let worst = { ix: -1, score: Infinity };
  run.deckCards.forEach((entry, ix) => {
    const id = entry.id;
    if (id.startsWith("gun_")) return;
    const score = cardScore(upgradedCardDef(getCardDef(id), entry.upgradeId), { run });
    if (score < worst.score) worst = { ix, score };
  });
  return worst;
}

function takeCard(run, card, force = false) {
  normalizeDeck(run);
  if (!card) return false;
  const pickScore = cardScore(card, { run });
  if (!force && pickScore < 20) return false;
  if (run.deckIds.length < MAX_DECK) {
    addDeckCard(run, card.id);
    return true;
  }
  const worst = worstCardIndex(run);
  if (worst.ix >= 0 && pickScore > worst.score + 8) {
    replaceDeckCardAt(run, worst.ix, card.id);
    return true;
  }
  return false;
}

function takeGun(run, gun, force = false) {
  normalizeDeck(run);
  if (!gun) return false;
  const pickScore = gunScore(gun, { run });
  const guns = run.deckCards
    .map((entry, ix) => ({ id: entry.id, ix, gun: getGun(entry.id) }))
    .filter((x) => x.id.startsWith("gun_") && x.gun);
  if (!force && pickScore < 65) return false;
  if (guns.length < 2 && run.deckIds.length < MAX_DECK) {
    addDeckCard(run, gun.id);
    return true;
  }
  if (guns.length >= 2) {
    const worst = guns
      .map((x) => ({ ...x, score: gunScore(x.gun, { run }) }))
      .sort((a, b) => a.score - b.score)[0];
    if (worst && pickScore > worst.score + 15) {
      replaceDeckCardAt(run, worst.ix, gun.id);
      return true;
    }
    return false;
  }
  const worst = worstCardIndex(run);
  if (worst.ix >= 0 && pickScore > worst.score + 25) {
    replaceDeckCardAt(run, worst.ix, gun.id);
    return true;
  }
  return false;
}

function upgradeScore(run, entry, upgradeId) {
  const base = getCardDef(entry.id);
  const upgraded = upgradedCardDef(base, upgradeId);
  return cardScore(upgraded, { run }) - cardScore(base, { run });
}

function takeBestUpgrade(run) {
  normalizeDeck(run);
  let guard = 0;
  while ((run.signaturePoints || 0) > 0 && guard++ < 20) {
    let best = null;
    for (const entry of deckCardEntries(run, (card) => {
      const def = getCardDef(card.id);
      return !!def && def.type !== "gun" && !card.upgradeId && getCardUpgradeOptions(def).length > 0;
    })) {
      for (const option of getCardUpgradeOptions(entry.id)) {
        const score = upgradeScore(run, entry, option.id);
        if (!best || score > best.score) best = { uid: entry.uid, upgradeId: option.id, score };
      }
    }
    if (!best || best.score <= 0) return;
    if (!upgradeDeckCard(run, best.uid, best.upgradeId)) return;
    run.signaturePoints = Math.max(0, (run.signaturePoints || 0) - 1);
  }
}

function shop(run, bountyEarned) {
  run.merchantVisits = Math.max(0, run.merchantVisits || 0) + 1;
  const bonuses = itemBonuses(run);
  const cardOffers = [...cardPool(run)].sort(() => Math.random() - 0.5).slice(0, 5);
  const gunOffers = [...gunPool(run)].sort(() => Math.random() - 0.5).slice(0, 4);
  const trinketOffer = rollMerchantTrinket(run);
  const purchases = [
    ...cardOffers.map((card) => ({ type: "card", item: card, price: Math.max(5, Math.round((8 + (card.cost || 0) * 3) * (1 - Math.min(0.35, Math.max(0, bonuses.cardDiscount || 0))))), score: cardScore(card, { run }) })),
    ...gunOffers.map((gun) => ({ type: "gun", item: gun, price: Math.max(20, Math.round((PRICE_BY_RARITY[gun.rarity] ?? 40) * (1 - Math.min(0.35, Math.max(0, bonuses.gunDiscount || 0))))), score: gunScore(gun, { run }) })),
    ...(trinketOffer ? [{ type: "trinket", item: trinketOffer, price: trinketPrice(trinketOffer, run), score: itemScore(trinketOffer, { run }) }] : []),
  ]
    .filter((p) => p.price <= run.money)
    .map((p) => ({ ...p, value: p.score - p.price * 0.18 }))
    .sort((a, b) => b.value - a.value);

  const healPrice = whiskeyPriceFromBounty(bountyEarned);
  const hpMissing = run.maxHp - run.hp;
  const urgentHeal = run.hp <= Math.ceil(run.maxHp * 0.45);
  let healed = false;
  if (urgentHeal && hpMissing >= 10 && run.money >= healPrice) {
    run.money -= healPrice;
    run.hp = Math.min(run.maxHp, run.hp + WHISKEY_HEAL_AMOUNT);
    healed = true;
  }

  const best = purchases[0];
  if (best && best.value > 8 && run.money >= best.price) {
    const before = `${run.deckIds.join("|")}::${JSON.stringify(run.equipment)}`;
    if (best.type === "card") takeCard(run, best.item, true);
    else if (best.type === "gun") takeGun(run, best.item, true);
    else if (best.type === "trinket") equipItem(run, best.item.id);
    if (`${run.deckIds.join("|")}::${JSON.stringify(run.equipment)}` !== before) run.money -= best.price;
  }

  if (!healed && hpMissing >= 16 && run.hp <= Math.ceil(run.maxHp * 0.72) && run.money >= healPrice) {
    run.money -= healPrice;
    run.hp = Math.min(run.maxHp, run.hp + WHISKEY_HEAL_AMOUNT);
  }
}

function afterWin(run, opp, duel) {
  normalizeDeck(run);
  ensureDeedState(run);
  const mult = run.permanent?.bountyMult ?? 1;
  const bonuses = itemBonuses(run);
  const bounty = Math.round(((opp.bounty ?? (35 + opp.difficultyTier * 12)) + Math.max(0, bonuses.bountyFlat || 0)) * (mult + Math.max(0, bonuses.bountyMult || 0)))
    + Math.max(0, Math.round(duel.bonusBounty || 0));
  run.money += bounty;
  if (!run.defeatedOpponentIds.includes(opp.id)) run.defeatedOpponentIds.push(opp.id);
  applyDuelDeedProgress(run, duel);
  takeBestUpgrade(run);
  if (opp.role === "boss") {
    run.currentTownOrder = Math.min(5, opp.townOrder + 1);
    ensureDeedState(run);
    const gear = rollBossGearDrop(run);
    if (gear) equipItem(run, gear.id);
  } else {
    const trinket = rollTrinketDrop(run);
    if (trinket) equipItem(run, trinket.id);
  }
  const growth = run.permanent?.bountyGrowthPerWin ?? 0;
  if (growth > 0) run.permanent.bountyMult = Math.min(3.0, mult + growth);

  const perm = run.permanent;
  if (perm && Number.isFinite(perm.respectMax) && perm.respect > -1 && perm.respect < perm.respectMax) {
    perm.respect += 1;
    const hpEach = perm.respectMaxHpEach ?? 0;
    if (hpEach > 0) {
      run.maxHp += hpEach;
      run.hp = Math.min(run.maxHp, run.hp + hpEach);
    }
  }

  const reward = rewardCards(run, 3).sort((a, b) => cardScore(b, { run }) - cardScore(a, { run }))[0];
  takeCard(run, reward);
  takeGun(run, rewardGun(run));
  const heal = Math.max(0, Math.round(bonuses.healAfterDuel || 0))
    + (opp.role === "boss" ? Math.max(0, Math.round(bonuses.healAfterBoss || 0)) : 0);
  if (heal > 0) run.hp = Math.min(run.maxHp, run.hp + heal);
  shop(run, bounty);
}

function runOne(classId, seed, buildPath = null) {
  return withSeed(seed, (rng) => {
    const run = defaultRun(classId);
    normalizeDeck(run);
    ensureDeedState(run);
    if (buildPath) run.preferredBuildPath = buildPath;
    takeStartingGear(run);
    let wins = 0;
    let last = null;
    for (const opp of route) {
      const duel = fight(run, opp, rng);
      last = `${opp.name}:${duel.winner}:${run.hp}`;
      if (duel.winner !== "player") {
        return {
          clear: false,
          wins,
          hp: run.hp,
          maxHp: run.maxHp,
          upgrades: deckCardEntries(run, (card) => !!card.upgradeId).length,
          deeds: run.completedDeedIds?.length ?? 0,
          money: run.money,
          last,
        };
      }
      wins += 1;
      afterWin(run, opp, duel);
    }
    return {
      clear: true,
      wins,
      hp: run.hp,
      maxHp: run.maxHp,
      upgrades: deckCardEntries(run, (card) => !!card.upgradeId).length,
      deeds: run.completedDeedIds?.length ?? 0,
      money: run.money,
      last,
    };
  });
}
