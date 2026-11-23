'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Cpu,
  LayoutGrid,
  List,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
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

interface FeatureSpotlight {
  id: string;
  step: string;
  title: string;
  summary: string;
  metric: string;
  category: ToolCategoryId;
  iconName: string;
}

const FEATURE_SPOTLIGHTS: FeatureSpotlight[] = [
  {
    id: 'privacy',
    step: '01',
    title: 'معالجة محلية آمنة داخل المتصفح',
    summary:
      '38 أداة تعمل مباشرة على ذاكرة جهازك دون رفع الملفات إلى أي خادم خارجي، مع حذف فوري في أداة OCR.',
    metric: 'خصوصية 100%',
    category: 'files',
    iconName: 'ShieldCheck',
  },
  {
    id: 'shapes',
    step: '02',
    title: 'تطبيقات مصنفة بأشكال وألوان مميزة',
    summary:
      'واجهة منظمة تميّز أدوات PDF والصور والملفات والإنتاجية بأيقونات مستديرة وأشكال هندسية واضحة للوصول السريع.',
    metric: '4 أقسام متخصصة',
    category: 'pdf',
    iconName: 'Layers',
  },
  {
    id: 'arabic',
    step: '03',
    title: 'دعم أصيل للغة العربية وRTL',
    summary:
      'تنسيق مستندات Word وExcel، علامات مائية عربية متصلة، وتنظيف التشكيل وجداول CSV المتوافقة مع Excel.',
    metric: 'دقة عربية عالية',
    category: 'images',
    iconName: 'Sparkles',
  },
  {
    id: 'speed',
    step: '04',
    title: 'نتائج فورية ومعالجة جماعية (Batch)',
    summary:
      'معاينة مباشرة قبل التنزيل ودعم معالجة عدة ملفات دفعة واحدة مع تصدير سريع بصيغة ZIP.',
    metric: 'دون تثبيت برامج',
    category: 'productivity',
    iconName: 'Zap',
  },
];

const CATEGORY_REPS: Record<ToolCategoryId, { iconName: string }> = {
  pdf: { iconName: 'Layers' },
  images: { iconName: 'Image' },
  files: { iconName: 'FolderArchive' },
  productivity: { iconName: 'QrCode' },
};

