'use client';

import { useEffect, useState } from 'react';
import { shouldShowAd, getAdSettings, getAdScriptsByType, selectRandomScript, incrementAdCount } from '@/lib/ad-utils';

interface PopupHandlerProps {
    trigger?: 'load' | 'time' | 'exit_intent';
    delay?: number; // seconds
}

export default function PopupHandler({ trigger = 'time', delay = 30 }: PopupHandlerProps) {
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        if (hasShown) return;

        const showPopup = async () => {
            try {
                // Get global settings
                const settings = await getAdSettings();

                // Check if popup can be shown
                const canShow = await shouldShowAd(
                    'popup',
                    settings.popupFrequencyCap,
                    settings.testMode,
                    settings.masterEnabled
                );

                if (!canShow) return;

                // Get popup scripts
                const scripts = await getAdScriptsByType('popup');
                if (scripts.length === 0) return;

                // Select random script
                const selectedScript = selectRandomScript(scripts);
                if (!selectedScript) return;

                // Inject script
                const scriptElement = document.createElement('div');
                scriptElement.innerHTML = selectedScript.script;
                document.body.appendChild(scriptElement);

                // Increment count
                incrementAdCount('popup');
                setHasShown(true);
            } catch (error) {
                console.error('Error showing popup:', error);
            }
        };

        if (trigger === 'load') {
            // Show immediately on page load
            showPopup();
        } else if (trigger === 'time') {
            // Show after delay
            const timer = setTimeout(showPopup, delay * 1000);
            return () => clearTimeout(timer);
        } else if (trigger === 'exit_intent') {
            // Show on exit intent
            const handleMouseLeave = (e: MouseEvent) => {
                if (e.clientY <= 0) {
                    showPopup();
                    document.removeEventListener('mouseleave', handleMouseLeave);
                }
            };
            document.addEventListener('mouseleave', handleMouseLeave);
            return () => document.removeEventListener('mouseleave', handleMouseLeave);
        }
    }, [trigger, delay, hasShown]);

    return null; // This component doesn't render anything
}
