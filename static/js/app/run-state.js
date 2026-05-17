import { STARTER_DECK_IDS } from "../data/deck.js";
import { normalizeDeck } from "../data/deck-state.js";
import { FALLBACK_GUN_ID, starterGunIdForClass } from "../data/guns.js";
import { normalizeEquipment } from "../data/items.js";
import { getClass, applyClassToRun } from "../data/classes.js";
import { TOWNS } from "../data/opponents.js";

export const LS_KEY = "highnoon_duelist_v3";

export function defaultRun(classId = null) {
  const base = {
    money: 40,
    hp: 100,
    maxHp: 100,
    activeGunId: FALLBACK_GUN_ID,
    deckIds: [...STARTER_DECK_IDS],
    deckCards: [],
    permanent: {},
    classId: null,
    currentTownOrder: 1,
    defeatedOpponentIds: [],
    activeDeeds: [],
    activeDeedTownOrder: 1,
    completedDeedIds: [],
    deedHistory: [],
    signaturePoints: 0,
    equipment: {
      gear: {
        hat: null,
        belt: null,
        boots: null,
        strap: null,
        coat: null,
      },
      trinkets: [],
    },
    merchantVisits: 0,
  };
  normalizeDeck(base);
  normalizeEquipment(base);
  if (classId) {
    applyClassToRun(base, classId);
    base.activeGunId = starterGunIdForClass(classId);
    normalizeDeck(base);
    normalizeEquipment(base);
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
      deckCards: Array.isArray(o.deckCards) && o.deckCards.length ? o.deckCards : null,
      activeGunId: base.activeGunId,
      permanent: o.permanent && typeof o.permanent === "object" && !Array.isArray(o.permanent) ? o.permanent : {},
      classId: validClassId,
      currentTownOrder,
      defeatedOpponentIds,
      activeDeeds: Array.isArray(o.activeDeeds) ? o.activeDeeds : [],
      activeDeedTownOrder: Number.isFinite(o.activeDeedTownOrder) ? o.activeDeedTownOrder : currentTownOrder,
      completedDeedIds: Array.isArray(o.completedDeedIds) ? o.completedDeedIds : [],
      deedHistory: Array.isArray(o.deedHistory) ? o.deedHistory : [],
      signaturePoints: Number.isFinite(o.signaturePoints) ? Math.max(0, Math.round(o.signaturePoints)) : 0,
      equipment: o.equipment && typeof o.equipment === "object" && !Array.isArray(o.equipment) ? o.equipment : base.equipment,
      merchantVisits: Number.isFinite(o.merchantVisits) ? Math.max(0, Math.round(o.merchantVisits)) : 0,
    };
    normalizeDeck(merged);
    normalizeEquipment(merged);
    // Sheriff rework compatibility: old saves may still carry removed passive fields.
    if (merged.classId === "sheriff") {
      const perm = merged.permanent;
      if (!Number.isFinite(perm.respect)) perm.respect = 0;
      if (!Number.isFinite(perm.respectMax) || perm.respectMax < 10) perm.respectMax = 10;
      if (!Number.isFinite(perm.respectMaxHpEach) || perm.respectMaxHpEach > 2) perm.respectMaxHpEach = 2;
      delete perm.highHpAccThreshold;
      delete perm.highHpAccPerHp;
      delete perm.highHpAccMax;
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
