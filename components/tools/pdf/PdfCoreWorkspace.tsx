'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Download, FileText, Trash2 } from 'lucide-react';
import FileDropzone from '@/components/tool-ui/FileDropzone';
import ProcessingStatus from '@/components/tool-ui/ProcessingStatus';
import { formatBytes, getSavingsPercent } from '@/lib/core/file-utils';
import { buildFixedChunkRanges, parsePageRanges } from '@/lib/core/pdf-utils';
import { downloadBlob, downloadBytes } from '@/lib/engines/download-helper';
import {
  addWatermarkToPdf,
  compressPdfDocument,
  imagesToPdf,
  inspectPdf,
  mergePdfFiles,
  protectPdfWithPassword,
  splitPdfIntoZip,
} from '@/lib/engines/pdf-client';

interface PdfItem {
  id: string;
  file: File;
  pageCount?: number;
}

export default function PdfCoreWorkspace({ slug }: { slug: string }) {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [resultBlob, setResultBlob] = useState<{ blob: Blob; filename: string } | null>(null);
  const [resultStats, setResultStats] = useState<{ before: number; after: number } | null>(null);

  // Split options
  const [splitMode, setSplitMode] = useState<'every1' | 'fixed' | 'ranges'>('every1');
  const [fixedChunk, setFixedChunk] = useState(2);
  const [rangeInput, setRangeInput] = useState('1-2, 3-4');

  // Compress options
  const [compressLevel, setCompressLevel] = useState<'light' | 'medium' | 'strong'>('medium');

  // Images to PDF options
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginPx, setMarginPx] = useState(24);

  // Watermark options
  const [wmText, setWmText] = useState('سري — للاستخدام الداخلي');
  const [wmColor, setWmColor] = useState('#1D4ED8');
  const [wmOpacity, setWmOpacity] = useState(0.28);
  const [wmSize, setWmSize] = useState(40);
  const [wmAngle, setWmAngle] = useState(-35);
  const [wmPos, setWmPos] = useState<'center' | 'tiled' | 'bottom-right'>('center');

  // Protect options
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  const isMulti = slug === 'merge-pdf' || slug === 'images-to-pdf';
  const accept = slug === 'images-to-pdf' ? ['.jpg', '.jpeg', '.png', '.webp'] : ['.pdf'];

  const handleFilesSelected = async (files: File[]) => {
    setStatus('idle');
    setResultBlob(null);
    setResultStats(null);
    setMessage('');

    const mapped: PdfItem[] = [];
    for (const file of files) {
      let pageCount: number | undefined;
      if (file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const info = await inspectPdf(file);
          pageCount = info.pageCount;
        } catch {
          setStatus('error');
          setMessage(`تعذّر قراءة ملف PDF «${file.name}». قد يكون تالفاً أو محمياً بكلمة مرور.`);
          return;
        }
      }
      mapped.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        pageCount,
      });
    }

    setItems((prev) => (isMulti ? [...prev, ...mapped] : mapped.slice(0, 1)));
  };

  const moveItem = (index: number, delta: -1 | 1) => {
    setItems((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setResultBlob(null);
  };

  const runAction = async () => {
    if (items.length === 0) {
      setStatus('error');
      setMessage('يرجى اختيار ملف واحد على الأقل أولاً.');
      return;
    }

    setStatus('processing');
    setProgress(5);
    setMessage('جارٍ تجهيز الملفات...');
    setResultBlob(null);
    setResultStats(null);

    try {
      if (slug === 'merge-pdf') {
        if (items.length < 2) {
          throw new Error('يرجى إضافة ملفين PDF على الأقل لتنفيذ الدمج.');
        }
        const bytes = await mergePdfFiles(
          items.map((i) => i.file),
          (done, total) => {
            setProgress((done / total) * 100);
            setMessage(`جارٍ دمج الملف ${done} من ${total}...`);
          }
        );
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        setResultBlob({ blob, filename: 'merged-monjez.pdf' });
        setStatus('success');
        setMessage(`تم دمج ${items.length} ملفات بنجاح في مستند واحد.`);
      } else if (slug === 'split-pdf') {
        const item = items[0];
        const total = item.pageCount ?? (await inspectPdf(item.file)).pageCount;
        let groups: number[][] = [];

        if (splitMode === 'every1') {
          groups = buildFixedChunkRanges(total, 1);
        } else if (splitMode === 'fixed') {
          groups = buildFixedChunkRanges(total, Math.max(1, fixedChunk));
        } else {
          const parsed = parsePageRanges(rangeInput, total);
          if (!parsed.valid) throw new Error(parsed.error || 'نطاق الصفحات غير صالح.');
          groups = [parsed.pages];
        }

        if (groups.length === 1) {
          const { extractPagesToPdf } = await import('@/lib/engines/pdf-client');
          const bytes = await extractPagesToPdf(item.file, groups[0]);
          const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
          setResultBlob({
            blob,
            filename: `${item.file.name.replace(/\.pdf$/i, '')}_split.pdf`,
          });
        } else {
          const zipBlob = await splitPdfIntoZip(item.file, groups, item.file.name, (done, tot) => {
            setProgress((done / tot) * 100);
            setMessage(`جارٍ إنشاء الجزء ${done} من ${tot}...`);
          });
          setResultBlob({
            blob: zipBlob,
            filename: `${item.file.name.replace(/\.pdf$/i, '')}_split.zip`,
          });
        }
        setStatus('success');
        setMessage(`تم تقسيم المستند إلى ${groups.length} ملفات جاهزة للتنزيل.`);
      } else if (slug === 'compress-pdf') {
        const item = items[0];
        const bytes = await compressPdfDocument(item.file, compressLevel, (done, total) => {
          setProgress((done / total) * 100);
          setMessage(`جارٍ ضغط الصفحة ${done} من ${total}...`);
        });
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        setResultBlob({
          blob,
          filename: `${item.file.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
        });
        setResultStats({ before: item.file.size, after: blob.size });
        setStatus('success');
        const saved = getSavingsPercent(item.file.size, blob.size);
        setMessage(
          saved > 0
            ? `تم ضغط الملف بنجاح وتوفير ${saved}% من المساحة.`
            : 'تمت إعادة بناء الملف بأقصى ضغط ممكن لهذا المستند.'
        );
      } else if (slug === 'images-to-pdf') {
        const bytes = await imagesToPdf(
          items.map((i) => i.file),
          { pageSize, orientation, marginPx },
          (done, total) => {
            setProgress((done / total) * 100);
            setMessage(`جارٍ إدراج الصورة ${done} من ${total}...`);
          }
        );
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        setResultBlob({ blob, filename: 'images-monjez.pdf' });
        setStatus('success');
        setMessage(`تم تحويل ${items.length} صور إلى ملف PDF واحد بنجاح.`);
      } else if (slug === 'watermark-pdf') {
        if (!wmText.trim()) throw new Error('يرجى كتابة نص العلامة المائية أولاً.');
        const item = items[0];
        const bytes = await addWatermarkToPdf(
          item.file,
          {
            text: wmText.trim(),
            colorHex: wmColor,
            opacity: wmOpacity,
            fontSize: wmSize,
            angleDeg: wmAngle,
            position: wmPos,
          },
          (done, total) => {
            setProgress((done / total) * 100);
            setMessage(`جارٍ إضافة العلامة المائية للصفحة ${done} من ${total}...`);
          }
        );
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        setResultBlob({
          blob,
          filename: `${item.file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`,
        });
        setStatus('success');
        setMessage('تمت إضافة العلامة المائية إلى جميع الصفحات بنجاح.');
      } else if (slug === 'protect-pdf') {
        if (userPassword.length < 4) {
          throw new Error('يرجى إدخال كلمة مرور لا تقل عن 4 أحرف لحماية الملف.');
        }
        if (userPassword !== confirmPassword) {
          throw new Error('كلمتا المرور غير متطابقتين.');
        }
        const item = items[0];
        setProgress(50);
        const bytes = await protectPdfWithPassword(item.file, {
          userPassword,
          allowPrinting,
          allowCopying,
          allowModifying,
        });
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        setProgress(100);
        setResultBlob({
          blob,
          filename: `${item.file.name.replace(/\.pdf$/i, '')}_protected.pdf`,
        });
        setStatus('success');
        setMessage('تم تشفير ملف PDF بتشفير AES-256 وحمايته بكلمة المرور بنجاح.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'تعذرت معالجة الملف. يرجى التحقق والمحاولة مجدداً.');
    }
  };

  return (
    <div className="space-y-6">
      <FileDropzone
        accept={accept}
        multiple={isMulti}
        onFilesSelected={handleFilesSelected}
        title={
          slug === 'images-to-pdf'
            ? 'اختر الصور لتحويلها إلى مستند PDF'
            : isMulti
              ? 'اختر ملفات PDF (يمكنك تحديد عدة ملفات أو سحبها)'
              : 'اختر ملف PDF لبدء المعالجة'
        }
      />

      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              الملفات المختارة ({items.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                setItems([]);
                setResultBlob(null);
                setStatus('idle');
              }}
              className="text-xs font-medium text-red-700 hover:underline"
            >
              مسح القائمة
            </button>
          </div>

          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {items.map((item, idx) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{item.file.name}</p>
                    <p className="text-xs text-slate-500">
                      <bdi dir="ltr" className="font-mono tabular-nums">
                        {formatBytes(item.file.size)}
                      </bdi>
                      {typeof item.pageCount === 'number' ? (
                        <span className="tabular-nums"> · {item.pageCount} صفحة</span>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isMulti && items.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        aria-label={`تحريك ${item.file.name} للأعلى`}
                        className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === items.length - 1}
                        aria-label={`تحريك ${item.file.name} للأسفل`}
                        className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`إزالة ${item.file.name}`}
                    className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Tool-specific controls */}
          {slug === 'split-pdf' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <p className="text-sm font-bold text-slate-900">خيارات التقسيم</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'every1', label: 'كل صفحة في ملف مستقل' },
                  { id: 'fixed', label: 'تقسيم كل عدد محدد من الصفحات' },
                  { id: 'ranges', label: 'تحديد نطاق مخصص' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSplitMode(opt.id as 'every1' | 'fixed' | 'ranges')}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                      splitMode === opt.id
                        ? 'bg-blue-700 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {splitMode === 'fixed' && (
                <label className="block text-sm text-slate-700">
                  عدد الصفحات في كل ملف:
                  <input
                    type="number"
                    min={1}
                    max={items[0].pageCount || 100}
                    value={fixedChunk}
                    onChange={(e) => setFixedChunk(Math.max(1, Number(e.target.value) || 1))}
                    className="mt-1.5 block w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums"
                  />
                </label>
              )}
              {splitMode === 'ranges' && (
                <label className="block text-sm text-slate-700">
                  نطاق الصفحات المطلوب (مثال: 1-3, 5):
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    dir="ltr"
                    className="mt-1.5 block w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono"
                  />
                </label>
              )}
            </div>
          )}

          {slug === 'compress-pdf' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-sm font-bold text-slate-900">مستوى الضغط</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    id: 'light',
                    title: 'تحسين هيكلي خفيف',
                    desc: 'يحافظ على النصوص قابلة للتحديد مع تنظيف البيانات الزائدة.',
                  },
                  {
                    id: 'medium',
                    title: 'ضغط متوازن (موصى به)',
                    desc: 'يقلل حجم المستندات والصور بشكل ملحوظ مع وضوح ممتاز.',
                  },
                  {
                    id: 'strong',
                    title: 'ضغط قوي (أصغر حجم)',
                    desc: 'أقصى توفير للمساحة لإرسال الملفات عبر البريد.',
                  },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setCompressLevel(lvl.id as 'light' | 'medium' | 'strong')}
                    className={`rounded-xl border p-3.5 text-right transition-colors ${
                      compressLevel === lvl.id
                        ? 'border-blue-700 bg-blue-50/70'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900">{lvl.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{lvl.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {slug === 'images-to-pdf' && (
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <label className="text-sm font-medium text-slate-800">
                مقاس الصفحة
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | 'fit')}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="a4">A4 قياسي</option>
                  <option value="letter">Letter</option>
                  <option value="fit">مطابق لأبعاد كل صورة</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-800">
                اتجاه الصفحة
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                  disabled={pageSize === 'fit'}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="portrait">عمودي</option>
                  <option value="landscape">أفقي</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-800">
                الهامش (نقطة)
                <input
                  type="number"
                  min={0}
                  max={72}
                  value={marginPx}
                  disabled={pageSize === 'fit'}
                  onChange={(e) => setMarginPx(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums disabled:opacity-50"
                />
              </label>
            </div>
          )}

          {slug === 'watermark-pdf' && (
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium text-slate-800 sm:col-span-2 lg:col-span-1">
                نص العلامة المائية
                <input
                  type="text"
                  value={wmText}
                  onChange={(e) => setWmText(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm font-medium text-slate-800">
                الموضع
                <select
                  value={wmPos}
                  onChange={(e) =>
                    setWmPos(e.target.value as 'center' | 'tiled' | 'bottom-right')
                  }
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="center">في المنتصف</option>
                  <option value="tiled">مكرر على كامل الصفحة</option>
                  <option value="bottom-right">أسفل يمين الصفحة</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-800">
                اللون
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={wmColor}
                    onChange={(e) => setWmColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
                  />
                  <span className="font-mono text-xs text-slate-600">{wmColor}</span>
                </div>
              </label>

              <label className="text-sm font-medium text-slate-800">
                الشفافية ({Math.round(wmOpacity * 100)}%)
                <input
                  type="range"
                  min={0.08}
                  max={0.9}
                  step={0.02}
                  value={wmOpacity}
                  onChange={(e) => setWmOpacity(Number(e.target.value))}
                  className="mt-2 block w-full accent-blue-700"
                />
              </label>

              <label className="text-sm font-medium text-slate-800">
                حجم الخط ({wmSize}px)
                <input
                  type="range"
                  min={18}
                  max={84}
                  value={wmSize}
                  onChange={(e) => setWmSize(Number(e.target.value))}
                  className="mt-2 block w-full accent-blue-700"
                />
              </label>

              <label className="text-sm font-medium text-slate-800">
                زاوية الميل ({wmAngle}°)
                <input
                  type="range"
                  min={-60}
                  max={60}
                  value={wmAngle}
                  onChange={(e) => setWmAngle(Number(e.target.value))}
                  className="mt-2 block w-full accent-blue-700"
                />
              </label>
            </div>
          )}

          {slug === 'protect-pdf' && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-800">
                  كلمة مرور فتح الملف
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="4 أحرف على الأقل"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-800">
                  تأكيد كلمة المرور
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-6 pt-1 text-sm text-slate-700">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPrinting}
                    onChange={(e) => setAllowPrinting(e.target.checked)}
                    className="h-4 w-4 accent-blue-700"
                  />
                  <span>السماح بالطباعة</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCopying}
                    onChange={(e) => setAllowCopying(e.target.checked)}
                    className="h-4 w-4 accent-blue-700"
                  />
                  <span>السماح بنسخ النصوص</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowModifying}
                    onChange={(e) => setAllowModifying(e.target.checked)}
                    className="h-4 w-4 accent-blue-700"
                  />
                  <span>السماح بالتعديل</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runAction}
              disabled={status === 'processing'}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
            >
              <span>
                {slug === 'merge-pdf'
                  ? 'دمج الملفات الآن'
                  : slug === 'split-pdf'
                    ? 'تنفيذ التقسيم'
                    : slug === 'compress-pdf'
                      ? 'ضغط الملف الآن'
                      : slug === 'images-to-pdf'
                        ? 'إنشاء ملف PDF'
                        : slug === 'watermark-pdf'
                          ? 'تطبيق العلامة المائية'
                          : 'تشفير وحماية الملف'}
              </span>
            </button>

            {resultBlob && (
              <button
                type="button"
                onClick={() => downloadBlob(resultBlob.blob, resultBlob.filename)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>تنزيل النتيجة ({formatBytes(resultBlob.blob.size)})</span>
              </button>
            )}
          </div>
        </div>
      )}

      <ProcessingStatus status={status} progress={progress} message={message} />

      {resultStats && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">الحجم الأصلي</p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-slate-900">
              {formatBytes(resultStats.before)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">الحجم بعد الضغط</p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-emerald-700">
              {formatBytes(resultStats.after)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">نسبة التوفير</p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-blue-700">
              {Math.max(0, getSavingsPercent(resultStats.before, resultStats.after))}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
