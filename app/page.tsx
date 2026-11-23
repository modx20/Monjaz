import type { Metadata } from 'next';
import HomeCatalog from '@/components/HomeCatalog';
import { TOOLS_REGISTRY } from '@/lib/tools-registry';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolved = await searchParams;
  const initialQuery = typeof resolved?.q === 'string' ? resolved.q : '';

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'دليل أدوات منصة مِنْجَز الرقمية',
    numberOfItems: TOOLS_REGISTRY.length,
    itemListElement: TOOLS_REGISTRY.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.title,
      description: tool.shortDesc,
      url: `/tools/${tool.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <HomeCatalog initialQuery={initialQuery} />
    </>
  );
}
