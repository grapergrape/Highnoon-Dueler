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

## U.S. Marshal Gameplay

U.S. Marshal is tuned as a mark-scaling federal control class.

- Passive: +5% accuracy, +1 Nerve each prep round, and +1 extra mark whenever he marks the enemy.
- Marks increase Marshal hit damage during High Noon, capped at +14 damage.
- Marks reduce enemy hit damage during High Noon, capped at 12 damage reduction.
- Marks clear after each shootout, so every High Noon cycle asks the player to rebuild pressure.
- `Dead to Rights`, `Federal Warrant`, `Deputy Crossfire`, `Badge Cover`, and `Paper Trail` are the main mark-building tools.
- `Warrant Served`, `No-Knock Entry`, `Federal Ledger`, and Marshal Showdowns convert marks into better closing power.
- Marshal guns are premium government handguns only. The legendary `Treasury Gold Schofield` uses golden bullets: each successful player hit adds $5 bounty to the duel reward.

The intended feel is case-building under fire: mark the fugitive, make their shots weaker, then use enough bullets or mark payoffs to finish before the late bosses grind through the mitigation cap.

## Apache Tracker Gameplay

Apache Tracker is tuned as a Spirit-ramp bow/rifle class.

- Passive: +5% accuracy, never below 55% accuracy, and the first non-gun/non-persistent card each prep round costs 0 Nerve.
- Spirit caps at 10, lasts for the current duel, and resets at the start of the next duel.
- Spirit adds capped hit damage, capped bullets, small post-volley healing, and enemy accuracy pressure.
- `Wind Whisper`, `Spirit Talk`, `Ridge Sight`, `Silent String`, `Raven Feint`, and `Moonlit Arrow` are the main Spirit-building tools.
- `Owl's Vision`, `Coyote's Curse`, `Eagle's Strike`, `Buffalo Patience`, `Medicine Bundle`, and Apache Showdowns convert Spirit into aim, damage, sustain, and disruption.
- Apache guns are bows and rifles only. He starts with `Henry Repeater`; upgrade guns include `Mescalero War Bow`, `Sharps Buffalo Rifle`, and `Cochise's War Bow`.

The intended feel is reading the fight before firing: build enough Spirit to make the enemy less reliable, choose whether the next prep play is defense or payoff, then let the bow/rifle finish the duel. Spirit generators should never be blank setup cards; they need immediate tactical value because card plays are limited.

## Vaquero Gameplay

Vaquero is tuned as an equipment-slot dual-wield class.

- Passive: starts each duel dual-wielding `Remington Model 1875` plus `Off-Hand Iron`, and heals 8 HP at duel start.
- The first gun card each duel costs 0 Nerve, refunds its card play, and replaces the off-hand gun for that duel.
- Dual-wield magazines stack, while damage and accuracy are averaged between the two guns.
- Dual-wield has an 8% accuracy penalty until reduced or removed by cards, stances, or off-hand upgrades.
- `Steady the Off-Hand`, `Quick Holster`, `Crossfire`, `Left-Hand Cover`, and `Off-Hand Reload` are the starter tools for penalty control, tempo, bullet pressure, and cover.
- `Crossdraw Burst`, `Dance of Lead`, `Pistolero Waltz`, `Matched Grips`, and Vaquero Showdowns convert a stable off-hand into burst turns.
- Vaquero guns are handguns that upgrade the off-hand only. He should want `Colt Lightning Revolver`, `LeMat Dragoon`, or `Villa's Mauser C96`, but should not require the legendary to function.

The intended feel is a two-gun tempo puzzle: keep enough cover to survive the alternating volley, steady the penalty so both guns matter, then use first-hit pressure and big magazines to close. Raw bullet count alone should not carry the class.

## Bounty Hunter Gameplay

Bounty Hunter is tuned as a blood-price quickdraw class.

- Passive: +1 Nerve each prep round.
- Bounty Hunter cards can spend HP with `payHp` for tempo, bullets, damage, and first-hit pressure.
- Life-steal bullets use `lifestealOnHit`: each successful player hit restores HP immediately during the volley.
- At 50% HP or lower, Bounty Hunter gains +15% accuracy, +4 damage, and the first 2 player shots auto-hit.
- If both duelists die in the same volley, Bounty Hunter wins and heals 25% max HP.
- `Blood for Lead`, `Vendetta Shot`, `Reckless Aim`, `Final Notice`, `Bloodlust`, and `No Tomorrow` are the main blood-round pressure cards.
- `Dead Man's Cover`, `Patch Job`, `Grit Teeth`, `Stitched Coat`, and `Undertaker's Credit` keep the HP wager survivable.
- Bounty Hunter guns are concealed pistols. He starts with `.41 Derringer`; upgrades include `Twin Contract Derringer`, `Pepperbox Revolver`, and `Doc Holliday's Hideout`.

