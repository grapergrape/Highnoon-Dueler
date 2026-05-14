# Frontend Module Structure

This frontend ships as browser-native ES modules (no bundler). `static/index.html` loads exactly one entrypoint: `/static/js/main.js`.

## Folder ownership

- `static/js/main.js`
  - Thin browser entrypoint only.
  - Imports and starts the app bootstrap from `app/app.js`.

- `static/js/app/`
  - App bootstrap and screen/flow orchestration (`app.js`).
  - Run persistence and saved-run fallback behavior (`run-state.js`).
  - Owns localStorage key `highnoon_duelist_v2`.

- `static/js/data/`
  - Static game data and data helpers:
    - cards, guns, classes, opponents
    - deck construction/shuffle helpers
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
