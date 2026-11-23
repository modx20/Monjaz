'use client';

import { useState } from 'react';
import { Check, Copy, Download, ShieldAlert } from 'lucide-react';
import FileDropzone from '@/components/tool-ui/FileDropzone';
import ProcessingStatus from '@/components/tool-ui/ProcessingStatus';
import { copyToClipboard, downloadBlob } from '@/lib/engines/download-helper';
import {
  convertDocxToHtml,
  exportHtmlToPdfBlob,
  parsePptxSlides,
  parseSpreadsheetToHtml,
} from '@/lib/engines/office-client';
import { renderPdfPages } from '@/lib/engines/pdf-client';

export default function OfficeAndOcrWorkspace({ slug }: { slug: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    slug === 'excel-to-pdf' || slug === 'powerpoint-to-pdf' ? 'landscape' : 'portrait'
  );
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  // OCR specific states
  const [ocrSourceImages, setOcrSourceImages] = useState<{ label: string; dataUrl: string; mime: string }[]>([]);
  const [ocrSelectedIndex, setOcrSelectedIndex] = useState(0);
  const [ocrLang, setOcrLang] = useState<'auto' | 'ar' | 'en'>('auto');
  const [ocrPreserveLayout, setOcrPreserveLayout] = useState(true);
  const [ocrResult, setOcrResult] = useState('');
  const [copied, setCopied] = useState(false);

  const accept =
    slug === 'word-to-pdf'
      ? ['.docx']
      : slug === 'excel-to-pdf'
        ? ['.xlsx', '.xls', '.csv']
        : slug === 'powerpoint-to-pdf'
          ? ['.pptx']
          : ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setPreviewHtml('');
    setWarnings([]);
    setOcrSourceImages([]);
    setOcrResult('');
    setStatus('processing');
    setProgress(25);
    setMessage('جارٍ قراءة الملف وتحضير المعاينة...');

    try {
      if (slug === 'word-to-pdf') {
        const res = await convertDocxToHtml(f);
        setPreviewHtml(res.html);
        setWarnings(res.warnings);
        setStatus('idle');
        setMessage('');
      } else if (slug === 'excel-to-pdf') {
        const res = await parseSpreadsheetToHtml(f);
        setPreviewHtml(res.html);
        setWarnings(res.warnings);
        setSheetNames(res.sheetNames ?? []);
        setSelectedSheet(res.sheetNames?.[0] ?? '');
        setStatus('idle');
        setMessage('');
      } else if (slug === 'powerpoint-to-pdf') {
        const res = await parsePptxSlides(f);
        setPreviewHtml(res.html);
        setStatus('idle');
        setMessage('');
      } else if (slug === 'ocr-tool') {
        if (f.name.toLowerCase().endsWith('.pdf')) {
          const { pages } = await renderPdfPages(f, {
            scale: 1.8,
            format: 'image/jpeg',
            quality: 0.9,
            maxPages: 12,
            onProgress: (done, total) => setProgress((done / total) * 100),
          });
          setOcrSourceImages(
            pages.map((p) => ({
              label: `صفحة ${p.pageNumber}`,
              dataUrl: p.dataUrl,
              mime: 'image/jpeg',
            }))
          );
          setOcrSelectedIndex(0);
        } else {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('تعذرت قراءة الصورة.'));
            reader.readAsDataURL(f);
          });
          setOcrSourceImages([
            { label: f.name, dataUrl, mime: f.type || 'image/png' },
          ]);
          setOcrSelectedIndex(0);
        }
        setStatus('idle');
        setMessage('');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'تعذرت قراءة هذا الملف.');
    }
  };

  const handleSheetSwitch = async (name: string) => {
    if (!file) return;
    setSelectedSheet(name);
    setStatus('processing');
    try {
      const res = await parseSpreadsheetToHtml(file, name);
      setPreviewHtml(res.html);
      setWarnings(res.warnings);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'تعذر تبديل ورقة العمل.');
    }
  };

  const handleExportPdf = async () => {
    if (!file || !previewHtml) return;
    setStatus('processing');
    setProgress(55);
    setMessage('جارٍ توليد ملف PDF عالية الدقة...');

    try {
      const blob = await exportHtmlToPdfBlob(previewHtml, {
        dir,
        orientation,
        slideSections: slug === 'powerpoint-to-pdf',
      });
      setProgress(100);
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, '')}.pdf`);
      setStatus('success');
      setMessage('تم تحويل المستند إلى PDF وتنزيله بنجاح.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'حدث خطأ أثناء توليد ملف PDF.');
    }
  };

  const runOcr = async () => {
    const active = ocrSourceImages[ocrSelectedIndex];
    if (!active) return;

    setStatus('processing');
    setProgress(45);
    setMessage('جارٍ التعرف الضوئي على النص...');
    setOcrResult('');

    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: active.dataUrl,
          mimeType: active.mime,
          languageHint: ocrLang,
          preserveLayout: ocrPreserveLayout,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string; message?: string; empty?: boolean };
      if (!res.ok) {
        throw new Error(data.error || 'تعذر إتمام عملية التعرف الضوئي.');
      }
      setProgress(100);
      if (data.empty) {
        setStatus('success');
        setMessage(data.message || 'لم يتم العثور على نص مقروء.');
        setOcrResult('');
      } else {
        setOcrResult(data.text || '');
        setStatus('success');
        setMessage('تم استخراج النص بدقة عالية بنجاح.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'فشلت عملية قراءة النص.');
    }
  };

  return (
    <div className="space-y-6">
      {slug === 'ocr-tool' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <p className="font-bold">إشعار الخصوصية لأداة التعرف الضوئي (OCR)</p>
            <p className="mt-0.5 text-amber-900">
              لتحقيق أعلى دقة في قراءة النصوص العربية والجداول من الصور، يتم إرسال الصورة المختارة مؤقتاً عبر اتصال مشفّر إلى خادم المعالجة ولا يتم حفظها أو تخزينها بعد انتهاء القراءة.
            </p>
          </div>
        </div>
      )}

      <FileDropzone
        accept={accept}
        multiple={false}
        onFilesSelected={handleFile}
        title={
          slug === 'ocr-tool'
            ? 'اختر صورة (PNG / JPG / WebP) أو ملف PDF مصور'
            : 'اختر المستند لتحويله إلى PDF'
        }
      />

      <ProcessingStatus status={status} progress={progress} message={message} />

      {/* Office Preview & Export Controls */}
      {slug !== 'ocr-tool' && previewHtml && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-3">
              {sheetNames.length > 1 && (
                <label className="text-xs font-semibold text-slate-700">
                  ورقة العمل:
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetSwitch(e.target.value)}
                    className="mr-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  >
                    {sheetNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="text-xs font-semibold text-slate-700">
                اتجاه النص:
                <select
                  value={dir}
                  onChange={(e) => setDir(e.target.value as 'rtl' | 'ltr')}
                  className="mr-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="rtl">عربي (يمين لليسار)</option>
                  <option value="ltr">إنجليزي (يسار لليمين)</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700">
                تخطيط الصفحة:
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                  className="mr-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="portrait">عمودي (Portrait)</option>
                  <option value="landscape">أفقي (Landscape)</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={status === 'processing'}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>تصدير وتنزيل PDF</span>
            </button>
          </div>

          {warnings.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
              {warnings[0]}
            </div>
          )}

          <div className="max-h-[540px] overflow-auto rounded-xl border border-slate-200 bg-white p-6">
            <div
              dir={dir}
              className="prose prose-slate max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}

      {/* OCR Interface */}
      {slug === 'ocr-tool' && ocrSourceImages.length > 0 && (
        <div className="space-y-4">
          {ocrSourceImages.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {ocrSourceImages.map((img, i) => (
                <button
                  key={img.label}
                  type="button"
                  onClick={() => setOcrSelectedIndex(i)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    ocrSelectedIndex === i
                      ? 'bg-blue-700 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-900">معاينة الصفحة المختارة</p>
              <img
                src={ocrSourceImages[ocrSelectedIndex].dataUrl}
                alt="معاينة الصورة"
                className="max-h-96 w-full rounded-lg border border-slate-100 bg-slate-50 object-contain"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <select
                  value={ocrLang}
                  onChange={(e) => setOcrLang(e.target.value as 'auto' | 'ar' | 'en')}
                  aria-label="لغة النص"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                >
                  <option value="auto">اكتشاف تلقائي (عربي + إنجليزي)</option>
                  <option value="ar">تركيز على العربية</option>
                  <option value="en">تركيز على الإنجليزية</option>
                </select>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ocrPreserveLayout}
                    onChange={(e) => setOcrPreserveLayout(e.target.checked)}
                    className="h-4 w-4 accent-blue-700"
                  />
                  <span>الحفاظ على تنسيق الفقرات والجداول</span>
                </label>
              </div>
              <button
                type="button"
                onClick={runOcr}
                disabled={status === 'processing'}
                className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                بدء استخراج النص (OCR)
              </button>
            </div>

            <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">النص المستخرج</p>
                {ocrResult && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await copyToClipboard(ocrResult);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadBlob(
                          new Blob([ocrResult], { type: 'text/plain;charset=utf-8' }),
                          'ocr-result.txt'
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>TXT</span>
                    </button>
                  </div>
                )}
              </div>
              <textarea
                value={ocrResult}
                onChange={(e) => setOcrResult(e.target.value)}
                placeholder="سيظهر النص المستخرج هنا..."
                rows={15}
                className="flex-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
