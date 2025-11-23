
import Image from 'next/image';
import Link from 'next/link';
import type { Content } from '@/lib/definitions';
import { Card, CardContent } from './ui/card';
import { PlayCircle, Pencil, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import { ContentFormDialog } from './content-form-dialog';
import { Button } from './ui/button';
import { slugify } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  content: Content;
  view?: 'grid' | 'list';
  showAdminControls?: boolean;
  onEditSuccess?: () => void;
}

export function ContentCard({ content, view = 'grid', showAdminControls = false, onEditSuccess }: ContentCardProps) {
  const watchUrl = `/watch/${content.id}-${slugify(content.title)}`;

  if (view === 'list') {
    return (
      <div className="group relative">
        <Card className="overflow-hidden border-0 bg-transparent flex gap-4 p-0">
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
          <div className="flex-1 py-2 pr-2 overflow-hidden">
             <Link href={watchUrl}>
                <h3 className="font-semibold text-lg truncate group-hover:text-primary">{content.title}</h3>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>{content.releaseDate.split('-')[0]}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{content.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {content.genres?.slice(0, 3).map(genre => (
                    <Badge key={genre} variant="secondary">{genre}</Badge>
                ))}
                {content.isHindiDubbed && (
                  <Badge variant="secondary">Hindi Dubbed</Badge>
                )}
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {content.description}
            </p>
          </div>
        </Card>
        {showAdminControls && (
          <ContentFormDialog contentToEdit={content} onSave={onEditSuccess}>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 z-20 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Content</span>
            </Button>
          </ContentFormDialog>
        )}
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
              {content.isHindiDubbed && (
                <Badge variant="secondary" className="absolute top-2 left-2 z-10">Hindi Dubbed</Badge>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                  <PlayCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {showAdminControls && (
        <ContentFormDialog contentToEdit={content} onSave={onEditSuccess}>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 z-20 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit Content</span>
          </Button>
        </ContentFormDialog>
      )}

      <div className="mt-2 space-y-1">
        <h3 className="font-semibold text-sm truncate">{content.title}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{content.releaseDate.split('-')[0]}</span>
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
