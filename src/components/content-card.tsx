

import Image from 'next/image';
import Link from 'next/link';
import type { Content } from '@/lib/definitions';
import { Card, CardContent } from './ui/card';
import { PlayCircle, Pencil, Star, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { ContentFormDialog } from './content-form-dialog';
import { Button } from './ui/button';
import { slugify } from '@/lib/utils';
import { cn } from '@/lib/utils';
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

interface ContentCardProps {
  content: Content;
  view?: 'grid' | 'list';
  showAdminControls?: boolean;
  onEditSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function ContentCard({ content, view = 'grid', showAdminControls = false, onEditSuccess, onDeleteSuccess }: ContentCardProps) {
  const watchUrl = `/watch/${content.id}-${slugify(content.title)}`;

  const adminControls = showAdminControls && (
    <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <ContentFormDialog contentToEdit={content} onSave={onEditSuccess}>
        <Button variant="secondary" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit Content</span>
        </Button>
      </ContentFormDialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete Content</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{content.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteSuccess}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (view === 'list') {
    return (
      <div className="group relative">
        <Card className="overflow-hidden border-0 bg-transparent flex gap-4 p-0 min-w-0">
          <Link href={watchUrl} className="block flex-shrink-0">
            <div className="relative w-24 aspect-[2/3]">
              <Image
                src={content.posterPath}
                alt={content.title}
                fill
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                sizes="10vw"
                data-ai-hint="movie poster"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                <PlayCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Link>
          <div className="flex-1 py-2 pr-2 min-w-0">
            <Link href={watchUrl}>
              <h3 className="font-semibold text-lg truncate group-hover:text-primary">{content.title}</h3>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>{content.releaseDate.split('-')[0]}</span>
              {content.runtime && content.type === 'movie' && (
                <span>{Math.floor(content.runtime / 60)}h {content.runtime % 60}m</span>
              )}
              {content.numberOfSeasons && content.type === 'tv' && (
                <span>{content.numberOfSeasons} {content.numberOfSeasons === 1 ? 'Season' : 'Seasons'}</span>
              )}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{content.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {content.genres?.slice(0, 3).map(genre => (
                <Badge key={genre} variant="secondary">{genre}</Badge>
              ))}
              {content.isHindiDubbed && !content.languages?.includes('Hindi Dubbed') && (
                <Badge variant="secondary">Hindi Dubbed</Badge>
              )}
              {content.languages?.map(lang => (
                <Badge key={lang} variant="secondary">{lang}</Badge>
              ))}
              {content.quality?.map(q => (
                <Badge key={q} variant="outline">{q}</Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {content.description}
            </p>
          </div>
        </Card>
        {adminControls}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group relative">
      <Link href={watchUrl} className="block">
        <Card className="overflow-hidden border-0 bg-transparent">
          <CardContent className="p-0">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src={content.posterPath}
                alt={content.title}
                fill
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16vw, 12.5vw"
                data-ai-hint="movie poster"
              />
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                {content.quality?.map(q => (
                  <Badge key={q} variant="secondary" className="text-[10px] px-1 h-5">{q}</Badge>
                ))}
                {content.languages?.map(lang => (
                  <Badge key={lang} variant="default" className="text-[10px] px-1 h-5">{lang}</Badge>
                ))}
                {!content.languages?.length && content.isHindiDubbed && (
                  <Badge variant="secondary" className="text-[10px] px-1 h-5">Hindi Dubbed</Badge>
                )}
              </div>
              <div className="absolute bottom-2 right-2 z-10">
                {content.type === 'tv' && content.numberOfSeasons && (
                  <Badge variant="secondary" className="text-[10px] px-1 h-5 bg-black/60 hover:bg-black/70 text-white border-0 backdrop-blur-sm">
                    {content.numberOfSeasons} {content.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
                  </Badge>
                )}
                {content.type === 'movie' && content.runtime && (
                  <Badge variant="secondary" className="text-[10px] px-1 h-5 bg-black/60 hover:bg-black/70 text-white border-0 backdrop-blur-sm">
                    {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                  </Badge>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                <PlayCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {adminControls}

      <div className="mt-2 space-y-1">
        <h3 className="font-semibold text-sm truncate">{content.title}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{content.releaseDate.split('-')[0]}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span>{content.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate">{content.genres?.[0] || 'N/A'}</p>
      </div>
    </div>
  );
}
