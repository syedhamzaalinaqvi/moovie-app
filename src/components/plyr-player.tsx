'use client';

import React, { useRef, useEffect } from 'react';
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
        if (isEmbed) return;

        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;
        let player: any = null;

        // Initialize HLS if applicable
        if (source.endsWith('.m3u8') || source.includes('m3u8')) {
            if (Hls.isSupported()) {
                hls = new Hls();
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            }
        } else {
            video.src = source;
        }

        // Initialize Plyr safely
        // require('plyr') often returns the module, checking .default ensures we get the constructor
        const PlyrModule = require('plyr');
        const PlyrCtor = PlyrModule.default || PlyrModule;

        player = new PlyrCtor(video, {
            title: title,
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
            settings: ['quality', 'speed', 'loop'],
            poster: poster,
        });

        // Plyr takes over the video element, but if HLS is attached, it should work fine.
        // If HLS events need hookup to Plyr (quality selector), Plyr usually handles it via listeners if HLS is passed, 
        // but basic playback works this way.

        return () => {
            if (hls) hls.destroy();
            if (player) player.destroy();
        };
    }, [source, isEmbed, title, poster]);

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

    return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            <video
                ref={videoRef}
                className="plyr-react plyr"
                playsInline
                controls
                crossOrigin="anonymous"
                poster={poster}
            />
        </div>
    );
}
