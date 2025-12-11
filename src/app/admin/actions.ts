
'use server';

import fs from 'fs/promises';
import path from 'path';
import { getContentFromFirestore, addContentToFirestore } from '@/lib/firestore';
import { getContentById } from '@/lib/tmdb';

const configPath = path.join(process.cwd(), 'src', 'lib', 'site-config.json');

async function readConfig() {
  try {
    const file = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(file);
  } catch (error) {
    // If file doesn't exist, return default
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { logoText: 'Moovie' };
    }
    throw error;
  }
}

export async function getLogoText(): Promise<string> {
  const config = await readConfig();
  return config.logoText || 'Moovie';
}

export async function updateLogoText(newLogoText: string): Promise<{ success: boolean; error?: string }> {
  if (!newLogoText || typeof newLogoText !== 'string' || newLogoText.trim().length === 0) {
    return { success: false, error: 'Logo text cannot be empty.' };
  }

  try {
    const config = await readConfig();
    config.logoText = newLogoText.trim();
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to update logo text:', error);
    return { success: false, error: 'Failed to write to configuration file.' };
  }
}

export async function getPaginationLimit(): Promise<number> {
  const config = await readConfig();
  return typeof config.paginationLimit === 'number' ? config.paginationLimit : 20;
}

export async function updatePaginationLimit(newLimit: number): Promise<{ success: boolean; error?: string }> {
  if (typeof newLimit !== 'number' || newLimit < 1) {
    return { success: false, error: 'Limit must be a positive number.' };
  }

  try {
    const config = await readConfig();
    config.paginationLimit = newLimit;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to update pagination limit:', error);
    return { success: false, error: 'Failed to save configuration.' };
  }
}

export async function getSecureDownloadSettings(): Promise<{ enabled: boolean; delay: number }> {
  const config = await readConfig();
  return {
    enabled: config.secureDownloadsEnabled || false,
    delay: typeof config.downloadButtonDelay === 'number' ? config.downloadButtonDelay : 5
  };
}

export async function updateSecureDownloadSettings(enabled: boolean, delay: number): Promise<{ success: boolean; error?: string }> {
  if (typeof delay !== 'number' || delay < 0) {
    return { success: false, error: 'Delay must be a positive number.' };
  }

  try {
    const config = await readConfig();
    config.secureDownloadsEnabled = enabled;
    config.downloadButtonDelay = delay;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to update secure download settings:', error);
    return { success: false, error: 'Failed to save configuration.' };
  }
}

export async function syncContentMetadata(): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  try {
    const allContent = await getContentFromFirestore();
    let updatedCount = 0;

    for (const item of allContent) {
      // Re-fetch from TMDB to get latest data including lastAirDate
      const freshData = await getContentById(item.id, item.type);

      if (freshData) {
        // Save fresh data back to Firestore.
        await addContentToFirestore(freshData);
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error("Failed to sync metadata:", error);
    return { success: false, updatedCount: 0, error: "Failed to sync metadata." };
  }
}
