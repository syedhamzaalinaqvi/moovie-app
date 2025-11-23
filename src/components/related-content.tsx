import { getRelatedContent } from "@/lib/tmdb";
import { ContentCarousel } from "./content-carousel";
import type { Content } from "@/lib/definitions";

interface RelatedContentProps {
    contentId: string;
    contentType: 'movie' | 'tv';
}

export async function RelatedContent({ contentId, contentType }: RelatedContentProps) {
    const relatedItems = await getRelatedContent(contentId, contentType);

    if (!relatedItems || relatedItems.length === 0) {
        return null;
    }

    const title = contentType === 'movie' ? 'Related Movies' : 'Related TV Shows';

    return (
        <ContentCarousel title={title} content={relatedItems} />
    )
}
