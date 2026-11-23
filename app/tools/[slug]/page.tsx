import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import ToolWorkspaceLoader from '@/components/ToolWorkspaceLoader';
import { ToolIcon } from '@/components/tool-ui/ToolIcon';
import { getRelatedTools, getToolBySlug, TOOLS_REGISTRY } from '@/lib/tools-registry';

export function generateStaticParams() {
  return TOOLS_REGISTRY.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'أداة غير موجودة',
      description: 'لم يتم العثور على الأداة المطلوبة في منصة مِنْجَز.',
    };
  }

  return {
    title: `${tool.title} مجاناً أونلاين`,
    description: tool.longDesc,
    keywords: tool.keywords,
    openGraph: {
      title: `${tool.title} | مِنْجَز`,
      description: tool.shortDesc,
      type: 'website',
      locale: 'ar_AR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.title} | مِنْجَز`,
      description: tool.shortDesc,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const related = getRelatedTools(tool);

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    inLanguage: 'ar',
    description: tool.longDesc,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const faqJsonLd =
    tool.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: tool.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav aria-label="مسار التنقل" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          الرئيسية
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href={`/#${tool.category === 'pdf' ? 'pdf-tools' : tool.category === 'images' ? 'image-tools' : tool.category === 'files' ? 'file-tools' : 'productivity-tools'}`} className="hover:text-slate-900">
          {tool.categoryLabel}
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-semibold text-slate-900">{tool.title}</span>
      </nav>

      {/* Tool Header */}
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-700">
              <ToolIcon name={tool.iconName} className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl [text-wrap:balance]">
                {tool.title}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {tool.shortDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium shrink-0">
            {tool.processingMode === 'local' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>معالجة محلية داخل متصفحك</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                <span>معالجة سحابية مشفرة دون تخزين</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Tool Workspace */}
      <section aria-label="مساحة عمل الأداة" className="mb-14">
        <ToolWorkspaceLoader slug={tool.slug} />
      </section>

      {/* Editorial Guide & FAQs (SEO & User Helpfulness) */}
      <section className="grid gap-8 border-t border-slate-200 pt-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold text-slate-950">عن الأداة وطريقة الاستخدام</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{tool.longDesc}</p>
          <ol className="mt-5 space-y-3 text-sm text-slate-700">
            {tool.howToSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-blue-700 mt-0.5">
                  0{i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {tool.faqs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-950">أسئلة شائعة</h2>
            <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {tool.faqs.map((faq, i) => (
                <div key={i} className="p-4">
                  <h3 className="text-sm font-bold text-slate-900">{faq.question}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Related Tools */}
      {related.length > 0 && (
        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-xl font-bold text-slate-950">أدوات ذات صلة</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/tools/${rel.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-700"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-700">
                      <ToolIcon name={rel.iconName} className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-950 group-hover:text-blue-700">
                      {rel.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">{rel.shortDesc}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{rel.categoryLabel}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                    <span>فتح</span>
                    <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
