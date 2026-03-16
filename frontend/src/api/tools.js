/**
 * Tools API Service
 * Handles all AI tool-related API calls
 */

import { post } from './client';

/**
 * Generate social media captions
 * @param {object} data - { topic, platform, tone, keywords }
 * @returns {Promise<object>} - { captions: string }
 */
export const generateCaption = async (data) => {
  return await post('/caption/generate', {
    topic: data.topic,
    platform: data.platform,
    tone: data.tone,                       
    keywords: data.keywords || null,
  });
};

/**
 * Generate hashtags
 * @param {object} data - { topic, platform, account_size, audience }
 * @returns {Promise<object>} - { hashtags: string }
 */
export const generateHashtags = async (data) => {
  return await post('/hashtag/generate', {
    topic: data.topic,
    platform: data.platform,
    account_size: data.accountSize,
    audience: data.audience || null,
  });
};

/**
 * Generate content ideas
 * @param {object} data - { niche, platforms, audience, goal }
 * @returns {Promise<object>} - { content_ideas: string }
 */
export const generateContentIdeas = async (data) => {
  return await post('/content-ideas/generate', {
    niche: data.niche,
    platforms: data.platforms,
    audience: data.audience,
    goal: data.goal,
  });
};

/**
 * Generate blog topics and SEO keywords
 * @param {object} data - { niche, audience, goal, themes }
 * @returns {Promise<object>} - { blog_topics: string }
 */
export const generateBlogTopics = async (data) => {
  return await post('/blog-seo/generate', {
    niche: data.niche,
    audience: data.audience,
    goal: data.goal,
    themes: data.themes || null,
  });
};

/**
 * Generate email replies
 * @param {object} data - { email_content, tone, goal, points, urgency }
 * @returns {Promise<object>} - { email_replies: string }
 */
export const generateEmailReply = async (data) => {
  return await post('/email-reply/generate', {
    email_content: data.emailContent,
    tone: data.tone,
    goal: data.goal,
    points: data.points || null,
    urgency: data.urgency || null,
  });
};

/**
 * Generate 30-day content calendar (Premium)
 * @param {object} data - { business_niche, goal, tone, platforms[], target_audience?, month?, business_website?, linkedin_url?, instagram_url? }
 * @returns {Promise<object>} - { pdf_downloadable, excel_downloadable, remaining }
 */
export const generate30DayCalendar = async (data) => {
  return await post('/paid/social-calendar/generate', {
    business_niche: data.business_niche,
    goal: data.goal,
    tone: data.tone,
    platforms: data.platforms,
    target_audience: data.target_audience || null,
    month: data.month || null,
    business_website: data.business_website || null,
    linkedin_url: data.linkedin_url || null,
    instagram_url: data.instagram_url || null,
  });
};

/**
 * Generate product description (Premium)
 * @param {object} data - { product_name, product_category, key_features[], target_audience, tone, brand_name?, price_range?, seo_keywords?, product_images? }
 * @returns {Promise<object>} - { product_name, short_description, long_description, seo_title, seo_meta_description, suggested_keywords, remaining }
 */
export const generateProductDescription = async (data) => {
  return await post('/paid/product-description/generate', {
    product_name: data.product_name,
    product_category: data.product_category,
    key_features: data.key_features,
    target_audience: data.target_audience,
    tone: data.tone,
    brand_name: data.brand_name || null,
    price_range: data.price_range || null,
    seo_keywords: data.seo_keywords || null,
    product_images: data.product_images || null,
  });
};

export default {
  generateCaption,
  generateHashtags,
  generateContentIdeas,
  generateBlogTopics,
  generateEmailReply,
  generate30DayCalendar,
  generateProductDescription,
};

