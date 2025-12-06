'use server';
/**
 * @fileOverview Server action for updating the local content database.
 * Simplified from Genkit flow to direct file operations for better Vercel compatibility.
 */
import fs from 'fs/promises';
import path from 'path';
import type { Content } from '@/lib/definitions';

export async function updateContent(newContent: Content): Promise<{ success: boolean }> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'added-content.json');

  try {
    // Read the existing file
    let existingContent: Content[] = [];
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      existingContent = JSON.parse(fileData);
    } catch (error) {
      // If the file doesn't exist, start with an empty array
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    // Check if content with the same ID already exists
    const existingContentIndex = existingContent.findIndex(item => String(item.id) === String(newContent.id));

    if (existingContentIndex !== -1) {
      // Update existing content
      existingContent[existingContentIndex] = newContent;
    } else {
      // Add new content to the beginning of the array
      existingContent.unshift(newContent);
    }

    // Write the updated content back to the file
    await fs.writeFile(filePath, JSON.stringify(existingContent, null, 2), 'utf-8');

    return { success: true };
  } catch (error) {
    console.error('Failed to update content file:', error);
    return { success: false };
  }
}
