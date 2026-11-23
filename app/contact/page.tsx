import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Mail, MessageSquare } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { toAbsoluteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'اتصل بنا | منصة مِنْجَز',
  description:
    'تواصل مع فريق منصة مِنْجَز لاقتراح أدوات رقمية جديدة أو الإبلاغ عن أي ملاحظة تقنية أو استفسار عام.',
  alternates: {
    canonical: toAbsoluteUrl('/contact'),
  },
  openGraph: {
    title: 'اتصل بنا | منصة مِنْجَز',
    description: 'نموذج التواصل المباشر مع فريق منصة مِنْجَز للأدوات الرقمية.',
    type: 'website',
    locale: 'ar_AR',
  },
};

export default function ContactPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: toAbsoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'اتصل بنا',
        item: toAbsoluteUrl('/contact'),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          الرئيسية
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-semibold text-slate-900">اتصل بنا</span>
      </nav>

      <header className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span>الدعم والمقترحات</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">اتصل بنا</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          هل تواجه مشكلة في ملف معين أو تود اقتراح أداة رقمية جديدة لإضافتها إلى مكتبة مِنْجَز؟ يسعدنا استقبال رسالتك.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-base font-bold text-slate-950">روابط مفيدة قبل المراسلة</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              يمكنك مراجعة تفاصيل آلية عمل الأدوات وحماية الملفات في الصفحات المخصصة:
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="font-medium text-blue-700 hover:underline">
                  من نحن وآلية عمل المنصة
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="font-medium text-blue-700 hover:underline">
                  سياسة الخصوصية وحماية الملفات
                </Link>
              </li>
              <li>
                <Link href="/terms" className="font-medium text-blue-700 hover:underline">
                  شروط الاستخدام
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
