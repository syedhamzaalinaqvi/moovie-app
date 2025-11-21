import type { User as FirebaseUser } from 'firebase/auth';

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string;
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
  downloadLink?: string;
  isHindiDubbed?: boolean;
  customTags?: string[];
  cast?: CastMember[];
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
