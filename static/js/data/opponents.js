import { getGun } from "./guns.js";

export const TOWNS = [
  {
    name: "Rookie Town",
    slug: "rookie-town",
    order: 1,
    mapImage: "/static/img/map-rookie-town.png",
    identity: "Tutorial street: basic bullet denial, deterministic dodge, and the first real boss check.",
  },
  {
    name: "Small Whiskey",
    slug: "small-whiskey",
    order: 2,
    mapImage: "/static/img/map-small-whiskey.png",
    identity: "Moonshine saloon: drunken bullet spikes, smoke-screen accuracy pressure, and a boss who taxes slow duels.",
  },
  {
    name: "Den of Bandits",
    slug: "den-of-bandits",
    order: 3,
    mapImage: "/static/img/map-den-of-bandits.png",
    identity: "Ambush canyon: lookout alarms, snares, crossfire, and gang-rush bullet pressure.",
  },
  {
    name: "Dead Man's Creek",
    slug: "dead-mans-creek",
    order: 4,
    mapImage: "/static/img/map-dead-mans-creek.png",
    identity: "Undead attrition: dodge, returned bullets, and long fights that punish weak closing power.",
  },
  {
    name: "The Devil's Saloon",
    slug: "devils-saloon",
    order: 5,
    mapImage: "/static/img/map-devils-saloon.png",
    identity: "Legend table: elite accuracy, auto-hits, and final-boss inevitability.",
  },
];

export const ROLE_ORDER = ["easy", "medium", "boss"];

/**
 * @typedef {'easy'|'medium'|'boss'} OpponentRole
 *
 * @typedef {Object} Opponent
 * @property {string} id
 * @property {string} town
 * @property {number} townOrder
 * @property {OpponentRole} role
 * @property {number} roleOrder
 * @property {number} difficultyTier
 * @property {string} name
 * @property {string} title
 * @property {string} backstory
 * @property {number} maxHp
 * @property {string} gunId        - id from GUNS pool; sets the opponent's starting active gun
 * @property {number} focus
 * @property {number} prepAggression - 0-1, chance to play another card
 * @property {string} bgKey         - render palette
 * @property {string[]} deckTemplate - card ids for prep draws (weighted pool)
 * @property {number} [bounty]
 * @property {string} [selectFlavor] - line shown when player picks this opponent
 * @property {string} [winFlavor]    - line shown when this opponent is defeated
 * @property {Object} [playbook]      - priority plan for enemy prep-card choices
 */

