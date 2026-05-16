# Between-Run Progression Proposal

## Recommendation

Add one lightweight between-run system: Oath Catalog unlocks.

Every run should still start blank, in the Slay the Spire sense: the player picks a class, receives that class's starter kit, starts at the first town, and carries no previous run money, HP, deck growth, defeated posters, town access, or run-only modifiers. The persistent layer only unlocks additional Oath cards into future card-offer pools.

The target content shape is five fun player Oath cards per class. One Oath per class can be available by default in that class's offer pool; the other four become between-run unlock goals. Opponents should also keep or receive signature Oath cards, but those are encounter identity cards, not player unlock rewards.

## Current State

- `static/js/app/run-state.js` owns the current run localStorage key, `highnoon_duelist_v2`.
- `defaultRun()` creates a run with starting money, HP, deck, active gun, class state, `currentTownOrder`, and `defeatedOpponentIds`.
- `static/js/app/app.js` removes the current run key on death, then routes the player through game over back to class select.
- `run.permanent` is run-local mechanical state. It includes class passives and cards that modify the run, and should still disappear on death.
- `static/js/data/cards.js` still stores Oath cards under the legacy internal `type: "showdown"` with `showdownLevels`.
- `static/js/duel/duel.js` already treats Oaths as persistent in-duel build-arounds that enter at Level I and can advance to Level III.
- `static/js/ui/ui.js` already has the relevant surfaces: class select, shop/card offer rendering, the persistent stance/oath row in duel, and game over.
- Existing opponents already have `opponentOnly` Oath cards; the content pass should make those feel more signature, not route them through the player unlock catalog.

The earlier town-access idea should not be used. It makes future runs inherit map access, which conflicts with the requested blank-start roguelike structure.

## Player-Facing Rule

Every new run starts from the same baseline for the chosen class.

Between runs, the player may unlock new class Oath cards. An unlocked Oath is not added to the starter deck, not granted for free, and not guaranteed in a run. It only becomes eligible to appear in future card-offer pools, such as shops or future reward screens.

This keeps permanent progression about variety and long-term goals, not raw power or skipped content.

## Saved Data Shape

Keep unlocks separate from the current run save so death can clear `highnoon_duelist_v2` without clearing the player's unlocked card catalog.

Suggested key:

```js
const UNLOCKS_LS_KEY = "highnoon_duelist_unlocks_v1";
```

Suggested value:

```js
{
  version: 1,
  unlockedShowdownIdsByClass: {
    outlaw: ["atk_no_honor", "atk_powder_keg_pact"],
    sheriff: ["atk_star_of_justice"],
    marshal: ["atk_federal_bounty_program"],
    vaquero: ["atk_el_doble"],
    apache_tracker: ["atk_great_spirit_bond"],
    bounty_hunter: ["atk_quickdraw_master"]
  },
  achievedMilestones: {
    outlaw_town_1_boss_clear: {
      unlockedShowdownIds: ["atk_powder_keg_pact"],
      classId: "outlaw",
      opponentId: "rookie_marshal_graves",
      achievedAt: "2026-05-15T08:30:00.000Z"
    }
  },
  seenUnlockIds: ["atk_powder_keg_pact"],
  bestRunByClass: {
    outlaw: {
      highestTownOrderReached: 2,
      defeatedOpponentCount: 4,
      endedAt: "2026-05-15T08:38:00.000Z"
    }
  },
  runsStarted: 3,
  deaths: 2
}
```

Field notes:

- `unlockedShowdownIdsByClass` is the legacy internal field that changes future player Oath card offers.
- Each class starts with one default catalog Oath available; the saved unlock catalog adds more.
- `achievedMilestones` records why a card unlocked, so game-over and class-select copy can explain progress.
- `seenUnlockIds` lets the UI show a "new" state once without building a larger achievement system.
- `bestRunByClass`, `runsStarted`, and `deaths` are optional summary fields. They can support game-over copy and tuning, but should not unlock rewards by themselves.
- Opponent Oaths do not belong in this save shape. They are controlled by opponent deck definitions.

