import { defaultRun } from "../static/js/app/run-state.js";
import { CLASSES } from "../static/js/data/classes.js";
import { CARD_DEFINITIONS, effectsForCardLevel, getCardDef, getClassShowdownCatalog, parseEffect } from "../static/js/data/cards.js";
import { getGun, gunsForClass, starterGunIdForClass } from "../static/js/data/guns.js";
import { OPPONENTS } from "../static/js/data/opponents.js";
import {
  commitPlayerStaredown,
  createDuel,
  dealStaredownChoices,
  lockInPrep,
  tickHighNoon,
  tickStaredown,
  tryPlayCard,
} from "../static/js/duel/duel.js";

const DEFAULT_RUNS_PER_CLASS = 200;
const DEFAULT_SEED = 100000;
const MAX_DECK = 24;
const GUN_DROP_CHANCE = 0.20;
const RARITY_WEIGHTS = { common: 34, uncommon: 40, rare: 18, epic: 6, legendary: 2 };
const RARITY_SCORE = { common: 0, uncommon: 2, rare: 5, epic: 8, legendary: 12 };

const args = parseArgs(process.argv.slice(2));
const runsPerClass = args.runs ?? DEFAULT_RUNS_PER_CLASS;
const baseSeed = args.seed ?? DEFAULT_SEED;
const outputJson = !!args.json;
const route = [...OPPONENTS].sort((a, b) => a.townOrder - b.townOrder || a.roleOrder - b.roleOrder);

const result = runSimulation({ runsPerClass, baseSeed });

