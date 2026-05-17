# Vaquero Balance Baseline

## Identity

Vaquero is the dual-wield handgun class. He starts with two guns and uses Position, off-hand pressure, and careful footing to make large bullet turns worth the risk.

He should feel fluid and aggressive, but not like a generic high-magazine class. Position management is the price of dual-wielding.

## Current Core Rules

- Passive: `Dos Pistolas`
- Starting HP: 82
- Nerve: max 7, gain 3 per round, carries over.
- Start Position: 2.
- Starts each duel with `Remington Model 1875` plus `Off-Hand Iron`.
- First gun card each duel costs 0 Nerve and replaces the off-hand gun for that duel.
- Dual-wield capacity stacks; bullet damage is averaged between the two guns.
- Starter off-hand is intentionally modest: capacity 2, bullet damage 5.

## Starter Deck

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

## Card Identity

Vaquero cards should mostly do one of these jobs:

- Recover or spend Position around dual-gun bursts.
- Load several bullets without losing all defense.
- Add small temporary damage to make high bullet count matter.
- Use Armor to survive while the off-hand setup comes together.
- Reward gun swaps without making legendary off-hands mandatory.

## Gun Identity

Vaquero guns are off-hand handgun upgrades:

| Gun | Role |
| --- | --- |
| `Remington Model 1875` | Starter right-hand gun. |
| `Off-Hand Iron` | Starter off-hand baseline. |
| `Colt Lightning Revolver` | Rare Position-support off-hand. |
| `LeMat Dragoon` | Epic heavy off-hand that costs Position. |
| `Villa's Mauser C96` | Legendary capacity/over-cap off-hand. |

## Tuning Levers

Buff Vaquero through Position recovery, off-hand utility, and small Armor on load cards. Nerf him through Nerve gain, start Position, and repeated damage on cheap multi-load cards.

Avoid solving Vaquero with pure damage. His fun is deciding when the two-gun burst is worth the Position hit.

## Build Paths

- `dual`: current Dos Pistolas path. High bullet volume, off-hand support, and Position recovery drive the deck.
- `flourish`: precision footwork path. Flourish cards reward high Position with higher per-bullet damage and recurring style stances.

Flourish should lower bullet volume and make Vaquero less solved when dual-wield load cards do not appear. Its payoff is conditional: at Position 3 or higher, flourish cards add bullet damage only to precision volleys of 3 or fewer bullets; below that line they mostly recover footing.

## Current Simulation Baseline

May 17, 2026 routed Node simulation, 200 Vaquero runs:

- Clears: 77/200 (38.5%).
- Average wins: 13.82/15.
- Main deaths: `Judge Obadiah Blackthorn`, `Caleb Cross`, then `Silas Gravesmoke`.

Honest read: high edge of acceptable. He is fun when the off-hand burst works, but future buffs should be avoided unless manual runs show his decisions feel too punishing.
