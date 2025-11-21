'use client';

import { useEffect, useState } from 'react';
import { getBrowseContent, getContentById, getManuallyAddedContent } from '@/lib/tmdb';
import type { Content } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Film, Tv, History, PlusCircle, Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard } from './content-card';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ContentFormDialog } from './content-form-dialog';


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
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentlyAdded, setRecentlyAdded] = useState<Content[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
      setLoadingStats(true);
      try {
        const localContent = await getManuallyAddedContent();

        const apiMovies = await getBrowseContent({ type: 'movie' });
        const apiTvShows = await getBrowseContent({ type: 'tv' });

        const movieMap = new Map<string, Content>();
        localContent.filter(c => c.type === 'movie').forEach(c => movieMap.set(String(c.id), c));
        apiMovies.forEach(c => {
          if (!movieMap.has(String(c.id))) movieMap.set(String(c.id), c);
        });

        const tvMap = new Map<string, Content>();
        localContent.filter(c => c.type === 'tv').forEach(c => tvMap.set(String(c.id), c));
        apiTvShows.forEach(c => {
          if (!tvMap.has(String(c.id))) tvMap.set(String(c.id), c);
        });

        setMovieCount(movieMap.size);
        setTvShowCount(tvMap.size);
        
        setRecentlyAdded(localContent);

      } catch (error) {
        console.error("Failed to fetch stats:", error);
        toast({ variant: 'destructive', title: "Error", description: "Failed to load dashboard data."});
      } finally {
        setLoadingStats(false);
      }
    };


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onContentUpdated = () => {
    fetchDashboardData();
    router.push(`/?v=${new Date().getTime()}`);
    router.refresh();
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Movies" value={movieCount} icon={Film} isLoading={loadingStats} />
        <StatCard title="Total TV Shows" value={tvShowCount} icon={Tv} isLoading={loadingStats} />
        <Card>
           <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 h-6 w-6" />
              Add New Content
            </CardTitle>
            <CardDescription>
                Add new content using its TMDB ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentFormDialog onSave={onContentUpdated}>
              <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Content
              </Button>
            </ContentFormDialog>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <History className="mr-2 h-6 w-6" />
          Recently Added Content
        </h2>
        {loadingStats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-3 w-1/2 mt-1" />
              </div>
            ))}
          </div>
        ) : recentlyAdded.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentlyAdded.map((item, i) => (
              <ContentCard key={`${item.id}-${i}`} content={item} showAdminControls onEditSuccess={onContentUpdated} />
            ))}
          </div>
        ) : (
            <p className="text-muted-foreground">No content has been added manually yet.</p>
        )}
      </div>
    </div>
  );
}
