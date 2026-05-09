/**
 * Player class definitions — loaded once, queried by getClass().
 *
 * Each class grants a passive ability that is always visible in the HUD
 * chip and on the Wanted Board after the player picks a class.
 */

/**
 * @typedef {Object} ClassDef
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} abilityName
 * @property {string} abilityBlurb
 * @property {string} portraitTint  — hex colour used to tint the HUD chip border
 */

/**
 * @typedef {Object} ClassDef
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} abilityName
 * @property {string} abilityBlurb
 * @property {string} portraitTint
 * @property {string} starterGunId  — gun the player equips at run start
 * @property {string[]} starterDeckIds  — 12-card starter deck for this class
 * @property {Object} passives  — permanent bonuses added to run.permanent on class pick
 */

/** @type {ClassDef[]} */
export const CLASSES = [
  {
    id: "gunslinger",
    name: "Gunslinger",
    title: "Quick-Draw Specialist",
    abilityName: "Quick Draw",
    abilityBlurb: "+1 bullet in every shootout, no prep needed.",
    portraitTint: "#c4a574",
    starterGunId: "peacemaker",
    starterDeckIds: [],
    passives: {},
  },
  {
    id: "sharpshooter",
    name: "Sharpshooter",
    title: "Dead-Eye Marksman",
    abilityName: "Dead-Eye",
    abilityBlurb: "+15% accuracy across all shootouts.",
    portraitTint: "#4a6fa5",
    starterGunId: "peacemaker",
    starterDeckIds: [],
    passives: {},
  },
  {
    id: "brawler",
    name: "Brawler",
    title: "Grit & Thunder",
    abilityName: "Thunderstrike",
    abilityBlurb: "+2 base damage in every shootout.",
    portraitTint: "#7a2929",
    starterGunId: "peacemaker",
    starterDeckIds: [],
    passives: {},
  },
  {
    id: "drifter",
    name: "Drifter",
    title: "Wandering Survivor",
    abilityName: "Iron Hide",
    abilityBlurb: "+20 max HP from the start of every duel.",
    portraitTint: "#4d6228",
    starterGunId: "peacemaker",
    starterDeckIds: [],
    passives: {},
  },
  {
    id: "vaquero",
    name: "Vaquero",
    title: "Desert Survival Specialist",
    abilityName: "Rodeo Blood",
    abilityBlurb: "Heal 10 HP at duel start. Deal +30% damage from cycle 3 onward.",
    portraitTint: "#c87941",
    starterGunId: "peacemaker",
    starterDeckIds: [
      "gun_twin_irons",
      "gun_twin_irons",
      "feat_whiskey",
      "feat_whiskey",
      "feat_adrenaline",
      "atk_fan_hammer",
      "atk_rattlesnake",
      "atk_devils_due",
      "char_desert_grit",
      "feat_blood_pact",
      "atk_dead_mans_volley",
      "atk_showboat",
    ],
    passives: {
      healPerDuel: 10,
      lateCycleDmgBonus: 0.3,
    },
  },
];

/** Lookup a class by its id string. */
export function getClass(id) {
  if (!id) return null;
  return CLASSES.find((c) => c.id === id) ?? null;
}
