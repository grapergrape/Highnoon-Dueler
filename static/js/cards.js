/** @typedef {'gun'|'attack'|'character'|'feat'} CardType */

/**
 * Effect keys applied at play time or tagged for shootout resolution.
 * @typedef {Object} CardDef
 * @property {string} id
 * @property {string} name
 * @property {CardType} type
 * @property {number} cost
 * @property {string[]} [effects] — simple DSL: "bullets+2", "accShootout+0.15", etc.
 */

/** @type {CardDef[]} */
export const CARD_DEFINITIONS = [
  {
    id: "gun_quick_draw",
    name: "Quick Draw Revolver",
    type: "gun",
    cost: 2,
    effects: ["bullets+2", "accShootout+0.15"],
  },
  {
    id: "gun_heavy_slugger",
    name: "Heavy Slugger",
    type: "gun",
    cost: 2,
    effects: ["damage+3", "accShootout-0.1"],
  },
  {
    id: "gun_oiled_chamber",
    name: "Oiled Chamber",
    type: "gun",
    cost: 3,
    effects: ["accShootout+0.25", "pierce"],
  },
  {
    id: "gun_bandit_gambit",
    name: "Bandit's Gambit",
    type: "gun",
    cost: 1,
    effects: ["bullets+4", "hpAfterShootout-8"],
  },
  {
    id: "atk_rust_bullet",
    name: "Rust Bullet",
    type: "attack",
    cost: 2,
    effects: ["enemyAccNext-0.25"],
  },
  {
    id: "atk_trick_shot",
    name: "Trick Shot",
    type: "attack",
    cost: 2,
    effects: ["bullets+1", "ricochet"],
  },
  {
    id: "atk_sand_chamber",
    name: "Sand in the Chamber",
    type: "attack",
    cost: 3,
    effects: ["enemyBullets-2"],
  },
  {
    id: "atk_fan_hammer",
    name: "Fan the Hammer",
    type: "attack",
    cost: 2,
    effects: ["bullets+2", "accShootout-0.2"],
  },
  {
    id: "atk_dead_mans_volley",
    name: "Dead Man's Volley",
    type: "attack",
    cost: 4,
    effects: ["returnBulletOnHit+1"],
  },
  {
    id: "char_iron_gut",
    name: "Iron Gut",
    type: "character",
    cost: 0,
    effects: ["maxHp+25", "healPerDuel+8"],
  },
  {
    id: "char_lightning",
    name: "Lightning Reflexes",
    type: "character",
    cost: 0,
    effects: ["accGlobal+0.12", "staminaPerRound+1"],
  },
  {
    id: "char_deadeye",
    name: "Deadeye",
    type: "character",
    cost: 0,
    effects: ["deadeye"],
  },
  {
    id: "char_thick_hide",
    name: "Thick Hide",
    type: "character",
    cost: 0,
    effects: ["damageTaken-1"],
  },
  {
    id: "feat_adrenaline",
    name: "Adrenaline Rush",
    type: "feat",
    cost: 2,
    effects: ["accShootout+0.3", "damageShootout+0.2", "hpAfterCycle-10"],
  },
  {
    id: "feat_steady_hand",
    name: "Steady Hand",
    type: "feat",
    cost: 3,
    effects: ["accShootout+0.35", "firstHitsAuto+3"],
  },
  {
    id: "feat_whiskey",
    name: "Whiskey Courage",
    type: "feat",
    cost: 2,
    effects: ["staminaCycle+40", "healNow+15"],
  },
  {
    id: "feat_tumbleweed",
    name: "Tumbleweed Dodge",
    type: "feat",
    cost: 2,
    effects: ["dodgeRecv+0.25"],
  },
  {
    id: "atk_devils_due",
    name: "Devil's Due",
    type: "attack",
    cost: 2,
    effects: ["damage+2", "enemyAccNext-0.1"],
  },
  {
    id: "atk_rattlesnake",
    name: "Rattlesnake Reflexes",
    type: "attack",
    cost: 1,
    effects: ["accShootout+0.1", "bullets+1"],
  },
];

const byId = new Map(CARD_DEFINITIONS.map((c) => [c.id, c]));

export function getCardDef(id) {
  return byId.get(id);
}

export function cloneCardInstance(id) {
  const d = getCardDef(id);
  if (!d) return null;
  return { ...d, uid: `${id}_${Math.random().toString(36).slice(2, 9)}` };
}

export function parseEffect(token) {
  const m = token.match(/^([a-zA-Z_]+)([+-]\d+(?:\.\d+)?)?$/);
  if (!m) return { kind: token, value: true };
  const kind = m[1];
  const raw = m[2];
  if (raw == null || raw === "") return { kind, value: true };
  const value = raw.includes(".") ? parseFloat(raw) : parseInt(raw, 10);
  return { kind, value };
}
