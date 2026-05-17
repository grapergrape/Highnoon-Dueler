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
  for (const entry of ids) {
    const id = typeof entry === "string" ? entry : entry?.id;
    if (getCardDef(id)) {
      instances.push(cloneCardInstance(id, typeof entry === "string" ? {} : {
        uid: entry.uid,
        upgradeId: entry.upgradeId ?? null,
      }));
    }
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

/** Legacy classless fallback deck (classes define their own 12-card starter decks in classes.js). */
export const STARTER_DECK_IDS = [
  "atk_rattlesnake", "atk_rattlesnake",
  "atk_devils_due", "atk_devils_due",
  "atk_rust_bullet", "atk_rust_bullet",
  "atk_fan_hammer", "atk_fan_hammer",
  "atk_trick_shot",
  "atk_sand_chamber",
  "atk_dust_throw",
  "atk_leg_shot",
  "atk_showboat",
  "atk_snakebite",
  "atk_hail_mary",
  "feat_quick_reload",
  "char_thick_hide", "char_iron_will", "char_vulture", "char_quick_hands", "char_gravedigger",
  "gun_pocket_pistol", "gun_trappers_carbine",
  "char_legend",
];

/** Bounty Hunter alt deck retained for save/debug compatibility. */
export const BOUNTY_HUNTER_DECK_IDS = [
  "atk_blood_for_lead", "atk_blood_for_lead",
  "atk_vendetta_shot", "atk_vendetta_shot",
  "atk_reckless_aim", "atk_reckless_aim",
  "atk_last_bullet", "atk_last_bullet",
  "atk_bloodlust", "atk_bloodlust",
  "atk_no_tomorrow", "atk_no_tomorrow",
  "atk_phantom_round",
  "feat_adrenaline",
  "feat_last_stand",
  "feat_death_wish",
  "char_desperado", "char_preacher", "char_bounty_hunter", "char_quick_hands", "char_deadeye",
  "gun_pepperbox", "gun_doc_hideout",
  "atk_quickdraw_master",
];
