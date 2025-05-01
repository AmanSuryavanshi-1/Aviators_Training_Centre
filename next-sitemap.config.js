/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://aviatorstrainingcentre.com',
  generateRobotsTxt: true, // Generate robots.txt file
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/404', '/500', '/_not-found'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://aviatorstrainingcentre.com/server-sitemap.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/404', '/500', '/_not-found'],
      },
    ],
  },
  // Add transform function to customize each URL entry
  transform: async (config, path) => {
    // Custom priority for specific pages
    let priority = config.priority;
    if (path === '/') {
      priority = 1.0;
    } else if (path === '/courses') {
      priority = 0.9;
    } else if (path === '/about' || path === '/contact') {
      priority = 0.8;
    }

    // Return the sitemap entry
    return {
      loc: new URL(path, config.siteUrl).href,
      changefreq: config.changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [
        {
          href: new URL(path, config.siteUrl).href,
          hreflang: 'en',
        },
      ],
    };
  },
};

export default config;