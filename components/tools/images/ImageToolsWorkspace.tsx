'use client';

import { useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  Check,
  Copy,
  Download,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Trash2,
} from 'lucide-react';
import FileDropzone from '@/components/tool-ui/FileDropzone';
import ProcessingStatus from '@/components/tool-ui/ProcessingStatus';
import { formatBytes, getSavingsPercent } from '@/lib/core/file-utils';
import { copyToClipboard, downloadBlob } from '@/lib/engines/download-helper';
import {
  extractDominantColors,
  ExtractedColorSwatch,
  getExtensionFromMime,
  ImageOutputFormat,
  loadFileAsImage,
  processImageTransform,
} from '@/lib/engines/image-client';

interface ImageEntry {
  id: string;
  file: File;
  originalUrl: string;
  width: number;
  height: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultWidth?: number;
  resultHeight?: number;
  resultFilename?: string;
}

const SOCIAL_PRESETS = [
  { label: 'مربع إنستغرام (1080×1080)', w: 1080, h: 1080 },
  { label: 'ستوري / ريلز (1080×1920)', w: 1080, h: 1920 },
  { label: 'صورة يوتيوب المصغرة (1280×720)', w: 1280, h: 720 },
  { label: 'غلاف X / تويتر (1500×500)', w: 1500, h: 500 },
  { label: 'غلاف لينكدإن (1584×396)', w: 1584, h: 396 },
  { label: 'منشور فيسبوك (1200×630)', w: 1200, h: 630 },
];

