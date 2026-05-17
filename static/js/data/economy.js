export const WHISKEY_HEAL_AMOUNT = 14;
export const WHISKEY_PRICE_FLOOR = 45;

export function whiskeyPriceFromBounty(bountyEarned) {
  const bounty = Number.isFinite(bountyEarned) ? Math.max(0, bountyEarned) : 0;
  return Math.max(WHISKEY_PRICE_FLOOR, Math.round(bounty));
}

export function whiskeyOfferForGame(game) {
  const recentBounty = game?.lastBountyEarned ?? game?.lastBounty ?? WHISKEY_PRICE_FLOOR;
  return {
    price: whiskeyPriceFromBounty(recentBounty),
    heal: WHISKEY_HEAL_AMOUNT,
  };
}
