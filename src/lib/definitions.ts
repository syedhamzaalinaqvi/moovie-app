import type { User as FirebaseUser } from 'firebase/auth';

export type DownloadLink = {
  label: string;
  url: string;
};

export type Content = {
  id: string;
  title: string;
  description: string;
  posterPath: string;
  backdropPath: string;
  genres: string[];
  releaseDate: string;
  rating: number;
  type: 'movie' | 'tv';
  trailerUrl?: string;
  youtubeTrailerUrl?: string;
  downloadLink?: string; // Deprecated, but kept for backward compatibility
  downloadLinks?: DownloadLink[];
  isHindiDubbed?: boolean;
  customTags?: string[];
  cast?: CastMember[];
  runtime?: number; // Minutes
  numberOfSeasons?: number;
  languages?: string[];
  quality?: string[];
  quality?: string[];
  createdAt?: string;
  updatedAt?: string;
  lastAirDate?: string;
  uploadedBy?: string; // ID of the user who uploaded this content
};

export type SystemUser = {
  username: string;
  password?: string; // Optional when fetching for display
  role: 'admin' | 'partner';
  partnerId?: string; // Optional, for identifying the partner entity
  createdAt: string;
  id?: string; // Firestore Doc ID
};

export type PartnerRequest = {
  id?: string;
  fullname: string;
  email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type AppUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  likedContent?: string[];
  dislikedContent?: string[];
  viewingHistory?: string[];
};

export interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

export type Comment = {
  id: string;
  author: string;
  authorId: string;
  avatarUrl: string;
  text: string;
  timestamp: number;
  replies: Comment[];
}

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string;
}
