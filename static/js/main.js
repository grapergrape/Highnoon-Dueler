import { STARTER_DECK_IDS, shuffle } from "./deck.js";
import { DEFAULT_GUN_ID } from "./guns.js";
import { getOpponent } from "./opponents.js";
import { getClass } from "./classes.js";
import {
  createDuel,
  tryPlayCard,
  lockInPrep,
  tickHighNoon,
  tickStaredown,
  dealStaredownChoices,
  commitPlayerStaredown,
} from "./duel.js";
import { drawGame, pushTracer, tickFx } from "./render.js";
import { tickCombatUi, enqueueCombatFloats, resetCombatUi } from "./combat-ui.js";
import { bindInput } from "./input.js";
import {
  updateHud,
  renderClassSelect,
  renderWanted,
  renderShop,
  renderDuelPanel,
  renderGameOver,
} from "./ui.js";

const LS_KEY = "highnoon_duelist_v1";

/** Time on win/loss art + duel panel before shop / game-over */
const DUEL_END_LINGER_MS = 2800;

/** After game-over, idle before returning to Wanted Board (click skips) */
const GAMEOVER_AUTO_RETURN_MS = 4200;

function defaultRun(classId = "outlaw") {
  const cls = getClass(classId);
  return {
    money: 40 + cls.bonusMoney,
    hp: 100,
    maxHp: 100,
    gunId: DEFAULT_GUN_ID,
    deckIds: [...cls.starterDeck],
    ownedGuns: [DEFAULT_GUN_ID],
    permanent: {},
    classId: cls.id,
  };
}

function hasSavedRun() {
  try {
    const j = localStorage.getItem(LS_KEY);
    if (!j) return false;
    const o = JSON.parse(j);
    return !!(o && o.classId);
  } catch {
    return false;
  }
}

function loadRun() {
  try {
    const j = localStorage.getItem(LS_KEY);
    if (!j) return defaultRun();
    const o = JSON.parse(j);
    const base = defaultRun(o.classId ?? "outlaw");
    return {
      ...base,
      ...o,
      deckIds: o.deckIds?.length ? o.deckIds : base.deckIds,
      ownedGuns: o.ownedGuns?.length ? o.ownedGuns : [DEFAULT_GUN_ID],
      permanent: o.permanent && typeof o.permanent === "object" ? o.permanent : {},
      classId: o.classId ?? "outlaw",
    };
  } catch {
    return defaultRun();
  }
}

function saveRun(run) {
  localStorage.setItem(LS_KEY, JSON.stringify(run));
}

function bountyFor(oppId) {
  if (oppId === "blackjack_riley") return 55;
  if (oppId === "silent_rose") return 70;
  return 50;
}

const game = {
  screen: "wanted",
  run: loadRun(),
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
  const all = [...d.playerDrawPile, ...d.playerDiscard, ...d.playerHand].map((c) => c.id);
  game.run.deckIds = shuffle(all.length ? all : [...STARTER_DECK_IDS]);
}

function clearNavTimers() {
  if (game._gameOverReturnTimer) {
    clearTimeout(game._gameOverReturnTimer);
    game._gameOverReturnTimer = null;
  }
}

function goClassSelect() {
  clearNavTimers();
  resetCombatUi(game);
  game.screen = "classselect";
  game.duel = null;
  updateHud(game);
  renderClassSelect((classId) => {
    game.run = defaultRun(classId);
    saveRun(game.run);
    goWanted();
  });
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

function startDuel(oppId) {
  resetCombatUi(game);
  const opp = getOpponent(oppId);
  game.lastBounty = bountyFor(oppId);
  game.run.hp = Math.min(game.run.maxHp, Math.max(1, game.run.hp));
  game.duel = createDuel(opp, game.run);
  dealStaredownChoices(game.duel);
  game.screen = "duel";
  updateHud(game);
  refreshDuelUi();
}

function refreshDuelUi() {
  renderDuelPanel(game, onPlayCard, onLockIn, onCommitStaredown);
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

function openShop() {
  game.screen = "shop";
  renderShop(
    game,
    (cardId, price) => {
      if (game.run.money < price) return;
      if (game.run.deckIds.length >= 22) return;
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
      if (game.run.money < 45) return;
      if (game.run.ownedGuns?.includes("schofield")) return;
      game.run.money -= 45;
      game.run.gunId = "schofield";
      game.run.ownedGuns = [...(game.run.ownedGuns || []), "schofield"];
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
    game.run.money += game.lastBounty;
    saveRun(game.run);
    updateHud(game);
    openShop();
  } else {
    game.screen = "gameover";
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
      if (game.duel.phase === "ended" && !game.duel._finishScheduled) {
        game.duel._finishScheduled = true;
        const snap = game.duel;
        setTimeout(() => {
          game.duel = snap;
          endDuelFlow();
        }, DUEL_END_LINGER_MS);
      }
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
  if (hasSavedRun()) {
    goWanted();
  } else {
    goClassSelect();
  }

  bindInput(game, {
    onLockIn,
    onBack: () => {
      if (game.screen === "shop") goWanted();
    },
  });

  requestAnimationFrame(loop);
}

init();
