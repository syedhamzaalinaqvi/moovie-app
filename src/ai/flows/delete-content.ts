'use server';
/**
 * @fileOverview This file defines a Genkit flow for deleting items from the local content database.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const DeleteContentInputSchema = z.object({
  ids: z.array(z.string()).describe('An array of content IDs to delete.'),
});

export async function deleteContent(ids: string[]): Promise<{ success: boolean }> {
  return deleteContentFlow({ ids });
}

const deleteContentFlow = ai.defineFlow(
  {
    name: 'deleteContentFlow',
    inputSchema: DeleteContentInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ ids }) => {
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
);
