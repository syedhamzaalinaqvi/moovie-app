import { HeroSection } from '@/components/hero-section';
import { ContentCarousel } from '@/components/content-carousel';
import { getFeatured, getPopular, getTrending, getNewReleases } from '@/lib/tmdb';
import RecommendedContent from '@/components/recommended-content';

export default async function Home() {
  const featuredContent = await getFeatured();
  const trendingContent = await getTrending();
  const popularContent = await getPopular();
  const newReleasesContent = await getNewReleases();

  return (
    <div className="flex flex-col">
      <main className="flex-1 overflow-y-auto">
        {featuredContent && <HeroSection content={featuredContent} />}
        <div className="space-y-8 p-4 md:p-6 lg:p-8">
          <RecommendedContent />
          <ContentCarousel title="Trending Now" content={trendingContent} />
          <ContentCarousel title="Popular" content={popularContent} />
          <ContentCarousel title="New Releases" content={newReleasesContent} />
        </div>
      </main>
    </div>
  );
}
