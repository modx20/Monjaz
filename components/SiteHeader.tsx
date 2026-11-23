'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { searchAndFilterTools } from '@/lib/tools-search';
import { ToolIcon } from './tool-ui/ToolIcon';

export default function SiteHeader() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchAndFilterTools(query).slice(0, 8), [query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [searchOpen]);

  const navigateToTool = (slug: string) => {
    setSearchOpen(false);
    setQuery('');
    router.push(`/tools/${slug}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand Wordmark (Single clean text element) */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight text-slate-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            مِنْجَز
          </Link>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <Link
              href="/#catalog"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-950"
            >
              جميع الأدوات
            </Link>
            <Link
              href="/#pdf-tools"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-950"
            >
              أدوات PDF
            </Link>
            <Link
              href="/#image-tools"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-950"
            >
              أدوات الصور
            </Link>
            <Link
              href="/#file-tools"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-950"
            >
              الملفات والنصوص
            </Link>
            <Link
              href="/#privacy"
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-950"
            >
              الخصوصية
            </Link>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="فتح البحث السريع عن الأدوات"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>بحث سريع</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="قائمة الجوال"
            className="border-t border-slate-200 bg-white px-4 py-3 md:hidden"
          >
            <div className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              <Link
                href="/#catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-slate-50"
              >
                جميع الأدوات
              </Link>
              <Link
                href="/#pdf-tools"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-slate-50"
              >
                أدوات PDF
              </Link>
              <Link
                href="/#image-tools"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-slate-50"
              >
                أدوات الصور
              </Link>
              <Link
                href="/#file-tools"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-slate-50"
              >
                الملفات والنصوص
              </Link>
              <Link
                href="/#privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 hover:bg-slate-50"
              >
                الخصوصية والأمان
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Quick Search Command Dialog */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 p-4 pt-16 sm:pt-24 backdrop-blur-[2px]"
          onClick={() => setSearchOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="البحث السريع عن الأدوات"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results.length > 0) {
                    navigateToTool(results[0].slug);
                  }
                }}
                placeholder="ابحث عن أداة بالاسم أو الوظيفة (مثال: دمج، ضغط صور، QR)..."
                aria-label="ابحث عن أداة"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="إغلاق نافذة البحث"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  لم يتم العثور على أداة مطابقة لـ «{query}». جرّب كلمات مثل: دمج، صور، QR، كلمة مرور.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {results.map((tool) => (
                    <li key={tool.slug}>
                      <button
                        type="button"
                        onClick={() => navigateToTool(tool.slug)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-blue-700">
                          <ToolIcon name={tool.iconName} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-slate-900">
                              {tool.title}
                            </span>
                            <span className="shrink-0 text-xs text-slate-500">
                              {tool.categoryLabel}
                            </span>
                          </div>
                          <p className="truncate text-xs text-slate-600">{tool.shortDesc}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
