/** @type {Record<string, { id: string; name: string; mag: number; damage: number; accuracy: number; blurb: string }>} */
export const GUNS = {
  peacemaker: {
    id: "peacemaker",
    name: "Colt Peacemaker",
    mag: 6,
    damage: 10,
    accuracy: 0.62,
    blurb: "Balanced iron — the lawman's choice.",
  },
  mare_leg: {
    id: "mare_leg",
    name: "Mare's Leg",
    mag: 5,
    damage: 14,
    accuracy: 0.55,
    blurb: "Cut-down rifle. Hits like a mule.",
  },
  schofield: {
    id: "schofield",
    name: "Schofield Top-Break",
    mag: 6,
    damage: 9,
    accuracy: 0.68,
    blurb: "Fast reload, steady aim.",
  },
};

export const DEFAULT_GUN_ID = "peacemaker";

export function getGun(id) {
  return GUNS[id] ?? GUNS[DEFAULT_GUN_ID];
}
