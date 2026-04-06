import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kutiit.vercel.app'

  return [
    // 1. Root Page (from app/(public)/page.tsx)
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // 2. Dictionary Page (from app/(public)/dictionary/page.tsx)
    {
      url: `${baseUrl}/dictionary`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // 3. Contact Page (from app/(public)/contact/page.tsx)
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // 4. Login Page (from app/(auth)/login/page.tsx)
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // NOTE: We usually EXCLUDE /dashboard (admin) from sitemaps 
    // because we don't want Google to try and index private pages.
  ]
}