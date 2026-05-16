import { STARTER_DECK_IDS } from "../data/deck.js";
import { FALLBACK_GUN_ID, starterGunIdForClass } from "../data/guns.js";
import { getClass, applyClassToRun } from "../data/classes.js";
import { TOWNS } from "../data/opponents.js";

export const LS_KEY = "highnoon_duelist_v2";

export function defaultRun(classId = null) {
  const base = {
    money: 40,
    hp: 100,
    maxHp: 100,
    activeGunId: FALLBACK_GUN_ID,
    deckIds: [...STARTER_DECK_IDS],
    permanent: {},
    classId: null,
    currentTownOrder: 1,
    defeatedOpponentIds: [],
  };
  if (classId) {
    applyClassToRun(base, classId);
    base.activeGunId = starterGunIdForClass(classId);
  }
  return base;
}

export function hasSavedRun() {
  try {
    const j = localStorage.getItem(LS_KEY);
    if (!j) return false;
    const o = JSON.parse(j);
    return !!(o && o.classId);
  } catch {
    return false;
  }
}

export function loadRun() {
  try {
    const j = localStorage.getItem(LS_KEY);
    if (!j) return null;
    const o = JSON.parse(j);
    const validClassId = o.classId && getClass(o.classId) ? o.classId : null;
    const base = validClassId ? defaultRun(validClassId) : defaultRun();
    const currentTownOrder = Number.isFinite(o.currentTownOrder)
      ? Math.min(TOWNS.length, Math.max(1, Math.round(o.currentTownOrder)))
      : base.currentTownOrder;
    const defeatedOpponentIds = Array.isArray(o.defeatedOpponentIds)
      ? [...new Set(o.defeatedOpponentIds.filter((id) => typeof id === "string"))]
      : [];
    const merged = {
      ...base,
      ...o,
      deckIds: o.deckIds?.length ? o.deckIds : base.deckIds,
      activeGunId: o.activeGunId || base.activeGunId,
      permanent: o.permanent && typeof o.permanent === "object" && !Array.isArray(o.permanent) ? o.permanent : {},
      classId: validClassId,
      currentTownOrder,
      defeatedOpponentIds,
    };
    // Sheriff rework compatibility: old saves may still carry removed passive fields.
    if (merged.classId === "sheriff") {
      const perm = merged.permanent;
      if (!Number.isFinite(perm.respect)) perm.respect = 0;
      if (!Number.isFinite(perm.respectMax) || perm.respectMax < 10) perm.respectMax = 10;
      if (!Number.isFinite(perm.respectMaxHpEach) || perm.respectMaxHpEach < 5) perm.respectMaxHpEach = 5;
      if (!Number.isFinite(perm.highHpAccThreshold)) perm.highHpAccThreshold = 100;
      if (!Number.isFinite(perm.highHpAccPerHp)) perm.highHpAccPerHp = 0.03;
      if (!Number.isFinite(perm.highHpAccMax)) perm.highHpAccMax = 0.35;
      delete perm.healPerDuel;
      delete perm.firstCycleAccPenalty;
      delete perm.respectAccPenaltyReduceEach;
    }
    return merged;
  } catch {
    return null;
  }
}

export function saveRun(run) {
  localStorage.setItem(LS_KEY, JSON.stringify(run));
}
