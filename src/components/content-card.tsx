import Image from 'next/image';
import Link from 'next/link';
import type { Content } from '@/lib/definitions';
import { Card, CardContent } from './ui/card';
import { PlayCircle } from 'lucide-react';

interface ContentCardProps {
  content: Content;
}

export function ContentCard({ content }: ContentCardProps) {
  return (
    <Link href={`/watch/${content.id}`} className="block group">
      <Card className="overflow-hidden border-0 bg-card/50 hover:bg-card transition-all duration-300">
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingBottom: '150%' /* 2:3 aspect ratio */ }}>
            <Image
              src={content.posterPath}
              alt={content.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
              data-ai-hint="movie poster"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-2">
        <h3 className="font-semibold text-sm truncate">{content.title}</h3>
        <p className="text-xs text-muted-foreground">{content.releaseDate.split('-')[0]}</p>
      </div>
    </Link>
  );
}
