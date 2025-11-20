import { getContentById } from '@/lib/tmdb';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { CommentSection } from '@/components/comment-section';

type WatchPageProps = {
  params: {
    id: string;
  };
};

export default async function WatchPage({ params }: WatchPageProps) {
  const content = await getContentById(params.id);

  if (!content) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <div className="relative w-full aspect-video bg-black">
        {content.trailerUrl ? (
          <VideoPlayer src={content.trailerUrl} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Video not available.</p>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3 lg:w-3/4">
                <h1 className="text-3xl md:text-4xl font-bold">{content.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                    <span>{content.releaseDate.split('-')[0]}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{content.rating}</span>
                    </div>
                    <Badge variant="outline" className="capitalize">{content.type}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {content.genres.map(genre => (
                        <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                </div>
                <p className="mt-6 text-foreground/80 leading-relaxed">
                    {content.description}
                </p>
            </div>
            <div className="w-full md:w-1/3 lg:w-1/4">
                <Image 
                    src={content.posterPath} 
                    alt={content.title} 
                    width={500}
                    height={750}
                    className="rounded-lg shadow-lg w-full"
                    data-ai-hint="movie poster"
                />
            </div>
        </div>

        <CommentSection contentId={content.id} />
      </div>
    </div>
  );
}