export default function ImageToolsWorkspace({ slug }: { slug: string }) {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  // Compress & Convert
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>(
    slug === 'compress-image' ? 'image/webp' : 'image/png'
  );
  const [quality, setQuality] = useState(82);
  const [maxDimension, setMaxDimension] = useState(0);
  const [jpgBg, setJpgBg] = useState('#FFFFFF');

  // Resize
  const [targetW, setTargetW] = useState(1080);
  const [targetH, setTargetH] = useState(1080);
  const [lockRatio, setLockRatio] = useState(true);
  const [baseRatio, setBaseRatio] = useState(1);

  // Rotate & Flip
  const [rotateDeg, setRotateDeg] = useState(90);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Watermark
  const [wmText, setWmText] = useState('© مِنْجَز');
  const [wmColor, setWmColor] = useState('#FFFFFF');
  const [wmOpacity, setWmOpacity] = useState(0.7);
  const [wmSize, setWmSize] = useState(32);
  const [wmPos, setWmPos] = useState<'center' | 'bottom-right' | 'bottom-left' | 'top-right'>(
    'bottom-right'
  );

  // Crop
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '4:3' | '16:9' | '9:16'>('free');
  const [cropRectPct, setCropRectPct] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const cropCanvasRef = useRef<HTMLDivElement>(null);

  // Color palette
  const [palette, setPalette] = useState<ExtractedColorSwatch[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isMulti =
    slug === 'compress-image' ||
    slug === 'resize-image' ||
    slug === 'rotate-flip-image' ||
    slug === 'convert-image';

  const handleFilesSelected = async (files: File[]) => {
    setStatus('idle');
    setMessage('');
    setPalette([]);

    const loaded: ImageEntry[] = [];
    for (const file of files) {
      try {
        const img = await loadFileAsImage(file);
        loaded.push({
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          originalUrl: URL.createObjectURL(file),
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'تعذرت قراءة إحدى الصور.');
        return;
      }
    }

    if (loaded.length > 0) {
      const first = loaded[0];
      setTargetW(first.width);
      setTargetH(first.height);
      setBaseRatio(first.width / Math.max(1, first.height));

      if (slug === 'extract-image-colors') {
        setStatus('processing');
        setMessage('جارٍ تحليل ألوان الصورة...');
        const colors = await extractDominantColors(first.file, 8);
        setPalette(colors);
        setStatus('success');
        setMessage(`تم استخراج ${colors.length} ألوان رئيسية من الصورة.`);
      }
    }

    setEntries((prev) => (isMulti ? [...prev, ...loaded] : loaded.slice(0, 1)));
  };

  const applyCropAspect = (ratio: 'free' | '1:1' | '4:3' | '16:9' | '9:16') => {
    setCropAspect(ratio);
    if (ratio === 'free' || entries.length === 0) return;
    const imgW = entries[0].width;
    const imgH = entries[0].height;
    const [rw, rh] = ratio.split(':').map(Number);
    const desiredRatio = rw / rh;
    let wPct = 80;
    let hPct = ((wPct / 100) * imgW / desiredRatio / imgH) * 100;
    if (hPct > 90) {
      hPct = 80;
      wPct = ((hPct / 100) * imgH * desiredRatio / imgW) * 100;
    }
    setCropRectPct({
      x: Math.max(0, (100 - wPct) / 2),
      y: Math.max(0, (100 - hPct) / 2),
      w: Math.min(100, wPct),
      h: Math.min(100, hPct),
    });
  };

  const handleWidthChange = (val: number) => {
    const w = Math.max(1, val || 1);
    setTargetW(w);
    if (lockRatio && baseRatio > 0) {
      setTargetH(Math.max(1, Math.round(w / baseRatio)));
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(1, val || 1);
    setTargetH(h);
    if (lockRatio && baseRatio > 0) {
      setTargetW(Math.max(1, Math.round(h * baseRatio)));
    }
  };

  const runProcessing = async () => {
    if (entries.length === 0) return;
    setStatus('processing');
    setProgress(0);
    setMessage('جارٍ معالجة الصور...');

    try {
      const updated: ImageEntry[] = [];
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const origFormat: ImageOutputFormat =
          entry.file.type === 'image/png'
            ? 'image/png'
            : entry.file.type === 'image/webp'
              ? 'image/webp'
              : 'image/jpeg';

        let fmt: ImageOutputFormat = origFormat;
        if (slug === 'compress-image' || slug === 'convert-image') {
          fmt = outputFormat;
        }

        const cropRect =
          slug === 'crop-image'
            ? {
                x: (cropRectPct.x / 100) * entry.width,
                y: (cropRectPct.y / 100) * entry.height,
                width: (cropRectPct.w / 100) * entry.width,
                height: (cropRectPct.h / 100) * entry.height,
              }
            : undefined;

        const res = await processImageTransform(entry.file, {
          format: fmt,
          quality: quality / 100,
          targetWidth: slug === 'resize-image' ? targetW : undefined,
          targetHeight: slug === 'resize-image' ? targetH : undefined,
          maxDimension: slug === 'compress-image' && maxDimension > 0 ? maxDimension : undefined,
          rotateDeg: slug === 'rotate-flip-image' ? rotateDeg : 0,
          flipH: slug === 'rotate-flip-image' ? flipH : false,
          flipV: slug === 'rotate-flip-image' ? flipV : false,
          bgColorForJpg: jpgBg,
          cropRect,
          watermark:
            slug === 'watermark-image'
              ? {
                  text: wmText,
                  colorHex: wmColor,
                  opacity: wmOpacity,
                  fontSize: wmSize,
                  position: wmPos,
                }
              : undefined,
        });

        const ext = getExtensionFromMime(fmt);
        const baseName = entry.file.name.replace(/\.[^.]+$/, '');
        updated.push({
          ...entry,
          resultBlob: res.blob,
          resultUrl: res.previewUrl,
          resultWidth: res.width,
          resultHeight: res.height,
          resultFilename: `${baseName}_monjez.${ext}`,
        });
        setProgress(((i + 1) / entries.length) * 100);
      }

      setEntries(updated);
      setStatus('success');
      setMessage(`تمت معالجة ${updated.length} صورة بنجاح.`);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'فشلت معالجة الصور.');
    }
  };

  const downloadAllZip = async () => {
    const ready = entries.filter((e) => e.resultBlob && e.resultFilename);
    if (ready.length === 0) return;
    const zip = new JSZip();
    ready.forEach((e) => {
      if (e.resultBlob && e.resultFilename) {
        zip.file(e.resultFilename, e.resultBlob);
      }
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'monjez-images.zip');
  };

  const completedCount = entries.filter((e) => Boolean(e.resultBlob)).length;

  return (
    <div className="space-y-6">
      <FileDropzone
        accept={['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif']}
        multiple={isMulti}
        onFilesSelected={handleFilesSelected}
        title={isMulti ? 'اختر صورة أو مجموعة صور للمعالجة' : 'اختر الصورة المطلوبة'}
      />

      {entries.length > 0 && (
        <div className="space-y-5">
          {/* Controls by tool slug */}
          {(slug === 'compress-image' || slug === 'convert-image') && (
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
              <label className="text-sm font-medium text-slate-800">
                الصيغة الناتجة
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as ImageOutputFormat)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="image/webp">WebP (أصغر حجم للويب)</option>
                  <option value="image/jpeg">JPG (متوافق مع الجميع)</option>
                  <option value="image/png">PNG (بدون فقدان + شفافية)</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-800">
                الجودة ({quality}%)
                <input
                  type="range"
                  min={15}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-3 block w-full accent-blue-700"
                />
              </label>

              {slug === 'compress-image' ? (
                <label className="text-sm font-medium text-slate-800">
                  أقصى عرض/ارتفاع (اختياري)
                  <select
                    value={maxDimension}
                    onChange={(e) => setMaxDimension(Number(e.target.value))}
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value={0}>الحفاظ على الأبعاد الأصلية</option>
                    <option value={1920}>حتى 1920 بكسل</option>
                    <option value={1280}>حتى 1280 بكسل</option>
                    <option value={800}>حتى 800 بكسل</option>
                  </select>
                </label>
              ) : (
                <label className="text-sm font-medium text-slate-800">
                  لون الخلفية عند التحويل لـ JPG
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={jpgBg}
                      onChange={(e) => setJpgBg(e.target.value)}
                      className="h-9 w-12 rounded border border-slate-300 bg-white p-0.5"
                    />
                    <span className="font-mono text-xs text-slate-600">{jpgBg}</span>
                  </div>
                </label>
              )}
            </div>
          )}

          {slug === 'resize-image' && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-medium text-slate-800">
                  العرض (بكسل)
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={targetW}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums"
                  />
                </label>
                <label className="text-sm font-medium text-slate-800">
                  الارتفاع (بكسل)
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={targetH}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono tabular-nums"
                  />
                </label>
                <div className="flex items-end pb-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockRatio}
                      onChange={(e) => setLockRatio(e.target.checked)}
                      className="h-4 w-4 accent-blue-700"
                    />
                    <span>تثبيت نسبة العرض إلى الارتفاع</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold text-slate-700">مقاسات جاهزة لمنصات التواصل:</p>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setLockRatio(false);
                        setTargetW(p.w);
                        setTargetH(p.h);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-600 hover:text-blue-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {slug === 'rotate-flip-image' && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <button
                type="button"
                onClick={() => setRotateDeg((d) => (d + 90) % 360)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
              >
                <RotateCw className="h-4 w-4" aria-hidden="true" />
                <span>تدوير +90° (الحالي: {rotateDeg}°)</span>
              </button>
              <button
                type="button"
                onClick={() => setFlipH((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
                  flipH
                    ? 'bg-blue-700 text-white'
                    : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                <FlipHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>قلب أفقي</span>
              </button>
              <button
                type="button"
                onClick={() => setFlipV((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
                  flipV
                    ? 'bg-blue-700 text-white'
                    : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                <FlipVertical className="h-4 w-4" aria-hidden="true" />
                <span>قلب عمودي</span>
              </button>
            </div>
          )}

          {slug === 'watermark-image' && (
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-medium text-slate-800">
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
                    setWmPos(
                      e.target.value as 'center' | 'bottom-right' | 'bottom-left' | 'top-right'
                    )
                  }
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="bottom-right">أسفل اليمين</option>
                  <option value="bottom-left">أسفل اليسار</option>
                  <option value="top-right">أعلى اليمين</option>
                  <option value="center">المنتصف</option>
                </select>
              </label>
              <label className="text-sm font-medium text-slate-800">
                اللون والشفافية ({Math.round(wmOpacity * 100)}%)
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={wmColor}
                    onChange={(e) => setWmColor(e.target.value)}
                    className="h-9 w-11 rounded border border-slate-300 bg-white p-0.5"
                  />
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={wmOpacity}
                    onChange={(e) => setWmOpacity(Number(e.target.value))}
                    className="w-full accent-blue-700"
                  />
                </div>
              </label>
              <label className="text-sm font-medium text-slate-800">
                حجم النص ({wmSize}%)
                <input
                  type="range"
                  min={14}
                  max={80}
                  value={wmSize}
                  onChange={(e) => setWmSize(Number(e.target.value))}
                  className="mt-3 block w-full accent-blue-700"
                />
              </label>
            </div>
          )}

          {slug === 'crop-image' && entries[0] && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'free', label: 'حر' },
                    { id: '1:1', label: 'مربع 1:1' },
                    { id: '4:3', label: '4:3' },
                    { id: '16:9', label: '16:9' },
                    { id: '9:16', label: '9:16' },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() =>
                        applyCropAspect(ratio.id as 'free' | '1:1' | '4:3' | '16:9' | '9:16')
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        cropAspect === ratio.id
                          ? 'bg-blue-700 text-white'
                          : 'border border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
                <span className="font-mono text-xs tabular-nums text-slate-600">
                  المقاس المحدد: {Math.round((cropRectPct.w / 100) * entries[0].width)} ×{' '}
                  {Math.round((cropRectPct.h / 100) * entries[0].height)} px
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div
                  ref={cropCanvasRef}
                  className="relative mx-auto inline-block max-h-80 overflow-hidden rounded-lg border border-slate-300 bg-slate-900"
                >
                  <img
                    src={entries[0].originalUrl}
                    alt="منطقة القص"
                    className="max-h-80 w-auto object-contain opacity-65"
                  />
                  <div
                    style={{
                      left: `${cropRectPct.x}%`,
                      top: `${cropRectPct.y}%`,
                      width: `${cropRectPct.w}%`,
                      height: `${cropRectPct.h}%`,
                    }}
                    className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 self-center">
                  <label className="text-xs font-medium text-slate-700">
                    الإزاحة الأفقية ({Math.round(cropRectPct.x)}%)
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, 95 - cropRectPct.w)}
                      value={cropRectPct.x}
                      onChange={(e) =>
                        setCropRectPct((prev) => ({ ...prev, x: Number(e.target.value) }))
                      }
                      className="mt-1.5 block w-full accent-blue-700"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-700">
                    الإزاحة العمودية ({Math.round(cropRectPct.y)}%)
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, 95 - cropRectPct.h)}
                      value={cropRectPct.y}
                      onChange={(e) =>
                        setCropRectPct((prev) => ({ ...prev, y: Number(e.target.value) }))
                      }
                      className="mt-1.5 block w-full accent-blue-700"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-700">
                    نسبة العرض ({Math.round(cropRectPct.w)}%)
                    <input
                      type="range"
                      min={10}
                      max={100 - cropRectPct.x}
                      value={cropRectPct.w}
                      onChange={(e) => {
                        setCropAspect('free');
                        setCropRectPct((prev) => ({ ...prev, w: Number(e.target.value) }));
                      }}
                      className="mt-1.5 block w-full accent-blue-700"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-700">
                    نسبة الارتفاع ({Math.round(cropRectPct.h)}%)
                    <input
                      type="range"
                      min={10}
                      max={100 - cropRectPct.y}
                      value={cropRectPct.h}
                      onChange={(e) => {
                        setCropAspect('free');
                        setCropRectPct((prev) => ({ ...prev, h: Number(e.target.value) }));
                      }}
                      className="mt-1.5 block w-full accent-blue-700"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action bar for transform tools */}
          {slug !== 'extract-image-colors' && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={runProcessing}
                disabled={status === 'processing'}
                className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {slug === 'compress-image'
                  ? 'ضغط الصور الآن'
                  : slug === 'resize-image'
                    ? 'تطبيق الأبعاد الجديدة'
                    : slug === 'crop-image'
                      ? 'تنفيذ القص'
                      : slug === 'rotate-flip-image'
                        ? 'تطبيق التدوير والقلب'
                        : slug === 'convert-image'
                          ? 'تحويل الصيغ الآن'
                          : 'تطبيق العلامة المائية'}
              </button>

              {completedCount > 1 && (
                <button
                  type="button"
                  onClick={downloadAllZip}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>تنزيل الجميع في ZIP ({completedCount})</span>
                </button>
              )}
            </div>
          )}

          <ProcessingStatus status={status} progress={progress} message={message} />

          {/* Color Palette Output */}
          {slug === 'extract-image-colors' && palette.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <img
                  src={entries[0].originalUrl}
                  alt={entries[0].file.name}
                  className="max-h-72 w-full rounded-lg object-contain bg-slate-50"
                />
              </div>
              <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
                {palette.map((swatch) => (
                  <div
                    key={swatch.hex}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 shrink-0 rounded-lg border border-slate-200"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div>
                        <p className="font-mono text-sm font-bold text-slate-900">{swatch.hex}</p>
                        <p className="font-mono text-xs text-slate-500">{swatch.rgb}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await copyToClipboard(swatch.hex);
                        setCopiedKey(swatch.hex);
                        setTimeout(() => setCopiedKey(null), 1500);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {copiedKey === swatch.hex ? (
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedKey === swatch.hex ? 'نُسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Grid for image transforms */}
          {slug !== 'extract-image-colors' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => {
                const savedPct = entry.resultBlob
                  ? getSavingsPercent(entry.file.size, entry.resultBlob.size)
                  : null;
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div>
                      <div className="mb-3 flex h-44 items-center justify-center overflow-hidden rounded-lg border border-slate-100 checkerboard-bg">
                        <img
                          src={entry.resultUrl || entry.originalUrl}
                          alt={entry.file.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <p className="truncate text-sm font-bold text-slate-900">{entry.file.name}</p>
                      <p className="mt-1 font-mono text-xs tabular-nums text-slate-500">
                        الأصل: {formatBytes(entry.file.size)} · {entry.width}×{entry.height}
                      </p>
                      {entry.resultBlob && (
                        <p className="mt-1 font-mono text-xs font-semibold tabular-nums text-emerald-700">
                          النتيجة: {formatBytes(entry.resultBlob.size)} · {entry.resultWidth}×
                          {entry.resultHeight}
                          {savedPct !== null && savedPct > 0 ? ` (-${savedPct}%)` : ''}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {entry.resultBlob && entry.resultFilename ? (
                        <button
                          type="button"
                          onClick={() => downloadBlob(entry.resultBlob!, entry.resultFilename!)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>تنزيل الصورة</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">بانتظار المعالجة</span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setEntries((prev) => prev.filter((item) => item.id !== entry.id))
                        }
                        aria-label={`إزالة ${entry.file.name}`}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
