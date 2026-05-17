# Items And Trinkets

Items are the shared relic-style progression layer. They are not class cards, not guns, and not class-specific.

## Slots

Each run has 10 equipment slots:

- Gear: `hat`, `belt`, `boots`, `strap`, `coat`
- Trinkets: 5 small trinket slots

Gear is stronger and slot-locked. Trinkets are weaker, stack in any trinket slot, and are rarer.

## Item Pool

Current pool size: 65 total items.

| Type | Count |
| --- | ---: |
| Hats | 10 |
| Belts | 10 |
| Boots | 10 |
| Straps | 10 |
| Coats | 10 |
| Trinkets | 15 |

All items are shared across every class.

## Start Of Run

After choosing a class, the player is offered 3 random gear items. Trinkets are excluded from this starting offer.

The player chooses 1 gear item, equips it into its slot, then enters the wanted board.

## Boss Drops

Bosses are the only source of gear drops.

On each boss victory, the game rolls 1 gear item for a currently empty gear slot. The player equips it directly. Because the player starts with 1 gear item and there are 5 gear slots, boss drops fill the missing gear slots over the run. If all gear slots are already full, no boss gear screen appears.

Bosses do not drop trinkets.

## Trinket Drops

Non-boss fights have a 5% chance to drop a trinket after victory.

Trinket drops only happen if the run has an open trinket slot and the rolled trinket is not already equipped. Trinket drops can be skipped.

## Merchant Trinkets

The merchant can offer 1 trinket from the second merchant visit onward. This keeps the first merchant focused on basic survival and card/gun decisions.

Trinkets are intentionally expensive. Buying one uses the same single-purchase pressure as cards and guns, so the player cannot always buy both a deck piece and a trinket in the same shop.

## Current Mechanical Scope

The item engine supports:

- starting Nerve
- max Nerve
- Nerve gained each later round
- starting Armor
- Armor per round
- starting loaded bullets
- loaded bullets per later round
- gun capacity
- bullet damage
- starting Position
- Position cap
- Position per later round
- first-round evade
- first-round enemy bullet damage reduction
- first non-gun card free each duel
- first gun swap free each duel
- healing after duel wins
- healing after boss wins
- flat and percent bounty gains
- merchant card, gun, and trinket discounts

Max HP items apply immediately when equipped.

The current pool deliberately avoids the most snowbally versions of those hooks:

- No item currently grants Armor every round.
- No item currently grants bullet damage or later-round free bullet loading.
- Only 3 of 65 items start the duel with a loaded bullet.
- Only 3 of 65 items increase gun capacity.
- Only 1 of 65 items grants immediate starting Position.
- Only 2 of 65 items increase max Nerve.

Those constraints are intentional. Five guaranteed gear pieces by the end of a run already add a lot of consistency, so shared items should mostly add texture, not solve the deck.

## Balance Intent

Gear should feel meaningful, but it should not become a second deck engine by itself. A boss gear drop should slightly bend future decisions without replacing class cards, Deeds, or guns.

Trinkets should feel useful but smaller. A single trinket should not define a build, but several trinkets can push a run toward a distinct texture.

Items should add variety without replacing class identity. If one item becomes mandatory for too many classes, it should be nerfed or made more conditional.

Early post-item tactical sims showed that free bullets, recurring Armor, starting Position, and max-Nerve stacking pushed clear rates too high. Keep those effects rare unless the opponent curve is also raised.
