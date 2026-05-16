# Balance Simulation Guide

Use `tools/balance-sim.mjs` for repeatable full-run balance checks. The sim is deterministic for a given seed, so before/after changes can be compared without guessing whether the sample shifted.

## Quick Run

From the repo root:

```bash
node tools/balance-sim.mjs
```

Default settings:

- 200 runs per class.
- Base seed `100000`.
- Linear wanted-board route through all 15 opponents.
- Class-only card rewards after wins.
- 20% class-only gun drop chance after wins.
- Whiskey healing when useful and affordable.
- No shop card/gun purchases.
- No relics, smithing, or potions.

For faster iteration:

```bash
node tools/balance-sim.mjs --runs 50
```

For a more stable final check:

```bash
node tools/balance-sim.mjs --runs 500
```

For machine-readable output:

```bash
node tools/balance-sim.mjs --runs 200 --json
```

To save a report:

```bash
node tools/balance-sim.mjs --runs 200 > docs/research/balance-run-YYYY-MM-DD.md
node tools/balance-sim.mjs --runs 200 --json > docs/research/balance-run-YYYY-MM-DD.json
```

## Output Sections

`Class Clears` is the main full-run result. Watch `clearPct`, `avgWins`, and the top death points.

`Boss Death Matrix` shows per-class deaths to each town boss. This is the best view for finding bad gates:

- Lots of `Marshal Elias Graves` deaths means town 1 or starter decks are too punishing.
- Lots of `Red Jack Calder` deaths means town 3 rushdown is checking that class too hard.
- Lots of `Silas Gravesmoke` deaths means the class lacks closing power or deterministic defense.
- Lots of `Judge Obadiah Blackthorn` deaths with few earlier losses means the class reaches final town but cannot beat final-boss dodge, auto-hits, or damage.

`Opponent Rows` shows each opponent's reached count, death count, win rate, average player HP after wins, and average enemy HP on losses. Use this to distinguish clean difficulty from unfun stall:

- Low win rate with low enemy HP on loss usually means a fair close fight.
- Low win rate with high enemy HP on loss usually means a wall.
- Very high win rate with low average HP after win means attrition, not a kill gate.
- Long loss cycles usually mean stall or denial is too strong.

## Current Target

The current no-relic/no-smithing/no-potion target is roughly one full clear in three for each class. A practical target band is about 28-38% in 200-run samples.

Current baseline from May 16, 2026, 200 runs per class:

| Class | Full clears |
| --- | ---: |
| Outlaw | 34.5% |
| Apache Tracker | 37.5% |
| Sheriff | 28.0% |
| U.S. Marshal | 36.0% |
| Vaquero | 34.5% |
| Bounty Hunter | 29.0% |

Do not overreact to a single 50-run sample. Use 50 runs to catch obvious breakage, 200 runs for normal tuning, and 500+ runs before making broad class identity changes.

## Recommended Workflow

1. Run a baseline before editing:

```bash
node tools/balance-sim.mjs --runs 200 --json > /tmp/highnoon-before.json
```

2. Make one small balance change. Prefer changing class identity levers before flattening all opponents.

3. Run a quick sanity pass:

```bash
node tools/balance-sim.mjs --runs 50
```

4. If the quick pass is sane, run the real pass:

```bash
node tools/balance-sim.mjs --runs 200
```

5. Judge the death distribution, not only clear rate. A class at 33% can still be bad if all losses happen at the same unfun wall.

6. Update the relevant class doc and `towns.md` when a new baseline is accepted.

## Sim Heuristic

The sim is not a perfect player. It uses a deterministic greedy card evaluator:

- `effectScore()` weights individual effects.
- `cardScore()` adds type, rarity, cost, gun, class, and combo context.
- `playPrep()` plays the best affordable cards until play slots run out.
- `takeReward()` takes high-scoring card rewards and gun drops.

This makes the sim good for relative balance and death distribution. It is not proof that the game is fun, and it does not replace Playwright/manual playtests for UI clarity, pacing, or whether choices feel interesting.

When a new mechanic is added, update the sim weights. If the sim does not understand a new effect, it may undervalue or ignore cards that are strong in real play.

## When To Use Playwright Instead

Use Playwright/manual playtests after the sim when:

- The UI changed.
- A mechanic is hard to value with static weights.
- A fight looks balanced numerically but feels confusing.
- You need to inspect card readability, expected damage display, or prep-round feedback.
- The sim result and human play feel very different.
