'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import JSZip from 'jszip';
import FileDropzone from '@/components/tool-ui/FileDropzone';
import ProcessingStatus from '@/components/tool-ui/ProcessingStatus';
import { formatBytes } from '@/lib/core/file-utils';
import { copyToClipboard, downloadBlob, downloadBytes } from '@/lib/engines/download-helper';
import {
  extractPagesToPdf,
  extractPdfTextPages,
  inspectPdf,
  PdfMetadataInfo,
  RenderedPageThumbnail,
  renderPdfPages,
  rotatePdfPages,
} from '@/lib/engines/pdf-client';

export default function PdfPagesWorkspace({ slug }: { slug: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<PdfMetadataInfo | null>(null);
  const [thumbnails, setThumbnails] = useState<RenderedPageThumbnail[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  // PDF to Images
  const [imgFormat, setImgFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [imgScale, setImgScale] = useState<number>(2);
  const [renderedImages, setRenderedImages] = useState<RenderedPageThumbnail[]>([]);

  // Extract Text
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Viewer
  const [viewerZoom, setViewerZoom] = useState(100);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setThumbnails([]);
    setRenderedImages([]);
    setExtractedText('');
    setSelectedPages([]);
    setRotations({});
    setStatus('processing');
    setProgress(10);
    setMessage('جارٍ قراءة صفحات المستند ومعاينتها...');

    try {
      const info = await inspectPdf(f);
      setMeta(info);

      if (slug === 'extract-pdf-text') {
        const textPages = await extractPdfTextPages(f, (done, total) => {
          setProgress((done / total) * 100);
          setMessage(`جارٍ استخراج النص من الصفحة ${done} من ${total}...`);
        });
        const combined = textPages
          .map((p) => `--- الصفحة ${p.pageNumber} ---\n${p.text || '(صفحة خالية من النص القابل للتحديد)'}`)
          .join('\n\n');
        setExtractedText(combined);
        setStatus('success');
        setMessage(`تم استخراج النص من ${info.pageCount} صفحة بنجاح.`);
        return;
      }

      const scale = slug === 'pdf-viewer' ? 1.3 : 0.55;
      const { pages } = await renderPdfPages(f, {
        scale,
        format: 'image/jpeg',
        quality: 0.85,
        onProgress: (done, total) => {
          setProgress((done / total) * 100);
          setMessage(`جارٍ تحضير المعاينة ${done} من ${total}...`);
        },
      });
      setThumbnails(pages);
      setPageOrder(pages.map((p) => p.pageNumber));
      setStatus('idle');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof Error
          ? err.message
          : 'تعذّر فتح ملف PDF. تأكد من أنه غير تالف وغير مقفل بكلمة مرور.'
      );
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber]
    );
  };

  const moveOrder = (idx: number, delta: -1 | 1) => {
    setPageOrder((prev) => {
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
  };

  const rotatePage = (pageNum: number, delta = 90) => {
    setRotations((prev) => ({
      ...prev,
      [pageNum]: ((prev[pageNum] ?? 0) + delta) % 360,
    }));
  };

  const rotateAll = (delta = 90) => {
    const next: Record<number, number> = {};
    thumbnails.forEach((t) => {
      next[t.pageNumber] = ((rotations[t.pageNumber] ?? 0) + delta) % 360;
    });
    setRotations(next);
  };

  const handleExportPdfAction = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(40);
    setMessage('جارٍ إنشاء الملف النهائي...');

    try {
      if (slug === 'extract-pdf-pages') {
        if (selectedPages.length === 0) {
          throw new Error('يرجى تحديد صفحة واحدة على الأقل للاستخراج.');
        }
        const sorted = [...selectedPages].sort((a, b) => a - b);
        const bytes = await extractPagesToPdf(file, sorted);
        downloadBytes(bytes, `${file.name.replace(/\.pdf$/i, '')}_extracted.pdf`);
        setStatus('success');
        setMessage(`تم استخراج ${sorted.length} صفحة وتنزيل الملف بنجاح.`);
      } else if (slug === 'delete-pdf-pages') {
        if (selectedPages.length === 0) {
          throw new Error('يرجى تحديد الصفحات التي تريد حذفها أولاً.');
        }
        const remaining = thumbnails
          .map((t) => t.pageNumber)
          .filter((p) => !selectedPages.includes(p));
        if (remaining.length === 0) {
          throw new Error('لا يمكن حذف جميع صفحات المستند. اترك صفحة واحدة على الأقل.');
        }
        const bytes = await extractPagesToPdf(file, remaining);
        downloadBytes(bytes, `${file.name.replace(/\.pdf$/i, '')}_cleaned.pdf`);
        setStatus('success');
        setMessage(`تم حذف ${selectedPages.length} صفحة وحفظ المستند المتبقي.`);
      } else if (slug === 'reorder-pdf-pages') {
        const bytes = await extractPagesToPdf(file, pageOrder);
        downloadBytes(bytes, `${file.name.replace(/\.pdf$/i, '')}_reordered.pdf`);
        setStatus('success');
        setMessage('تم حفظ الترتيب الجديد للصفحات وتنزيل الملف بنجاح.');
      } else if (slug === 'rotate-pdf') {
        const bytes = await rotatePdfPages(file, rotations);
        downloadBytes(bytes, `${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`);
        setStatus('success');
        setMessage('تم تطبيق التدوير وتنزيل الملف بنجاح.');
      } else if (slug === 'pdf-to-images') {
        const { pages } = await renderPdfPages(file, {
          scale: imgScale,
          format: imgFormat,
          quality: 0.92,
          onProgress: (done, total) => {
            setProgress((done / total) * 100);
            setMessage(`جارٍ تحويل الصفحة ${done} من ${total} إلى صورة...`);
          },
        });
        setRenderedImages(pages);
        setStatus('success');
        setMessage(`تم تحويل ${pages.length} صفحة إلى صور بنجاح.`);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'تعذرت معالجة الصفحات.');
    }
  };

  const downloadAllImagesZip = async () => {
    if (!file || renderedImages.length === 0) return;
    const zip = new JSZip();
    const ext = imgFormat === 'image/png' ? 'png' : 'jpg';
    const base = file.name.replace(/\.pdf$/i, '');
    for (const img of renderedImages) {
      const b64 = img.dataUrl.split(',')[1];
      zip.file(`${base}_page_${String(img.pageNumber).padStart(3, '0')}.${ext}`, b64, {
        base64: true,
      });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${base}_images.zip`);
  };

  return (
    <div className="space-y-6">
      <FileDropzone
        accept={['.pdf']}
        multiple={false}
        onFilesSelected={handleFile}
        title="اختر ملف PDF لمعاينة الصفحات والعمل عليها"
      />

      {file && meta && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-bold text-slate-900">{file.name}</span>
            <span className="text-xs text-slate-600">
              <bdi dir="ltr" className="font-mono tabular-nums">
                {formatBytes(file.size)}
              </bdi>
              <span className="tabular-nums"> · {meta.pageCount} صفحة</span>
            </span>
            {meta.title && <span className="text-xs text-slate-500">العنوان: {meta.title}</span>}
          </div>
          {slug === 'pdf-viewer' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewerZoom((z) => Math.max(60, z - 15))}
                aria-label="تصغير العرض"
                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
              >
                <ZoomOut className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="font-mono text-xs tabular-nums text-slate-700">{viewerZoom}%</span>
              <button
                type="button"
                onClick={() => setViewerZoom((z) => Math.min(160, z + 15))}
                aria-label="تكبير العرض"
                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      <ProcessingStatus status={status} progress={progress} message={message} />

      {/* Extract PDF Text Output */}
      {slug === 'extract-pdf-text' && extractedText && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">النص المستخرج</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await copyToClipboard(extractedText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    new Blob([extractedText], { type: 'text/plain;charset=utf-8' }),
                    `${file?.name.replace(/\.pdf$/i, '') || 'extracted'}.txt`
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تنزيل TXT</span>
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={extractedText}
            rows={14}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-900 focus:outline-none"
          />
        </div>
      )}

      {/* PDF to Images Settings & Results */}
      {slug === 'pdf-to-images' && file && (
        <div className="space-y-4">
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-800">
              صيغة الصور
              <select
                value={imgFormat}
                onChange={(e) => setImgFormat(e.target.value as 'image/png' | 'image/jpeg')}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="image/png">PNG (وضوح أعلى للنصوص)</option>
                <option value="image/jpeg">JPG (حجم أصغر)</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-800">
              جودة ودقة التصيير
              <select
                value={imgScale}
                onChange={(e) => setImgScale(Number(e.target.value))}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value={1}>عادية (1x)</option>
                <option value={1.5}>متوسطة (1.5x)</option>
                <option value={2}>عالية (2x - موصى به)</option>
                <option value={3}>فائقة (3x)</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleExportPdfAction}
                disabled={status === 'processing'}
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                تحويل الصفحات إلى صور
              </button>
            </div>
          </div>

          {renderedImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">
                  الصور الجاهزة ({renderedImages.length})
                </p>
                <button
                  type="button"
                  onClick={downloadAllImagesZip}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>تنزيل جميع الصور (ZIP)</span>
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {renderedImages.map((img) => (
                  <div
                    key={img.pageNumber}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <img
                      src={img.dataUrl}
                      alt={`صفحة ${img.pageNumber}`}
                      className="aspect-[3/4] w-full rounded-lg border border-slate-100 object-contain bg-slate-50"
                    />
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-mono tabular-nums text-slate-600">
                        صفحة {img.pageNumber} · {img.width}×{img.height}
                      </span>
                      <a
                        href={img.dataUrl}
                        download={`${file.name.replace(/\.pdf$/i, '')}_page_${img.pageNumber}.${
                          imgFormat === 'image/png' ? 'png' : 'jpg'
                        }`}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        تنزيل
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Thumbnail Controls for Extract / Delete / Reorder / Rotate */}
      {thumbnails.length > 0 &&
        ['extract-pdf-pages', 'delete-pdf-pages', 'reorder-pdf-pages', 'rotate-pdf'].includes(slug) && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-sm font-medium text-slate-800">
                {slug === 'extract-pdf-pages' && `الصفحات المحددة للاستخراج: ${selectedPages.length}`}
                {slug === 'delete-pdf-pages' && `الصفحات المحددة للحذف: ${selectedPages.length}`}
                {slug === 'reorder-pdf-pages' && 'استخدم الأسهم لإعادة ترتيب الصفحات'}
                {slug === 'rotate-pdf' && 'انقر على زر التدوير لكل صفحة أو لجميع الصفحات'}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {slug === 'reorder-pdf-pages' && (
                  <button
                    type="button"
                    onClick={() => setPageOrder((prev) => [...prev].reverse())}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    عكس الترتيب
                  </button>
                )}
                {slug === 'rotate-pdf' && (
                  <button
                    type="button"
                    onClick={() => rotateAll(90)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>تدوير الكل 90°</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExportPdfAction}
                  disabled={status === 'processing'}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>حفظ وتنزيل PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {(slug === 'reorder-pdf-pages'
                ? pageOrder.map((num) => thumbnails.find((t) => t.pageNumber === num)!).filter(Boolean)
                : thumbnails
              ).map((page, idx) => {
                const isSelected = selectedPages.includes(page.pageNumber);
                const angle = rotations[page.pageNumber] ?? 0;

                return (
                  <div
                    key={page.pageNumber}
                    className={`rounded-xl border p-2.5 transition-colors ${
                      isSelected
                        ? slug === 'delete-pdf-pages'
                          ? 'border-red-600 bg-red-50/70'
                          : 'border-blue-700 bg-blue-50/70'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                      <img
                        src={page.dataUrl}
                        alt={`صفحة ${page.pageNumber}`}
                        style={{ transform: `rotate(${angle}deg)` }}
                        className="max-h-full max-w-full object-contain transition-transform duration-200"
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-semibold tabular-nums text-slate-700">
                        {page.pageNumber}
                      </span>

                      {(slug === 'extract-pdf-pages' || slug === 'delete-pdf-pages') && (
                        <button
                          type="button"
                          onClick={() => togglePageSelection(page.pageNumber)}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            isSelected
                              ? slug === 'delete-pdf-pages'
                                ? 'bg-red-700 text-white'
                                : 'bg-blue-700 text-white'
                              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected
                            ? slug === 'delete-pdf-pages'
                              ? 'محددة للحذف'
                              : 'محددة'
                            : 'تحديد'}
                        </button>
                      )}

                      {slug === 'rotate-pdf' && (
                        <button
                          type="button"
                          onClick={() => rotatePage(page.pageNumber, 90)}
                          aria-label={`تدوير صفحة ${page.pageNumber}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <RotateCw className="h-3 w-3" aria-hidden="true" />
                          <span className="font-mono tabular-nums">{angle}°</span>
                        </button>
                      )}

                      {slug === 'reorder-pdf-pages' && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveOrder(idx, -1)}
                            disabled={idx === 0}
                            aria-label={`تقديم صفحة ${page.pageNumber}`}
                            className="rounded border border-slate-200 p-1 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveOrder(idx, 1)}
                            disabled={idx === pageOrder.length - 1}
                            aria-label={`تأخير صفحة ${page.pageNumber}`}
                            className="rounded border border-slate-200 p-1 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Full PDF Viewer */}
      {slug === 'pdf-viewer' && thumbnails.length > 0 && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
          {thumbnails.map((page) => (
            <div key={page.pageNumber} className="mx-auto text-center">
              <div
                style={{ width: `${viewerZoom}%` }}
                className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={page.dataUrl}
                  alt={`صفحة ${page.pageNumber}`}
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-2 font-mono text-xs tabular-nums text-slate-600">
                صفحة {page.pageNumber} من {thumbnails.length}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
