'use client';

interface VideoPlayerProps {
    src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
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
