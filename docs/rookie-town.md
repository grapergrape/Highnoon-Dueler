# Rookie Town Opponent Baseline

Rookie Town teaches the new deterministic combat language without asking for perfect deckbuilding. The wanted board is linear: Amos first, then Lottie, then Graves.

Town 1 is intentionally forgiving in the routed sim. The goal is readability: the player should understand intent, Armor, loaded bullets, Position, and Rattled before the later towns start taking runs.

## Amos Pike

Identity: nervous tutorial defender.

Story: Amos wears a borrowed badge after the real deputies disappeared. He is not brave, but he knows every porch rail, jail post, and loose cartridge in Rookie Town.

Intent pattern:

- `Shaky Shot`: attack 1x5.
- `Jailhouse Cover`: gain 6 Armor.
- `Panic Fire`: attack 2x4.

What he tests: reading a simple attack, recognizing a defensive enemy turn, and seeing that loaded bullets empty after Showdown.

## Lottie Vale

Identity: dance-hall timing check.

Story: Lottie counts bootsteps from the dance-hall footlights. Her draw is choreographed; the mistake is thinking the smile is not part of the shot.

Intent pattern:

- `Quickstep Draw`: attack 2x5.
- `Stage Cover`: gain 8 Armor.
- `Footwork`: future attacks gain +1 damage per bullet.
- `Curtain Call`: attack 1x13.

What she tests: planning around a visible buff turn and deciding whether to load into enemy Armor or preserve Nerve/Position.

## Marshal Elias Graves

Identity: first control boss.

Story: Graves built the gallows before the schoolhouse. Rookie Town is calm because everyone knows his law becomes violence when challenged.

Intent pattern:

- `Town Order`: gain 12 Armor.
- `Badge Order`: attack 2x7.
- `Iron Verdict`: attack 3x6.
- `Gallows Sunrise`: attack 1x24.

What he tests: boss-length fights, Armor timing, and whether the starter deck can produce enough loaded damage without taking every hit on HP.

Current sim signal after the May 17, 2026 rework:

- In the 200-run routed baseline, all six classes beat Amos and Lottie every time.
- Graves also had no recorded deaths in that baseline.
- That is intentional for now. Town 1 should teach the system, not be the main failure point.
