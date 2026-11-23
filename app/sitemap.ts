import type { MetadataRoute } from 'next';
import { TOOLS_REGISTRY } from '@/lib/tools-registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL
    ? process.env.APP_URL.startsWith('http')
      ? process.env.APP_URL
      : `https://${process.env.APP_URL}`
    : 'https://monjez.tools';

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const toolEntries: MetadataRoute.Sitemap = TOOLS_REGISTRY.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: tool.popular ? 0.9 : 0.85,
  }));

  return [...staticPages, ...toolEntries];
}
