# High Noon Card Structure

This document describes the current card/deck implementation after the deterministic combat rework.

Two-build class identities and reward-pool expectations are defined in [build-paths.md](build-paths.md).

## Card Types

- Feats are immediate tricks, tactics, reactions, and bursts of pressure.
- Guns are equipped weapons. Each class starter gun sits outside the deck as the active gun.
- Stances stay in play during a duel and provide ongoing modifiers.
- Oath/showdown cards are legacy data and are excluded from current player rewards and shops.

## Combat Card Language

Current primary effect names:

| Effect | Meaning |
| --- | --- |
| `load+N` | Load N bullets into the player gun, clamped by capacity. |
| `armor+N` | Gain N one-round Armor. |
| `position+N` | Gain Position, clamped by the class/gun cap. |
| `position-N` | Lose Position. |
| `positionSet+N` | Set Position to N. |
| `evadeBullets+N` | Evade N incoming enemy bullets this Showdown. |
| `evadeAttack` | Evade the next enemy attack this Showdown. |
| `nerve+N` | Gain Nerve immediately. |
| `nextNerve+N` | Gain extra Nerve next round. |
| `draw+N` | Draw N cards immediately. |
| `enemyWeak+N` | Reduce enemy damage per bullet this round. |
| `markEnemy+N` | Add Marshal Marks to the opponent. |
| `spirit+N` | Add Apache Spirit for the duel. |
| `payHp+N` | Pay HP as a card cost. |
| `lifestealOnHit+N` | Heal N HP per live player bullet this Showdown. |
| `bountyOnHit+N` | Add bounty per live player bullet this Showdown. |
| `infamy+N` | Add Outlaw Infamy for the duel. |
| `infamyPerRound+N` | Gain Infamy at the start of later rounds. |
| `infamyLoad+N` | Spend up to N Infamy to load bullets. |
| `infamyDamage+N` | Add bullet damage based on current Infamy, capped by N. |
| `infamyArmor+N` | Convert current Infamy into Armor, capped by N. |
| `deputies+N` | Add Sheriff deputies for the duel. |
| `deputyArmorPerRound+N` | Deputies add recurring Armor at the start of later rounds. |
| `deputyLoadOnAttack+N` | Deputies load shells when the visible enemy intent is an attack. |
| `deputyBlock+N` | Gain Armor based on deputy count. |
| `caseFile+N` | Add Marshal Case File counters. |
| `casePerRound+N` | Gain Case File at the start of later rounds. |
| `casePath+N` | Start a Marshal Procedure Path. Each later round advances up to III and grants Case File equal to the current stage. |
| `caseOnMark+N` | Gain Case File when applying Marks. |
| `caseSpendLoad+N` | Spend up to N Case File to load bullets. |
| `caseSpendArmor+N` | Spend up to N Case File for Armor. |
| `track+N` | Add Apache Track counters. |
| `trackLoad+N` | Spend up to N Track to load bullets. |
| `trackDamage+N` | Add bullet damage based on current Track, capped by N. |
| `snare+N` | Evade incoming bullets this round. |
| `snarePerRound+N` | Gain Snare against later visible attack intents. |
| `positionPerRound+N` | Gain Position at the start of later rounds. |
| `flourishDamage+N` | At Position 3 or higher, add bullet damage to precision volleys of 3 or fewer bullets; below that, gain Position instead. |
| `infection+N` | Add Bounty Hunter Infection to the enemy. |
| `infectionWeak+N` | Reduce enemy damage this round when Infection is present. |
| `infectionLeech+N` | Heal for a percentage of Infection damage dealt. |
| `consumeInfection+N` | Spend Infection for immediate damage. |

Enemy attacks are deterministic and 100% accurate. Enemy accuracy debuffs should not be added to normal player cards.

Player gun fields:

| Field | Meaning |
| --- | --- |
| `capacity` | Normal maximum loaded bullets. |
| `startLoaded` | Bullets loaded at duel start, usually `0`. |
| `bulletDamage` | Damage per bullet before Position and class modifiers. |

