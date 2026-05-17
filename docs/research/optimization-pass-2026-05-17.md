# Optimization Pass - May 17, 2026

Goal from this pass:

- Optimized tactical play should clear around 70%.
- Random/low-skill play should clear 0%.
- Low-roll routes should die, preferably late enough to feel close.
- High-roll decks should still exist and create the "one more run" chase.
- Remove boring mechanics that let optimized play dump free sustain instead of making decisions.

## Baseline

Command:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --build-paths
node tools/balance-sim.mjs --runs 100
```

Initial optimized baseline: 88/120 clears, or 73.3%.

Initial low-skill baseline: 0/100 clears for every class.

Problem read:

- Outlaw Combo was still near-solved at 9/10.
- Apache Trail and Spirit were both too consistent.
- Sheriff Street was too forgiving because Respect converted every win into too much max HP.
- Several Outlaw sustain cards were boring: free-action healing and evades made the best line feel automatic.

## Attempt 1

Changes:

- Reduced Sheriff Respect max-HP growth from +2 HP per win to +1 HP per win.
- Removed the free-action healing/evade loop from Outlaw combo sustain cards.
- Reduced Apache Spirit caps and Apache Signature damage.
- Reduced Marshal mark damage/prevention caps.

Result: 69/120 optimized clears.

Read: too punitive. Apache Spirit fell to 1/10 and Marshal Procedure fell to 3/10, which made real build paths look like low-roll failures.

## Attempt 2

Changes:

- Restored Apache Spirit passive caps.
- Restored Marshal mark caps.
- Kept Sheriff Respect at +1 HP per win.
- Kept Outlaw sustain cleanup.
- Kept Apache Signature damage trimmed.

Accepted result:

| Class | Build A | Clears | Build B | Clears |
| --- | --- | ---: | --- | ---: |
| Outlaw | combo | 9/10 | infamy | 2/10 |
| Sheriff | street | 5/10 | posse | 7/10 |
| U.S. Marshal | marks | 8/10 | procedure | 8/10 |
| Apache Tracker | spirit | 8/10 | trail | 9/10 |
| Vaquero | dual | 8/10 | flourish | 7/10 |
| Bounty Hunter | blood | 7/10 | doctor | 7/10 |

Aggregate: 85/120 clears, or 70.8%.

Low-skill baseline: 0/100 clears for every class.

## Honest Read

This is a good current balance point. It is not perfectly even, but it matches the requested profile:

- Random play dies.
- Optimized play clears about 70%.
- Outlaw Infamy acts like the low-roll path unless it hits strong scaling.
- Outlaw Combo, Apache, and Marshal preserve high-roll fantasy.
- Sheriff no longer wins just by stacking max HP.

The next balance pass should not add mechanics. It should tune specific high-output cards, especially Outlaw Combo and Apache Trail, only if longer tactical samples stay above target.
