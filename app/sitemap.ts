import type { MetadataRoute } from 'next';
import { TOOLS_REGISTRY } from '@/lib/tools-registry';
import { getSiteUrl, toAbsoluteUrl } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: toAbsoluteUrl('/about'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: toAbsoluteUrl('/privacy'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl('/terms'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: toAbsoluteUrl('/contact'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const toolEntries: MetadataRoute.Sitemap = TOOLS_REGISTRY.map((tool) => ({
    url: toAbsoluteUrl(`/tools/${tool.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: tool.popular ? 0.9 : 0.85,
  }));

  return [...staticPages, ...toolEntries];
}
