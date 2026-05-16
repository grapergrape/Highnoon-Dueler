# Outlaw Balance Baseline

## Identity

Outlaw is the explosive combo class. He should feel like he is cheating the prep rules, chaining small dirty plays into one decisive High Noon. His best turns are planned around the prep-round play ramp:

- Prep round 1: 1 base card play.
- Prep round 2: 2 base card plays.
- Prep round 3 and later: 3 base card plays.
- Extra-play cards can push a round above the base limit.

Outlaw should be the clearest example of "more cards played means more payoff", but he should not get free scaling from baseline equipment. The starter gun is intentionally plain.

## Current Core Rules

- Passive: `Twin Combos`
- Permanent: `focusPerRound+1`, `outlawComboTracking`
- Starting HP: 100
- Starter gun: `Volcanic Pistol`
- Starter gun effects: `damage-1`
- Starter gun should not have combo bonuses.
- Upgrade guns and Showdowns may convert combo triggers into extra shots.

Outlaw combo cards use `outlawCombo: true`. Once the second Outlaw combo card is played in a prep round, combo bonuses begin applying. The first two combo cards both get their `comboBonus:` payloads, and later combo cards apply their own combo bonus.

## Starter Deck

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 3 |
| `Dodge` | 2 |
| `Beer Heal` | 1 |
| `Gunslinger's Tempo` | 2 |
| `Pistol Whip` | 2 |
| `Outlaw's Pact` | 1 |
| `Roll the Dice` | 1 |

The starter deck should already teach the loop: play one setup card early, then use round 2/3 to chain combo cards. It should not depend on finding a gun before the first town is playable.

## Card Identity

Outlaw cards should mostly do one of these jobs:

- Start or extend combo chains with `extraPlay+1`.
- Reward chaining with `comboBonus:` payloads.
- Create dirty defensive tempo: `enemyAccNext`, `enemyBullets`, `dodgeRecv`.
- Create burst output through bullets, damage, or first automatic hits.
- Offer risky recovery through limited healing or defensive stances.

Healthy examples:

- `Gunslinger's Tempo`: accuracy, dodge, extra play, and combo bullets.
- `Outlaw's Pact`: enables a free combo card without directly adding huge damage.
- `Loaded Sleeve`: adds bullets and turns combo into a guaranteed hit payoff.
- `Smoke Break`: defensive tempo plus combo dodge, not raw damage.

## Gun Identity

Outlaw guns should not be flat stat sticks. They should reward playing combo cards during the duel.

Current gun split:

| Gun | Role |
| --- | --- |
| `Volcanic Pistol` | Starter baseline. No combo scaling. |
| `Coachline Repeater` | Lower raw stats, adds `extraVolleyShots+1`. |
| `Jesse James' Schofield` | Legendary combo finisher with `firstHitsAuto+1` and `extraVolleyShots+1`. |

Upgrade guns equip only for the current duel. The next duel starts from `Volcanic Pistol` again until a gun card is played.

## Balance Targets

Outlaw should:

- Clear early fights reliably if the player uses the prep ramp.
- Lose runs when the deck lacks enough extra-play or combo density.
- Have scary late-game burst, but not automatic boss kills.
- Need to draw and play upgrade guns for the strongest combo-gun turns.
- Usually take some damage because his defense is tempo-based, not permanent armor.

Outlaw should not:

- Get combo scaling from the starter gun.
- Win only by stacking generic bullet cards.
- Have all upgrade guns be pure damage upgrades.
- Be balanced around relics, smithing, or potions.
- Require perfect RNG to survive town 1.

## Tuning Levers

Buff Outlaw through:

- More `extraPlay+1` on combo setup cards.
- Slightly better `comboBonus:` values on low-rarity cards.
- More access to `focusCycle+1` or `focusPerRound+1`.
- Better defensive tempo on combo cards, especially `enemyAccNext` or `enemyBullets`.
- Small accuracy buffs on combo payoffs.

Nerf Outlaw through:

- Reducing `extraVolleyShots` on guns or Showdowns.
- Lowering upgrade gun magazine size.
- Removing flat damage from combo setup cards.
- Making powerful combo enablers cost 2+ Nerve.
- Reducing how often repeatable rewards produce the same best combo piece.

Be careful when changing:

- `extraVolleyShots`: it multiplies with duel combo triggers and can explode quickly.
- `extraPlay+1`: it is both a card-play limit break and a combo enabler.
- `nextComboFree`: it is strongest when paired with extra plays.
- Starter gun stats: the starter should make early game playable, not define the build.

## Playtest Signals

Good signs:

- The player looks for two-card and three-card prep-round chains.
- Upgrade guns feel exciting because they make combo turns louder.
- Losses feel like bad deck construction, low HP management, or greedy prep choices.
- Boss kills often require two or more High Noon cycles unless the deck is excellent.

Bad signs:

- The correct play is always "buy any gun, ignore card identity".
- Starter gun clears fights before combo cards matter.
- The deck wins by hoarding random bullet cards with no combo sequencing.
- Runs fail because a single accuracy miss wastes all setup.
- Outlaw clears 5/5 full runs with high HP in basic sims.

## Baseline For Other Classes

Outlaw is the reference for a high-tempo combo class:

- Low durability.
- High sequencing payoff.
- Upgrade guns interact with class mechanics.
- Starter gun stays neutral.
- Cards carry most of the build identity.

When designing another combo class, compare it to Outlaw. If it plays many cards per turn but does not care about card order or setup, it probably needs a different identity.
