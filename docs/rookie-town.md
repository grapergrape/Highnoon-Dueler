# Rookie Town Opponent Baseline

Rookie Town teaches the three core enemy shapes without asking for perfect deckbuilding yet. Every opponent uses enemy-only cards and a small playbook so fights feel authored instead of random. The wanted board should present the town linearly: Amos first, then Lottie, then Graves.

Balance target: starter-only full-town simulations should land near 8/10 clears across the six classes. Normal reward plus merchant-heal simulations can be higher because two card rewards and paid healing are active before the boss.

## Amos Pike

Identity: nervous tutorial defender.

Story: Amos wears a borrowed badge after the real deputies disappeared. He is not brave, but he knows every porch rail, jail post, and loose cartridge in Rookie Town.

Plan:

- Round 1: hide behind `Badge Tremble` or swear `Oath of Deputy's Luck`.
- Round 2: disrupt the player's volley with `Shaky Warning Shot` or duck with `Jailhouse Duck`.
- Round 3: add an unreliable bullet with `Panic Reload`; Amos can play two cards here but should still be low-pressure.

What he tests: basic bullet denial, deterministic dodge, and low-pressure enemy Oaths.

## Lottie Vale

Identity: accuracy and timing check.

Story: Lottie counts bootsteps from the dance-hall footlights. Her draw is choreographed; the mistake is thinking the smile is not part of the aim.

Plan:

- Round 1: establish `Footlight Poise` or `Oath of the Curtain Call`.
- Round 2: pressure aim with `Footlight Feint` or defend with `Skirt-Step Slip`.
- Round 3: threaten a reliable opening hit with `Quickstep Draw`.

What she tests: whether the player can respect accurate single-shot pressure instead of only counting bullet totals. `Footlight Feint` strips one deterministic dodge so high-dodge hands still need to think.

## Marshal Elias Graves

Identity: first control boss.

Story: Graves built the gallows before the schoolhouse. Rookie Town is calm because everyone knows his law becomes violence when challenged.

Plan:

- Round 1: establish `Oath of the Town Charter` or `Main Street Patience`.
- Round 2: suppress the player with `Badge Order` or `Gallows Command`.
- Round 3: close with `Iron Verdict`.

What he tests: boss-length fights, player bullet suppression, and the need to build enough offense before enemy Oaths level too far. Graves is the main town failure point; `Badge Order` and `Gallows Command` strip deterministic dodges so the fight cannot be solved by stacking dodge alone.

Current sim signal after tuning:

- Starter-only automated baseline: 86.3/100 average town clears across the six classes in the latest 100-seed aggregate.
- Normal reward plus merchant-heal automated baseline: 89.0/100 average town clears in the latest 100-seed aggregate.
- All recorded losses were at Graves in the latest baseline, which is intentional for Town 1.
