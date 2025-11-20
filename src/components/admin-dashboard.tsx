'use client';

import { useEffect, useState } from 'react';
import { getBrowseContent, getTrending } from '@/lib/tmdb';
import type { Content } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Tv, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard } from './content-card';
import { Separator } from './ui/separator';

function StatCard({ title, value, icon: Icon, isLoading }: { title: string; value: number; icon: React.ElementType; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [movieCount, setMovieCount] = useState(0);
  const [tvShowCount, setTvShowCount] = useState(0);
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const movies = await getBrowseContent({ type: 'movie' });
        const tvShows = await getBrowseContent({ type: 'tv' });
        setMovieCount(movies.length);
        setTvShowCount(tvShows.length);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    async function fetchTrending() {
      setLoadingTrending(true);
      try {
        const trending = await getTrending();
        setTrendingContent(trending);
      } catch (error) {
        console.error("Failed to fetch trending content:", error);
      } finally {
        setLoadingTrending(false);
      }
    }

    fetchStats();
    fetchTrending();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard title="Total Movies" value={movieCount} icon={Film} isLoading={loadingStats} />
        <StatCard title="Total TV Shows" value={tvShowCount} icon={Tv} isLoading={loadingStats} />
      </div>

      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2 h-6 w-6" />
          Recommended / Trending
        </h2>
        {loadingTrending ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingContent.map(item => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
