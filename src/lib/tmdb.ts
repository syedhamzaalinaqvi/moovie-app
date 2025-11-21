
import type { Content } from './definitions';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "46d13701165988b5bb5fb4d123c0447e";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

type TmdbContent = {
    id: number;
    title?: string; // Movies have title
    name?: string; // TV shows have name
    overview: string;
    poster_path: string;
    backdrop_path: string;
    genre_ids: number[];
    release_date?: string; // Movies
    first_air_date?: string; // TV
    vote_average: number;
    media_type?: 'movie' | 'tv';
};

type Genre = {
    id: number;
    name: string;
};

let genreMap: Map<number, string> | null = null;

async function fetchGenres() {
    if (genreMap) return genreMap;
    try {
        const movieResponse = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
        const tvResponse = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`);
        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();

        const allGenres: Genre[] = [...movieData.genres, ...tvData.genres];
        
        genreMap = new Map();
        allGenres.forEach(genre => {
            genreMap!.set(genre.id, genre.name);
        });
        return genreMap;
    } catch (error) {
        console.error('Failed to fetch genres:', error);
        return new Map();
    }
}


function tmdbContentToContent(item: TmdbContent, type: 'movie' | 'tv' | 'person', allGenres: Map<number, string>): Content | null {
    if (type === 'person') return null;
    const itemType = item.media_type || type;
    if (itemType === 'person') return null;

    return {
        id: String(item.id),
        title: item.title || item.name || 'No Title',
        description: item.overview,
        posterPath: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://picsum.photos/seed/poster-placeholder/500/750',
        backdropPath: item.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${item.backdrop_path}` : 'https://picsum.photos/seed/backdrop-placeholder/1280/720',
        genres: item.genre_ids ? item.genre_ids.map(id => allGenres.get(id) || 'Unknown').filter(g => g !== 'Unknown') : [],
        releaseDate: item.release_date || item.first_air_date || 'N/A',
        rating: item.vote_average,
        type: itemType,
    };
}

async function fetchAndTransformContent(url: string, type: 'movie' | 'tv' | 'person' = 'movie') {
    const allGenres = await fetchGenres();
    try {
        const response = await fetch(url);
        const data = await response.json();
        const results = (data.results || [data]) as TmdbContent[];
        
        return results
            .map(item => tmdbContentToContent(item, item.media_type || type, allGenres))
            .filter((item): item is Content => item !== null);
    } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
        return [];
    }
}

async function fetchAndTransformSingleContent(url: string, type: 'movie' | 'tv') {
    const allGenres = await fetchGenres();
     try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json() as TmdbContent & { genres: Genre[], videos: { results: { type: string, key: string }[] } };
        
        const trailer = data.videos?.results.find(v => v.type === 'Trailer');

        return {
            id: String(data.id),
            title: data.title || data.name || 'No Title',
            description: data.overview,
            posterPath: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : 'https://picsum.photos/seed/poster-placeholder/500/750',
            backdropPath: data.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${data.backdrop_path}` : 'https://picsum.photos/seed/backdrop-placeholder/1280/720',
            genres: data.genres ? data.genres.map(g => g.name) : [],
            releaseDate: data.release_date || data.first_air_date || 'N/A',
            rating: data.vote_average,
            type: type,
            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined,
        };
    } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
        return null;
    }
}


export async function getFeatured(): Promise<Content | null> {
    const content = await getTrending();
    return content[0] || null;
}

export async function getTrending(): Promise<Content[]> {
  const url = `${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`;
  return (await fetchAndTransformContent(url, 'movie')).slice(0,12);
}

export async function getPopular(): Promise<Content[]> {
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`;
  return (await fetchAndTransformContent(url, 'movie')).slice(0,12);
}

export async function getNewReleases(): Promise<Content[]> {
  const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`;
  return (await fetchAndTransformContent(url, 'movie')).slice(0,12);
}

export async function getContentById(id: string): Promise<Content | null> {
    // First, check manually added content
    const manuallyAdded = await getManuallyAddedContent();
    const manualItem = manuallyAdded.find(c => String(c.id) === id);
    if (manualItem) {
        return manualItem;
    }

    // If not found, fetch from TMDB
    let content = await fetchAndTransformSingleContent(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos`, 'movie');
    
    if (!content) {
        content = await fetchAndTransformSingleContent(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos`, 'tv');
    }
    
    return content;
}

export async function getContentByIds(ids: string[]): Promise<Content[]> {
    const contentPromises = ids.map(id => getContentById(id));
    const results = await Promise.all(contentPromises);
    return results.filter((item): item is Content => item !== null);
}

export async function searchContent(query: string): Promise<Content[]> {
  const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
  return await fetchAndTransformContent(url, 'movie');
}

export async function getBrowseContent({ genre, type, region }: { genre?: string; type?: 'movie' | 'tv'; region?: string }): Promise<Content[]> {
    const resolvedType = type || 'movie';
    let url = new URL(`${TMDB_BASE_URL}/discover/${resolvedType}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    
    if (genre) {
        url.searchParams.append('with_genres', genre);
    }
    if (region) {
        url.searchParams.append('region', region);
    }
    
    url.searchParams.append('sort_by', 'popularity.desc');
    
    return await fetchAndTransformContent(url.toString(), resolvedType);
}

export async function getManuallyAddedContent(): Promise<Content[]> {
  try {
    const isServer = typeof window === 'undefined';
    const baseUrl = isServer
      ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002')
      : '';
      
    const url = `${baseUrl}/api/added-content?v=${new Date().getTime()}`;

    const response = await fetch(url, {
        headers: {
            'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
    });
    if (!response.ok) {
        console.error('Failed to fetch manually added content, status:', response.status, await response.text());
        return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch manually added content:', error);
    return [];
  }
}
