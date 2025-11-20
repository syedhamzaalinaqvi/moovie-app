'use client';

interface VideoPlayerProps {
    src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
    const isYoutubeUrl = src.includes('youtube.com') || src.includes('youtu.be');

    if (isYoutubeUrl) {
        const videoId = new URL(src).searchParams.get('v');
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1`;
        return (
            <iframe
                className="w-full h-full"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        );
    }
    
    return (
        <video
            className="w-full h-full"
            controls
            autoPlay
            muted // Muted to allow autoplay in most browsers
            playsInline
        >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}
