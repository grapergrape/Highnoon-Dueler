# Vaquero Balance Baseline

## Identity

Vaquero is the dual-wield handgun class. He should feel like a pistolero fighting with both hands at once: one gun creates pressure, the other covers the weakness.

The class is not a generic bullet-volume class. Vaquero should care about the off-hand slot, the dual-wield accuracy penalty, and whether the current hand supports accuracy, initiative, or defensive cover before the volley.

## Current Core Rules

- Passive: `Dos Pistolas`
- Starting HP: 110
- Starts each duel dual-wielding `Remington Model 1875` plus `Off-Hand Iron`.
- The first gun card each duel costs 0 Nerve and refunds its card play.
- Gun cards replace the off-hand gun for the current duel.
- Dual-wield magazines stack.
- Dual-wield damage and accuracy are averaged between the two guns.
- Dual-wield has a -5% accuracy penalty until reduced or removed.
- Passive sustain: +10 HP at the start of each duel.

The free first gun swap is important. Without it, off-hand upgrades are tempo traps under the prep-play limit. With it, drawing a gun feels like a class moment instead of a lost setup turn.

## Starter Deck

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Dodge` | 2 |
| `Beer Heal` | 1 |
| `Steady the Off-Hand` | 2 |
| `Quick Holster` | 2 |
| `Crossfire` | 1 |
| `Left-Hand Cover` | 1 |
| `Off-Hand Reload` | 1 |

The starter deck should teach the loop immediately: steady the penalty, use cheap extra-play cards, then decide whether to add more bullets or defensive cover. It should feel dual from fight one, not only after a gun reward.

## Card Identity

Vaquero cards should mostly do one of these jobs:

- Reduce or remove the dual-wield penalty: `dualWieldAccPenaltyReduce`, `removeDualPenalty`.
- Add off-hand tempo: `extraPlay+1`, `focusCycle+1`.
- Add initiative so large magazines matter: `firstHitsAuto`.
- Add dual pressure: bullets, damage multiplier, ricochet.
- Add cover so the volley can last long enough: `dodgeRecv`, `enemyBullets`, `enemyAccNext`.
- Build persistent two-gun engines through stances.

Healthy examples:

- `Steady the Off-Hand`: accuracy, penalty reduction, and extra play.
- `Quick Holster`: zero-cost extra play and small penalty reduction.
- `Left-Hand Cover`: deterministic defense and extra play.
- `Crossdraw Burst`: bullet pressure, damage multiplier, penalty reduction, and a first auto-hit.
- `Pistolero Waltz`: efficient accuracy, dodge, extra play, and penalty reduction.
- `Matched Grips`: permanent penalty removal payoff.

Avoid making Vaquero only draft raw bullet cards. Bullet volume is his visible fantasy, but accuracy and survivability decide whether those bullets matter.

## Gun Identity

Vaquero guns are handguns used as off-hand upgrades. The starter right-hand gun stays stable; reward/shop guns replace the off-hand for that duel.

Current gun split:

| Gun | Role |
| --- | --- |
| `Remington Model 1875` | Starter right-hand baseline: modest damage, aim, and cover. |
| `Off-Hand Iron` | Starter off-hand baseline: small damage, first auto-hit, and cover. |
| `Colt Lightning Revolver` | Rare off-hand: precision, penalty reduction, auto-hit, and dodge. |
| `LeMat Dragoon` | Epic off-hand: heavy bullet pressure with some accuracy smoothing and cover. |
| `Villa's Mauser C96` | Legendary off-hand: large magazine, auto-hits, penalty removal, and burst accuracy. |

Upgrade guns equip only for the current duel. The next duel starts from `Remington Model 1875` plus `Off-Hand Iron` again until another gun card is played.

## Balance Targets

Vaquero should:

- Feel dual-wielding from the first duel.
- Want off-hand gun cards without being forced to find the legendary.
- Win by combining gun swaps, penalty reduction, initiative, and cover.
- Have explosive final-town kills when the deck has enough setup.
- Still take real damage because his defense is cover/tempo, not armor.

Vaquero should not:

- Be a plain high-magazine class with no penalty-management choices.
- Lose because the off-hand gun card consumed the whole prep turn.
- Clear reliably by drafting only bullets.
- Become safer than Sheriff or Marshal.
- Depend on relics, smithing, or potions.

## Tuning Levers

Buff Vaquero through:

- More penalty reduction on low-rarity setup cards.
- More `firstHitsAuto` on off-hand payoffs.
- Better deterministic cover on common/uncommon cards.
- Slightly stronger free off-hand gun upgrades.
- More `extraPlay+1` on cards that otherwise compete with gun swaps.

Nerf Vaquero through:

- Lowering starter or off-hand auto-hit access.
- Increasing the dual-wield penalty.
- Reducing repeated `Crossdraw Burst` or `Pistolero Waltz` payoff.
- Lowering `Villa's Mauser C96` auto-hits or penalty removal.
- Reducing sustain if final wins end too healthy.

Be careful when changing:

- `firstHitsAuto`: it fixes the alternating-volley problem and can make burst too reliable.
- `removeDualPenalty`: once active, every future accuracy card becomes stronger.
- Free first gun card: removing this makes gun rewards feel bad.
- Bullet counts: large magazines still alternate with enemy shots, so bullets are weaker than they look unless paired with defense or auto-hits.

## Current Playtest Baseline

May 16, 2026 routed Node simulation, 200 Vaquero runs with card rewards, 20% gun drops, and whiskey healing, no shop purchases:

- Clears: 69/200 (34.5%).
- Average wins: 11.70/15.
- Main deaths: `Silas Gravesmoke`, `Caleb Cross`, `Marshal Elias Graves`, then `Red Jack Calder`.
- Winning decks leaned on `Crossdraw Burst`, `Dance of Lead`, `Steady the Off-Hand`, `Left-Hand Cover`, and either `LeMat Dragoon` or `Villa's Mauser C96`.

Honest read: on target. Vaquero can high-roll into loud final-town kills, but still folds if he misses cover, first-hit pressure, or off-hand upgrades.

## Baseline For Other Classes

Vaquero is the reference for an equipment-slot class:

- Strong fantasy visible from duel one.
- Upgrade guns modify a specific slot rather than replacing the whole class.
- Setup cards fix the equipment drawback.
- Burst and defense must both matter.
- Large magazines need initiative or protection to be real.

When designing another equipment-focused class, compare it to Vaquero. If the equipment is only a stat stick, it needs a sharper slot rule or drawback to create deckbuilding decisions.
