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
        // Fetch existing doc to preserve createdAt
        const docSnap = await import('firebase/firestore').then(mod => mod.getDoc(contentRef));

        let createdAt = new Date().toISOString();
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Use existing createdAt, or fallback to existing updatedAt, or fallback to current time (if really nothing)
            createdAt = data.createdAt || data.updatedAt || createdAt;
        }

        await setDoc(contentRef, {
            ...content,
            createdAt: createdAt,
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
            collection(db, CONTENT_COLLECTION)
        );
        const snapshot = await getDocs(contentQuery);

        const content: Content[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            content.push(data as Content);
        });

        // Client-side sort to handle mixed data (some with createdAt, some without)
        // Sort by createdAt desc, fallback to updatedAt desc
        return content.sort((a, b) => {
            const dateA = a.createdAt || a.updatedAt || '';
            const dateB = b.createdAt || b.updatedAt || '';
            return dateB.localeCompare(dateA);
        });
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
