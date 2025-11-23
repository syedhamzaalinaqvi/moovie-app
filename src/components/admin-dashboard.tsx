
'use client';

import { useEffect, useState } from 'react';
import { getBrowseContent, getManuallyAddedContent } from '@/lib/tmdb';
import type { Content } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Film, Tv, History, PlusCircle, Loader2, Search, Settings, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard } from './content-card';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ContentFormDialog } from './content-form-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getLogoText, updateLogoText } from '@/app/admin/actions';
import { deleteContent } from '@/ai/flows/delete-content';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from './ui/checkbox';


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
  const [logoText, setLogoText] = useState('');
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
      setLoadingStats(true);
      try {
        const [localContent, currentLogoText] = await Promise.all([
          getManuallyAddedContent(),
          getLogoText()
        ]);
        
        setLogoText(currentLogoText);

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
    // Force a hard reload of the window to reflect changes everywhere
    window.location.reload();
  }

  const handleLogoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLogo(true);
    try {
      const result = await updateLogoText(logoText);
      if (result.success) {
        toast({ title: 'Success', description: 'Logo text updated. Refreshing...' });
        // We reload the page to make sure the new logo is fetched by the layouts.
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
       toast({ variant: 'destructive', title: "Error", description: error instanceof Error ? error.message : "Failed to save logo text."});
    } finally {
      setIsSavingLogo(false);
    }
  }

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedIds(prev => isSelected ? [...prev, id] : prev.filter(selectedId => selectedId !== id));
  }

  const handleDelete = async (ids: string[]) => {
    setIsDeleting(true);
    try {
      const result = await deleteContent(ids);
      if (result.success) {
        toast({ title: "Success", description: `${ids.length} item(s) deleted. Refreshing...` });
        setSelectedIds([]);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error("Failed to delete content.");
      }
    } catch (error) {
       toast({ variant: 'destructive', title: "Error", description: error instanceof Error ? error.message : "Could not delete content."});
    } finally {
      setIsDeleting(false);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === recentlyAdded.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recentlyAdded.map(item => String(item.id)));
    }
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-6 w-6" />
            Site Settings
          </CardTitle>
          <CardDescription>
            Change global settings for the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogoSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoText">Logo Text</Label>
              <Input
                id="logoText"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                disabled={isSavingLogo}
              />
            </div>
            <Button type="submit" disabled={isSavingLogo}>
              {isSavingLogo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>


      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <History className="mr-2 h-6 w-6" />
              Recently Added Content
            </h2>
            {selectedIds.length > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Delete ({selectedIds.length})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {selectedIds.length} item(s).
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(selectedIds)}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>

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
          <>
            <div className="flex items-center mb-4 space-x-2">
              <Checkbox
                id="selectAll"
                checked={selectedIds.length > 0 && selectedIds.length === recentlyAdded.length}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
              <Label htmlFor="selectAll" className='text-sm font-medium'>
                {selectedIds.length > 0 ? `${selectedIds.length} of ${recentlyAdded.length} selected` : 'Select all'}
              </Label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recentlyAdded.map((item, i) => (
                <div key={`${item.id}-${i}`} className="relative group">
                   <div className="absolute top-2 left-2 z-30">
                     <Checkbox
                       id={`select-${item.id}`}
                       checked={selectedIds.includes(String(item.id))}
                       onCheckedChange={(checked) => handleSelectionChange(String(item.id), !!checked)}
                       className="bg-background/70 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary-foreground"
                     />
                   </div>
                  <ContentCard
                    content={item}
                    showAdminControls
                    onEditSuccess={onContentUpdated}
                    onDeleteSuccess={() => handleDelete([String(item.id)])}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
            <p className="text-muted-foreground">No content has been added manually yet.</p>
        )}
      </div>
    </div>
  );
}
