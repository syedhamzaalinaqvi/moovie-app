'use client';

import React, { useRef, useEffect } from 'react';
import { usePlyr } from 'plyr-react';
import 'plyr-react/plyr.css';
import Hls from 'hls.js';

interface PlyrPlayerProps {
    source: string;
    poster?: string;
    title?: string;
    isEmbed?: boolean;
}

export default function PlyrPlayer({ source, poster, title, isEmbed }: PlyrPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isEmbed) return; // Standard Plyr handles standard video, iframe handled separately or via source type if supported, but here handled by wrapper

        const video = videoRef.current;
        if (!video) return;

        if (source.endsWith('.m3u8') || source.includes('m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }
        } else {
            video.src = source;
        }
    }, [source, isEmbed]);

    // If it's an iframe/embed code, we render it directly (simpler than Plyr iframe wrapper for raw HTML)
    // ...Wait, user said "embed/iframe script". Plyr handles YouTube/Vimeo ID, but arbitrary iframe code is best rendered as raw HTML.
    // The VideoPlayer component handled this nicely. Plyr is best for the Direct Stream URL.

    if (isEmbed) {
        // Cleaning width/height for responsive
        const responsiveIframe = source
            .replace(/width="[^"]*"/, 'width="100%"')
            .replace(/height="[^"]*"/, 'height="100%"');
        return (
            <div className="w-full aspect-video relative bg-black rounded-xl overflow-hidden shadow-lg border border-border/50">
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    dangerouslySetInnerHTML={{ __html: responsiveIframe }}
                />
            </div>
        );
    }

    // For HLS/MP4, use Plyr structure
    // We use standard HTML5 video tag with "plyr" class and init via library or just standard HTML5 for simple HLS
    // Actually plyr-react is a wrapper. Let's use it for the "Rich" feel.

    // However, plyr-react with HLS requires a specific setup.
    // A common pattern is using the ref to standard video element and init Plyr manually OR use the component.
    // Let's go with manual Init on a video ref for maximum control with HLS.js.

    useEffect(() => {
        if (!videoRef.current || isEmbed) return;

        const player = new (require('plyr'))(videoRef.current, {
            title: title,
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
            settings: ['quality', 'speed', 'loop'],
        });

        return () => {
            player.destroy();
        }
    }, [isEmbed, title]);


    return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            <video
                ref={videoRef}
                poster={poster}
                className="plyr-react plyr"
                playsInline
                controls
                crossOrigin="anonymous"
            />
        </div>
    );
}
