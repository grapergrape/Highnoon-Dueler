import { parseEffect } from "../data/cards.js";

/**
 * @typedef {{ targetSide: 'player'|'enemy', kind: 'buff'|'debuff'|'neutral', text: string }} FeedbackLine
 */

function fmtPct(x) {
  return `${Math.round((x ?? 0) * 100)}%`;
}

/**
 * Map card effects to floating combat text (who glows / which side).
 * @param {{ type?: string, effects?: string[] }} def
 * @param {'player'|'enemy'} playedBy
 * @returns {FeedbackLine[]}
 */
export function feedbackLinesForCard(def, playedBy) {
  /** @type {FeedbackLine[]} */
  const lines = [];
  if (def.type === "character") {
    lines.push({ targetSide: "player", kind: "buff", text: "LEGEND" });
    return lines;
  }

  for (const raw of def.effects ?? []) {
    const e = parseEffect(raw);
    if (playedBy === "player") {
      if (e.kind === "enemyAccNext") {
        lines.push({ targetSide: "enemy", kind: "debuff", text: `${fmtPct(e.value)} ACC` });
      } else if (e.kind === "enemyBullets") {
        lines.push({ targetSide: "enemy", kind: "debuff", text: `${e.value ?? 0} rounds` });
      } else if (e.kind === "bullets") {
        lines.push({ targetSide: "player", kind: "buff", text: `+${e.value} rounds` });
      } else if (e.kind === "damage") {
        lines.push({ targetSide: "player", kind: "buff", text: `+${e.value} dmg` });
      } else if (e.kind === "accShootout") {
        const v = e.value || 0;
        lines.push({
          targetSide: "player",
          kind: v >= 0 ? "buff" : "debuff",
          text: `ACC ${v >= 0 ? "+" : ""}${fmtPct(v)}`,
        });
      } else if (e.kind === "damageShootout") {
        const v = e.value || 0;
        lines.push({
          targetSide: "player",
          kind: v >= 0 ? "buff" : "debuff",
          text: `Volley dmg ×${(1 + v).toFixed(2)}`,
        });
      } else if (e.kind === "pierce") {
        lines.push({ targetSide: "player", kind: "buff", text: "PIERCE" });
      } else if (e.kind === "ricochet") {
        lines.push({ targetSide: "player", kind: "buff", text: "RICOCHET" });
      } else if (e.kind === "dodgeRecv") {
        lines.push({ targetSide: "player", kind: "buff", text: `Dodge ${fmtPct(e.value)}` });
      } else if (e.kind === "firstHitsAuto") {
        lines.push({ targetSide: "player", kind: "buff", text: `True aim ×${e.value}` });
      } else if (e.kind === "returnBulletOnHit") {
        lines.push({ targetSide: "player", kind: "buff", text: "Return rounds" });
      } else if (e.kind === "hpAfterShootout") {
        lines.push({
          targetSide: "player",
          kind: (e.value ?? 0) >= 0 ? "buff" : "debuff",
          text: `After shot ${e.value ?? 0} HP`,
        });
      } else if (e.kind === "hpAfterCycle") {
        lines.push({
          targetSide: "player",
          kind: (e.value ?? 0) >= 0 ? "buff" : "debuff",
          text: `Next lock ${e.value ?? 0} HP`,
        });
      } else if (e.kind === "focusCycle") {
        lines.push({ targetSide: "player", kind: "buff", text: `+${e.value} FOC` });
      } else if (e.kind === "markEnemy") {
        lines.push({ targetSide: "enemy", kind: "debuff", text: `MARK ×${e.value}` });
      } else if (e.kind === "markBurst") {
        lines.push({ targetSide: "enemy", kind: "debuff", text: `BURST +${e.value}/mark` });
      } else if (e.kind === "gainFocused") {
        lines.push({ targetSide: "player", kind: "buff", text: "FOCUSED ✦" });
      } else if (e.kind === "focusBonusBullets") {
        lines.push({ targetSide: "player", kind: "buff", text: `+${e.value} rds if focused` });
      } else if (e.kind === "focusBonusAcc") {
        lines.push({ targetSide: "player", kind: "buff", text: `+${fmtPct(e.value)} acc if focused` });
      } else if (e.kind === "healNow") {
        lines.push({ targetSide: "player", kind: "buff", text: `+${e.value} HP` });
      }
    } else {
      if (e.kind === "enemyAccNext") {
        lines.push({
          targetSide: "player",
          kind: "debuff",
          text: `${fmtPct(e.value)} ACC`,
        });
      } else if (e.kind === "enemyBullets") {
        lines.push({
          targetSide: "player",
          kind: "debuff",
          text: `${e.value ?? 0} rounds`,
        });
      } else if (e.kind === "bullets") {
        lines.push({ targetSide: "enemy", kind: "buff", text: `+${e.value} rounds` });
      } else if (e.kind === "damage") {
        lines.push({ targetSide: "enemy", kind: "buff", text: `+${e.value} dmg` });
      } else if (e.kind === "accShootout") {
        const v = e.value || 0;
        lines.push({
          targetSide: "enemy",
          kind: v >= 0 ? "buff" : "debuff",
          text: `ACC ${v >= 0 ? "+" : ""}${fmtPct(v)}`,
        });
      } else if (e.kind === "damageShootout") {
        const v = e.value || 0;
        lines.push({
          targetSide: "enemy",
          kind: v >= 0 ? "buff" : "debuff",
          text: `Volley ×${(1 + v).toFixed(2)}`,
        });
      } else if (e.kind === "pierce" || e.kind === "ricochet") {
        lines.push({
          targetSide: "enemy",
          kind: "buff",
          text: e.kind === "pierce" ? "PIERCE" : "RICOCHET",
        });
      } else if (e.kind === "dodgeRecv") {
        lines.push({ targetSide: "enemy", kind: "buff", text: `Dodge ${fmtPct(e.value)}` });
      }
    }
  }

  const seen = new Set();
  return lines.filter((l) => {
    const k = `${l.targetSide}-${l.text}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 5);
}

/** @param {object} game */
export function enqueueCombatFloats(game, lines) {
  if (!game.combatFloats) game.combatFloats = [];
  if (!game.statPulse)
    game.statPulse = {
      player: 0,
      enemy: 0,
      playerKind: "buff",
      enemyKind: "buff",
    };
  let i = 0;
  for (const line of lines) {
    game.combatFloats.push({
      targetSide: line.targetSide,
      kind: line.kind,
      text: line.text,
      age: i * 0.09,
      max: 1.55,
      xOff: Math.random() * 18 - 9,
    });
    const side = line.targetSide === "player" ? "player" : "enemy";
    game.statPulse[side] = Math.min(1, (game.statPulse[side] || 0) + 0.45);
    game.statPulse[`${side}Kind`] = line.kind === "neutral" ? "buff" : line.kind;
    i++;
  }
}

export function tickCombatUi(game, dt) {
  if (!game.combatFloats?.length && !game.statPulse) return;
  if (!game.statPulse)
    game.statPulse = {
      player: 0,
      enemy: 0,
      playerKind: "buff",
      enemyKind: "buff",
    };
  game.statPulse.player = Math.max(0, game.statPulse.player - dt * 1.15);
  game.statPulse.enemy = Math.max(0, game.statPulse.enemy - dt * 1.15);

  if (!game.combatFloats) return;
  for (const f of game.combatFloats) f.age += dt;
  game.combatFloats = game.combatFloats.filter((f) => f.age < f.max);
}

export function resetCombatUi(game) {
  game.combatFloats = [];
  game.statPulse = {
    player: 0,
    enemy: 0,
    playerKind: "buff",
    enemyKind: "buff",
  };
}
