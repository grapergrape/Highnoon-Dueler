# High Noon Duelist - Current Gameplay Notes

This file describes how the game currently plays. It is not the original MVP request.

## Project Layout

```text
project_root/
├── src/
│   └── server.py
├── static/
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── main.js
│       ├── app/
│       │   ├── app.js
│       │   ├── run-state.js
│       │   └── unlock-state.js
│       ├── data/
│       │   ├── cards.js
│       │   ├── classes.js
│       │   ├── deck.js
│       │   ├── guns.js
│       │   └── opponents.js
│       ├── duel/
│       │   └── duel.js
│       ├── rendering/
│       │   └── render.js
│       └── ui/
│           ├── combat-ui.js
│           ├── input.js
│           └── ui.js
└── docs/
```

## Core Duel Loop

Each duel repeats this cycle until one side dies:

1. Stare-down
   - The player chooses 1 free stare-down card.
   - The enemy secretly commits one card from its deck.
   - Stare-down effects resolve just before High Noon.

2. Preparation
   - Each High Noon cycle has 3 prep rounds.
   - At the start of every prep round, the player draws 4 cards.
   - Nerve refills at the start of every prep round.
   - Base card plays ramp by prep round: 1 play in round 1, 2 in round 2, and 3 in round 3.
   - Cards with `extraPlay` or `focusCycle` can grant more plays on top of the current prep round's base.
   - Unplayed hand cards are discarded when the player locks in.
   - The enemy may play 1 card in a prep round based on its `prepAggression`.

3. High Noon
   - Both sides fire their prepared bullet volleys.
   - Bullets alternate between player and enemy.
   - Accuracy rolls decide hits unless a card grants automatic hits.
   - Dodge cancels incoming bullets before accuracy is rolled.
   - If both die in the same volley, class rules and remaining HP decide the winner.

If both survive High Noon, Showdowns level up, temporary effects clear, and a new 3-round prep cycle begins.

## Nerve, Plays, Dodge, and Accuracy

- Nerve is the card-cost resource. It refills every prep round.
- Card plays are separate from Nerve. Having enough Nerve does not matter if no plays remain.
- The default player prep sequence is `1/1 Plays`, then `2/2 Plays`, then `3/3 Plays`.
- `extraPlay+1` raises the current prep round by 1 playable card above its base.
- `focusCycle+1` grants +1 Nerve this cycle and +1 card play.
- Dodge is deterministic bullet cancellation. `dodgeRecv+2` means the next 2 incoming bullets are dodged.
- Accuracy is still probabilistic during High Noon. The design goal is that defense is deterministic, while offense still has gunfight uncertainty.

## Outlaw Gameplay

Outlaw is tuned around prep rounds ramping from 1 to 3 base card plays.

- Passive: +1 Nerve each prep round.
- Combo tracking: Outlaw combo cards trigger `comboBonus:` effects once 2 or more Outlaw cards are played in the same prep round.
- `Outlaw's Pact` grants the next Outlaw combo card for 0 Nerve, +1 play, and 1 Dodge.
- `Gunslinger's Tempo` grants accuracy, Dodge, +1 play, and combo bullets.
- `Loaded Sleeve` is the main extra-play offensive payoff.
- `Cheat the Count`, `Pocket Reload`, `Smoke Break`, `Low Blow`, and `Crooked Smile` give alternate ways to extend, defend, or disrupt.
- `Lucky Scar`, `Hideout Cache`, and `Black-Market Doc` are unique defensive Outlaw stances.

The intended feel is closer to a Slay the Spire hand puzzle than a raw RNG dodge system: build an engine, chain an extra play, then choose whether the next card protects, accelerates, or kills.

## Sheriff Gameplay

Sheriff is tuned as a high-HP shotgun class for prep rounds ramping from 1 to 3 base card plays.

- Passive: each duel win earns Respect, up to 10. Each Respect grants +5 max HP.
- While above 100 current HP, Sheriff gains +3% shotgun accuracy per HP, up to +35%.
- `Badge Flash`, `Bulwark`, `Packed Shells`, `Deputy Cover`, `Iron Resolve`, and `Badge Line` are the main play-extenders.
- `Packed Shells`, `Town's Strength`, `Double-Barrel Warning`, and `Star of Justice` add enough bullets to beat enemy bullet denial and dodge.
- Defensive cards mostly cancel set bullet counts or reduce hit damage; the class should win by staying above 100 HP and turning that durability into accurate shotgun volleys.

The intended feel is not "roll dodge and pray." Sheriff should decide whether a prep round preserves Respect Aim, adds buckshot volume, or sets up a defensive line before High Noon.

## Deckbuilding and Shops

- Starting decks are 12 cards.
- Deck cap is 24 cards.
- Player card rewards and shop card offers are class-only.
- Feats can repeat.
- Stances and Showdowns are unique. Once owned, they stop appearing in reward/shop offers.
- Guns in the player shop are class-only.
- Starter guns begin equipped and are not counted in the starter deck.
- Each merchant visit allows 1 card/gun purchase.
- Whiskey healing is separate from the one card/gun purchase.
- Health carries between duels.

## Current Outlaw Starter Deck

| Card | Count |
| --- | ---: |
| One in the Chamber | 3 |
| Dodge | 2 |
| Beer Heal | 1 |
| Gunslinger's Tempo | 2 |
| Pistol Whip | 2 |
| Outlaw's Pact | 1 |
| Roll the Dice | 1 |

Outlaw starts with the Volcanic Pistol equipped.

## Current Sheriff Starter Deck

| Card | Count |
| --- | ---: |
| One in the Chamber | 2 |
| Dodge | 1 |
| Beer Heal | 1 |
| Bulwark | 2 |
| Badge Flash | 2 |
| Packed Shells | 2 |
| Town's Strength | 1 |
| Deputy Cover | 1 |

Sheriff starts with the Town Guard Scattergun equipped.

## Progression

- The Wanted Board is the run map.
- Towns contain easy, medium, and boss opponents.
- Boss clears unlock class Showdown cards for future reward/shop pools.
- Unlocks are between-run progression. They do not directly add cards to the starter deck.
- Run state and unlock state persist in localStorage.

## Visual and UI Goals

- Western wanted-poster interface with a canvas duel scene.
- During prep, the UI should make current Nerve, remaining Plays, combo count, and free combo status visible.
- During High Noon, the player should see bullets, hits, misses, dodges, damage, and final duel summary clearly.
- Dodge text should read as bullet counts, not percentages.

## Definition of Done for Gameplay Changes

1. Server runs and the game loads locally.
2. Full loop works: stare-down -> 3 prep rounds -> High Noon -> repeat until death.
3. Nerve refill, prep play ramp, extra-play cards, and lock-in flow work.
4. Dodge is deterministic bullet cancellation everywhere it is displayed and resolved.
5. Rewards and shop card offers are class-only.
6. Feats can repeat, while stances and Showdowns remain unique.
7. Wanted Board, rewards, shop, healing, and between-run Showdown unlocks work.
8. Outlaw can build a real combo deck without relying on random dodge chance.