## Reset Behavior

Persists after death:

- unlocked player Oath ids by class
- achieved unlock milestones
- one-time "seen" state for unlock presentation
- optional best-run and run/death summary stats

Resets on each new run:

- money
- HP and max HP, except class default max HP
- active gun and deck, except class starter kit
- shop purchases
- current duel state
- `run.permanent` class/run modifiers
- `currentTownOrder`
- `defeatedOpponentIds`
- current run bounty progress

Derived on new run:

- Nothing in the run should be stronger because of the unlock catalog.
- `defaultRun(classId)` and class starter deck application should stay the source of the new run baseline.
- The unlock catalog should only be consulted when building offer pools.

Full reset:

- A full profile reset should delete both `highnoon_duelist_v2` and `highnoon_duelist_unlocks_v1`.
- A normal death should delete only `highnoon_duelist_v2`.

## Unlock Pacing

Use deterministic class milestones, not repeatable currency.

Recommended target:

- Each class has five player Oaths in the catalog.
- Slot 1 is available by default for that class's offer pool.
- Slot 2 unlocks after first Town 1 boss clear with that class.
- Slot 3 unlocks after first Town 2 boss clear with that class.
- Slot 4 unlocks after first Town 3 boss clear with that class.
- Slot 5 unlocks after first Town 4 boss clear, or after the final boss if the game wants the fifth Oath to be a long-term prestige reward.

Important pacing guardrails:

- Do not grant unlock points for every run.
- Do not make players farm repeated Town 1 clears.
- Do not put direct stat upgrades in the unlock catalog.
- Do not add unlocked cards to the starter deck.
- Do not persist town access; every run still begins from the first-town baseline.

This creates one-more-run motivation because the next boss milestone can reveal a new build-around card for that class, while the next run still has the clean start and risk profile of a roguelike.

## Card Pool Rules

The implementation should distinguish between card definition and card availability.

Suggested card metadata:

```js
{
  id: "atk_powder_keg_pact",
  type: "showdown",
  classId: "outlaw",
  unlockId: "outlaw_town_1_boss_clear",
  unlockedByDefault: false
}
```

Offer-pool rule:

- Non-Oath cards continue to follow existing class/opponent/owned filters.
- Player Oaths require either `unlockedByDefault === true` or `unlockedShowdownIdsByClass[classId].includes(card.id)`.
- Class-specific Oaths still require the active run's `classId` to match.
- Enemy-only Oaths stay excluded from player offer pools.

This keeps the first implementation small: the card system does not need to understand a broad achievement framework, only whether a player Oath is available for offers.

## Player Oath Catalog

Design target: each class should have five Oaths that create different run fantasies. These are planning concepts, not final tuned card data.

### Outlaw

| Slot | Oath | Unlock | Fun hook |
| --- | --- | --- | --- |
| 1 | Oath of No Honor | Default | Existing combo identity: every outlaw combo pushes extra volley pressure. |
| 2 | Powder-Keg Oath | Town 1 boss | Small combo chains become explosive: Level I adds damage after combo turns; Level III adds extra shots and pierce when the chain is rolling. |
| 3 | Snake-Eyes Oath | Town 2 boss | High-risk outlaw luck: big accuracy/damage swings, with Level III rewarding low-nerve or last-card turns. |
| 4 | Black Hat Oath | Town 3 boss | The longer the duel lasts, the louder the outlaw gets: escalating extra volley shots across Oath levels. |
| 5 | Wanted Forever Oath | Town 4/final boss | Living on the edge: stronger damage and dodge while hurt, but no starter advantage because the card must be found and played in-run. |

### Apache Tracker

