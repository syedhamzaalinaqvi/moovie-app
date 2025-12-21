
'use server';

import { getContentFromFirestore, addContentToFirestore, getSiteConfigFromFirestore, saveSiteConfigToFirestore, createPartnerRequest, getSystemUser } from '@/lib/firestore';
import { getContentById } from '@/lib/tmdb';
import type { PartnerRequest, SystemUser } from '@/lib/definitions';

export async function getLogoText(): Promise<string> {
  const config = await getSiteConfigFromFirestore();
  return config.logoText || 'Moovie';
}

export async function updateLogoText(newLogoText: string): Promise<{ success: boolean; error?: string }> {
  if (!newLogoText || typeof newLogoText !== 'string' || newLogoText.trim().length === 0) {
    return { success: false, error: 'Logo text cannot be empty.' };
  }

  try {
    await saveSiteConfigToFirestore({ logoText: newLogoText.trim() });
    return { success: true };
  } catch (error) {
    console.error('Failed to update logo text:', error);
    return { success: false, error: 'Failed to save to database.' };
  }
}



export async function getPaginationLimit(): Promise<number> {
  const config = await getSiteConfigFromFirestore();
  return typeof config.paginationLimit === 'number' ? config.paginationLimit : 20;
}

export async function updatePaginationLimit(newLimit: number): Promise<{ success: boolean; error?: string }> {
  if (typeof newLimit !== 'number' || newLimit < 1) {
    return { success: false, error: 'Limit must be a positive number.' };
  }

  try {
    await saveSiteConfigToFirestore({ paginationLimit: newLimit });
    return { success: true };
  } catch (error) {
    console.error('Failed to update pagination limit:', error);
    return { success: false, error: 'Failed to save to database.' };
  }
}



export async function getSecureDownloadSettings(): Promise<{
  enabled: boolean;
  delay: number;
  globalEnabled: boolean;
  showLiveTvCarousel: boolean;
  showFeaturedSection?: boolean;
  featuredLayout?: 'slider' | 'grid' | 'list';
}> {
  const config = await getSiteConfigFromFirestore();
  return {
    enabled: !!config.secureDownloadsEnabled,
    delay: typeof config.downloadButtonDelay === 'number' ? config.downloadButtonDelay : 5,
    globalEnabled: config.globalDownloadsEnabled !== undefined ? config.globalDownloadsEnabled : true,
    showLiveTvCarousel: config.showLiveTvCarousel !== undefined ? config.showLiveTvCarousel : true,
    showFeaturedSection: config.showFeaturedSection,
    featuredLayout: config.featuredLayout
  };
}

