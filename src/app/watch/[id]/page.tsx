import { getContentById } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { Badge } from '@/components/ui/badge';
import { Star, Play, Download, Youtube } from 'lucide-react';
import { CommentSection } from '@/components/comment-section';
import type { Content } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { CastSection } from '@/components/cast-section';
import { Separator } from '@/components/ui/separator';

type WatchPageProps = {
  params: {
    id: string;
  };
};

export default async function WatchPage({ params }: WatchPageProps) {
  // Extract the ID from the slug (e.g., "123456-movie-title" -> "123456")
  const contentId = params.id.split('-')[0];
  const content = await getContentById(contentId);

  if (!content) {
    notFound();
  }
  
  // Combine tags
  const allTags = [
    ...(content.genres || []),
    ...(content.customTags || [])
  ];

  // The primary video source is the custom trailerUrl. If not present, fallback to youtube trailer.
  const primaryVideoSrc = content.trailerUrl || content.youtubeTrailerUrl;

  return (
    <div className="flex flex-col">
      <div id="player" className="relative w-full bg-black aspect-video">
        {primaryVideoSrc ? (
          <VideoPlayer src={primaryVideoSrc} />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center">
            <p className="text-muted-foreground">Video not available.</p>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2">
                <h1 className="text-3xl md:text-4xl font-bold">{content.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm flex-wrap">
                    <span>{(content.releaseDate || 'N/A').split('-')[0]}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{content.rating.toFixed(1)}</span>
                    </div>
                    <Badge variant="outline" className="capitalize">{content.type}</Badge>
                    {content.isHindiDubbed && <Badge variant="secondary">Hindi Dubbed</Badge>}
                </div>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {allTags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
                <p className="mt-6 text-foreground/80 leading-relaxed">
                    {content.description}
                </p>
                <div className="mt-6 flex gap-4">
                  {content.trailerUrl && (
                    <Button asChild size="lg">
                      <Link href="#player">
                        <Play className="mr-2 h-5 w-5" />
                        Play Now
                      </Link>
                    </Button>
                  )}
                  {!content.trailerUrl && content.youtubeTrailerUrl && (
                    <Button asChild size="lg">
                      <Link href="#player">
                        <Youtube className="mr-2 h-5 w-5" />
                        Watch Trailer
                      </Link>
                    </Button>
                  )}
                   {content.downloadLink && (
                    <Button asChild size="lg" variant="outline">
                      <Link href={content.downloadLink} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-5 w-5" />
                        Download
                      </Link>
                    </Button>
                  )}
                </div>
            </div>
            <div className="w-full max-w-[200px] md:max-w-none mx-auto md:mx-0">
                <Image 
                    src={content.posterPath} 
                    alt={content.title} 
                    width={500}
                    height={750}
                    className="rounded-lg shadow-lg w-full h-auto"
                    data-ai-hint="movie poster"
                />
            </div>
        </div>

        {content.cast && content.cast.length > 0 && (
          <>
            <Separator />
            <CastSection cast={content.cast} />
          </>
        )}
        
        <Separator />
        <CommentSection contentId={String(content.id)} />
        
      </div>
    </div>
  );
}
