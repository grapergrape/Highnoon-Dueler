# Deeds And Signature Upgrades

Deeds are the current card-upgrade system. They sit beside the Wanted Board and give the player side objectives for each town.

## Core Rules

- Each town has 3 active Deeds.
- All 3 are active automatically; the player does not pick one.
- Completing a Deed grants 1 Signature Point.
- Spending 1 Signature Point upgrades one non-gun deck card copy.
- A card copy can only be upgraded once.
- Guns are not upgradeable in the first version.

The design goal is not free power. A Deed should tempt the player into a greedier line:

> Win safely, or push for the Deed and earn a Signature.

Current philosophy: Signatures should be a little broken once earned. The restraint comes from Deeds being hard enough that players must chase them deliberately instead of completing them by accident.

## Current Town Deeds

Town 1:

- Lead Work: deal 140 bullet damage.
- Hard Cover: prevent 45 damage with Armor.
- Signature Habit: build 24 class-resource stacks.

Town 2:

- Measured Violence: deal 260 bullet damage.
- Stay Standing: prevent 105 damage with Armor.
- Clean Claims: win 2 duels while finishing at 85%+ HP.

Town 3:

- Fast Hands: win 2 duels by round 3 or earlier.
- Deep Cover: prevent 145 damage with Armor.
- Class Act: build 55 class-resource stacks.

Town 4:

- Full Chambers: enter Showdown with max loaded bullets 6 times.
- Blood on the Line: win a duel at 25% HP or lower.
- Final Accounting: deal 420 bullet damage.

Town 5:

- Legend Work: win 2 duels while finishing at 90%+ HP.
- Unbroken: defeat the town boss with 65%+ HP.
- Last Ledger: build 85 class-resource stacks.

## Class Resource Tracking

Class-resource Deeds count the class mechanic, not generic card play.

- Outlaw: Infamy and Outlaw combo triggers.
- Sheriff: Deputies and deputy payoffs.
- U.S. Marshal: Marks and Case File.
- Apache Tracker: Spirit, Track, and Snare.
- Vaquero: Position and Flourish.
- Bounty Hunter: Bounty/Infection/lifesteal effects. HP paid does not count.

## Signature Branches

Each eligible card gets two generated upgrade branches:

- Reliable Signature: a large consistency improvement based on the card's existing role.
- Tall-Tale Signature: a large class-flavored payoff based on class/build identity.

Examples:

- A load card's Reliable branch adds 2 shot damage.
- An Armor card's Reliable branch adds 6 Armor.
- Outlaw Combo cards can gain 5 combo Armor.
- Marshal Procedure cards can gain 2 Case File.
- Apache Trail cards can gain 2 Track damage.
- Bounty Doctor cards can add 2 Infection pressure.

This is intentionally stronger than a normal card upgrade. A signed card should feel unfair. Deeds are the balance lever: fewer Signatures should happen automatically, and the best Deeds should make the player risk HP, tempo, or reward routing.

## UI Requirements

Wanted Board:

- Shows the current town's 3 Deeds beside the map/posters.
- Shows progress, target, completion state, and reward.
- Shows current Signature Points.
- Provides a Sign Cards button when Signature Points are available.

Combat:

- Shows a compact active Deeds tracker above the hand.
- Keeps Deed text readable without relying on the combat log.

Post-duel:

- Shows a Deed Ledger with per-Deed progress gained from the duel.
- Completed Deeds visibly grant Signature Points.
- Player can sign cards immediately or continue to rewards.

Upgrade screen:

- Shows current Signature Points.
- Shows eligible non-gun deck card copies.
- Shows both upgrade branches with final card text.

## Implementation Notes

- Deed data and progress helpers live in `static/js/data/deeds.js`.
- Card-copy deck state lives in `static/js/data/deck-state.js`.
- Signature branches are generated in `static/js/data/cards.js`.
- Combat records Deed stats in `static/js/duel/duel.js`.
- Wanted/combat/post-duel/upgrade UI lives in `static/js/ui/ui.js`.

## Current Balance Read

May 17, 2026 Deed-aware tuning pass:

- Low-skill sim: `node tools/balance-sim.mjs --runs 200` produced 0/200 clears for every class.
- Tactical build-guided sim: `node tools/tactical-shop-sim.mjs --runs 10 --build-paths` lands at roughly 69/120 clears overall after the harder-Deed/stronger-Signature pass.
- Path spread is now 4/10 to 8/10 clears: Outlaw combo 6, Outlaw infamy 5, Apache spirit 4, Apache trail 7, Sheriff street 6, Sheriff posse 6, Marshal marks 6, Marshal procedure 4, Vaquero dual 7, Vaquero flourish 4, Bounty blood 6, Bounty doctor 8.

Honest read: Deeds make the game more fun because they create a second reason to care about each duel beyond survival. They also make players attached to individual card copies. The system is now intentionally high reward, high effort: if too many Signatures are earned per town, raise Deed difficulty before nerfing Signature strength. Bounty Doctor is the current watch point because broken Infection Signatures can run away when the Deeds line up.
