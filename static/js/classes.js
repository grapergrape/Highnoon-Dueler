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

/** @type {ClassDef[]} */
export const CLASSES = [
  {
    id: "gunslinger",
    name: "Gunslinger",
    title: "Quick-Draw Specialist",
    abilityName: "Quick Draw",
    abilityBlurb: "+1 bullet in every shootout, no prep needed.",
    portraitTint: "#c4a574",
  },
  {
    id: "sharpshooter",
    name: "Sharpshooter",
    title: "Dead-Eye Marksman",
    abilityName: "Dead-Eye",
    abilityBlurb: "+15% accuracy across all shootouts.",
    portraitTint: "#4a6fa5",
  },
  {
    id: "brawler",
    name: "Brawler",
    title: "Grit & Thunder",
    abilityName: "Thunderstrike",
    abilityBlurb: "+2 base damage in every shootout.",
    portraitTint: "#7a2929",
  },
  {
    id: "drifter",
    name: "Drifter",
    title: "Wandering Survivor",
    abilityName: "Iron Hide",
    abilityBlurb: "+20 max HP from the start of every duel.",
    portraitTint: "#4d6228",
  },
];

/** Lookup a class by its id string. */
export function getClass(id) {
  if (!id) return null;
  return CLASSES.find((c) => c.id === id) ?? null;
}
