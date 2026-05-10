import { GUNS_LIST } from "./guns.js";

/** @typedef {'gun'|'attack'|'character'|'feat'} CardType */
/** @typedef {'common'|'uncommon'|'rare'|'epic'|'legendary'} CardRarity */

/**
 * @typedef {Object} CardDef
 * @property {string} id
 * @property {string} name
 * @property {CardType} type
 * @property {CardRarity} rarity
 * @property {number} cost
 * @property {string[]} [effects]
 */

/** @type {CardDef[]} */
export const CARD_DEFINITIONS = [
  // Gun cards are derived from GUNS_LIST and appended to CARD_DEFINITIONS at
  // module load (see bottom of file). Each gun appears here as a CardDef with
  // type "gun".

  // ── ATTACK CARDS ───────────────────────────────────────────────────────────
  {
    id: "atk_rust_bullet",
    name: "Rust Bullet",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["enemyAccNext-0.25"],
  },
  {
    id: "atk_trick_shot",
    name: "Trick Shot",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["bullets+1", "ricochet"],
  },
  {
    id: "atk_sand_chamber",
    name: "Sand in the Chamber",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["enemyBullets-2"],
  },
  {
    id: "atk_fan_hammer",
    name: "Fan the Hammer",
    type: "attack",
    rarity: "common",
    cost: 2,
    effects: ["bullets+2", "accShootout-0.2"],
  },
  {
    id: "atk_dead_mans_volley",
    name: "Dead Man's Volley",
    type: "attack",
    rarity: "rare",
    cost: 4,
    effects: ["returnBulletOnHit+1"],
  },
  {
    id: "atk_devils_due",
    name: "Devil's Due",
    type: "attack",
    rarity: "common",
    cost: 2,
    effects: ["damage+2", "enemyAccNext-0.1"],
  },
  {
    id: "atk_rattlesnake",
    name: "Rattlesnake Reflexes",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["accShootout+0.1", "bullets+1"],
  },
  {
    id: "atk_dust_throw",
    name: "Dust in the Eyes",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["enemyAccNext-0.15"],
  },
  {
    id: "atk_leg_shot",
    name: "Leg Shot",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["enemyBullets-1"],
  },
  {
    id: "atk_showboat",
    name: "Showboat",
    type: "attack",
    rarity: "common",
    cost: 2,
    effects: ["bullets+2", "hpAfterShootout-5"],
  },
  {
    id: "atk_snakebite",
    name: "Snakebite",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["enemyAccNext-0.2", "damage+1"],
  },
  {
    id: "atk_hail_mary",
    name: "Hail Mary",
    type: "attack",
    rarity: "uncommon",
    cost: 3,
    effects: ["bullets+4", "accShootout-0.3"],
  },
  {
    id: "atk_disarm",
    name: "Disarm",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["enemyBullets-3"],
  },
  {
    id: "atk_executioner",
    name: "Executioner's Shot",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["damage+5", "accShootout-0.2"],
  },
  {
    id: "atk_hangmans_noose",
    name: "Hangman's Noose",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["enemyBullets-4", "enemyAccNext-0.2"],
  },
  {
    id: "atk_phantom_round",
    name: "Phantom Round",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["accShootout+0.4", "bullets+1"],
  },
  {
    id: "atk_undertakers_deal",
    name: "Undertaker's Deal",
    type: "attack",
    rarity: "legendary",
    cost: 4,
    effects: ["returnBulletOnHit+2", "pierce", "damage+2"],
  },
  // ── NEW ATTACK CARDS ──────────────────────────────────────────────────────
  {
    id: "atk_dead_to_rights",
    name: "Dead to Rights",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["markEnemy+2"],
  },
  {
    id: "atk_target_locked",
    name: "Target Locked",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["markEnemy+3", "enemyAccNext-0.1"],
  },
  {
    id: "atk_marked_execution",
    name: "Marked Execution",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["markBurst+6"],
  },
  {
    id: "atk_iron_nerve",
    name: "Iron Nerve",
    type: "attack",
    rarity: "common",
    cost: 1,
    effects: ["gainFocused"],
  },
  {
    id: "atk_focused_volley",
    name: "Focused Volley",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["focusBonusBullets+3", "bullets+1"],
  },
  {
    id: "atk_cold_blood",
    name: "Cold Blood",
    type: "attack",
    rarity: "uncommon",
    cost: 2,
    effects: ["gainFocused", "enemyAccNext-0.15"],
  },
  {
    id: "atk_suppressing_fire",
    name: "Suppressing Fire",
    type: "attack",
    rarity: "common",
    cost: 2,
    effects: ["enemyBullets-2", "markEnemy+1"],
  },
  {
    id: "atk_apex_predator",
    name: "Apex Predator",
    type: "attack",
    rarity: "rare",
    cost: 3,
    effects: ["focusBonusBullets+4", "focusBonusAcc+0.2", "markEnemy+1"],
  },

  // ── CHARACTER CARDS (permanent, cost 0) ────────────────────────────────────
  {
    id: "char_iron_gut",
    name: "Iron Gut",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["maxHp+25", "healPerDuel+8"],
  },
  {
    id: "char_lightning",
    name: "Lightning Reflexes",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["accGlobal+0.12", "focusPerRound+1"],
  },
  {
    id: "char_deadeye",
    name: "Deadeye",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["deadeye"],
  },
  {
    id: "char_thick_hide",
    name: "Thick Hide",
    type: "character",
    rarity: "common",
    cost: 0,
    effects: ["damageTaken-1"],
  },
  {
    id: "char_vulture",
    name: "Vulture's Eye",
    type: "character",
    rarity: "common",
    cost: 0,
    effects: ["accGlobal+0.05"],
  },
  {
    id: "char_iron_will",
    name: "Iron Will",
    type: "character",
    rarity: "common",
    cost: 0,
    effects: ["maxHp+10"],
  },
  {
    id: "char_quick_hands",
    name: "Quick Hands",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["focusPerRound+2"],
  },
  {
    id: "char_gravedigger",
    name: "Gravedigger's Calm",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["damageTaken-2"],
  },
  {
    id: "char_bounty_hunter",
    name: "Bounty Hunter",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["healPerDuel+15", "maxHp+10"],
  },
  {
    id: "char_desperado",
    name: "Desperado",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["accGlobal+0.2", "maxHp-20"],
  },
  {
    id: "char_legend",
    name: "Living Legend",
    type: "character",
    rarity: "legendary",
    cost: 0,
    effects: ["accGlobal+0.15", "maxHp+30", "focusPerRound+1"],
  },
  // ── NEW CHARACTER CARDS ───────────────────────────────────────────────────────
  {
    id: "char_desert_grit",
    name: "Desert Grit",
    type: "character",
    rarity: "common",
    cost: 0,
    effects: ["maxHp+15", "damageTaken-1"],
  },
  {
    id: "char_preacher",
    name: "Preacher's Calm",
    type: "character",
    rarity: "uncommon",
    cost: 0,
    effects: ["focusPerRound+2", "healPerDuel+6"],
  },
  {
    id: "char_hawk_eye",
    name: "Hawk Eye",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["accGlobal+0.18", "focusPerRound+1"],
  },
  {
    id: "char_war_veteran",
    name: "War Veteran",
    type: "character",
    rarity: "rare",
    cost: 0,
    effects: ["damageTaken-3", "maxHp+10"],
  },
  {
    id: "char_ghost_rider",
    name: "Ghost Rider",
    type: "character",
    rarity: "legendary",
    cost: 0,
    effects: ["accGlobal+0.1", "focusPerRound+3", "healPerDuel+10"],
  },
  {
    id: "char_sheriff",
    name: "Lawman's Resolve",
    type: "character",
    rarity: "legendary",
    cost: 0,
    // +15 maxHp → 115 total; heal 5 HP at each duel start; slow-draw -10% acc on cycle 1 only; equips Schofield + keeps Peacemaker
    effects: ["maxHp+15", "healPerDuel+5", "firstCycleAccPenalty+0.10", "startGunSchofield"],
  },

  // ── FEAT CARDS ─────────────────────────────────────────────────────────────
  {
    id: "feat_adrenaline",
    name: "Adrenaline Rush",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["accShootout+0.3", "damageShootout+0.2", "hpAfterCycle-10"],
  },
  {
    id: "feat_steady_hand",
    name: "Steady Hand",
    type: "feat",
    rarity: "rare",
    cost: 3,
    effects: ["accShootout+0.35", "firstHitsAuto+3"],
  },
  {
    id: "feat_whiskey",
    name: "Whiskey Courage",
    type: "feat",
    rarity: "common",
    cost: 2,
    effects: ["focusCycle+10", "healNow+15"],
  },
  {
    id: "feat_tumbleweed",
    name: "Tumbleweed Dodge",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["dodgeRecv+0.25"],
  },
  {
    id: "feat_quick_reload",
    name: "Quick Reload",
    type: "feat",
    rarity: "common",
    cost: 1,
    effects: ["focusCycle+7"],
  },
  {
    id: "feat_steady_aim",
    name: "Steady Aim",
    type: "feat",
    rarity: "common",
    cost: 1,
    effects: ["accShootout+0.15"],
  },
  {
    id: "feat_battle_cry",
    name: "Battle Cry",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["damageShootout+0.3", "accShootout+0.1"],
  },
  {
    id: "feat_dead_eye_focus",
    name: "Dead Eye Focus",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["firstHitsAuto+2", "accShootout+0.1"],
  },
  {
    id: "feat_last_stand",
    name: "Last Stand",
    type: "feat",
    rarity: "rare",
    cost: 2,
    effects: ["damageShootout+0.5", "accShootout+0.4", "hpAfterCycle-20"],
  },
  {
    id: "feat_blood_pact",
    name: "Blood Pact",
    type: "feat",
    rarity: "rare",
    cost: 3,
    effects: ["dodgeRecv+0.4", "healNow+20"],
  },
  {
    id: "feat_outlaws_fury",
    name: "Outlaw's Fury",
    type: "feat",
    rarity: "legendary",
    cost: 4,
    effects: ["bullets+3", "accShootout+0.5", "damageShootout+0.4"],
  },
  // ── NEW FEAT CARDS ────────────────────────────────────────────────────────
  {
    id: "feat_war_cry",
    name: "War Cry",
    type: "feat",
    rarity: "common",
    cost: 1,
    effects: ["markEnemy+2", "accShootout+0.1"],
  },
  {
    id: "feat_snipers_breath",
    name: "Sniper's Breath",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["gainFocused", "accShootout+0.2"],
  },
  {
    id: "feat_burning_powder",
    name: "Burning Powder",
    type: "feat",
    rarity: "uncommon",
    cost: 2,
    effects: ["damageShootout+0.3", "markEnemy+1"],
  },
  {
    id: "feat_second_wind",
    name: "Second Wind",
    type: "feat",
    rarity: "rare",
    cost: 2,
    effects: ["healNow+25", "gainFocused"],
  },
  {
    id: "feat_death_wish",
    name: "Death Wish",
    type: "feat",
    rarity: "legendary",
    cost: 3,
    effects: ["bullets+5", "accShootout+0.6", "hpAfterCycle-30"],
  },
  // ── MARSHAL: MARKS → LEAD ────────────────────────────────────────────────
  {
    id: "atk_posse_mark", name: "Posse Mark", type: "attack", rarity: "uncommon", cost: 2,
    classId: "marshal",
    effects: ["markEnemy+2", "bullets+1"],
    flavorText: "Deputies follow the trail you set.",
  },
  {
    id: "atk_shackle_round", name: "Shackle Round", type: "attack", rarity: "uncommon", cost: 2,
    classId: "marshal",
    effects: ["markEnemy+1", "enemyBullets-1", "enemyAccNext-0.1"],
    flavorText: "Iron in the wrist, lead in the chamber.",
  },
  {
    id: "atk_federal_warrant", name: "Federal Warrant", type: "attack", rarity: "common", cost: 1,
    classId: "marshal",
    effects: ["markEnemy+2", "accShootout+0.05"],
    flavorText: "Signed by a judge, served in lead.",
  },
  {
    id: "atk_federal_bounty_program", name: "Federal Bounty Program", type: "attack", rarity: "legendary", cost: 4,
    classId: "marshal",
    effects: ["markBulletPerMark+1"],
    flavorText: "Every mark is a paycheck.",
    backstory: "The Department of Justice's standing offer: one bullet, one bounty, paid by the head.",
  },

  // ── VAQUERO: DOS PISTOLAS ────────────────────────────────────────────────
  {
    id: "atk_both_barrels", name: "Both Barrels", type: "attack", rarity: "uncommon", cost: 2,
    classId: "vaquero",
    effects: ["bullets+1", "damageShootout+0.2"],
    flavorText: "Why pick one when you brought two?",
  },
  {
    id: "atk_crossfire", name: "Crossfire", type: "attack", rarity: "uncommon", cost: 2,
    classId: "vaquero",
    effects: ["bullets+2"],
    flavorText: "Left, right, left again.",
  },
  {
    id: "atk_steady_offhand", name: "Steady the Off-Hand", type: "attack", rarity: "common", cost: 1,
    classId: "vaquero",
    effects: ["accShootout+0.15"],
    flavorText: "The weak hand learns the strong one's lesson.",
  },
  {
    id: "atk_mescal_blaze", name: "Mescal Blaze", type: "attack", rarity: "rare", cost: 3,
    classId: "vaquero",
    effects: ["accShootout+0.2", "damageShootout+0.2"],
    flavorText: "Mescal in the throat, fire in the hand.",
  },
  {
    id: "atk_dance_of_lead", name: "Dance of Lead", type: "attack", rarity: "uncommon", cost: 2,
    classId: "vaquero",
    effects: ["bullets+1", "ricochet"],
    flavorText: "Two pistols, one rhythm.",
  },
  {
    id: "atk_quick_holster", name: "Quick Holster", type: "attack", rarity: "common", cost: 1,
    classId: "vaquero",
    effects: ["accShootout+0.1"],
    flavorText: "Greased leather, no hesitation.",
  },
  {
    id: "atk_el_doble", name: "El Doble", type: "attack", rarity: "legendary", cost: 4,
    classId: "vaquero",
    effects: ["elDoble", "removeDualPenalty"],
    flavorText: "Dos pistolas se vuelven tres.",
    backstory: "South of the border, a pistolero who counted to two but fought as if to three.",
  },
  {
    id: "char_ambidextrous", name: "Ambidextrous", type: "character", rarity: "uncommon", cost: 0,
    classId: "vaquero",
    effects: ["dualWieldAccPenaltyReduce+0.05"],
    flavorText: "Both hands, both sure.",
  },

  // ── SHERIFF: IRON WILL ───────────────────────────────────────────────────
  {
    id: "atk_bulwark", name: "Bulwark", type: "attack", rarity: "common", cost: 1,
    classId: "sheriff",
    effects: ["healNow+10"],
    flavorText: "The badge keeps you upright.",
  },
  {
    id: "atk_lawmans_stand", name: "Lawman's Stand", type: "attack", rarity: "uncommon", cost: 2,
    classId: "sheriff",
    effects: ["hpAfterCycle+10", "accShootout+0.05"],
    flavorText: "Plant your boots. Don't blink.",
  },
  {
    id: "atk_towns_strength", name: "Town's Strength", type: "attack", rarity: "uncommon", cost: 2,
    classId: "sheriff",
    effects: ["damageShootout+0.25"],
    flavorText: "The street stands behind you.",
  },
  {
    id: "atk_heavy_iron", name: "Heavy Iron", type: "attack", rarity: "common", cost: 2,
    classId: "sheriff",
    effects: ["damage+3"],
    flavorText: "Weight in the hand. Weight in the shot.",
  },
  {
    id: "atk_iron_resolve", name: "Iron Resolve", type: "attack", rarity: "uncommon", cost: 2,
    classId: "sheriff",
    effects: ["healNow+5", "accShootout+0.05"],
    flavorText: "He bleeds. He keeps walking.",
  },
  {
    id: "atk_bullet_proof", name: "Bullet-Proof", type: "feat", rarity: "rare", cost: 3,
    classId: "sheriff",
    effects: ["dodgeRecv+0.3"],
    flavorText: "Lead finds the air around him, not him.",
  },
  {
    id: "atk_star_of_justice", name: "Star of Justice", type: "attack", rarity: "legendary", cost: 4,
    classId: "sheriff",
    effects: ["damagePerHp+10"],
    flavorText: "Every breath in him is a bullet.",
    backstory: "The badge a man wears to his last breath shines brightest the longer he holds it.",
  },

  // ── APACHE TRACKER: SPIRIT WALKER ────────────────────────────────────────
  {
    id: "atk_wind_whisper", name: "Wind Whisper", type: "attack", rarity: "common", cost: 1,
    classId: "apache_tracker",
    effects: ["spirit+1", "gainFocused"],
    flavorText: "The wind tells you where to look.",
  },
  {
    id: "atk_spirit_talk", name: "Spirit Talk", type: "attack", rarity: "common", cost: 1,
    classId: "apache_tracker",
    effects: ["spirit+2"],
    flavorText: "Listen first. The dead have things to say.",
  },
  {
    id: "atk_owls_vision", name: "Owl's Vision", type: "attack", rarity: "uncommon", cost: 2,
    classId: "apache_tracker",
    effects: ["spiritScaleAcc+0.04"],
    flavorText: "Night becomes a corridor of moonlight.",
  },
  {
    id: "atk_coyotes_curse", name: "Coyote's Curse", type: "attack", rarity: "uncommon", cost: 2,
    classId: "apache_tracker",
    effects: ["spiritScaleEnemyAcc-0.04"],
    flavorText: "Their hand shakes; they don't know why.",
  },
  {
    id: "atk_eagles_strike", name: "Eagle's Strike", type: "attack", rarity: "rare", cost: 3,
    classId: "apache_tracker",
    effects: ["spiritScaleDamage+0.08"],
    flavorText: "From above, the killing distance.",
  },
  {
    id: "atk_bear_spirit", name: "Bear Spirit", type: "feat", rarity: "uncommon", cost: 2,
    classId: "apache_tracker",
    effects: ["spirit+1", "dodgeRecv+0.2"],
    flavorText: "Old hide, old patience.",
  },
  {
    id: "atk_spirit_walk", name: "Spirit Walk", type: "attack", rarity: "uncommon", cost: 1,
    classId: "apache_tracker",
    effects: ["spirit+3", "hpAfterCycle-5"],
    flavorText: "A piece of you crosses over to know.",
  },
  {
    id: "atk_great_spirit_bond", name: "Great Spirit Bond", type: "attack", rarity: "legendary", cost: 4,
    classId: "apache_tracker",
    effects: ["spirit+5", "spiritDoubleNext"],
    flavorText: "All ancestors at once.",
    backstory: "The tracker's name forgotten — he becomes only the song the wind has always sung.",
  },

  // ── BOUNTY HUNTER: BLOOD FOR LEAD ────────────────────────────────────────
  {
    id: "atk_blood_for_lead", name: "Blood for Lead", type: "attack", rarity: "common", cost: 1,
    classId: "bounty_hunter",
    effects: ["payHp+5", "damage+3"],
    flavorText: "A pint paid, a coffin earned.",
  },
  {
    id: "atk_vendetta_shot", name: "Vendetta Shot", type: "attack", rarity: "uncommon", cost: 1,
    classId: "bounty_hunter",
    effects: ["payHp+10", "damage+5", "accShootout+0.1", "bullets+1"],
    flavorText: "He owes you in blood. Pay first.",
  },
  {
    id: "atk_reckless_aim", name: "Reckless Aim", type: "attack", rarity: "uncommon", cost: 2,
    classId: "bounty_hunter",
    effects: ["payHp+10", "bullets+2"],
    flavorText: "Eyes open, ribs bare.",
  },
  {
    id: "atk_last_bullet", name: "Last Bullet", type: "attack", rarity: "rare", cost: 2,
    classId: "bounty_hunter",
    effects: ["payHp+15", "firstHitsAuto+2"],
    flavorText: "If it's the last one, it lands.",
  },
  {
    id: "atk_bloodlust", name: "Bloodlust", type: "attack", rarity: "uncommon", cost: 2,
    classId: "bounty_hunter",
    effects: ["damageShootout+0.4", "bullets+2"],
    flavorText: "The closer he is to death, the louder he laughs.",
  },
  {
    id: "atk_no_tomorrow", name: "No Tomorrow", type: "attack", rarity: "rare", cost: 3,
    classId: "bounty_hunter",
    effects: ["payHp+20", "damageShootout+0.5", "accShootout+0.3"],
    flavorText: "Tomorrow is a problem for someone else.",
  },
  {
    id: "atk_quickdraw_master", name: "Quickdraw Master", type: "attack", rarity: "legendary", cost: 4,
    classId: "bounty_hunter",
    effects: ["payHp+25", "firstHitsAuto+5", "accShootout+0.4"],
    flavorText: "First, last, only.",
    backstory: "He's never drawn second. He's never drawn third. He doesn't know how it ends.",
  },

  // ── OUTLAW: TWIN COMBOS ───────────────────────────────────────────────────
  {
    id: "atk_pistol_whip", name: "Pistol Whip", type: "attack", rarity: "common", cost: 1,
    classId: "outlaw", outlawCombo: true,
    effects: ["damage+2", "comboBonus:damage+2"],
    flavorText: "Steel kisses cheek.",
  },
  {
    id: "atk_roll_the_dice", name: "Roll the Dice", type: "attack", rarity: "common", cost: 1,
    classId: "outlaw", outlawCombo: true,
    effects: ["accShootout+0.1", "comboBonus:accShootout+0.2"],
    flavorText: "Double or nothing.",
  },
  {
    id: "atk_dust_em_up", name: "Dust 'em Up", type: "attack", rarity: "common", cost: 1,
    classId: "outlaw", outlawCombo: true,
    effects: ["enemyAccNext-0.1", "comboBonus:enemyAccNext-0.1"],
    flavorText: "A dirty trick is still a trick.",
  },
  {
    id: "atk_wild_volley", name: "Wild Volley", type: "attack", rarity: "uncommon", cost: 2,
    classId: "outlaw", outlawCombo: true,
    effects: ["bullets+2", "comboBonus:bullets+1"],
    flavorText: "Empty the chamber. Apologize never.",
  },
  {
    id: "atk_crooked_smile", name: "Crooked Smile", type: "attack", rarity: "uncommon", cost: 2,
    classId: "outlaw", outlawCombo: true,
    effects: ["enemyBullets-2", "comboBonus:enemyBullets-1"],
    flavorText: "He laughs while he steals your shells.",
  },
  {
    id: "atk_hot_lead", name: "Hot Lead", type: "attack", rarity: "uncommon", cost: 2,
    classId: "outlaw", outlawCombo: true,
    effects: ["damage+1", "comboBonus:damage+2"],
    flavorText: "The barrel still smokes from the last one.",
  },
  {
    id: "atk_outlaws_pact", name: "Outlaw's Pact", type: "attack", rarity: "uncommon", cost: 1,
    classId: "outlaw", outlawCombo: true,
    effects: ["nextComboFree"],
    flavorText: "Spit on your palm. Shake.",
  },
  {
    id: "atk_gunslingers_tempo", name: "Gunslinger's Tempo", type: "attack", rarity: "common", cost: 1,
    classId: "outlaw", outlawCombo: true,
    effects: ["accShootout+0.05", "comboBonus:bullets+1"],
    flavorText: "One-two. Two-one. Always two.",
  },
  {
    id: "atk_no_honor", name: "No Honor Among Thieves", type: "attack", rarity: "legendary", cost: 4,
    classId: "outlaw", outlawCombo: true,
    effects: ["extraVolleyShots+1"],
    flavorText: "Every betrayal earns a bullet.",
    backstory: "The outlaw code was written by the fastest gun. Rewritten by the next one.",
  },

  // ── STARE-DOWN CARDS ──────────────────────────────────────────────────────
  // Marshal stare-downs
  {
    id: "std_federal_stare", name: "Federal Stare", type: "attack", rarity: "rare", cost: 0,
    classId: "marshal",
    effects: ["markEnemy+3", "staredownOnly"],
    flavorText: "He's on a list before he draws.",
  },
  {
    id: "std_cold_stare", name: "Cold Stare", type: "feat", rarity: "uncommon", cost: 0,
    classId: "marshal",
    effects: ["accShootout+0.20", "staredownOnly"],
    flavorText: "No badge needed for that look.",
  },
  // Vaquero stare-downs
  {
    id: "std_twin_stance", name: "Twin Stance", type: "feat", rarity: "uncommon", cost: 0,
    classId: "vaquero",
    effects: ["accShootout+0.15", "staredownOnly"],
    flavorText: "Two pistols, one breath.",
  },
  {
    id: "std_hot_blood", name: "Hot Blood", type: "feat", rarity: "rare", cost: 0,
    classId: "vaquero",
    effects: ["damageShootout+0.25", "staredownOnly"],
    flavorText: "Mescal in the veins.",
  },
  // Sheriff stare-downs
  {
    id: "std_last_stand_eye", name: "Last Stand Stare", type: "feat", rarity: "rare", cost: 0,
    classId: "sheriff",
    effects: ["firstHitsAuto+2", "staredownOnly"],
    flavorText: "The badge does not blink.",
  },
  {
    id: "std_tin_star", name: "Tin Star", type: "feat", rarity: "uncommon", cost: 0,
    classId: "sheriff",
    effects: ["healNow+10", "staredownOnly"],
    flavorText: "It catches the sun. It catches the eye.",
  },
  // Apache stare-downs
  {
    id: "std_spirit_stare", name: "Spirit Stare", type: "attack", rarity: "uncommon", cost: 0,
    classId: "apache_tracker",
    effects: ["spirit+2", "staredownOnly"],
    flavorText: "Eyes that see two worlds.",
  },
  {
    id: "std_wind_read", name: "Wind Read", type: "feat", rarity: "rare", cost: 0,
    classId: "apache_tracker",
    effects: ["enemyAccNext-0.20", "staredownOnly"],
    flavorText: "He reads the air. The air tells him.",
  },
  // Bounty Hunter stare-downs
  {
    id: "std_quickdraw_eye", name: "Quickdraw Stare", type: "feat", rarity: "rare", cost: 0,
    classId: "bounty_hunter",
    effects: ["firstHitsAuto+1", "staredownOnly"],
    flavorText: "First, fast, final.",
  },
  {
    id: "std_vendetta_eye", name: "Vendetta Eye", type: "feat", rarity: "rare", cost: 0,
    classId: "bounty_hunter",
    effects: ["damageShootout+0.30", "staredownOnly"],
    flavorText: "He remembers your face. All of it.",
  },
  // Outlaw stare-downs
  {
    id: "std_outlaw_stare", name: "Outlaw Stare", type: "feat", rarity: "rare", cost: 0,
    classId: "outlaw",
    effects: ["bullets+1", "accShootout+0.10", "staredownOnly"],
    flavorText: "He won't say his name. Doesn't have to.",
  },
  {
    id: "std_dirty_stare", name: "Dirty Stare", type: "feat", rarity: "uncommon", cost: 0,
    classId: "outlaw",
    effects: ["enemyBullets-2", "staredownOnly"],
    flavorText: "He knows where you keep your shells.",
  },

  {
    id: "std_dead_eye",
    name: "Dead Eye",
    type: "attack",
    rarity: "rare",
    cost: 0,
    effects: ["accShootout+0.20", "staredownOnly"],
    flavorText: "Patience is its own kind of violence.",
  },
  {
    id: "std_warning_shot",
    name: "Warning Shot",
    type: "feat",
    rarity: "uncommon",
    cost: 0,
    effects: ["enemyAccNext-0.20", "enemyBullets-1", "staredownOnly"],
    flavorText: "The next one won't miss on purpose.",
  },
  {
    id: "std_iron_will",
    name: "Iron Will",
    type: "feat",
    rarity: "uncommon",
    cost: 0,
    effects: ["gainFocused", "focusBonusBullets+1", "staredownOnly"],
    flavorText: "Still hands, cold blood.",
  },
  {
    id: "std_marked_man",
    name: "Marked Man",
    type: "attack",
    rarity: "rare",
    cost: 0,
    effects: ["markEnemy+2", "markBurst+2", "staredownOnly"],
    flavorText: "They've been dead since you laid eyes on them.",
  },
];

