export const GEAR_SLOTS = ["hat", "belt", "boots", "strap", "coat"];
export const TRINKET_SLOT = "trinket";
export const TRINKET_SLOTS = 5;
export const TRINKET_DROP_CHANCE = 0.05;
export const MERCHANT_TRINKET_FIRST_VISIT = 2;

const EMPTY_GEAR = Object.freeze({
  hat: null,
  belt: null,
  boots: null,
  strap: null,
  coat: null,
});

const ITEM_BONUS_DEFAULTS = Object.freeze({
  startNerve: 0,
  maxNerve: 0,
  nerveGain: 0,
  startArmor: 0,
  armorPerRound: 0,
  startLoaded: 0,
  loadPerRound: 0,
  capacity: 0,
  bulletDamage: 0,
  position: 0,
  positionCap: 0,
  positionPerRound: 0,
  evadeFirstRound: 0,
  enemyWeakFirstRound: 0,
  firstCardFree: 0,
  firstGunFree: 0,
  healAfterDuel: 0,
  healAfterBoss: 0,
  bountyFlat: 0,
  bountyMult: 0,
  cardDiscount: 0,
  gunDiscount: 0,
  trinketDiscount: 0,
});

export const ITEM_DEFINITIONS = [
  // Hats
  item("hat_dustline", "Dustline Hat", "hat", "common", "Keeps the sun out and your feet pointed right.", [["position", 1]]),
  item("hat_tin_star", "Tin Star Hat", "hat", "uncommon", "The star is bent, but people still pay attention.", [["bountyFlat", 6], ["startArmor", 1]]),
  item("hat_black_felt", "Black Felt Hat", "hat", "rare", "Looks guilty enough that nobody asks twice.", [["maxNerve", 1]]),
  item("hat_wide_brim", "Wide-Brim Lookout", "hat", "common", "A little shade buys a little time.", [["enemyWeakFirstRound", 1]]),
  item("hat_gambler", "Gambler's Crown", "hat", "rare", "The table always looks beatable from underneath it.", [["bountyMult", 0.03]]),
  item("hat_iron_crown", "Iron Crown Hat", "hat", "uncommon", "Heavy brim. Hard skull.", [["maxHp", 4]]),
  item("hat_noonshade", "Noonshade Sombrero", "hat", "uncommon", "Big enough to hide a bad idea.", [["evadeFirstRound", 1]]),
  item("hat_undertaker", "Undertaker's Hat", "hat", "uncommon", "Every grave has a lesson.", [["healAfterDuel", 1]]),
  item("hat_prospector", "Prospector's Cap", "hat", "common", "Finds money where others find dust.", [["bountyFlat", 4]]),
  item("hat_last_word", "Last Word Hat", "hat", "rare", "You speak second and shoot first.", [["enemyWeakFirstRound", 1], ["startArmor", 1]]),

  // Belts
  item("belt_cartridge", "Cartridge Belt", "belt", "common", "More loops, more answers.", [["capacity", 1]]),
  item("belt_brass_loops", "Brass Loops", "belt", "common", "One round is always waiting.", [["startLoaded", 1]]),
  item("belt_deputy_buckle", "Deputy's Buckle", "belt", "common", "Not official, but it still catches bullets.", [["startArmor", 2]]),
  item("belt_snakebite", "Snakebite Belt", "belt", "uncommon", "A little poison in the swagger.", [["enemyWeakFirstRound", 1]]),
  item("belt_silver", "Silver Buckle", "belt", "uncommon", "A polished promise to stand your ground.", [["gunDiscount", 0.06]]),
  item("belt_payday", "Payday Pouch", "belt", "common", "Coin has a way of sticking to it.", [["bountyFlat", 5]]),
  item("belt_powder_flask", "Powder Flask Belt", "belt", "rare", "The shot leaves louder than it entered.", [["enemyWeakFirstRound", 2]]),
  item("belt_tourniquet", "Tourniquet Belt", "belt", "uncommon", "Tighten, breathe, keep walking.", [["healAfterBoss", 3]]),
  item("belt_spare_knots", "Spare-Knot Belt", "belt", "common", "Enough leather to patch a bad round.", [["startArmor", 2]]),
  item("belt_dead_mans", "Dead Man's Buckle", "belt", "rare", "Nobody calls your bluff twice.", [["bountyMult", 0.02], ["startArmor", 1]]),

  // Boots
  item("boots_spur", "Spur Boots", "boots", "uncommon", "They move before pride does.", [["positionCap", 1]]),
  item("boots_softstep", "Softstep Boots", "boots", "common", "Dust hears you late.", [["evadeFirstRound", 1]]),
  item("boots_lead_toe", "Lead-Toe Boots", "boots", "common", "Slow feet, solid stance.", [["startArmor", 3]]),
  item("boots_dust_kicker", "Dust Kicker Boots", "boots", "common", "Every step throws grit in the other eye.", [["enemyWeakFirstRound", 1]]),
  item("boots_trail", "Trail Boots", "boots", "uncommon", "They know where the better angle is buried.", [["positionCap", 1]]),
  item("boots_dead_sprint", "Dead Sprint Boots", "boots", "rare", "No one outruns noon, but you try.", [["startArmor", 1], ["positionCap", 1]]),
  item("boots_lucky", "Lucky Burial Boots", "boots", "uncommon", "Too nice for a coffin.", [["healAfterBoss", 3]]),
  item("boots_marching", "Marching Boots", "boots", "common", "Made for the long route.", [["maxHp", 4]]),
  item("boots_nailheel", "Nailheel Boots", "boots", "rare", "They dig in when the gun kicks.", [["positionCap", 1], ["enemyWeakFirstRound", 1]]),
  item("boots_graveyard", "Graveyard Boots", "boots", "uncommon", "One step away from the end.", [["startArmor", 2]]),

  // Straps
  item("strap_shoulder", "Shoulder Strap", "strap", "common", "Carries just enough courage.", [["maxNerve", 1]]),
  item("strap_shell", "Shell Strap", "strap", "common", "A shell under every breath.", [["startLoaded", 1]]),
  item("strap_crossdraw", "Crossdraw Strap", "strap", "rare", "The first iron change is a habit, not a choice.", [["firstGunFree", 1]]),
  item("strap_hide", "Rawhide Strap", "strap", "common", "Old hide holds under new fire.", [["startArmor", 2]]),
  item("strap_rifle_sling", "Rifle Sling", "strap", "uncommon", "The long gun settles faster.", [["capacity", 1]]),
  item("strap_black_powder", "Black Powder Strap", "strap", "rare", "Everything smells like the answer.", [["enemyWeakFirstRound", 1], ["startArmor", 1]]),
  item("strap_doctor", "Doctor's Satchel Strap", "strap", "uncommon", "A steady hand after the smoke.", [["healAfterBoss", 3]]),
  item("strap_marshal", "Marshal's Warrant Strap", "strap", "uncommon", "The paperwork is loaded too.", [["bountyFlat", 6], ["cardDiscount", 0.05]]),
  item("strap_woven", "Woven Medicine Strap", "strap", "common", "Knotted with quiet patience.", [["startArmor", 2]]),
  item("strap_torn", "Torn Favor Strap", "strap", "uncommon", "A merchant recognizes the mark.", [["cardDiscount", 0.08]]),

  // Coats
  item("coat_duster", "Trail Duster", "coat", "common", "Long cloth catches short shots.", [["startArmor", 5]]),
  item("coat_long_black", "Long Black Coat", "coat", "uncommon", "People make room for the walking funeral.", [["maxHp", 6]]),
  item("coat_poncho", "Weathered Poncho", "coat", "common", "Rain, dust, blood. Same cloth.", [["startArmor", 3]]),
  item("coat_lined", "Lined Duster", "coat", "rare", "Heavy enough to make a bullet think twice.", [["startArmor", 4]]),
  item("coat_gambler", "Gambler's Coat", "coat", "rare", "Deep pockets, shallow morals.", [["bountyMult", 0.03]]),
  item("coat_rain", "Rain-Slick Coat", "coat", "uncommon", "Hard to read through wet leather.", [["enemyWeakFirstRound", 1], ["startArmor", 1]]),
  item("coat_funeral", "Funeral Coat", "coat", "rare", "Not yours. Not today.", [["healAfterBoss", 4]]),
  item("coat_lawman's", "Lawman's Coat", "coat", "uncommon", "Clean lines. Dirty work.", [["startArmor", 2]]),
  item("coat_trail", "Open Trail Coat", "coat", "uncommon", "Leaves room to turn.", [["positionCap", 1]]),
  item("coat_buffalo", "Buffalo-Hide Coat", "coat", "rare", "Warm, ugly, stubborn.", [["maxHp", 5], ["startArmor", 1]]),

  // Trinkets
  item("trinket_rabbit_foot", "Rabbit Foot", TRINKET_SLOT, "uncommon", "Lucky until it is not.", [["evadeFirstRound", 1]], 330),
  item("trinket_bent_coin", "Bent Coin", TRINKET_SLOT, "common", "Bad luck for the other fellow.", [["bountyFlat", 3]], 240),
  item("trinket_brass_button", "Brass Button", TRINKET_SLOT, "common", "Torn off something important.", [["startArmor", 1]], 230),
  item("trinket_matchbook", "Lucifer Matchbook", TRINKET_SLOT, "rare", "One spark starts the argument.", [["startLoaded", 1]], 430),
  item("trinket_crow_bead", "Black Bead", TRINKET_SLOT, "common", "A quiet bead on a loud day.", [["bountyFlat", 3]], 260),
  item("trinket_silver_spur", "Silver Spur", TRINKET_SLOT, "rare", "Small enough to hide, sharp enough to matter.", [["positionCap", 1]], 390),
  item("trinket_pressed_flower", "Pressed Flower", TRINKET_SLOT, "common", "A reminder to leave alive.", [["healAfterBoss", 2]], 225),
  item("trinket_tin_whistle", "Tin Whistle", TRINKET_SLOT, "uncommon", "Calls courage from somewhere nearby.", [["startNerve", 1]], 340),
  item("trinket_bone_dice", "Bone Dice", TRINKET_SLOT, "rare", "They land how they want.", [["bountyMult", 0.02]], 420),
  item("trinket_copper_caps", "Copper Caps", TRINKET_SLOT, "uncommon", "A little more thunder in the chamber.", [["startArmor", 1]], 360),
  item("trinket_whetstone", "Pocket Whetstone", TRINKET_SLOT, "uncommon", "For knives, words, and decisions.", [["enemyWeakFirstRound", 1]], 300),
  item("trinket_torn_receipt", "Torn Receipt", TRINKET_SLOT, "common", "Proof you overpaid once.", [["trinketDiscount", 0.05]], 240),
  item("trinket_glass_eye", "Glass Eye", TRINKET_SLOT, "rare", "Sees the shot you almost missed.", [["capacity", 1]], 410),
  item("trinket_iron_nail", "Iron Coffin Nail", TRINKET_SLOT, "common", "A small promise to stay put.", [["startArmor", 1]], 245),
  item("trinket_blue_thread", "Blue Thread", TRINKET_SLOT, "uncommon", "Tied around the trigger finger.", [["gunDiscount", 0.08]], 310),
];

