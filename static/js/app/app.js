import { STARTER_DECK_IDS, shuffle } from "../data/deck.js";
import { starterGunIdForClass } from "../data/guns.js";
import { getOpponent, TOWNS } from "../data/opponents.js";
import {
  createDuel,
  tryPlayCard,
  lockInPrep,
  tickHighNoon,
  tickStaredown,
  dealStaredownChoices,
  commitPlayerStaredown,
} from "../duel/duel.js";
import { drawGame, pushTracer, tickFx } from "../rendering/render.js";
import { tickCombatUi, enqueueCombatFloats, resetCombatUi } from "../ui/combat-ui.js";
import { bindInput } from "../ui/input.js";
import {
  updateHud,
  renderClassSelect,
  renderWanted,
  renderShop,
  renderDuelPanel,
  renderGameOver,
} from "../ui/ui.js";
import { getClass, applyClassToRun } from "../data/classes.js";
import { LS_KEY, defaultRun, loadRun, saveRun } from "./run-state.js";

const GAMEOVER_AUTO_RETURN_MS = 10000;

function bountyFor(oppId) {
  const opp = getOpponent(oppId);
  return opp.bounty ?? (35 + opp.difficultyTier * 12);
}

const _savedRun = loadRun();

const game = {
  screen: "wanted",
  run: _savedRun ?? defaultRun(),
  duel: null,
  canvas: null,
  ctx: null,
  time: 0,
  lastT: 0,
  screenShake: 0,
  muzzleFx: [],
  lastBounty: 50,
  assets: {
    /** 2×2 sheet: TL prep, TR shootout, BL player win, BR opponent win */
    duelScenes: null,
  },
  combatFloats: [],
  statPulse: {
    player: 0,
    enemy: 0,
    playerKind: "buff",
    enemyKind: "buff",
  },
};

function loadAsset(url) {
  return new Promise((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = url;
  });
}

function preloadDuelArt() {
  loadAsset("/static/img/duel-scenes-2x2.jpg").then((img) => {
    game.assets.duelScenes = img;
  });
}

function syncDeckFromDuel() {
  if (!game.duel) return;
  const d = game.duel;
  const persistent = [
    ...(d.playerStances ?? []),
    ...(d.playerShowdown ? [d.playerShowdown] : []),
  ];
  const all = [...d.playerDrawPile, ...d.playerDiscard, ...d.playerHand, ...persistent].map((c) => c.id);
  const fallback = game.run?.classId
    ? (getClass(game.run.classId)?.starterDeckIds ?? STARTER_DECK_IDS)
    : STARTER_DECK_IDS;
  game.run.deckIds = shuffle(all.length ? all : [...fallback]);
}

function clearNavTimers() {
  if (game._gameOverReturnTimer) {
    clearTimeout(game._gameOverReturnTimer);
    game._gameOverReturnTimer = null;
  }
}

function goWanted() {
  clearNavTimers();
  resetCombatUi(game);
  game.screen = "wanted";
  game.duel = null;
  saveRun(game.run);
  updateHud(game);
  renderWanted(game, startDuel);
}

function goClassSelect() {
  clearNavTimers();
  resetCombatUi(game);
  game.screen = "class-select";
  game.duel = null;
  saveRun(game.run);
  updateHud(game);
  renderClassSelect(pickClass);
}

function pickClass(classId) {
  applyClassToRun(game.run, classId);
  game.run.activeGunId = starterGunIdForClass(classId);
  game.run.currentTownOrder = 1;
  game.run.defeatedOpponentIds = [];
  saveRun(game.run);
  updateHud(game);
  goWanted();
}

function normalizeTownOrder(order) {
  return Math.min(TOWNS.length, Math.max(1, Math.round(order || 1)));
}

function unlockedTownOrder() {
  return normalizeTownOrder(game.run.currentTownOrder);
}

function setCurrentTown(order) {
  game.run.currentTownOrder = normalizeTownOrder(order);
}

