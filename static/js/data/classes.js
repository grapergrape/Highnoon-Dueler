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

const OUTLAW_STARTER_DECK = [
  "atk_one_in_the_chamber", "atk_one_in_the_chamber",
  "atk_dodge",
  "atk_beer_heal",
  "atk_gunslingers_tempo", "atk_gunslingers_tempo",
  "atk_pistol_whip",
  "atk_dust_em_up",
  "atk_smoke_break",
  "atk_outlaws_pact",
  "atk_roll_the_dice",
  "atk_name_on_every_poster",
];

const SHERIFF_STARTER_DECK = [
  "atk_one_in_the_chamber", "atk_one_in_the_chamber",
  "atk_dodge",
  "atk_beer_heal",
  "atk_bulwark", "atk_bulwark",
  "atk_badge_flash", "atk_badge_flash",
  "atk_heavy_iron", "atk_heavy_iron",
  "atk_towns_strength",
  "atk_deputize_town",
];

const MARSHAL_STARTER_DECK = [
  "atk_one_in_the_chamber",
  "atk_dodge",
  "atk_beer_heal",
  "atk_dead_to_rights", "atk_dead_to_rights",
  "atk_federal_warrant", "atk_federal_warrant",
  "atk_deputy_crossfire",
  "atk_badge_cover",
  "atk_suppressing_fire",
  "atk_open_case_file",
  "char_federal_procedure",
];

const APACHE_STARTER_DECK = [
  "atk_one_in_the_chamber", "atk_one_in_the_chamber",
  "atk_dodge",
  "atk_beer_heal",
  "atk_wind_whisper", "atk_wind_whisper",
  "atk_spirit_talk",
  "atk_ridge_sight",
  "atk_owls_vision",
  "atk_read_the_dust",
  "char_hidden_trail",
  "char_medicine_bundle",
];

const VAQUERO_STARTER_DECK = [
  "atk_one_in_the_chamber", "atk_one_in_the_chamber",
  "atk_dodge",
  "atk_beer_heal",
  "atk_steady_offhand", "atk_steady_offhand",
  "atk_quick_holster",
  "atk_crossfire",
  "atk_left_hand_cover",
  "atk_offhand_reload",
  "atk_paso_fino",
  "char_caballero_rhythm",
];

