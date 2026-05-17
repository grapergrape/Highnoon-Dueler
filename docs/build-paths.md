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

May 17, 2026 Deed-aware build-guided tactical run before the shared item layer:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --build-paths
```

This is a pressure test, not the high-volume balance target. The runner searches playable card lines and biases rewards/shops toward the named build, while the actual reward pool still contains both class paths.

| Class | Current path | Clears | Second path | Clears | Read |
| --- | --- | ---: | --- | ---: | --- |
| Outlaw | `combo` | 6/10 | `infamy` | 5/10 | Harder Deeds lower upgrade count, but signed combo cards still feel strong. |
| Sheriff | `street` | 6/10 | `posse` | 6/10 | Both paths benefit cleanly from bigger Armor/deputy Signatures. |
| U.S. Marshal | `marks` | 6/10 | `procedure` | 4/10 | Marks needed a defensive cap bump; Procedure remains viable but less explosive. |
| Apache Tracker | `spirit` | 4/10 | `trail` | 7/10 | Trail spikes harder from Track/Snare Signatures; Spirit is more demanding. |
| Vaquero | `dual` | 7/10 | `flourish` | 4/10 | Dual uses fewer but stronger Signatures well; Flourish is swingier. |
| Bounty Hunter | `blood` | 6/10 | `doctor` | 8/10 | Doctor is the current broken-side path when Infection Signatures line up. |

Aggregate: 69/120 clears, or 57.5%.

Honest balance read: this intentionally moved the system toward rare, high-impact upgrades instead of frequent modest upgrades. It is more exciting, but less flat. Bounty Doctor and Vaquero Dual are the current high-roll watch points; Marshal Procedure and Vaquero Flourish are the low-end watch points.

The later shared item layer adds starting gear, boss gear drops, and trinkets. Treat the table above as a pre-item card/deed baseline, not the final post-item balance target.

## Post-Item Tactical Check

May 17, 2026 after adding shared gear and trinkets:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --build-paths
```

| Class | Current path | Clears | Second path | Clears | Read |
| --- | --- | ---: | --- | ---: | --- |
| Outlaw | `combo` | 9/10 | `infamy` | 2/10 | Combo remains too reliable; Infamy still collapses at the final boss without enough scaling. |
| Sheriff | `street` | 8/10 | `posse` | 7/10 | Sheriff likes even small defensive gear and is currently forgiving. |
| U.S. Marshal | `marks` | 8/10 | `procedure` | 8/10 | Marshal is high-consistency under tactical play; the class, not shared gear, needs the next pass. |
| Apache Tracker | `spirit` | 8/10 | `trail` | 9/10 | Both paths are strong when tactical routing finds enough scaling. |
| Vaquero | `dual` | 8/10 | `flourish` | 7/10 | The item pass lifted Flourish, but Dual is still the cleaner route. |
| Bounty Hunter | `blood` | 7/10 | `doctor` | 7/10 | Both paths are durable under tactical play; Doctor is less absurd than the pre-item high roll but still strong. |

Aggregate: 88/120 clears, or 73.3%.

Honest balance read: shared items are now modest enough that the remaining high clear rate is mostly class/opponent balance debt. Outlaw Combo, Marshal, Apache Trail, and Sheriff Street are the watch points. Do not nerf the whole item pool further to fix those specific routes; tune the strongest class cards, Deed upgrades, and final-town pressure instead.

## Optimization Pass 1

May 17, 2026 boring-mechanic cleanup and optimized-play tuning:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --build-paths
node tools/balance-sim.mjs --runs 100
```

Changes accepted:

- Sheriff Respect max-HP growth reduced from +2 HP per win to +1 HP per win.
- Outlaw combo sustain cards lost automatic free-action healing loops.
- Apache Signature upgrades were trimmed so Track/Spirit upgrades are still exciting without making every good roll solved.
- Apache and Marshal identity caps were restored after a first-pass overnerf made Apache Spirit and Marshal Procedure too brittle.

| Class | Current path | Clears | Second path | Clears | Read |
| --- | --- | ---: | --- | ---: | --- |
| Outlaw | `combo` | 9/10 | `infamy` | 2/10 | Combo is still the high-roll chase lane; Infamy remains the low-roll fail lane unless it finds enough scaling. |
| Sheriff | `street` | 5/10 | `posse` | 7/10 | Respect no longer lets Street coast on max HP; Posse is the stronger optimized lane. |
| U.S. Marshal | `marks` | 8/10 | `procedure` | 8/10 | Marshal is still highly consistent but no longer the main source of excess aggregate clears. |
| Apache Tracker | `spirit` | 8/10 | `trail` | 9/10 | Apache stays high-roll and fun; future nerfs should target specific cards, not the class passive caps. |
| Vaquero | `dual` | 8/10 | `flourish` | 7/10 | Good spread; both builds can spike without being guaranteed. |
| Bounty Hunter | `blood` | 7/10 | `doctor` | 7/10 | Healthy current band; blood/doctor both support high-risk clears. |

Aggregate: 85/120 clears, or 70.8%.

Low-skill random baseline: 0/100 clears for every class. This is the accepted current balance point: optimized play clears around 70%, random play clears 0%, weak/low-roll routes die late, and the best lines still allow rare high-roll full clears.

The matching low-skill sim target is tracked in [simulation-balancing.md](simulation-balancing.md). Current default low-skill sim is 0/200 clears for every class, which is inside the requested 0-5% band but intentionally too weak to represent manual play.
