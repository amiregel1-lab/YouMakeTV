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
