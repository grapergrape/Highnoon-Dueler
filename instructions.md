# High Noon Duelist - Deckbuilding Pistol Roguelite

Build a self-contained browser-based PvE deckbuilding Western pistol dueling roguelite. Single project, runnable locally via VS Code.

## Project Layout (strict)
project_root/
├── src/
│   └── server.py
├── static/
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── main.js           (game loop, root state manager)
│       ├── duel.js           (core duel logic, shootouts, resolution)
│       ├── deck.js           (deck building, card draw, hand management)
│       ├── cards.js          (card definitions, effects, generation)
│       ├── guns.js           (gun database, special abilities)
│       ├── opponents.js      (wanted posters, AI opponents, backstories)
│       ├── ui.js             (HUD, card UI, shop, wanted board)
│       ├── render.js         (canvas drawing, animations, particles, duel scene)
│       └── input.js          (mouse + keyboard handling)
└── requirements.txt         (fastapi, uvicorn)
text## Server (`src/server.py`)
- FastAPI + uvicorn setup identical to previous projects.
- Supports `--port` and `--host` via argparse.
- Serves `static/index.html` on `/` and mounts static files.
- Compatible with VS Code launch config on port 8088.

## Frontend Tech (strict)
- Vanilla HTML5 Canvas + ES modules + CSS. No frameworks, no bundlers, no external assets.
- All visuals drawn with Canvas 2D. Single `game` state object in `main.js`.

## Detailed Visuals & Setting

**Overall Aesthetic**: Retro 16-bit / 32-bit pixel art style with a gritty Western feel. Warm, dusty color palette (browns, oranges, deep reds, muted blues). Strong silhouettes and smooth pixel animations.

**Camera & View**:
- Fixed over-the-shoulder view from **behind the player’s right hip**.
- Player occupies bottom-left third of screen, enemy stands middle-right.
- Duel takes place on a dusty Western main street with wooden sidewalks and storefronts.

**Background Details**:
- Parallax layers: distant mountains, sky with slow clouds, heat haze.
- Ambient animations: blowing dust, tumbleweeds, swaying signs, circling vultures.
- Background changes per opponent (saloon, bank, sheriff office, abandoned mine, etc.).
- Lighting shifts with time of day (harsh noon, orange dusk, dramatic night).

**Player Character**:
- Tall lean gunslinger in brown duster, cowboy hat, bandana.
- Right arm and pistol clearly visible.
- Animations: idle breathing + coat flap, card playing gesture, flinch on damage, rapid recoil while shooting, dramatic death fall with hat flying off.

**Enemies (MVP - 3 opponents)**:
1. Blackjack Riley – Fat bearded outlaw in red shirt (slow, tanky).
2. Silent Rose – Female gunslinger in black leather (fast, elegant).
3. Mad Dog McClane – Skinny crazy-eyed bandit with bandoliers (aggressive).

Each has unique colors, idle animations (spitting tobacco, gun twirling, maniacal laughing), and death animations.

**High Noon Shootout Visuals**:
- Huge "**HIGH NOON**" text with bell visual.
- Slight camera zoom + slow-motion effect.
- Bright yellow bullet tracers, muzzle flashes, dust/blood impacts, damage popups.
- Screen shake on heavy hits.
- Special gun abilities have unique flair (ricochet trails, explosions, etc.).

**UI Style**:
- Pixel art fonts, parchment/wooden panels, wanted-poster style health bars.
- Cards have thick borders and western illustrations.

## Core Duel Loop

Each duel consists of multiple **High Noon cycles** until one gunslinger dies:

1. **Preparation Phase (3 Rounds)**  
   - Player draws **1 Gun Card + 3 normal cards** per round.  
   - Both players take turns playing cards (player first).  
   - Plays limited by **Stamina** (mana).  
   - After 3 rounds → **High Noon** triggers.

2. **High Noon Shootout**  
   - Both empty **all loaded bullets** into each other.  
   - Bullets resolved with accuracy rolls and effects.  
   - If both die in the same shootout, the one with **less negative HP** wins.

3. Repeat with new card draws until one duelist is dead.

## Stats
- **Player** (persistent in a run):
  - Health (starts ~100, carries between duels)
  - Accuracy
  - Stamina / Max Stamina (mana)
- **Gun**:
  - Bullets per magazine
  - Damage per bullet
  - Base Accuracy
  - Special Ability

## Card Types & Concrete Examples

### Gun Cards (always drawn once per round)
- Quick Draw Revolver: +2 Bullets, +15% Accuracy this shootout
- Heavy Slugger: +3 Damage, -10% Accuracy this shootout
- Oiled Chamber: +25% Accuracy, bullets gain "Pierce"
- Bandit’s Gambit: +4 Bullets, lose 8 Health after shootout

### Attack Cards (gun buffs / opponent debuffs)
- Rust Bullet: Enemy loses 25% Accuracy next shootout
- Trick Shot: +1 bullet, 30% chance to ricochet (50% damage)
- Sand in the Chamber: Enemy loses 2 bullets next shootout
- Fan the Hammer: +2 bullets at -20% accuracy
- Dead Man’s Volley: Return 1 bullet per enemy hit (max 4)

### Character Cards (Permanent Powers - last whole run)
- Iron Gut: +25 max Health, heal 8 at start of every duel
- Lightning Reflexes: +12% Accuracy, +1 Stamina per round
- Deadeye: Bullets above 85% accuracy deal +30% damage
- Thick Hide: Reduce all incoming damage by 1 (min 1)

### Physical Feat Cards (One-cycle buffs)
- Adrenaline Rush: +30% Accuracy & +20% damage this cycle, lose 10 Health after
- Steady Hand: +35% Accuracy, first 3 bullets cannot miss
- Whiskey Courage: +40 max Stamina this cycle, +15 Health
- Tumbleweed Dodge: 25% chance to dodge each bullet next shootout

**Card Names** use strong Western flavor: Devil’s Due, Hangman’s Noose, Rattlesnake Reflexes, Undertaker’s Deal, etc.

## Progression
- **Wanted Board** (hub menu): List of wanted posters.
- MVP has **3 opponents** with unique backstories and decks.
- After winning a duel → **Merchant** screen:
  - Spend bounty money on new cards, better guns, and healing (whiskey, food, etc.).
- Health carries between duels — player must heal at merchant.
- Money and unlocked cards/guns persist between runs (localStorage).

## Definition of Done
1. Server runs and game loads instantly.
2. Full duel loop works: 3 prep rounds → High Noon → repeat until death.
3. Card drawing, stamina costs, and turn-based play function correctly.
4. Shootout resolution with bullet tracers and accuracy is satisfying.
5. Deckbuilding, shop, and Wanted Board progression work.
6. At least 3 distinct opponents with different behaviors.
7. Persistent progression via localStorage.
8. Strong Western pixel-art atmosphere and High Noon tension.
9. Game is fun and addictive for multiple runs.

Build the entire thing now.