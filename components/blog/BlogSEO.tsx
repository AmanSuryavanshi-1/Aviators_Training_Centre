import { Metadata } from 'next';
import { BlogPost } from '@/lib/types/blog';
import { getOptimizedImageUrl } from '@/lib/blog/utils';

interface BlogSEOProps {
  post: BlogPost;
  baseUrl: string;
}

export function generateBlogPostMetadata({ post, baseUrl }: BlogSEOProps): Metadata {
  const seoTitle = post.seoEnhancement?.seoTitle || `${post.title} | Aviators Training Centre`;
  const seoDescription = post.seoEnhancement?.seoDescription || post.excerpt;
  const canonicalUrl = post.seoEnhancement?.canonicalUrl || 
    `https://aviatorstrainingcentre.com/blog/${post.slug.current}`;
  
  const ogImage = post.seoEnhancement?.openGraphImage 
    ? getOptimizedImageUrl(post.seoEnhancement.openGraphImage, { width: 1200, height: 630, format: 'jpg' })
    : getOptimizedImageUrl(post.image, { width: 1200, height: 630, format: 'jpg' });

  // Generate structured data for educational content
  const structuredData = {
    "@context": "https://schema.org",
    "@type": post.seoEnhancement?.structuredData?.articleType || "EducationalArticle",
    "headline": post.title,
    "description": seoDescription,
    "image": [ogImage],
    "datePublished": post.publishedAt,
    "dateModified": post.lastModified || post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role || "Aviation Instructor",
      "worksFor": {
        "@type": "Organization",
        "name": "Aviators Training Centre"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Aviators Training Centre",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aviatorstrainingcentre.com/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png",
        "width": 300,
        "height": 100
      },
      "url": "https://aviatorstrainingcentre.com",
      "sameAs": [
        "https://www.facebook.com/aviatorstrainingcentre",
        "https://www.instagram.com/aviatorstrainingcentre",
        "https://www.linkedin.com/company/aviators-training-centre"
      ]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "keywords": [
      post.seoEnhancement?.focusKeyword,
      ...(post.seoEnhancement?.additionalKeywords || []),
      ...(post.tags || [])
    ].filter(Boolean).join(', '),
    "educationalLevel": post.seoEnhancement?.structuredData?.educationalLevel || post.difficulty,
    "learningResourceType": post.seoEnhancement?.structuredData?.learningResourceType || "Article",
    "timeRequired": post.seoEnhancement?.structuredData?.timeRequired || `PT${post.readingTime}M`,
    "about": {
      "@type": "Thing",
      "name": "Aviation Training",
      "description": "Professional aviation training and education"
    },
    "teaches": post.seoEnhancement?.structuredData?.learningOutcomes || [
      "Aviation knowledge and skills",
      "Professional pilot training",
      "Aviation safety and regulations"
    ]
  };

  // Organization structured data for authority
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Aviators Training Centre",
    "alternateName": "ATC",
    "url": "https://aviatorstrainingcentre.com",
    "logo": "https://aviatorstrainingcentre.com/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png",
    "description": "Leading aviation training institute providing comprehensive pilot training, DGCA exam preparation, and professional aviation education in India.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-XXXXXXXXXX",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.facebook.com/aviatorstrainingcentre",
      "https://www.instagram.com/aviatorstrainingcentre",
      "https://www.linkedin.com/company/aviators-training-centre"
    ],
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "DGCA Approved Training Organization",
      "credentialCategory": "Aviation Training Certification"
    }
  };

  const keywords = [
    post.seoEnhancement?.focusKeyword,
    ...(post.seoEnhancement?.additionalKeywords || []),
    ...(post.tags || []),
    'aviation training',
    'pilot training',
    'DGCA exam',
    'commercial pilot license'
  ].filter(Boolean).join(', ');

  return {
    title: seoTitle,
    description: seoDescription,
    keywords,
    authors: [{ name: post.author.name }],
    creator: post.author.name,
    publisher: 'Aviators Training Centre',
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      siteName: 'Aviators Training Centre',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.publishedAt,
      modifiedTime: post.lastModified || post.publishedAt,
      authors: [post.author.name],
      section: post.category.title,
      tags: post.tags,
    },
    twitter: {
      card: (post.seoEnhancement?.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
      site: '@aviatorstrainingcentre',
      creator: '@aviatorstrainingcentre',
    },
    other: {
      'educational-level': post.difficulty || 'intermediate',
      'content-type': post.contentType || 'guide',
      'reading-time': `${post.readingTime} minutes`,
      'article:author': post.author.name,
      'article:publisher': 'Aviators Training Centre',
      'article:section': post.category.title,
      ...(post.seoEnhancement?.additionalMetaTags?.reduce((acc, tag) => {
        acc[tag.name] = tag.content;
        return acc;
      }, {} as Record<string, string>) || {}),
    },
  };
}

// Component for client-side structured data injection
export function BlogSEOEnhancements({ post, baseUrl }: BlogSEOProps) {
  const canonicalUrl = post.seoEnhancement?.canonicalUrl || 
    `${baseUrl}/blog/${post.slug.current}`;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": post.seoEnhancement?.structuredData?.articleType || "EducationalArticle",
    "headline": post.title,
    "description": post.seoEnhancement?.seoDescription || post.excerpt,
    "image": [getOptimizedImageUrl(post.image, { width: 1200, height: 630, format: 'jpg' })],
    "datePublished": post.publishedAt,
    "dateModified": post.lastModified || post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role || "Aviation Instructor",
      "worksFor": {
        "@type": "Organization",
        "name": "Aviators Training Centre"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Aviators Training Centre",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png`,
        "width": 300,
        "height": 100
      },
      "url": baseUrl,
      "sameAs": [
        "https://www.facebook.com/aviatorstrainingcentre",
        "https://www.instagram.com/aviatorstrainingcentre",
        "https://www.linkedin.com/company/aviators-training-centre"
      ]
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "keywords": [
      post.seoEnhancement?.focusKeyword,
      ...(post.seoEnhancement?.additionalKeywords || []),
      ...(post.tags || [])
    ].filter(Boolean).join(', '),
    "educationalLevel": post.seoEnhancement?.structuredData?.educationalLevel || post.difficulty,
    "learningResourceType": post.seoEnhancement?.structuredData?.learningResourceType || "Article",
    "timeRequired": post.seoEnhancement?.structuredData?.timeRequired || `PT${post.readingTime}M`,
    "about": {
      "@type": "Thing",
      "name": "Aviation Training",
      "description": "Professional aviation training and education"
    },
    "teaches": post.seoEnhancement?.structuredData?.learningOutcomes || [
      "Aviation knowledge and skills",
      "Professional pilot training",
      "Aviation safety and regulations"
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Aviators Training Centre",
    "alternateName": "ATC",
    "url": baseUrl,
    "logo": `${baseUrl}/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png`,
    "description": "Leading aviation training institute providing comprehensive pilot training, DGCA exam preparation, and professional aviation education in India.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://www.facebook.com/aviatorstrainingcentre",
      "https://www.instagram.com/aviatorstrainingcentre",
      "https://www.linkedin.com/company/aviators-training-centre"
    ],
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "DGCA Approved Training Organization",
      "credentialCategory": "Aviation Training Certification"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData, null, 2)
        }}
      />
    </>
  );
}