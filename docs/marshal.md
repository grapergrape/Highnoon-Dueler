# U.S. Marshal Balance Baseline

## Identity

U.S. Marshal is the mark-scaling federal control class. He builds a case with Marks, then uses those Marks for both deterministic bullet damage and incoming damage reduction.

Marshal is not an accuracy class anymore. His decisions should be about when to mark, when to load, and when to cash Marks into a lethal Showdown.

## Current Core Rules

- Passive: `Federal Warrant`
- Starting HP: 74
- Nerve: max 7, gain 3 per round, carries over.
- Start Position: 1.
- Marks persist during the duel.
- Each Mark adds +1 player bullet damage, capped at +4.
- Each Mark reduces enemy bullet damage by 1, capped at 4.
- Starter gun: `Colt Single Action Army`, capacity 5, bullet damage 6.

## Starter Deck

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

## Card Identity

Marshal cards should mostly do one of these jobs:

- Apply Marks efficiently.
- Combine Marks with bullets so setup does not become a dead turn.
- Reduce enemy damage through Marks or `enemyWeak`.
- Add enough Armor to survive while building the case.

Because Marks provide both damage and defense, caps are the main balance guardrail.

## Build Paths

- `marks`: current Dead to Rights path. Marks provide deterministic damage and incoming damage reduction.
- `procedure`: slower Case File path. Procedure Path stances advance from I to III across later rounds, granting Case File equal to the current stage before warrant payoffs spend it on loaded bullets, Armor, or enemy damage reduction.

Procedure should be less immediately efficient than Marks, but better at creating planned payoff turns.

## Gun Identity

Marshal guns are premium government-issued handguns:

| Gun | Role |
| --- | --- |
| `Colt Single Action Army` | Starter government sidearm. |
| `Smith & Wesson Schofield No. 3` | Premium mark-support revolver. |
| `Treasury Gold Schofield` | Legendary golden-bullet revolver that adds bounty per hit. |

## Tuning Levers

Buff Marshal through better mark-plus-load cards or modest Armor. Nerf Marshal through `markDamageCap`, `markDamageReduceCap`, and repeated low-cost Mark density.

Do not raise both Mark damage and Mark reduction at the same time unless the class is severely underperforming.

## Current Simulation Baseline

May 17, 2026 routed Node simulation, 200 U.S. Marshal runs:

- Clears: 69/200 (34.5%).
- Average wins: 14.23/15.
- Main deaths: `Judge Obadiah Blackthorn`, then `Caleb Cross`.

Honest read: on target. Marshal reaches the final boss often, but weak mark/bullet setups still die there.
