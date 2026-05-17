# Bounty Hunter Balance Baseline

## Identity

Bounty Hunter is the blood-price quickdraw class. He spends HP for loaded bullets, then needs those bullets or doctor tools to recover enough health to survive the route.

He should feel dangerous, not stable. The class is allowed to win ugly.

## Current Core Rules

- Passive: `Blood for Lead`
- Starting HP: 76
- Nerve: max 7, gain 3 per round, carries over.
- Start Position: 1.
- The old passive low-HP damage bonus is disabled for now; low-HP cards can still carry risk/reward identity.
- If both duelists die in the same Showdown, Bounty Hunter wins and heals 15% max HP.
- Starter gun: `.41 Derringer`, capacity 3, bullet damage 8.

## Starter Deck

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

## Card Identity

Bounty Hunter cards should mostly do one of these jobs:

- Spend HP for immediate loaded bullets or Position.
- Add limited life-steal to make the HP wager recoverable without making it free.
- Use Infection for slower doctor-style pressure.
- Build Armor before taking a bad trade.
- Add bounty per hit as a small economy upside, not the main engine.
- Create high-risk finishers that are strong only when the player can survive the Showdown.

## Gun Identity

Bounty Hunter guns are concealed pistols and contract weapons:

| Gun | Role |
| --- | --- |
| `.41 Derringer` | Starter high-damage concealed pistol. |
| `Twin Contract Derringer` | Rare life-steal/bounty sidearm. |
| `Pepperbox Revolver` | Epic more-shot concealed weapon. |
| `Doc Holliday's Hideout` | Legendary high-damage life-steal finisher. |

## Tuning Levers

Buff Bounty Hunter through life-steal on paid starter/core cards, doctor healing, or a little more starting HP. Nerf through non-starter `lifestealOnHit`, quickdraw healing, and paid load density.

Be careful with low-HP bonuses. The current passive value is intentionally off because the blood build was too stable when it could both buy tempo with HP and gain free damage for being hurt.

## Build Paths

- `blood`: current Blood Contract path. Pay HP, load bullets, then recover with life-steal and quickdraw tie rules.
- `doctor`: Frontier Doctor path. Infection deals delayed damage after Showdown, decays slowly, and can be consumed for burst.

Doctor should feel like attrition and bad medicine, not a direct copy of poison. It gives Bounty Hunter a defensive control route when blood payoffs do not appear.

## Current Simulation Baseline

May 17, 2026 routed Node simulation, 200 Bounty Hunter runs:

- Clears: 76/200 (38.0%).
- Average wins: 14.11/15.
- Main deaths: `Judge Obadiah Blackthorn`, `Caleb Cross`, then `Silas Gravesmoke`.

Honest read: high edge of acceptable. The HP trade is finally viable, but further life-steal buffs would likely make him too safe.
