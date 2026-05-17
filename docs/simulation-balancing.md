# Balance Simulation Guide

This guide applies to the current deterministic intent combat model: loaded bullets, Armor, Position, Nerve carryover, Rattled, and short Showdowns.

Use `tools/balance-sim.mjs` for repeatable low-skill full-run checks. The sim is deterministic for a given seed, so before/after changes can be compared without guessing whether the sample shifted.

## Quick Run

From the repo root:

```bash
node tools/balance-sim.mjs
```

Default settings:

- 200 runs per class.
- Base seed `100000`.
- Mode `low-skill`: play the first affordable card each round, take rough rewards, take rough gun drops, and skip whiskey.
- Linear wanted-board route through all 15 opponents.
- Class-only card rewards after wins.
- 20% class-only gun drop chance after wins.
- Deeds and Signature Points are tracked; low-skill mode does not spend upgrades, while tactical mode spends them on scored card-copy upgrades.
- Shared items are tracked: one starting gear choice, boss gear drops into empty gear slots, 5% non-boss trinket drops, and expensive merchant trinkets from the second merchant visit.
- No whiskey healing.
- No shop card/gun purchases.
- No smithing or potions.

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
- Lots of `Judge Obadiah Blackthorn` deaths with few earlier losses means the class reaches final town but cannot beat final-boss Armor, Rattled, or damage.

`Opponent Rows` shows each opponent's reached count, death count, win rate, average player HP after wins, and average enemy HP on losses. Use this to distinguish clean difficulty from unfun stall:

- Low win rate with low enemy HP on loss usually means a fair close fight.
- Low win rate with high enemy HP on loss usually means a wall.
- Very high win rate with low average HP after win means attrition, not a kill gate.
- Long loss cycles usually mean stall or denial is too strong.

For the old score-based greedy model:

```bash
node tools/balance-sim.mjs --runs 200 --mode greedy
```

## Current Target

The current item/no-smithing/no-potion target separates low-skill simulation from deliberate play:

- Low-skill sim: 0-5% full clears per class.
- Tactical/manual-decision play: around 70% full clears across build-guided runs.

Pre-item low-skill baseline from May 17, 2026 after Deeds tuning, 200 runs per class:

| Class | Full clears |
| --- | ---: |
| Outlaw | 0.0% |
| Apache Tracker | 0.0% |
| Sheriff | 0.0% |
| U.S. Marshal | 0.0% |
| Vaquero | 0.0% |
| Bounty Hunter | 0.0% |

After item changes, rerun this baseline before accepting balance numbers. The first item implementation was too strong because free bullets, recurring Armor, starting Position, and max-Nerve stacking raised tactical clears sharply. The current item pool keeps those effects rare, and the accepted optimized target is now around 70% rather than around 50%.

This low-skill sim is intentionally harsh and should fail almost all runs. For stronger shop-aware tactical/manual-decision play, run:

```bash
node tools/tactical-shop-sim.mjs --runs 10
```

The tactical sim searches card sequences on each player turn, takes rewards, buys one useful shop card/gun per merchant visit, and buys whiskey when the run is low enough to justify the price. It is slower than `balance-sim.mjs` and should be treated as a manual-decision proxy for solved routes, not literal UI play.
The tactical sim is Deed-aware: it applies post-duel Deed progress, earns Signature Points, and upgrades eligible card copies with the strongest scored branch.

To pressure-test the two-build class model, run:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --build-paths
```

For one class or one build:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --class vaquero --build flourish
```

`--build-paths` does not hard-lock rewards to that path. It biases reward and shop valuation toward the requested path while the class-only pool still contains both paths. That makes it useful for checking whether the old build stayed solved after path dilution, and whether the new build can clear when played deliberately.

Current post-item Deed-aware tactical baseline after the first optimization pass is roughly 85/120 clears across 12 class paths, or 70.8%. The immediately post-item baseline was 88/120, and the pre-item baseline was 69/120. The per-path tables live in [build-paths.md](build-paths.md).

Do not overreact to a single 50-run sample. Use 50 runs to catch obvious breakage, 200 runs for normal low-skill sim checks, and tactical 10-run build-path passes for manual-decision pressure testing.

## Recommended Workflow

1. Run a low-skill baseline before editing:

```bash
node tools/balance-sim.mjs --runs 200 --json > /tmp/highnoon-before.json
```

2. Run a tactical/manual-decision baseline:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --build-paths
```

3. Make one small balance change. Prefer changing class identity levers before flattening all opponents.

4. Run a quick low-skill sanity pass:

```bash
node tools/balance-sim.mjs --runs 50
```

5. If the quick pass is sane, run the real low-skill pass:

```bash
node tools/balance-sim.mjs --runs 200
```

6. Judge the death distribution, not only clear rate. A class at 0% can still be useful if losses distribute progressively rather than ending all runs on fight one.

7. Update the relevant class doc and `towns.md` when a new baseline is accepted.

## Sim Heuristic

The default low-skill sim is deliberately not a good player:

- It plays only the first affordable card each round.
- It takes the first rolled reward.
- It takes early gun drops without judging build fit.
- It skips whiskey.
- It tracks Deed progress but does not spend Signature Points.

`--mode greedy` uses a deterministic card evaluator:

- `effectScore()` weights individual effects.
- `cardScore()` adds type, rarity, cost, gun, class, and combo context.
- `playTurn()` plays the best affordable cards until no high-scoring card remains.
- `takeReward()` takes high-scoring card rewards and gun drops.
- Greedy mode spends Signature Points, but it is still much weaker than the tactical search runner.

This makes the low-skill sim useful for checking that autopilot play fails, and the greedy mode useful for relative balance and death distribution. Neither is proof that the game is fun, and neither replaces tactical/manual playtests for UI clarity, pacing, or whether choices feel interesting.

The heuristic understands the new effect vocabulary at a coarse level, but it is still greedy. It does not plan several rounds ahead, intentionally hold Nerve for a future hand, or evaluate human-visible risk as well as an actual player.

## When To Use Playwright Instead

Use Playwright/manual playtests after the sim when:

- The UI changed.
- A mechanic is hard to value with static weights.
- A fight looks balanced numerically but feels confusing.
- You need to inspect card readability, expected damage display, or combat feedback.
- The sim result and human play feel very different.
