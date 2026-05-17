# Outlaw Balance Baseline

## Identity

Outlaw is the dirty combo class. He wins by spending Position, chaining outlaw cards, and turning low-composure turns into loaded bullets before the Showdown.

He should feel explosive but brittle. The starter gun is plain; the deck, not baseline equipment, carries the combo identity.

## Current Core Rules

- Passive: `Dirty Footing`
- Starting HP: 62
- Nerve: max 7, gain 3 per round, carries over.
- Start Position: 1.
- Starter gun: `Volcanic Pistol`, capacity 5, bullet damage 6.
- Outlaw combo cards use `outlawCombo`; the second outlaw card in a round triggers combo bonuses.

## Starter Deck

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

## Card Identity

Outlaw cards should mostly do one of these jobs:

- Spend Position for bullets, Nerve, draw, or enemy damage reduction.
- Reward second-card combo turns with small extra payloads.
- Create risky burst with `load`, `overcap`, and temporary `damage`.
- Offer dirty defense through Armor or rare Position-costed evasion.

Avoid giving Outlaw too much free loading outside combos. In the current sim, a single point of recurring combo load can move him from fair to overpowered.

## Build Paths

- `combo`: current Dirty Combo path. Cheap outlaw cards trigger second-card bonuses, spending Position for immediate tempo and burst.
- `infamy`: slower reputation path. `Infamy` builds from stances and hits, then gets spent on loaded bullets, damage, or Armor.

Infamy rewards should dilute combo consistency without replacing it. If combo remains near-solved under tactical play, nerf combo load density before buffing Infamy.

## Gun Identity

Outlaw guns are combo payoffs, not flat stat sticks:

| Gun | Role |
| --- | --- |
| `Volcanic Pistol` | Starter baseline, no combo bonuses. |
| `Sawed-Off Coach Gun` | Short burst and rare over-cap pressure. |
| `Jesse James' Schofield` | Legendary high-damage finisher with start-loaded pressure. |

## Tuning Levers

Buff Outlaw through combo reliability: slightly more Armor on combo cards, small Nerve refunds, or better draw.

Nerf Outlaw through loaded bullet density, over-cap access, and `Outlaw's Pact`. Avoid nerfing HP first; he is already the lowest-HP class.

## Current Simulation Baseline

May 17, 2026 routed Node simulation, 200 Outlaw runs:

- Clears: 59/200 (29.5%).
- Average wins: 13.24/15.
- Main deaths: `Judge Obadiah Blackthorn`, `Silas Gravesmoke`, `Red Jack Calder`, and `Caleb Cross`.

Honest read: acceptable but volatile. Outlaw can still spike hard, but he no longer brute-forces the route by stacking generic bullets.
