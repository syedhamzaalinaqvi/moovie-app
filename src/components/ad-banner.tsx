'use client';

import { useEffect, useRef } from 'react';

export function AdBanner() {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            if (adRef.current && (adRef.current.innerHTML === '' || adRef.current.children.length === 0)) {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error('AdSense Error:', err);
        }
    }, []);

    return (
        <div className="flex justify-center my-6 overflow-hidden w-full bg-accent/20 rounded-md min-h-[90px]">
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client="ca-pub-8130991342525434"
                data-ad-slot="5804661872"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
}
