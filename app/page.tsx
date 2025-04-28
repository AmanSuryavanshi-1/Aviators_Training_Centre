// This will be the new entry point for the home page.
// We need to migrate the content from src/pages/Index.tsx here.
"use client"; // Mark as Client Component because IndexPageContent likely uses hooks

import IndexPageContent from "@/pages/Index"; // Assuming Index page component is in src/pages/Index.tsx

export default function Home() {
  // Render the existing Index page component.
  return <IndexPageContent />;
}
