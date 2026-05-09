import { getGun } from "./guns.js";

/**
 * @typedef {Object} Opponent
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} backstory
 * @property {number} maxHp
 * @property {string} gunId
 * @property {number} focus
 * @property {number} prepAggression — 0-1, chance to play another card
 * @property {string} bgKey — render palette
 * @property {string[]} deckTemplate — card ids for prep draws (weighted pool)
 */

/** @type {Opponent[]} */
export const OPPONENTS = [
  {
    id: "blackjack_riley",
    name: "Blackjack Riley",
    title: "The Rolling Bankroll",
    backstory:
      "A fat bearded outlaw who robbed three counties. Slow draw, but he soaks lead like a rain barrel.",
    maxHp: 140,
    gunId: "mare_leg",
    focus: 6,
    prepAggression: 0.35,
    bgKey: "saloon",
    deckTemplate: [
      "gun_heavy_slugger",
      "gun_heavy_slugger",
      "atk_fan_hammer",
      "atk_devils_due",
      "feat_whiskey",
      "atk_sand_chamber",
      "gun_quick_draw",
      "atk_rust_bullet",
    ],
  },
  {
    id: "silent_rose",
    name: "Silent Rose",
    title: "The Widow's Kiss",
    backstory:
      "Black leather, colder eyes. She does not talk in duels — her Schofield does the speaking.",
    maxHp: 95,
    gunId: "schofield",
    focus: 7,
    prepAggression: 0.55,
    bgKey: "night",
    deckTemplate: [
      "gun_oiled_chamber",
      "atk_trick_shot",
      "atk_rattlesnake",
      "feat_steady_hand",
      "gun_quick_draw",
      "atk_rust_bullet",
      "feat_tumbleweed",
      "atk_dead_mans_volley",
    ],
  },
  {
    id: "mad_dog_mcclane",
    name: "Mad Dog McClane",
    title: "Bandolier Lunatic",
    backstory:
      "Skinny, twitchy, too many teeth. Charges the noon sun like it owes him money.",
    maxHp: 105,
    gunId: "peacemaker",
    focus: 8,
    prepAggression: 0.72,
    bgKey: "mine",
    deckTemplate: [
      "gun_bandit_gambit",
      "atk_fan_hammer",
      "feat_adrenaline",
      "gun_quick_draw",
      "atk_trick_shot",
      "gun_heavy_slugger",
      "atk_devils_due",
      "feat_adrenaline",
    ],
  },
  {
    id: "the_sheriff",
    name: "The Sheriff",
    title: "The Last Law in Dry Creek",
    backstory:
      "Forty years behind the same badge. He buried his deputy, two mayors, and a horse he called Brother. Doesn't raise his voice anymore. Doesn't need to.",
    selectFlavor: "I do this slow because I do it once.",
    winFlavor: "Town's a little quieter tonight.",
    maxHp: 120,
    gunId: "peacemaker",
    focus: 7,
    prepAggression: 0.3,
    bgKey: "street",
    deckTemplate: [
      "feat_steady_hand",
      "feat_dead_eye_focus",
      "atk_leg_shot",
      "gun_crosshairs",
      "feat_snipers_breath",
      "atk_trick_shot",
      "feat_steady_aim",
      "atk_rust_bullet",
    ],
  },
];

export function getOpponent(id) {
  return OPPONENTS.find((o) => o.id === id) ?? OPPONENTS[0];
}

export function makeEnemyRuntime(opp) {
  const gun = getGun(opp.gunId);
  return {
    def: opp,
    hp: opp.maxHp,
    maxHp: opp.maxHp,
    focus: opp.focus,
    maxFocus: opp.focus,
    gun: { ...gun },
    drawPile: [],
    discardPile: [],
    hand: [],
  };
}
