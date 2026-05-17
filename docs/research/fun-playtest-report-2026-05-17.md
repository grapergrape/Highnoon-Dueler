# Fun Playtest Report - May 17, 2026

## Method

This pass ran the build-guided tactical runner:

```bash
node tools/tactical-shop-sim.mjs --runs 10 --build-paths
```

That is 10 full-route runs per build, 2 builds per class, 20 runs per class, 120 runs total.

Important caveat: this is still not a perfect human playtest. The runner searches playable card lines and makes build-biased reward/shop choices, so it is useful for testing whether a fun deck can be assembled and piloted. It does not fully measure mouse feel, hesitation, UI comprehension, or whether a human would naturally notice a line.

## Scoring Scale

The current score uses the requested Slay the Spire-relative baseline:

- Slay the Spire: 70/100.
- Highnoon Dueler should only approach that range when it has comparable run texture, draft tension, and long-term deck variety.
- A score in the 50s means the core is fun and worth building on, but it is not yet addictive enough to compare with a mature roguelike deckbuilder.

## Overall Rating

Current game rating: **50/100**.

This is meaningfully better than the earlier bullet/dodge version and better than the first two-path pass. Deeds and stronger Signature upgrades give runs a real chase target, and the best class paths now create recognizable deck identities.

It is still not close to Slay the Spire's 70. The biggest gaps are depth and variety: no relic-equivalent layer, no event texture, no potion-like emergency decisions, limited upgrade cadence, and too many late deaths concentrated around the final boss. The game has fun builds now, but it does not yet create enough "this run is completely different" moments.

Aggregate result: **69/120 clears, 57.5%** under tactical build-guided play.

## Build Results

| Class | Build | Clears | Main Death Pattern | Fun Read |
| --- | --- | ---: | --- | --- |
| Outlaw | Combo | 6/10 | All losses at Judge Obadiah Blackthorn | Explosive and readable. Better than before, but still binary when the chain stalls. |
| Outlaw | Infamy | 5/10 | All losses at final boss | Strongest Outlaw fantasy. Scaling reputation into bullets/armor/damage feels distinct. |
| Apache Tracker | Spirit | 4/10 | All losses at final boss | Thematic, but more linear than Trail. Needs sharper tactical conversion moments. |
| Apache Tracker | Trail | 7/10 | Caleb Cross twice, final boss once | Best tactical path. Track/Snare makes enemy intent matter and creates real decisions. |
| Sheriff | Street | 6/10 | All losses at final boss | Clean and fair, but quiet. Works mechanically more than emotionally. |
| Sheriff | Posse | 6/10 | All losses at final boss | Better fantasy than Street. Deputies make the class feel more alive. |
| U.S. Marshal | Marks | 6/10 | All losses at final boss | Coherent and effective, but can feel solved once marks stack. |
| U.S. Marshal | Procedure | 4/10 | All losses at final boss | Better planning shape than Marks, but too dry and swingy. |
| Vaquero | Dual | 7/10 | All losses at final boss | Very fun when online. Possibly too reliable with build-biased rewards. |
| Vaquero | Flourish | 4/10 | Caleb once, final boss five times | Good precision idea, but still fragile and less satisfying than Dual. |
| Bounty Hunter | Blood | 6/10 | All losses at final boss | Strong risk/reward loop. HP payment still has tension when lifesteal is not automatic. |
| Bounty Hunter | Doctor | 8/10 | Silas once, final boss once | Most powerful path. Infection is fun, but this is currently too forgiving when upgrades land. |

## Class Ratings

| Rank | Class | Score | Best Build | Read |
| ---: | --- | ---: | --- | --- |
| 1 | Apache Tracker | 56 | Trail | Best design model. Reactive, readable, and tied to opponent intent. |
| 2 | Bounty Hunter | 55 | Blood/Doctor | Strongest emotional tension, but Doctor is overtuned. |
| 3 | Outlaw | 54 | Infamy | Good identity and fair spread. Needs more non-binary combo recovery. |
| 4 | Sheriff | 49 | Posse | Stable baseline, but still needs louder payoff turns. |
| 5 | Vaquero | 47 | Dual | Great high rolls, weaker alternate path cohesion. |
| 6 | U.S. Marshal | 46 | Procedure | Coherent but emotionally dry; needs more exciting cash-out choices. |

## Honest Fun Read

The game is now fun in the "I can see the deck forming" sense. That is the most important improvement. The build paths are real enough that runs can be described after the fact: Trail Snare Apache, Doctor Infection Bounty Hunter, Infamy Outlaw, Posse Sheriff, and so on.

The game is not yet fun in the Slay sense of endless draft discovery. Too many runs still feel like stronger or weaker versions of the intended path. Slay gets a lot of its 70/100 rating from overlapping systems: relics, map routing, potions, elite risk, campfire decisions, events, curses, deck removals, and extremely sharp card upgrades. Highnoon currently asks cards, guns, Deeds, and shops to carry almost all of that weight.

The strongest current moment is earning a Signature and upgrading a card into something that feels a little broken. That direction is good. The problem is that those broken moments are not varied enough yet.

## Balance Notes

Doctor Bounty Hunter is the clear overtuned path. 8/10 is high, and the clears often ended with healthy HP. If Doctor remains this forgiving, Infection stops being a risky attrition plan and becomes the correct answer too often.

Apache Trail and Vaquero Dual are also high at 7/10, but they are different cases. Trail is high because the decisions are good. Dual is high because bullet volume is naturally efficient when the deck cooperates. Trail should be preserved carefully; Dual may need more draft pressure or better competition from Flourish.

Marshal Procedure and Vaquero Flourish are the weak-feeling paths. Procedure has planning but lacks emotional payoff. Flourish has a good fantasy but needs better bridges into the rest of Vaquero's kit.

Sheriff is balanced but not exciting enough. That is safer than being broken, but it caps fun. Posse should probably become the model for Sheriff because deputies make the class feel less like pure armor math.

## Priority Improvements

1. Add more run-changing rares.
   Each class needs at least one card that changes the plan instead of simply improving the current plan.

2. Nerf Doctor slightly through risk, not raw boredom.
   Infection should require timing and protection. Avoid just lowering all numbers.

3. Make Flourish and Procedure payoffs louder.
   These paths need memorable cash-out turns.

4. Preserve Apache Trail.
   It is the best example of the new combat system making deterministic enemy intent fun.

5. Add more non-card run texture next.
   Deeds helped, but the game still needs another layer of decisions outside "take the best card for my build."

## Bottom Line

The game is now a promising 50/100 against Slay the Spire at 70/100.

That is not a bad prototype score. It means the combat rework, two-path class model, and Deeds are working. It also means the game is still missing the variety engine that makes a deckbuilder addictive for dozens of runs.
