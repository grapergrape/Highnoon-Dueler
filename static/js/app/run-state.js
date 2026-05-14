import { STARTER_DECK_IDS } from "../data/deck.js";
import { FALLBACK_GUN_ID, starterGunIdForClass } from "../data/guns.js";
import { getClass, applyClassToRun } from "../data/classes.js";

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
    return {
      ...base,
      ...o,
      deckIds: o.deckIds?.length ? o.deckIds : base.deckIds,
      activeGunId: o.activeGunId || base.activeGunId,
      permanent: o.permanent && typeof o.permanent === "object" && !Array.isArray(o.permanent) ? o.permanent : {},
      classId: validClassId,
    };
  } catch {
    return null;
  }
}

export function saveRun(run) {
  localStorage.setItem(LS_KEY, JSON.stringify(run));
}
