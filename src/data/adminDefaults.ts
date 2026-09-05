import { PlatformSettings } from '../types';

// Real platform configuration — the values the admin console starts from and the
// owner edits in Settings. These are actual business rules, not sample data.
export const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'YouMakeTV.ai',
  supportEmail: 'info@youmaketv.ai',
  legalEmail: 'info@youmaketv.ai',
  defaultCreatorShare: 30,
  premiumCreatorShare: 40,
  platformFeePercent: 3,
  // $4.99 is what SubscriptionPage.tsx actually charges — the console used to
  // default to 9.99 and disagree with the page the viewer sees.
  membershipMonthlyPrice: 4.99,
  membershipAnnualPrice: 89.99,
  membershipDiscountPercent: 20,
  freeMovieDailyLimit: 3,
  approvalRequired: true,
  creatorOnboardingEnabled: true,
  newUploadsEnabled: true,
  freeMoviesEnabled: true,
};
