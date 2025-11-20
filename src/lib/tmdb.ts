import { mockContent } from './data';
import type { Content } from './definitions';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getFeatured(): Promise<Content | null> {
  await delay(100);
  return mockContent[0] || null;
}

export async function getTrending(): Promise<Content[]> {
  await delay(200);
  return [...mockContent].sort((a, b) => b.rating - a.rating).slice(0, 6);
}

export async function getPopular(): Promise<Content[]> {
  await delay(300);
  return [...mockContent].sort((a, b) => a.releaseDate > b.releaseDate ? -1 : 1).slice(2, 8);
}

export async function getNewReleases(): Promise<Content[]> {
  await delay(400);
  const sorted = [...mockContent].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
  return sorted.slice(0, 6);
}

export async function getContentById(id: string): Promise<Content | null> {
  await delay(150);
  const content = mockContent.find(item => item.id === id);
  return content || null;
}

export async function getContentByIds(ids: string[]): Promise<Content[]> {
  await delay(250);
  return mockContent.filter(item => ids.includes(item.id));
}

export async function searchContent(query: string): Promise<Content[]> {
  await delay(300);
  if (!query) return [];
  return mockContent.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getBrowseContent({ genre, type }: { genre?: string; type?: 'movie' | 'tv' }): Promise<Content[]> {
  await delay(350);
  let results = [...mockContent];
  if (type) {
    results = results.filter(item => item.type === type);
  }
  if (genre) {
    results = results.filter(item => item.genres.includes(genre));
  }
  return results;
}
