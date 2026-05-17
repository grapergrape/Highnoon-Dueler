# Sheriff Balance Baseline

## Identity

Sheriff is the defensive shotgun class. He should feel like he is holding the street: build Armor, keep Position, preserve HP, then answer with a controlled shotgun blast.

Sheriff guns provide a defensive floor, but Sheriff cards and Respect scaling decide whether the run closes late fights.

## Current Core Rules

- Passive: `Hold the Street`
- Starting HP: 82
- Each duel win grants 1 Respect, capped at 10.
- Each Respect grants +3 max HP.
- Nerve: max 7, gain 3 per round, carries over.
- Start Position: 1.
- Starter gun: `Town Guard Scattergun`, capacity 3, bullet damage 9.

## Starter Deck

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

## Card Identity

Sheriff cards should mostly do one of these jobs:

- Build Armor and Position together.
- Preserve HP so Respect scaling matters across the run.
- Load enough shells that defensive turns still end fights.
- Add modest damage to shotgun turns without turning the class into pure burst.

Repeatable defense must stay controlled. If Sheriff can ignore intent and stack Armor forever, the class becomes slow and automatic.

## Build Paths

- `street`: current Hold the Street path. Armor, Position, Respect, and controlled shell loading preserve HP across the route.
- `posse`: deputy-engine path. Deputies add recurring Armor, conditional loaded shells, and payoff cards that scale with deputy count.

Posse should help Sheriff reach closing power without buffing shotgun damage directly.

## Gun Identity

Sheriff guns are defensive shotguns:

| Gun | Role |
| --- | --- |
| `Town Guard Scattergun` | Starter defensive baseline. |
| `Winchester 1887` | Epic upgrade with stronger shell damage and Armor. |
| `Masterson's Thunderer` | Legendary closer with start-loaded pressure and Armor. |

## Tuning Levers

Buff Sheriff through card offense first: `Packed Shells`, `Town's Strength`, or rare shotgun payoffs. Buff Respect only when final-town attrition is too harsh.

Nerf Sheriff through repeatable Armor and healing, not shotgun damage, unless fights become too short.

## Current Simulation Baseline

May 17, 2026 routed Node simulation, 200 Sheriff runs:

- Clears: 69/200 (34.5%).
- Average wins: 14.32/15.
- Main deaths: `Judge Obadiah Blackthorn`, then a small number at `Caleb Cross`.

Honest read: on target. Sheriff reliably reaches the final boss, but Blackthorn still filters decks without enough closing power.
