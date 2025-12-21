import { getManuallyAddedContent, getTrending } from "@/lib/tmdb";
import { getPaginationLimit, getSecureDownloadSettings } from "@/app/admin/actions";
import { getLiveChannels } from "@/lib/firestore";
import BrowseClient from "@/components/browse-client";

// ISR: Revalidate page every 60 seconds. Instant serving from cache.
export const revalidate = 60;

export default async function BrowsePage() {

  // Fetch everything in parallel for maximum speed
  const [
    localContent,
    trending,
    paginationLimit,
    secureSettings
  ] = await Promise.all([
    getManuallyAddedContent(),
    getTrending(),
    getPaginationLimit(),
    getSecureDownloadSettings()
  ]);

  let liveChannels = [];
  if (secureSettings.showLiveTvCarousel) {
    liveChannels = await getLiveChannels(10);
  }

  return (
    <BrowseClient
      initialContent={localContent}
      initialHero={trending.slice(0, 5)}
      initialLiveChannels={liveChannels}
      initialPaginationLimit={paginationLimit}
    />
  );
}
