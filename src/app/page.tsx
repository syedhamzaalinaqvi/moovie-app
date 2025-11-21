'use client';

import { getBrowseContent } from "@/lib/tmdb";
import { ContentCard } from "@/components/content-card";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

// By adding a version query parameter that changes, we can force a re-render
// and ensure the latest added-content.json is loaded.
export const dynamic = 'force-dynamic';

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const type = searchParams.get('type') as 'movie' | 'tv' | null;
  const genre = searchParams.get('genre');
  const region = searchParams.get('region');

  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const apiContent = await getBrowseContent({ 
          type: type || undefined, 
          genre: genre || undefined, 
          region: region || undefined 
        });
        
        // Dynamically fetch manually added content to avoid HMR issues
        const response = await fetch(`/api/added-content?v=${new Date().getTime()}`);
        const localContent: Content[] = await response.json();
        
        const combinedContentMap = new Map<string, Content>();

        // Filter local content based on current filters.
        // This is a simple implementation. For genres, it checks if the genre name is in the list.
        // For a more robust solution, you'd map genre names to IDs.
        const relevantLocalContent = localContent.filter(item => {
            if (type && item.type !== type) return false;
            // Note: Region filtering for local content is not implemented as it's not in the data.
            if (region && !genre) return true; // Show all local if filtering only by region
            
            // If filtering by genre, we need to match it.
            // TMDB uses genre IDs, but our local data has names. This is a limitation.
            // We won't filter local content by genre for now.
            if (genre) return false; // Hide local content when filtering by genre to avoid mismatches

            return true;
        });

        // 1. Add local content first to give it priority, only if not filtering by genre.
        if (!genre) {
            relevantLocalContent.forEach(item => {
                combinedContentMap.set(String(item.id), item);
            });
        }
        
        // 2. Add API content, but do not overwrite any local content that has the same ID.
        apiContent.forEach(item => {
          if (!combinedContentMap.has(String(item.id))) {
            combinedContentMap.set(String(item.id), item);
          }
        });
        
        const finalContent = Array.from(combinedContentMap.values());
        setContent(finalContent);

      } catch (error) {
        console.error("Failed to fetch content", error);
        setContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [q, type, genre, region]);

  const filteredContent = q
    ? content.filter(item => item.title.toLowerCase().includes(q.toLowerCase()))
    : content;

  // You could fetch genre/country names from TMDB API to display them
  const getTitle = () => {
    if (q) return `Search results for "${q}"`;
    if (genre) return `Genre`;
    if (region) return `Content from ${region}`;
    if (type === 'movie') return 'Movies';
    if (type === 'tv') return 'TV Shows';
    return 'Browse All';
  }

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">{getTitle()}</h1>
        {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                {[...Array(14)].map((_, i) => (
                    <div key={i}>
                        <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </div>
                ))}
            </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {filteredContent.map((item) => (
              <ContentCard key={`${item.id}-${item.title}`} content={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-64">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No Results Found</h2>
            <p className="text-muted-foreground mt-2">
              We couldn't find any content matching your filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
