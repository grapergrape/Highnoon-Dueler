# Combat Rework Technical Plan

This plan replaces the current prep-round/Oath/dodge-stack combat with a shorter deterministic round loop built around enemy intent, loaded bullets, Armor, Position, and Nerve.

The goal is not to tune the current system. The current system creates too many rounds of both sides stacking bullets, dodges, accuracy, and hidden pressure until someone dies in one burst. The rework should make each round readable before the player commits.

## Implementation Status

Implemented May 17, 2026:

- The active duel phases are `player_turn`, `showdown`, and `ended`.
- Prep rounds, card play limits, hidden staredown commits, and active Oath cards are disabled in the current combat path.
- Enemy action comes from authored visible intent tables in `static/js/data/opponents.js`.
- Player attacks load bullets into guns with `capacity`, `startLoaded`, and `bulletDamage`.
- Armor, Position, rare Position-costed Dodge, Nerve carryover, and Rattled are active.
- Rewards and shops exclude legacy `showdown` cards.
- The routed sim has been updated for the new loop; the accepted 200-run no-shop baseline is documented in [towns.md](towns.md) and [simulation-balancing.md](simulation-balancing.md).

## Target Round Loop

Each duel round follows this sequence:

1. Enemy intent is revealed.
2. Player gains Nerve.
3. Player draws a hand.
4. Player plays any number of cards they can afford.
5. A short Showdown timer plays, target `1.0s`.
6. Player fires all loaded bullets.
7. Enemy intent resolves.
8. Armor clears.
9. The next round starts, unless either side is dead.

There are no prep rounds, no per-round card play limits, no current Oath cards, and no hidden enemy prep-card execution in the first pass.

## Core Combat State

`duel` should move toward this state shape:

```js
{
  phase: "player_turn" | "showdown" | "ended",
  roundNumber: 1,

  playerHand: [],
  playerDrawPile: [],
  playerDiscard: [],

  nerve: 4,
  maxNerve: 7,
  nerveGain: 3,
  rattled: 0,

  playerArmor: 0,
  enemyArmor: 0,

  position: 1,
  maxPosition: 3,
  evadeBullets: 0,
  evadeAttack: false,

  playerGun: {
    id: "gun_id",
    name: "Gun Name",
    capacity: 5,
    loaded: 0,
    startLoaded: 0,
    bulletDamage: 6
  },

  enemyIntent: {
    id: "intent_id",
    type: "attack",
    bullets: 3,
    damage: 7
  }
}
```

Keep compatibility fields only as migration shims while the implementation is in progress. The finished combat path should not depend on old `prepRound`, `playerPlaysRemaining`, `playerShowdown`, `enemyShowdown`, `dodgeRecv`, or accuracy debuff state.

## Position

Position is the main non-STS defense/damage mechanic.

| Position | Meaning | Bullet damage |
| ---: | --- | ---: |
| 0 | Exposed | x0.80 |
| 1 | Steady | x1.00 |
| 2 | Lined up | x1.15 |
| 3 | Perfect angle | x1.50 |

Baseline combat starts at Position `1`. Cards can gain or spend Position. Position is clamped between `0` and `3` unless a very rare effect explicitly changes the cap for the duel.

Position modifies player bullet damage during Showdown. If a Dodge card lowers Position, the outgoing damage preview must immediately update before the player ends the round.

## Guns And Loaded Bullets

Player attacks are loaded into the active gun.

Gun fields:

- `capacity`: normal maximum loaded bullets.
- `loaded`: current bullets loaded.
- `startLoaded`: bullets loaded at duel start. Most starter guns use `0`.
- `bulletDamage`: base damage per bullet before Position.

At Showdown, the player fires all loaded bullets. Fired bullets are spent and `loaded` returns to `0`.

Loading above capacity is ignored unless a rare effect grants over-cap loading. Over-cap mechanics should be extremely rare because capacity is the main guardrail against one-shot stacks.

Gun cards can keep the current rule that upgraded guns equip for the current duel only, then the next duel returns to the class starter gun. The gun data must be converted from the old `mag/damage/accuracy` model to the new `capacity/startLoaded/bulletDamage` model.

## Armor

Armor is one-round damage reduction.

Damage calculation:

```text
incoming damage = enemy bullets * enemy damage
hp loss = max(0, incoming damage - player armor)
```

Armor clears after Showdown. Enemy Armor follows the same one-round rule unless a specific boss intent says otherwise.

## Dodge

Dodge is not Exhaust. Dodge spends Position.

Cards should create one of two temporary states:

- `evadeBullets+N`: cancel the next N incoming enemy bullets this Showdown.
- `evadeAttack`: cancel the next incoming enemy attack this Showdown.

The card itself pays the Position cost immediately.

Examples:

```text
Sidestep
Cost 1
Evade 1 bullet.
Lose 2 Position.
```

```text
Dive Clear
Cost 2
Evade the next attack.
Set Position to 0.
```

This keeps Dodge powerful against large single attacks but bad as a default plan against repeated multi-hit pressure.