function recordOpponentWin(opp) {
  if (!opp) return;
  if (!Array.isArray(game.run.defeatedOpponentIds)) game.run.defeatedOpponentIds = [];
  if (!game.run.defeatedOpponentIds.includes(opp.id)) {
    game.run.defeatedOpponentIds.push(opp.id);
  }
  if (opp.role === "boss" && (game.run.currentTownOrder ?? 1) <= opp.townOrder) {
    setCurrentTown(Math.min(TOWNS.length, opp.townOrder + 1));
  }
}

function startDuel(oppId) {
  resetCombatUi(game);
  const opp = getOpponent(oppId);
  const highestUnlockedTown = unlockedTownOrder();
  if (opp.townOrder > highestUnlockedTown) return;
  setCurrentTown(highestUnlockedTown);
  game.lastBounty = bountyFor(oppId);
  game.run.hp = Math.min(game.run.maxHp, Math.max(1, game.run.hp));
  saveRun(game.run);
  game.duel = createDuel(opp, game.run);
  dealStaredownChoices(game.duel, game.run);
  game.screen = "duel";
  updateHud(game);
  refreshDuelUi();
}

function refreshDuelUi() {
  renderDuelPanel(game, onPlayCard, onLockIn, onCommitStaredown, onContinueDuel);
}

function onContinueDuel() {
  if (!game.duel || game.duel.phase !== "ended") return;
  endDuelFlow();
}

function onCommitStaredown(uid) {
  if (!game.duel) return;
  const ok = commitPlayerStaredown(game.duel, game.run, uid);
  if (ok) {
    saveRun(game.run);
    updateHud(game);
    refreshDuelUi();
  }
}

function onPlayCard(uid) {
  const r = tryPlayCard(game.duel, game.run, uid);
  if (r.ok) {
    if (r.feedback?.length) enqueueCombatFloats(game, r.feedback);
    saveRun(game.run);
    updateHud(game);
    refreshDuelUi();
  }
}

function onLockIn() {
  if (!game.duel || game.duel.phase !== "prep") return;
  const r = lockInPrep(game.duel, game.run);
  if (r.enemyFeedback?.length) enqueueCombatFloats(game, r.enemyFeedback);
  saveRun(game.run);
  updateHud(game);
  refreshDuelUi();
  if (r.toStaredown) {
    game.screenShake = 0.1;
  }
}

function gunCountInDeck(deckIds) {
  let n = 0;
  for (const id of deckIds) if (id.startsWith("gun_")) n++;
  return n;
}

function openShop() {
  game.screen = "shop";
  renderShop(
    game,
    (cardId, price, opts) => {
      if (game.run.money < price) return;
      const isGun = cardId.startsWith("gun_");
      const replacingGun = isGun && !!opts?.replaceGunId;
      const replacingCard = !isGun && !!opts?.replaceCardId;
      if (game.run.deckIds.length >= 24 && !replacingGun && !replacingCard) return;
      if (isGun) {
        if (game.run.deckIds.includes(cardId)) return; // no duplicate guns
        const owned = gunCountInDeck(game.run.deckIds);
        if (owned >= 2) {
          if (!opts?.replaceGunId) return; // shop should re-prompt
          const ix = game.run.deckIds.indexOf(opts.replaceGunId);
          if (ix < 0) return;
          game.run.deckIds.splice(ix, 1);
        }
      } else if (opts?.replaceCardId) {
        if (opts.replaceCardId.startsWith("gun_")) return;
        const ix = game.run.deckIds.indexOf(opts.replaceCardId);
        if (ix < 0) return;
        game.run.deckIds.splice(ix, 1);
      }
      game.run.money -= price;
      game.run.deckIds.push(cardId);
      saveRun(game.run);
      updateHud(game);
      openShop();
    },
    () => {
      if (game.run.money < 12) return;
      game.run.money -= 12;
      game.run.hp = Math.min(game.run.maxHp, game.run.hp + 20);
      saveRun(game.run);
      updateHud(game);
      openShop();
    },
    () => {
      goWanted();
    }
  );
}