// Balance note: difficultyTier is deliberately not a strict 1-15 ladder.
// Each town climbs easy < medium < boss, while each next town's easy opponent
// is tuned below the previous boss but above the previous medium.
// prepAggression follows the same ladder so town boundaries do not present a
// sudden pressure drop: every next-town easy is strictly above the previous
// town's medium and strictly below its boss, and Dead Man's Creek / Devil's
// Saloon values stay above the Den of Bandits boss to avoid late-game relief.
// HP, focus, gun, and deck strength already climb monotonically across the
// roster; aggression here is the lever that smooths the curve without
// disturbing identities or kits.
/** @type {Opponent[]} */
export const OPPONENTS = [
  {
    id: "rookie_deputy_amos",
    town: "Rookie Town",
    townOrder: 1,
    role: "easy",
    roleOrder: 1,
    difficultyTier: 1,
    name: "Amos Pike",
    title: "Tremble-Hand Deputy",
    backstory:
      "Amos pinned on a borrowed badge after every real deputy rode out and did not come back. He knows the jail keys, the church bell rope, and exactly how loud his pistol sounds when his hand shakes.",
    maxHp: 64,
    gunId: "gun_enemy_deputy_peashooter",
    focus: 3,
    prepAggression: 0.28,
    bgKey: "street",
    bounty: 35,
    identity: "Nervous tutorial defender: fumbles your opening volley, hides behind a borrowed badge, then fires a shaky extra shot.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 1, 3: 2 },
      prepRoundPriority: {
        1: ["enemy_stance_badge_tremble", "enemy_showdown_deputys_luck"],
        2: ["enemy_feat_shaky_warning", "enemy_feat_jailhouse_duck"],
        3: ["enemy_feat_panic_reload", "enemy_feat_shaky_warning"],
      },
      fallbackPriority: ["enemy_showdown_deputys_luck", "enemy_feat_shaky_warning", "enemy_feat_panic_reload", "enemy_feat_jailhouse_duck"],
    },
    deckTemplate: [
      "enemy_showdown_deputys_luck",
      "enemy_stance_badge_tremble",
      "enemy_feat_shaky_warning",
      "enemy_feat_shaky_warning",
      "enemy_feat_panic_reload",
      "enemy_feat_panic_reload",
      "enemy_feat_jailhouse_duck",
      "enemy_feat_jailhouse_duck",
    ],
  },
  {
    id: "rookie_lottie_quickstep",
    town: "Rookie Town",
    townOrder: 1,
    role: "medium",
    roleOrder: 2,
    difficultyTier: 2,
    name: "Lottie Vale",
    title: "Dance-Hall Quickdraw",
    backstory:
      "Lottie smiles from the footlights and counts every bootstep in the room. Men think she is flirting when she asks them to dance; she is measuring how far their gun hand has to travel.",
    maxHp: 100,
    gunId: "gun_enemy_quickstep_colt",
    focus: 5,
    prepAggression: 0.42,
    bgKey: "saloon",
    bounty: 45,
    identity: "Accuracy check: builds stage poise, feints away player aim, then commits to a quickdraw burst.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_stance_footlight_poise", "enemy_showdown_curtain_call"],
        2: ["enemy_feat_footlight_feint", "enemy_feat_skirt_step"],
        3: ["enemy_feat_quickstep_draw", "enemy_feat_footlight_feint"],
      },
      fallbackPriority: ["enemy_showdown_curtain_call", "enemy_feat_quickstep_draw", "enemy_feat_footlight_feint", "enemy_feat_skirt_step"],
    },
    deckTemplate: [
      "enemy_showdown_curtain_call",
      "enemy_stance_footlight_poise",
      "enemy_feat_footlight_feint",
      "enemy_feat_footlight_feint",
      "enemy_feat_skirt_step",
      "enemy_feat_skirt_step",
      "enemy_feat_quickstep_draw",
      "enemy_feat_quickstep_draw",
    ],
  },
  {
    id: "rookie_marshal_graves",
    town: "Rookie Town",
    townOrder: 1,
    role: "boss",
    roleOrder: 3,
    difficultyTier: 4,
    name: "Marshal Elias Graves",
    title: "Rookie Town's Iron Law",
    backstory:
      "Elias Graves built Rookie Town's gallows before the schoolhouse and never apologized for the order. He keeps a quiet street because everyone has seen what happens when he stops being quiet.",
    maxHp: 165,
    gunId: "gun_enemy_marshal_graves_iron",
    focus: 6,
    prepAggression: 0.48,
    bgKey: "street",
    bounty: 65,
    identity: "First boss control test: suppresses bullets with the town charter, stands patient, and punishes slow prep with heavier law shots.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_showdown_town_charter", "enemy_stance_main_street_patience"],
        2: ["enemy_feat_badge_order", "enemy_feat_gallows_command"],
        3: ["enemy_feat_iron_verdict", "enemy_feat_badge_order"],
      },
      fallbackPriority: ["enemy_showdown_town_charter", "enemy_stance_main_street_patience", "enemy_feat_badge_order", "enemy_feat_gallows_command", "enemy_feat_iron_verdict"],
    },
    deckTemplate: [
      "enemy_showdown_town_charter",
      "enemy_stance_main_street_patience",
      "enemy_feat_badge_order",
      "enemy_feat_badge_order",
      "enemy_feat_gallows_command",
      "enemy_feat_gallows_command",
      "enemy_feat_iron_verdict",
      "enemy_feat_iron_verdict",
    ],
  },
  {
    id: "small_whiskey_barrel_ben",
    town: "Small Whiskey",
    townOrder: 2,
    role: "easy",
    roleOrder: 1,
    difficultyTier: 3,
    name: "Barrel Ben Cobb",
    title: "Drunken Barrel Guard",
    backstory:
      "Ben guards the back door of Small Whiskey's oldest saloon with one eye open and one hand on a splintered keg. His aim wanders, but he has survived enough brawls to know where the next bottle lands.",
    maxHp: 88,
    gunId: "gun_enemy_barrel_guard_blunder",
    focus: 4,
    prepAggression: 0.46,
    bgKey: "saloon",
    bounty: 55,
    identity: "Drunken bullet spike: low accuracy, extra rounds, and barrel cover.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 1, 3: 2 },
      prepRoundPriority: {
        1: ["enemy_stance_barrel_cover", "enemy_showdown_last_swig"],
        2: ["enemy_feat_sloppy_splash"],
        3: ["enemy_feat_sloppy_splash"],
      },
      fallbackPriority: ["enemy_showdown_last_swig", "enemy_stance_barrel_cover", "enemy_feat_sloppy_splash"],
    },
    deckTemplate: [
      "enemy_showdown_last_swig",
      "enemy_stance_barrel_cover",
      "enemy_feat_sloppy_splash",
      "enemy_feat_sloppy_splash",
      "enemy_feat_sloppy_splash",
      "enemy_feat_sloppy_splash",
      "enemy_feat_sloppy_splash",
      "enemy_feat_sloppy_splash",
    ],
  },
  {
    id: "small_whiskey_molly_mash",
    town: "Small Whiskey",
    townOrder: 2,
    role: "medium",
    roleOrder: 2,
    difficultyTier: 5,
    name: "Molly Mash",
    title: "Moonshine Runner",
    backstory:
      "Molly drives at night with a wagon full of clear lightning and a pistol wrapped in flour sack cloth. Revenue men learned to follow her dust from a distance, and most still lost the trail.",
    maxHp: 104,
    gunId: "gun_enemy_moonshine_pistol",
    focus: 5,
    prepAggression: 0.48,
    bgKey: "night",
    bounty: 70,
    identity: "Smoke runner: hides aim lines, then stacks accurate moonshine shots.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 2 },
      prepRoundPriority: {
        1: ["enemy_stance_backroom_still", "enemy_showdown_white_lightning"],
        2: ["enemy_feat_smoke_trail"],
        3: ["enemy_feat_smoke_trail"],
      },
      fallbackPriority: ["enemy_showdown_white_lightning", "enemy_stance_backroom_still", "enemy_feat_smoke_trail"],
    },
    deckTemplate: [
      "enemy_showdown_white_lightning",
      "enemy_stance_backroom_still",
      "enemy_feat_smoke_trail",
      "enemy_feat_smoke_trail",
      "enemy_feat_smoke_trail",
      "enemy_feat_smoke_trail",
      "enemy_feat_smoke_trail",
      "enemy_feat_smoke_trail",
    ],
  },
  {
    id: "small_whiskey_isaac_stillwater",
    town: "Small Whiskey",
    townOrder: 2,
    role: "boss",
    roleOrder: 3,
    difficultyTier: 7,
    name: "Isaac Stillwater",
    title: "Stillhouse Kingpin",
    backstory:
      "Isaac owns the copper stills, the crooked scales, and half the men who swear they hate him. He taxes patience: wait too long in front of him and the whole room starts shooting on his behalf.",
    maxHp: 118,
    gunId: "gun_enemy_stillhouse_repeater",
    focus: 5,
    prepAggression: 0.56,
    bgKey: "saloon",
    bounty: 95,
    identity: "Stillhouse tax boss: suppresses player bullets while boiler pressure turns delay into damage.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_showdown_stillhouse_tax", "enemy_stance_boiler_pressure"],
        2: ["enemy_feat_long_pour"],
        3: ["enemy_feat_long_pour"],
      },
      fallbackPriority: ["enemy_showdown_stillhouse_tax", "enemy_stance_boiler_pressure", "enemy_feat_long_pour"],
    },
    deckTemplate: [
      "enemy_showdown_stillhouse_tax",
      "enemy_stance_boiler_pressure",
      "enemy_feat_long_pour",
      "enemy_feat_long_pour",
      "enemy_feat_long_pour",
      "enemy_feat_long_pour",
      "enemy_feat_long_pour",
      "enemy_feat_long_pour",
    ],
  },
  {
    id: "den_bandits_needle_eye_ned",
    town: "Den of Bandits",
    townOrder: 3,
    role: "easy",
    roleOrder: 1,
    difficultyTier: 6,
    name: "Needle-Eye Ned",
    title: "Canyon Lookout",
    backstory:
      "Ned watches the Den's goat trails through a cracked spyglass and fires before he knows who he is warning. He is thin as a fence rail, fast as bad news, and twice as hard to spot.",
    maxHp: 110,
    gunId: "gun_enemy_lookout_carbine",
    focus: 5,
    prepAggression: 0.52,
    bgKey: "mine",
    bounty: 85,
    identity: "Canyon alarm: evasive lookout who calls extra rounds from cover.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 2 },
      prepRoundPriority: {
        1: ["enemy_stance_canyon_slit", "enemy_showdown_lookout_whistle"],
        2: ["enemy_feat_rattled_tin_can"],
        3: ["enemy_feat_rattled_tin_can"],
      },
      fallbackPriority: ["enemy_showdown_lookout_whistle", "enemy_stance_canyon_slit", "enemy_feat_rattled_tin_can"],
    },
    deckTemplate: [
      "enemy_showdown_lookout_whistle",
      "enemy_stance_canyon_slit",
      "enemy_feat_rattled_tin_can",
      "enemy_feat_rattled_tin_can",
      "enemy_feat_rattled_tin_can",
      "enemy_feat_rattled_tin_can",
      "enemy_feat_rattled_tin_can",
      "enemy_feat_rattled_tin_can",
    ],
  },
  {
    id: "den_bandits_veda_switchback",
    town: "Den of Bandits",
    townOrder: 3,
    role: "medium",
    roleOrder: 2,
    difficultyTier: 8,
    name: "Veda Switchback",
    title: "Dry-Gulch Ambusher",
    backstory:
      "Veda strings wire between mesquite trees and leaves boot prints pointing the wrong way. By the time a traveler notices the ambush, she has already counted their cartridges.",
    maxHp: 132,
    gunId: "gun_enemy_switchback_schofield",
    focus: 7,
    prepAggression: 0.64,
    bgKey: "mine",
    bounty: 105,
    identity: "Ambush puzzle: cuts bullets, strips dodges, and pressures aim without locking the duel.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 2 },
      prepRoundPriority: {
        1: ["enemy_showdown_crossfire_trap", "enemy_stance_split_trail"],
        2: ["enemy_feat_dry_gulch_snare"],
        3: ["enemy_feat_dry_gulch_snare"],
      },
      fallbackPriority: ["enemy_showdown_crossfire_trap", "enemy_stance_split_trail", "enemy_feat_dry_gulch_snare"],
    },
    deckTemplate: [
      "enemy_showdown_crossfire_trap",
      "enemy_stance_split_trail",
      "enemy_feat_dry_gulch_snare",
      "enemy_feat_dry_gulch_snare",
      "enemy_feat_dry_gulch_snare",
      "enemy_feat_dry_gulch_snare",
      "enemy_feat_dry_gulch_snare",
      "enemy_feat_dry_gulch_snare",
    ],
  },
  {
    id: "den_bandits_red_jack",
    town: "Den of Bandits",
    townOrder: 3,
    role: "boss",
    roleOrder: 3,
    difficultyTier: 10,
    name: "Red Jack Calder",
    title: "Chief of the Gulch Gang",
    backstory:
      "Red Jack calls every bandit in the Den cousin, whether blood agrees or not. He pays in gold teeth, keeps discipline with a dragoon pistol, and starts a charge before the dust settles.",
    maxHp: 150,
    gunId: "gun_enemy_red_jack_dragoon",
    focus: 7,
    prepAggression: 0.76,
    bgKey: "mine",
    bounty: 135,
    identity: "Gang-rush boss: Red Jack converts time into bullet count and damage.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_showdown_red_jack_charge", "enemy_stance_gang_boss_cover"],
        2: ["enemy_feat_gang_signal"],
        3: ["enemy_feat_gang_signal"],
      },
      fallbackPriority: ["enemy_showdown_red_jack_charge", "enemy_stance_gang_boss_cover", "enemy_feat_gang_signal"],
    },
    deckTemplate: [
      "enemy_showdown_red_jack_charge",
      "enemy_stance_gang_boss_cover",
      "enemy_feat_gang_signal",
      "enemy_feat_gang_signal",
      "enemy_feat_gang_signal",
      "enemy_feat_gang_signal",
      "enemy_feat_gang_signal",
      "enemy_feat_gang_signal",
    ],
  },
  {
    id: "dead_creek_hollow_hank",
    town: "Dead Man's Creek",
    townOrder: 4,
    role: "easy",
    roleOrder: 1,
    difficultyTier: 9,
    name: "Hollow Hank Dyer",
    title: "Freshly Buried Outlaw",
    backstory:
      "Hank was hanged three mornings ago and dug himself up by supper. The rope burn is still black around his throat, and every shot that should drop him only shakes more grave dirt from his coat.",
    maxHp: 142,
    gunId: "gun_enemy_hollow_hank_rusted_iron",
    focus: 6,
    prepAggression: 0.7,
    bgKey: "night",
    bounty: 120,
    identity: "Fresh grave attrition: blinds aim and refuses to stay hit.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 2 },
      prepRoundPriority: {
        1: ["enemy_showdown_cold_grave_grip", "enemy_stance_wont_stay_buried"],
        2: ["enemy_feat_grave_dirt_toss"],
        3: ["enemy_feat_grave_dirt_toss"],
      },
      fallbackPriority: ["enemy_showdown_cold_grave_grip", "enemy_stance_wont_stay_buried", "enemy_feat_grave_dirt_toss"],
    },
    deckTemplate: [
      "enemy_showdown_cold_grave_grip",
      "enemy_stance_wont_stay_buried",
      "enemy_feat_grave_dirt_toss",
      "enemy_feat_grave_dirt_toss",
      "enemy_feat_grave_dirt_toss",
      "enemy_feat_grave_dirt_toss",
      "enemy_feat_grave_dirt_toss",
      "enemy_feat_grave_dirt_toss",
    ],
  },
  {
    id: "dead_creek_mara_voss",
    town: "Dead Man's Creek",
    townOrder: 4,
    role: "medium",
    roleOrder: 2,
    difficultyTier: 11,
    name: "Mara Voss",
    title: "Graveyard Revenant",
    backstory:
      "Mara died in a creek-bed duel and woke under a headstone with her pistol clenched in both hands. She does not breathe, does not hurry, and seems stronger every time the smoke clears.",
    maxHp: 160,
    gunId: "gun_enemy_marrow_duelist_navy",
    focus: 7,
    prepAggression: 0.78,
    bgKey: "night",
    bounty: 150,
    identity: "Patient revenant: returned bullets and grave-moon dodge make long fights worse.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_showdown_moon_over_graves", "enemy_stance_midnight_pall"],
        2: ["enemy_feat_coffin_nail"],
        3: ["enemy_feat_coffin_nail"],
      },
      fallbackPriority: ["enemy_showdown_moon_over_graves", "enemy_stance_midnight_pall", "enemy_feat_coffin_nail"],
    },
    deckTemplate: [
      "enemy_showdown_moon_over_graves",
      "enemy_stance_midnight_pall",
      "enemy_feat_coffin_nail",
      "enemy_feat_coffin_nail",
      "enemy_feat_coffin_nail",
      "enemy_feat_coffin_nail",
      "enemy_feat_coffin_nail",
      "enemy_feat_coffin_nail",
    ],
  },
  {
    id: "dead_creek_silas_gravesmoke",
    town: "Dead Man's Creek",
    townOrder: 4,
    role: "boss",
    roleOrder: 3,
    difficultyTier: 13,
    name: "Silas Gravesmoke",
    title: "Undead Outlaw Legend",
    backstory:
      "Silas was buried with seven bullets in him and came back asking who kept the eighth. Dead Man's Creek follows his lantern, and the dead there stand straighter when he says draw.",
    maxHp: 194,
    gunId: "gun_enemy_gravesmoke_remington",
    focus: 8,
    prepAggression: 0.82,
    bgKey: "night",
    bounty: 190,
    identity: "Undead legend boss: funeral cover, returned bullets, and heavy calls from the dead.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_showdown_dead_mans_toll", "enemy_stance_funeral_procession"],
        2: ["enemy_feat_bone_marshal_call"],
        3: ["enemy_feat_bone_marshal_call"],
      },
      fallbackPriority: ["enemy_showdown_dead_mans_toll", "enemy_stance_funeral_procession", "enemy_feat_bone_marshal_call"],
    },
    deckTemplate: [
      "enemy_showdown_dead_mans_toll",
      "enemy_stance_funeral_procession",
      "enemy_feat_bone_marshal_call",
      "enemy_feat_bone_marshal_call",
      "enemy_feat_bone_marshal_call",
      "enemy_feat_bone_marshal_call",
      "enemy_feat_bone_marshal_call",
      "enemy_feat_bone_marshal_call",
    ],
  },
  {
    id: "devils_saloon_dahlia_kane",
    town: "The Devil's Saloon",
    townOrder: 5,
    role: "easy",
    roleOrder: 1,
    difficultyTier: 12,
    name: "Dahlia Kane",
    title: "Velvet Ace Duelist",
    backstory:
      "Dahlia deals faro at the Devil's Saloon and has never turned over a losing card by accident. Her draw is polite, precise, and quick enough to make famous men spill their drinks.",
    maxHp: 185,
    gunId: "gun_enemy_velvet_ace_dueling_colt",
    focus: 8,
    prepAggression: 0.8,
    bgKey: "saloon",
    bounty: 175,
    identity: "Rigged table opener: accurate silk draws and house-favored auto-hits.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_showdown_house_favorite", "enemy_stance_velvet_poise"],
        2: ["enemy_feat_silk_sleeve_draw"],
        3: ["enemy_feat_silk_sleeve_draw"],
      },
      fallbackPriority: ["enemy_showdown_house_favorite", "enemy_stance_velvet_poise", "enemy_feat_silk_sleeve_draw"],
    },
    deckTemplate: [
      "enemy_showdown_house_favorite",
      "enemy_stance_velvet_poise",
      "enemy_feat_silk_sleeve_draw",
      "enemy_feat_silk_sleeve_draw",
      "enemy_feat_silk_sleeve_draw",
      "enemy_feat_silk_sleeve_draw",
      "enemy_feat_silk_sleeve_draw",
      "enemy_feat_silk_sleeve_draw",
    ],
  },
  {
    id: "devils_saloon_caleb_cross",
    town: "The Devil's Saloon",
    townOrder: 5,
    role: "medium",
    roleOrder: 2,
    difficultyTier: 14,
    name: "Caleb Cross",
    title: "Ace-High Gunslinger",
    backstory:
      "Caleb Cross has a dime novel in every rail town and a fresh grave behind every edition. He signs autographs with his left hand because the right is never far from the holster.",
    maxHp: 205,
    gunId: "gun_enemy_ace_high_schofield",
    focus: 8,
    prepAggression: 0.83,
    bgKey: "street",
    bounty: 220,
    identity: "Dime-novel tempo: fame grants first hits, accuracy, and escalating ace-high pressure.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_showdown_ace_high_legend", "enemy_stance_famous_hands"],
        2: ["enemy_feat_ace_high_tempo"],
        3: ["enemy_feat_ace_high_tempo"],
      },
      fallbackPriority: ["enemy_showdown_ace_high_legend", "enemy_stance_famous_hands", "enemy_feat_ace_high_tempo"],
    },
    deckTemplate: [
      "enemy_showdown_ace_high_legend",
      "enemy_stance_famous_hands",
      "enemy_feat_ace_high_tempo",
      "enemy_feat_ace_high_tempo",
      "enemy_feat_ace_high_tempo",
      "enemy_feat_ace_high_tempo",
      "enemy_feat_ace_high_tempo",
      "enemy_feat_ace_high_tempo",
    ],
  },
  {
    id: "devils_saloon_judge_blackthorn",
    town: "The Devil's Saloon",
    townOrder: 5,
    role: "boss",
    roleOrder: 3,
    difficultyTier: 16,
    name: "Judge Obadiah Blackthorn",
    title: "The Devil's Final Hand",
    backstory:
      "Blackthorn was a judge before the war and a legend after it. The Devil's Saloon keeps his table empty, his whiskey poured, and his verdict final for anyone who mistakes him for a man.",
    selectFlavor: "The house has been waiting for you.",
    winFlavor: "For once, the Devil's table is quiet.",
    maxHp: 220,
    gunId: "gun_enemy_blackthorn_last_word",
    focus: 9,
    prepAggression: 0.86,
    bgKey: "saloon",
    bounty: 300,
    identity: "Final verdict boss: the table grants auto-hits, huge damage, and the last Oath in the West.",
    playbook: {
      alwaysPlay: true,
      playsPerRound: { 1: 1, 2: 2, 3: 3 },
      prepRoundPriority: {
        1: ["enemy_showdown_last_western_legend", "enemy_stance_devils_table"],
        2: ["enemy_feat_final_verdict"],
        3: ["enemy_feat_final_verdict"],
      },
      fallbackPriority: ["enemy_showdown_last_western_legend", "enemy_stance_devils_table", "enemy_feat_final_verdict"],
    },
    deckTemplate: [
      "enemy_showdown_last_western_legend",
      "enemy_stance_devils_table",
      "enemy_feat_final_verdict",
      "enemy_feat_final_verdict",
      "enemy_feat_final_verdict",
      "enemy_feat_final_verdict",
      "enemy_feat_final_verdict",
      "enemy_feat_final_verdict",
    ],
  },
];

export function getTown(orderOrName) {
  if (typeof orderOrName === "number") {
    return TOWNS.find((t) => t.order === orderOrName) ?? TOWNS[0];
  }
  return TOWNS.find((t) => t.name === orderOrName) ?? TOWNS[0];
}

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
