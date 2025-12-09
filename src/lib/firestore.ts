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

        // Client-side sort to handle mixed data
        // Sort by releaseDate desc (newest first), fallback to createdAt
        return content.sort((a, b) => {
            const dateA = a.releaseDate || a.createdAt || '';
            const dateB = b.releaseDate || b.createdAt || '';
            // Compare as strings works for ISO dates (YYYY-MM-DD), but releaseDate might be just YYYY or YYYY-MM-DD.
            // Let's safe guard it.
            if (dateA === dateB) return 0;
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