if (outputJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  printMarkdown(result);
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg === "--json") {
      parsed.json = true;
    } else if (arg === "--runs") {
      parsed.runs = readPositiveInt(rawArgs[++i], "--runs");
    } else if (arg.startsWith("--runs=")) {
      parsed.runs = readPositiveInt(arg.slice("--runs=".length), "--runs");
    } else if (arg === "--seed") {
      parsed.seed = readPositiveInt(rawArgs[++i], "--seed");
    } else if (arg.startsWith("--seed=")) {
      parsed.seed = readPositiveInt(arg.slice("--seed=".length), "--seed");
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function readPositiveInt(value, label) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be a positive integer`);
  return n;
}

function printHelp() {
  console.log(`Usage: node tools/balance-sim.mjs [--runs 200] [--seed 100000] [--json]

Runs deterministic full-route balance simulations for each class.

Options:
  --runs N     Runs per class. Default: 200.
  --seed N     Base seed. Default: 100000.
  --json       Emit machine-readable JSON instead of Markdown tables.
`);
}

function runSimulation({ runsPerClass, baseSeed }) {
  const bosses = route.filter((opp) => opp.role === "boss");
  const classRows = [];
  const bossDeathMatrix = {};
  const deathTotals = {};
  const opponentStats = new Map(route.map((opp) => [opp.id, emptyOpponentStats()]));

  for (const cls of CLASSES) {
    const bossDeaths = Object.fromEntries(bosses.map((boss) => [boss.name, 0]));
    const deathCounts = {};
    let fullClears = 0;
    let totalWins = 0;
    let nonBossDeaths = 0;

    for (let i = 0; i < runsPerClass; i++) {
      Math.random = mulberry32(baseSeed + i * 97 + stableClassSeed(cls.id));
      const run = defaultRun(cls.id);
      const unlocks = defaultUnlocks();
      let wins = 0;

      for (const opp of route) {
        const stats = opponentStats.get(opp.id);
        stats.reached += 1;
        const duel = fight(opp, run);
        if (duel.winner === "player") {
          wins += 1;
          totalWins += 1;
          stats.wins += 1;
          stats.hpAfter += run.hp;
          stats.cyclesWin += duel.cycleCount || 0;
          afterWin(run, opp, duel, unlocks);
          continue;
        }

        stats.deaths += 1;
        stats.enemyHpOnLoss += Math.max(0, duel.enemy?.hp ?? 0);
        stats.cyclesLoss += duel.cycleCount || 0;
        stats.deathsByClass[cls.id] = (stats.deathsByClass[cls.id] ?? 0) + 1;
        deathCounts[opp.name] = (deathCounts[opp.name] ?? 0) + 1;
        if (opp.role === "boss") bossDeaths[opp.name] += 1;
        else nonBossDeaths += 1;
        break;
      }

      if (wins === route.length) fullClears += 1;
    }

    bossDeathMatrix[cls.name] = bossDeaths;
    deathTotals[cls.name] = {
      fullClears,
      bossDeaths: Object.values(bossDeaths).reduce((sum, n) => sum + n, 0),
      nonBossDeaths,
    };
    classRows.push({
      class: cls.name,
      clears: `${fullClears}/${runsPerClass}`,
      clearPct: percent(fullClears, runsPerClass),
      avgWins: round(totalWins / runsPerClass, 2),
      topDeaths: Object.entries(deathCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    });
  }

  return {
    settings: {
      runsPerClass,
      baseSeed,
      cardRewards: true,
      gunDropChance: GUN_DROP_CHANCE,
      whiskeyHealing: true,
      shopPurchases: false,
      relics: false,
      smithing: false,
      potions: false,
    },
    bossOrder: bosses.map((boss) => boss.name),
    classRows,
    bossDeathMatrix,
    deathTotals,
    opponentRows: route.map((opp) => formatOpponentRow(opp, opponentStats.get(opp.id))),
  };
}

function emptyOpponentStats() {
  return {
    reached: 0,
    deaths: 0,
    wins: 0,
    hpAfter: 0,
    enemyHpOnLoss: 0,
    cyclesWin: 0,
    cyclesLoss: 0,
    deathsByClass: {},
  };
}

function formatOpponentRow(opp, stats) {
  return {
    opponent: opp.name,
    role: opp.role,
    reached: stats.reached,
    deaths: stats.deaths,
    winPct: stats.reached ? percent(stats.wins, stats.reached) : 0,
    avgHpAfterWin: stats.wins ? round(stats.hpAfter / stats.wins, 1) : null,
    avgEnemyHpOnLoss: stats.deaths ? round(stats.enemyHpOnLoss / stats.deaths, 1) : null,
    avgCyclesWin: stats.wins ? round(stats.cyclesWin / stats.wins, 2) : null,
    avgCyclesLoss: stats.deaths ? round(stats.cyclesLoss / stats.deaths, 2) : null,
    deathsByClass: stats.deathsByClass,
  };
}

function defaultUnlocks() {
  const unlockedShowdownIdsByClass = {};
  const clearedBossTownsByClass = {};
  for (const cls of CLASSES) {
    const catalog = getClassShowdownCatalog(cls.id);
    unlockedShowdownIdsByClass[cls.id] = catalog.filter((card) => card.defaultUnlocked).map((card) => card.id);
    clearedBossTownsByClass[cls.id] = [];
  }
  return { unlockedShowdownIdsByClass, clearedBossTownsByClass };
}

function unlockBoss(state, classId, townOrder) {
  const catalog = getClassShowdownCatalog(classId);
  const cleared = state.clearedBossTownsByClass[classId] ?? [];
  if (!cleared.includes(townOrder)) cleared.push(townOrder);
  const unlocked = new Set(state.unlockedShowdownIdsByClass[classId] ?? []);
  for (const card of catalog) {
    if (card.unlockTownOrder === townOrder) unlocked.add(card.id);
  }
  state.unlockedShowdownIdsByClass[classId] = catalog.filter((card) => unlocked.has(card.id)).map((card) => card.id);
}

function fight(opp, run) {
  const duel = createDuel(opp, run);
  dealStaredownChoices(duel, run);
  const staredown = chooseBestCard(duel.staredownChoices, { duel, run }, -999) ?? duel.staredownChoices[0];
  commitPlayerStaredown(duel, run, staredown.uid);

  let safety = 0;
  while (duel.phase !== "ended" && safety++ < 240) {
    if (duel.phase === "prep") {
      playPrep(duel, run);
      lockInPrep(duel, run);
    } else if (duel.phase === "staredown_reveal") {
      tickStaredown(duel, run, 99);
    } else if (duel.phase === "highnoon") {
      tickHighNoon(duel, run, 99);
    } else {
      break;
    }
    if ((duel.cycleNumber ?? 1) > 60) break;
  }
  if (duel.phase !== "ended") duel.winner = "enemy";
  return duel;
}

function playPrep(duel, run) {
  let guard = 0;
  while (duel.phase === "prep" && !duel.playerLocked && (duel.playerPlaysRemaining ?? 0) > 0 && guard++ < 8) {
    const playable = duel.playerHand.filter((card) => canAffordCard(card, duel, run));
    const pick = chooseBestCard(playable, { duel, run }, 1);
    if (!pick) break;
    const result = tryPlayCard(duel, run, pick.uid);
    if (!result.ok) break;
  }
}

function canAffordCard(card, duel, run) {
  const def = getCardDef(card.id);
  if (!def) return false;
  let cost = def.cost ?? 0;
  const isPersistent = def.type === "stance" || def.type === "showdown" || def.type === "character";
  const isComboFree = !isPersistent && def.outlawCombo && duel.nextComboFree;
  const isFreeGun = def.type === "gun" && !!run.permanent?.freeFirstGunEachDuel && !duel.freeGunPlayed;
  const usingFreebie = def.type !== "gun" && !isPersistent && !isComboFree && duel.freeCardAvailable === true;
  if (isComboFree || isFreeGun || usingFreebie) cost = 0;
  return cost <= duel.playerFocus;
}

function afterWin(run, opp, duel, unlocks) {
  const bounty = Math.round((opp.bounty ?? (35 + opp.difficultyTier * 12)) * (run.permanent?.bountyMult ?? 1))
    + Math.max(0, Math.round(duel.bonusBounty || 0));
  run.money += bounty;
  if (!run.defeatedOpponentIds.includes(opp.id)) run.defeatedOpponentIds.push(opp.id);
  if (opp.role === "boss") {
    unlockBoss(unlocks, run.classId, opp.townOrder);
    run.currentTownOrder = Math.min(5, opp.townOrder + 1);
  }
  applySheriffRespect(run);
  takeReward(run, unlocks);
  buyWhiskeyIfUseful(run);
}

function applySheriffRespect(run) {
  const perm = run.permanent;
  if (!perm || !Number.isFinite(perm.respectMax) || perm.respectMax <= 0) return;
  const cap = perm.respectMax;
  const cur = perm.respect ?? 0;
  if (cur >= cap) return;
  perm.respect = cur + 1;
  const hpEach = perm.respectMaxHpEach ?? 0;
  if (hpEach > 0) {
    run.maxHp += hpEach;
    run.hp = Math.min(run.maxHp, run.hp + hpEach);
  }
}

function buyWhiskeyIfUseful(run) {
  if (run.money < 12 || run.hp >= run.maxHp) return;
  run.money -= 12;
  run.hp = Math.min(run.maxHp, run.hp + 20);
}

function takeReward(run, unlocks) {
  const cards = rollRewardCards(run, unlocks, 3);
  const pick = chooseBestCard(cards, { run }, 5);
  if (pick) {
    if (run.deckIds.length < MAX_DECK) {
      run.deckIds.push(pick.id);
    } else {
      const worst = worstDeckCard(run);
      const pickScore = cardScore(pick, { run });
      if (worst.id && pickScore > worst.score + 8) {
        run.deckIds.splice(run.deckIds.indexOf(worst.id), 1, pick.id);
      }
    }
  }
  takeGunDrop(run);
}

function takeGunDrop(run) {
  if (Math.random() >= GUN_DROP_CHANCE) return;
  const pool = gunsForClass(run.classId).filter((gun) =>
    !run.deckIds.includes(gun.id)
    && gun.id !== starterGunIdForClass(run.classId)
    && gun.id !== run.permanent?.startSecondaryGunId
  );
  if (!pool.length) return;

  const rarity = drawRarity(pool);
  const candidates = rarity ? pool.filter((gun) => gun.rarity === rarity) : pool;
  const gun = candidates[(Math.random() * candidates.length) | 0];
  const gunCards = run.deckIds.filter((id) => id.startsWith("gun_"));
  const gunScore = cardScore(getCardDef(gun.id), { run });
  if (gunCards.length < 2 && gunScore > 4) {
    run.deckIds.push(gun.id);
    return;
  }
  if (!gunCards.length) return;

  let worstGun = gunCards[0];
  let worstScore = cardScore(getCardDef(worstGun), { run });
  for (const id of gunCards.slice(1)) {
    const score = cardScore(getCardDef(id), { run });
    if (score < worstScore) {
      worstScore = score;
      worstGun = id;
    }
  }
  if (gunScore > worstScore + 8) run.deckIds.splice(run.deckIds.indexOf(worstGun), 1, gun.id);
}

function rollRewardCards(run, unlocks, count = 3) {
  const pool = availableRewardCards(run, unlocks);
  const picks = [];
  while (pool.length && picks.length < count) {
    const rarity = drawRarity(pool);
    const candidates = rarity ? pool.filter((card) => card.rarity === rarity) : pool;
    const pick = candidates[(Math.random() * candidates.length) | 0];
    picks.push(pick);
    pool.splice(pool.findIndex((card) => card.id === pick.id), 1);
  }
  return picks;
}

function availableRewardCards(run, unlocks) {
  const owned = new Set(run.deckIds);
  const unlocked = new Set(unlocks.unlockedShowdownIdsByClass[run.classId] ?? []);
  return CARD_DEFINITIONS.filter((card) =>
    card.type !== "gun"
    && !card.opponentOnly
    && card.classId === run.classId
    && !(card.effects ?? []).includes("staredownOnly")
    && (card.type !== "showdown" || unlocked.has(card.id))
    && ((card.type !== "showdown" && card.type !== "stance") || !owned.has(card.id))
  );
}

function drawRarity(pool) {
  const rarities = new Set(pool.map((card) => card.rarity));
  const entries = Object.entries(RARITY_WEIGHTS).filter(([rarity]) => rarities.has(rarity));
  if (!entries.length) return null;
  let total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return entries.at(-1)[0];
}

function worstDeckCard(run) {
  let worstId = null;
  let worst = Infinity;
  for (const id of run.deckIds) {
    if (id.startsWith("gun_")) continue;
    const def = getCardDef(id);
    const uniquePenalty = def?.type === "showdown" || def?.type === "stance" ? 20 : 0;
    const score = cardScore(def, { run }) - uniquePenalty;
    if (score < worst) {
      worst = score;
      worstId = id;
    }
  }
  return { id: worstId, score: worst };
}

function chooseBestCard(cards, ctx, minScore = 0) {
  let best = null;
  let bestScore = -Infinity;
  for (const card of cards) {
    const def = getCardDef(card.id ?? card);
    const score = cardScore(def, ctx);
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return bestScore >= minScore ? best : null;
}

function cardScore(def, ctx = {}) {
  if (!def) return -999;
  let score = RARITY_SCORE[def.rarity] ?? 0;
  for (const raw of effectsForCardLevel(def, def.showdownLevel || 1)) score += effectScore(raw, ctx);

  if (def.type === "showdown") {
    score += 22;
    if (ctx.duel?.playerShowdown && ctx.duel.playerShowdown.id !== def.id) score -= 35;
  } else if (def.type === "stance") {
    const already = ctx.duel?.playerStances?.some((card) => card.id === def.id);
    score += already ? -8 : 12;
  } else if (def.type === "gun") {
    score += gunScoreDelta(def, ctx);
  }
  if (def.outlawCombo && ctx.run?.classId === "outlaw") {
    score += 8 + (ctx.duel?.roundOutlawCount ? 18 : 0);
  }
  score -= (def.cost ?? 0) * 3.2;
  return score;
}

function gunScoreDelta(def, ctx) {
  const gun = getGun(def.id);
  const gunValue = gun.mag * gun.damage * Math.max(0.1, gun.accuracy)
    + (gun.effects ?? []).reduce((sum, raw) => sum + effectScore(raw, ctx), 0);
  let currentValue = 0;
  if (ctx.duel?.playerActiveGun?.stats) {
    const current = ctx.duel.playerActiveGun.stats;
    currentValue = current.mag * current.damage * Math.max(0.1, current.accuracy);
  } else {
    const starter = getGun(starterGunIdForClass(ctx.run?.classId));
    currentValue = starter.mag * starter.damage * starter.accuracy;
  }
  let score = (gunValue - currentValue) * 0.55;
  if (ctx.run?.permanent?.freeFirstGunEachDuel && !ctx.duel?.freeGunPlayed) score += 10;
  return score;
}

function effectScore(raw, ctx = {}) {
  const effect = parseEffect(raw);
  const value = typeof effect.value === "number" ? effect.value : 1;
  const classId = ctx.run?.classId;
  const hpMissing = Math.max(0, (ctx.run?.maxHp ?? 100) - (ctx.run?.hp ?? 100));
  switch (effect.kind) {
    case "bullets": return value * 7;
    case "damage": return value * 4.5;
    case "damageShootout": return value * 60;
    case "accShootout": return value * 95;
    case "accGlobal": return value * 120;
    case "firstHitsAuto": return value * 18;
    case "dodgeRecv": return value * 8.5;
    case "returnBulletOnHit": return value * 14;
    case "hpAfterShootout": return Math.min(Math.max(0, value), hpMissing + 8) * 1.4;
    case "hpAfterCycle": return Math.min(Math.max(0, value), hpMissing + 6) * 1.2;
    case "healNow": return Math.min(Math.max(0, value), hpMissing) * 1.35 + (hpMissing > 20 ? 4 : 0);
    case "enemyAccNext": return -value * 80;
    case "enemyBullets": return -value * 10;
    case "enemyDodge": return -value * 9;
    case "markEnemy": return classId === "marshal" ? value * 13 : value * 4;
    case "markBurst": return classId === "marshal" ? value * 18 : value * 8;
    case "markBulletPerMark": return classId === "marshal" ? value * 22 : value * 8;
    case "gainFocused": return 10;
    case "focusBonusBullets": return value * 8;
    case "focusBonusAcc": return value * 80;
    case "focusCycle": return value * 12;
    case "focusPerRound":
    case "staminaPerRound": return value * 16;
    case "extraPlay": return value * 13;
    case "nextComboFree": return classId === "outlaw" ? 10 : 2;
    case "comboBonus": return classId === "outlaw" ? 9 : 0;
    case "extraVolleyShots": return classId === "outlaw" ? value * 18 : value * 8;
    case "spirit": return classId === "apache_tracker" ? value * 14 : value * 3;
    case "spiritDoubleNext": return classId === "apache_tracker" ? 15 : 2;
    case "spiritScaleAcc": return classId === "apache_tracker" ? value * 280 : value * 100;
    case "spiritScaleDamage": return classId === "apache_tracker" ? value * 260 : value * 90;
    case "spiritScaleEnemyAcc": return classId === "apache_tracker" ? -value * 220 : -value * 70;
    case "damageTaken": return Math.abs(value) * 9;
    case "deadeye": return 14;
    case "dualWieldAccPenaltyReduce": return classId === "vaquero" ? value * 180 : value * 30;
    case "removeDualPenalty": return classId === "vaquero" ? 18 : 3;
    case "lifestealOnHit": return value * (hpMissing > 0 ? 7 : 4);
    case "bountyOnHit": return value * 0.6;
    case "damagePerHp": return classId === "sheriff" ? 18 : 6;
    case "respectCapSet": return classId === "sheriff" ? 8 : 0;
    case "maxHp": return value * 1.7;
    case "payHp": return -Math.abs(value) * ((ctx.run?.hp ?? 100) < (ctx.run?.maxHp ?? 100) * 0.45 ? 1.5 : 0.55);
    case "pierce": return 10;
    case "ricochet": return 10;
    case "elDoble": return classId === "vaquero" ? 24 : 4;
    case "staredownOnly": return 0;
    default: return 0;
  }
}

function printMarkdown(data) {
  console.log(`# Balance Simulation`);
  console.log(`Runs per class: ${data.settings.runsPerClass}`);
  console.log(`Seed: ${data.settings.baseSeed}`);
  console.log(`Model: card rewards, 20% gun drops, whiskey healing, no shop purchases, no relics, no smithing, no potions\n`);

  console.log(`## Class Clears\n`);
  console.log(`| Class | Clears | Clear % | Avg wins | Top deaths |`);
  console.log(`| --- | ---: | ---: | ---: | --- |`);
  for (const row of data.classRows) {
    console.log(`| ${row.class} | ${row.clears} | ${row.clearPct}% | ${row.avgWins} | ${formatTopDeaths(row.topDeaths)} |`);
  }

  console.log(`\n## Boss Death Matrix\n`);
  console.log(`| Class | ${data.bossOrder.join(" | ")} | Boss deaths | Non-boss deaths | Clears |`);
  console.log(`| --- | ${data.bossOrder.map(() => "---:").join(" | ")} | ---: | ---: | ---: |`);
  for (const row of data.classRows) {
    const matrix = data.bossDeathMatrix[row.class];
    const totals = data.deathTotals[row.class];
    console.log(`| ${row.class} | ${data.bossOrder.map((name) => matrix[name]).join(" | ")} | ${totals.bossDeaths} | ${totals.nonBossDeaths} | ${totals.fullClears} |`);
  }

  console.log(`\n## Opponent Rows\n`);
  console.log(`| Opponent | Role | Reached | Deaths | Win % | Avg HP after win | Avg enemy HP on loss |`);
  console.log(`| --- | --- | ---: | ---: | ---: | ---: | ---: |`);
  for (const row of data.opponentRows) {
    console.log(`| ${row.opponent} | ${row.role} | ${row.reached} | ${row.deaths} | ${row.winPct}% | ${row.avgHpAfterWin ?? ""} | ${row.avgEnemyHpOnLoss ?? ""} |`);
  }
}

function formatTopDeaths(entries) {
  if (!entries.length) return "";
  return entries.map(([name, count]) => `${name}: ${count}`).join("; ");
}

function percent(numerator, denominator) {
  return round((numerator / denominator) * 100, 1);
}

function round(value, places) {
  const mult = 10 ** places;
  return Math.round(value * mult) / mult;
}

function stableClassSeed(classId) {
  return classId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function mulberry32(seed) {
  return function nextRandom() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
