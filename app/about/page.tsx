import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, Cpu, Layers, Lock, Zap } from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS_REGISTRY } from '@/lib/tools-registry';
import { AppIconTile } from '@/components/tool-ui/AppIconTile';

export const metadata: Metadata = {
  title: 'من نحن | منصة مِنْجَز للأدوات الرقمية',
  description:
    'تعرف على منصة مِنْجَز، المكتبة العربية الشاملة التي تجمع 39 أداة رقمية مجانية لمعالجة ملفات PDF والصور والمستندات مباشرة داخل متصفحك بخصوصية تامة.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'من نحن | منصة مِنْجَز',
    description:
      'رؤية منصة مِنْجَز في توفير أدوات رقمية عربية سريعة وآمنة لمعالجة الملفات دون تثبيت برامج.',
    type: 'website',
    locale: 'ar_AR',
  },
};

export default function AboutPage() {
  const localCount = TOOLS_REGISTRY.filter((t) => t.processingMode === 'local').length;

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
        name: 'من نحن',
        item: '/about',
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          الرئيسية
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-semibold text-slate-900">من نحن</span>
      </nav>

      <header className="border-b border-slate-200 pb-8">
        <p className="text-sm font-semibold text-blue-700">عن المنصة</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl [text-wrap:balance]">
          منصة مِنْجَز — وجهتك المتكاملة لإنجاز المهام الرقمية اليومية
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
          انطلقت منصة <strong>مِنْجَز</strong> لتكون بديلاً عربياً احترافياً وموثوقاً يجمع أهم الأدوات الرقمية في مكان واحد منظم وسريع، بحيث يتمكن الطالب والموظف وصانع المحتوى والمطور من معالجة ملفات PDF والصور والمستندات خلال ثوانٍ دون التنقل بين عشرات المواقع المشتتة أو تثبيت برامج ثقيلة.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
          <div className="bg-white p-5">
            <div className="font-mono text-2xl font-bold tabular-nums text-slate-950">
              {TOOLS_REGISTRY.length}
            </div>
            <div className="mt-1 text-xs text-slate-600">أداة رقمية جاهزة</div>
          </div>
          <div className="bg-white p-5">
            <div className="font-mono text-2xl font-bold tabular-nums text-slate-950">
              {TOOL_CATEGORIES.length}
            </div>
            <div className="mt-1 text-xs text-slate-600">أقسام متخصصة</div>
          </div>
          <div className="bg-white p-5">
            <div className="font-mono text-2xl font-bold tabular-nums text-emerald-700">
              {localCount}
            </div>
            <div className="mt-1 text-xs text-slate-600">أداة تعمل محلياً بالمتصفح</div>
          </div>
          <div className="bg-white p-5">
            <div className="font-mono text-2xl font-bold tabular-nums text-blue-700">100%</div>
            <div className="mt-1 text-xs text-slate-600">مجانية دون تسجيل</div>
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">الخصوصية أولاً في البنية التقنية</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            نعتمد في تصميم المنصة على تنفيذ معظم العمليات مباشرة داخل ذاكرة متصفح المستخدم باستخدام تقنيات الويب الحديثة، فلا تغادر ملفاتك الحساسة جهازك في أدوات PDF والصور والملفات النصية والأرشيفات.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">نتائج فعلية ومعاينة فورية</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            كل أداة في مِنْجَز مصممة لتقديم معالجة حقيقية وسريعة مع معاينة واضحة قبل التنزيل، ودعم المعالجة الجماعية للملفات كلما أمكن لتوفير وقتك في المهام المتكررة.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Cpu className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">دعم عميق للغة العربية</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            نراعي خصائص اللغة العربية واتجاه RTL في تنسيق المستندات، والعلامات المائية داخل PDF والصور، وتحويل جداول CSV المتوافقة مع Excel، وتنظيف النصوص والتشكيل، والتعرف الضوئي على النصوص.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">أداء خفيف على كل الأجهزة</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            يتم تحميل محرك كل أداة عند فتح صفحتها فقط، مما يجعل المنصة سريعة الاستجابة على أجهزة الحاسوب والأجهزة اللوحية والهواتف الذكية دون استهلاك غير مبرر للبيانات.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-bold text-slate-950">الأقسام الأربعة داخل المنصة</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TOOL_CATEGORIES.map((cat) => {
            const count = TOOLS_REGISTRY.filter((t) => t.category === cat.id).length;
            const repIcon =
              cat.id === 'pdf'
                ? 'Layers'
                : cat.id === 'images'
                  ? 'Image'
                  : cat.id === 'files'
                    ? 'FolderArchive'
                    : 'QrCode';
            return (
              <Link
                key={cat.id}
                href={`/#${cat.anchorId}`}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-700"
              >
                <AppIconTile iconName={repIcon} category={cat.id} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-blue-700">
                      {cat.label}
                    </h3>
                    <span className="font-mono text-xs tabular-nums text-slate-500">
                      {count} أداة
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-950">هل لديك اقتراح لأداة جديدة؟</h2>
          <p className="mt-1 text-sm text-slate-600">
            يسعدنا سماع ملاحظاتك واقتراحاتك لتطوير أدوات جديدة تلبي احتياجاتك اليومية.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <span>تواصل معنا</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/#catalog"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            تصفح الأدوات
          </Link>
        </div>
      </div>
    </div>
  );
}
