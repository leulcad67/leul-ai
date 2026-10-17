export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
  type: 'web' | 'map';
}

export function parseGroundingChunks(chunks: any[] | undefined): GroundingSource[] {
  if (!chunks || !Array.isArray(chunks)) return [];
  const results: GroundingSource[] = [];

  for (const chunk of chunks) {
    if (chunk.web && chunk.web.uri) {
      results.push({
        title: chunk.web.title || chunk.web.uri,
        url: chunk.web.uri,
        type: 'web',
      });
    }
    if (chunk.maps) {
      if (chunk.maps.uri) {
        results.push({
          title: chunk.maps.title || 'View Location on Google Maps',
          url: chunk.maps.uri,
          type: 'map',
        });
      }
      if (Array.isArray(chunk.maps.placeAnswerSources?.reviewSnippets)) {
        for (const review of chunk.maps.placeAnswerSources.reviewSnippets) {
          if (review.reviewUrl) {
            results.push({
              title: review.title || 'Review Snippet',
              url: review.reviewUrl,
              snippet: review.snippet,
              type: 'map',
            });
          }
        }
      }
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return results.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
