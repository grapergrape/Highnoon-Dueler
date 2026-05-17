import { defaultRun } from "../static/js/app/run-state.js";
import { CLASSES } from "../static/js/data/classes.js";
import { CARD_DEFINITIONS, effectsForCardLevel, getCardDef, parseEffect } from "../static/js/data/cards.js";
import { WHISKEY_HEAL_AMOUNT, whiskeyPriceFromBounty } from "../static/js/data/economy.js";
import { getGun, gunsForClass, starterGunIdForClass } from "../static/js/data/guns.js";
import { OPPONENTS } from "../static/js/data/opponents.js";
import {
  createDuel,
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
      console.log(`${i + 1}. ${status} wins=${r.wins} hp=${r.hp}/${r.maxHp} money=$${r.money} last=${r.last}`);
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
  const incoming = estimateVolleyDamage(duel, "enemy")?.total ?? 0;
  const outgoing = estimateVolleyDamage(duel, "player")?.total ?? 0;
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
    .sort((a, b) => cardScore(getCardDef(b.id), { duel, run }) - cardScore(getCardDef(a.id), { duel, run }))
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

function worstCardIndex(run) {
  let worst = { ix: -1, score: Infinity };
  run.deckIds.forEach((id, ix) => {
    if (id.startsWith("gun_")) return;
    const score = cardScore(getCardDef(id), { run });
    if (score < worst.score) worst = { ix, score };
  });
  return worst;
}

function takeCard(run, card, force = false) {
  if (!card) return false;
  const pickScore = cardScore(card, { run });
  if (!force && pickScore < 20) return false;
  if (run.deckIds.length < MAX_DECK) {
    run.deckIds.push(card.id);
    return true;
  }
  const worst = worstCardIndex(run);
  if (worst.ix >= 0 && pickScore > worst.score + 8) {
    run.deckIds.splice(worst.ix, 1, card.id);
    return true;
  }
  return false;
}

function takeGun(run, gun, force = false) {
  if (!gun) return false;
  const pickScore = gunScore(gun, { run });
  const guns = run.deckIds
    .map((id, ix) => ({ id, ix, gun: getGun(id) }))
    .filter((x) => x.id.startsWith("gun_") && x.gun);
  if (!force && pickScore < 65) return false;
  if (guns.length < 2 && run.deckIds.length < MAX_DECK) {
    run.deckIds.push(gun.id);
    return true;
  }
  if (guns.length >= 2) {
    const worst = guns
      .map((x) => ({ ...x, score: gunScore(x.gun, { run }) }))
      .sort((a, b) => a.score - b.score)[0];
    if (worst && pickScore > worst.score + 15) {
      run.deckIds.splice(worst.ix, 1, gun.id);
      return true;
    }
    return false;
  }
  const worst = worstCardIndex(run);
  if (worst.ix >= 0 && pickScore > worst.score + 25) {
    run.deckIds.splice(worst.ix, 1, gun.id);
    return true;
  }
  return false;
}

function shop(run, bountyEarned) {
  const cardOffers = [...cardPool(run)].sort(() => Math.random() - 0.5).slice(0, 5);
  const gunOffers = [...gunPool(run)].sort(() => Math.random() - 0.5).slice(0, 4);
  const purchases = [
    ...cardOffers.map((card) => ({ type: "card", item: card, price: 8 + (card.cost || 0) * 3, score: cardScore(card, { run }) })),
    ...gunOffers.map((gun) => ({ type: "gun", item: gun, price: PRICE_BY_RARITY[gun.rarity] ?? 40, score: gunScore(gun, { run }) })),
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
    const before = run.deckIds.join("|");
    if (best.type === "card") takeCard(run, best.item, true);
    else takeGun(run, best.item, true);
    if (run.deckIds.join("|") !== before) run.money -= best.price;
  }

  if (!healed && hpMissing >= 16 && run.hp <= Math.ceil(run.maxHp * 0.72) && run.money >= healPrice) {
    run.money -= healPrice;
    run.hp = Math.min(run.maxHp, run.hp + WHISKEY_HEAL_AMOUNT);
  }
}

function afterWin(run, opp, duel) {
  const mult = run.permanent?.bountyMult ?? 1;
  const bounty = Math.round((opp.bounty ?? (35 + opp.difficultyTier * 12)) * mult)
    + Math.max(0, Math.round(duel.bonusBounty || 0));
  run.money += bounty;
  if (!run.defeatedOpponentIds.includes(opp.id)) run.defeatedOpponentIds.push(opp.id);
  if (opp.role === "boss") run.currentTownOrder = Math.min(5, opp.townOrder + 1);
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
  shop(run, bounty);
}

function runOne(classId, seed, buildPath = null) {
  return withSeed(seed, (rng) => {
    const run = defaultRun(classId);
    if (buildPath) run.preferredBuildPath = buildPath;
    let wins = 0;
    let last = null;
    for (const opp of route) {
      const duel = fight(run, opp, rng);
      last = `${opp.name}:${duel.winner}:${run.hp}`;
      if (duel.winner !== "player") {
        return { clear: false, wins, hp: run.hp, maxHp: run.maxHp, money: run.money, last };
      }
      wins += 1;
      afterWin(run, opp, duel);
    }
    return { clear: true, wins, hp: run.hp, maxHp: run.maxHp, money: run.money, last };
  });
}