function item(id, name, slot, rarity, description, effects, price = null) {
  return {
    id,
    name,
    slot,
    rarity,
    description,
    effects: effects.map(([kind, value]) => ({ kind, value })),
    price,
  };
}

export function getItem(id) {
  return ITEM_DEFINITIONS.find((itemDef) => itemDef.id === id) ?? null;
}

export function isGear(itemDef) {
  return !!itemDef && GEAR_SLOTS.includes(itemDef.slot);
}

export function isTrinket(itemDef) {
  return !!itemDef && itemDef.slot === TRINKET_SLOT;
}

export function normalizeEquipment(run) {
  if (!run || typeof run !== "object") return;
  const current = run.equipment && typeof run.equipment === "object" && !Array.isArray(run.equipment)
    ? run.equipment
    : {};
  const gear = current.gear && typeof current.gear === "object" && !Array.isArray(current.gear)
    ? current.gear
    : {};
  run.equipment = {
    gear: { ...EMPTY_GEAR },
    trinkets: Array.isArray(current.trinkets) ? current.trinkets.filter((id) => isTrinket(getItem(id))).slice(0, TRINKET_SLOTS) : [],
  };
  for (const slot of GEAR_SLOTS) {
    const id = typeof gear[slot] === "string" ? gear[slot] : null;
    const itemDef = getItem(id);
    run.equipment.gear[slot] = itemDef?.slot === slot ? id : null;
  }
  if (!Number.isFinite(run.merchantVisits)) run.merchantVisits = 0;
}

