
'use client';

import { useEffect, useState } from 'react';
import { getBrowseContent, getTrending, getContentById } from '@/lib/tmdb';
import type { Content } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Film, Tv, TrendingUp, PlusCircle, Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard } from './content-card';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import addedContentData from '@/lib/added-content.json';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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
    const [previewContent, setPreviewContent] = useState<Content | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const { toast } = useToast();

    const handlePreview = async () => {
      if (!tmdbId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a TMDB ID.' });
        return;
      }
      setIsLoading(true);
      setPreviewContent(null);
      setPreviewError(null);
      try {
        const content = await getContentById(tmdbId);
        if (!content) {
          throw new Error('Content not found with the provided ID.');
        }
        // This is a bit of a hack, since getContentById can return movie or TV, but the form has a selector.
        // We'll trust the user's selection for the final add, but the preview will show what was found.
        setPreviewContent(content);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not fetch content details.';
        setPreviewError(message);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleAddContent = async () => {
        if (!previewContent) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please preview content before adding.' });
            return;
        }
        setIsLoading(true);
        try {
            const finalContentToAdd = { ...previewContent, type: contentType };
            
            // This is a placeholder for a proper API call.
            // We are creating a downloadable blob which is not ideal, but demonstrates the concept
            // of saving to a file without a real backend.
            const existingContent: Content[] = addedContentData;
            const updatedContent = [...existingContent, finalContentToAdd];
            
            const blob = new Blob([JSON.stringify(updatedContent, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'added-content.json';
            a.click();
            URL.revokeObjectURL(url);
            
            toast({ 
                title: 'File Ready for Download', 
                description: "A new 'added-content.json' file has been generated. Please move it to your 'src/lib' folder to update the content."
            });

            setTmdbId('');
            setPreviewContent(null);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An error occurred.';
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
                Add a new movie or TV show using its TMDB ID.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tmdbId">TMDB ID</Label>
                <div className="flex gap-2">
                    <Input
                      id="tmdbId"
                      value={tmdbId}
                      onChange={(e) => setTmdbId(e.target.value)}
                      placeholder="e.g., 550 for Fight Club"
                      disabled={isLoading}
                    />
                    <Button onClick={handlePreview} disabled={isLoading || !tmdbId} variant="outline">
                        {isLoading && tmdbId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4"/>}
                        Preview
                    </Button>
                </div>
              </div>
              
              {previewError && (
                  <Alert variant="destructive">
                      <AlertTitle>Preview Failed</AlertTitle>
                      <AlertDescription>{previewError}</AlertDescription>
                  </Alert>
              )}

              {previewContent && (
                  <div className='space-y-4'>
                    <Separator/>
                    <h3 className="text-lg font-medium">Content Preview</h3>
                    <div className="mx-auto w-1/2">
                        <ContentCard content={previewContent} />
                    </div>
                     <RadioGroup
                        value={contentType}
                        onValueChange={(value: 'movie' | 'tv') => setContentType(value)}
                        className="flex gap-4 pt-4"
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
                  </div>
              )}
          </CardContent>
          {previewContent && (
            <CardFooter>
                 <Button onClick={handleAddContent} disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Content to Library
                </Button>
            </CardFooter>
          )}
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
        const addedMovies = addedContentData.filter(c => c.type === 'movie');
        const addedTvShows = addedContentData.filter(c => c.type === 'tv');

        const allMovies = [...movies, ...addedMovies];
        const allTvShows = [...tvShows, ...addedTvShows];

        const uniqueMovieIds = new Set(allMovies.map(m => m.id));
        const uniqueTvShowIds = new Set(allTvShows.map(t => t.id));

        setMovieCount(uniqueMovieIds.size);
        setTvShowCount(uniqueTvShowIds.size);
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
