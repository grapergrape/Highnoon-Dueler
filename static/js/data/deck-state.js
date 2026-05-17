function makeDeckUid(id) {
  return `${id}_${Math.random().toString(36).slice(2, 10)}`;
}

export function makeDeckCard(id, opts = {}) {
  return {
    id,
    uid: opts.uid || opts.deckUid || makeDeckUid(id),
    upgradeId: opts.upgradeId ?? null,
  };
}

export function normalizeDeck(run) {
  if (!run) return [];
  const rawCards = Array.isArray(run.deckCards) && run.deckCards.length
    ? run.deckCards
    : (Array.isArray(run.deckIds) ? run.deckIds : []);
  run.deckCards = rawCards
    .map((entry) => {
      if (typeof entry === "string") return makeDeckCard(entry);
      if (!entry || typeof entry.id !== "string") return null;
      return makeDeckCard(entry.id, {
        uid: entry.uid,
        upgradeId: entry.upgradeId ?? null,
      });
    })
    .filter(Boolean);
  syncDeckIds(run);
  return run.deckCards;
}

export function syncDeckIds(run) {
  if (!run) return [];
  if (!Array.isArray(run.deckCards)) run.deckCards = [];
  run.deckIds = run.deckCards.map((card) => card.id);
  return run.deckIds;
}

export function deckCards(run) {
  return normalizeDeck(run);
}

export function deckIds(run) {
  normalizeDeck(run);
  return run.deckIds;
}

export function addDeckCard(run, id, opts = {}) {
  const cards = normalizeDeck(run);
  const card = makeDeckCard(id, opts);
  cards.push(card);
  syncDeckIds(run);
  return card;
}

export function removeDeckCardAt(run, index) {
  const cards = normalizeDeck(run);
  if (index < 0 || index >= cards.length) return null;
  const [removed] = cards.splice(index, 1);
  syncDeckIds(run);
  return removed ?? null;
}

export function removeFirstDeckCardById(run, id) {
  const cards = normalizeDeck(run);
  const index = cards.findIndex((card) => card.id === id);
  return removeDeckCardAt(run, index);
}

export function replaceDeckCardAt(run, index, id, opts = {}) {
  const cards = normalizeDeck(run);
  if (index < 0 || index >= cards.length) return false;
  cards.splice(index, 1, makeDeckCard(id, opts));
  syncDeckIds(run);
  return true;
}

export function replaceFirstDeckCardById(run, oldId, newId, opts = {}) {
  const cards = normalizeDeck(run);
  const index = cards.findIndex((card) => card.id === oldId);
  return replaceDeckCardAt(run, index, newId, opts);
}

export function countDeckCards(run, predicate) {
  return normalizeDeck(run).filter(predicate).length;
}

export function deckCardEntries(run, predicate = null) {
  const cards = normalizeDeck(run);
  return predicate ? cards.filter(predicate) : [...cards];
}

export function findDeckCardByUid(run, uid) {
  return normalizeDeck(run).find((card) => card.uid === uid) ?? null;
}

export function upgradeDeckCard(run, uid, upgradeId) {
  const card = findDeckCardByUid(run, uid);
  if (!card || card.upgradeId) return false;
  card.upgradeId = upgradeId;
  syncDeckIds(run);
  return true;
}

export function deckHasCardId(run, id) {
  return normalizeDeck(run).some((card) => card.id === id);
}

export function deckCardIdsSet(run) {
  return new Set(deckIds(run));
}