// Append derived gun cards to CARD_DEFINITIONS so the rest of the system
// (deck building, card rendering, getCardDef, etc.) treats guns uniformly.
for (const g of GUNS_LIST) {
  CARD_DEFINITIONS.push({
    id: g.id,
    name: g.name,
    type: "gun",
    rarity: g.rarity,
    cost: g.cost,
    effects: g.effects ?? [],
    flavorText: g.flavor,
    backstory: g.backstory ?? null,
    classId: g.classId ?? null,
    gunStats: { mag: g.mag, damage: g.damage, accuracy: g.accuracy },
  });
}

const byId = new Map(CARD_DEFINITIONS.map((c) => [c.id, c]));

export function getCardDef(id) {
  return byId.get(id);
}

export function cloneCardInstance(id) {
  const d = getCardDef(id);
  if (!d) return null;
  return { ...d, uid: `${id}_${Math.random().toString(36).slice(2, 9)}` };
}

export function parseEffect(token) {
  const m = token.match(/^([a-zA-Z_]+)([+-]\d+(?:\.\d+)?)?$/);
  if (!m) return { kind: token, value: true };
  const kind = m[1];
  const raw = m[2];
  if (raw == null || raw === "") return { kind, value: true };
  const value = raw.includes(".") ? parseFloat(raw) : parseInt(raw, 10);
  return { kind, value };
}

/** Returns all cards matching the given rarity. */
export function getCardsByRarity(rarity) {
  return CARD_DEFINITIONS.filter((c) => c.rarity === rarity);
}

/** Returns all cards of the given type. */
export function getCardsByType(type) {
  return CARD_DEFINITIONS.filter((c) => c.type === type);
}
