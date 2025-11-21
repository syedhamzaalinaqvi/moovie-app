'use server';
/**
 * @fileOverview This file defines a Genkit flow for updating the local content database.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fs from 'fs/promises';
import path from 'path';
import type { Content } from '@/lib/definitions';

const UpdateContentInputSchema = z.custom<Content>();

export async function updateContent(newContent: Content): Promise<{ success: boolean }> {
  return updateContentFlow(newContent);
}

const updateContentFlow = ai.defineFlow(
  {
    name: 'updateContentFlow',
    inputSchema: UpdateContentInputSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (newContent) => {
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

      // Add the new content
      existingContent.push(newContent);

      // Write the updated content back to the file
      await fs.writeFile(filePath, JSON.stringify(existingContent, null, 2), 'utf-8');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to update content file:', error);
      return { success: false };
    }
  }
);