export function equippedItemIds(run) {
  normalizeEquipment(run);
  return [
    ...GEAR_SLOTS.map((slot) => run.equipment.gear[slot]).filter(Boolean),
    ...(run.equipment.trinkets ?? []),
  ];
}

export function equippedItems(run) {
  return equippedItemIds(run).map((id) => getItem(id)).filter(Boolean);
}

export function itemBonuses(run) {
  const bonuses = { ...ITEM_BONUS_DEFAULTS };
  for (const itemDef of equippedItems(run)) {
    for (const effect of itemDef.effects ?? []) {
      if (effect.kind === "maxHp") continue;
      if (!Object.hasOwn(bonuses, effect.kind)) bonuses[effect.kind] = 0;
      bonuses[effect.kind] += Number(effect.value) || 0;
    }
  }
  return bonuses;
}

export function gearSlotsOpen(run) {
  normalizeEquipment(run);
  return GEAR_SLOTS.filter((slot) => !run.equipment.gear[slot]);
}

export function canEquipTrinket(run) {
  normalizeEquipment(run);
  return (run.equipment.trinkets ?? []).length < TRINKET_SLOTS;
}

export function equipItem(run, itemId) {
  normalizeEquipment(run);
  const itemDef = getItem(itemId);
  if (!itemDef) return false;
  if (isGear(itemDef)) {
    if (run.equipment.gear[itemDef.slot]) return false;
    run.equipment.gear[itemDef.slot] = itemDef.id;
  } else if (isTrinket(itemDef)) {
    if (!canEquipTrinket(run)) return false;
    if (run.equipment.trinkets.includes(itemDef.id)) return false;
    run.equipment.trinkets.push(itemDef.id);
  } else {
    return false;
  }
  applyEquipEffects(run, itemDef);
  return true;
}

