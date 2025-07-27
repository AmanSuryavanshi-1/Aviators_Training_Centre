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
    slug
  },
  publishedAt,
  readingTime,
  featured
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
    slug
  },
  body,
  publishedAt,
  readingTime,
  seoTitle,
  seoDescription,
  focusKeyword
}`;

export const FEATURED_POSTS_QUERY = `*[
  _type == "post" 
  && featured == true 
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
    slug
  },
  publishedAt,
  readingTime
}`;
