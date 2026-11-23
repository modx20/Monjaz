import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | منصة مِنْجَز',
  description:
    'الشروط والأحكام المنظمة لاستخدام الأدوات الرقمية المجانية في منصة مِنْجَز، وحقوق الملكية الفكرية، وضوابط الاستخدام العادل.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'شروط الاستخدام | منصة مِنْجَز',
    description: 'شروط وأحكام استخدام أدوات منصة مِنْجَز الرقمية.',
    type: 'website',
    locale: 'ar_AR',
  },
};

export default function TermsPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'شروط الاستخدام',
        item: '/terms',
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
        <span className="font-semibold text-slate-900">شروط الاستخدام</span>
      </nav>

      <header className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          <FileText className="h-4 w-4" aria-hidden="true" />
          <span>الأحكام والضوابط</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
          شروط الاستخدام
        </h1>
        <p className="mt-2 text-sm text-slate-500">آخر تحديث: نوفمبر 2026</p>
      </header>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700 sm:text-base">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">01. القبول والاستخدام المجاني</h2>
          <p className="mt-2">
            باستخدامك لمنصة <strong>مِنْجَز</strong> وأي من أدواتها الرقمية، فإنك توافق على الالتزام بهذه الشروط. تُقدَّم جميع الأدوات للاستخدام الشخصي والتعليمي والتجاري المشروع مجاناً ودون اشتراك.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">02. ملكية الملفات والمحتوى</h2>
          <p className="mt-2">
            تحتفظ بصفتك مستخدماً بكامل حقوق الملكية الفكرية والقانونية لأي ملفات أو صور أو مستندات تقوم بمعالجتها عبر المنصة. لا تدعي منصة مِنْجَز أي حقوق على ملفاتك، ولا تطلع على محتوى الملفات المعالجة محلياً داخل متصفحك.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">03. الاستخدام المشروع والحدود التقنية</h2>
          <ul className="mt-2 list-disc space-y-1.5 pr-5 text-slate-600">
            <li>يُحظر استخدام المنصة في معالجة مواد مخالفة للقوانين أو انتهاك حقوق الغير.</li>
            <li>يُمنع إرسال طلبات آلية مفرطة أو محاولات تعطيل واجهة أداة OCR أو إرهاق الخادم.</li>
            <li>تخضع أحجام الملفات في المعالجة المحلية لقدرات ذاكرة المتصفح وجهاز المستخدم لضمان استقرار الأداء.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">04. إخلاء المسؤولية</h2>
          <p className="mt-2">
            نعمل باستمرار على تحسين دقة وجودة جميع الأدوات، وتُقدَّم الخدمات «كما هي» دون ضمانات صريحة أو ضمنية بملاءمتها لجميع حالات الملفات المعقدة أو التالفة. يُنصح دائماً بالاحتفاظ بنسخة احتياطية من مستنداتك الأصلية المهمة قبل إجراء التعديلات.
          </p>
        </section>
      </div>
    </div>
  );
}