| Slot | Oath | Unlock | Fun hook |
| --- | --- | --- | --- |
| 1 | Oath to the Wind | Default | Existing Spirit scaling identity: Spirit turns into damage and accuracy as the Oath levels. |
| 2 | Oath to Coyote Moon | Town 1 boss | Trickster debuffs: Spirit reduces enemy accuracy and bullets, with Level III doubling down on enemy disruption. |
| 3 | Oath to Eagle Above Thunder | Town 2 boss | Focused sniper fantasy: gain Focused, then Focused turns into bullets and accuracy. |
| 4 | Oath to the Bear Path | Town 3 boss | Defensive Spirit path: damage reduction, dodge, and healing pressure for players who survive long prep cycles. |
| 5 | Oath to the Ancestors | Town 4/final boss | Big spiritual payoff: Level III doubles Spirit scaling for the next shootout and rewards a fully built Spirit engine. |

### Sheriff

| Slot | Oath | Unlock | Fun hook |
| --- | --- | --- | --- |
| 1 | Oath of the Star | Default | Current HP converts into damage while the Oath adds bullets, making survival feel offensive. |
| 2 | Main Street Oath | Town 1 boss | Hold the line: damage reduction plus extra shotgun volume for longer fights. |
| 3 | Oath of the Last Badge | Town 2 boss | Tank payoff: healing, damage reduction, and post-shootout recovery keep Respect Aim online. |
| 4 | Oath of Barred Doors | Town 3 boss | Town protects its sheriff: reduce enemy bullets and accuracy while adding enough pressure to end the duel. |
| 5 | Oath of the Living Badge | Town 4/final boss | Late-run Respect extender: raises the Respect cap beyond the baseline and adds accuracy/damage payoff. |

### U.S. Marshal

| Slot | Oath | Unlock | Fun hook |
| --- | --- | --- | --- |
| 1 | Oath of Federal Bounty | Default | Existing mark economy: marks become bullets and eventually burst damage. |
| 2 | Oath of the Docket | Town 1 boss | Paperwork as pressure: every mark makes the enemy easier to hit and harder to shoot back with. |
| 3 | Oath of the Posse | Town 2 boss | Marks call backup: mark count converts into extra bullets, then ricochet at higher levels. |
| 4 | Oath Without Borders | Town 3 boss | Relentless pursuit: accuracy floor and mark burst let the marshal finish evasive opponents. |
| 5 | Oath of the Warrant Storm | Town 4/final boss | Big capstone mark deck: Level III turns large mark stacks into bullets, damage, and enemy bullet suppression. |

### Vaquero

| Slot | Oath | Unlock | Fun hook |
| --- | --- | --- | --- |
| 1 | Oath of El Doble | Default | Existing dual-wield fantasy: two pistols become overwhelming, eventually removing the dual penalty. |
| 2 | Cantina Oath | Town 1 boss | Stylish bullet spread: extra bullets and ricochet make off-hand play feel flashy. |
| 3 | Matador's Oath | Town 2 boss | Dodge-and-counter rhythm: dodge rises first, then dodged pressure turns into accuracy and bullets. |
| 4 | Oath of Two Suns | Town 3 boss | High Noon burst: first hits auto-land when dual-wielding, with stronger Level III payoff. |
| 5 | Oath of Lead Revolution | Town 4/final boss | Capstone storm of lead: Level III combines extra bullets, reduced dual penalty, and volley damage. |

### Bounty Hunter

| Slot | Oath | Unlock | Fun hook |
| --- | --- | --- | --- |
| 1 | Oath of First Blood | Default | Existing quickdraw fantasy: first hits auto-land and accuracy climbs. |
| 2 | Blood Price Oath | Town 1 boss | Pay HP, get paid in damage: blood-for-lead cards become a deliberate burst engine. |
| 3 | Oath of the Queen's Writ | Town 2 boss | Cold precision: accuracy, first auto-hit, and enemy bullet suppression for controlled duels. |
| 4 | Coffin Oath | Town 3 boss | Execute marked prey: damage and pierce climb as the duel gets closer to a finish. |
| 5 | Last Breath Oath | Town 4/final boss | Dangerous capstone: huge payoff while wounded, tuned carefully so it is exciting without becoming mandatory. |

## Opponent Oath Plan

