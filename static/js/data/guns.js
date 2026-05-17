/**
 * Unified gun system.
 *
 * A gun is in-duel equipment that can live in the deck as a "gun" card.
 * Playing it during a duel sets the player's active gun for that duel only
 * (replacing any previous one). The next duel starts from the class starter gun
 * again until another gun card is played.
 *
 * @typedef {'common'|'uncommon'|'rare'|'epic'|'legendary'} GunRarity
 *
 * @typedef {Object} Gun
 * @property {string} id
 * @property {string} name
 * @property {GunRarity} rarity
 * @property {string|null} classId   // null = generic, available to any class
 * @property {number} mag             // legacy volley magazine
 * @property {number} damage          // legacy volley damage
 * @property {number} accuracy        // legacy volley accuracy
 * @property {number} capacity        // loaded-bullet capacity in the combat rework
 * @property {number} startLoaded     // bullets loaded at duel start
 * @property {number} bulletDamage    // deterministic damage per loaded bullet
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
    mag: 6, damage: 9, accuracy: 0.56, cost: 2,
    effects: [],
    flavor: "Cheap iron, cheap shot. Enough to get started.",
  },
  {
    id: "gun_sawed_off_coach",
    name: "Coachline Repeater",
    rarity: "epic",
    classId: "outlaw",
    weaponType: "carbine",
    mag: 4, damage: 10, accuracy: 0.55, cost: 3,
    effects: ["accShootout-0.05", "extraVolleyShots+1"],
    flavor: "Stolen repeater, short temper, faster encore.",
    backstory: "Lifted from a Wells Fargo escort chest and cut for speed, not spread. Fast lever, dirty work.",
  },
  {
    id: "gun_jesse_schofield",
    name: "Jesse James' Schofield",
    rarity: "legendary",
    classId: "outlaw",
    mag: 4, damage: 12, accuracy: 0.62, cost: 4,
    effects: ["accShootout+0.06", "firstHitsAuto+1", "extraVolleyShots+1"],
    flavor: "The James gang's hand cannon. It finishes what the combo starts.",
    backstory: "Recovered from the floorboards of 1318 Lafayette Street, St. Joseph, Missouri, the morning Bob Ford put a bullet behind Jesse's ear, April 3rd, 1882.",
  },

  // ── APACHE TRACKER (rifles / bows) ────────────────────────────────────────
  {
    id: "gun_henry_repeater",
    name: "Henry Repeater",
    rarity: "uncommon",
    classId: "apache_tracker",
    weaponType: "rifle",
    mag: 8, damage: 10, accuracy: 0.63, cost: 2,
    effects: [],
    flavor: "A steady rifle for reading distance before the wind turns.",
  },
  {
    id: "gun_mescalero_bow",
    name: "Mescalero War Bow",
    rarity: "rare",
    classId: "apache_tracker",
    weaponType: "bow",
    mag: 6, damage: 11, accuracy: 0.70, cost: 2,
    effects: ["firstHitsAuto+1", "dodgeRecv+1", "spiritScaleDamage+0.02", "spiritScaleEnemyAcc-0.01"],
    flavor: "Quiet string, close shadow.",
    backstory: "Horn, sinew, and ash bound for silent work where a rifle report would wake the ridge.",
  },
  {
    id: "gun_sharps_buffalo",
    name: "Sharps Buffalo Rifle",
    rarity: "epic",
    classId: "apache_tracker",
    weaponType: "rifle",
    mag: 3, damage: 22, accuracy: 0.72, cost: 3,
    effects: ["firstHitsAuto+1", "pierce", "spiritScaleDamage+0.03"],
    flavor: "One breath, one ridge, one impossible distance.",
    backstory: "Sharps Rifle Manufacturing Co., 1874 — the .50-caliber that buried the buffalo herd in a single decade. Its boom carries a mile.",
  },
  {
    id: "gun_cochise_bow",
    name: "Cochise's War Bow",
    rarity: "legendary",
    classId: "apache_tracker",
    weaponType: "bow",
    mag: 6, damage: 11, accuracy: 0.74, cost: 3,
    effects: ["firstHitsAuto+1", "spiritScaleAcc+0.03", "spiritScaleDamage+0.04", "dodgeRecv+1"],
    flavor: "Silent, certain, never traded.",
    backstory: "Sinew-strung yew of the Chiricahua war chief. Carried through every parley with the bluecoats, drawn at none — and never surrendered.",
  },

  // ── U.S. MARSHAL (premium government revolvers) ───────────────────────────
  {
    id: "gun_colt_saa",
    name: "Colt Single Action Army",
    rarity: "uncommon",
    classId: "marshal",
    weaponType: "revolver",
    mag: 6, damage: 10, accuracy: 0.62, cost: 2,
    effects: ["accShootout+0.05"],
    flavor: "Government issue, factory fresh, serial number logged.",
  },
  {
    id: "gun_sw_schofield_3",
    name: "Smith & Wesson Schofield No. 3",
    rarity: "epic",
    classId: "marshal",
    weaponType: "revolver",
    mag: 6, damage: 11, accuracy: 0.66, cost: 3,
    effects: ["accShootout+0.08", "markBurst+1", "dodgeRecv+1"],
    flavor: "Top-break, top-shelf, signed out by the quartermaster.",
    backstory: "Smith & Wesson Model 3, 1875, modified to Major George Schofield's specifications. The U.S. Cavalry's iron of choice — until the .45 Long Colt won the contract.",
  },
  {
    id: "gun_treasury_schofield",
    name: "Treasury Gold Schofield",
    rarity: "legendary",
    classId: "marshal",
    weaponType: "revolver",
    mag: 6, damage: 12, accuracy: 0.68, cost: 4,
    effects: ["accShootout+0.08", "firstHitsAuto+1", "markBurst+2", "bountyOnHit+5"],
    flavor: "Gold-sealed federal rounds. Every hit gets filed.",
    backstory: "A special Treasury order: Schofield frame, polished brass seal, and gold-capped cartridges issued for fugitives whose capture mattered more than the receipt.",
  },

  // ── VAQUERO (ornate pistols) ──────────────────────────────────────────────
  {
    id: "gun_remington_1875",
    name: "Remington Model 1875",
    rarity: "uncommon",
    classId: "vaquero",
    weaponType: "revolver",
    mag: 6, damage: 10, accuracy: 0.60, cost: 2,
    effects: ["damage+1", "accShootout+0.03", "dodgeRecv+1"],
    flavor: "Brass-fitted starter iron. Honest in the right hand.",
  },
  {
    id: "gun_colt_lightning_vaquero",
    name: "Colt Lightning Revolver",
    rarity: "rare",
    classId: "vaquero",
    weaponType: "revolver",
    mag: 6, damage: 10, accuracy: 0.66, cost: 2,
    effects: ["accShootout+0.07", "dualWieldAccPenaltyReduce+0.05", "firstHitsAuto+1", "dodgeRecv+1"],
    flavor: "Fast enough for the off-hand to keep up.",
    backstory: "Colt's 1877 double-action line, temperamental but quick, found a second life in hands that never waited for the hammer.",
  },
  {
    id: "gun_lemat",
    name: "LeMat Dragoon",
    rarity: "epic",
    classId: "vaquero",
    weaponType: "revolver",
    mag: 8, damage: 11, accuracy: 0.56, cost: 3,
    effects: ["bullets+2", "damage+1", "dualWieldAccPenaltyReduce+0.04", "firstHitsAuto+1", "dodgeRecv+1"],
    flavor: "Heavy off-hand thunder for close streets.",
    backstory: "Dr. Jean Alexandre LeMat's nine-shot cavalry iron, born in New Orleans in 1855 and carried hard through saddle wars.",
  },
  {
    id: "gun_villa_mauser",
    name: "Villa's Mauser C96",
    rarity: "legendary",
    classId: "vaquero",
    weaponType: "pistol",
    mag: 10, damage: 12, accuracy: 0.62, cost: 4,
    effects: ["bullets+3", "accShootout+0.10", "firstHitsAuto+2", "dodgeRecv+1", "removeDualPenalty"],
    flavor: "El broomhandle del general.",
    backstory: "Pancho Villa's Mauser C96, the broomhandle that crossed the Rio Grande at Columbus, New Mexico, March 9th, 1916. It came back. He didn't.",
  },

  // Vaquero off-hand iron — paired with primary for dual-wield builds
  {
    id: "gun_offhand_iron",
    name: "Off-Hand Iron",
    rarity: "common",
    classId: "vaquero",
    weaponType: "revolver",
    mag: 4, damage: 8, accuracy: 0.58, cost: 0,
    effects: ["firstHitsAuto+1", "dodgeRecv+1", "lifestealOnHit+1"],
    flavor: "Lighter, looser, leftward.",
    dualWield: true,
  },

  // ── BOUNTY HUNTER (small / concealed) ─────────────────────────────────────
  {
    id: "gun_derringer_41",
    name: ".41 Derringer",
    rarity: "uncommon",
    classId: "bounty_hunter",
    weaponType: "pistol",
    mag: 4, damage: 15, accuracy: 0.76, cost: 2,
    effects: ["firstHitsAuto+1", "dodgeRecv+1", "lifestealOnHit+2"],
    flavor: "Sleeve iron loaded with blood-price rounds.",
  },
  {
    id: "gun_twin_contract_derringer",
    name: "Twin Contract Derringer",
    rarity: "rare",
    classId: "bounty_hunter",
    weaponType: "pistol",
    mag: 3, damage: 16, accuracy: 0.76, cost: 2,
    effects: ["firstHitsAuto+2", "damageShootout+0.10", "lifestealOnHit+2", "bountyOnHit+1"],
    flavor: "A court runner's pocket gun, cut for clean collections.",
    backstory: "Pocket iron carried by court runners who preferred their warrants served muzzle-first.",
  },
  {
    id: "gun_pepperbox",
    name: "Pepperbox Revolver",
    rarity: "epic",
    classId: "bounty_hunter",
    weaponType: "revolver",
    mag: 6, damage: 10, accuracy: 0.63, cost: 3,
    effects: ["bullets+1", "firstHitsAuto+2", "lifestealOnHit+2", "hpAfterShootout+2"],
    flavor: "Six barrels, six chances, one more breath after the smoke.",
    backstory: "Allen & Thurber of Worcester, Massachusetts, patented 1837. No need to aim long when the whole front of the gun is the muzzle.",
  },
  {
    id: "gun_doc_hideout",
    name: "Doc Holliday's Hideout",
    rarity: "legendary",
    classId: "bounty_hunter",
    weaponType: "pistol",
    mag: 3, damage: 21, accuracy: 0.80, cost: 4,
    effects: ["pierce", "firstHitsAuto+2", "accShootout+0.10", "lifestealOnHit+3", "bountyOnHit+2", "hpAfterShootout+2"],
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
    mag: 4, damage: 18, accuracy: 0.46, cost: 2,
    effects: ["damage+2", "damageTaken-1", "dodgeRecv+1"],
    flavor: "Short barrel, long consequences. The badge stays planted.",
  },
  {
    id: "gun_winchester_1887",
    name: "Winchester 1887",
    rarity: "epic",
    classId: "sheriff",
    weaponType: "shotgun",
    mag: 5, damage: 22, accuracy: 0.50, cost: 3,
    effects: ["damage+4", "ricochet", "dodgeRecv+1", "damageTaken-1", "hpAfterShootout+3"],
    flavor: "The lever clacks. The street ducks behind the badge.",
    backstory: "John Moses Browning's lever-action shotgun, 1887, made for Winchester at Oliver Winchester's request. The clack of its action ended more saloon arguments than any judge.",
  },
  {
    id: "gun_masterson_colt",
    name: "Masterson's Thunderer",
    rarity: "legendary",
    classId: "sheriff",
    weaponType: "shotgun",
    mag: 5, damage: 27, accuracy: 0.52, cost: 4,
    effects: ["damage+4", "firstHitsAuto+1", "dodgeRecv+2", "damageTaken-2", "hpAfterShootout+5"],
    flavor: "Special order. Final warning. The star turns lead aside.",
    backstory: "Bartholomew W. Masterson wrote to Colt's Hartford works, July 1885: 'a special grip of gutta-percha, easy on the trigger.' Dodge City, Tombstone, and finally a desk at the New York Morning Telegraph.",
  },

  // ── ENEMY-ONLY ROSTER GUNS ───────────────────────────────────────────────
  {
    id: "gun_enemy_deputy_peashooter",
    name: "Deputy's Peashooter",
    rarity: "common", classId: null, opponentOnly: true,
    mag: 4, damage: 6, accuracy: 0.45, cost: 1,
    effects: [],
    flavor: "Issued with a badge still warmer than the hand that wears it.",
  },
  {
    id: "gun_enemy_quickstep_colt",
    name: "Quickstep Colt",
    rarity: "common", classId: null, opponentOnly: true,
    mag: 5, damage: 7, accuracy: 0.53, cost: 1,
    effects: ["accShootout+0.02"],
    flavor: "Polished for the stage, drawn for the alley.",
  },
  {
    id: "gun_enemy_marshal_graves_iron",
    name: "Graves' Town Iron",
    rarity: "uncommon", classId: null, opponentOnly: true,
    mag: 7, damage: 10, accuracy: 0.56, cost: 2,
    effects: ["damage+1"],
    flavor: "Heavy enough to settle ordinances.",
  },
  {
    id: "gun_enemy_barrel_guard_blunder",
    name: "Barrel Guard Blunderbuss",
    rarity: "common", classId: null, opponentOnly: true,
    mag: 4, damage: 10, accuracy: 0.43, cost: 1,
    effects: ["damage+1", "accShootout-0.04"],
    flavor: "A sawed mouth of iron and spilled mash.",
  },
  {
    id: "gun_enemy_moonshine_pistol",
    name: "Moonshine Runner's Pistol",
    rarity: "uncommon", classId: null, opponentOnly: true,
    mag: 6, damage: 8, accuracy: 0.56, cost: 2,
    effects: ["bullets+1"],
    flavor: "Wrapped in flour sack cloth to keep the still smoke off.",
  },
  {
    id: "gun_enemy_stillhouse_repeater",
    name: "Stillhouse Repeater",
    rarity: "rare", classId: null, opponentOnly: true,
    mag: 6, damage: 9, accuracy: 0.55, cost: 3,
    effects: ["bullets+1", "damage+1"],
    flavor: "Its lever clacks like a tax collector's knuckles.",
  },
  {
    id: "gun_enemy_lookout_carbine",
    name: "Lookout's Carbine",
    rarity: "uncommon", classId: null, opponentOnly: true,
    mag: 5, damage: 9, accuracy: 0.58, cost: 2,
    effects: ["accShootout+0.03"],
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
    mag: 6, damage: 11, accuracy: 0.59, cost: 4,
    effects: ["bullets+1", "damage+2"],
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
    effects: ["dodgeRecv+1", "returnBulletOnHit+1"],
    flavor: "It clicks once for the living and twice for the dead.",
    backstory: "A Navy Colt pried from a flooded grave, its ivory grip yellowed like old bone.",
  },
  {
    id: "gun_enemy_gravesmoke_remington",
    name: "Gravesmoke Remington",
    rarity: "legendary", classId: null, opponentOnly: true,
    mag: 6, damage: 12, accuracy: 0.56, cost: 5,
    effects: ["damage+1", "returnBulletOnHit+1", "pierce"],
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

const COMBAT_REWORK_GUN_STATS = {
  gun_volcanic_pistol: { capacity: 5, bulletDamage: 6, effects: [] },
  gun_sawed_off_coach: { capacity: 4, bulletDamage: 8, effects: ["overcap+1"] },
  gun_jesse_schofield: { capacity: 5, startLoaded: 1, bulletDamage: 9, effects: ["load+1"] },

  gun_henry_repeater: { capacity: 5, bulletDamage: 6, effects: [] },
  gun_mescalero_bow: { capacity: 4, bulletDamage: 7, effects: ["position+1"] },
  gun_sharps_buffalo: { capacity: 2, bulletDamage: 13, effects: ["position+1"] },
  gun_cochise_bow: { capacity: 4, startLoaded: 1, bulletDamage: 8, effects: ["load+1", "position+1"] },

  gun_colt_saa: { capacity: 5, bulletDamage: 6, effects: [] },
  gun_sw_schofield_3: { capacity: 5, bulletDamage: 7, effects: ["markEnemy+1"] },
  gun_treasury_schofield: { capacity: 6, bulletDamage: 7, effects: ["bountyOnHit+5"] },

  gun_remington_1875: { capacity: 4, bulletDamage: 6, effects: [] },
  gun_colt_lightning_vaquero: { capacity: 4, bulletDamage: 5, effects: ["position+1"] },
  gun_lemat: { capacity: 5, bulletDamage: 6, effects: ["load+1", "position-1"] },
  gun_villa_mauser: { capacity: 6, bulletDamage: 5, effects: ["load+1", "overcap+1"] },
  gun_offhand_iron: { capacity: 2, bulletDamage: 5, effects: [] },

  gun_derringer_41: { capacity: 3, bulletDamage: 8, effects: [] },
  gun_twin_contract_derringer: { capacity: 3, bulletDamage: 7, effects: ["lifestealOnHit+1", "bountyOnHit+1"] },
  gun_pepperbox: { capacity: 5, bulletDamage: 6, effects: ["lifestealOnHit+1"] },
  gun_doc_hideout: { capacity: 3, startLoaded: 1, bulletDamage: 10, effects: ["load+1", "lifestealOnHit+1", "bountyOnHit+1"] },

  gun_peacemaker: { capacity: 3, bulletDamage: 9, effects: [] },
  gun_winchester_1887: { capacity: 3, bulletDamage: 11, effects: ["armor+4"] },
  gun_masterson_colt: { capacity: 4, startLoaded: 1, bulletDamage: 12, effects: ["load+1", "armor+4"] },

  gun_pocket_pistol: { capacity: 3, bulletDamage: 5, effects: [] },
  gun_service_revolver: { capacity: 5, bulletDamage: 6, effects: [] },
  gun_trappers_carbine: { capacity: 4, bulletDamage: 7, effects: [] },
  gun_long_barrel_colt: { capacity: 5, bulletDamage: 7, effects: ["position+1"] },
  gun_twin_barrel_derringer: { capacity: 2, startLoaded: 1, bulletDamage: 9, effects: ["load+1"] },
  gun_cavalry_pistol: { capacity: 5, bulletDamage: 7, effects: [] },
  gun_marksmans_iron: { capacity: 4, bulletDamage: 8, effects: ["position+1"] },
  gun_knuckle_revolver: { capacity: 4, bulletDamage: 9, effects: ["position-1"] },
  gun_quickdraw_iron: { capacity: 6, bulletDamage: 6, effects: ["load+1"] },
  gun_gatling_sidearm: { capacity: 8, bulletDamage: 4, effects: ["overcap+1"] },
  gun_volcanic_repeater: { capacity: 7, bulletDamage: 5, effects: ["load+1"] },
  gun_high_noon: { capacity: 6, startLoaded: 1, bulletDamage: 9, effects: ["load+1", "position+1"] },
};

for (const g of GUNS_LIST) {
  const override = COMBAT_REWORK_GUN_STATS[g.id] ?? {};
  g.capacity = override.capacity ?? Math.max(2, Math.min(8, Math.round(g.mag ?? 5)));
  g.startLoaded = override.startLoaded ?? 0;
  g.bulletDamage = override.bulletDamage ?? Math.max(4, Math.min(12, Math.round((g.damage ?? 8) * 0.65)));
  if (override.effects) g.effects = [...override.effects];
}

/** id → Gun lookup. */
export const GUNS = Object.fromEntries(GUNS_LIST.map((g) => [g.id, g]));

/** Default-ish fallback used by old save data; first generic common. */
export const FALLBACK_GUN_ID = "gun_service_revolver";

export function getGun(id) {
  return GUNS[id] ?? GUNS[FALLBACK_GUN_ID];
}

/** Guns playable by a given class id (class-locked + generic). */
export function gunsForClass(classId) {
  if (!classId) return GUNS_LIST.filter((g) => !g.opponentOnly && g.classId === null);
  return GUNS_LIST.filter((g) => !g.opponentOnly && g.classId === classId);
}

/** Returns the uncommon class-locked starter gun id for a class. */
export function starterGunIdForClass(classId) {
  const g = GUNS_LIST.find((g) => g.classId === classId && g.rarity === "uncommon");
  return g ? g.id : FALLBACK_GUN_ID;
}