## Nerve

Nerve should be composure, not a direct STS Energy copy.

Baseline:

- `maxNerve`: `7`
- combat starts at `4`
- gain `3` at the start of each round
- unspent Nerve carries over

If the player takes unblocked HP damage, apply `Rattled`.

Baseline `Rattled`:

```text
Next round: gain 1 less Nerve.
```

Stacking can either increase the Nerve penalty or duration, but the first implementation should keep it simple: each damaged Showdown sets `rattled = max(rattled, 1)`.

## Enemy Intents

Enemies no longer draw and play hidden prep cards in the target combat path. Each opponent gets an authored intent table and a pattern.

Suggested data shape:

```js
{
  intents: {
    quick_shot: {
      type: "attack",
      bullets: 1,
      damage: 7,
      label: "Quick Shot",
      description: "Attack 1x7."
    },
    take_cover: {
      type: "armor",
      armor: 10,
      label: "Take Cover",
      description: "Gain 10 Armor."
    },
    line_up: {
      type: "buff",
      damageNext: 2,
      label: "Line Up",
      description: "Future attacks deal +2 damage per bullet."
    }
  },
  intentPattern: [
    "quick_shot",
    "take_cover",
    "line_up",
    "quick_shot"
  ]
}
```

Attack intent format:

```text
3x7
```

This means three bullets, seven damage each, always accurate.

Enemy intent selection can start as a deterministic loop. Later bosses can use readable branches, but the next intent must still be known before the player acts.

## Effect Vocabulary

New primary effect names:

| Effect | Meaning |
| --- | --- |
| `load+N` | Load N bullets into the player gun, clamped by capacity. |
| `armor+N` | Gain N Armor this round. |
| `position+N` | Gain N Position. |
| `position-N` | Lose N Position. |
| `positionSetN` | Set Position to N. |
| `evadeBullets+N` | Evade N incoming bullets this Showdown. |
| `evadeAttack` | Evade the next incoming attack this Showdown. |
| `nerve+N` | Gain N Nerve now. |
| `nextNerve+N` | Gain N extra Nerve next round. |
| `draw+N` | Draw N cards. |
| `rattled+N` | Apply Rattled. |
| `enemyWeak+N` | Reduce enemy bullet damage next attack by N. |
| `enemyArmor-N` | Reduce enemy Armor. |
| `overcap+N` | Allow N bullets above capacity this round. Rare. |

Effects to remove from normal combat:

- `enemyAccNext`
- random dodge percentage
- common `dodgeRecv`
- repeatable enemy bullet suppression as the main defense
- player/enemy accuracy as a core damage stat
- current Oath level effects
- current Staredown hidden cards

Some old effects can map to new effects during card conversion:

| Old effect | New direction |
| --- | --- |
| `bullets+N` | `load+N` |
| `dodgeRecv+N` | usually `armor+N`, rarely `evadeBullets+N` plus Position cost |
| `damageTaken-N` | `armor+N` or a class-specific defensive status |
| `enemyAccNext-N` | `enemyWeak+N`, `rattled+N`, or delete |
| `enemyBullets-N` | rare intent interaction, not common defense |
| `accShootout+N` | Position, Mark, Spirit, or class-specific deterministic damage |
| `firstHitsAuto` | delete; hits are deterministic |

## Showdown Resolution

Showdown should calculate both sides from the current preview state.

Player outgoing:

```text
effective bullet damage = round(gun.bulletDamage * positionMultiplier)
outgoing damage = loaded bullets * effective bullet damage
enemy HP loss = max(0, outgoing damage - enemyArmor)
```

Enemy incoming:

```text
enemy live bullets = enemy attack bullets - evadeBullets
if evadeAttack: enemy live bullets = 0
incoming damage = enemy live bullets * enemy bullet damage
player HP loss = max(0, incoming damage - playerArmor)
```

The player and enemy fire during the same Showdown moment. If both sides would die, keep existing class-specific tie logic only where it is a core class identity, such as Bounty Hunter quickdraw rules. Otherwise, ties should be handled consistently and documented.

## UI Requirements

The combat UI must not rely on the log to explain what happened.

Always visible during the player turn:

- enemy intent label and exact math, for example `3x7 = 21`
- player Armor
- enemy Armor
- Position name, value, and damage multiplier
- loaded bullets and capacity, for example `4/5`
- outgoing damage after Position and enemy Armor
- incoming HP loss after Armor and Dodge
- current Nerve, max Nerve, and next-round Nerve gain
- Rattled warning if the player will gain less Nerve next round

After each played card, the outgoing/incoming preview must update immediately.

## Class Position Identities

### Outlaw

Outlaw spends Position recklessly and can profit while exposed.

Design hooks:

- lose Position to load bullets or gain Nerve
- strong Position 0 cards
- dirty Dodge that drops Position hard
- burst cards that reward firing before recovering footing

### Sheriff

Sheriff holds ground.

Design hooks:

