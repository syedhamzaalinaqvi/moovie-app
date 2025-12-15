
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



export async function getSecureDownloadSettings(): Promise<{ enabled: boolean; delay: number; globalEnabled: boolean; showLiveTvCarousel: boolean }> {
  const config = await getSiteConfigFromFirestore();
  return {
    enabled: config.secureDownloadsEnabled || false,
    delay: typeof config.downloadButtonDelay === 'number' ? config.downloadButtonDelay : 5,
    globalEnabled: config.globalDownloadsEnabled !== undefined ? config.globalDownloadsEnabled : true,
    showLiveTvCarousel: config.showLiveTvCarousel !== undefined ? config.showLiveTvCarousel : true
  };
}

export async function updateSecureDownloadSettings(enabled: boolean, delay: number, globalEnabled: boolean): Promise<{ success: boolean; error?: string }> {
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



export async function getDownloadUrl(contentId: number | string, linkIndex?: number): Promise<{ url: string; title: string } | null> {
  try {
    const content = await getContentById(String(contentId));
    if (!content) return null;

    let url = '';
    if (content.downloadLinks && content.downloadLinks.length > 0) {
      const index = linkIndex !== undefined ? linkIndex : 0;
      url = content.downloadLinks[index]?.url || '';
    } else if (content.downloadLink) {
      url = content.downloadLink;
    }

    return {
      url,
      title: content.title
    };
  } catch (error) {
    console.error('Failed to get download URL:', error);
    return null;
  }
}



export async function submitPartnerRequest(data: { fullname: string; email: string; message: string }): Promise<{ success: boolean }> {
  try {
    const request: PartnerRequest = {
      fullname: data.fullname,
      email: data.email,
      message: data.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    return await createPartnerRequest(request);
  } catch (error) {
    console.error('Failed to submit partner request:', error);
    return { success: false };
  }
}

// USER LOGIN VERIFICATION
export async function verifyUserLogin(username: string, password: string): Promise<{ success: boolean; user?: SystemUser; error?: string }> {
  try {
    console.log('🔐 Login attempt for username:', username);

    const user = await getSystemUser(username);

    console.log('👤 User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('❌ User not found in database');
      return { success: false, error: 'Invalid username or password' };
    }

    console.log('🔑 Checking password...');
    // Check password (in production, you should use proper password hashing)
    if (user.password !== password) {
      console.log('❌ Password mismatch');
      return { success: false, error: 'Invalid username or password' };
    }

    console.log('✅ Login successful for user:', user.username);

    // Don't return password in the response
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword as SystemUser
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}
