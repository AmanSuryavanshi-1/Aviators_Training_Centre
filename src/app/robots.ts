import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.aviatorstrainingcentre.in';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/studio/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: [
          '/blog/',
          '/courses/',
          '/about',
          '/instructors',
          '/faq',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/studio/',
          '/contact',
          '/schedule',
        ],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: [
          '/blog/',
          '/courses/',
          '/about',
          '/instructors',
          '/faq',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/studio/',
          '/contact',
          '/schedule',
        ],
      },
      {
        userAgent: 'CCBot',
        allow: [
          '/blog/',
          '/courses/',
          '/about',
          '/instructors',
          '/faq',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/studio/',
          '/contact',
          '/schedule',
        ],
      },
      {
        userAgent: 'anthropic-ai',
        allow: [
          '/blog/',
          '/courses/',
          '/about',
          '/instructors',
          '/faq',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/studio/',
          '/contact',
          '/schedule',
        ],
      },
      {
        userAgent: 'Claude-Web',
        allow: [
          '/blog/',
          '/courses/',
          '/about',
          '/instructors',
          '/faq',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/studio/',
          '/contact',
          '/schedule',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
