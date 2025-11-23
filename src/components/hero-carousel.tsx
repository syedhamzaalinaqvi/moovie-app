'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Content } from '@/lib/definitions';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from './ui/button';
import { PlayCircle } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

interface HeroCarouselProps {
  content: Content[];
}

export function HeroCarousel({ content }: HeroCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {content.map((item) => (
          <CarouselItem key={item.id}>
            <div className="relative h-[60vh] md:h-[80vh] w-full">
              <Image
                src={item.backdropPath}
                alt={item.title}
                fill
                className="object-cover"
                priority
                data-ai-hint="dramatic landscape"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 md:p-8 lg:p-12 w-full md:w-2/3 lg:w-1/2">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground drop-shadow-lg animate-fade-in-up">
                  {item.title}
                </h1>
                <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl line-clamp-3">
                  {item.description}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <Button asChild size="lg">
                    <Link href={`/watch/${item.id}`}>
                      <PlayCircle className="mr-2" />
                      Play Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
    </Carousel>
  );
}