Gun cards equip only for the current duel. The next duel starts from the class starter gun again until another gun card is played.

## Baseline Decks

Each class starter deck contains 12 cards. Starter guns are equipped separately and do not count against the 12-card deck.

### Outlaw

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Sidestep` | 2 |
| `Whiskey Brace` | 1 |
| `Gunslinger's Tempo` | 2 |
| `Pistol Whip` | 1 |
| `Dust 'em Up` | 1 |
| `Smoke Break` | 1 |
| `Outlaw's Pact` | 1 |
| `Roll the Dice` | 1 |

### Sheriff

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Sidestep` | 1 |
| `Whiskey Brace` | 1 |
| `Bulwark` | 2 |
| `Badge Flash` | 2 |
| `Packed Shells` | 2 |
| `Town's Strength` | 1 |
| `Deputy Cover` | 1 |

### U.S. Marshal

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 1 |
| `Sidestep` | 1 |
| `Whiskey Brace` | 1 |
| `Dead to Rights` | 2 |
| `Federal Warrant` | 2 |
| `Deputy Crossfire` | 2 |
| `Badge Cover` | 2 |
| `Suppressing Fire` | 1 |

### Apache Tracker

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Sidestep` | 2 |
| `Whiskey Brace` | 1 |
| `Wind Whisper` | 2 |
| `Spirit Talk` | 1 |
| `Ridge Sight` | 1 |
| `Owl's Vision` | 1 |
| `Bear Spirit` | 1 |
| `Medicine Bundle` | 1 |

### Vaquero

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Sidestep` | 2 |
| `Whiskey Brace` | 1 |
| `Steady the Off-Hand` | 2 |
| `Quick Holster` | 2 |
| `Crossfire` | 1 |
| `Left-Hand Cover` | 1 |
| `Off-Hand Reload` | 1 |

### Bounty Hunter

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Sidestep` | 2 |
| `Whiskey Brace` | 1 |
| `Blood for Lead` | 2 |
| `Dead Man's Cover` | 2 |
| `Vendetta Shot` | 1 |
| `Reckless Aim` | 1 |
| `Patch Job` | 1 |

## Run Deck Rules

- Rewards and shop card offers are class-only.
- Wanted-board progression is linear inside each town: easy poster, then medium poster, then boss. Defeated posters cannot be refarmed.
- Town identity and opponent progression baselines live in [towns.md](towns.md).
- Each win has a 20% chance to add a separate class-only gun drop screen after the card reward. Gun drops exclude the class starter/currently equipped gun.
- Feats can repeat, which lets a class build a focused engine.
- Stances are unique deck cards; once owned, they stop appearing in reward/shop card offers.
- Guns are class-only in the player shop and gun drop screen. Starter guns begin equipped, do not count against the starter deck, and are not offered as merchant upgrades.
- The merchant offers cards and guns, but the player can buy only 1 card/gun per merchant visit. Whiskey healing is separate, heals 14 HP, and costs roughly the bounty just earned, with a $45 floor.

## Pool Targets

Recommended class pool target:

| Type | Count |
| --- | ---: |
| Starter Gun | 1 |
| Extra Guns | 3 |
| Feats | 14 |
| Stances | 5 |
| Legacy Oaths | 0 active |

Shared cards still exist for starter decks, enemy decks, and legacy content, but player rewards and shop card offers should not use the shared pool during normal class runs.

Starter decks begin at 12 cards and can grow up to the 24-card cap.

## Class Balance Baselines

- [Outlaw](outlaw.md) is the baseline for high-tempo combo classes.
- [Sheriff](sheriff.md) is the baseline for defensive scaling classes.
- [U.S. Marshal](marshal.md) is the baseline for mark-scaling control classes.
- [Apache Tracker](apache-tracker.md) is the baseline for Spirit-ramp precision classes.
- [Vaquero](vaquero.md) is the baseline for equipment-slot dual-wield classes.
- [Bounty Hunter](bounty-hunter.md) is the baseline for HP-as-resource blood-round classes.
