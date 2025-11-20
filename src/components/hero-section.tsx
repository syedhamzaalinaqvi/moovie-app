import Image from 'next/image';
import Link from 'next/link';
import type { Content } from '@/lib/definitions';
import { Button } from './ui/button';
import { PlayCircle, Info } from 'lucide-react';

interface HeroSectionProps {
  content: Content;
}

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <div className="relative h-[60vh] md:h-[80vh] w-full">
      <Image
        src={content.backdropPath}
        alt={content.title}
        fill
        className="object-cover"
        priority
        data-ai-hint="dramatic landscape"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 md:p-8 lg:p-12 w-full md:w-2/3 lg:w-1/2">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground drop-shadow-lg">
          {content.title}
        </h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl line-clamp-3">
          {content.description}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <Button asChild size="lg">
            <Link href={`/watch/${content.id}`}>
              <PlayCircle className="mr-2" />
              Play
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={`/watch/${content.id}`}>
              <Info className="mr-2" />
              More Info
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
