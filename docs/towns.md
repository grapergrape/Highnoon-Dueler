# Town Identity Baseline

Each town should feel like a new combat lesson, not just larger HP numbers. Opponents use enemy-only cards and authored playbooks so their prep turns express the town theme.

## Town 1: Rookie Town

Identity: tutorial street.

Combat lesson: basic bullet denial, deterministic dodge, and the first boss-length duel.

Progression:

- Amos Pike teaches low-pressure bullet disruption.
- Lottie Vale teaches accuracy and timing pressure.
- Marshal Elias Graves tests whether the deck can beat control, dodge stripping, and a longer boss fight.

See [rookie-town.md](rookie-town.md) for the detailed baseline.

## Town 2: Small Whiskey

Identity: moonshine saloon.

Combat lesson: volatile bullet spikes, smoke-screen aim control, and resource taxation.

Progression:

- Barrel Ben Cobb is unstable but readable: `Sloppy Splash` adds bullets with bad aim, while `Barrel Cover` keeps him alive.
- Molly Mash is the first cleaner accuracy check: `Smoke Trail` lowers player accuracy while `White Lightning` ramps her own shot quality.
- Isaac Stillwater is the town boss and should feel like paying a tab in bullets: `Oath of the Stillhouse Tax` suppresses player bullets while `Long Pour` and `Boiler Pressure` add damage.

Balance intent: Small Whiskey should punish players who coast after Rookie Town, but most losses should still be avoidable with decent HP management.

## Town 3: Den of Bandits

Identity: ambush canyon.

Combat lesson: traps, crossfire, and gang pressure that force the player to count both bullets and accuracy.

Progression:

- Needle-Eye Ned raises the alarm: `Rattled Tin Can` adds accurate warning shots and `Oath of the Lookout` calls more bullets from cover.
- Veda Switchback is the ambush puzzle: `Dry-Gulch Snare` cuts player bullets, pressures aim, and strips player dodge while `Split Trail` makes her hard to pin.
- Red Jack Calder is a rushdown boss: `Gang Signal` and `Red Jack's Blood Oath` snowball bullets and damage if the player delays.

Balance intent: Den of Bandits should be the first town where weak deck direction becomes obvious. It should not be solved by defensive stacking alone.

## Town 4: Dead Man's Creek

Identity: undead attrition.

Combat lesson: returned bullets, dodge, and long fights that punish decks without closing power.

Progression:

- Hollow Hank Dyer blinds and stalls with `Grave-Dirt Toss`, `Won't Stay Buried`, and `Oath of the Cold Grave`.
- Mara Voss is a patient revenant: `Coffin Nail` and `Oath Beneath the Grave Moon` make her bullets come back.
- Silas Gravesmoke is the undead legend boss: `Funeral Procession`, `Bone Marshal's Call`, and `Oath of the Dead Man's Toll` make every extra cycle dangerous.

Balance intent: Dead Man's Creek should ask whether the player can finish fights, not merely survive them.

## Town 5: The Devil's Saloon

Identity: legend table.

Combat lesson: elite accuracy, auto-hits, and final-boss inevitability.

Progression:

- Dahlia Kane is the rigged-table opener: `Silk-Sleeve Draw`, `Velvet Poise`, and `House Oath` introduce late-game auto-hit pressure.
- Caleb Cross is dime-novel tempo: `Ace-High Tempo`, `Famous Hands`, and `Ace-High Oath` combine speed, accuracy, and guaranteed hits.
- Judge Obadiah Blackthorn is the final verdict: `Devil's Table`, `Final Verdict`, and `Last Western Oath` should feel like the strongest enemy kit in the game.

Balance intent: The Devil's Saloon should demand a real deck engine. Random good cards should not be enough; the player should need class identity, HP discipline, and a plan for auto-hits.

## Current Full-Run Balance Baseline

May 16, 2026 routed Node simulation, 200 runs per class with card rewards, 20% gun drops, and whiskey healing, no shop purchases:

| Class | Full clears |
| --- | ---: |
| Outlaw | 34.5% |
| Apache Tracker | 37.5% |
| Sheriff | 28.0% |
| U.S. Marshal | 36.0% |
| Vaquero | 34.5% |
| Bounty Hunter | 29.0% |

This is the current target band for the no-relic/no-smithing/no-potion baseline: roughly one full clear in three. Shop purchases should raise skilled-player results, so future enemy or card buffs should be judged against both this baseline and actual played runs.

Key opponent signals from the same sim:

- `Veda Switchback`: 99.3% player win rate when reached, but average post-win HP is 89.9. She is an attrition ambush now, not a stall wall.
- `Silas Gravesmoke`: 88.2% player win rate when reached. He is the main Dead Man's Creek deck-quality check.
- `Caleb Cross`: 87.0% player win rate when reached. He is the late tempo check before the final boss.
- `Judge Obadiah Blackthorn`: 52.1% player win rate when reached. The final boss remains the primary full-clear filter.

Run future balance checks with [simulation-balancing.md](simulation-balancing.md).
