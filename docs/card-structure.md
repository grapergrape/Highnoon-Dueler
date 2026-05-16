# High Noon Card Structure

## Card Types

- Feats are immediate tricks, tactics, reactions, and bursts of pressure.
- Guns are equipped weapons. Each class starter gun sits outside the deck as the active gun.
- Stances stay in play during a duel and provide ongoing modifiers.
- Oaths are unique build-around cards. Only one Oath can be active in a duel at a time; it starts at Level I and advances after each unresolved High Noon until Level III.

## Baseline Deck

Each class starter deck contains 12 cards. Starter guns are equipped separately and do not count against the 12-card deck.

The old shared 9-card core is no longer a strict rule. Each class can be tuned separately when its identity needs different early density, but shared basics still define the common card language:

| Type | Count |
| --- | ---: |
| Shared Feats (`One in the Chamber`) | 4 |
| Shared Feats (`Dodge`) | 4 |
| Shared Feat (`Beer Heal`) | 1 |
| Class-Specific Specials | 3 |
| Total | 12 |

Deck cap remains 24 cards so rewards and shops can grow the run deck over time.

Outlaw is tuned separately because the class is built around prep rounds ramping from 1 to 3 base card plays and extra-play combo turns:

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Dodge` | 2 |
| `Beer Heal` | 1 |
| `Gunslinger's Tempo` | 2 |
| `Pistol Whip` | 1 |
| `Dust 'em Up` | 1 |
| `Smoke Break` | 1 |
| `Outlaw's Pact` | 1 |
| `Roll the Dice` | 1 |
| Total | 12 |

Sheriff is also tuned separately because the class uses Respect HP scaling and shotgun cards that need enough bullet volume to beat deterministic dodge:

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Dodge` | 1 |
| `Beer Heal` | 1 |
| `Bulwark` | 2 |
| `Badge Flash` | 2 |
| `Packed Shells` | 2 |
| `Town's Strength` | 1 |
| `Deputy Cover` | 1 |
| Total | 12 |

Marshal is tuned separately because marks are both offense and defense:

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 1 |
| `Dodge` | 1 |
| `Beer Heal` | 1 |
| `Dead to Rights` | 2 |
| `Federal Warrant` | 2 |
| `Deputy Crossfire` | 2 |
| `Badge Cover` | 2 |
| `Suppressing Fire` | 1 |
| Total | 12 |

Apache Tracker is tuned separately because Spirit is both setup and payoff, and his starter cards need immediate value under the prep-play limit:

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Dodge` | 2 |
| `Beer Heal` | 1 |
| `Wind Whisper` | 2 |
| `Spirit Talk` | 1 |
| `Ridge Sight` | 1 |
| `Owl's Vision` | 1 |
| `Bear Spirit` | 1 |
| `Medicine Bundle` | 1 |
| Total | 12 |

Vaquero is tuned separately because dual-wielding is his baseline state, and his starter deck needs penalty control plus cover:

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Dodge` | 2 |
| `Beer Heal` | 1 |
| `Steady the Off-Hand` | 2 |
| `Quick Holster` | 2 |
| `Crossfire` | 1 |
| `Left-Hand Cover` | 1 |
| `Off-Hand Reload` | 1 |
| Total | 12 |

Bounty Hunter is tuned separately because HP is his secondary resource, and his starter deck needs both blood-round payoff and recovery:

| Card | Count |
| --- | ---: |
| `One in the Chamber` | 2 |
| `Dodge` | 2 |
| `Beer Heal` | 1 |
| `Blood for Lead` | 2 |
| `Dead Man's Cover` | 2 |
| `Vendetta Shot` | 1 |
| `Reckless Aim` | 1 |
| `Patch Job` | 1 |
| Total | 12 |

## Run Deck Rules

- Rewards and shop card offers are class-only.
- Wanted-board progression is linear inside each town: easy poster, then medium poster, then boss. Defeated posters cannot be refarmed.
- Town identity and opponent progression baselines live in [towns.md](towns.md).
- Each win has a 20% chance to add a separate class-only gun drop screen after the card reward. Gun drops exclude the class starter/currently equipped gun.
- Feats can repeat, which lets a class build a focused engine.
- Stances and Oaths are unique deck cards; once owned, they stop appearing in reward/shop card offers.
- Guns are class-only in the player shop and gun drop screen. Starter guns begin equipped, do not count against the starter deck, and are not offered as merchant upgrades.
- Gun cards equip only for the current duel. The next duel starts from the class starter gun again until another gun card is played.
- Starter guns are baseline equipment and do not give combo bonuses. Upgraded Outlaw guns use combo-trigger shot scaling. Sheriff guns provide the defensive shotgun floor, but Sheriff cards should carry most late-run sustain and closing power. Marshal guns are premium government handguns that support marks and bounty economy without replacing the mark deck. Apache guns are bows/rifles that support Spirit payoff without replacing Spirit deckbuilding. Vaquero starts with a right-hand gun plus starter off-hand; Vaquero gun cards replace only the off-hand for the current duel. Bounty Hunter guns are concealed pistols that support blood-round life-steal without replacing HP-spend deckbuilding.
- The merchant offers cards and guns, but the player can buy only 1 card/gun per merchant visit. Whiskey healing is separate.

## Enemy-Only Pressure Effects

- `enemyDodge-N` reduces the target's deterministic dodge count for the next volley. It is currently used on enemy-only cards to keep dodge honest without returning to random dodge chance.
- Rookie Town uses enemy playbooks with explicit per-round play counts, so opponents can execute authored prep patterns instead of playing a random single card every round.

## Pool Targets

Recommended class pool target:

| Type | Count |
| --- | ---: |
| Starter Gun | 1 |
| Extra Guns | 3 |
| Feats | 14 |
| Stances | 5 |
| Oaths | 2 |
| Total | 25 |

Shared cards still exist for starter decks, enemy decks, and legacy content, but player rewards and shop card offers should not use the shared pool during normal class runs.

Starter decks begin at 12 cards and can grow up to the 24-card cap.

## Class Balance Baselines

- [Outlaw](outlaw.md) is the baseline for high-tempo combo classes.
- [Sheriff](sheriff.md) is the baseline for defensive scaling classes.
- [U.S. Marshal](marshal.md) is the baseline for mark-scaling control classes.
- [Apache Tracker](apache-tracker.md) is the baseline for Spirit-ramp precision classes.
- [Vaquero](vaquero.md) is the baseline for equipment-slot dual-wield classes.
- [Bounty Hunter](bounty-hunter.md) is the baseline for HP-as-resource blood-round classes.
