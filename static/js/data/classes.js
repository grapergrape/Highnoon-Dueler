/**
 * Player class definitions — loaded once, queried by getClass().
 *
 * Each class grants a passive ability that is always visible in the HUD
 * chip and on the Wanted Board after the player picks a class.
 */

const SHARED_BASIC_STARTER_CORE = [
  "atk_one_in_the_chamber", "atk_one_in_the_chamber", "atk_one_in_the_chamber", "atk_one_in_the_chamber",
  "atk_dodge", "atk_dodge", "atk_dodge", "atk_dodge",
  "atk_beer_heal",
];

function starterDeckWithSpecials(specials) {
  return [...SHARED_BASIC_STARTER_CORE, ...specials];
}

/** @type {Object[]} */
export const CLASSES = [
  {
    id: "outlaw",
    name: "Outlaw",
    title: "Wanted Dead",
    backstory: "Robbed every coach from El Paso to Cheyenne and slept under stars he couldn't name. The price on his head is what he is worth — and that price climbs with every man he buries. He doesn't fear the rope. He fears being forgotten.",
    abilityName: "Twin Combos",
    abilityBlurb: "+1 focus/round. Cards have bonus effects when ≥2 outlaw cards are played in the same prep round.",
    startingMaxHp: 90,
    starterDeckIds: starterDeckWithSpecials([
      "atk_outlaws_pact",
      "atk_gunslingers_tempo",
      "atk_pistol_whip",
    ]),
    permanent: { focusPerRound: 1, outlawComboTracking: true },
    portraitTint: "#7a2929",
  },
  {
    id: "apache_tracker",
    name: "Apache Tracker",
    title: "Reads the Wind",
    backstory: "Trained by elders who knew the land before the railroad split it. He shoots when the wind agrees, and the wind agrees more often than the bluecoats would like. Carries a single feather in his hatband — earned, not taken.",
    abilityName: "Spirit Walker",
    abilityBlurb: "+5% acc, never below 50%. First card each prep round costs 0 focus. Build Spirit (cap 10) to scale buffs and debuffs.",
    startingMaxHp: 100,
    starterDeckIds: starterDeckWithSpecials([
      "atk_wind_whisper",
      "atk_spirit_talk",
      "atk_spirit_walk",
    ]),
    permanent: { accBonus: 0.05, freeFirstCardPerRound: true, accFloor: 0.50, spiritMax: 10 },
    portraitTint: "#5a6e3e",
  },
  {
    id: "sheriff",
    name: "Sheriff",
    title: "Badge of the Town",
    backstory: "Pinned the star ten years ago when the last sheriff ate dirt in front of the saloon. Knows every drunk, every cheat, and every shallow grave on Main Street. Draws slow because he draws certain.",
    abilityName: "Lawman's Resolve",
    abilityBlurb: "+5 HP/duel, +15 max HP. Slow draw: -10% acc on cycle 1. Each kill earns Respect (cap 5): +2 max HP and -2% slow-draw penalty per point.",
    startingMaxHp: 115,
    starterDeckIds: starterDeckWithSpecials([
      "atk_bulwark",
      "atk_lawmans_stand",
      "atk_towns_strength",
    ]),
    permanent: {
      healPerDuel: 5,
      firstCycleAccPenalty: 0.10,
      respect: 0,
      respectMax: 5,
      respectMaxHpEach: 2,
      respectAccPenaltyReduceEach: 0.02,
    },
    portraitTint: "#b8860b",
  },
  {
    id: "marshal",
    name: "U.S. Marshal",
    title: "Federal Iron",
    backstory: "Rides for the Department of Justice across three territories. Knows the trains, the warrants, and which judges take silver. The badge says he can shoot in any state — and he does, with paperwork.",
    abilityName: "Federal Warrant",
    abilityBlurb: "+5% acc, +1 focus/round. +1 extra mark whenever you mark.",
    startingMaxHp: 100,
    starterDeckIds: starterDeckWithSpecials([
      "atk_dead_to_rights",
      "atk_posse_mark",
      "atk_federal_warrant",
    ]),
    permanent: { accBonus: 0.05, focusPerRound: 1, extraMarkPerApply: 1 },
    portraitTint: "#3a5b8e",
  },
  {
    id: "vaquero",
    name: "Vaquero",
    title: "Hijo del Sur",
    backstory: "Born south of the Rio Grande, rode with revolutionaries one summer and rurales the next. The desert taught him patience. The cantinas taught him the rest. Twin Colts and a flask of mescal — the rest is rumor.",
    abilityName: "Dos Pistolas",
    abilityBlurb: "Dual-wield: equip a second gun (stats stack, damage averaged, –10% accuracy). +10 HP/duel.",
    startingMaxHp: 105,
    starterDeckIds: starterDeckWithSpecials([
      "atk_steady_offhand",
      "atk_crossfire",
      "atk_quick_holster",
    ]),
    permanent: { healPerDuel: 10, dualWieldEnabled: true, dualWieldAccPenalty: 0.10 },
    portraitTint: "#a85c2a",
  },
  {
    id: "bounty_hunter",
    name: "Bounty Hunter",
    title: "Crown's Cast-Off",
    backstory: "Crossed an ocean from Britain with a starched collar and a Queen's English the frontier hates. Quotes Shakespeare to corpses, drinks his whiskey slow, and draws faster than any man who's lived to argue it.",
    abilityName: "Blood for Lead",
    abilityBlurb: "Spend HP to power your shots. Quickdraw: if both fall in the same volley, you walk away — and recover 20% max HP.",
    startingMaxHp: 95,
    starterDeckIds: starterDeckWithSpecials([
      "atk_blood_for_lead",
      "atk_vendetta_shot",
      "atk_reckless_aim",
    ]),
    permanent: { quickdrawWin: true, quickdrawHealPct: 0.20 },
    portraitTint: "#3d2e22",
  },
];

export const DEFAULT_CLASS_ID = "outlaw";

/** Lookup a class by its id string. */
export function getClass(id) {
  if (!id) return null;
  return CLASSES.find((c) => c.id === id) ?? null;
}

/**
 * Apply class data to a fresh run object.
 * Mutates `run` and returns it so callers can chain.
 */
export function applyClassToRun(run, classId) {
  const cls = getClass(classId);
  if (!cls) return run;
  run.classId = cls.id;
  run.maxHp = cls.startingMaxHp;
  run.hp = cls.startingMaxHp;
  run.deckIds = [...cls.starterDeckIds];
  run.permanent = { ...cls.permanent };
  return run;
}
