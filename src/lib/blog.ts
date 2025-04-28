// src/lib/blog.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the structure of your frontmatter
export interface PostFrontmatter {
  title: string;
  date: string; // Keep as string initially, parse later
  description: string;
  image?: string; // Optional image path (relative to /public)
  tags?: string[]; // Optional array of tags
}

// Define the structure of a full post, including the slug and content
export interface Post extends PostFrontmatter {
  slug: string;
  content: string; // Markdown content
}

const postsDirectory = path.join(process.cwd(), 'content/blog');
console.log(`[Blog Lib] Resolved posts directory: ${postsDirectory}`); // Log directory path

export async function getPostSlugs(): Promise<string[]> {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    console.log(`[Blog Lib] Files found in ${postsDirectory}:`, fileNames); // Log files found
    const mdFiles = fileNames.filter((fileName) => fileName.endsWith('.md'));
    console.log(`[Blog Lib] Filtered Markdown files:`, mdFiles);
    const slugs = mdFiles.map((fileName) => fileName.replace(/\.md$/, ''));
    console.log(`[Blog Lib] Generated slugs:`, slugs);
    return slugs;
  } catch (error) {
    console.error("[Blog Lib] Error reading blog directory:", postsDirectory, error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  console.log(`[Blog Lib] Attempting to read: ${fullPath}`); // Log file path being read
  try {
    if (!fs.existsSync(fullPath)) {
      console.warn(`[Blog Lib] Post file not found: ${fullPath}`);
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);
    console.log(`[Blog Lib] Parsed frontmatter for ${slug}:`, data);

    // Validate frontmatter
    if (!data.title) {
        console.warn(`[Blog Lib] Missing 'title' in ${slug}.md`);
        return null;
    }
    if (!data.date) {
        console.warn(`[Blog Lib] Missing 'date' in ${slug}.md`);
        return null;
    }
     if (!data.description) {
        console.warn(`[Blog Lib] Missing 'description' in ${slug}.md`);
        return null;
    }

    const frontmatter = data as PostFrontmatter;

    return {
      slug,
      ...frontmatter,
      content,
    };
  } catch (error) {
    console.error(`[Blog Lib] Error reading or parsing post ${slug} at ${fullPath}:`, error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  console.log("[Blog Lib] Getting all posts...");
  const slugs = await getPostSlugs();
  if (slugs.length === 0) {
      console.warn("[Blog Lib] No slugs found, returning empty posts array.");
      return [];
  }
  const postsPromises = slugs.map(slug => getPostBySlug(slug));
  const postsResults = await Promise.all(postsPromises);
  console.log("[Blog Lib] Results from getPostBySlug promises:", postsResults);

  const posts = postsResults.filter((post): post is Post => post !== null);
  console.log(`[Blog Lib] Filtered valid posts (count: ${posts.length}):`, posts);

  if (posts.length > 0) {
    // Sort posts by date in descending order
    posts.sort((post1, post2) => (new Date(post1.date) < new Date(post2.date) ? 1 : -1)); // Corrected sort: recent first
    console.log("[Blog Lib] Posts sorted by date.");
  }

  return posts;
}
