/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      // Add the following lines if they're not already present.
      // it may be already present in file.
      // add it if its not.
      ppr: true, // this is for partial pre rendering
    },
      // the below two are optional they will collect more data and give more insights
    speedInsights: true,
    webVitals: true,
  };

export default nextConfig;
