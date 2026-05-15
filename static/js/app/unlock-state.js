import { CLASSES } from "../data/classes.js";
import { getClassShowdownCatalog } from "../data/cards.js";

export const UNLOCKS_LS_KEY = "highnoon_duelist_unlocks_v1";

function classIds() {
  return CLASSES.map((cls) => cls.id);
}

function defaultUnlockedIdsForClass(classId) {
  return getClassShowdownCatalog(classId)
    .filter((card) => card.defaultUnlocked)
    .map((card) => card.id);
}

function defaultUnlockState() {
  const unlockedShowdownIdsByClass = {};
  const clearedBossTownsByClass = {};
  for (const classId of classIds()) {
    unlockedShowdownIdsByClass[classId] = defaultUnlockedIdsForClass(classId);
    clearedBossTownsByClass[classId] = [];
  }
  return { unlockedShowdownIdsByClass, clearedBossTownsByClass };
}

function sortedUniqueTownOrders(rawOrders, allowedTownOrders) {
  if (!Array.isArray(rawOrders)) return [];
  const keep = new Set();
  for (const value of rawOrders) {
    if (!Number.isFinite(value)) continue;
    const townOrder = Math.max(1, Math.round(value));
    if (!allowedTownOrders.has(townOrder)) continue;
    keep.add(townOrder);
  }
  return [...keep].sort((a, b) => a - b);
}

function normalizedUnlockedIdsForClass(classId, rawIds, clearedTownOrders) {
  const catalog = getClassShowdownCatalog(classId);
  const allowedIds = new Set(catalog.map((card) => card.id));
  const unlocked = new Set(defaultUnlockedIdsForClass(classId));
  if (Array.isArray(rawIds)) {
    for (const value of rawIds) {
      if (typeof value !== "string") continue;
      if (!allowedIds.has(value)) continue;
      unlocked.add(value);
    }
  }
  for (const card of catalog) {
    if (Number.isFinite(card.unlockTownOrder) && clearedTownOrders.includes(card.unlockTownOrder)) {
      unlocked.add(card.id);
    }
  }
  return catalog.filter((card) => unlocked.has(card.id)).map((card) => card.id);
}

export function sanitizeUnlockState(rawState) {
  const base = defaultUnlockState();
  const hasShape = rawState && typeof rawState === "object" && !Array.isArray(rawState);
  const unlockedRaw = hasShape && rawState.unlockedShowdownIdsByClass && typeof rawState.unlockedShowdownIdsByClass === "object"
    ? rawState.unlockedShowdownIdsByClass
    : {};
  const clearedRaw = hasShape && rawState.clearedBossTownsByClass && typeof rawState.clearedBossTownsByClass === "object"
    ? rawState.clearedBossTownsByClass
    : {};

  for (const classId of classIds()) {
    const catalog = getClassShowdownCatalog(classId);
    const allowedTownOrders = new Set(
      catalog.map((card) => card.unlockTownOrder).filter((order) => Number.isFinite(order))
    );
    const clearedTownOrders = sortedUniqueTownOrders(clearedRaw[classId], allowedTownOrders);
    base.clearedBossTownsByClass[classId] = clearedTownOrders;
    base.unlockedShowdownIdsByClass[classId] = normalizedUnlockedIdsForClass(
      classId,
      unlockedRaw[classId],
      clearedTownOrders
    );
  }

  return base;
}

export function loadUnlockState() {
  try {
    const json = localStorage.getItem(UNLOCKS_LS_KEY);
    if (!json) return defaultUnlockState();
    return sanitizeUnlockState(JSON.parse(json));
  } catch {
    return defaultUnlockState();
  }
}

export function saveUnlockState(unlockState) {
  localStorage.setItem(UNLOCKS_LS_KEY, JSON.stringify(sanitizeUnlockState(unlockState)));
}

export function getUnlockedShowdownIdsForClass(unlockState, classId) {
  const state = sanitizeUnlockState(unlockState);
  return state.unlockedShowdownIdsByClass[classId] ?? [];
}

export function isShowdownUnlockedForClass(unlockState, classId, showdownId) {
  if (!classId || !showdownId) return false;
  return getUnlockedShowdownIdsForClass(unlockState, classId).includes(showdownId);
}

export function getClassShowdownProgress(unlockState, classId) {
  const catalog = getClassShowdownCatalog(classId);
  if (!catalog.length) {
    return { totalCount: 0, unlockedCount: 0, nextLocked: null };
  }
  const unlockedIds = new Set(getUnlockedShowdownIdsForClass(unlockState, classId));
  let unlockedCount = 0;
  for (const card of catalog) if (unlockedIds.has(card.id)) unlockedCount += 1;
  const nextLocked = catalog.find((card) => !unlockedIds.has(card.id)) ?? null;
  return { totalCount: catalog.length, unlockedCount, nextLocked };
}

export function unlockShowdownsForBossClear(unlockState, classId, townOrder) {
  const state = sanitizeUnlockState(unlockState);
  if (!classId || !Number.isFinite(townOrder) || !state.clearedBossTownsByClass[classId]) {
    return { unlockState: state, newlyUnlocked: [], changed: false };
  }

  const roundedTownOrder = Math.max(1, Math.round(townOrder));
  const catalog = getClassShowdownCatalog(classId);
  const unlockable = catalog.filter((card) => card.unlockTownOrder === roundedTownOrder);
  if (!unlockable.length) {
    return { unlockState: state, newlyUnlocked: [], changed: false };
  }

  const cleared = [...(state.clearedBossTownsByClass[classId] ?? [])];
  if (cleared.includes(roundedTownOrder)) {
    return { unlockState: state, newlyUnlocked: [], changed: false };
  }
  cleared.push(roundedTownOrder);
  cleared.sort((a, b) => a - b);
  state.clearedBossTownsByClass[classId] = cleared;

  const unlockedIds = new Set(state.unlockedShowdownIdsByClass[classId] ?? []);
  const newlyUnlocked = [];
  for (const card of unlockable) {
    if (unlockedIds.has(card.id)) continue;
    unlockedIds.add(card.id);
    newlyUnlocked.push(card);
  }
  state.unlockedShowdownIdsByClass[classId] = catalog
    .filter((card) => unlockedIds.has(card.id))
    .map((card) => card.id);

  return { unlockState: state, newlyUnlocked, changed: true };
}
