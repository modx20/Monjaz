import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | منصة مِنْجَز',
  description:
    'تعرف على كيفية حماية خصوصيتك وملفاتك في منصة مِنْجَز، وآلية المعالجة المحلية في المتصفح والمعالجة المؤقتة لأداة OCR واستخدام إحصائيات الموقع.',
  alternates: {
    canonical: toAbsoluteUrl('/privacy'),
  },
  openGraph: {
    title: 'سياسة الخصوصية | منصة مِنْجَز',
    description:
      'تفاصيل حماية البيانات والملفات وشفافية المعالجة في منصة مِنْجَز للأدوات الرقمية.',
    type: 'website',
    locale: 'ar_AR',
  },
};

export default function PrivacyPage() {
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
        name: 'سياسة الخصوصية',
        item: toAbsoluteUrl('/privacy'),
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
        <span className="font-semibold text-slate-900">سياسة الخصوصية</span>
      </nav>

      <header className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>الالتزام بالخصوصية وحماية البيانات</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
          سياسة الخصوصية
        </h1>
        <p className="mt-2 text-sm text-slate-500">آخر تحديث: نوفمبر 2026</p>
      </header>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700 sm:text-base">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">01. المعالجة المحلية للملفات داخل المتصفح</h2>
          <p className="mt-2">
            صُممت الغالبية العظمى من أدوات منصة <strong>مِنْجَز</strong> (38 أداة من أصل 39 أداة، وتشمل دمج وتقسيم وضغط وتشفير PDF، وتحويل وتعديل الصور، وضغط وفك ضغط ZIP، وأدوات النصوص وكلمات المرور والباركود) لتعمل بالكامل على جهازك داخل ذاكرة المتصفح. لا يتم رفع ملفاتك أو نصوصك أو صورك في هذه الأدوات إلى خوادمنا أو أي طرف ثالث.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">02. المعالجة السحابية المؤقتة (أداة OCR فقط)</h2>
          <p className="mt-2">
            عند استخدامك لأداة <strong>التعرف الضوئي على النصوص (OCR)</strong> لاستخراج النصوص من الصور أو ملفات PDF المصورة، يتم إرسال الصورة أو الصفحة المحددة عبر اتصال مشفّر (HTTPS) لغرض قراءة النص وإرجاعه إلى متصفحك فوراً. نلتزم بالآتي:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pr-5 text-slate-600">
            <li>نُظهر تنبيهاً صريحاً ومباشراً في واجهة الأداة قبل بدء الرفع.</li>
            <li>لا نقوم بتخزين أو أرشفة الملفات أو النصوص المستخرجة في قواعد بيانات دائمة.</li>
            <li>تُحذف بيانات المعالجة المؤقتة فور انتهاء الاستجابة وعرض النتيجة لك.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">03. تحليلات الزيارات وملفات تعريف الارتباط</h2>
          <p className="mt-2">
            نستخدم أدوات القياس التحليلية من Google (Google Tag / Google Analytics) لقياس مؤشرات الاستخدام العامة مثل عدد الزيارات والصفحات الأكثر فائدة وتحسين سرعة المنصة وتجربة المستخدم. لا تطلع هذه الإحصائيات على محتوى ملفاتك التي تعالجها محلياً داخل المتصفح بأي حال من الأحوال.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">04. الأمان والتواصل معنا</h2>
          <p className="mt-2">
            يمكنك استخدام جميع أدوات المنصة دون إنشاء حساب أو تقديم بيانات شخصية. وإذا تواصلت معنا عبر صفحة{' '}
            <Link href="/contact" className="font-semibold text-blue-700 hover:underline">
              اتصل بنا
            </Link>
            ، فإننا نستخدم المعلومات المرسلة فقط للرد على استفسارك أو معالجة ملاحظتك التقنية.
          </p>
        </section>
      </div>
    </div>
  );
}
