'use client';

import { useEffect, useState } from 'react';
import { getBrowseContent, getContentById } from '@/lib/tmdb';
import type { Content } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Film, Tv, History, PlusCircle, Loader2, Search } from 'lucide-react';
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
        setPreviewContent(content);
        setContentType(content.type);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not fetch content details.';
        setPreviewError(message);
        toast({ variant: 'destructive', title: 'Preview Failed', description: message });
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

        const finalContentToAdd = { ...previewContent, type: contentType };
        
        // This is a placeholder for the AI to perform the file write operation.
        console.log("---STUDIO_ACTION---");
        console.log(JSON.stringify({
            action: "WRITE_FILE",
            path: "src/lib/added-content.json",
            content: JSON.stringify([...addedContentData, finalContentToAdd], null, 2),
            message: `Added '${finalContentToAdd.title}' to the content library.`
        }));

        setTimeout(() => {
            toast({ 
                title: 'Content Added', 
                description: `'${finalContentToAdd.title}' has been requested to be added to the library. Refresh the page to see changes.`
            });
            setTmdbId('');
            setPreviewContent(null);
            setIsLoading(false);
        }, 1000);
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
              
              {previewError && !previewContent && (
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
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentlyAdded, setRecentlyAdded] = useState<Content[]>([]);

  useEffect(() => {
    async function fetchStats() {
      setLoadingStats(true);
      try {
        const localContent: Content[] = addedContentData as Content[];
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
        
        // Reverse the array to show latest additions first
        setRecentlyAdded(localContent.slice().reverse());

      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
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
            {recentlyAdded.map(item => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        ) : (
            <p className="text-muted-foreground">No content has been added manually yet.</p>
        )}
      </div>
    </div>
  );
}
