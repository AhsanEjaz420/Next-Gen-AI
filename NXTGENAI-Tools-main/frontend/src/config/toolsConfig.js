import {
  MessageSquare,
  Hash,
  Lightbulb,
  FileText,
  Mail,
  CalendarDays,
  Package,
  History,
  Settings,
  BarChart3
} from 'lucide-react';

export const TOOLS_CONFIG = {
  history: {
    id: 'history',
    title: 'Content History',
    icon: History,
    description: 'View your previous generations',
  },

  settings: {
    id: 'settings',
    title: 'Account Settings',
    icon: Settings,
    description: 'Manage your brand profile',
  },

  insights: {
    id: 'insights',
    title: 'Usage Insights',
    icon: BarChart3,
    description: 'Track your generation activity',
  },
  
  caption: {
    id: 'caption',
    title: 'Social Media Caption Generator',
    icon: MessageSquare,
    description: 'Generate engaging captions for any platform',
    platforms: ['Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)'],
    tones: ['Neutral', 'Casual', 'Professional', 'Energetic', 'Inspirational']
  },

  hashtag: {
    id: 'hashtag',
    title: 'Hashtag Generator',
    icon: Hash,
    description: 'Discover viral and niche hashtags',
    platforms: ['Instagram', 'TikTok', 'LinkedIn', 'X (Twitter)']
  },

  ideas: {
    id: 'ideas',
    title: 'Content Ideas Generator',
    icon: Lightbulb,
    description: 'Never run out of content ideas',
    platforms: ['Instagram', 'YouTube', 'LinkedIn', 'TikTok', 'Blog']
  },

  blog: {
    id: 'blog',
    title: 'Blog Topic & SEO Keywords',
    icon: FileText,
    description: 'SEO-optimized blog topics',
    audienceLevels: ['Beginner', 'Intermediate', 'Advanced', 'Mixed']
  },

  email: {
    id: 'email',
    title: 'Email Reply Assistant',
    icon: Mail,
    description: 'Transform drafts into professional emails',
    tones: ['Formal', 'Friendly', 'Urgent', 'Follow-up']
  },

  calendar30: {
    id: 'calendar30',
    title: '30-Day Content Calendar',
    icon: CalendarDays,
    description: 'Premium: Complete 30-day social calendar',
    isPremium: true,
    platforms: ['Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)', 'TikTok', 'YouTube', 'Multi-Platform'],
    tones: ['Professional', 'Casual', 'Inspirational', 'Educational', 'Entertaining'],
    templates: ['Balanced Mix', 'Educational Focus', 'Engagement Heavy', 'Sales Driven', 'Brand Awareness']
  },

  productDescription: {
    id: 'productDescription',
    title: 'Product Description Generator',
    icon: Package,
    description: 'Premium: Compelling product descriptions with SEO',
    isPremium: true,
    tones: ['Professional and persuasive', 'Casual and friendly', 'Luxury and premium', 'Technical and detailed'],
    categories: ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Food & Beverage', 'Books', 'Furniture']
  }
};