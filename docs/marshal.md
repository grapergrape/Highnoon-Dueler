# U.S. Marshal Balance Baseline

## Identity

U.S. Marshal is the mark-scaling federal pressure class. He should feel like he is building a case during prep: every mark makes the fugitive easier to kill and less able to hurt him back.

Marshal is not a generic accuracy class. His deck should care about putting marks on the opponent, then converting those marks into damage, bullet volume, and hit-damage reduction.

## Current Core Rules

- Passive: `Federal Warrant`
- Permanent: `accBonus+0.05`, `focusPerRound+1`, `extraMarkPerApply+1`
- Marks grant +1 player hit damage per mark, capped at +14 damage.
- Marks reduce enemy hit damage by 1 per mark, capped at 12 damage reduction.
- Starting HP: 100
- Starter gun: `Colt Single Action Army`

The mark bonuses apply at High Noon from the current enemy mark count. Marks clear after the volley, so the class has to rebuild the case each High Noon cycle.

## Starter Deck

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 3 |
| `Dodge` | 2 |
| `Beer Heal` | 1 |
| `Dead to Rights` | 2 |
| `Federal Warrant` | 2 |
| `Deputy Crossfire` | 1 |
| `Badge Cover` | 1 |

The starter deck should teach the loop immediately: mark first, then decide whether the next prep play adds bullets, accuracy, or defensive pressure. It should not need an upgraded gun to beat town 1.

## Card Identity

Marshal cards should mostly do one of these jobs:

- Apply marks efficiently: `markEnemy`.
- Convert marks into damage: `markBurst`, `damage`, or `firstHitsAuto`.
- Convert marks into defense: enemy bullet denial, enemy accuracy reduction, or hit-damage reduction support.
- Keep the prep sequence moving with `extraPlay+1` or `focusCycle+1`.
- Build federal engines through unique stances.

Healthy examples:

- `Dead to Rights`: clean mark setup.
- `Federal Warrant`: mark setup with a little accuracy.
- `Deputy Crossfire`: mark, bullet, and extra play in one tempo card.
- `Badge Cover`: mark plus deterministic enemy bullet denial.
- `Federal Ledger`: stance that makes marked targets hit harder while giving a small defensive floor.
- `Witness Protection`: stance sustain that supports longer boss fights without becoming full healing.

## Gun Identity

Marshal guns are premium government-issued handguns. They should be revolvers or other handguns, not rifles or shotguns, and they should support marks without replacing the deck.

Current gun split:

| Gun | Role |
| --- | --- |
| `Colt Single Action Army` | Starter baseline. Government sidearm with modest accuracy, no mark or bounty scaling. |
| `Smith & Wesson Schofield No. 3` | Epic premium revolver with mark-burst support and 1 bullet dodge. |
| `Treasury Gold Schofield` | Legendary golden-bullet revolver: each successful player hit adds $5 bounty for the duel. |

Upgrade guns equip only for the current duel. The next duel starts from `Colt Single Action Army` again until a gun card is played.

The legendary gun should be exciting because it changes the bounty economy and rewards landing hits. It should not be the only reason the class wins.

## Balance Targets

Marshal should:

- Build visible mark stacks before High Noon.
- Feel safer when he marks well, because enemy hit damage drops.
- Hit meaningfully harder against heavily marked targets.
- Still care about bullets and accuracy; marks alone should not guarantee a kill.
- Usually need strong card drafting to beat final town bosses.

Marshal should not:

- Clear most full runs just by drafting every mark card.
- Become immune once marks are stacked.
- Win because the legendary gun pays for every shop and removes attrition.
- Ignore prep choices because all mark cards are always correct.
- Depend on relics, smithing, or potions.

## Tuning Levers

Buff Marshal through:

- Slightly better mark application on weak common cards.
- More `extraPlay+1` on mark cards that otherwise lose too much tempo.
- A little more `markBurst` on uncommon/rare payoffs.
- Better defensive utility on cards, not more raw passive mitigation.
- More access to `focusCycle+1` if the deck cannot spend round 2/3 well.

Nerf Marshal through:

- Lowering `markDamageReduceCap`.
- Lowering `markDamageCap`.
- Reducing repeated `extraPlay+1` on common mark cards.
- Reducing `markBurst` on guns or Showdowns.
- Lowering the legendary gun's `bountyOnHit` if it overfunds shop healing.

Be careful when changing:

- `markDamageReduceCap`: this is the main overpowered lever. Too high makes late bosses harmless.
- `extraMarkPerApply`: this doubles the practical value of every mark card.
- `markBulletPerMark`: this can multiply mark stacks into huge volleys.
- `bountyOnHit`: extra money means more shop buys and healing, not just flavor.
- `extraPlay+1`: it turns mark cards from setup into free tempo.

## Playtest Signals

Good signs:

- The player has to choose between more marks, defense, and bullet volume.
- Strong mark decks can beat final bosses but still finish bruised.
- Losses usually happen when the deck lacks mark density, bullets, or enough late defense.
- The legendary gun is exciting when drawn but does not guarantee the duel.
- Full-run simulations are not clearing 7/10 or more without extra systems.

Bad signs:

- Every reward pick is simply the highest mark count.
- Marshal clears 7/10 or more full runs without relics, smithing, or potions.
- Blackthorn and other late bosses deal trivial damage through full volleys.
- The legendary gun funds enough healing that HP stops mattering.
- The starter deck wins without caring about marks.

## Baseline For Other Classes

Marshal is the reference for a mark-scaling control class:

- Medium durability.
- Offense and defense both come from one setup resource.
- Guns are premium but narrow.
- Cards carry the class engine.
- Caps matter more than raw effect text.

When designing another setup-control class, compare it to Marshal. If one resource gives both damage and safety, it needs clear caps and real deckbuilding pressure.
