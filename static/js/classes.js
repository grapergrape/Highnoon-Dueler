/**
 * Player class definitions — loaded once, queried by getClass().
 *
 * Each class grants a passive ability that is always visible in the HUD
 * chip and on the Wanted Board after the player picks a class.
 */

/** @type {Object[]} */
export const CLASSES = [
  {
    id: "outlaw",
    name: "Outlaw",
    title: "Wanted Dead",
    backstory: "Robbed every coach from El Paso to Cheyenne and slept under stars he couldn't name. The price on his head is what he is worth — and that price climbs with every man he buries. He doesn't fear the rope. He fears being forgotten.",
    abilityName: "Wanted Dead",
    abilityBlurb: "+1 focus/round. Bounty grows +25% per duel won (cap +200%).",
    startingMaxHp: 90,
    startingGunId: "peacemaker",
    startingOwnedGunIds: ["peacemaker"],
    starterDeckIds: [
      "gun_volcanic_six", "gun_volcanic_six",
      "atk_fan_hammer", "atk_devils_due", "atk_rust_bullet",
      "atk_showboat", "atk_rattlesnake",
      "feat_outlaws_fury",
      "char_desperado",
      "atk_trick_shot", "atk_sand_chamber", "atk_dust_throw",
    ],
    permanent: { focusPerRound: 1, bountyGrowthPerWin: 0.25, bountyMult: 1.0 },
    portraitTint: "#7a2929",
  },
  {
    id: "apache_tracker",
    name: "Apache Tracker",
    title: "Reads the Wind",
    backstory: "Trained by elders who knew the land before the railroad split it. He shoots when the wind agrees, and the wind agrees more often than the bluecoats would like. Carries a single feather in his hatband — earned, not taken.",
    abilityName: "Reads the Wind",
    abilityBlurb: "+5% acc. First card each prep round costs 0 focus.",
    startingMaxHp: 100,
    startingGunId: "peacemaker",
    startingOwnedGunIds: ["peacemaker"],
    starterDeckIds: [
      "atk_rattlesnake", "atk_rattlesnake",
      "atk_dust_throw", "atk_dust_throw",
      "atk_devils_due",
      "feat_steady_aim", "feat_steady_aim",
      "feat_tumbleweed",
      "char_hawk_eye",
      "gun_quick_draw", "gun_oiled_chamber",
      "atk_iron_nerve",
    ],
    permanent: { accBonus: 0.05, freeFirstCardPerRound: true },
    portraitTint: "#5a6e3e",
  },
  {
    id: "sheriff",
    name: "Sheriff",
    title: "Badge of the Town",
    backstory: "Pinned the star ten years ago when the last sheriff ate dirt in front of the saloon. Knows every drunk, every cheat, and every shallow grave on Main Street. Draws slow because he draws certain.",
    abilityName: "Lawman's Resolve",
    abilityBlurb: "+5 HP/duel, +15 max HP. Slow draw: -10% acc on cycle 1.",
    startingMaxHp: 115,
    startingGunId: "schofield",
    startingOwnedGunIds: ["peacemaker", "schofield"],
    starterDeckIds: [
      "atk_rattlesnake", "atk_devils_due",
      "atk_rust_bullet", "atk_rust_bullet",
      "atk_leg_shot",
      "feat_steady_hand",
      "feat_whiskey",
      "char_iron_gut",
      "char_thick_hide",
      "gun_oiled_chamber", "gun_iron_maiden",
      "atk_phantom_round",
    ],
    permanent: { healPerDuel: 5, firstCycleAccPenalty: 0.10 },
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
    startingGunId: "peacemaker",
    startingOwnedGunIds: ["peacemaker"],
    starterDeckIds: [
      "atk_dead_to_rights", "atk_dead_to_rights",
      "atk_target_locked",
      "atk_marked_execution",
      "atk_suppressing_fire",
      "feat_war_cry",
      "gun_crosshairs", "gun_crosshairs",
      "gun_quick_draw",
      "atk_devils_due",
      "char_bounty_hunter",
      "feat_dead_eye_focus",
    ],
    permanent: { accBonus: 0.05, focusPerRound: 1, extraMarkPerApply: 1 },
    portraitTint: "#3a5b8e",
  },
  {
    id: "vaquero",
    name: "Vaquero",
    title: "Hijo del Sur",
    backstory: "Born south of the Rio Grande, rode with revolutionaries one summer and rurales the next. The desert taught him patience. The cantinas taught him the rest. Twin Colts and a flask of mescal — the rest is rumor.",
    abilityName: "Mescal Fire",
    abilityBlurb: "+10 HP/duel. +20% damage from cycle 3 onwards.",
    startingMaxHp: 105,
    startingGunId: "peacemaker",
    startingOwnedGunIds: ["peacemaker"],
    starterDeckIds: [
      "gun_twin_irons", "gun_twin_irons",
      "feat_whiskey", "feat_whiskey",
      "feat_adrenaline",
      "atk_fan_hammer",
      "atk_rattlesnake",
      "atk_devils_due",
      "char_desert_grit",
      "feat_blood_pact",
      "atk_dead_mans_volley",
      "atk_showboat",
    ],
    permanent: { healPerDuel: 10, lateCycleDmgBonus: 0.20 },
    portraitTint: "#a85c2a",
  },
  {
    id: "bounty_hunter",
    name: "Bounty Hunter",
    title: "English Bob's Apprentice",
    backstory: "Starched collar, polished boots, a Queen's English in a country that hates his vowels. Quotes Shakespeare to corpses. Pays for the best whiskey, drinks it slow, and never misses twice.",
    abilityName: "Civilized Cruelty",
    abilityBlurb: "+25% bounty. +10% acc when Focused.",
    startingMaxHp: 95,
    startingGunId: "peacemaker",
    startingOwnedGunIds: ["peacemaker"],
    starterDeckIds: [
      "atk_iron_nerve", "atk_iron_nerve",
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
    ],
    permanent: { bountyMult: 1.25, focusedAccBonus: 0.10 },
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
  run.gunId = cls.startingGunId;
  run.ownedGuns = [...cls.startingOwnedGunIds];
  run.deckIds = [...cls.starterDeckIds];
  run.permanent = { ...cls.permanent };
  return run;
}
