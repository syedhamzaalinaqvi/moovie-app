'use client';

import { getBrowseContent } from "@/lib/tmdb";
import { ContentCard } from "@/components/content-card";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import addedContentData from '@/lib/added-content.json';

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const type = searchParams.get('type') as 'movie' | 'tv' | null;

  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const fetchedContent = await getBrowseContent({ type: type || undefined });
        
        // Correctly type the imported JSON data which is an array of Content
        const addedContent: Content[] = addedContentData;
        
        // Filter manually added content based on the selected type ('movie' or 'tv')
        const filteredAddedContent = type ? addedContent.filter(item => item.type === type) : addedContent;

        // Create a Map of all content, with manually added content taking precedence.
        // The key is the content ID as a string to ensure uniqueness.
        const combinedContentMap = new Map<string, Content>();
        
        // First, add the fetched content from the API
        fetchedContent.forEach(item => {
            combinedContentMap.set(String(item.id), item);
        });
        
        // Then, add (and overwrite) with the manually added content
        // This ensures your added content is prioritized if an ID conflict exists.
        filteredAddedContent.forEach(item => {
            combinedContentMap.set(String(item.id), item);
        });

        // Convert the map back to an array. Your added content will be present.
        const uniqueContent = Array.from(combinedContentMap.values());
        
        setContent(uniqueContent);

      } catch (error) {
        console.error("Failed to fetch content", error);
        setContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();

  }, [type]);

  const filteredContent = q
    ? content.filter(item => item.title.toLowerCase().includes(q.toLowerCase()))
    : content;

  const title = q
    ? `Search results for "${q}"`
    : type === 'movie'
    ? 'Movies'
    : type === 'tv'
    ? 'TV Shows'
    : 'Browse All';

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
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
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-64">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No Results Found</h2>
            <p className="text-muted-foreground mt-2">
              We couldn't find any content matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