function endDuelFlow() {
  const d = game.duel;
  if (!d) return;
  resetCombatUi(game);
  syncDeckFromDuel();
  if (d.winner === "player") {
    const mult = game.run.permanent?.bountyMult ?? 1;
    game.run.money += Math.round(game.lastBounty * mult);
    recordOpponentWin(d.opponentDef);

    // Apply cumulative growth for next time (Outlaw class: bountyGrowthPerWin = 0.25, cap 3.0)
    const growth = game.run.permanent?.bountyGrowthPerWin ?? 0;
    if (growth > 0) {
      game.run.permanent.bountyMult = Math.min(3.0, mult + growth);
    }

    // Sheriff Respect: each kill earns 1 point (cap respectMax), each point grants +respectMaxHpEach max HP.
    const perm = game.run.permanent;
    if (perm && Number.isFinite(perm.respectMax) && perm.respectMax > 0) {
      const cap = perm.respectMax;
      const cur = perm.respect ?? 0;
      if (cur < cap) {
        perm.respect = cur + 1;
        const hpEach = perm.respectMaxHpEach ?? 0;
        if (hpEach > 0) {
          game.run.maxHp += hpEach;
          game.run.hp = Math.min(game.run.maxHp, game.run.hp + hpEach);
        }
      }
    }


    saveRun(game.run);
    updateHud(game);
    openShop();
  } else {
    game.screen = "gameover";
    localStorage.removeItem(LS_KEY);
    renderGameOver(game, () => {
      clearNavTimers();
      localStorage.removeItem(LS_KEY);
      goClassSelect();
    });
    game._gameOverReturnTimer = setTimeout(() => {
      game._gameOverReturnTimer = null;
      if (game.screen !== "gameover") return;
      clearNavTimers();
      localStorage.removeItem(LS_KEY);
      goClassSelect();
    }, GAMEOVER_AUTO_RETURN_MS);
  }
  game.duel = null;
}

function loop(ts) {
  game.time = ts;
  const dt = game.lastT ? (ts - game.lastT) / 1000 : 0;
  game.lastT = ts;

  if (game.screenShake > 0) {
    game.screenShake = Math.max(0, game.screenShake - dt * 1.4);
  }

  if (game.screen === "duel" && game.duel?.phase === "staredown_reveal") {
    const before = game.duel.phase;
    tickStaredown(game.duel, game.run, dt);
    if (before === "staredown_reveal" && game.duel.phase !== "staredown_reveal") {
      game.screenShake = 0.2;
      refreshDuelUi();
    }
  }

  if (game.screen === "duel" && game.duel?.phase === "highnoon") {
    const before = game.duel.phase;
    tickHighNoon(game.duel, game.run, dt);
    if (before === "highnoon" && game.duel.phase !== "highnoon") {
      for (const ev of game.duel.shootoutLog || []) {
        if (ev.kind === "hit") pushTracer(game, ev.by === "player");
        if (ev.kind === "rico") pushTracer(game, true);
      }
      game.screenShake = 0.4;
      updateHud(game);
      refreshDuelUi();
      // Duel ended — wait for player to click Continue (see onContinueDuel).
    }
  }

  tickFx(game, dt);
  tickCombatUi(game, dt);

  if (game.ctx && game.canvas) {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    if (game.screen === "duel" && game.duel) {
      drawGame(game.ctx, game, game.canvas.width, game.canvas.height);
    } else {
      drawTitle(game.ctx, game.canvas.width, game.canvas.height);
    }
  }

  requestAnimationFrame(loop);
}

function drawTitle(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#4a6fa5");
  g.addColorStop(1, "#3d2e22");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#f4d03f";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText("HIGH NOON DUELIST", w * 0.5, h * 0.45);
  ctx.fillStyle = "#e8dcc4";
  ctx.font = "14px monospace";
  ctx.fillText("Pick a poster to duel", w * 0.5, h * 0.55);
}

function init() {
  preloadDuelArt();
  game.canvas = document.getElementById("game-canvas");
  game.ctx = game.canvas.getContext("2d");
  updateHud(game);
  if (!game.run.classId) {
    goClassSelect();
  } else {
    goWanted();
  }

  bindInput(game, {
    onLockIn,
    onBack: () => {
      if (game.screen === "shop") goWanted();
    },
  });

  requestAnimationFrame(loop);
}

let started = false;

export function startApp() {
  if (started) return;
  started = true;
  init();
}
