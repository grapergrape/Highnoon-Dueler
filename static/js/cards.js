/** @typedef {'gun'|'attack'|'character'|'feat'} CardType */
/** @typedef {'common'|'uncommon'|'rare'|'legendary'} CardRarity */

/**
 * @typedef {Object} CardDef
 * @property {string} id
 * @property {string} name
 * @property {CardType} type
 * @property {CardRarity} rarity
 * @property {number} cost
 * @property {string[]} [effects]
 */

/** @type {CardDef[]} */
export const CARD_DEFINITIONS = [
  // ── GUN CARDS ──────────────────────────────────────────────────────────────
  {
    id: "gun_quick_draw",
    name: "Quick Draw Revolver",
    type: "gun",
    rarity: "common",
    cost: 2,
    effects: ["bullets+2", "accShootout+0.15"],
  },
  {
    id: "gun_heavy_slugger",
    name: "Heavy Slugger",
    type: "gun",
    rarity: "common",
    cost: 2,
    effects: ["damage+3", "accShootout-0.1"],
  },
  {
    id: "gun_oiled_chamber",
    name: "Oiled Chamber",
    type: "gun",
    rarity: "uncommon",
    cost: 3,
    effects: ["accShootout+0.25", "pierce"],
  },
  {
    id: "gun_bandit_gambit",
    name: "Bandit's Gambit",
    type: "gun",
    rarity: "uncommon",
    cost: 2,
    effects: ["bullets+4", "hpAfterShootout-8"],
  },
  {
    id: "gun_desperado",
    name: "Desperado's Pistol",
    type: "gun",
    rarity: "common",
    cost: 1,
    effects: ["bullets+1", "accShootout+0.05"],
  },
  {
    id: "gun_iron_maiden",
    name: "Iron Maiden",
    type: "gun",
    rarity: "uncommon",
    cost: 2,
    effects: ["damage+2", "accShootout+0.1"],
  },
  {
    id: "gun_snake_eye",
    name: "Snake Eye Special",
    type: "gun",
    rarity: "uncommon",
    cost: 3,
    effects: ["bullets+3", "accGlobal-0.05"],
  },
  {
    id: "gun_twin_irons",
    name: "Twin Irons",
    type: "gun",
    rarity: "rare",
    cost: 3,
    effects: ["bullets+5", "accShootout-0.15"],
  },
  {
    id: "gun_silver_tongue",
    name: "Silver Tongue Derringer",
    type: "gun",
    rarity: "rare",
    cost: 2,
    effects: ["pierce", "accShootout+0.2"],
  },
  {
    id: "gun_rangers_repeat",
    name: "Ranger's Repeater",
    type: "gun",
    rarity: "uncommon",
    cost: 2,
    effects: ["bullets+2", "hpAfterShootout-8"],
  },
  {
    id: "gun_widowmaker",
    name: "Widowmaker",
    type: "gun",
    rarity: "legendary",
    cost: 4,
    effects: ["bullets+3", "damage+4", "accShootout+0.2"],
  },
  {
    id: "gun_devils_hand",
    name: "Devil's Hand Cannon",
    type: "gun",
    rarity: "legendary",
    cost: 3,
    effects: ["damage+6", "hpAfterShootout-15"],
  },
  // ── NEW GUN CARDS ─────────────────────────────────────────────────────────
  {
    id: "gun_crosshairs",
    name: "Crosshairs",
    type: "gun",
    rarity: "uncommon",
    cost: 2,
    effects: ["bullets+1", "markEnemy+1"],
  },
  {
    id: "gun_bone_saw",
    name: "Bone Saw",
    type: "gun",
    rarity: "rare",
    cost: 3,
    effects: ["damage+4", "markEnemy+2"],
  },
  {
    id: "gun_volcanic_six",
    name: "Volcanic Six-Shooter",
    type: "gun",
    rarity: "common",
    cost: 2,
    effects: ["bullets+3", "damage-2"],
  },
  {
    id: "gun_hair_trigger",
    name: "Hair Trigger",
    type: "gun",
    rarity: "uncommon",
    cost: 2,
    effects: ["firstHitsAuto+2", "accShootout-0.1"],
  },
  {
    id: "gun_long_barrel",
    name: "Long Barrel",
    type: "gun",
    rarity: "rare",
    cost: 3,
    effects: ["accShootout+0.3", "damage+2", "bullets-1"],
  },
  {
    id: "gun_sawn_off",
    name: "Sawn-Off",
    type: "gun",
    rarity: "common",
    cost: 1,
    effects: ["bullets+2", "accShootout-0.2", "damage+2"],
  },

  // ── ATTACK CARDS ───────────────────────────────────────────────────────────
  {
    id: "atk_rust_bullet",
    name: "Rust Bullet",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["enemyAccNext-0.25"],
  },
  {
    id: "atk_trick_shot",
    name: "Trick Shot",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["bullets+1", "ricochet"],
  },
  {
    id: "atk_sand_chamber",
    name: "Sand in the Chamber",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["enemyBullets-2"],
  },
  {
    id: "atk_fan_hammer",
    name: "Fan the Hammer",
    type: "attack",
    rarity: "common",
    cost: 2,
    effects: ["bullets+2", "accShootout-0.2"],
  },
  {
    id: "atk_dead_mans_volley",
    name: "Dead Man's Volley",
    type: "attack",
    rarity: "rare",
    cost: 4,
    effects: ["returnBulletOnHit+1"],
  },
  {
    id: "atk_devils_due",
    name: "Devil's Due",
    type: "attack",
    rarity: "common",
    cost: 2,
    effects: ["damage+2", "enemyAccNext-0.1"],
  },
  {
    id: "atk_rattlesnake",
    name: "Rattlesnake Reflexes",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["accShootout+0.1", "bullets+1"],
  },
  {
    id: "atk_dust_throw",
    name: "Dust in the Eyes",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["enemyAccNext-0.15"],
  },
  {
    id: "atk_leg_shot",
    name: "Leg Shot",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["enemyBullets-1"],
  },
  {
    id: "atk_showboat",
    name: "Showboat",
    type: "attack",
    rarity: "common",
    cost: 2,
    effects: ["bullets+2", "hpAfterShootout-5"],
  },
  {
    id: "atk_snakebite",
    name: "Snakebite",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["enemyAccNext-0.2", "damage+1"],
  },
  {
    id: "atk_hail_mary",
    name: "Hail Mary",
    type: "attack",
    rarity: "uncommon",
    cost: 3,
    effects: ["bullets+4", "accShootout-0.3"],
  },
  {
    id: "atk_disarm",
    name: "Disarm",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["enemyBullets-3"],
  },
  {
    id: "atk_executioner",
    name: "Executioner's Shot",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["damage+5", "accShootout-0.2"],
  },
  {
    id: "atk_hangmans_noose",
    name: "Hangman's Noose",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["enemyBullets-4", "enemyAccNext-0.2"],
  },
  {
    id: "atk_phantom_round",
    name: "Phantom Round",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["accShootout+0.4", "bullets+1"],
  },
  {
    id: "atk_undertakers_deal",
    name: "Undertaker's Deal",
    type: "attack",
    rarity: "legendary",
    cost: 4,
    effects: ["returnBulletOnHit+2", "pierce", "damage+2"],
  },
  // ── NEW ATTACK CARDS ──────────────────────────────────────────────────────
  {
    id: "atk_dead_to_rights",
    name: "Dead to Rights",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["markEnemy+2"],
  },
  {
    id: "atk_target_locked",
    name: "Target Locked",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["markEnemy+3", "enemyAccNext-0.1"],
  },
  {
    id: "atk_marked_execution",
    name: "Marked Execution",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["markBurst+6"],
  },
  {
    id: "atk_iron_nerve",
    name: "Iron Nerve",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["gainFocused"],
  },
  {
    id: "atk_focused_volley",
    name: "Focused Volley",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["focusBonusBullets+3", "bullets+1"],
  },
  {
    id: "atk_cold_blood",
    name: "Cold Blood",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["gainFocused", "enemyAccNext-0.15"],
  },
  {
    id: "atk_suppressing_fire",
    name: "Suppressing Fire",
    type: "attack",
    rarity: "common",
    cost: 2,
    effects: ["enemyBullets-2", "markEnemy+1"],
  },
  {
    id: "atk_apex_predator",
    name: "Apex Predator",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["focusBonusBullets+4", "focusBonusAcc+0.2", "markEnemy+1"],
  },

  // ── CHARACTER CARDS (permanent, cost 0) ────────────────────────────────────
  {
    id: "char_iron_gut",
    name: "Iron Gut",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["maxHp+25", "healPerDuel+8"],
  },
  {
    id: "char_lightning",
    name: "Lightning Reflexes",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["accGlobal+0.12", "focusPerRound+1"],
  },
  {
    id: "char_deadeye",
    name: "Deadeye",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["deadeye"],
  },
  {
    id: "char_thick_hide",
    name: "Thick Hide",
    type: "character",
    rarity: "common",
    cost: 0,
    effects: ["damageTaken-1"],
  },
  {
    id: "char_vulture",
    name: "Vulture's Eye",
    type: "character",
    rarity: "common",
    cost: 0,
    effects: ["accGlobal+0.05"],
  },
  {
    id: "char_iron_will",
    name: "Iron Will",
    type: "character",
    rarity: "common",
    cost: 0,
    effects: ["maxHp+10"],
  },
  {
    id: "char_quick_hands",
    name: "Quick Hands",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["focusPerRound+2"],
  },
  {
    id: "char_gravedigger",
    name: "Gravedigger's Calm",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["damageTaken-2"],
  },
  {
    id: "char_bounty_hunter",
    name: "Bounty Hunter",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["healPerDuel+15", "maxHp+10"],
  },
  {
    id: "char_desperado",
    name: "Desperado",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["accGlobal+0.2", "maxHp-20"],
  },
  {
    id: "char_legend",
    name: "Living Legend",
    type: "character",
    rarity: "legendary",
    cost: 0,
    effects: ["accGlobal+0.15", "maxHp+30", "focusPerRound+1"],
  },
  // ── NEW CHARACTER CARDS ───────────────────────────────────────────────────────
  {
    id: "char_desert_grit",
    name: "Desert Grit",
    type: "character",
    rarity: "common",
    cost: 0,
    effects: ["maxHp+15", "damageTaken-1"],
  },
  {
    id: "char_preacher",
    name: "Preacher's Calm",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["focusPerRound+2", "healPerDuel+6"],
  },
  {
    id: "char_hawk_eye",
    name: "Hawk Eye",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["accGlobal+0.18", "focusPerRound+1"],
  },
  {
    id: "char_war_veteran",
    name: "War Veteran",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["damageTaken-3", "maxHp+10"],
  },
  {
    id: "char_ghost_rider",
    name: "Ghost Rider",
    type: "character",
    rarity: "legendary",
    cost: 0,
    effects: ["accGlobal+0.1", "focusPerRound+3", "healPerDuel+10"],
  },

  // ── FEAT CARDS ─────────────────────────────────────────────────────────────
  {
    id: "feat_adrenaline",
    name: "Adrenaline Rush",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["accShootout+0.3", "damageShootout+0.2", "hpAfterCycle-10"],
  },
  {
    id: "feat_steady_hand",
    name: "Steady Hand",
    type: "feat",
    rarity: "rare",
    cost: 3,
    effects: ["accShootout+0.35", "firstHitsAuto+3"],
  },
  {
    id: "feat_whiskey",
    name: "Whiskey Courage",
    type: "feat",
    rarity: "common",
    cost: 2,
    effects: ["focusCycle+10", "healNow+15"],
  },
  {
    id: "feat_tumbleweed",
    name: "Tumbleweed Dodge",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["dodgeRecv+0.25"],
  },
  {
    id: "feat_quick_reload",
    name: "Quick Reload",
    type: "feat",
    rarity: "common",
    cost: 1,
    effects: ["focusCycle+7"],
  },
  {
    id: "feat_steady_aim",
    name: "Steady Aim",
    type: "feat",
    rarity: "common",
    cost: 1,
    effects: ["accShootout+0.15"],
  },
  {
    id: "feat_battle_cry",
    name: "Battle Cry",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["damageShootout+0.3", "accShootout+0.1"],
  },
  {
    id: "feat_dead_eye_focus",
    name: "Dead Eye Focus",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["firstHitsAuto+2", "accShootout+0.1"],
  },
  {
    id: "feat_last_stand",
    name: "Last Stand",
    type: "feat",
    rarity: "rare",
    cost: 2,
    effects: ["damageShootout+0.5", "accShootout+0.4", "hpAfterCycle-20"],
  },
  {
    id: "feat_blood_pact",
    name: "Blood Pact",
    type: "feat",
    rarity: "rare",
    cost: 3,
    effects: ["dodgeRecv+0.4", "healNow+20"],
  },
  {
    id: "feat_outlaws_fury",
    name: "Outlaw's Fury",
    type: "feat",
    rarity: "legendary",
    cost: 4,
    effects: ["bullets+3", "accShootout+0.5", "damageShootout+0.4"],
  },
  // ── NEW FEAT CARDS ────────────────────────────────────────────────────────
  {
    id: "feat_war_cry",
    name: "War Cry",
    type: "feat",
    rarity: "common",
    cost: 1,
    effects: ["markEnemy+2", "accShootout+0.1"],
  },
  {
    id: "feat_snipers_breath",
    name: "Sniper's Breath",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["gainFocused", "accShootout+0.2"],
  },
  {
    id: "feat_burning_powder",
    name: "Burning Powder",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["damageShootout+0.3", "markEnemy+1"],
  },
  {
    id: "feat_second_wind",
    name: "Second Wind",
    type: "feat",
    rarity: "rare",
    cost: 2,
    effects: ["healNow+25", "gainFocused"],
  },
  {
    id: "feat_death_wish",
    name: "Death Wish",
    type: "feat",
    rarity: "legendary",
    cost: 3,
    effects: ["bullets+5", "accShootout+0.6", "hpAfterCycle-30"],
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

/** Returns all cards matching the given rarity. */
export function getCardsByRarity(rarity) {
  return CARD_DEFINITIONS.filter((c) => c.rarity === rarity);
}

/** Returns all cards of the given type. */
export function getCardsByType(type) {
  return CARD_DEFINITIONS.filter((c) => c.type === type);
}
