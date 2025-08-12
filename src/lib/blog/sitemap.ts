import { enhancedClient } from '../sanity/client';
import { BlogPost } from '../types/blog';

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Generate sitemap entries for all published blog posts
 */
export async function generateBlogSitemapEntries(): Promise<SitemapEntry[]> {
  try {
    const posts = await enhancedClient.fetch<Array<{
      slug: { current: string };
      publishedAt: string;
      lastModified?: string;
      featured?: boolean;
    }>>(`
      *[_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] {
        slug,
        publishedAt,
        lastModified,
        featured
      }
    `);

    return posts.map(post => ({
      url: `https://aviatorstrainingcentre.in/blog/${post.slug.current}`,
      lastModified: post.lastModified || post.publishedAt,
      changeFrequency: 'weekly' as const,
      priority: post.featured ? 0.9 : 0.7
    }));
  } catch (error) {
    console.error('Error generating blog sitemap entries:', error);
    return [];
  }
}

/**
 * Generate XML sitemap content for blog posts
 */
export async function generateBlogSitemap(): Promise<string> {
  const entries = await generateBlogSitemapEntries();
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Blog listing page -->
  <url>
    <loc>https://aviatorstrainingcentre.in/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Individual blog posts -->
  ${entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('')}
</urlset>`;

  return sitemapContent;
}

/**
 * Generate RSS feed for blog posts
 */
export async function generateBlogRSSFeed(): Promise<string> {
  try {
    const posts = await enhancedClient.fetch<Array<{
      title: string;
      slug: { current: string };
      excerpt: string;
      publishedAt: string;
      author: { name: string };
      category: { title: string };
    }>>(`
      *[_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] 
      | order(publishedAt desc) [0...20] {
        title,
        slug,
        excerpt,
        publishedAt,
        author->{ name },
        category->{ title }
      }
    `);

    const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Aviators Training Centre Blog</title>
    <description>Latest insights, tips, and updates from India's leading aviation training institute</description>
    <link>https://aviatorstrainingcentre.in/blog</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://aviatorstrainingcentre.in/blog/rss.xml" rel="self" type="application/rss+xml"/>
    
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>https://aviatorstrainingcentre.in/blog/${post.slug.current}</link>
      <guid>https://aviatorstrainingcentre.in/blog/${post.slug.current}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>${post.author.name}</author>
      <category>${post.category.title}</category>
    </item>`).join('')}
  </channel>
</rss>`;

    return rssContent;
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return '';
  }
}

/**
 * Get blog post URLs for robots.txt
 */
export async function getBlogPostUrls(): Promise<string[]> {
  try {
    const posts = await enhancedClient.fetch<Array<{ slug: { current: string } }>>(`
      *[_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] {
        slug
      }
    `);

    return posts.map(post => `/blog/${post.slug.current}`);
  } catch (error) {
    console.error('Error fetching blog post URLs:', error);
    return [];
  }
}
