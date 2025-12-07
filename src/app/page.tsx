'use client';

import { getManuallyAddedContent, getTrending } from "@/lib/tmdb";
import { ContentCard } from "@/components/content-card";
import { LayoutGrid, List, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { HeroCarousel } from "@/components/hero-carousel";
import RecommendedContent from "@/components/recommended-content";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// By adding a version query parameter that changes, we can force a re-render
// and ensure the latest added-content.json is loaded.
export const dynamic = 'force-dynamic';

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const type = searchParams.get('type') as 'movie' | 'tv' | null;
  const genre = searchParams.get('genre');
  const region = searchParams.get('region');
  const year = searchParams.get('year');
  const hindiDubbed = searchParams.get('hindi_dubbed');

  const [content, setContent] = useState<Content[]>([]);
  const [heroContent, setHeroContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const isFilteredView = q || type || genre || region || year || hindiDubbed;

  useEffect(() => {
    const fetchHeroContent = async () => {
      if (isFilteredView) {
        setIsHeroLoading(false);
        return;
      };
      setIsHeroLoading(true);
      try {
        const trending = await getTrending();
        setHeroContent(trending.slice(0, 5)); // Take top 5 for hero
      } catch (error) {
        console.error("Failed to fetch hero content", error);
      } finally {
        setIsHeroLoading(false);
      }
    };
    fetchHeroContent();
  }, [isFilteredView]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        // Only fetch manually added content from Firestore
        const localContent = await getManuallyAddedContent();

        // Filter local content based on current filters
        const filteredLocalContent = localContent.filter(item => {
          if (type && item.type !== type) return false;
          // TMDB genre IDs are strings now, so we adapt
          if (genre && !item.genres?.some(g => {
            // This is a crude but necessary check if local genres are names and filter is ID
            // A better system would use genre IDs everywhere
            return String(g) === genre || g.toLowerCase() === genre.toLowerCase()
          })) return false;

          if (year && item.releaseDate?.startsWith(year) === false) return false;
          if (hindiDubbed === 'true' && !item.isHindiDubbed) return false;

          // Region filter is tricky for local content if we don't store region, ignoring for now or extending content type
          // if (region && ...) 

          return true;
        });

        setContent(filteredLocalContent);

      } catch (error) {
        console.error("Failed to fetch content", error);
        setContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [q, type, genre, region, year, hindiDubbed]);

  const filteredContent = q
    ? content.filter(item => item.title.toLowerCase().includes(q.toLowerCase()))
    : content;

  // You could fetch genre/country names from TMDB API to display them
  const getTitle = () => {
    if (q) return `Search results for "${q}"`;
    if (genre) {
      return `Genre`;
    }
    if (region) return `Content from ${region}`;
    if (type === 'movie') return 'Movies';
    if (type === 'tv') return 'TV Shows';
    return 'Browse All';
  }

  const GridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
      {[...Array(14)].map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
      ))}
    </div>
  );

  const ListSkeleton = () => (
    <div className="flex flex-col gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="w-24 h-36 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {!isFilteredView && (
        isHeroLoading ? (
          <Skeleton className="h-[60vh] md:h-[80vh] w-full" />
        ) : (
          <HeroCarousel content={heroContent} />
        )
      )}
      <div className="p-4 md:p-6 space-y-8">
        {!isFilteredView && <RecommendedContent />}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{getTitle()}</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setView('grid')} className={cn(view === 'grid' && 'bg-accent text-accent-foreground')}>
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setView('list')} className={cn(view === 'list' && 'bg-accent text-accent-foreground')}>
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {isLoading ? (
            view === 'grid' ? <GridSkeleton /> : <ListSkeleton />
          ) : filteredContent.length > 0 ? (
            <div className={cn({
              "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6": view === 'grid',
              "flex flex-col gap-4": view === 'list'
            })}>
              {filteredContent.map((item) => (
                <ContentCard key={`${item.id}-${item.title}`} content={item} view={view} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-64">
              <Search className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold">No Results Found</h2>
              <p className="text-muted-foreground mt-2">
                We couldn't find any content matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