The intended feel is wagering blood against execution: pay HP to load a lethal volley, use cover when the hand cannot close, then heal back only if the shots land. He should not become a passive sustain tank or a pure self-damage damage stack.

## Deckbuilding and Shops

- Starting decks are 12 cards.
- Deck cap is 24 cards.
- Player card rewards and shop card offers are class-only.
- Each duel win has a 20% chance to add a separate class-only gun drop screen after the card reward.
- Feats can repeat.
- Stances and Showdowns are unique. Once owned, they stop appearing in reward/shop offers.
- Guns in the player shop are class-only and exclude class starter guns.
- Gun drops use the same rarity weights as card rewards, exclude the class starter/currently equipped gun, and can be taken or skipped.
- Starter guns begin equipped and are not counted in the starter deck.
- Gun cards in the deck equip for the current duel only. The next duel starts from the class starter gun again until another gun card is played.
- Starter guns are baseline equipment and do not give combo bonuses.
- Upgraded Outlaw guns turn combo triggers into extra volley shots instead of only giving flat stats.
- Sheriff guns provide a defensive shotgun floor: modest damage reduction, bullet dodge, and limited sustain.
- Sheriff scaling should mostly come from class cards such as Badge Line, Town's Strength, Jailhouse Cover, Town Doctor, and Bullet-Stopping Badge.
- Marshal guns are premium government handguns. They support marks and bounty generation, but the deck should still provide the mark density and defensive control.
- Apache guns are bows/rifles. They support Spirit payoff, but the deck should still provide Spirit generation, defense, and scaling.
- Vaquero guns are off-hand handgun upgrades. They equip for the current duel only, and the starter off-hand is excluded from shops and rewards.
- Bounty Hunter guns are concealed pistols that support life-steal and quickdraw pressure, but the deck should still provide HP-spend payoff, cover, and recovery.
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

## Current U.S. Marshal Starter Deck

| Card | Count |
| --- | ---: |
| One in the Chamber | 3 |
| Dodge | 2 |
| Beer Heal | 1 |
| Dead to Rights | 2 |
| Federal Warrant | 2 |
| Deputy Crossfire | 1 |
| Badge Cover | 1 |

U.S. Marshal starts with the Colt Single Action Army equipped.

## Current Apache Tracker Starter Deck

| Card | Count |
| --- | ---: |
| One in the Chamber | 2 |
| Dodge | 2 |
| Beer Heal | 1 |
| Wind Whisper | 2 |
| Spirit Talk | 1 |
| Ridge Sight | 1 |
| Owl's Vision | 1 |
| Bear Spirit | 1 |
| Medicine Bundle | 1 |

Apache Tracker starts with the Henry Repeater equipped.

## Current Vaquero Starter Deck

| Card | Count |
| --- | ---: |
| One in the Chamber | 2 |
| Dodge | 2 |
| Beer Heal | 1 |
| Steady the Off-Hand | 2 |
| Quick Holster | 2 |
| Crossfire | 1 |
| Left-Hand Cover | 1 |
| Off-Hand Reload | 1 |

Vaquero starts with the Remington Model 1875 plus Off-Hand Iron equipped.

## Current Bounty Hunter Starter Deck

| Card | Count |
| --- | ---: |
| One in the Chamber | 2 |
| Dodge | 2 |
| Beer Heal | 1 |
| Blood for Lead | 2 |
| Dead Man's Cover | 2 |
| Vendetta Shot | 1 |
| Reckless Aim | 1 |
| Patch Job | 1 |

Bounty Hunter starts with the .41 Derringer equipped.

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
9. Marshal can build a mark deck where marks provide both damage and tankiness without turning final bosses into automatic wins.
10. Apache Tracker can build a Spirit deck where bows/rifles are payoff tools, not replacements for Spirit generation and defensive prep.
11. Vaquero can build a dual-wield deck where off-hand swaps, penalty control, cover, and first-hit pressure all matter.
12. Bounty Hunter can build a blood-round deck where HP spending is paid back through landed life-steal hits, not passive sustain.
