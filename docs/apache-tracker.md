# Apache Tracker Balance Baseline

## Identity

Apache Tracker is the Spirit-ramp bow/rifle class. He should feel like he reads the duel before the street erupts: gather Spirit, make the enemy's aim worse, then turn that Spirit into a decisive rifle shot or silent bow volley.

Apache is not a generic accuracy class. Accuracy helps him survive the low floor of bad rolls, but the class should mainly win by choosing when to build Spirit, when to convert it into damage, and when to spend prep plays on deterministic defense.

## Current Core Rules

- Passive: `Spirit Walker`
- Starting HP: 110
- Permanent: `accBonus+0.05`, `accFloor: 0.55`, `freeFirstCardPerRound`
- Spirit cap: 10
- Spirit lasts for the current duel and resets at the start of the next duel.
- Each Spirit adds +1 hit damage, capped at +8.
- Every 2 Spirit adds +1 bullet, capped at +4 bullets.
- Every 2 Spirit heals 1 HP after the volley, capped at 3 HP.
- Each Spirit reduces enemy accuracy by 1.5%, capped at -10%.
- Starter gun: `Henry Repeater`

The first free card each prep round lets Apache play a real setup card even when Nerve is tight. That card still consumes the round's play slot, so cards that only add Spirit must carry enough immediate value to be worth the slot.

## Starter Deck

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Dodge` | 2 |
| `Beer Heal` | 1 |
| `Wind Whisper` | 2 |
| `Spirit Talk` | 1 |
| `Ridge Sight` | 1 |
| `Owl's Vision` | 1 |
| `Bear Spirit` | 1 |
| `Medicine Bundle` | 1 |

The starter deck should teach the loop immediately: play a free Spirit setup card, use round 2/3 to add Spirit payoffs or bullet denial, then fire with enough Spirit to matter. It should not need a gun drop to beat town 1.

## Card Identity

Apache cards should mostly do one of these jobs:

- Build Spirit while doing something immediately useful: accuracy, dodge, bullets, enemy accuracy reduction, or extra play.
- Convert Spirit into better aim: `spiritScaleAcc`.
- Convert Spirit into closing power: `spiritScaleDamage`, bullets, or first automatic hits.
- Convert Spirit into safety: `spiritScaleEnemyAcc`, `enemyBullets`, `dodgeRecv`, or `damageTaken`.
- Build long-duel engines through unique stances.

Healthy examples:

- `Wind Whisper`: Spirit plus immediate aim.
- `Spirit Talk`: Spirit plus a bullet dodge.
- `Ridge Sight`: Spirit, bullet volume, and an extra play.
- `Silent String`: Spirit, enemy accuracy reduction, and an extra play.
- `Buffalo Patience`: Spirit-scaling damage, dodge, and a bullet.
- `Medicine Bundle`: sustain and Spirit-scaled enemy aim pressure.

Avoid adding pure Spirit cards that do nothing else. In the prep-ramp system, a card that only says "gain Spirit" becomes a tempo trap once the player has better options.

## Gun Identity

Apache guns are bows and rifles. They should feel precise and premium, but they should not replace the Spirit deck.

Current gun split:

| Gun | Role |
| --- | --- |
| `Henry Repeater` | Starter rifle baseline. No Spirit scaling and no special effects. |
| `Mescalero War Bow` | Rare bow: silent defense, first auto-hit, and light Spirit scaling. |
| `Sharps Buffalo Rifle` | Epic rifle: low bullet count, high damage, pierce, and Spirit damage scaling. |
| `Cochise's War Bow` | Legendary bow: Spirit aim/damage scaling with a defensive dodge floor. |

Upgrade guns equip only for the current duel. The next duel starts from `Henry Repeater` again until a gun card is played.

Apache should want a bow or rifle upgrade, but the correct deck should still care about Spirit density and defensive prep choices. If every run is just "draw Sharps or lose," the gun pool is too dominant.

## Balance Targets

Apache should:

- Clear early fights reliably when the player builds Spirit before High Noon.
- Feel strongest in longer duels where Spirit reaches 6-10.
- Need a mix of Spirit generation, Spirit scaling, and deterministic defense.
- Use upgraded bows/rifles as payoffs, not as the whole build.
- Be harder than Sheriff, but not collapse before Dead Man's Creek.

Apache should not:

- Win by taking every generic bullet card and ignoring Spirit.
- Need a legendary gun to finish a normal run.
- Reach 10 Spirit automatically in every fight with no deckbuilding.
- Have starter Spirit cards that are blank after town 1.
- Depend on relics, smithing, or potions.

## Tuning Levers

Buff Apache through:

- Better immediate value on Spirit generators.
- Slightly higher `spiritEnemyAccPerSpirit`, `spiritHealCap`, or defensive card values.
- More `extraPlay+1` on setup cards that otherwise compete poorly for prep plays.
- A little more Spirit-scaling damage on rare cards or upgrade guns.

Nerf Apache through:

- Lowering `spiritBulletsCap` or `spiritDamageCap`.
- Reducing passive enemy accuracy pressure.
- Making the best Spirit payoffs cost 2+ Nerve without extra play.
- Lowering bow/rifle auto-hit access.

Be careful when changing:

- `spiritBulletsCap`: extra bullets multiply all damage and accuracy buffs.
- `spiritEnemyAccCap`: enemy accuracy reduction is invisible but very powerful over long volleys.
- `freeFirstCardPerRound`: this makes low-cost setup much stronger than it looks.
- `hpAfterShootout`: sustain can hide bad late-game tuning until final bosses.

## Playtest Signals

Good signs:

- The player picks between Spirit generation, Spirit payoff, and defense.
- Bow/rifle upgrades feel exciting but do not make cards irrelevant.
- Late wins are close unless the deck has a strong Spirit engine.
- Losses usually come from thin Spirit payoff, weak defense, or failing to draw the right weapon at the right duel.

Bad signs:

- The best play is always the highest raw-damage card.
- The player ignores Spirit after the first High Noon cycle.
- Apache clears 6/10 or more full runs without relics, smithing, or potions.
- Apache dies before town 3 in most basic simulations.
- Playing a Spirit generator feels worse than skipping it.

## Current Playtest Baseline

May 16, 2026 routed Node simulation, 200 Apache Tracker runs with card rewards, 20% gun drops, and whiskey healing, no shop purchases:

- Clears: 75/200 (37.5%).
- Average wins: 12.65/15.
- Main deaths: `Judge Obadiah Blackthorn`, `Silas Gravesmoke`, `Caleb Cross`, and `Dahlia Kane`.
- Winning decks still lean on Spirit generation plus a real payoff gun or Oath, but the lowered Spirit caps stop passive Spirit from solving every late fight.

Honest read: slightly above the 33% target but acceptable. If future rewards make Apache stronger, lower `spiritBulletsCap` before touching starter cards.

## Baseline For Other Classes

Apache is the reference for a Spirit-ramp precision class:

- Medium-high durability, but mostly through setup.
- Offense and defense both scale from a capped duel resource.
- Starter gun stays neutral.
- Upgrade guns are class-flavored payoffs.
- Spirit cards must carry immediate tactical value.

When designing another resource-ramp class, compare it to Apache. If the resource gives damage, bullets, sustain, and enemy disruption, it needs caps and real prep-play pressure.