- Armor plus Position on the same card
- bonuses for staying Position 2-3
- counter-load when fully blocking
- fewer panic Dodge tools than Outlaw or Apache

### U.S. Marshal

Marshal turns Position into legal precision.

Design hooks:

- Position applies Marks
- Marks reduce enemy threat or increase bullet damage
- Position 3 makes Mark payoffs stronger
- fewer raw bullet-load cards than Outlaw or Vaquero

### Apache Tracker

Apache uses Spirit to move without losing the shot.

Design hooks:

- Spirit gains or preserves Position
- Dodge costs less Position while Spirit is available
- Position 3 converts Spirit into rifle/bow damage
- strong recovery after being forced to Position 0

### Vaquero

Vaquero manages unstable dual-wield footing.

Design hooks:

- high loading density
- dual-wield bursts lose Position
- steadying cards recover Position
- Position affects whether multi-bullet turns are efficient

### Bounty Hunter

Bounty Hunter pays HP to ignore normal Position costs.

Design hooks:

- pay HP for Position
- pay HP to Dodge without losing Position
- life-stealing bullets reward dangerous high-Position turns
- Rattled/low-HP cards create controlled risk, not random survival

## Implementation Milestones

### 1. Engine Skeleton

Files:

- `static/js/duel/duel.js`
- `static/js/app/app.js`

Tasks:

- replace `staredown_commit/prep/staredown_reveal/highnoon` flow with `player_turn/showdown/ended`
- add Armor, Position, loaded bullets, Nerve bank, and enemy intent state
- keep old fields only if needed to prevent UI crashes during migration
- implement round start, card play, end turn, Showdown resolution, and next round

### 2. Data Schema

Files:

- `static/js/data/guns.js`
- `static/js/data/cards.js`
- `static/js/data/classes.js`
- `static/js/data/opponents.js`

Tasks:

- convert gun stats to capacity/startLoaded/bulletDamage
- add new card effect parser entries
- convert all starter guns
- convert all six starter decks first
- build Town 1 intent tables
- disable Oath and Staredown card offering during the rewrite

### 3. UI And Rendering

Files:

- `static/js/ui/ui.js`
- `static/js/ui/combat-ui.js`
- `static/js/rendering/render.js`
- `static/style.css`

Tasks:

- replace prep panels with intent, Armor, Position, loaded bullets, and Nerve panels
- show exact incoming and outgoing damage previews
- keep the 1-second Showdown animation
- remove UI dependencies on hidden enemy card logs as primary explanation

### 4. Town 1 Balance Pass

Files:

- `static/js/data/opponents.js`
- `docs/rookie-town.md`

Tasks:

- rebuild Amos, Lottie, and Graves as intent-driven fights
- tune normal fights to 4-6 rounds
- tune Graves to 7-10 rounds
- verify all six starter decks can beat Town 1 through planning, not lucky spikes

### 5. Full Card Pool Conversion

Files:

- `static/js/data/cards.js`
- class docs in `docs/`

Tasks:

- convert class pools around Position identities
- keep rewards and shop class-only
- keep gun drops, but make gun upgrades affect capacity/startLoaded/bulletDamage/current-duel rules
- remove or replace old accuracy/dodge/Oath text

### 6. Towns 2-5 Conversion

Files:

- `static/js/data/opponents.js`
- `docs/towns.md`

Tasks:

- convert every opponent to authored intent tables
- preserve town identities through intent patterns, not hidden stat stacking
- retune HP/damage with the new health baseline

### 7. Simulation Rewrite

Files:

- `tools/balance-sim.mjs`
- `docs/simulation-balancing.md`

Tasks:

- replace prep-card heuristic with deterministic round planning
- track deaths by opponent, remaining HP, round counts, and average incoming damage
- rebalance toward the new target full-clear rate only after manual play feels good

## Balance Targets

Initial health and damage baselines:

| Item | Target |
| --- | ---: |
| Player HP | 65-80 |
| Town 1 normal HP | 35-65 |
| Town 1 boss HP | 90-120 |
| Starter gun capacity | 4-6 |
| Starter gun bullet damage | 5-7 |
| Basic Armor card | 6-8 |
| Strong Armor card | 10-14 |
| Normal fight length | 4-6 rounds |
| Boss fight length | 7-10 rounds |
| Whiskey heal cost | Previous bounty earned, $45 floor |

Full-run clear rates should not be used as the first success signal. First success signal is whether Town 1 is fun for all six classes without relics, smithing, or potions.

## Acceptance Criteria

The first implementation is ready to expand beyond Town 1 when:

- every enemy attack is predictable before the player acts
- the UI shows exact HP loss if the player ends the round now
- Armor is the normal defense
- Dodge is rare and Position-costed, not a repeatable stack
- Position creates real tension between defense and damage
- loaded bullet capacity prevents huge one-shot stacks
- Nerve carryover creates reasons not to play every card
- all six classes have distinct Position interactions in their starter decks
- Town 1 losses feel like greedy choices, weak deck direction, or poor Nerve/Position planning
