/**
 * Player-selectable classes.
 *
 * @typedef {Object} PlayerClass
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} backstory   — max 280 chars; shown in class-select tile
 * @property {string} selectFlavor — shown when the player highlights this class
 * @property {string} winFlavor   — shown on the duel win screen
 */

/** @type {PlayerClass[]} */
export const PLAYER_CLASSES = [
  {
    id: "apache_tracker",
    name: "Apache Tracker",
    title: "Reads the Wind",
    backstory:
      "Trained by elders who knew the land before the railroad split it. He shoots when the wind agrees, and the wind agrees more often than the bluecoats would like. Carries a single feather in his hatband — earned, not taken.",
    selectFlavor: "Patience is its own kind of weapon.",
    winFlavor: "The land tells me where they fall.",
  },
];

export function getPlayerClass(id) {
  return PLAYER_CLASSES.find((c) => c.id === id) ?? PLAYER_CLASSES[0];
}
