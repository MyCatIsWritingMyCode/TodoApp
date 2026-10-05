// ChoreQuest Subscription & Monetization Configuration
// Config-driven one-time lifetime tiers

export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface PlanTierConfig {
  id: SubscriptionTier;
  name: string;
  badge: string;
  tagline: string;
  priceEur: number;
  priceUsd: number;
  priceFormatted: string;
  upgradePriceFromBasicEur?: number;
  upgradePriceFromBasicUsd?: number;
  isOneTime: boolean;
  maxMembers: number; // Infinity for unlimited
  maxHouseholds: number;
  levelCap: number; // Infinity for uncapped
  unlockedSkinIds: string[];
  features: string[];
  highlight?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, PlanTierConfig> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    badge: 'Starter',
    tagline: 'Ideal for small duos starting a chore routine',
    priceEur: 0,
    priceUsd: 0,
    priceFormatted: 'Free',
    isOneTime: true,
    maxMembers: 2,
    maxHouseholds: 1,
    levelCap: 10,
    unlockedSkinIds: ['vanilla', 'berry', 'dark', 'light'],
    features: [
      '1 Shared Household',
      'Up to 2 Members (Owner + 1 Member)',
      '4 Starter UI Skins (Vanilla, Berry, Dark, Light)',
      'Level cap at Level 10',
      'Core Task & Shared Progress System',
      'Shared Pinboard & Whiteboard Sticky Notes',
    ],
  },
  basic: {
    id: 'basic',
    name: 'Basic Family Pack',
    badge: 'Popular',
    tagline: 'For growing families needing extra slots and themes',
    priceEur: 5.0,
    priceUsd: 5.0,
    priceFormatted: '€5.00 / $5.00 one-time',
    isOneTime: true,
    maxMembers: 5,
    maxHouseholds: 1,
    levelCap: 25,
    unlockedSkinIds: ['vanilla', 'berry', 'dark', 'light', 'cyberpunk', 'forest'],
    features: [
      'Up to 5 Household Members',
      'Level cap raised to Level 25',
      'Unlocks 2 Additional Skins (Cyberpunk, Forest)',
      'Full Calendar Heatmap & History Analytics',
      'Family Rewards & Perk Unlocks',
      'One-time lifetime unlock — no monthly subscriptions',
    ],
    highlight: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium Family Plan',
    badge: 'Unlimited',
    tagline: 'The complete, unrestricted family productivity experience',
    priceEur: 15.0,
    priceUsd: 15.0,
    priceFormatted: '€15.00 / $15.00 one-time',
    upgradePriceFromBasicEur: 10.0,
    upgradePriceFromBasicUsd: 10.0,
    isOneTime: true,
    maxMembers: Infinity,
    maxHouseholds: 3,
    levelCap: Infinity,
    unlockedSkinIds: ['vanilla', 'berry', 'dark', 'light', 'cyberpunk', 'forest', 'golden_royal'],
    features: [
      'Unlimited Household Members',
      'No Level Caps (Continuous Family Progress)',
      'All Current & Future Skins Unlocked (Golden Royal)',
      'Up to 3 Separate Households (Vacation home, grandparents)',
      'Priority Cloud Backup & Export',
      'Golden Family Badge & Themes',
    ],
  },
};

/**
 * Checks if the household can invite an additional member under their current tier.
 */
export function canAddMember(currentMemberCount: number, tier: SubscriptionTier): boolean {
  const plan = SUBSCRIPTION_PLANS[tier];
  return currentMemberCount < plan.maxMembers;
}

/**
 * Gets the maximum allowed members for a given tier.
 */
export function getMaxMembers(tier: SubscriptionTier): number {
  return SUBSCRIPTION_PLANS[tier].maxMembers;
}

/**
 * Gets the level cap for a given tier.
 */
export function getLevelCap(tier: SubscriptionTier): number {
  return SUBSCRIPTION_PLANS[tier].levelCap;
}

/**
 * Checks if a skin is unlocked for a given subscription tier.
 */
export function isSkinUnlockedForTier(skinId: string, tier: SubscriptionTier): boolean {
  const plan = SUBSCRIPTION_PLANS[tier];
  return plan.unlockedSkinIds.includes(skinId.toLowerCase());
}

/**
 * Calculates the upgrade price between two tiers.
 */
export function getUpgradePrice(fromTier: SubscriptionTier, toTier: SubscriptionTier, currency: 'EUR' | 'USD' = 'EUR'): { price: number; formatted: string } {
  if (fromTier === toTier) {
    return { price: 0, formatted: 'Current Plan' };
  }
  
  if (fromTier === 'basic' && toTier === 'premium') {
    const symbol = currency === 'EUR' ? '€' : '$';
    const amount = currency === 'EUR' ? SUBSCRIPTION_PLANS.premium.upgradePriceFromBasicEur ?? 10.0 : SUBSCRIPTION_PLANS.premium.upgradePriceFromBasicUsd ?? 10.0;
    return { price: amount, formatted: `${symbol}${amount.toFixed(2)} upgrade` };
  }

  const targetPlan = SUBSCRIPTION_PLANS[toTier];
  const amount = currency === 'EUR' ? targetPlan.priceEur : targetPlan.priceUsd;
  const symbol = currency === 'EUR' ? '€' : '$';
  return { price: amount, formatted: `${symbol}${amount.toFixed(2)} one-time` };
}
