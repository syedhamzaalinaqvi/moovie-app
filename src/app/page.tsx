import { getBrowseContent } from "@/lib/tmdb";
import { ContentCard } from "@/components/content-card";
import { Search } from "lucide-react";

type BrowsePageProps = {
  searchParams: {
    q?: string;
    type?: 'movie' | 'tv';
  };
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const content = await getBrowseContent({ type: searchParams.type, genre: undefined });
  
  const query = searchParams.q;
  const filteredContent = query 
    ? content.filter(item => item.title.toLowerCase().includes(query.toLowerCase())) 
    : content;

  const title = query 
    ? `Search results for "${query}"`
    : searchParams.type === 'movie' 
    ? 'Movies' 
    : searchParams.type === 'tv' 
    ? 'TV Shows' 
    : 'Browse All';

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
            {filteredContent.map((item) => (
              <ContentCard key={item.id} content={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center h-64">
            <Search className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">No Results Found</h2>
            <p className="text-muted-foreground mt-2">
              We couldn't find any content matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
