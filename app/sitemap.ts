import type { MetadataRoute } from 'next';
import { TOOLS_REGISTRY } from '@/lib/tools-registry';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL
    ? process.env.APP_URL.startsWith('http')
      ? process.env.APP_URL
      : `https://${process.env.APP_URL}`
    : 'https://monjez.tools';

  const toolEntries: MetadataRoute.Sitemap = TOOLS_REGISTRY.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: tool.popular ? 0.9 : 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...toolEntries,
  ];
}
