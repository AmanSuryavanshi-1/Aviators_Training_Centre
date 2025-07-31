import { Metadata } from 'next';
import MarketingPromotionDashboard from "@/components/features/admin/MarketingPromotionDashboard";

export const metadata: Metadata = {
  title: 'Marketing & Promotion Dashboard | Admin',
  description: 'Manage SEO campaigns, social media promotion, email marketing, and internal linking strategies for blog content.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MarketingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <MarketingPromotionDashboard />
    </div>
  );
}
