'use server';
/**
 * @fileOverview Server action for deleting items from the local content database.
 * Simplified from Genkit flow to direct file operations for better Vercel compatibility.
 */
import fs from 'fs/promises';
import path from 'path';

export async function deleteContent(ids: string[]): Promise<{ success: boolean }> {
  const filePath = path.join(process.cwd(), 'src', 'lib', 'added-content.json');

  try {
    // Read the existing file
    let existingContent: { id: string }[] = [];
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      existingContent = JSON.parse(fileData);
    } catch (error) {
      // If the file doesn't exist, there's nothing to delete
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { success: true };
      }
      throw error;
    }

    // Filter out the content with the specified IDs
    const updatedContent = existingContent.filter(item => !ids.includes(String(item.id)));

    // Write the updated content back to the file
    await fs.writeFile(filePath, JSON.stringify(updatedContent, null, 2), 'utf-8');

    return { success: true };
  } catch (error) {
    console.error('Failed to update content file:', error);
    return { success: false };
  }
}
