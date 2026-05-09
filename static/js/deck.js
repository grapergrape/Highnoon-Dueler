import { cloneCardInstance, getCardDef } from "./cards.js";

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDeckFromIds(ids) {
  const instances = [];
  for (const id of ids) {
    if (getCardDef(id)) instances.push(cloneCardInstance(id));
  }
  return shuffle(instances);
}

export function drawCards(pile, discard, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    if (pile.length === 0) {
      if (discard.length === 0) break;
      pile.push(...shuffle(discard.splice(0, discard.length)));
    }
    if (pile.length === 0) break;
    out.push(pile.pop());
  }
  return out;
}

export function discardCards(discard, cards) {
  for (const c of cards) discard.push(c);
}

/** Sheriff class starter deck */
export const SHERIFF_DECK_IDS = [
  "atk_rattlesnake",
  "atk_devils_due",
  "atk_rust_bullet",
  "atk_rust_bullet",
  "atk_leg_shot",
  "feat_steady_hand",
  "feat_whiskey",
  "char_iron_gut",
  "char_thick_hide",
  "gun_oiled_chamber",
  "gun_iron_maiden",
  "atk_phantom_round",
];

/** Default starter deck for new runs */
export const STARTER_DECK_IDS = [
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
];

/** Bounty Hunter class starter deck — heavy Focused-state synergy (12 cards) */
export const BOUNTY_HUNTER_DECK_IDS = [
  "atk_iron_nerve",
  "atk_iron_nerve",
  "atk_cold_blood",
  "atk_focused_volley",
  "atk_apex_predator",
  "feat_snipers_breath",
  "feat_second_wind",
  "gun_long_barrel",
  "gun_silver_tongue",
  "char_preacher",
  "atk_phantom_round",
  "atk_rattlesnake",
];
