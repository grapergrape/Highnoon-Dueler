# Frontend Module Structure

This frontend ships as browser-native ES modules (no bundler). `static/index.html` loads exactly one entrypoint: `/static/js/main.js`.

## Folder ownership

- `static/js/main.js`
  - Thin browser entrypoint only.
  - Imports and starts the app bootstrap from `app/app.js`.

- `static/js/app/`
  - App bootstrap and screen/flow orchestration (`app.js`).
  - Run persistence and saved-run fallback behavior (`run-state.js`).
  - Owns localStorage key `highnoon_duelist_v3`.

- `static/js/data/`
  - Static game data and data helpers:
    - cards, guns, classes, opponents
    - deck construction/shuffle helpers
    - Deed definitions and card-copy Signature state helpers
  - Should not own DOM or canvas rendering logic.

- `static/js/duel/`
  - Duel engine and duel-specific state transitions.
  - Public duel API consumed by app/rendering/UI layers.

- `static/js/ui/`
  - DOM panel rendering and HUD updates (`ui.js`).
  - Combat floating feedback and stat pulse helpers (`combat-ui.js`).
  - Keyboard input binding (`input.js`).

- `static/js/rendering/`
  - Canvas scene rendering and visual effects (`render.js`).
  - Consumes duel/app state but does not own app navigation.

## Guardrails for future changes

- Keep `main.js` thin; new orchestration belongs in `app/`.
- Keep gameplay data values in `data/`, duel rules in `duel/`, and UI/canvas output in `ui/` + `rendering/`.
- Prefer one-way dependencies:
  - `app` -> `data` / `duel` / `ui` / `rendering`
  - `duel` -> `data` / `ui/combat-ui`
  - `ui` and `rendering` can read duel/app state but should not mutate long-term run persistence directly.

## Combat Ownership

The active combat loop is documented in [../combat-rework-technical-plan.md](../combat-rework-technical-plan.md).

Ownership split:

- `static/js/duel/duel.js`
  - Owns the new `player_turn/showdown/ended` state machine.
  - Owns Armor, Position, loaded bullets, Nerve carryover, Rattled, enemy intent resolution, and Showdown damage math.

- `static/js/data/guns.js`
  - Owns gun capacity, start-loaded bullets, bullet damage, and current-duel gun upgrade data.

- `static/js/data/cards.js`
  - Owns the new effect vocabulary: `load`, `armor`, `position`, `evadeBullets`, `evadeAttack`, `nerve`, `nextNerve`, `draw`, `rattled`, and rare `overcap`.
  - Owns generated Signature upgrade branches for non-gun cards.

- `static/js/data/deeds.js` and `static/js/data/deck-state.js`
  - Own town Deed objectives, Signature Point progress, and per-copy card upgrade state.
  - Keep `run.deckCards` as canonical card-copy state and mirror `run.deckIds` for older helpers.

- `static/js/data/opponents.js`
  - Owns authored enemy intent tables and patterns.
  - Should not rely on hidden enemy card draws once the rework is active.

- `static/js/ui/ui.js` and `static/js/ui/combat-ui.js`
  - Own exact intent, incoming damage, outgoing damage, Position, Armor, loaded bullet, and Nerve displays.

- `static/js/rendering/render.js`
  - Keeps the short Showdown visual moment and reads combat state without owning combat decisions.