function AnimatedCounter({
  target,
  suffix = '',
  durationMs = 1100,
}: {
  target: number;
  suffix?: string;
  durationMs?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs, prefersReducedMotion]);

  return (
    <span className="font-mono tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

function AppLauncherTile({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col items-center rounded-[22px] border border-slate-200/90 bg-white p-4 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-600 hover:shadow-md hover:shadow-slate-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <AppIconTile
        iconName={tool.iconName}
        category={tool.category}
        size="lg"
        className="group-hover:scale-105"
      />

      <h3 className="mt-3.5 text-sm font-bold text-slate-950 transition-colors group-hover:text-blue-700 [text-wrap:balance]">
        {tool.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
        {tool.shortDesc}
      </p>

      <div className="mt-auto flex w-full items-center justify-between border-t border-slate-100 pt-2.5 mt-3 text-[11px] text-slate-500">
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
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
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

        <h3 className="mt-3.5 text-base font-bold text-slate-950 transition-colors group-hover:text-blue-700">
          {tool.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{tool.shortDesc}</p>
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
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
  const prefersReducedMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<ToolCategoryId | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('apps');
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);
  const [featurePaused, setFeaturePaused] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || featurePaused) return;
    const timer = setInterval(() => {
      setActiveFeatureIdx((prev) => (prev + 1) % FEATURE_SPOTLIGHTS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [prefersReducedMotion, featurePaused]);

  const popularTools = useMemo(() => TOOLS_REGISTRY.filter((t) => t.popular).slice(0, 10), []);
  const filteredTools = useMemo(
    () => searchAndFilterTools(searchQuery, activeCategory),
    [searchQuery, activeCategory]
  );

  const localToolsCount = useMemo(
    () => TOOLS_REGISTRY.filter((t) => t.processingMode === 'local').length,
    []
  );

  const isFiltering = searchQuery.trim().length > 0 || activeCategory !== 'all';
  const currentFeature = FEATURE_SPOTLIGHTS[activeFeatureIdx];

  const selectCategoryAndScroll = (categoryId: ToolCategoryId) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    const el = document.getElementById('catalog');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* Compact Animated Hero + Same-Viewport Feature Showcase */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-35"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            {/* Primary Intro, Search & Animated Count-Up Metrics */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <p className="text-sm font-semibold text-blue-700">
                منصة مِنْجَز · واجهة الأدوات الرقمية الذكية
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-[2.65rem] [text-wrap:balance] leading-[1.22]">
                كل ما تحتاجه لملفات PDF والصور والمستندات في واجهة واحدة سريعة
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                واجهة عربية منظمة تجمع أدوات الدمج والضغط والتحويل وإزالة الخلفية والرموز الذكية في مكان واحد دون تثبيت برامج أو رفع ملفاتك لجهات خارجية.
              </p>

              {/* Unified Search Bar */}
              <div className="mt-6 max-w-xl">
                <div className="relative flex items-center rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-700/15">
                  <Search className="mr-4 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن أداة (دمج PDF، ضغط صور، QR)..."
                    aria-label="ابحث في مكتبة الأدوات"
                    className="w-full bg-transparent px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-base"
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

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
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

              {/* Animated Count-Up Metrics Strip */}
              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
                <div className="bg-slate-50/90 p-3.5">
                  <div className="text-2xl font-extrabold text-slate-950">
                    <AnimatedCounter target={TOOLS_REGISTRY.length} suffix="+" />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-600">تطبيق وأداة متكاملة</div>
                </div>
                <div className="bg-slate-50/90 p-3.5">
                  <div className="text-2xl font-extrabold text-blue-700">
                    <AnimatedCounter target={TOOL_CATEGORIES.length} />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-600">أقسام متخصصة</div>
                </div>
                <div className="bg-slate-50/90 p-3.5">
                  <div className="text-2xl font-extrabold text-emerald-700">
                    <AnimatedCounter target={localToolsCount} />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-600">معالجة محلية بالمتصفح</div>
                </div>
                <div className="bg-slate-50/90 p-3.5">
                  <div className="text-2xl font-extrabold text-slate-950">
                    <AnimatedCounter target={100} suffix="%" />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-600">مجاني دون تسجيل</div>
                </div>
              </div>
            </motion.div>

            {/* Same-Viewport Animated Features & Category Shapes Showcase */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setFeaturePaused(true)}
              onMouseLeave={() => setFeaturePaused(false)}
              className="lg:col-span-5"
            >
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-950">ميزات المنصة</h2>
                    <p className="text-xs text-slate-500">تجربة متكاملة وسريعة من أول لحظة</p>
                  </div>
                  <span className="font-mono text-xs font-semibold tabular-nums text-blue-700">
                    {currentFeature.step} / 0{FEATURE_SPOTLIGHTS.length}
                  </span>
                </div>

                {/* Live Animated Feature Card in Place */}
                <div className="mt-4 min-h-[144px] rounded-2xl border border-slate-200 bg-white p-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeature.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <AppIconTile
                          iconName={currentFeature.iconName}
                          category={currentFeature.category}
                          size="md"
                        />
                        <span className="text-xs font-semibold text-blue-700">
                          {currentFeature.metric}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-950">
                        {currentFeature.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                        {currentFeature.summary}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Feature Switcher Tabs */}
                <div
                  role="tablist"
                  aria-label="ميزات المنصة"
                  className="mt-3 grid grid-cols-4 gap-1.5"
                >
                  {FEATURE_SPOTLIGHTS.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={idx === activeFeatureIdx}
                      onClick={() => setActiveFeatureIdx(idx)}
                      className={`rounded-lg py-1.5 font-mono text-xs font-semibold transition-colors ${
                        idx === activeFeatureIdx
                          ? 'bg-blue-700 text-white'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.step}
                    </button>
                  ))}
                </div>

                {/* 4 App Ecosystem Category Shortcuts */}
                <div className="mt-4 border-t border-slate-200 pt-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    {TOOL_CATEGORIES.map((cat) => {
                      const count = TOOLS_REGISTRY.filter((t) => t.category === cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => selectCategoryAndScroll(cat.id)}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2 text-right transition-colors hover:border-blue-600"
                        >
                          <AppIconTile
                            iconName={CATEGORY_REPS[cat.id].iconName}
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Most Popular Apps Strip */}
      {!isFiltering && (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">الأدوات الأكثر استخداماً</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                تطبيقات جاهزة للفتح الفوري لإنجاز مهامك اليومية
              </p>
            </div>
            <a
              href="#catalog"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
            >
              <span>جميع الأدوات ({TOOLS_REGISTRY.length})</span>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
            {popularTools.map((tool, index) => (
              <motion.div
                key={tool.slug}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <AppLauncherTile tool={tool} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Unified Compact App Directory (No Long Stacked Redundancy) */}
      <section id="catalog" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">دليل التطبيقات الكامل</h2>
            <p className="mt-1 text-sm text-slate-600">
              اختر التصنيف أو بدّل طريقة العرض للوصول السريع إلى أي أداة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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
                    id={cat.anchorId}
                    aria-selected={activeCategory === cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`scroll-mt-24 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
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

        {/* Unified Tool Grid */}
        <div className="mt-6">
          {isFiltering && (
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
          )}

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
                  ? 'grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3'
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
      </section>

      {/* Compact Privacy & Architecture Strip */}
      <section id="privacy" className="scroll-mt-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  <h2 className="text-base font-bold">المسار المحلي داخل المتصفح</h2>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums text-emerald-700">
                  {localToolsCount} أداة
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-emerald-200 bg-white p-2.5">
                  <Lock className="mx-auto h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <div className="mt-1 text-xs font-bold text-slate-900">ملفك على جهازك</div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white p-2.5">
                  <Cpu className="mx-auto h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <div className="mt-1 text-xs font-bold text-slate-900">ذاكرة المتصفح</div>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white p-2.5">
                  <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-700" aria-hidden="true" />
                  <div className="mt-1 text-xs font-bold text-slate-900">تنزيل فوري</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-900">
                  <Sparkles className="h-5 w-5 text-blue-700" aria-hidden="true" />
                  <h2 className="text-base font-bold">المسار السحابي المؤقت (OCR)</h2>
                </div>
                <Link
                  href="/privacy"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  سياسة الخصوصية
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                  <Upload className="mx-auto h-4 w-4 text-blue-700" aria-hidden="true" />
                  <div className="mt-1 text-xs font-bold text-slate-900">إرسال مشفّر</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                  <Search className="mx-auto h-4 w-4 text-blue-700" aria-hidden="true" />
                  <div className="mt-1 text-xs font-bold text-slate-900">استخراج النص</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                  <ShieldCheck className="mx-auto h-4 w-4 text-blue-700" aria-hidden="true" />
                  <div className="mt-1 text-xs font-bold text-slate-900">حذف فوري</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
