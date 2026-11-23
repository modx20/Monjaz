'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, X } from 'lucide-react';
import {
  TOOL_CATEGORIES,
  ToolCategoryId,
  ToolDefinition,
  TOOLS_REGISTRY,
} from '@/lib/tools-registry';
import { searchAndFilterTools } from '@/lib/tools-search';
import { ToolIcon } from './tool-ui/ToolIcon';

function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors duration-150 hover:border-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-700 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50">
            <ToolIcon name={tool.iconName} className="h-5 w-5" />
          </div>
          <span className="text-xs text-slate-500">
            {tool.processingMode === 'local' ? 'معالجة محلية' : 'خادم مشفّر'}
          </span>
        </div>

        <h3 className="mt-4 text-base font-bold text-slate-950 transition-colors group-hover:text-blue-700">
          {tool.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{tool.shortDesc}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          {tool.categoryLabel}
          {tool.batchSupported ? ' · يدعم تعدد الملفات' : ''}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
          <span>فتح</span>
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export default function HomeCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategoryId | 'all'>('all');

  const popularTools = useMemo(() => TOOLS_REGISTRY.filter((t) => t.popular), []);
  const filteredTools = useMemo(
    () => searchAndFilterTools(searchQuery, activeCategory),
    [searchQuery, activeCategory]
  );

  const isFiltering = searchQuery.trim().length > 0 || activeCategory !== 'all';

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-blue-700">
              {TOOLS_REGISTRY.length} أداة رقمية متكاملة · تعمل مباشرة في متصفحك
            </p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl [text-wrap:balance] leading-[1.25]">
              أنجز مهام ملفات PDF والصور والمستندات في مكان واحد
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              ادمج المستندات، اضغط الصور، حوّل الصيغ، وأدر ملفاتك اليومية فوراً دون تثبيت أي برامج أو إرسال ملفاتك الخاصة إلى خوادم خارجية.
            </p>

            {/* Primary Search Bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative flex items-center rounded-xl border border-slate-300 bg-white shadow-xs focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-700/15">
                <Search className="mr-4 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أداة (دمج PDF، ضغط صور، QR)..."
                  aria-label="ابحث في مكتبة الأدوات"
                  className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-base"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="مسح البحث"
                    className="ml-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <span>الأكثر طلباً:</span>
                {['دمج PDF', 'ضغط الصور', 'Word إلى PDF', 'إزالة الخلفية', 'مولد QR'].map(
                  (quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setSearchQuery(quick)}
                      className="font-medium text-slate-700 underline-offset-4 hover:text-blue-700 hover:underline"
                    >
                      {quick}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Filter & Directory */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">دليل الأدوات الشامل</h2>
            <p className="mt-1 text-sm text-slate-600">
              اختر التصنيف أو ابحث للوصول مباشرة إلى الأداة المناسبة لمهمتك.
            </p>
          </div>

          {/* Interactive Category Segmented Filter */}
          <div
            role="tablist"
            aria-label="تصنيفات الأدوات"
            className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              الكل ({TOOLS_REGISTRY.length})
            </button>
            {TOOL_CATEGORIES.map((cat) => {
              const count = TOOLS_REGISTRY.filter((t) => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat.shortLabel} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Search / Filtered Results View */}
        {isFiltering ? (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
              <span className="font-mono tabular-nums">
                تم العثور على {filteredTools.length} أداة
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="font-semibold text-blue-700 hover:underline"
                >
                  عرض جميع الأدوات
                </button>
              )}
            </div>

            {filteredTools.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
                <p className="text-base font-bold text-slate-900">
                  لا توجد أدوات مطابقة لعبارة «{searchQuery}»
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  جرّب البحث بكلمات عامة مثل: PDF، صور، ZIP، نص، ألوان، باركود.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="mt-4 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 space-y-16">
            {/* Popular Tools Strip */}
            <div>
              <div className="mb-5 flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-slate-950">الأدوات الأكثر استخداماً</h3>
                <span className="text-xs text-slate-500">وصول سريع للمهام اليومية</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {popularTools.slice(0, 9).map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </div>

            {/* Grouped By Category */}
            {TOOL_CATEGORIES.map((category, idx) => {
              const catTools = TOOLS_REGISTRY.filter((t) => t.category === category.id);
              return (
                <section
                  key={category.id}
                  id={category.anchorId}
                  className="scroll-mt-24 border-t border-slate-200 pt-10"
                >
                  <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                      <p className="font-mono text-xs font-semibold text-blue-700">
                        0{idx + 1}. القسم
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-slate-950">{category.label}</h3>
                      <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                    </div>
                    <span className="font-mono text-xs tabular-nums text-slate-500 shrink-0">
                      {catTools.length} أداة متوفرة
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {catTools.map((tool) => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {/* Privacy & Architecture Section */}
      <section id="privacy" className="scroll-mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-950">
              خصوصية ملفاتك مبدأ أساسي في تصميم مِنْجَز
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              صُممت المنصة لتنفيذ عمليات معالجة الملفات مباشرة داخل ذاكرة متصفحك كلما أمكن ذلك، مع شفافية كاملة عند الحاجة إلى معالجة سحابية مؤقتة.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <h3 className="text-base font-bold text-slate-950">01. معالجة محلية داخل المتصفح</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                أدوات دمج وتقسيم وتشفير PDF، وضغط وتحويل الصور، وإنشاء وفك ضغط ZIP تعمل محلياً على جهازك دون إرسال الملفات إلى أي خادم.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <h3 className="text-base font-bold text-slate-950">02. شفافية عند استخدام الخادم</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                تقتصر المعالجة عبر الخادم على أداة التعرف الضوئي على النصوص (OCR) لضمان دقة قراءة العربية، مع تنبيه واضح قبل البدء وعدم حفظ أي ملفات.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <h3 className="text-base font-bold text-slate-950">03. تحميل فوري وأداء خفيف</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                يتم تحميل محرك كل أداة عند فتحها فقط، مما يحافظ على سرعة التصفح واستهلاك منخفض للذاكرة على الحاسوب والهواتف الذكية.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