const BOUNTY_HUNTER_STARTER_DECK = [
  "atk_one_in_the_chamber", "atk_one_in_the_chamber",
  "atk_dodge",
  "atk_beer_heal",
  "atk_blood_for_lead", "atk_blood_for_lead",
  "atk_dead_mans_cover", "atk_dead_mans_cover",
  "atk_vendetta_shot",
  "atk_reckless_aim",
  "atk_patch_job",
  "atk_dirty_needle",
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
    abilityName: "Dirty Footing",
    abilityBlurb: "Outlaw combo cards spend Position for loaded bullets, Nerve, and burst. He can still fight while exposed, but bad footing makes incoming damage dangerous.",
    startingMaxHp: 62,
    starterDeckIds: [...OUTLAW_STARTER_DECK],
    permanent: { maxNerve: 7, nerveGain: 3, startPosition: 1, outlawComboTracking: true },
    portraitTint: "#7a2929",
  },
  {
    id: "apache_tracker",
    name: "Apache Tracker",
    title: "Reads the Wind",
    backstory: "Trained by elders who knew the land before the railroad split it. He shoots when the wind agrees, and the wind agrees more often than the bluecoats would like. Carries a single feather in his hatband — earned, not taken.",
    abilityName: "Spirit Walker",
    abilityBlurb: "The first non-gun card each round costs 0 Nerve. Spirit helps Apache recover Position and adds deterministic bow/rifle damage.",
    startingMaxHp: 76,
    starterDeckIds: [...APACHE_STARTER_DECK],
    permanent: {
      freeFirstCardPerRound: true,
      spiritMax: 10,
      spiritDamagePerSpirit: 1,
      spiritDamageCap: 4,
      spiritArmorPerSpirit: 1,
      spiritArmorCap: 5,
      maxNerve: 7,
      nerveGain: 2,
      startPosition: 1,
    },
    portraitTint: "#5a6e3e",
  },
  {
    id: "sheriff",
    name: "Sheriff",
    title: "Badge of the Town",
    backstory: "Pinned the star ten years ago when the last sheriff ate dirt in front of the saloon. Knows every drunk, every cheat, and every shallow grave on Main Street. The town calls it grit: stay standing, earn Respect, and answer with thunder.",
    abilityName: "Hold the Street",
    abilityBlurb: "Sheriff gains Respect after wins for a small max-HP rise. His deck builds Armor and Position together so he can preserve health and fire from a clean angle.",
    startingMaxHp: 82,
    starterDeckIds: [...SHERIFF_STARTER_DECK],
    permanent: {
      respect: 0,
      respectMax: 10,
      respectMaxHpEach: 1,
      maxNerve: 7,
      nerveGain: 3,
      startPosition: 1,
    },
    portraitTint: "#b8860b",
  },
  {
    id: "marshal",
    name: "U.S. Marshal",
    title: "Federal Iron",
    backstory: "Rides for the Department of Justice across three territories. Knows the trains, the warrants, and which judges take silver. The badge says he can shoot in any state — and he does, with paperwork.",
    abilityName: "Federal Warrant",
    abilityBlurb: "Marks persist through the duel. Good Position turns Marks into deterministic bullet damage and enemy control.",
    startingMaxHp: 74,
    starterDeckIds: [...MARSHAL_STARTER_DECK],
    permanent: {
      maxNerve: 7,
      nerveGain: 3,
      startPosition: 1,
      extraMarkPerApply: 0,
      markDamagePerMark: 1,
      markDamageCap: 4,
      markDamageReducePerMark: 1,
      markDamageReduceCap: 4,
    },
    portraitTint: "#3a5b8e",
  },
  {
    id: "vaquero",
    name: "Vaquero",
    title: "Hijo del Sur",
    backstory: "Born south of the Rio Grande, rode with revolutionaries one summer and rurales the next. The desert taught him patience. The cantinas taught him the rest. Twin Colts and a flask of mescal — the rest is rumor.",
    abilityName: "Dos Pistolas",
    abilityBlurb: "Starts each duel dual-wielding. First gun card each duel is free and replaces the off-hand. High load density strains Position.",
    startingMaxHp: 76,
    starterDeckIds: [...VAQUERO_STARTER_DECK],
    permanent: {
      maxNerve: 7,
      nerveGain: 3,
      startPosition: 1,
      dualWieldEnabled: true,
      startSecondaryGunId: "gun_offhand_iron",
      freeFirstGunEachDuel: true,
    },
    portraitTint: "#a85c2a",
  },
  {
    id: "bounty_hunter",
    name: "Bounty Hunter",
    title: "Crown's Cast-Off",
    backstory: "Crossed an ocean from Britain with a starched collar and a Queen's English the frontier hates. Quotes Shakespeare to corpses, drinks his whiskey slow, and draws faster than any man who's lived to argue it.",
    abilityName: "Blood for Lead",
    abilityBlurb: "Spends HP to load violent life-stealing rounds or keep Position. Quickdraw ties are wins, but bad trades still bleed the run.",
    startingMaxHp: 68,
    starterDeckIds: [...BOUNTY_HUNTER_STARTER_DECK],
    permanent: {
      quickdrawWin: true,
      quickdrawHealPct: 0.12,
      maxNerve: 7,
      nerveGain: 3,
      startPosition: 1,
      brinkThresholdPct: 0.40,
      brinkDamageBonus: 2,
    },
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
  run.deckCards = [];
  run.permanent = { ...cls.permanent };
  return run;
}
