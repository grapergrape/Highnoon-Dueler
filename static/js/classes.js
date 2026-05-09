/** @type {Record<string, { id: string; name: string; tagline: string; description: string; maxHp: number; gunId: string; starterDeckIds: string[]; permanent: Record<string,number> }>} */
export const CLASSES = {
  outlaw: {
    id: "outlaw",
    name: "Outlaw",
    tagline: "Wanted dead or alive.",
    description: "High risk, high reward. Grows deadlier with every scalp.",
    maxHp: 90,
    gunId: "peacemaker",
    starterDeckIds: [
      "gun_volcanic_six",
      "gun_volcanic_six",
      "atk_fan_hammer",
      "atk_devils_due",
      "atk_rust_bullet",
      "atk_showboat",
      "atk_rattlesnake",
      "feat_outlaws_fury",
      "char_desperado",
      "atk_trick_shot",
      "atk_sand_chamber",
      "atk_dust_throw",
    ],
    permanent: {
      focusPerRound: 1,
      bountyMult: 1.0,
      bountyGrowthPerWin: 0.25,
    },
  },
};

export function getClass(id) {
  return CLASSES[id] ?? null;
}

export function getClassList() {
  return Object.values(CLASSES);
}
