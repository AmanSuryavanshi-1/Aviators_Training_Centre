/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://www.aviatorstrainingcentre.in',
  generateRobotsTxt: true, // Generate robots.txt file
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/404', '/500', '/_not-found', '/api/*'],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://www.aviatorstrainingcentre.in/server-sitemap.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/404', '/500', '/_not-found', '/api/*', '/admin/*'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/404', '/500', '/_not-found', '/api/*', '/admin/*'],
      },
    ],
  },
  // Add transform function to customize each URL entry
  transform: async (config, path) => {
    // Custom priority and changefreq for specific pages
    let priority = config.priority;
    let changefreq = config.changefreq;
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/courses') {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path === '/instructors') {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path === '/about' || path === '/contact') {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path === '/faq') {
      priority = 0.7;
      changefreq = 'weekly';
    }

    // Return the sitemap entry
    return {
      loc: new URL(path, config.siteUrl).href,
      changefreq,
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