'use client';

import { useEffect, useState, use } from 'react';
import { getLiveChannelById } from '@/lib/firestore';
import type { LiveChannel } from '@/lib/definitions';
import PlyrPlayer from '@/components/plyr-player';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LiveTvWatchPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [channel, setChannel] = useState<LiveChannel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchChannel = async () => {
            setIsLoading(true);
            const data = await getLiveChannelById(id);
            setChannel(data);
            setIsLoading(false);
        };
        fetchChannel();
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied', description: 'Channel link copied to clipboard' });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 space-y-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="container mx-auto p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold">Channel Not Found</h1>
                <Button asChild>
                    <Link href="/live-tv">Back to Live TV</Link>
                </Button>
            </div>
        );
    }

    // Determine source for player
    // Prioritize Embed Code if both exist (though admin form implies one mostly), 
    // or user logic: "one is live url and second is embeded/iframe script"
    // We can pass whichever is present. 
    // VideoPlayer handles iframe strings in `src` prop by checking usage of <iframe ...
    const playerSrc = channel.embedCode || channel.streamUrl || '';

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/live-tv">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Channels
                    </Link>
                </Button>
            </div>

            <div className="space-y-4">
                <div className="items-center justify-between flex flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold">{channel.title}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge>{channel.country}</Badge>
                            {channel.tags.map(tag => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    <Button variant="outline" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                </div>

                <div className="rounded-xl overflow-hidden border bg-black shadow-2xl">
                    <PlyrPlayer
                        source={playerSrc}
                        poster={channel.posterUrl || channel.posterPath}
                        title={channel.title}
                        isEmbed={!!channel.embedCode} // If embed code exists, treat as embed
                    />
                </div>

                <div className="bg-card p-6 rounded-xl border">
                    <h2 className="text-xl font-semibold mb-2">About this Channel</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {channel.description || 'No description provided.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
