# Highnoon Dueler

A browser-based PvE Western deckbuilding duel roguelite. Pick a class, fight down the Wanted Board, build a class-specific deck, and survive repeated High Noon shootouts.

## Gameplay Snapshot

- Each duel cycles through a class-based stare-down, 3 prep rounds, then High Noon.
- Each prep round refills Nerve. The base play count ramps within the prep sequence: 1 card in round 1, 2 in round 2, and 3 in round 3.
- Cards such as `Outlaw's Pact`, `Gunslinger's Tempo`, `Badge Flash`, `Packed Shells`, and `focusCycle` effects can grant extra card plays for that prep round.
- Dodge is deterministic bullet cancellation, not a percentage chance. `Dodge 2 bullets` cancels the next 2 incoming bullets in the volley.
- Accuracy still controls hit rolls during High Noon, so bullets can miss unless made automatic by effects.
- Rewards and shop cards are class-only. Feats can repeat; stances and oaths are unique. Each merchant visit allows 1 card/gun purchase plus optional whiskey healing. Starter guns are baseline equipment and are not offered as merchant upgrades.
- Each win has a 20% chance to add a separate class-only gun drop screen after the card reward. Gun drops exclude the class starter/currently equipped gun and can be taken or skipped.
- Gun cards equip for the current duel only. The next duel starts from the class starter gun again until another gun card is played.
- Upgraded Outlaw guns scale from combo triggers. Sheriff guns provide a defensive shotgun floor, while Sheriff cards supply most of the late-run sustain and closing power.
- U.S. Marshal builds around Marks. Marks increase his hit damage and reduce enemy hit damage during High Noon; his premium government handgun upgrades support that mark plan, and the legendary Treasury Gold Schofield adds $5 bounty per successful hit.
- Apache Tracker builds Spirit with bow/rifle tactics. Spirit lasts for the duel, adds capped damage, bullets, sustain, and enemy aim pressure, and his upgrade weapons are bows/rifles that reward Spirit rather than replacing the deck.
- Vaquero starts each duel dual-wielding. His first gun card each duel is free and swaps the off-hand, while his deck manages the dual-wield accuracy penalty with steadying, cover, and first-hit pressure.
- Bounty Hunter spends HP for tempo and life-stealing blood rounds. At low HP he becomes more accurate and lethal, but he must land hits to earn that blood back.

## Run Locally

```bash
docker compose up --build
```

Open [http://localhost:8088](http://localhost:8088) in your browser.