Opponent Oaths should be fun because they make each poster fight differently, not because they enter the player unlock system. The goal is one signature Oath per opponent, tuned to the opponent's role and town.

Design rules:

- Easy opponents should have readable Oaths with one clear threat.
- Medium opponents should bend a rule enough to force a response.
- Boss opponents should create a duel-specific problem the player remembers.
- Enemy Oaths can be stronger than player Oaths because they are attached to a known encounter, not a reusable player pool card.
- Prefer hooks that change player decisions: rush before Level III, conserve bullets, counter accuracy, heal before the volley, or plan around first auto-hits.

Current opponent-aligned concepts:

| Opponent | Oath | Fun hook |
| --- | --- | --- |
| Amos Pike | Oath of Deputy's Luck | Cowardly luck: dodge first, then surprise bullets when panic peaks. |
| Lottie Vale | Oath of the Curtain Call | Stage-duelist rhythm: accuracy and dodge build until the final level lands a guaranteed opening shot. |
| Marshal Elias Graves | Oath of the Town Charter | Law shuts the player down: damage plus bullet suppression, forcing clean prep decisions. |
| Barrel Ben Cobb | Oath of the Last Swig | Drunken volatility: reckless bullet gain with just enough dodge to make misses feel dangerous. |
| Molly Mash | Oath of White Lightning | Moonshine burn: accuracy and damage ramp steadily, pressuring the player to end the duel before Level III. |
| Isaac Stillwater | Oath of the Stillhouse Tax | Every round costs the player bullets while Isaac's damage climbs. |
| Needle-Eye Ned | Oath of the Lookout | Canyon alarm: extra bullets and dodge make him feel like he is calling shots from cover. |
| Veda Switchback | Oath of the Crossfire | Ambush puzzle: reduces player bullets and threatens a guaranteed hit at high level. |
| Red Jack Calder | Red Jack's Blood Oath | Boss rushdown: bullets and damage snowball fast, making delay dangerous. |
| Hollow Hank Dyer | Oath of the Cold Grave | Hard-to-kill grave hand: dodge and returned bullets make every hit feel contested. |
| Mara Voss | Oath Beneath the Grave Moon | Moonlit recursion: returned bullets plus dodge create a patient undead sharpshooter. |
| Silas Gravesmoke | Oath of the Dead Man's Toll | Late-town boss tax: damage, dodge, returned bullets, and pierce at Level III. |
| Dahlia Kane | House Oath | Casino inevitability: auto-hits and accuracy make the house feel rigged. |
| Caleb Cross | Ace-High Oath | Dime-novel legend: accuracy, bullets, damage, and one guaranteed hit at the top end. |
| Judge Obadiah Blackthorn | Last Western Oath | Final boss myth: guaranteed hits, damage, bullets, and pierce, tuned as the ultimate oath. |

Follow-up opponent content work should upgrade simple stat-ramp Oaths into more distinct encounter hooks where needed, but it should stay in opponent card data and not affect between-run player progression.

## UI Surfaces

Class select:

- Show a compact Oath Catalog summary for the selected class, for example: `Outlaw Oaths unlocked: 2/5`.
- If there are newly unlocked cards, show their names before the next class pick.
- Do not add a large collection screen in the first slice.

Game over:

- If the run achieved a new milestone, show `New Outlaw Oath unlocked: Powder-Keg Oath`.
- If no unlock happened, show the next clear target, for example: `Defeat a Town 2 boss as Outlaw to unlock the next Oath.`
- Keep the existing quick return flow, but make unlock copy visible before the auto-return.

Shop and future reward screens:

- Locked player Oaths should simply be absent from offers.
- Unlocked Oaths can appear using the existing card rendering.
- No "locked card" teasers are required in the shop for the first slice.

Duel:

- No new player duel UI is required. Existing stance/oath display already communicates an active Oath once the player has acquired and played one in the run.
- Opponent Oaths should continue using the same active Oath display so players understand the encounter's signature threat.

HUD:

- No persistent unlock HUD is required. The HUD should stay focused on current run money, HP, and class.

Reset:

- A full reset affordance should explicitly say that it clears both the current run and unlocked Oath catalog.

## Why This Improves Replay Motivation

The current death flow deletes the saved run and sends the player back to class select. That is correct for a blank-start roguelike, but it leaves no long-term goal outside the run.

Oath Catalog unlocks add long-term motivation without weakening the next run:

- The next milestone is concrete: beat a boss with a class, unlock one of that class's build-around cards.
- The reward changes future run variety, not starting power.
- A new run still begins with the same class starter baseline.
- Five Oaths per class gives each class a visible long-term identity arc without adding a broad achievement system.
- Opponent Oaths make individual posters more memorable without becoming persistent player power.
- No repeatable currency means the player is not pushed into grinding easy fights.

## Implementation Slices

1. Add unlock persistence helpers
   - Create `defaultUnlocks()`, `loadUnlocks()`, `saveUnlocks()`, and `unlockShowdownsForBossClear()` under `static/js/app/`, either beside `run-state.js` or in a small `unlock-state.js`.
   - Validate ids against `CARD_DEFINITIONS`, keep only player-eligible Oath ids, and tolerate missing/removed cards.

2. Add Oath availability metadata
   - Add `unlockedByDefault` and/or `unlockId` to player Oath definitions.
   - Define the first class catalog split: one default Oath per class, four locked target slots per class.

3. Filter offer pools
   - Update the shop/card-offer pool builder so locked player Oaths are excluded.
   - Keep existing class and ownership filters intact.
   - Leave opponent-only Oaths out of player pools.

4. Wire milestone detection
   - On boss victory, check whether the active class achieved a first-time town-boss milestone.
   - Save any newly unlocked class Oath ids to `highnoon_duelist_unlocks_v1`.
   - Do not alter `defaultRun()`, `currentTownOrder`, starter decks, or run economy.

5. Expose unlock feedback
   - Pass unlock state into class select and game over.
   - Show new unlock names and next class-specific milestone copy.

6. Add player Oath content in small batches
   - First batch: one new locked Oath per class, targeting the Town 1 boss milestone.
   - Later batches: add Town 2, Town 3, and Town 4/final boss milestone cards.
   - Prefer existing effect tokens in early batches so progression does not require engine work.

7. Upgrade opponent Oaths in small batches
   - Review each opponent's signature Oath against the fun hook table.
   - Tune or replace simple stat ramps where a clearer encounter identity is needed.
   - Keep changes in opponent-only card data.

8. Add reset behavior and smoke tests
   - Add a full reset path that clears both localStorage keys.
   - Smoke test: fresh profile, locked class Oath absent from offers, boss milestone unlocks it, death clears run only, next fresh run starts blank, unlocked Oath can appear in offers.

## Risks And Tuning Questions

- Thirty player Oaths is meaningful content work. Implement in batches; do not block the first persistence slice on the full catalog.
- If too many strong Oaths are locked, early runs may feel flat. Keep one fun default Oath per class available from the beginning.
- If unlocks are too frequent, the catalog will run out quickly. The milestone plan should remain one card per major class boss milestone.
- If unlocks are tied to repeated low-level clears, players will grind. Use first-time class milestone flags instead.
- Existing player Oaths may already be balanced as available content. Implementation needs a deliberate default-vs-locked split before gating any current cards.
- New Oath concepts that require new effect tokens should be deferred behind simpler cards that can use the current effect grammar.
- Opponent Oaths can become frustrating if they only add accuracy/damage. The fun target is a recognizable encounter problem, not invisible stat inflation.
- localStorage is browser-local. Clearing site data or changing browsers clears the unlock catalog unless a future account system is added.

## Non-Goals

- No persistent town unlocks.
- No permanent stat boosts.
- No meta currency.
- No starter deck upgrades.
- No backend or account persistence.
- No broad achievement screen in the first slice.
- No runtime behavior changes as part of this research issue.
