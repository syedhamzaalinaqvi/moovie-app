import Image from 'next/image';
import Link from 'next/link';
import type { Content } from '@/lib/definitions';
import { Card, CardContent } from './ui/card';
import { PlayCircle, Pencil } from 'lucide-react';
import { Badge } from './ui/badge';
import { ContentFormDialog } from './content-form-dialog';
import { Button } from './ui/button';
import { slugify } from '@/lib/utils';

interface ContentCardProps {
  content: Content;
  showAdminControls?: boolean;
  onEditSuccess?: () => void;
}

export function ContentCard({ content, showAdminControls = false, onEditSuccess }: ContentCardProps) {
  const watchUrl = `/watch/${content.id}-${slugify(content.title)}`;

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

      <div className="mt-2">
        <h3 className="font-semibold text-sm truncate">{content.title}</h3>
        <p className="text-xs text-muted-foreground">{content.releaseDate.split('-')[0]}</p>
      </div>
    </div>
  );
}
