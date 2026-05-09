/** @typedef {'outlaw'|'marshal'|'bounty_hunter'} ClassId */

/**
 * @typedef {Object} PlayerClass
 * @property {ClassId} id
 * @property {string} name
 * @property {string} tagline
 * @property {string} backstory
 * @property {string} ability
 * @property {string} [selectFlavor]
 * @property {string} [winFlavor]
 * @property {string[]} starterDeck
 * @property {number} bonusMoney
 */

/** @type {PlayerClass[]} */
export const PLAYER_CLASSES = [
  {
    id: "outlaw",
    name: "Outlaw",
    tagline: "Fast draw, faster temper.",
    backstory:
      "No law. No loyalty. You ride alone and answer to nobody. Your bullet speaks louder than any judge.",
    ability: "Renegade: Start each run with an extra $10 bounty.",
    starterDeck: [
      "atk_rattlesnake",
      "atk_rattlesnake",
      "atk_devils_due",
      "atk_rust_bullet",
      "atk_fan_hammer",
      "gun_quick_draw",
      "gun_quick_draw",
      "feat_whiskey",
      "feat_tumbleweed",
      "atk_trick_shot",
      "atk_sand_chamber",
      "char_thick_hide",
    ],
    bonusMoney: 10,
  },
  {
    id: "marshal",
    name: "U.S. Marshal",
    tagline: "The law has a long arm — and a longer rifle.",
    backstory:
      "You carry a federal badge and a federal grudge. Every outlaw in this territory has a price on their head. You paint your targets, then you collect.",
    ability:
      "Marked Man: Stack marks on the enemy across prep rounds. Unleash Marked Execution for massive burst damage — 6 extra damage per mark stacked.",
    starterDeck: [
      "atk_dead_to_rights",
      "atk_dead_to_rights",
      "atk_target_locked",
      "atk_marked_execution",
      "atk_suppressing_fire",
      "feat_war_cry",
      "gun_crosshairs",
      "gun_crosshairs",
      "gun_quick_draw",
      "atk_devils_due",
      "char_bounty_hunter",
      "feat_dead_eye_focus",
    ],
    bonusMoney: 0,
  },
  {
    id: "bounty_hunter",
    name: "Bounty Hunter",
    tagline: "Punctual. Precise. Always paid in full.",
    backstory:
      "Starched collar, polished boots — a gentleman abroad in a country that deserves neither. He quotes Shakespeare over the bodies, requests single malt, and keeps his appointments. He does not miss. Twice would be discourteous.",
    ability:
      "English Bob: Earn +25% bounty on every kill; gain +10% accuracy on Focused cycles.",
    selectFlavor: "A gentleman keeps his appointments.",
    winFlavor: "Civilization, Mr. Beauchamp. Civilization.",
    starterDeck: [
      "atk_focused_volley",
      "atk_focused_volley",
      "atk_iron_nerve",
      "atk_dead_to_rights",
      "gun_long_barrel",
      "gun_long_barrel",
      "gun_crosshairs",
      "feat_dead_eye_focus",
      "feat_steady_aim",
      "char_hawk_eye",
      "std_dead_eye",
      "feat_snipers_breath",
    ],
    bonusMoney: 0,
  },
];

export function getClass(id) {
  return PLAYER_CLASSES.find((c) => c.id === id) ?? PLAYER_CLASSES[0];
}
