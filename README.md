# Highnoon Dueler

A browser-based PvE Western deckbuilding duel roguelite. Pick a class, fight down the Wanted Board, build a class-specific deck, and survive repeated High Noon shootouts.

## Gameplay Snapshot

Current implementation:

- Each duel round reveals the enemy's next intent before the player acts.
- The player spends a carried Nerve bank to play any affordable cards. There are no prep-round card limits and no active Oath system in the current combat loop.
- Attack cards load bullets into the current gun. At the short Showdown, all loaded bullets fire and then the gun empties.
- Armor is one-round damage reduction and clears after Showdown.
- Position is the main movement mechanic: higher Position increases bullet damage, while rare Dodge effects spend Position to evade bullets.
- Enemies use authored, readable intents such as `Attack 3x7`, `Gain 12 Armor`, `Apply Rattled`, or `Buff future bullet damage`; enemy attacks are deterministic and 100% accurate.
- Taking unblocked HP damage applies Rattled, reducing next-round Nerve gain.
- Rewards and shop cards are class-only. Feats can repeat; stances are unique. Each merchant visit allows 1 card/gun purchase plus optional whiskey healing that costs roughly the bounty just earned. Starter guns are baseline equipment and are not offered as merchant upgrades.
- Each win has a 20% chance to add a separate class-only gun drop screen after the card reward. Gun drops exclude the class starter/currently equipped gun and can be taken or skipped.
- Gun cards equip for the current duel only. The next duel starts from the class starter gun again until another gun card is played.
- Outlaw spends Position for dirty combo turns and burst loading.
- Sheriff builds Armor and Position, earning Respect for max-HP scaling.
- U.S. Marshal stacks Marks for deterministic damage and incoming damage reduction.
- Apache Tracker builds Spirit for bow/rifle damage and a visible defensive floor.
- Vaquero dual-wields from the first duel, using Position and off-hand pressure to support high bullet volume or flourish damage.
- Bounty Hunter spends HP for blood rounds, then relies on limited life-steal, quickdraw ties, or doctor-style Infection to recover the wager.
- Each class now has two build paths; see [docs/build-paths.md](docs/build-paths.md) for the current balancing contract.

## Run Locally

```bash
docker compose up --build
```

Open [http://localhost:8088](http://localhost:8088) in your browser.
