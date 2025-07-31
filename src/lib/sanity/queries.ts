// Blog post queries with enhanced schema support
export const POSTS_QUERY = `*[
  _type == "post" 
  && defined(slug.current)
  && publishedAt <= now()
] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  image {
    asset-> {
      _id,
      url
    },
    alt
  },
  category-> {
    title,
    slug,
    color
  },
  tags[]-> {
    title,
    slug,
    color
  },
  author-> {
    name,
    slug,
    image {
      asset-> {
        _id,
        url
      },
      alt
    }
  },
  publishedAt,
  readingTime,
  wordCount,
  featured,
  featuredOnHome,
  seoTitle,
  seoDescription,
  focusKeyword
}`;

export const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  image {
    asset-> {
      _id,
      url
    },
    alt
  },
  category-> {
    title,
    slug,
    color
  },
  tags[]-> {
    title,
    slug,
    color,
    category
  },
  author-> {
    name,
    slug,
    bio,
    image {
      asset-> {
        _id,
        url
      },
      alt
    },
    socialMedia
  },
  body,
  publishedAt,
  readingTime,
  wordCount,
  ctaPositions,
  ctaPlacements,
  intelligentCTARouting,
  seoTitle,
  seoDescription,
  focusKeyword,
  additionalKeywords,
  openGraphImage {
    asset-> {
      _id,
      url
    },
    alt
  },
  structuredData
}`;

export const FEATURED_POSTS_QUERY = `*[
  _type == "post" 
  && featuredOnHome == true 
  && publishedAt <= now()
] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  excerpt,
  image {
    asset-> {
      _id,
      url
    },
    alt
  },
  category-> {
    title,
    slug,
    color
  },
  tags[]-> {
    title,
    slug,
    color
  },
  author-> {
    name,
    slug
  },
  publishedAt,
  readingTime
}`;

// Additional queries for enhanced functionality
export const POSTS_BY_CATEGORY_QUERY = `*[
  _type == "post" 
  && defined(slug.current)
  && publishedAt <= now()
  && category._ref == $categoryId
] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  image {
    asset-> {
      _id,
      url
    },
    alt
  },
  category-> {
    title,
    slug,
    color
  },
  tags[]-> {
    title,
    slug,
    color
  },
  publishedAt,
  readingTime
}`;

export const POSTS_BY_TAG_QUERY = `*[
  _type == "post" 
  && defined(slug.current)
  && publishedAt <= now()
  && $tagId in tags[]._ref
] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  image {
    asset-> {
      _id,
      url
    },
    alt
  },
  category-> {
    title,
    slug,
    color
  },
  tags[]-> {
    title,
    slug,
    color
  },
  publishedAt,
  readingTime
}`;

export const RELATED_POSTS_QUERY = `*[
  _type == "post" 
  && defined(slug.current)
  && publishedAt <= now()
  && _id != $currentPostId
  && (
    category._ref == $categoryId ||
    count((tags[]._ref)[@ in $tagIds]) > 0
  )
] | order(publishedAt desc)[0...4] {
  _id,
  title,
  slug,
  excerpt,
  image {
    asset-> {
      _id,
      url
    },
    alt
  },
  category-> {
    title,
    slug,
    color
  },
  publishedAt,
  readingTime
}`;

export const POST_SLUGS_QUERY = `*[_type == "post" && defined(slug.current)] {
  slug
}`;

// Category and tag queries
export const CATEGORIES_QUERY = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  slug,
  description,
  color,
  "postCount": count(*[_type == "post" && category._ref == ^._id])
}`;

export const TAGS_QUERY = `*[_type == "tag" && isActive == true] | order(title asc) {
  _id,
  title,
  slug,
  description,
  color,
  category,
  "postCount": count(*[_type == "post" && ^._id in tags[]._ref])
}`;

// Author queries
export const AUTHORS_QUERY = `*[_type == "author" && status == "active"] | order(name asc) {
  _id,
  name,
  slug,
  bio,
  image {
    asset-> {
      _id,
      url
    },
    alt
  },
  role,
  socialMedia,
  "postCount": count(*[_type == "post" && author._ref == ^._id])
}`;

export const AUTHOR_QUERY = `*[_type == "author" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  bio,
  image {
    asset-> {
      _id,
      url
    },
    alt
  },
  role,
  credentials,
  experience,
  socialMedia,
  "posts": *[_type == "post" && author._ref == ^._id && publishedAt <= now()] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    readingTime,
    category-> {
      title,
      slug,
      color
    }
  }
}`;
