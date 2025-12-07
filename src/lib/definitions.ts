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
  createdAt?: string;
  updatedAt?: string;
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
