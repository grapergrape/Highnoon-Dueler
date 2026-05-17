# Apache Tracker Balance Baseline

## Identity

Apache Tracker is the Spirit-ramp bow/rifle class. He reads the duel, builds Spirit, preserves Position, and turns that setup into precise deterministic damage.

Spirit should matter immediately. Pure "gain Spirit" cards are bad if they do not also help with Armor, Position, draw, or loaded bullets.

## Current Core Rules

- Passive: `Spirit Walker`
- Starting HP: 76
- First non-gun card each round costs 0 Nerve.
- Nerve: max 7, gain 3 per round, carries over.
- Start Position: 1.
- Spirit lasts for the duel, capped at 10.
- Each Spirit adds +1 bullet damage, capped at +5.
- Each Spirit adds +1 visible Armor, capped at +6.
- Starter gun: `Henry Repeater`, capacity 5, bullet damage 6.

## Starter Deck

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

## Card Identity

Apache cards should mostly do one of these jobs:

- Gain Spirit while doing something useful now.
- Recover or preserve Position.
- Convert Spirit into bullet damage.
- Add Armor or enemy damage reduction for long duels.
- Use draw or the free first card to make setup feel active, not slow.

## Gun Identity

Apache weapons are bows and rifles:

| Gun | Role |
| --- | --- |
| `Henry Repeater` | Starter rifle baseline. |
| `Mescalero War Bow` | Bow that supports Position. |
| `Sharps Buffalo Rifle` | Low-capacity, high-damage rifle. |
| `Cochise's War Bow` | Legendary bow with loaded and Position pressure. |

## Tuning Levers

Buff Apache through immediate value on Spirit generators or modest Spirit Armor. Nerf him through Spirit damage/Armor caps or free-card payoff density.

Do not add large generic bullet volume. Apache should win because Spirit made the loaded shots better.

## Build Paths

- `spirit`: current Spirit Walker path. Spirit gives capped bullet damage and defensive value.
- `trail`: Track and Snare path. Track improves bow/rifle damage while Snare answers visible attack intents.

Trail should be reactive and tactical, not simply another Spirit ramp. Its passive stance Armor is intentionally modest so Track/Snare decisions matter more than free sustain.

## Current Simulation Baseline

May 17, 2026 routed Node simulation, 200 Apache Tracker runs:

- Clears: 73/200 (36.5%).
- Average wins: 13.16/15.
- Main deaths: `Judge Obadiah Blackthorn`, `Red Jack Calder`, `Caleb Cross`, and `Silas Gravesmoke`.

Honest read: slightly high but acceptable. Spirit gives real staying power without making every late fight automatic.