export async function updateSecureDownloadSettings(
  enabled: boolean,
  delay: number,
  globalEnabled: boolean
): Promise<{ success: boolean; error?: string }> {
  if (typeof delay !== 'number' || delay < 0) {
    return { success: false, error: 'Delay must be a positive number.' };
  }

  try {
    await saveSiteConfigToFirestore({
      secureDownloadsEnabled: enabled,
      downloadButtonDelay: delay,
      globalDownloadsEnabled: globalEnabled
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to update secure download settings:', error);
    return { success: false, error: 'Failed to save to database.' };
  }
}

export async function getManuallyAddedContent() {
  return await getContentFromFirestore();
}

export async function addContent(tmdbId: string, contentType: 'movie' | 'tv') {
  try {
    const content = await getContentById(tmdbId, contentType);
    if (!content) {
      return { success: false, error: 'Content not found with the provided TMDB ID.' };
    }

    const result = await addContentToFirestore(content);
    return result;
  } catch (error) {
    console.error('Failed to add content:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add content.' };
  }
}

export async function deleteContent(ids: string[]) {
  try {
    const { deleteContentFromFirestore } = await import('@/lib/firestore');
    const result = await deleteContentFromFirestore(ids);
    return result;
  } catch (error) {
    console.error('Failed to delete content:', error);
    return { success: false };
  }
}

export async function syncContentMetadata() {
  try {
    const allContent = await getContentFromFirestore();
    let updatedCount = 0;

    for (const item of allContent) {
      try {
        const freshData = await getContentById(item.id, item.type);
        if (freshData) {
          await addContentToFirestore({
            ...freshData,
            downloadLink: item.downloadLink,
            downloadLinks: item.downloadLinks,
            trailerUrl: item.trailerUrl,
            isHindiDubbed: item.isHindiDubbed,
            customTags: item.customTags,
            languages: item.languages,
            quality: item.quality,
            uploadedBy: item.uploadedBy,
            isFeatured: item.isFeatured
          });
          updatedCount++;
        }
      } catch (err) {
        console.error(`Failed to sync ${item.id}:`, err);
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error: 'Failed to sync metadata.' };
  }
}

export async function submitPartnerRequest(data: Omit<PartnerRequest, 'id' | 'status' | 'createdAt'>) {
  try {
    await createPartnerRequest(data);
    return { success: true };
  } catch (error) {
    console.error('Failed to create partner request:', error);
    return { success: false, error: 'Failed to submit request.' };
  }
}

export async function getPartnerRequests(): Promise<PartnerRequest[]> {
  try {
    const { getPartnerRequestsFromFirestore } = await import('@/lib/firestore');
    return await getPartnerRequestsFromFirestore();
  } catch (error) {
    console.error('Failed to fetch partner requests:', error);
    return [];
  }
}

export async function getUserByUsername(username: string): Promise<SystemUser | null> {
  return await getSystemUser(username);
}

/**
 * Domain Migration Tool
 * Batch updates download links from one domain to another
 */
export async function migrateDownloadDomains(
  oldDomain: string,
  newDomain: string
): Promise<{ success: boolean; updatedCount: number; error?: string }> {
  // Validation
  if (!oldDomain || !newDomain || oldDomain.trim() === '' || newDomain.trim() === '') {
    return { success: false, updatedCount: 0, error: 'Both domains must be provided.' };
  }

  const oldDomainClean = oldDomain.trim();
  const newDomainClean = newDomain.trim();

  if (oldDomainClean === newDomainClean) {
    return { success: false, updatedCount: 0, error: 'Old and new domains are the same.' };
  }

  try {
    const allContent = await getContentFromFirestore();
    let updatedCount = 0;

    for (const item of allContent) {
      let hasChanges = false;
      const updatedItem = { ...item };

      // Check legacy downloadLink
      if (updatedItem.downloadLink && updatedItem.downloadLink.includes(oldDomainClean)) {
        updatedItem.downloadLink = updatedItem.downloadLink.replace(
          new RegExp(oldDomainClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          newDomainClean
        );
        hasChanges = true;
      }

      // Check downloadLinks array
      if (updatedItem.downloadLinks && Array.isArray(updatedItem.downloadLinks)) {
        updatedItem.downloadLinks = updatedItem.downloadLinks.map(link => {
          if (link.url && link.url.includes(oldDomainClean)) {
            hasChanges = true;
            return {
              ...link,
              url: link.url.replace(
                new RegExp(oldDomainClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                newDomainClean
              )
            };
          }
          return link;
        });
      }

      // Update if changes were made
      if (hasChanges) {
        await addContentToFirestore(updatedItem);
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error('Domain migration failed:', error);
    return {
      success: false,
      updatedCount: 0,
      error: error instanceof Error ? error.message : 'Migration failed.'
    };
  }
}

/**
 * Get download URL for a content item
 * Used by the download interstitial page
 */
export async function getDownloadUrl(
  contentId: number,
  linkIndex?: number
): Promise<{ title: string; url: string } | null> {
  try {
    const allContent = await getContentFromFirestore();
    const content = allContent.find(c => c.id === String(contentId));

    if (!content) {
      return null;
    }

    let url = '';

    // If linkIndex is provided, get specific link from downloadLinks array
    if (linkIndex !== undefined && content.downloadLinks && content.downloadLinks[linkIndex]) {
      url = content.downloadLinks[linkIndex].url;
    }
    // Otherwise, fall back to legacy downloadLink
    else if (content.downloadLink) {
      url = content.downloadLink;
    }
    // Or first item in downloadLinks if available
    else if (content.downloadLinks && content.downloadLinks.length > 0) {
      url = content.downloadLinks[0].url;
    }

    if (!url) {
      return null;
    }

    return {
      title: content.title,
      url
    };
  } catch (error) {
    console.error('Failed to get download URL:', error);
    return null;
  }
}

/**
 * Verify user login credentials
 * Used by admin login page
 */
export async function verifyUserLogin(
  username: string,
  password: string
): Promise<{ success: boolean; user?: SystemUser; error?: string }> {
  try {
    const user = await getSystemUser(username);

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Check password (in production, use proper password hashing)
    if (user.password !== password) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Don't return password in the response
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword as SystemUser
    };
  } catch (error) {
    console.error('Login verification failed:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
