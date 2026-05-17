# Town Identity Baseline

Each town should feel like a new combat lesson, not just larger HP numbers. The current implementation uses visible enemy intent patterns. See [combat-rework-technical-plan.md](combat-rework-technical-plan.md).

## Intent Baseline

Every opponent has a small set of named intents and a readable pattern. The player knows the next enemy action before playing cards.

Intent examples:

- `Attack 1x7`: one accurate bullet for 7 damage.
- `Attack 3x5`: three accurate bullets for 5 damage each.
- `Gain 10 Armor`: one-round damage reduction.
- `Line Up`: future attacks gain +2 damage per bullet.
- `Apply Rattled`: reduce the player's next Nerve gain.
- `Load 2`: an enemy-specific delayed gun mechanic that clearly previews the next attack.

The town progression teaches these concepts linearly. Town 1 proves Armor, Position, loaded bullets, and Nerve before later towns increase pressure.

## Town 1: Rookie Town

Identity: tutorial street.

Combat lesson: low-pressure attacks, first Armor turns, and the first boss-length duel.

Progression:

- Amos Pike teaches low single-shot pressure and simple cover.
- Lottie Vale teaches multi-bullet pressure, Armor timing, and a future-damage buff.
- Marshal Elias Graves tests whether the deck can beat Armor, multi-hit pressure, and a longer boss fight.

See [rookie-town.md](rookie-town.md) for the detailed baseline.

## Town 2: Small Whiskey

Identity: moonshine saloon.

Combat lesson: volatile bullet spikes, Rattled taxation, and future-damage buffs.

Progression:

- Barrel Ben Cobb alternates sloppy 3-shot pressure, cover, and Rattled.
- Molly Mash introduces a clear `White Lightning` buff before a heavy clean shot.
- Isaac Stillwater taxes slow decks with Rattled and stacked future bullet damage.

Balance intent: Small Whiskey should punish players who coast after Rookie Town, but most losses should still be avoidable with decent HP management.

## Town 3: Den of Bandits

Identity: ambush canyon.

Combat lesson: traps, crossfire, and gang pressure that force the player to count bullets, Armor, and next-round Nerve.

Progression:

- Needle-Eye Ned raises the alarm with single heavy pings, canyon cover, and alarm shots.
- Veda Switchback is the ambush puzzle: `Split Trail`, `Dry-Gulch Snare`, and `Ambush Angle`.
- Red Jack Calder is the rushdown boss: `Gang Signal` makes later attacks worse if the player delays.

Balance intent: Den of Bandits should be the first town where weak deck direction becomes obvious. It should not be solved by defensive stacking alone.

## Town 4: Dead Man's Creek

Identity: undead attrition.

Combat lesson: long-fight attrition that punishes decks without closing power.

Progression:

- Hollow Hank Dyer stalls with cover, rusted multi-shots, and Rattled.
- Mara Voss is a patient revenant with heavy Armor, marrow shots, and a large single `Coffin Nail`.
- Silas Gravesmoke is the undead legend boss: cover, 3-shot pressure, damage buffs, and a huge `Dead Man's Toll`.

Balance intent: Dead Man's Creek should ask whether the player can finish fights, not merely survive them.

## Town 5: The Devil's Saloon

Identity: legend table.

Combat lesson: late-game damage checks and final-boss inevitability.

Progression:

- Dahlia Kane is the rigged-table opener: `Silk-Sleeve Draw`, `Velvet Poise`, and `House Edge`.
- Caleb Cross is dime-novel tempo: repeated `Ace-High Tempo`, `Famous Hands`, and one large `Dime-Novel Shot`.
- Judge Obadiah Blackthorn is the final verdict: `Devil's Table`, `Final Verdict`, `Contempt of Court`, and `Last Word`.

Balance intent: The Devil's Saloon should demand a real deck engine. Random good cards should not be enough; the player should need class identity, HP discipline, and a plan for Armor/Rattled turns.

## Current Full-Run Balance Baseline

May 17, 2026 routed Node simulation, 200 runs per class with card rewards, 20% gun drops, and post-nerf whiskey healing, no shop purchases:

| Class | Full clears |
| --- | ---: |
| Outlaw | 27.5% |
| Apache Tracker | 28.5% |
| Sheriff | 25.5% |
| U.S. Marshal | 20.0% |
| Vaquero | 25.5% |
| Bounty Hunter | 30.0% |

This is the current target band for the no-relic/no-smithing/no-potion baseline: roughly one full clear in three. Shop purchases should raise skilled-player results, so future enemy or card buffs should be judged against both this baseline and actual played runs.

Key opponent signals from the same sim:

- `Red Jack Calder`: 96.2% player win rate when reached. He is now a route attrition check, not a wall.
- `Silas Gravesmoke`: 93.2% player win rate when reached. He checks closing power but should rarely hard-stop a healthy run.
- `Caleb Cross`: 80.4% player win rate when reached. He is the late tempo check before the final boss.
- `Judge Obadiah Blackthorn`: 37.4% player win rate when reached. The final boss is the primary full-clear filter.

Run future balance checks with [simulation-balancing.md](simulation-balancing.md).

Town 1 is intentionally forgiving in the sim so the combat language is learned before attrition starts. Future balancing should avoid creating early random deaths unless card readability and rewards have been improved further.
