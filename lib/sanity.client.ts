import { createClient, type ClientConfig } from "@sanity/client";
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = "2024-07-01"; // Use a recent API version

if (!projectId || !dataset) {
  throw new Error("Missing Sanity project ID or dataset. Check your .env.local file.");
}

const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production", // Use CDN in production
  // token: process.env.NEXT_PUBLIC_SANITY_API_READ_TOKEN, // Uncomment if using a read token
};

export const sanityClient = createClient(config);

// Helper function for generating image URLs with only essential typing
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
