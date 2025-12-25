'use client';

import { useEffect, useState, useRef } from 'react';
import { shouldShowAd, getAdSettings, getAdScriptsByType, selectRandomScript } from '@/lib/ad-utils';

interface AdWrapperProps {
    adType: string;
    position?: string;
    className?: string;
    lazyLoad?: boolean;
    children?: React.ReactNode;
}

export default function AdWrapper({ adType, position, className = '', lazyLoad = true, children }: AdWrapperProps) {
    const [adScript, setAdScript] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(!lazyLoad);
    const [shouldDisplay, setShouldDisplay] = useState(false);
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Lazy loading with Intersection Observer
        if (lazyLoad && adRef.current) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setIsVisible(true);
                            observer.disconnect();
                        }
                    });
                },
                { threshold: 0.1 }
            );

            observer.observe(adRef.current);

            return () => observer.disconnect();
        }
    }, [lazyLoad]);

    useEffect(() => {
        if (!isVisible) return;

        const loadAd = async () => {
            try {
                // Get global settings
                const settings = await getAdSettings();

                // Check if ad should be shown
                const canShow = await shouldShowAd(
                    adType,
                    settings.popupFrequencyCap,
                    settings.testMode,
                    settings.masterEnabled
                );

                if (!canShow) {
                    setShouldDisplay(false);
                    return;
                }

                // Get ad scripts for this type
                const scripts = await getAdScriptsByType(adType);

                if (scripts.length === 0) {
                    setShouldDisplay(false);
                    return;
                }

                // Select random script (for rotation)
                const selectedScript = selectRandomScript(scripts);

                if (selectedScript) {
                    setAdScript(selectedScript.script);
                    setShouldDisplay(true);
                }
            } catch (error) {
                console.error('Error loading ad:', error);
                setShouldDisplay(false);
            }
        };

        loadAd();
    }, [isVisible, adType]);

    if (!shouldDisplay || !adScript) {
        return null;
    }

    return (
        <div
            ref={adRef}
            className={`ad-container ${className}`}
            data-ad-type={adType}
            data-ad-position={position}
        >
            {children}
            <div
                className="ad-content"
                dangerouslySetInnerHTML={{ __html: adScript }}
            />
        </div>
    );
}
