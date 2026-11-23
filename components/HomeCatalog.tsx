'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Download,
  LayoutGrid,
  List,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  TOOL_CATEGORIES,
  ToolCategoryId,
  ToolDefinition,
  TOOLS_REGISTRY,
} from '@/lib/tools-registry';
import { searchAndFilterTools } from '@/lib/tools-search';
import { AppIconTile } from './tool-ui/AppIconTile';

type ViewMode = 'apps' | 'detailed';

const CATEGORY_INFOS: Record<
  ToolCategoryId,
  {
    repIcon: string;
    shapeLabel: string;
    formatsSummary: string;
    barColor: string;
    accentText: string;
    softBg: string;
  }
> = {
  pdf: {
    repIcon: 'Layers',
    shapeLabel: 'مربعات مستديرة',
    formatsSummary: 'PDF · DOCX · XLSX · PPTX · OCR',
    barColor: 'bg-rose-600',
    accentText: 'text-rose-700',
    softBg: 'bg-rose-50/70',
  },
  images: {
    repIcon: 'Image',
    shapeLabel: 'بطاقات هندسية',
    formatsSummary: 'JPG · PNG · WebP · SVG · BMP',
    barColor: 'bg-indigo-600',
    accentText: 'text-indigo-700',
    softBg: 'bg-indigo-50/70',
  },
  files: {
    repIcon: 'FolderArchive',
    shapeLabel: 'أيقونات مشطوفة',
    formatsSummary: 'ZIP · CSV · JSON · TXT · SHA-256',
    barColor: 'bg-emerald-600',
    accentText: 'text-emerald-700',
    softBg: 'bg-emerald-50/70',
  },
  productivity: {
    repIcon: 'QrCode',
    shapeLabel: 'دوائر تطبيقية',
    formatsSummary: 'QR · Barcode · WCAG · نصوص عربية',
    barColor: 'bg-amber-600',
    accentText: 'text-amber-700',
    softBg: 'bg-amber-50/70',
  },
};

