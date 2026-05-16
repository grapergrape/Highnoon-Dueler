# Bounty Hunter Balance Baseline

## Identity

Bounty Hunter is the blood-price quickdraw class. He should feel like a professional killer who spends HP to load violent, life-stealing rounds, then earns that HP back only if the volley lands.

The class is not a generic self-damage berserker. HP is the wager, but accuracy, first hits, cover, and life-steal decide whether the wager pays.

## Current Core Rules

- Passive: `Blood for Lead`
- Starting HP: 110
- +1 Nerve each prep round.
- At 50% HP or lower, gains +15% accuracy, +4 damage, and the first 2 shots auto-hit.
- If both duelists die in the same volley, Bounty Hunter wins and heals 25% max HP.
- Life-steal bullets heal HP per successful player hit.

The class should want to dip into danger, not sit at 1 HP forever. Brink bonuses should make low HP exciting, while life-steal gives a route back out if the player built enough hit density.

## Starter Deck

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

Bounty Hunter starts with `.41 Derringer` equipped.

## Card Identity

Bounty Hunter cards should mostly do one of these jobs:

- Spend HP for immediate pressure: `payHp`, bullets, damage, first auto-hits.
- Pay back that HP through `lifestealOnHit`.
- Keep the wager survivable with deterministic cover: `dodgeRecv`, `damageTaken`, `enemyAccNext`.
- Create tempo so HP-spend cards do not consume the entire prep round: `extraPlay`.
- Turn clean hits into money without letting bounty economy replace combat power: `bountyOnHit`.

Healthy examples:

- `Blood for Lead`: HP spend, damage, bullet, life-steal, and an extra play.
- `Dead Man's Cover`: deterministic defense that refunds the play.
- `Patch Job`: immediate recovery and tempo.
- `Vendetta Shot`: efficient blood-round pressure.
- `Final Notice`: paid burst with life-steal and bounty upside.
- `Blood Money` and `Crown Contract`: persistent life-steal/bounty engines.

Avoid giving every Bounty Hunter card raw damage. The fun is deciding when to pay HP, when to cover, and when the current hand can earn the blood back.

## Gun Identity

Bounty Hunter guns are concealed pistols and odd contract weapons. They should be precise, front-loaded, and good with life-steal, but not large-magazine safety tools.

Current gun split:

| Gun | Role |
| --- | --- |
| `.41 Derringer` | Starter concealed pistol: small magazine, high accuracy, first auto-hit, dodge, and modest life-steal. |
| `Twin Contract Derringer` | Rare upgrade: sharper first hits, life-steal, and small bounty economy. |
| `Pepperbox Revolver` | Epic upgrade: more shots and steadier life-steal, but less lethal per bullet. |
| `Doc Holliday's Hideout` | Legendary upgrade: high precision, pierce, life-steal, and some bounty gain without becoming a full economy engine. |

Upgrade guns equip only for the current duel. The next duel starts from `.41 Derringer` again until another gun card is played.

## Balance Targets

Bounty Hunter should:

- Feel dangerous from the first duel.
- Make HP spending a real decision, not a pure downside.
- Recover through landed hits, not passive full healing.
- Use cover and Patch Job to bridge bad hands.
- Have scary final-town burst if the deck has enough blood rounds.

Bounty Hunter should not:

- Become immortal through life-steal.
- Use bounty money to trivialize shop healing.
- Require the legendary gun to function.
- Win by drafting only `payHp` damage cards with no recovery.
- Be safer than Sheriff or Marshal.

## Tuning Levers

Buff Bounty Hunter through:

- More `lifestealOnHit` on paid cards.
- More bullets on blood-round cards if enemy bullet denial hard-stops him.
- More `extraPlay+1` on defensive/recovery cards.
- Slightly better starter gun accuracy or life-steal.
- Stronger brink bonuses if low HP does not feel rewarding.

Nerf Bounty Hunter through:

- Lowering `lifestealOnHit` on guns.
- Reducing `bountyOnHit` if shop healing becomes automatic.
- Lowering `No Tomorrow` and `Vendetta Shot` bullet counts.
- Reducing the brink damage/auto-hit bonus.
- Dropping starting HP if early towns become too safe.

Be careful when changing:

- `lifestealOnHit`: it is both survivability and the core fantasy.
- `bountyOnHit`: extra money compounds through shops.
- `payHp`: costs that look small stack quickly across prep rounds.
- Brink bonuses: too weak and the class is miserable; too strong and low HP becomes the best stable state.

## Current Playtest Baseline

May 16, 2026 Playwright/Chromium simulation, 10 full Bounty Hunter runs, no relics/smithing/potions:

- Clears: 3/10.
- Average wins: 13.4/15.
- Losses: mostly `devils_saloon_judge_blackthorn` and `dead_creek_silas_gravesmoke`.
- Winning decks leaned on repeated `Vendetta Shot`, `Blood for Lead`, `Bloodlust`, `No Tomorrow`, and either `Twin Contract Derringer`, `Pepperbox Revolver`, or `Doc Holliday's Hideout`.

Honest read: this is a good hard-class baseline. The class can clear when blood rounds line up with life-steal and a good concealed gun, but final bosses still punish hands that pay HP without enough cover or first-hit pressure.

## Baseline For Other Classes

Bounty Hunter is the reference for HP-as-resource classes:

- HP payment needs a payoff that is visible in the same duel.
- Recovery should depend on execution, not passive regeneration.
- Low-HP passives should create tension without making low HP always correct.
- Economy bonuses must be capped or modest because shop healing compounds quickly.
