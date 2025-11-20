'use client';

import { useEffect, useState } from 'react';
import { getBrowseContent, getTrending, getContentById } from '@/lib/tmdb';
import type { Content } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Film, Tv, TrendingUp, PlusCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard } from './content-card';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

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

function AddContentForm() {
    const [tmdbId, setTmdbId] = useState('');
    const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!tmdbId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a TMDB ID.' });
        return;
      }
      setIsLoading(true);
      try {
        const newContent = await getContentById(tmdbId);
        if (!newContent) {
          throw new Error('Content not found.');
        }

        // In a real app, you'd save this to a database.
        // We'll use localStorage as a substitute for this environment.
        const existingContent = JSON.parse(localStorage.getItem('added_content') || '[]');
        const updatedContent = [...existingContent, newContent];
        localStorage.setItem('added_content', JSON.stringify(updatedContent));

        toast({ title: 'Success', description: `${newContent.title} has been added.` });
        setTmdbId('');
        // This is a simple way to trigger a re-render on the page if the dashboard were to show added content.
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not fetch content details.';
        toast({ variant: 'destructive', title: 'Failed to add content', description: message });
      } finally {
        setIsLoading(false);
      }
    };

    return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 h-6 w-6" />
              Add New Content
            </CardTitle>
            <CardDescription>
                Add a new movie or TV show to the catalog using its TMDB ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tmdbId">TMDB ID</Label>
                <Input
                  id="tmdbId"
                  value={tmdbId}
                  onChange={(e) => setTmdbId(e.target.value)}
                  placeholder="e.g., 550 for Fight Club"
                  disabled={isLoading}
                />
              </div>
              <RadioGroup
                defaultValue="movie"
                onValueChange={(value: 'movie' | 'tv') => setContentType(value)}
                className="flex gap-4"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="movie" id="r-movie" />
                  <Label htmlFor="r-movie">Movie</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tv" id="r-tv" />
                  <Label htmlFor="r-tv">TV Show</Label>
                </div>
              </RadioGroup>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Content
              </Button>
            </form>
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
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Movies" value={movieCount} icon={Film} isLoading={loadingStats} />
        <StatCard title="Total TV Shows" value={tvShowCount} icon={Tv} isLoading={loadingStats} />
        <AddContentForm />
      </div>

      <Separator />

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
