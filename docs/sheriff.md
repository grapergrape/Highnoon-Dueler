# Sheriff Balance Baseline

## Identity

Sheriff is the defensive shotgun class. He should feel like a badge holding the street: absorb pressure, keep HP high, then turn that stability into accurate shotgun volleys.

The class should not be "guns solve the run." Sheriff guns provide a defensive floor. Sheriff cards should decide whether the run scales, survives late bosses, and closes fights.

## Current Core Rules

- Passive: `Earned Respect`
- Starting HP: 105
- Each duel win grants 1 Respect, capped at 10.
- Each Respect grants +4 max HP.
- While above 100 current HP, Sheriff gains +3% shotgun accuracy per HP above 100, capped at +25%.
- Starter gun: `Town Guard Scattergun`

The passive creates the main class tension: staying above 100 HP is offense, not just defense. Losing too much HP makes the shotgun less reliable.

## Starter Deck

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Dodge` | 1 |
| `Beer Heal` | 1 |
| `Bulwark` | 2 |
| `Badge Flash` | 2 |
| `Packed Shells` | 2 |
| `Town's Strength` | 1 |
| `Deputy Cover` | 1 |

The starter deck should teach that Sheriff uses defense and extra plays to build a better volley. He should not need a gun drop to beat early fights, but late-game consistency should depend on deck quality.

## Card Identity

Sheriff cards should mostly do one of these jobs:

- Keep HP high: `healNow`, `hpAfterCycle`, `hpAfterShootout`.
- Prevent incoming damage deterministically: `dodgeRecv`, `enemyBullets`, `damageTaken`.
- Convert the held line into offense: `bullets`, `accShootout`, `firstHitsAuto`, `damageShootout`.
- Increase prep flexibility with `extraPlay+1`.
- Create durable engines through unique stances.

Healthy examples:

- `Bulwark`: small healing, damage reduction, bullet dodge, extra play.
- `Badge Flash`: zero-cost tempo and accuracy.
- `Town's Strength`: meaningful shotgun payoff with bullets, damage multiplier, accuracy, and extra play.
- `Jailhouse Cover`: unique defensive stance that improves prep flexibility.
- `Town Doctor`: unique sustain stance that helps preserve the HP accuracy passive.
- `Oath of the Star`: Oath that turns HP into damage.

Repeatable defensive feats must be watched carefully. If repeated `Bullet-Stopping Badge`, `Lawman's Stand`, or `Bulwark` can clear the run without good guns or stances, the deck pool is too defensive.

## Gun Identity

Sheriff guns are defensive shotguns. They should give a floor, not the whole build.

Current gun split:

| Gun | Role |
| --- | --- |
| `Town Guard Scattergun` | Starter defensive baseline: modest damage, `damageTaken-1`, `dodgeRecv+1`. |
| `Winchester 1887` | Epic upgrade: better shotgun stats, ricochet, small sustain. |
| `Masterson's Thunderer` | Legendary upgrade: stronger finisher with auto hit, dodge, reduction, and sustain. |

Upgrade guns equip only for the current duel. The next duel starts from `Town Guard Scattergun` again until a gun card is played.

## Balance Targets

Sheriff should:

- Feel sturdy early without being immortal.
- Care about ending fights above 100 HP.
- Need card engines for late-game clears.
- Use guns as support for the defensive shotgun plan.
- Have close late boss fights even in good runs.

Sheriff should not:

- Clear reliably from shotgun upgrades alone.
- Clear reliably with no upgraded guns and only repeated defensive feats.
- Lose because the starter shotgun cannot hit anything.
- Become a pure heal-tank with no need to build offense.
- Depend on relics, smithing, or potions.

## Tuning Levers

Buff Sheriff through cards first:

- Add small `accShootout` to shotgun payoff cards.
- Add `extraPlay+1` to setup cards that otherwise feel dead.
- Improve unique stances before buffing repeatable feats.
- Add modest sustain to card engines, not all guns.
- Improve `damagePerHp` or HP-scaling Oaths if late fights drag.

Buff Sheriff through guns only when:

- Early fights are failing before rewards matter.
- Upgrade guns feel worse than the starter gun.
- The player has no reason to play a gun card during a duel.

Nerf Sheriff through:

- Reducing repeatable `dodgeRecv`, `damageTaken`, or healing.
- Lowering `hpAfterShootout` on guns and stances.
- Reducing `firstHitsAuto` or bullet count on repeated payoff cards.
- Lowering high-HP accuracy cap only if the passive is globally too strong.

Be careful when changing:

- `damageTaken`: it applies to every incoming hit and scales hard against multi-shot enemies.
- `dodgeRecv`: it cancels whole bullets before accuracy or damage matter.
- `hpAfterShootout`: it can erase attrition across repeated cycles.
- `extraPlay+1`: it lets defensive cards stop being tempo losses.
- Shotgun accuracy: Sheriff already gets passive accuracy above 100 HP.

## Playtest Signals

Good signs:

- The player values HP because it directly improves aim.
- The best decks mix defense, sustain, and shotgun payoff.
- Upgrade guns feel helpful but not mandatory for every win.
- No-upgrade-gun runs can sometimes clear with excellent cards, but should not be reliable.
- Late wins often end at low or medium HP, not always full HP.

Bad signs:

- Sheriff clears 5/5 full runs with high final HP.
- No-upgrade-gun Sheriff clears most runs.
- The correct reward pick is always the defensive card.
- Playing a gun card feels like a mistake.
- The class ignores the high-HP accuracy passive because it either never drops below 100 or never stays above 100.

## Current Simulation Baseline

May 16, 2026 routed Node simulation, 200 Sheriff runs with card rewards, 20% gun drops, and whiskey healing, no shop purchases:

- Clears: 56/200 (28%).
- Average wins: 12.55/15.
- Main deaths: `Judge Obadiah Blackthorn`, then `Marshal Elias Graves` and `Silas Gravesmoke`.
- Honest read: slightly hard but acceptable for the defensive class. If Sheriff drops below this, buff cards before restoring the old high-HP accuracy cap.

## Baseline For Other Classes

Sheriff is the reference for a defensive scaling class:

- High durability.
- Offense tied to preserving a resource, current HP.
- Guns provide identity floor.
- Cards provide scaling and decision-making.
- Repeatable defense must be tightly controlled.

When designing another defensive class, compare it to Sheriff. If it survives through flat mitigation but has no offensive conversion, it will feel slow. If its defensive floor also supplies its best offense, it will feel automatic.