function AppLauncherTile({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col items-center rounded-[24px] border border-slate-200/90 bg-white p-5 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-md hover:shadow-slate-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <AppIconTile
        iconName={tool.iconName}
        category={tool.category}
        size="lg"
        className="group-hover:scale-105"
      />

      <h3 className="mt-4 text-sm font-bold text-slate-950 transition-colors group-hover:text-blue-700 sm:text-base [text-wrap:balance]">
        {tool.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
        {tool.shortDesc}
      </p>

      <div className="mt-auto flex w-full items-center justify-between border-t border-slate-100 pt-3 mt-4 text-[11px] text-slate-500">
        <span>{tool.processingMode === 'local' ? 'محلي بالمتصفح' : 'سحابي مشفّر'}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
          <span>فتح</span>
          <ArrowLeft
            className="h-3 w-3 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

function DetailedToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <AppIconTile
            iconName={tool.iconName}
            category={tool.category}
            size="md"
            className="group-hover:scale-105"
          />
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
        <span className="truncate">
          {tool.categoryLabel}
          {tool.batchSupported ? ' · متعدد الملفات' : ''}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-blue-700">
          <span>فتح</span>
          <ArrowLeft
            className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

export default function HomeCatalog({ initialQuery = '' }: { initialQuery?: string }) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<ToolCategoryId | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('apps');

  const popularTools = useMemo(() => TOOLS_REGISTRY.filter((t) => t.popular), []);
  const filteredTools = useMemo(
    () => searchAndFilterTools(searchQuery, activeCategory),
    [searchQuery, activeCategory]
  );

  const localToolsCount = useMemo(
    () => TOOLS_REGISTRY.filter((t) => t.processingMode === 'local').length,
    []
  );

  const isFiltering = searchQuery.trim().length > 0 || activeCategory !== 'all';

  const selectCategoryAndScroll = (categoryId: ToolCategoryId) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    const el = document.getElementById('catalog');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* Infographic Split Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Primary Content & Search Column */}
            <div className="lg:col-span-7">
              <p className="text-sm font-semibold text-blue-700">
                {TOOLS_REGISTRY.length} تطبيقاً رقمياً متكاملاً · تعمل مباشرة داخل متصفحك
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl [text-wrap:balance] leading-[1.22]">
                أنجز مهام ملفات PDF والصور والمستندات في مكان واحد
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                منظومة تطبيقات عربية متخصصة تتيح لك الدمج، الضغط، التحويل، وإزالة الخلفية وإدارة الملفات فوراً دون تثبيت أي برامج أو إرسال مستنداتك لجهات خارجية.
              </p>

              {/* Unified Search Bar */}
              <div className="mt-7 max-w-xl">
                <div className="relative flex items-center rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-700/15">
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

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
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

              {/* Infographic KPI Metrics Strip */}
              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
                <div className="bg-slate-50/90 p-4">
                  <div className="font-mono text-2xl font-bold tabular-nums text-slate-950">
                    {TOOLS_REGISTRY.length}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-600">تطبيق وأداة متكاملة</div>
                </div>
                <div className="bg-slate-50/90 p-4">
                  <div className="font-mono text-2xl font-bold tabular-nums text-blue-700">
                    {TOOL_CATEGORIES.length}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-600">أقسام متخصصة</div>
                </div>
                <div className="bg-slate-50/90 p-4">
                  <div className="font-mono text-2xl font-bold tabular-nums text-emerald-700">
                    {localToolsCount}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-600">معالجة محلية بالمتصفح</div>
                </div>
                <div className="bg-slate-50/90 p-4">
                  <div className="font-mono text-2xl font-bold tabular-nums text-slate-950">0</div>
                  <div className="mt-0.5 text-xs text-slate-600">اشتراكات أو تثبيت</div>
                </div>
              </div>
            </div>

            {/* Visual Infographic Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50/90 p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-950">
                      مخطط سير العمل الذكي
                    </h2>
                    <p className="text-xs text-slate-500">من اختيار التطبيق حتى التنزيل الآمن</p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-blue-700">
                    3 خطوات
                  </span>
                </div>

                {/* Connected Infographic Pipeline */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 font-mono text-xs font-bold text-white">
                      01
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900">اختر التطبيق المناسب</h3>
                      <p className="text-xs text-slate-600">
                        أيقونات مصنفة بأشكال وألوان واضحة لملفاتك ومهامك.
                      </p>
                    </div>
                    <Upload className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </div>

                  <div className="mr-5 h-3 w-px bg-slate-300" aria-hidden="true" />

                  <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-mono text-xs font-bold text-white">
                      02
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900">معالجة فورية بالمتصفح</h3>
                      <p className="text-xs text-slate-600">
                        تنفيذ مباشر في الذاكرة يحفظ خصوصية مستنداتك الحساسة.
                      </p>
                    </div>
                    <Cpu className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </div>

                  <div className="mr-5 h-3 w-px bg-slate-300" aria-hidden="true" />

                  <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-mono text-xs font-bold text-white">
                      03
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-900">معاينة وتنزيل فوري</h3>
                      <p className="text-xs text-slate-600">
                        قارن النتيجة والحجم قبل الحفظ أو التنزيل بأرشيف ZIP.
                      </p>
                    </div>
                    <Download className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  </div>
                </div>

                {/* 4 App Ecosystem Shapes Mini-Grid */}
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="mb-3 text-xs font-semibold text-slate-700">
                    منظومة الأشكال الهندسية للتطبيقات:
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {TOOL_CATEGORIES.map((cat) => {
                      const info = CATEGORY_INFOS[cat.id];
                      const count = TOOLS_REGISTRY.filter((t) => t.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => selectCategoryAndScroll(cat.id)}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 text-right transition-colors hover:border-blue-600"
                        >
                          <AppIconTile
                            iconName={info.repIcon}
                            category={cat.id}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-bold text-slate-900">
                              {cat.shortLabel}
                            </div>
                            <div className="font-mono text-[11px] tabular-nums text-slate-500">
                              {count} أداة
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infographic Category Distribution Strip */}
      <section className="border-b border-slate-200 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOL_CATEGORIES.map((cat) => {
              const info = CATEGORY_INFOS[cat.id];
              const count = TOOLS_REGISTRY.filter((t) => t.category === cat.id).length;
              const sharePct = Math.round((count / TOOLS_REGISTRY.length) * 100);
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectCategoryAndScroll(cat.id)}
                  className={`group flex flex-col justify-between rounded-2xl border p-4 text-right transition-all ${
                    isSelected
                      ? 'border-blue-700 bg-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <AppIconTile iconName={info.repIcon} category={cat.id} size="md" />
                      <div className="text-left">
                        <span className={`font-mono text-lg font-bold tabular-nums ${info.accentText}`}>
                          {count}
                        </span>
                        <span className="block text-[11px] text-slate-500">تطبيقاً</span>
                      </div>
                    </div>

                    <h2 className="mt-3.5 text-sm font-bold text-slate-950 group-hover:text-blue-700">
                      {cat.label}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500" dir="ltr">
                      {info.formatsSummary}
                    </p>
                  </div>

                  {/* Infographic Proportion Bar */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{info.shapeLabel}</span>
                      <span className="font-mono tabular-nums">{sharePct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${info.barColor}`}
                        style={{ width: `${sharePct}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catalog Filter & Application Launcher */}
      <section id="catalog" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">مكتبة التطبيقات والأدوات الشاملة</h2>
            <p className="mt-1 text-sm text-slate-600">
              تصفح التطبيقات حسب القسم أو بدّل طريقة العرض بين شبكة التطبيقات والبطاقات التفصيلية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Tabs */}
            <div
              role="tablist"
              aria-label="تصنيفات الأدوات"
              className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
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
                    className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
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

            {/* View Switcher */}
            <div
              aria-label="طريقة عرض الأدوات"
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1"
            >
              <button
                type="button"
                onClick={() => setViewMode('apps')}
                aria-pressed={viewMode === 'apps'}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  viewMode === 'apps'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تطبيقات</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('detailed')}
                aria-pressed={viewMode === 'detailed'}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <List className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تفصيلي</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search / Filtered Results View */}
        {isFiltering ? (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
              <span className="font-mono tabular-nums">
                تم العثور على {filteredTools.length} أداة
              </span>
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
            </div>

            {filteredTools.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
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
                  className="mt-4 rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'apps'
                    ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                    : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                }
              >
                {filteredTools.map((tool) =>
                  viewMode === 'apps' ? (
                    <AppLauncherTile key={tool.slug} tool={tool} />
                  ) : (
                    <DetailedToolCard key={tool.slug} tool={tool} />
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 space-y-16">
            {/* Popular Apps Strip */}
            <div>
              <div className="mb-5 flex items-baseline justify-between">
                <h3 className="text-xl font-bold text-slate-950">التطبيقات الأكثر استخداماً</h3>
                <span className="text-xs text-slate-500">وصول سريع للمهام اليومية</span>
              </div>
              <div
                className={
                  viewMode === 'apps'
                    ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                    : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                }
              >
                {popularTools.slice(0, 10).map((tool) =>
                  viewMode === 'apps' ? (
                    <AppLauncherTile key={tool.slug} tool={tool} />
                  ) : (
                    <DetailedToolCard key={tool.slug} tool={tool} />
                  )
                )}
              </div>
            </div>

            {/* Grouped By Category */}
            {TOOL_CATEGORIES.map((category, idx) => {
              const catTools = TOOLS_REGISTRY.filter((t) => t.category === category.id);
              const info = CATEGORY_INFOS[category.id];
              return (
                <section
                  key={category.id}
                  id={category.anchorId}
                  className="scroll-mt-24 border-t border-slate-200 pt-10"
                >
                  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="flex items-start gap-3.5">
                      <AppIconTile iconName={info.repIcon} category={category.id} size="md" />
                      <div>
                        <p className="font-mono text-xs font-semibold text-blue-700">
                          0{idx + 1}. {info.shapeLabel}
                        </p>
                        <h3 className="mt-0.5 text-2xl font-bold text-slate-950">
                          {category.label}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs tabular-nums text-slate-500 shrink-0">
                      {catTools.length} أداة متوفرة
                    </span>
                  </div>

                  <div
                    className={
                      viewMode === 'apps'
                        ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                        : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                    }
                  >
                    {catTools.map((tool) =>
                      viewMode === 'apps' ? (
                        <AppLauncherTile key={tool.slug} tool={tool} />
                      ) : (
                        <DetailedToolCard key={tool.slug} tool={tool} />
                      )
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {/* Infographic Privacy & Architecture Section */}
      <section id="privacy" className="scroll-mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-slate-950">
                معمارية الخصوصية والأمان في مِنْجَز
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                مقارنة واضحة لمسار معالجة ملفاتك داخل المنصة بين الأدوات المحلية وأداة التعرف الضوئي على النصوص (OCR).
              </p>
            </div>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline shrink-0"
            >
              <span>اقرأ سياسة الخصوصية الكاملة</span>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Local Path Infographic */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <h3 className="text-base font-bold">المسار المحلي داخل المتصفح</h3>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
                  {localToolsCount} أداة
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 items-center gap-2 text-center">
                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                  <Lock className="mx-auto h-5 w-5 text-emerald-700" aria-hidden="true" />
                  <div className="mt-1.5 text-xs font-bold text-slate-900">ملفك على جهازك</div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                  <Cpu className="mx-auto h-5 w-5 text-emerald-700" aria-hidden="true" />
                  <div className="mt-1.5 text-xs font-bold text-slate-900">ذاكرة المتصفح</div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white p-3">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-700" aria-hidden="true" />
                  <div className="mt-1.5 text-xs font-bold text-slate-900">تنزيل فوري</div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-600">
                لا يتم رفع مستندات PDF أو الصور أو ملفات ZIP إلى أي خادم خارجي؛ تبقى كافة البيانات محصورة داخل متصفحك طوال الوقت.
              </p>
            </div>

            {/* Cloud OCR Path Infographic */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-slate-900">
                  <Sparkles className="h-5 w-5 text-blue-700" aria-hidden="true" />
                  <h3 className="text-base font-bold">المسار السحابي المؤقت (OCR)</h3>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-blue-700">
                  أداة واحدة
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 items-center gap-2 text-center">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <Upload className="mx-auto h-5 w-5 text-blue-700" aria-hidden="true" />
                  <div className="mt-1.5 text-xs font-bold text-slate-900">إرسال مشفّر</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <Search className="mx-auto h-5 w-5 text-blue-700" aria-hidden="true" />
                  <div className="mt-1.5 text-xs font-bold text-slate-900">قراءة النص العربي</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <ShieldCheck className="mx-auto h-5 w-5 text-blue-700" aria-hidden="true" />
                  <div className="mt-1.5 text-xs font-bold text-slate-900">عدم الحفظ</div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-600">
                تقتصر المعالجة عبر الخادم على أداة التعرف الضوئي على النصوص (OCR) لضمان دقة قراءة العربية، مع تنبيه مسبق وحذف فوري دون تخزين.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
