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
 * @property {string} backstory        — short lore blurb shown on the class tile (≤ 280 chars)
 * @property {string} [selectFlavor]   — one-liner shown when the class is picked
 * @property {string} [winFlavor]      — one-liner shown briefly on shop transition after a win
 * @property {string} abilityName
 * @property {string} abilityBlurb
 * @property {string} portraitTint     — hex colour used to tint the HUD chip border
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
  {
    id: "outlaw",
    name: "Outlaw",
    title: "Wanted Dead",
    backstory:
      "Robbed every coach from El Paso to Cheyenne and slept under stars he couldn't name. The price on his head is what he is worth — and that price climbs with every man he buries. He doesn't fear the rope. He fears being forgotten.",
    selectFlavor: "The rope is patient. So am I.",
    winFlavor: "Another notch on the grip.",
    abilityName: "Blood Money",
    abilityBlurb: "Earn $5 extra bounty from every duel won.",
    portraitTint: "#5c3d11",
  },
  {
    id: "marshal",
    name: "U.S. Marshal",
    title: "Federal Iron",
    backstory:
      "Rides under federal warrant across three territories. Knows the trains, the schedules, and which judges accept silver. The badge authorizes lethal force in any jurisdiction — and he documents each use promptly. Forms filed. Body counted. Moving on.",
    selectFlavor: "By the authority vested. Same authority that buries you.",
    winFlavor: "Paperwork in triplicate.",
    abilityName: "Federal Warrant",
    abilityBlurb: "+5% acc, +1 focus/round. +1 extra mark whenever you mark.",
    portraitTint: "#3a5b8e",
  },
];

/** Lookup a class by its id string. */
export function getClass(id) {
  if (!id) return null;
  return CLASSES.find((c) => c.id === id) ?? null;
}
