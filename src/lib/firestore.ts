'use server';
/**
 * @fileOverview Firestore helper functions for content management
 */
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { Content } from './definitions';

const CONTENT_COLLECTION = 'manually_added_content';

/**
 * Add or update content in Firestore
 */
export async function addContentToFirestore(content: Content): Promise<{ success: boolean }> {
    try {
        const contentRef = doc(db, CONTENT_COLLECTION, String(content.id));
        await setDoc(contentRef, {
            ...content,
            updatedAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to add content to Firestore:', error);
        return { success: false };
    }
}

/**
 * Get all manually added content from Firestore
 */
export async function getContentFromFirestore(): Promise<Content[]> {
    try {
        const contentQuery = query(
            collection(db, CONTENT_COLLECTION),
            orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(contentQuery);

        const content: Content[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Remove the updatedAt field before returning
            const { updatedAt, ...contentData } = data;
            content.push(contentData as Content);
        });

        return content;
    } catch (error) {
        console.error('Failed to fetch content from Firestore:', error);
        return [];
    }
}

/**
 * Delete content from Firestore by IDs
 */
export async function deleteContentFromFirestore(ids: string[]): Promise<{ success: boolean }> {
    try {
        const deletePromises = ids.map(id =>
            deleteDoc(doc(db, CONTENT_COLLECTION, id))
        );
        await Promise.all(deletePromises);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete content from Firestore:', error);
        return { success: false };
    }
}
