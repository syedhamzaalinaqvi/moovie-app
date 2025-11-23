
'use server';

import fs from 'fs/promises';
import path from 'path';

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
