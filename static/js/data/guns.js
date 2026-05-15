/**
 * Unified gun system.
 *
 * A gun is a persistent in-duel equipment that lives in the deck as a "gun"
 * card. Playing it during a duel sets the player's active gun (replacing any
 * previous one). Effects persist for the rest of the duel until swapped.
 *
 * @typedef {'common'|'uncommon'|'rare'|'epic'|'legendary'} GunRarity
 *
 * @typedef {Object} Gun
 * @property {string} id
 * @property {string} name
 * @property {GunRarity} rarity
 * @property {string|null} classId   // null = generic, available to any class
 * @property {number} mag
 * @property {number} damage
 * @property {number} accuracy
 * @property {number} cost            // focus cost to play
 * @property {'pistol'|'revolver'|'rifle'|'carbine'|'bow'|'shotgun'|'special'} [weaponType]
 * @property {string[]} effects       // tokens parsed by cards.js parseEffect
 * @property {string} flavor          // always shown
 * @property {string} [backstory]     // only on epic/legendary
 * @property {boolean} [opponentOnly] // true = never offered to the player
 */

/** @type {Gun[]} */
export const GUNS_LIST = [
  // ── OUTLAW (dirty / sawn-off) ─────────────────────────────────────────────
  {
    id: "gun_volcanic_pistol",
    name: "Volcanic Pistol",
    rarity: "uncommon",
    classId: "outlaw",
    mag: 7, damage: 8, accuracy: 0.55, cost: 2,
    effects: ["bullets+1", "damage-1"],
    flavor: "More lead, less aim.",
  },
  {
    id: "gun_sawed_off_coach",
    name: "Coachline Repeater",
    rarity: "epic",
    classId: "outlaw",
    weaponType: "carbine",
    mag: 6, damage: 12, accuracy: 0.56, cost: 3,
    effects: ["bullets+2", "damage+2", "accShootout-0.05"],
    flavor: "Stolen repeater, short temper.",
    backstory: "Lifted from a Wells Fargo escort chest and cut for speed, not spread. Fast lever, dirty work.",
  },
  {
    id: "gun_jesse_schofield",
    name: "Jesse James' Schofield",
    rarity: "legendary",
    classId: "outlaw",
    mag: 6, damage: 12, accuracy: 0.66, cost: 4,
    effects: ["bullets+1", "damage+2", "accShootout+0.10"],
    flavor: "The James gang's hand cannon.",
    backstory: "Recovered from the floorboards of 1318 Lafayette Street, St. Joseph, Missouri, the morning Bob Ford put a bullet behind Jesse's ear, April 3rd, 1882.",
  },

  // ── APACHE TRACKER (rifles / bows) ────────────────────────────────────────
  {
    id: "gun_henry_repeater",
    name: "Henry Repeater",
    rarity: "uncommon",
    classId: "apache_tracker",
    mag: 8, damage: 9, accuracy: 0.60, cost: 2,
    effects: ["bullets+2", "accShootout+0.05"],
    flavor: "Loaded on Sunday, fires all week.",
  },
  {
    id: "gun_sharps_buffalo",
    name: "Sharps Buffalo Rifle",
    rarity: "epic",
    classId: "apache_tracker",
    mag: 3, damage: 22, accuracy: 0.70, cost: 3,
    effects: ["damage+5", "accShootout+0.10", "pierce"],
    flavor: "One shot, one carcass.",
    backstory: "Sharps Rifle Manufacturing Co., 1874 — the .50-caliber that buried the buffalo herd in a single decade. Its boom carries a mile.",
  },
  {
    id: "gun_cochise_bow",
    name: "Cochise's War Bow",
    rarity: "legendary",
    classId: "apache_tracker",
    mag: 5, damage: 11, accuracy: 0.75, cost: 3,
    effects: ["accShootout+0.15", "firstHitsAuto+1", "markBurst+2"],
    flavor: "Silent, certain, never traded.",
    backstory: "Sinew-strung yew of the Chiricahua war chief. Carried through every parley with the bluecoats, drawn at none — and never surrendered.",
  },

  // ── U.S. MARSHAL (fancy pistols) ──────────────────────────────────────────
  {
    id: "gun_colt_saa",
    name: "Colt Single Action Army",
    rarity: "uncommon",
    classId: "marshal",
    mag: 6, damage: 10, accuracy: 0.65, cost: 2,
    effects: ["accShootout+0.08"],
    flavor: "The Peacemaker, factory-fresh.",
  },
  {
    id: "gun_sw_schofield_3",
    name: "Smith & Wesson Schofield No. 3",
    rarity: "epic",
    classId: "marshal",
    mag: 6, damage: 11, accuracy: 0.68, cost: 3,
    effects: ["bullets+1", "accShootout+0.10", "focusBonusAcc+0.10"],
    flavor: "Top-break, top-shelf.",
    backstory: "Smith & Wesson Model 3, 1875, modified to Major George Schofield's specifications. The U.S. Cavalry's iron of choice — until the .45 Long Colt won the contract.",
  },
  {
    id: "gun_hickok_navy",
    name: "Wild Bill's Navy Colt",
    rarity: "legendary",
    classId: "marshal",
    mag: 6, damage: 13, accuracy: 0.72, cost: 4,
    effects: ["accShootout+0.15", "damage+2", "markBurst+3"],
    flavor: "Aces and eights.",
    backstory: "James Butler Hickok's 1851 Navy, ivory-gripped, butt-forward. He carried it the afternoon of August 2nd, 1876, in Saloon No. 10, Deadwood — the day the dead man's hand was named.",
  },

  // ── VAQUERO (ornate pistols) ──────────────────────────────────────────────
  {
    id: "gun_remington_1875",
    name: "Remington Model 1875",
    rarity: "uncommon",
    classId: "vaquero",
    mag: 6, damage: 11, accuracy: 0.60, cost: 2,
    effects: ["damage+1", "accShootout+0.05"],
    flavor: "Brass-fitted, kept oiled.",
  },
  {
    id: "gun_lemat",
    name: "LeMat Dragoon",
    rarity: "epic",
    classId: "vaquero",
    weaponType: "revolver",
    mag: 9, damage: 11, accuracy: 0.57, cost: 3,
    effects: ["bullets+2", "damage+2"],
    flavor: "Nine chambers, no hesitation.",
    backstory: "Dr. Jean Alexandre LeMat's nine-shot cavalry iron, born in New Orleans in 1855 and carried hard through saddle wars.",
  },
  {
    id: "gun_villa_mauser",
    name: "Villa's Mauser C96",
    rarity: "legendary",
    classId: "vaquero",
    mag: 10, damage: 12, accuracy: 0.62, cost: 4,
    effects: ["bullets+4", "accShootout+0.05", "damageShootout+0.15"],
    flavor: "El broomhandle del general.",
    backstory: "Pancho Villa's Mauser C96, the broomhandle that crossed the Rio Grande at Columbus, New Mexico, March 9th, 1916. It came back. He didn't.",
  },

  // Vaquero off-hand iron — paired with primary for dual-wield builds
  {
    id: "gun_offhand_iron",
    name: "Off-Hand Iron",
    rarity: "common",
    classId: "vaquero",
    mag: 4, damage: 6, accuracy: 0.55, cost: 2,
    effects: [],
    flavor: "Lighter, looser, leftward.",
    dualWield: true,
  },

  // ── BOUNTY HUNTER (small / concealed) ─────────────────────────────────────
  {
    id: "gun_derringer_41",
    name: ".41 Derringer",
    rarity: "uncommon",
    classId: "bounty_hunter",
    mag: 2, damage: 14, accuracy: 0.72, cost: 2,
    effects: ["pierce", "firstHitsAuto+1"],
    flavor: "Two shots from a sleeve.",
  },
  {
    id: "gun_pepperbox",
    name: "Pepperbox Revolver",
    rarity: "epic",
    classId: "bounty_hunter",
    mag: 6, damage: 8, accuracy: 0.62, cost: 3,
    effects: ["bullets+2", "firstHitsAuto+2"],
    flavor: "Six barrels, six chances.",
    backstory: "Allen & Thurber of Worcester, Massachusetts, patented 1837. No need to aim long when the whole front of the gun is the muzzle.",
  },
  {
    id: "gun_doc_hideout",
    name: "Doc Holliday's Hideout",
    rarity: "legendary",
    classId: "bounty_hunter",
    mag: 2, damage: 18, accuracy: 0.80, cost: 4,
    effects: ["pierce", "firstHitsAuto+2", "accShootout+0.10"],
    flavor: "Drawn from a dentist's vest.",
    backstory: "John Henry Holliday's nickel-plated Colt House Pistol, palmed from his waistcoat at the O.K. Corral, October 26th, 1881. Tubercular cough, steady hand.",
  },

  // ── SHERIFF (shotgun specialist) ───────────────────────────────────────────
  {
    id: "gun_peacemaker",
    name: "Town Guard Scattergun",
    rarity: "uncommon",
    classId: "sheriff",
    weaponType: "shotgun",
    mag: 2, damage: 24, accuracy: 0.40, cost: 2,
    effects: ["damage+4"],
    flavor: "Short barrel, long consequences.",
  },
  {
    id: "gun_winchester_1887",
    name: "Winchester 1887",
    rarity: "epic",
    classId: "sheriff",
    weaponType: "shotgun",
    mag: 3, damage: 32, accuracy: 0.40, cost: 3,
    effects: ["damage+6", "ricochet"],
    flavor: "The lever clacks. The street ducks.",
    backstory: "John Moses Browning's lever-action shotgun, 1887, made for Winchester at Oliver Winchester's request. The clack of its action ended more saloon arguments than any judge.",
  },
  {
    id: "gun_masterson_colt",
    name: "Masterson's Thunderer",
    rarity: "legendary",
    classId: "sheriff",
    weaponType: "shotgun",
    mag: 4, damage: 38, accuracy: 0.40, cost: 4,
    effects: ["damage+8", "firstHitsAuto+1", "hpAfterShootout+5"],
    flavor: "Special order. Final warning.",
    backstory: "Bartholomew W. Masterson wrote to Colt's Hartford works, July 1885: 'a special grip of gutta-percha, easy on the trigger.' Dodge City, Tombstone, and finally a desk at the New York Morning Telegraph.",
  },

  // ── ENEMY-ONLY ROSTER GUNS ───────────────────────────────────────────────
  {
    id: "gun_enemy_deputy_peashooter",
    name: "Deputy's Peashooter",
    rarity: "common", classId: null, opponentOnly: true,
    mag: 4, damage: 7, accuracy: 0.48, cost: 1,
    effects: [],
    flavor: "Issued with a badge still warmer than the hand that wears it.",
  },
  {
    id: "gun_enemy_quickstep_colt",
    name: "Quickstep Colt",
    rarity: "common", classId: null, opponentOnly: true,
    mag: 5, damage: 8, accuracy: 0.56, cost: 1,
    effects: ["accShootout+0.04"],
    flavor: "Polished for the stage, drawn for the alley.",
  },
  {
    id: "gun_enemy_marshal_graves_iron",
    name: "Graves' Town Iron",
    rarity: "uncommon", classId: null, opponentOnly: true,
    mag: 6, damage: 9, accuracy: 0.58, cost: 2,
    effects: ["damage+1", "accShootout+0.04"],
    flavor: "Heavy enough to settle ordinances.",
  },
  {
    id: "gun_enemy_barrel_guard_blunder",
    name: "Barrel Guard Blunderbuss",
    rarity: "common", classId: null, opponentOnly: true,
    mag: 4, damage: 11, accuracy: 0.45, cost: 1,
    effects: ["damage+2", "accShootout-0.04"],
    flavor: "A sawed mouth of iron and spilled mash.",
  },
  {
    id: "gun_enemy_moonshine_pistol",
    name: "Moonshine Runner's Pistol",
    rarity: "uncommon", classId: null, opponentOnly: true,
    mag: 6, damage: 9, accuracy: 0.60, cost: 2,
    effects: ["bullets+1"],
    flavor: "Wrapped in flour sack cloth to keep the still smoke off.",
  },
  {
    id: "gun_enemy_stillhouse_repeater",
    name: "Stillhouse Repeater",
    rarity: "rare", classId: null, opponentOnly: true,
    mag: 7, damage: 10, accuracy: 0.58, cost: 3,
    effects: ["bullets+2", "damage+1"],
    flavor: "Its lever clacks like a tax collector's knuckles.",
  },
  {
    id: "gun_enemy_lookout_carbine",
    name: "Lookout's Carbine",
    rarity: "uncommon", classId: null, opponentOnly: true,
    mag: 5, damage: 10, accuracy: 0.62, cost: 2,
    effects: ["accShootout+0.05"],
    flavor: "Short barrel, long canyon.",
  },
  {
    id: "gun_enemy_switchback_schofield",
    name: "Switchback Schofield",
    rarity: "rare", classId: null, opponentOnly: true,
    mag: 6, damage: 11, accuracy: 0.64, cost: 3,
    effects: ["damage+1", "accShootout+0.06"],
    flavor: "The cylinder opens as neatly as a trap.",
  },
  {
    id: "gun_enemy_red_jack_dragoon",
    name: "Red Jack's Dragoon",
    rarity: "epic", classId: null, opponentOnly: true,
    mag: 7, damage: 12, accuracy: 0.63, cost: 4,
    effects: ["bullets+2", "damage+2"],
    flavor: "Too large for grace, too loud for mercy.",
    backstory: "Cut down from an old Colt Dragoon and inlaid with teeth Red Jack swears were already loose.",
  },
  {
    id: "gun_enemy_hollow_hank_rusted_iron",
    name: "Hollow Hank's Rusted Iron",
    rarity: "rare", classId: null, opponentOnly: true,
    mag: 5, damage: 13, accuracy: 0.42, cost: 3,
    effects: ["damage+3", "accShootout-0.08"],
    flavor: "The barrel smells like creek mud and coffin nails.",
  },
  {
    id: "gun_enemy_marrow_duelist_navy",
    name: "Marrow Navy",
    rarity: "epic", classId: null, opponentOnly: true,
    mag: 6, damage: 12, accuracy: 0.57, cost: 4,
    effects: ["dodgeRecv+0.05", "returnBulletOnHit+1"],
    flavor: "It clicks once for the living and twice for the dead.",
    backstory: "A Navy Colt pried from a flooded grave, its ivory grip yellowed like old bone.",
  },
  {
    id: "gun_enemy_gravesmoke_remington",
    name: "Gravesmoke Remington",
    rarity: "legendary", classId: null, opponentOnly: true,
    mag: 7, damage: 13, accuracy: 0.60, cost: 5,
    effects: ["damage+2", "returnBulletOnHit+1", "pierce"],
    flavor: "Black powder rolls from it even before the trigger moves.",
    backstory: "Silas carried it into the grave. The grave gave it back with interest.",
  },
  {
    id: "gun_enemy_velvet_ace_dueling_colt",
    name: "Velvet Ace Dueling Colt",
    rarity: "epic", classId: null, opponentOnly: true,
    mag: 6, damage: 12, accuracy: 0.72, cost: 4,
    effects: ["accShootout+0.10", "firstHitsAuto+1"],
    flavor: "Soft holster, hard manners.",
    backstory: "Dahlia's table stake, won from a railroad heir who learned not to call a lady's bluff.",
  },
  {
    id: "gun_enemy_ace_high_schofield",
    name: "Ace-High Schofield",
    rarity: "legendary", classId: null, opponentOnly: true,
    mag: 7, damage: 13, accuracy: 0.76, cost: 5,
    effects: ["accShootout+0.12", "bullets+1", "firstHitsAuto+1"],
    flavor: "Famous enough to have its own obituary column.",
    backstory: "The nickel Schofield Caleb raises for portraits and lowers for funerals.",
  },
  {
    id: "gun_enemy_blackthorn_last_word",
    name: "Blackthorn's Last Word",
    rarity: "legendary", classId: null, opponentOnly: true,
    mag: 8, damage: 15, accuracy: 0.78, cost: 5,
    effects: ["accShootout+0.15", "damage+3", "firstHitsAuto+2", "pierce"],
    flavor: "The verdict arrives before the report.",
    backstory: "A custom revolver with a judge's gavel carved into the grip and a hangman's knot etched under the barrel.",
  },

  // ── GENERIC POOL (12 guns: 3/3/3/2/1) ─────────────────────────────────────

  // common (3)
  {
    id: "gun_pocket_pistol",
    name: "Pocket Pistol",
    rarity: "common", classId: null,
    mag: 4, damage: 8, accuracy: 0.58, cost: 1,
    effects: ["bullets+1"],
    flavor: "Cheap iron — two shots better than none.",
  },
  {
    id: "gun_service_revolver",
    name: "Service Revolver",
    rarity: "common", classId: null,
    mag: 6, damage: 9, accuracy: 0.60, cost: 1,
    effects: [],
    flavor: "Issued, oiled, forgotten.",
  },
  {
    id: "gun_trappers_carbine",
    name: "Trapper's Carbine",
    rarity: "common", classId: null,
    mag: 5, damage: 11, accuracy: 0.55, cost: 1,
    effects: ["damage+1"],
    flavor: "Smells of pine pitch and powder.",
  },

  // uncommon (3)
  {
    id: "gun_long_barrel_colt",
    name: "Long-Barrel Colt",
    rarity: "uncommon", classId: null,
    mag: 6, damage: 10, accuracy: 0.68, cost: 2,
    effects: ["accShootout+0.10", "bullets-1"],
    flavor: "Slow to draw, sure to land.",
  },
  {
    id: "gun_twin_barrel_derringer",
    name: "Twin-Barrel Derringer",
    rarity: "uncommon", classId: null,
    mag: 2, damage: 13, accuracy: 0.65, cost: 2,
    effects: ["firstHitsAuto+1", "damage+1"],
    flavor: "Two chances. That's the wager.",
  },
  {
    id: "gun_cavalry_pistol",
    name: "Cavalry Pistol",
    rarity: "uncommon", classId: null,
    mag: 5, damage: 10, accuracy: 0.60, cost: 2,
    effects: ["bullets+1", "damage+1"],
    flavor: "Saber bracket still bolted under the barrel.",
  },

  // rare (3)
  {
    id: "gun_marksmans_iron",
    name: "Marksman's Iron",
    rarity: "rare", classId: null,
    mag: 5, damage: 11, accuracy: 0.72, cost: 3,
    effects: ["accShootout+0.20", "focusBonusAcc+0.10"],
    flavor: "Crosshair etched by a watchmaker's hand.",
  },
  {
    id: "gun_knuckle_revolver",
    name: "Knuckle Revolver",
    rarity: "rare", classId: null,
    mag: 5, damage: 13, accuracy: 0.58, cost: 3,
    effects: ["damage+3", "accShootout-0.05"],
    flavor: "Pistol-whip if it jams.",
  },
  {
    id: "gun_quickdraw_iron",
    name: "Quick-Draw Iron",
    rarity: "rare", classId: null,
    mag: 6, damage: 9, accuracy: 0.62, cost: 3,
    effects: ["bullets+2", "firstHitsAuto+1"],
    flavor: "Greased leather, hair trigger.",
  },

  // epic (2)
  {
    id: "gun_gatling_sidearm",
    name: "Gatling Sidearm",
    rarity: "epic", classId: null,
    mag: 12, damage: 7, accuracy: 0.50, cost: 4,
    effects: ["bullets+5", "accShootout-0.05", "damage-1"],
    flavor: "Hand-cranked storm of lead.",
    backstory: "Dr. Richard Jordan Gatling's 1862 patent, shrunk to fit a holster by an Indianapolis machinist who never sold a legal one.",
  },
  {
    id: "gun_volcanic_repeater",
    name: "Volcanic Repeating Pistol",
    rarity: "epic", classId: null,
    mag: 10, damage: 9, accuracy: 0.60, cost: 4,
    effects: ["bullets+3", "accShootout+0.05"],
    flavor: "Rocket Ball ammunition, lever-fed.",
    backstory: "Volcanic Repeating Arms Co., 1855. Horace Smith and Daniel B. Wesson's first venture, before they put rims on the cartridges and changed the world.",
  },

  // legendary (1)
  {
    id: "gun_high_noon",
    name: "The High Noon",
    rarity: "legendary", classId: null,
    mag: 6, damage: 14, accuracy: 0.75, cost: 5,
    effects: ["damage+3", "accShootout+0.15", "markBurst+2", "pierce"],
    flavor: "The gun the corridos sing of.",
    backstory: "Forged at the Brazos River from a single ingot of meteor iron, or so the corrido goes. They say it was the gun that shot the sun down at noon, leaving only midday and midnight.",
  },
];

/** id → Gun lookup. */
export const GUNS = Object.fromEntries(GUNS_LIST.map((g) => [g.id, g]));

/** Default-ish fallback used by old save data; first generic common. */
export const FALLBACK_GUN_ID = "gun_service_revolver";

export function getGun(id) {
  return GUNS[id] ?? GUNS[FALLBACK_GUN_ID];
}

/** Guns playable by a given class id (class-locked + generic). */
export function gunsForClass(classId) {
  return GUNS_LIST.filter((g) => !g.opponentOnly && (g.classId === null || g.classId === classId));
}

/** Returns the uncommon class-locked starter gun id for a class. */
export function starterGunIdForClass(classId) {
  const g = GUNS_LIST.find((g) => g.classId === classId && g.rarity === "uncommon");
  return g ? g.id : FALLBACK_GUN_ID;
}
