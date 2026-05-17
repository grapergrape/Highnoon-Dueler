# Class Build Paths

This document is the balancing baseline for the two-build class model. Rewards and shops stay class-only, but they intentionally mix both paths so a run is not guaranteed to assemble the same solved deck every time.

## Pool Rules

- Every class has two named build paths.
- Starter decks lean toward the current build so the class identity is readable from fight one.
- Rewards and merchant cards can offer either path.
- Stances are the main long-term engine cards, similar in role to power cards, but they use Highnoon-specific resources instead of copying Slay the Spire keywords directly.
- Bridge cards should be useful in both builds but weaker than a dedicated payoff in the correct lane.
- A strong run should have a coherent lane plus a few bridge cards. A weak run can happen when rewards lean into the wrong lane or provide setup without payoff.

## Outlaw

Current path: Dirty Combo

- Plays multiple outlaw cards in one round.
- Spends Position for immediate load, armor, Nerve, and burst.
- Wants cheap cards and combo bonuses.
- Weakness: exposed Position and low max HP.

Second path: Infamy

- Builds `Infamy` through reputation cards and stances.
- Converts Infamy into loaded bullets, armor, or damage.
- Scales more slowly than combo and should be less explosive early.
- Use when rewards give `Infamy` engines or when the run needs safer, slower scaling.

## Sheriff

Current path: Hold the Street

- Builds Armor and Position.
- Uses Respect max-HP growth to survive long routes.
- Wins by preserving health and firing controlled shotgun turns.
- Weakness: can lack closing power if rewards are too defensive.

Second path: Posse

- Uses deputy stances and deputy counters.
- Deputies add recurring Armor, occasional loaded shells, and payoff cards.
- More engine-like than pure blocking.
- Use when early stances appear or when the route needs recurring defense.

## U.S. Marshal

Current path: Dead to Rights

- Marks the opponent.
- Marks increase Marshal damage and reduce incoming damage.
- Strong with handguns and direct mark payoffs.
- Weakness: if every reward is mark density, the deck becomes solved.

Second path: Federal Procedure

- Builds `Case File` counters.
- Case File cards are slower, then cash out into load, armor, or a warrant payoff.
- Procedure Path stances advance across later rounds from I to III, granting Case File equal to the current stage.
- More planned and defensive than pure Mark tempo.
- Use when the deck finds Case File stances or when enemy Armor/Rattled needs a slower answer.

## Apache Tracker

Current path: Spirit Walker

- Builds Spirit.
- Spirit adds capped damage and defensive value.
- Free first non-gun card keeps turns flexible.
- Weakness: currently too consistent when rewards keep feeding Spirit.

Second path: Trail and Snare

- Builds `Track` and plays trap cards.
- Track improves rifle/bow damage and Snares blunt visible attack intents.
- More reactive than Spirit stacking.
- Use when enemy attack patterns are predictable or when Spirit payoff is missing.

## Vaquero

Current path: Dos Pistolas

- Dual-wields from the start.
- Wants load density, off-hand support, and Position management.
- High bullet volume is the main payoff.
- Weakness: if the deck gets enough load and support, it becomes too reliable.

Second path: Flourish

- Uses style and footwork stances.
- Rewards high Position and smaller precision volleys.
- Lower bullet volume, higher damage per bullet.
- Use when the deck finds Position/precision cards instead of raw dual-wield load.

## Bounty Hunter

Current path: Blood Contract

- Pays HP for loaded bullets and life-steal.
- Wins by turning HP into tempo, then earning it back.
- Weakness: if life-steal is too easy, HP payment stops being a real cost.

Second path: Frontier Doctor

- Uses `Infection`, a poison-like delayed damage mechanic.
- Infection damages the enemy after Showdown, then decays slowly.
- Doctor cards can weaken infected enemies, heal from infection damage, or consume Infection for burst.
- Use when the run wants attrition and defense instead of blood-tempo burst.

## Balancing Expectations

- Adding the second path should reduce original-build consistency because rewards and shops are less likely to offer perfect same-lane density.
- If a current build remains near-guaranteed under tactical play after the pool expands, that class needs direct nerfs or shop pressure, not more alternate cards.
- The goal is not equal card quality in isolation. The goal is that each path has enough cards to function, enough overlap to avoid dead rewards, and enough mismatch to create bad runs.

## Tactical Playtest Baseline

May 17, 2026 build-guided tactical run:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --build-paths
```

This is a pressure test, not the high-volume balance target. The runner searches playable card lines and biases rewards/shops toward the named build, while the actual reward pool still contains both class paths.

| Class | Current path | Clears | Second path | Clears | Read |
| --- | --- | ---: | --- | ---: | --- |
| Outlaw | `combo` | 3/10 | `infamy` | 6/10 | Original combo is no longer solved; Infamy is playable. |
| Sheriff | `street` | 5/10 | `posse` | 6/10 | Both are acceptable pressure-test bands. |
| U.S. Marshal | `marks` | 6/10 | `procedure` | 6/10 | Procedure Path fixed the weak Case File route without exceeding Marks. |
| Apache Tracker | `spirit` | 4/10 | `trail` | 6/10 | Trail is down after the passive Armor trim. |
| Vaquero | `dual` | 6/10 | `flourish` | 5/10 | Dual was reduced without killing the class; Flourish now works as a precision path. |
| Bounty Hunter | `blood` | 6/10 | `doctor` | 4/10 | Blood is down after non-starter lifesteal trims; Doctor remains playable. |

Aggregate: 63/120 clears, or 52.5%.

Honest balance read: the two-path model reduced several original solved routes, especially Outlaw combo, Apache Spirit, Vaquero dual, and Bounty Blood. It is not finished balance, but the current tactical spread is close enough to the 50% manual target to stop tuning here. The next likely watch points are Apache Trail at 6/10 and Bounty Doctor at 4/10.

The matching low-skill sim target is tracked in [simulation-balancing.md](simulation-balancing.md). Current default low-skill sim is 0/200 clears for every class, which is inside the requested 0-5% band but intentionally too weak to represent manual play.