function applyEquipEffects(run, itemDef) {
  const maxHp = (itemDef.effects ?? [])
    .filter((effect) => effect.kind === "maxHp")
    .reduce((sum, effect) => sum + Math.max(0, Math.round(Number(effect.value) || 0)), 0);
  if (maxHp > 0) {
    run.maxHp += maxHp;
    run.hp = Math.min(run.maxHp, (run.hp || 0) + maxHp);
  }
}

function sampleDistinct(pool, count) {
  const bag = [...pool];
  const picks = [];
  while (bag.length && picks.length < count) {
    const ix = (Math.random() * bag.length) | 0;
    picks.push(bag[ix]);
    bag.splice(ix, 1);
  }
  return picks;
}

export function rollStartingGearChoices(count = 3) {
  return sampleDistinct(ITEM_DEFINITIONS.filter(isGear), count);
}

export function rollBossGearDrop(run) {
  const openSlots = gearSlotsOpen(run);
  if (!openSlots.length) return null;
  const slot = openSlots[(Math.random() * openSlots.length) | 0];
  const pool = ITEM_DEFINITIONS.filter((itemDef) => itemDef.slot === slot);
  return pool[(Math.random() * pool.length) | 0] ?? null;
}

export function rollTrinketDrop(run, chance = TRINKET_DROP_CHANCE) {
  normalizeEquipment(run);
  if (!canEquipTrinket(run) || Math.random() >= chance) return null;
  const owned = new Set(equippedItemIds(run));
  const pool = ITEM_DEFINITIONS.filter((itemDef) => isTrinket(itemDef) && !owned.has(itemDef.id));
  if (!pool.length) return null;
  return pool[(Math.random() * pool.length) | 0] ?? null;
}

export function rollMerchantTrinket(run) {
  normalizeEquipment(run);
  if ((run.merchantVisits || 0) < MERCHANT_TRINKET_FIRST_VISIT || !canEquipTrinket(run)) return null;
  const owned = new Set(equippedItemIds(run));
  const pool = ITEM_DEFINITIONS.filter((itemDef) => isTrinket(itemDef) && !owned.has(itemDef.id));
  if (!pool.length) return null;
  return pool[(Math.random() * pool.length) | 0] ?? null;
}

export function trinketPrice(itemDef, run) {
  if (!isTrinket(itemDef)) return 0;
  const base = Number.isFinite(itemDef.price) ? itemDef.price : 140;
  const discount = Math.max(0, Math.min(0.35, itemBonuses(run).trinketDiscount || 0));
  return Math.max(60, Math.round(base * (1 - discount)));
}

export function describeItemEffect(effect) {
  const v = effect.value;
  switch (effect.kind) {
    case "maxHp": return `+${v} max HP`;
    case "startNerve": return `+${v} starting Nerve`;
    case "maxNerve": return `+${v} max Nerve`;
    case "nerveGain": return `+${v} Nerve gained each later round`;
    case "startArmor": return `Start each duel with ${v} Armor`;
    case "armorPerRound": return `Gain ${v} Armor each round`;
    case "startLoaded": return `Start each duel with ${v} loaded bullet`;
    case "loadPerRound": return `Load ${v} bullet each later round`;
    case "capacity": return `+${v} gun capacity`;
    case "bulletDamage": return `+${v} bullet damage`;
    case "position": return `+${v} starting Position`;
    case "positionCap": return `+${v} Position cap`;
    case "positionPerRound": return `+${v} Position each later round`;
    case "evadeFirstRound": return `Evade ${v} bullet on round 1`;
    case "enemyWeakFirstRound": return `Enemy bullet damage -${v} on round 1`;
    case "firstCardFree": return `First non-gun card each duel costs 0`;
    case "firstGunFree": return `First gun swap each duel costs 0`;
    case "healAfterDuel": return `Heal ${v} HP after each win`;
    case "healAfterBoss": return `Heal ${v} HP after boss wins`;
    case "bountyFlat": return `+${v} bounty from each win`;
    case "bountyMult": return `+${Math.round(v * 100)}% bounty from each win`;
    case "cardDiscount": return `${Math.round(v * 100)}% cheaper merchant cards`;
    case "gunDiscount": return `${Math.round(v * 100)}% cheaper merchant guns`;
    case "trinketDiscount": return `${Math.round(v * 100)}% cheaper merchant trinkets`;
    default: return `${effect.kind} ${v}`;
  }
}
