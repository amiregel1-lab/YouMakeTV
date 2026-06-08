export type ViewerAccount = {
  username: string;
  premium: boolean;
};

export type CreatorFilmStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected';

export interface Movie {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  genre: string;
  genres?: string[];
  duration: string;
  creator: string;
  price: number;
  thumbnail: string;
  badge: string;
  tools: string[];
  rating: string;
  language: string;
  // extended catalog fields
  tags?: string[];
  releaseYear?: number;
  views?: number;
  trailerViews?: number;
  featured?: boolean;
  subscriberDiscountEligible?: boolean;
  trailerUrl?: string;
  posterPrompt?: string;
}

export interface CreatorFilm {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  genre: string;
  duration: string;
  creator: string;
  category: string;
  price: number;
  thumbnail: string;
  status: CreatorFilmStatus;
  views: number;
  trailerViews: number;
  paidWatches: number;
  freeWatches: number;
  rating: string;
  language: string;
  tools: string[];
  uploadDate: string;
  updatedDate: string;
}

export interface CreatorProfile {
  fullName: string;
  studioName: string;
  email: string;
  verified: boolean;
  kycCompleted: boolean;
  films: CreatorFilm[];
  createdAt: string;
}

// ── Super Admin Types ──────────────────────────────────────────────────────
// PROTOTYPE NOTE: In production, all admin authentication must be handled
// server-side with secure session tokens. Never store credentials or
// role information in localStorage for real deployments.
// Real RBAC (Role-Based Access Control) is required before launch.

export interface AdminSession {
  isAdmin: true;
  loginAt: string;
}

export type AdminCreatorStatus = 'Active' | 'Suspended' | 'Pending';
export type AdminFilmStatus = 'Approved' | 'Pending Review' | 'Rejected' | 'Suspended' | 'Draft';

export interface AdminCreator {
  id: string;
  fullName: string;
  studioName: string;
  email: string;
  country: string;
  verified: boolean;
  kycCompleted: boolean;
  status: AdminCreatorStatus;
  revenueShare: number;
  totalMovies: number;
  totalRevenue: number;
  totalViews: number;
  joinedAt: string;
  notes: string;
}

export interface AdminFilm {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  genre: string;
  tags: string;
  duration: string;
  releaseYear: number;
  price: number;
  thumbnail: string;
  rating: string;
  creatorId: string;
  creatorName: string;
  studioName: string;
  status: AdminFilmStatus;
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  visible: boolean;
  views: number;
  purchases: number;
  revenue: number;
  uploadDate: string;
  moderationNotes: string;
  trailerUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  targetType: 'movie' | 'creator' | 'payout' | 'settings' | 'auth';
  performedBy: string;
  details: string;
}

export interface PayoutRecord {
  id: string;
  creatorId: string;
  studioName: string;
  creatorName: string;
  earnings: number;
  pending: number;
  lastPayoutDate: string;
  lastPayoutAmount: number;
  totalPaid: number;
  status: 'Ready' | 'On Hold' | 'Processing';
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  legalEmail: string;
  defaultCreatorShare: number;
  premiumCreatorShare: number;
  platformFeePercent: number;
  membershipMonthlyPrice: number;
  membershipAnnualPrice: number;
  membershipDiscountPercent: number;
  freeMovieDailyLimit: number;
  approvalRequired: boolean;
  creatorOnboardingEnabled: boolean;
  newUploadsEnabled: boolean;
  freeMoviesEnabled: boolean;
}

export interface MonthlyMetric {
  month: string;
  revenue: number;
  creators: number;
  movies: number;
  purchases: number;
  subscribers: number;
}
