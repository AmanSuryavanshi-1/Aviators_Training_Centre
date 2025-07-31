import { generateBlogRSSFeed } from '@/lib/blog/sitemap';

export async function GET() {
  const rssContent = await generateBlogRSSFeed();
  
  return new Response(rssContent, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
